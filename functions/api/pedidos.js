/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: functions/api/pedidos.js   (Cloudflare Pages Function)
   ----------------------------------------------------------------------------
   QUÉ ES: el cerebro del sistema en el servidor. Recibe los pedidos que manda
   la página del cliente, les asigna el turno, los guarda en Cloudflare KV y se
   los entrega al panel del vendedor.

   POR QUÉ ESTÁ AQUÍ Y NO EN EL NAVEGADOR: el turno tiene que ser único para
   todos los clientes a la vez. Si cada celular contara sus propios turnos,
   dos personas podrían salir las dos con el "turno 3".

   SE ACTIVA EN: https://pedidos-pichi-burguer-ctg.pages.dev/api/pedidos
   Cloudflare enruta solo por la carpeta: functions/api/pedidos.js → /api/pedidos.

   ⚠ REQUIERE CONFIGURAR EN CLOUDFLARE (una sola vez, ver README.md):
     1. Un espacio de nombres KV llamado PEDIDOS, enlazado al proyecto Pages.
     2. Una variable de entorno PANEL_CLAVE con la clave del panel del vendedor.

   ----------------------------------------------------------------------------
   DISEÑO DEL ALMACENAMIENTO — por qué un solo documento por día

   El plan gratuito de Cloudflare KV permite 100.000 lecturas al día pero solo
   1.000 escrituras, 1.000 borrados y 1.000 operaciones de listado.
   Si cada pedido fuera una clave suelta, el panel tendría que "listar" claves
   cada 15 segundos y en media jornada se agotaría el cupo de listados.

   Por eso TODOS los pedidos de un día viven dentro de UNA sola clave:

       dia:2026-09-06   →  { turno: 12, pedidos: [ …, …, … ] }
       indice:dias      →  ["2026-09-06", "2026-09-05", …]
       meta:limpieza    →  fecha de la última limpieza automática

   Resultado: refrescar el panel = 1 lectura. Crear un pedido = 1 lectura + 1
   escritura. Cero operaciones de listado. Un local con 60 pedidos diarios usa
   ~120 escrituras al día: queda muchísimo margen dentro del plan gratuito.

   ⚠ LÍMITE CONOCIDO Y ACEPTADO: KV no tiene transacciones. Si dos clientes
   pidieran EXACTAMENTE en el mismo segundo, uno podría sobrescribir al otro.
   Por eso el sistema tiene el respaldo B: cada pedido abre además WhatsApp con
   el resumen, así que el vendedor lo recibe igual. Para el volumen de un local
   de barrio es más que suficiente; si algún día el local crece mucho, la salida
   es pasar a Cloudflare D1 (SQL) sin tocar el resto del proyecto.
   ========================================================================== */

/* Horas que un pedido permanece en el panel activo antes de pasar al historial.
   Debe coincidir con sistema.horasEnPanelActivo de js/config.js. */
const HORAS_ACTIVO = 5;

/* Limpieza automática del historial: sábados a las 7:00 AM hora de Colombia.
   Debe coincidir con sistema.limpiezaHistorial de js/config.js. */
const LIMPIEZA = { dia: 6, hora: 7 };   // 6 = sábado

/* Colombia es UTC-5 todo el año (no maneja horario de verano), así que restar
   5 horas al tiempo universal da siempre la hora correcta de Cartagena. */
const DESFASE_COLOMBIA_MS = 5 * 60 * 60 * 1000;

/* ----------------------------------------------------------------------------
   AYUDAS DE FECHA
   -------------------------------------------------------------------------- */

/** Devuelve un objeto Date desplazado a la hora de Colombia. */
function enColombia(ms) {
  return new Date((ms ?? Date.now()) - DESFASE_COLOMBIA_MS);
}

/** Fecha de hoy en Colombia como "AAAA-MM-DD"; es la clave del día en KV. */
function fechaDia(ms) {
  return enColombia(ms).toISOString().slice(0, 10);
}

