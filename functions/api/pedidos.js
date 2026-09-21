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

/* Cuánto tiempo puede un cliente sumarle algo a su pedido en vez de sacar otro
   turno. Lo pidió JX al darse cuenta de que desde su propio celular podía pedir
   una y otra vez con el mismo nombre y teléfono, gastando turnos.
   20 minutos: lo que tarda alguien en acordarse de que quería un perro más.
   Pasado ese rato, el pedido es otro de verdad y le toca turno nuevo. */
const MINUTOS_AMPLIAR = 20;

/**
 * Busca el pedido que ese teléfono todavía tiene en curso, si lo hay.
 * ⚠ EL FRENO VIVE AQUÍ, EN EL SERVIDOR, y no en el navegador: lo que guarde el
 * celular se borra limpiando los datos del navegador, y entonces el freno no
 * frenaría nada. Aquí no hay forma de saltárselo.
 * ⚠ La llave es el TELÉFONO, no el nombre ni la IP. El nombre repite
 * ("Andrés" hay muchos) y bloquearía a personas distintas. La IP es peor: en
 * un barrio varias casas comparten wifi y un operador móvil le da la misma IP
 * a cientos de personas, así que dos vecinos que pidan el mismo día se
 * bloquearían entre sí — y el local nunca sabría por qué perdió esa venta.
 */
function pedidoEnCurso(doc, telefono) {
  if (!telefono) return null;
  const limite = Date.now() - MINUTOS_AMPLIAR * 60000;
  // Del más nuevo al más viejo: si por lo que sea hay dos, manda el último.
  for (let i = doc.pedidos.length - 1; i >= 0; i--) {
    const p = doc.pedidos[i];
    if (p.telefono === telefono && !p.entregado && p.creado > limite) return p;
  }
  return null;
}

/* Limpieza automática del historial: sábados a las 7:00 AM hora de Colombia.
   Debe coincidir con sistema.limpiezaHistorial de js/config.js. */
const LIMPIEZA = { dia: 6, hora: 7 };   // 6 = sábado

/* Colombia es UTC-5 todo el año (no maneja horario de verano), así que restar
   5 horas al tiempo universal da siempre la hora correcta de Cartagena. */
const DESFASE_COLOMBIA_MS = 5 * 60 * 60 * 1000;

/* ============================================================================
   LA CARTA — los precios de verdad, los que manda el servidor
   ----------------------------------------------------------------------------
   POR QUÉ EXISTE (encontrado probando el sitio EN VIVO el 21 de sept. de 2026):
   el servidor ya recalculaba el TOTAL en vez de aceptar el que mandaba el
   navegador… pero seguía aceptando el PRECIO de cada plato. O sea que la
   protección se quedaba a medias: bastaba abrir la consola y enviar
   { nombre: 'Hamburguesa Pichi', cantidad: 1, precio: 1 } para que el pedido
   quedara guardado en $1 — y el servidor "recalculaba" 1 × 1 = 1 tan tranquilo.
   Se comprobó contra el sitio publicado: entró un pedido de $1.

   Aquí no se roba dinero, porque el pago se hace en el local y no hay pasarela.
   El daño es otro y es peor de detectar: **al vendedor le llega al panel un
   pedido que dice $1**, y si está de afán lo cobra así. O entran cien pedidos
   con precios inventados y las cuentas del día no cuadran con nada.

   Ahora el precio SIEMPRE sale de esta tabla. Lo que mande el navegador se
   ignora por completo.

   ⚠ ESTE ES EL 5.º SITIO DONDE VIVE UN PRECIO. Si cambia uno, hay que cambiarlo
   en los cinco o el cliente ve un precio y se le cobra otro:
     1. index.html · el precio visible de la tarjeta
     2. index.html · el atributo data-precio del botón
     3. index.html · el JSON-LD del <head>
     4. llms.txt
     5. aquí
   ⚠ Los nombres tienen que estar escritos IGUAL que en el data-nombre del
   botón, tildes incluidas: es la llave con la que se busca.
   ============================================================================ */