/**
 * Calcula el instante del último sábado 7:00 AM (hora Colombia) ya pasado.
 * Qué hace: da la línea de corte del borrado semanal del historial.
 * Por qué así: Cloudflare Pages no tiene tareas programadas (cron). En vez de
 * montar un Worker aparte, la limpieza se hace "al pasar": la primera petición
 * que llega después del sábado 7:00 AM es la que borra. El efecto para el
 * vendedor es idéntico y no cuesta infraestructura extra.
 * @returns {number} milisegundos (tiempo universal) del último corte
 */
function ultimoCorteSemanal() {
  const col = enColombia();
  const corte = new Date(col.getTime());
  corte.setUTCHours(LIMPIEZA.hora, 0, 0, 0);

  // Retroceder hasta el sábado más cercano hacia atrás.
  let atras = (corte.getUTCDay() - LIMPIEZA.dia + 7) % 7;
  corte.setUTCDate(corte.getUTCDate() - atras);

  // Si hoy es sábado pero todavía no dan las 7:00, el corte válido es el de la
  // semana pasada; de lo contrario se borraría el historial antes de tiempo.
  if (corte.getTime() > col.getTime()) {
    corte.setUTCDate(corte.getUTCDate() - 7);
  }
  return corte.getTime() + DESFASE_COLOMBIA_MS;   // de vuelta a tiempo universal
}

/* ----------------------------------------------------------------------------
   AYUDAS DE ALMACENAMIENTO
   -------------------------------------------------------------------------- */

/** Lee un valor JSON de KV; si no existe, devuelve el valor por defecto. */
async function leerJson(kv, clave, porDefecto) {
  const crudo = await kv.get(clave);
  if (!crudo) return porDefecto;
  try { return JSON.parse(crudo); } catch { return porDefecto; }
}

/** Respuesta JSON con los encabezados correctos. */
function json(datos, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'      // los pedidos nunca se cachean
    }
  });
}

/**
 * Comprueba la clave del panel del vendedor.
 * Qué hace: compara la clave enviada con la variable de entorno PANEL_CLAVE.
 * Por qué en el servidor: una clave revisada en el navegador la ve cualquiera
 * abriendo el código con F12. Así la clave nunca sale de Cloudflare.
 */
function claveValida(request, env) {
  const enviada = request.headers.get('X-Panel-Clave') || '';
  const real = env.PANEL_CLAVE || '';
  if (!real) return false;              // sin variable configurada, no se entra
  if (enviada.length !== real.length) return false;

  // Comparación de tiempo constante: evita que alguien adivine la clave
  // midiendo cuánto tarda la respuesta letra por letra.
  let dif = 0;
  for (let i = 0; i < real.length; i++) {
    dif |= enviada.charCodeAt(i) ^ real.charCodeAt(i);
  }
  return dif === 0;
}

/**
 * Limpieza semanal del historial (sábados 7:00 AM, hora Colombia).
 * Qué hace: borra los documentos de días anteriores al último corte y deja el
 * índice al día. Se ejecuta sola en la primera petición posterior al corte.
 */
async function limpiarSiToca(kv) {
  const corte = ultimoCorteSemanal();
  const ultima = parseInt(await kv.get('meta:limpieza') || '0', 10);
  if (ultima >= corte) return;          // ya se limpió después del último corte

  const indice = await leerJson(kv, 'indice:dias', []);
  const fechaCorte = fechaDia(corte);
  const quedan = [];

  for (const d of indice) {
    if (d < fechaCorte) {
      await kv.delete('dia:' + d);      // día anterior al corte: se borra entero
    } else {
      quedan.push(d);
    }
  }

  await kv.put('indice:dias', JSON.stringify(quedan));
  await kv.put('meta:limpieza', String(Date.now()));
}

/* ----------------------------------------------------------------------------
   PUNTO DE ENTRADA — solo acepta POST con { accion, datos }
   -------------------------------------------------------------------------- */