const CARTA = {
  'Hamburguesa Sencilla': 16000,
  'Hamburguesa Especial': 18000,
  'Hamburguesa Pichi':    22000,
  'Perro Sencillo':        8000,
  'Perro Súper':          10000,
  'Chiriperro':           14000,
  'Chori Especial':       18000,
  'Picada Sencilla':      25000,
  'Picada Súper':         30000,
  'Picada Pichi':         40000,
  'Salchipapa Sencilla':  12000,
  'Choripapa':            16000,
  'Salchipapa Mixta':     18000,
  'Patacón Súper':        16000,
  'Patacón Mixto':        18000
};

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

    /* ⚠ UN TELÉFONO, UN TURNO A LA VEZ.
       Sin esto, el mismo cliente podía enviar el pedido diez veces seguidas y
       quedarse con diez turnos: el mostrador llamaría números que no existen y
       la fila que ve el resto de la gente sería mentira. Comprobado por JX
       desde su propio celular.
       No se rechaza y ya: se le devuelve SU pedido para que el navegador le
       ofrezca sumarle lo nuevo. El caso real más común no es el vivo que
       quiere turnos, es el que se acordó de que quería algo más. */
    const enCurso = pedidoEnCurso(doc, telefono);
    if (enCurso) {
      return json({
        error: 'Ya tienes un pedido en curso.',
        codigo: 'PEDIDO_EN_CURSO',
        pedidoActivo: {
          id: enCurso.id,
          turno: enCurso.turno,
          numero: enCurso.numero,
          total: enCurso.total,
          estado: enCurso.estado || 'nuevo',
          items: enCurso.items
        }
      }, 409);
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
      // El local dejó de hacer domicilios (sept. 2026): TODO pedido es para
      // recoger. Se fija aquí a mano y no se acepta lo que mande el navegador,
      // para que nadie pueda colar un pedido "a domicilio" que nadie va a
      // llevar. El campo se conserva por si vuelve el servicio algún día.
      tipo: 'recoger',
      pago: String(datos.pago || '').slice(0, 30),
      notas: String(datos.notas || '').trim().slice(0, 200),
      /* ⚠ El precio NO sale de lo que manda el navegador: sale de CARTA, que es
         la carta del servidor. Un plato que no esté en la carta entra en 0 y
         queda visible en el panel para que el vendedor lo vea y pregunte, en
         vez de rechazar el pedido entero por un nombre mal escrito y perder la
         venta. Ver el comentario de CARTA arriba. */
      items: items.map(i => {
        const nombre = String(i.nombre || '').slice(0, 80);
        return {
          nombre,
          cantidad: Math.max(1, Math.min(20, parseInt(i.cantidad, 10) || 1)),
          precio: Object.prototype.hasOwnProperty.call(CARTA, nombre) ? CARTA[nombre] : 0
        };
      }),
      entregado: false,
      // Estado del pedido en la cocina: 'nuevo' → 'preparando' → entregado.
      // Se guarda además de "entregado" y no en su lugar: los pedidos que ya
      // existen en KV no tienen este campo, y el panel tiene que seguir
      // pintándolos bien. Sin campo = 'nuevo'.
      estado: 'nuevo',
      empezadoEn: null,
      // Marcas de ampliación. Nacen en null: si algún día el cliente le suma
      // algo, el panel lo sabe por aquí. Ver la acción 'agregar'.
      ampliado: null,
      ampliadoEnPlancha: false
    };

    // El total se suma AQUÍ, con los precios de CARTA, no con los que llegaron.
    // Son las dos mitades de lo mismo: sin la carta, "recalcular el total"
    // solo protegía de un total falso, no de un precio falso por plato.
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
     ACCIÓN: agregar — sumarle platos a un pedido que ya está en curso
     ------------------------------------------------------------------------
     PARA QUÉ: el cliente manda su pedido y a los dos minutos se acuerda de que
     quería un perro más. Sin esto tendría que sacar otro turno, y entonces el
     mismo cliente aparece dos veces en la fila con dos números distintos.

     ⚠ NO PIDE CLAVE, y es correcto que no la pida: la manda el cliente desde
     su celular, no el vendedor. Lo que la hace segura es que **solo puede
     tocar un pedido del mismo teléfono**, hecho hoy y de hace menos de
     MINUTOS_AMPLIAR. Sin el teléfono correcto no encuentra nada que ampliar,
     y con él solo alcanza lo suyo. No devuelve ningún dato de otro cliente.

     ⚠ LOS PRECIOS SALEN DE CARTA, igual que al crear (decisión 35). Si no,
     este sería el hueco por donde entrarían los precios falsos que se acaban
     de tapar en la acción "crear".

     ⚠ SE PUEDE AMPLIAR AUNQUE YA ESTÉ EN LA PLANCHA — decisión de JX. El
     riesgo es real (el vendedor puede haber leído ya la comanda y entregar sin
     lo nuevo), así que el pedido queda marcado con "ampliadoEnPlancha" para
     que el panel lo grite en rojo, le suene la campana otra vez y el cliente
     lo mande además por WhatsApp. Tres avisos para el mismo hecho, porque uno
     solo se pierde en hora pico.
     ------------------------------------------------------------------------ */
  if (accion === 'agregar') {
    const telefono = String(datos.telefono || '').replace(/\D/g, '').slice(0, 15);
    const items = Array.isArray(datos.items) ? datos.items.slice(0, 40) : [];
    if (telefono.length < 7) return json({ error: 'El teléfono no es válido.' }, 400);
    if (items.length === 0) return json({ error: 'No mandaste nada que agregar.' }, 400);

    const hoy = fechaDia();
    const doc = await leerJson(kv, 'dia:' + hoy, { turno: 0, pedidos: [] });
    const p = pedidoEnCurso(doc, telefono);
    if (!p) {
      return json({
        error: 'No encontramos un pedido tuyo al que agregarle esto.',
        codigo: 'SIN_PEDIDO'
      }, 404);
    }

    /* Tope de platos por pedido: el mismo 40 de "crear". Sin él, alguien
       podría ampliar veinte veces y hacer crecer el documento del día sin
       límite, que es el cupo de KV por otra puerta. */
    const nuevos = items.map(i => {
      const nombre = String(i.nombre || '').slice(0, 80);
      return {
        nombre,
        cantidad: Math.max(1, Math.min(20, parseInt(i.cantidad, 10) || 1)),
        precio: Object.prototype.hasOwnProperty.call(CARTA, nombre) ? CARTA[nombre] : 0
      };
    });
    if (p.items.length + nuevos.length > 40) {
      return json({ error: 'El pedido ya tiene demasiados platos.' }, 400);
    }

    /* Si vuelve a pedir un plato que ya tenía, se le suma a la cantidad en vez
       de repetir la línea. En el papel de la cocina "2× Perro" se lee de un
       golpe; "1× Perro" dos veces se cuenta mal con prisa. */
    nuevos.forEach(n => {
      const ya = p.items.find(x => x.nombre === n.nombre);
      if (ya) { ya.cantidad = Math.min(20, ya.cantidad + n.cantidad); }
      else { p.items.push(n); }
    });

    p.total = p.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    p.ampliado = Date.now();
    // Se guarda si ya estaba en la plancha CUANDO amplió, no el estado de
    // ahora: es lo que decide si el panel avisa en naranja o grita en rojo.
    p.ampliadoEnPlancha = p.estado === 'preparando';

    await kv.put('dia:' + hoy, JSON.stringify(doc));
    return json({ ok: true, pedido: p });
  }

  /* ------------------------------------------------------------------------
     ACCIÓN PÚBLICA: turnos — para que el cliente vea cuánto falta
     ------------------------------------------------------------------------
     Qué devuelve: SOLO números. El turno que están preparando, cuántos hay en
     cola y el último turno entregado. Nada más.

     ⚠ POR QUÉ NO DEVUELVE NADA MÁS: esta acción no lleva clave, así que
     cualquiera puede llamarla. Si devolviera la lista de pedidos, cualquiera
     podría sacar los nombres y los celulares de todos los clientes del día con
     una sola petición. Aquí no sale ni un nombre, ni un teléfono, ni un total.
     ⚠ NUNCA agregarle campos a esta respuesta sin pensar en eso.

     Cuánto cuesta: 1 lectura de KV, la misma que gasta el panel. El navegador
     del cliente pregunta cada 30 segundos y solo mientras tiene la pantalla del
     turno abierta, así que no se acerca ni de lejos al cupo diario.
     ---------------------------------------------------------------------- */
  if (accion === 'turnos') {
    const hoy = fechaDia();
    const doc = await leerJson(kv, 'dia:' + hoy, { turno: 0, pedidos: [] });

    /* ⚠ AQUÍ HUBO UN BUG GRAVE, corregido el 21 de septiembre de 2026.
       Antes, si ningún pedido estaba en la plancha, "preparando" se caía al
       turno más bajo pendiente "como la mejor suposición". El resultado: al
       PRIMER cliente del día, que tiene el turno 1 y es el único pendiente, el
       servidor le respondía preparando:1 — y su página concluía **"ya están
       preparando el tuyo"** apenas tocaba enviar, cuando el vendedor no había
       tocado nada. Peor: le sonaba la notificación del celular diciendo lo
       mismo. El cliente salía para el local creyendo que ya estaba.
       ⚠ REGLA QUE SALE DE AQUÍ: este endpoint NO ADIVINA. Si el dato no se
       sabe, va en null. Son dos cosas distintas y por eso son dos campos. */

    // Lo que DE VERDAD está en la plancha: solo si el vendedor tocó "Empezar".
    const enPlancha = doc.pedidos.filter(p => !p.entregado && p.estado === 'preparando').map(p => p.turno);
    // La fila de espera: sirve para contar cuántos van delante, y NO promete
    // que nadie los esté preparando.
    const pendientes = doc.pedidos.filter(p => !p.entregado).map(p => p.turno);
    const entregados = doc.pedidos.filter(p => p.entregado).map(p => p.turno);

    return json({
      ok: true,
      // null = nadie ha tocado "Empezar". El cliente NO debe ver verde.
      preparando: enPlancha.length ? Math.min(...enPlancha) : null,
      // El primero de la fila. Que exista no significa que lo estén haciendo.
      siguiente: pendientes.length ? Math.min(...pendientes) : null,
      /* La lista de turnos que faltan, para que el cliente cuente EXACTO
         cuántos van antes que él. Con solo "siguiente" se sobreestimaba: si
         están pendientes el 1 y el 3 y tú eres el 3, restar 3−1 da 2, pero
         delante solo va uno. Son números sueltos, sin un solo nombre ni
         teléfono — la misma regla de siempre para esta acción pública. */
      pendientes: pendientes.sort((a, b) => a - b),
      enCola: pendientes.length,
      ultimoEntregado: entregados.length ? Math.max(...entregados) : null,
      turnoDelDia: doc.turno
    });
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

  /* ACCIÓN: estado — mueve un pedido entre 'nuevo' y 'preparando'
     Para qué: que el vendedor marque con un toque lo que ya está en la plancha.
     Le sirve a él para saber qué sigue, y de paso alimenta la cola que ve el
     cliente en su pantalla de turno, que pasa de ser una suposición a ser el
     dato real.
     ⚠ NO toca "entregado": ese es otro botón y otra acción. Un pedido puede
     pasar de 'preparando' a entregado, o de 'nuevo' a entregado directamente
     si el vendedor no usa este botón. El sistema no obliga a seguir un orden. */
  if (accion === 'estado') {
    const nuevoEstado = datos.estado === 'preparando' ? 'preparando' : 'nuevo';
    const indice = await leerJson(kv, 'indice:dias', []);
    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, null);
      if (!doc) continue;
      const p = doc.pedidos.find(x => x.id === datos.id);
      if (p) {
        p.estado = nuevoEstado;
        p.empezadoEn = nuevoEstado === 'preparando' ? Date.now() : null;
        await kv.put('dia:' + d, JSON.stringify(doc));
        return json({ ok: true, estado: nuevoEstado });
      }
    }
    return json({ error: 'Pedido no encontrado.' }, 404);
  }

  /* ACCIÓN: deshacer-entregado — devuelve un pedido a la lista de pendientes
     Para qué: el botón "Entregado" está al lado de otros y se toca por error.
     Sin esto, el único arreglo era borrar el pedido y perder el registro.
     El panel solo lo ofrece durante unos segundos después de marcarlo, pero el
     servidor lo acepta siempre: si el vendedor se da cuenta cinco minutos
     después, tiene que poder arreglarlo igual. */
  if (accion === 'deshacer-entregado') {
    const indice = await leerJson(kv, 'indice:dias', []);
    for (const d of indice) {
      const doc = await leerJson(kv, 'dia:' + d, null);
      if (!doc) continue;
      const p = doc.pedidos.find(x => x.id === datos.id);
      if (p) {
        p.entregado = false;
        p.entregadoEn = null;
        await kv.put('dia:' + d, JSON.stringify(doc));
        return json({ ok: true });
      }
    }
    return json({ error: 'Pedido no encontrado.' }, 404);
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