export async function onRequest({ request, env }) {

  // Se exporta un único onRequest (y no onRequestPost) para que el control del
  // método sea inequívoco: cualquier otro verbo se rechaza aquí mismo y ningún
  // buscador ni bot toca la API al rastrear el sitio.
  if (request.method !== 'POST') {
    return json({ error: 'Solo se acepta POST.' }, 405);
  }

  // Si el espacio KV no está enlazado, se avisa con claridad en vez de fallar
  // con un error críptico. La página del cliente lo detecta y pasa a modo local.
  if (!env.PEDIDOS) {
    return json({ error: 'Falta enlazar el espacio KV llamado PEDIDOS en Cloudflare.' }, 503);
  }
  const kv = env.PEDIDOS;

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'Petición mal formada.' }, 400);
  }

  const accion = cuerpo.accion;
  const datos = cuerpo.datos || {};

  await limpiarSiToca(kv);

  /* ------------------------------------------------------------------------
     ACCIÓN: crear — la usa el cliente desde index.html (no lleva clave)
     ---------------------------------------------------------------------- */
  if (accion === 'crear') {

    // Validación mínima. Nunca confiar en lo que llega del navegador: alguien
    // podría mandar datos por su cuenta y llenar el panel de basura.
    const nombre = String(datos.nombre || '').trim().slice(0, 60);
    const telefono = String(datos.telefono || '').replace(/\D/g, '').slice(0, 15);
    const items = Array.isArray(datos.items) ? datos.items.slice(0, 40) : [];

    if (nombre.length < 2) return json({ error: 'El nombre no es válido.' }, 400);
    if (telefono.length < 7) return json({ error: 'El teléfono no es válido.' }, 400);
    if (items.length === 0) return json({ error: 'El pedido está vacío.' }, 400);

    const hoy = fechaDia();
    const doc = await leerJson(kv, 'dia:' + hoy, { turno: 0, pedidos: [] });

    // Freno anti-spam: máximo 200 pedidos guardados por día. Protege el cupo de
    // escrituras del plan gratuito si alguien intentara inundar el sistema.
    if (doc.pedidos.length >= 200) {
      return json({ error: 'Se alcanzó el máximo de pedidos del día.' }, 429);
    }

    doc.turno += 1;                     // turnos: 1, 2, 3… y mañana vuelve a 1

    const pedido = {
      id: crypto.randomUUID(),
      numero: hoy.replace(/-/g, '').slice(2) + '-' + String(doc.turno).padStart(3, '0'),
      turno: doc.turno,
      creado: Date.now(),
      fechaDia: hoy,
      nombre,
      telefono,
      tipo: datos.tipo === 'domicilio' ? 'domicilio' : 'recoger',
      direccion: String(datos.direccion || '').trim().slice(0, 160),
      pago: String(datos.pago || '').slice(0, 30),
      notas: String(datos.notas || '').trim().slice(0, 200),
      items: items.map(i => ({
        nombre: String(i.nombre || '').slice(0, 80),
        cantidad: Math.max(1, Math.min(20, parseInt(i.cantidad, 10) || 1)),
        precio: Math.max(0, parseInt(i.precio, 10) || 0)
      })),
      entregado: false
    };

    // El total se recalcula AQUÍ, no se acepta el que manda el navegador.
    // Motivo: si se confiara en el navegador, cualquiera podría enviar un total
    // de $0 modificando el código de la página.
    pedido.total = pedido.items.reduce((s, i) => s + i.precio * i.cantidad, 0);

    doc.pedidos.push(pedido);
    await kv.put('dia:' + hoy, JSON.stringify(doc));

    // Mantener el índice de días para poder armar el historial sin listar claves.
    const indice = await leerJson(kv, 'indice:dias', []);
    if (!indice.includes(hoy)) {
      indice.push(hoy);
      indice.sort().reverse();
      await kv.put('indice:dias', JSON.stringify(indice));
    }

    return json({ ok: true, pedido });
  }

  /* ------------------------------------------------------------------------
     ACCIONES DEL VENDEDOR — de aquí en adelante hace falta la clave del panel
     ---------------------------------------------------------------------- */
  if (!claveValida(request, env)) {
    return json({ error: 'Clave incorrecta.' }, 401);
  }

  /* ACCIÓN: listar — arma las dos pestañas del panel (activos e historial) */
  if (accion === 'listar') {
    const indice = await leerJson(kv, 'indice:dias', []);
    const corteActivo = Date.now() - HORAS_ACTIVO * 3600000;
    const activos = [];
    const historial = [];

    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, { pedidos: [] });
      for (const p of doc.pedidos) {
        (p.creado > corteActivo ? activos : historial).push(p);
      }
    }

    // Activos por turno de menor a mayor: el turno 1 arriba y los siguientes
    // debajo, tal cual se atiende en el mostrador.
    activos.sort((a, b) => a.creado - b.creado);
    // Historial al revés: lo más reciente primero, que es lo que se consulta.
    historial.sort((a, b) => b.creado - a.creado);

    return json({
      ok: true,
      activos,
      historial,
      servidor: Date.now(),
      proximaLimpieza: fechaDia(ultimoCorteSemanal() + 7 * 86400000)
    });
  }

  /* ACCIÓN: entregado — marca un pedido como despachado */
  if (accion === 'entregado') {
    const indice = await leerJson(kv, 'indice:dias', []);
    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, null);
      if (!doc) continue;
      const p = doc.pedidos.find(x => x.id === datos.id);
      if (p) {
        p.entregado = true;
        p.entregadoEn = Date.now();
        await kv.put('dia:' + d, JSON.stringify(doc));
        return json({ ok: true });
      }
    }
    return json({ error: 'Pedido no encontrado.' }, 404);
  }

  /* ACCIÓN: borrar-historial — limpieza manual, además de la de los sábados */
  if (accion === 'borrar-historial') {
    const indice = await leerJson(kv, 'indice:dias', []);
    const corteActivo = Date.now() - HORAS_ACTIVO * 3600000;
    const quedan = [];

    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, { turno: 0, pedidos: [] });
      // Se conservan únicamente los pedidos que todavía están dentro de las
      // 5 horas activas; el resto (el historial) se elimina.
      const vivos = doc.pedidos.filter(p => p.creado > corteActivo);
      if (vivos.length) {
        doc.pedidos = vivos;
        await kv.put('dia:' + d, JSON.stringify(doc));
        quedan.push(d);
      } else {
        await kv.delete('dia:' + d);
      }
    }

    await kv.put('indice:dias', JSON.stringify(quedan));
    return json({ ok: true });
  }

  /* ACCIÓN: borrar-pedido — quita UN pedido concreto, el que escoja el vendedor
     Para qué: un pedido repetido, uno que el cliente canceló por teléfono, o una
     prueba que quedó ahí. "Entregado" lo deja en la lista; esto lo borra.
     ⚠ EL CONTADOR DE TURNOS NO SE DEVUELVE, y es a propósito: si al borrar el
     turno 3 el contador volviera a 2, el siguiente cliente recibiría otra vez
     el número 3 y habría dos personas esperando el mismo turno en el mostrador.
     Es mejor que falte un número a que se repita. */
  if (accion === 'borrar-pedido') {
    const id = String(datos.id || '');
    if (!id) { return json({ error: 'Falta decir cuál pedido.' }, 400); }

    const indice = await leerJson(kv, 'indice:dias', []);
    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, null);
      if (!doc) continue;

      const quedan = doc.pedidos.filter(p => p.id !== id);
      if (quedan.length === doc.pedidos.length) continue;   // no estaba en este día

      if (quedan.length) {
        doc.pedidos = quedan;
        await kv.put('dia:' + d, JSON.stringify(doc));
      } else {
        // Era el único del día: se borra el documento entero y el día sale del
        // índice, para no dejar una clave vacía ocupando cupo.
        await kv.delete('dia:' + d);
        await kv.put('indice:dias', JSON.stringify(indice.filter(x => x !== d)));
      }
      return json({ ok: true });
    }
    return json({ error: 'Pedido no encontrado.' }, 404);
  }

  return json({ error: 'Acción no reconocida.' }, 400);
}
