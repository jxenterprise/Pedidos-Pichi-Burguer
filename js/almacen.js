/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/almacen.js
   ----------------------------------------------------------------------------
   QUÉ ES: la capa de datos del sistema. Es el único archivo que sabe DÓNDE se
   guardan los pedidos. Todo lo demás (la página del cliente y el panel del
   vendedor) le pide los datos a este archivo sin saber si vienen de la nube o
   del propio aparato.

   POR QUÉ SE HIZO ASÍ: para que cambiar de "guardar en Cloudflare" a "guardar
   en el aparato" sea UNA sola línea en js/config.js (sistema.modo) y no haya
   que reescribir nada más. Si mañana el sistema crece y se mueve a una base de
   datos de verdad, solo se reescribe este archivo.

   DEPENDE DE: js/config.js (debe cargarse ANTES que este archivo).
   LO USAN:    js/script.js (crear pedido) y js/panel.js (listar y entregar).

   FUNCIONES PÚBLICAS QUE EXPONE (window.Almacen):
     · crearPedido(datos)        → guarda un pedido y devuelve su turno y número
     · listarPedidos(clave)      → trae activos + historial (solo panel)
     · marcarEntregado(id,clave) → marca un pedido como entregado
     · borrarHistorial(clave)    → limpieza manual del historial
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.PICHI_CONFIG;

  /* --------------------------------------------------------------------------
     UTILIDADES DE FECHA EN HORA DE COLOMBIA
     Qué hacen: devolver la fecha/hora de Cartagena sin importar la zona horaria
     del celular del visitante.
     Por qué importan: un turista con el teléfono en hora de Miami vería el local
     "abierto" a la hora equivocada, y el turno del día se calcularía mal.
     ------------------------------------------------------------------------ */

  /**
   * Devuelve las partes de la fecha/hora actual en hora de Colombia.
   * @returns {{anio:number, mes:number, dia:number, hora:number, minuto:number, diaSemana:number}}
   */
  function ahoraColombia() {
    var fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: CFG.horarios.zonaHoraria,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'short', hour12: false
    });
    var p = {};
    fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });

    // 'weekday' llega como texto corto en inglés; se traduce a número 0-6
    // para que coincida con el orden de CFG.horarios.dias y con Date.getDay().
    var mapaDias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    return {
      anio: parseInt(p.year, 10),
      mes: parseInt(p.month, 10),
      dia: parseInt(p.day, 10),
      hora: parseInt(p.hour, 10) % 24,   // Intl puede devolver "24" a medianoche
      minuto: parseInt(p.minute, 10),
      segundo: parseInt(p.second, 10),
      diaSemana: mapaDias[p.weekday]
    };
  }

  /** Fecha de hoy en Colombia como texto "AAAA-MM-DD" (clave de los turnos). */
  function fechaHoyColombia() {
    var a = ahoraColombia();
    return a.anio + '-' + String(a.mes).padStart(2, '0') + '-' + String(a.dia).padStart(2, '0');
  }

  /** Hora actual en Colombia como texto "HH:MM" (para mostrar en pantalla). */
  function horaTextoColombia() {
    var a = ahoraColombia();
    return String(a.hora).padStart(2, '0') + ':' + String(a.minuto).padStart(2, '0');
  }

  /* --------------------------------------------------------------------------
     MODO LOCAL (respaldo)
     Qué hace: guarda los pedidos en el navegador del aparato, sin backend.
     Cuándo entra: si config.modo es 'local', o si es 'auto' y la nube falló.
     Límite conocido y aceptado: cada aparato ve solo SUS pedidos. Sirve para
     una tablet fija en el mostrador o para probar el sistema, no para que el
     vendedor vea desde su celular lo que pidió un cliente desde el suyo.
     ------------------------------------------------------------------------ */
  var LOCAL_CLAVE = 'pichi_pedidos_v1';

  function leerLocal() {
    try {
      var crudo = localStorage.getItem(LOCAL_CLAVE);
      return crudo ? JSON.parse(crudo) : { turnos: {}, pedidos: [] };
    } catch (e) {
      // Si el navegador tiene el almacenamiento bloqueado (modo incógnito de
      // algunos iPhone), se devuelve un almacén vacío en vez de romper la página.
      return { turnos: {}, pedidos: [] };
    }
  }

  function guardarLocal(datos) {
    try {
      localStorage.setItem(LOCAL_CLAVE, JSON.stringify(datos));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Genera un identificador único para el pedido.
   * Se intenta con crypto.randomUUID, que es lo correcto, pero ese método NO
   * existe en contextos no seguros (abrir el archivo con doble clic, o un
   * servidor sin HTTPS). Por eso hay un respaldo: sin él, en esos casos el
   * pedido se quedaría sin identificador y el botón "Entregado" del panel no
   * sabría a cuál pedido se refiere.
   */
  function nuevoId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /**
   * Guarda un pedido en el propio aparato.
   * ⚠ IMPORTANTE: tiene que dejar el pedido con EXACTAMENTE los mismos campos
   * que le pone el servidor en la nube (id, numero, turno, creado, entregado).
   * Si falta alguno, el panel no puede separar activos de historial ni marcar
   * pedidos como entregados. Si algún día se agrega un campo en
   * functions/api/pedidos.js, hay que agregarlo también aquí.
   */
  function crearPedidoLocal(pedido) {
    var doc = leerLocal();
    var hoy = fechaHoyColombia();

    // Turno del día: arranca en 1 y sube de uno en uno; mañana vuelve a 1.
    doc.turnos[hoy] = (doc.turnos[hoy] || 0) + 1;

    pedido.turno = doc.turnos[hoy];
    pedido.fechaDia = hoy;
    pedido.id = nuevoId();
    // Número de pedido con el mismo formato del servidor: AAMMDD-001
    pedido.numero = hoy.replace(/-/g, '').slice(2) + '-' + String(pedido.turno).padStart(3, '0');
    pedido.creado = Date.now();     // sin esto, el panel manda todo al historial
    pedido.entregado = false;

    doc.pedidos.push(pedido);
    guardarLocal(doc);
    return pedido;
  }

  /* --------------------------------------------------------------------------
     MODO NUBE (Cloudflare KV a través de /api/pedidos)
     Qué hace: habla con la función serverless del proyecto.
     Por qué la clave del panel viaja en un encabezado y no en la URL: las URL
     quedan guardadas en el historial del navegador y en los registros del
     servidor; un encabezado no.
     ------------------------------------------------------------------------ */

  /**
   * Llama a la API de pedidos.
   * @param {string} accion  'crear' | 'listar' | 'entregado' | 'borrar-historial'
   * @param {object} cuerpo  datos a enviar
   * @param {string} clave   clave del panel (solo para acciones del vendedor)
   * @returns {Promise<object>} respuesta de la API
   */
  function llamarApi(accion, cuerpo, clave) {
    var cabeceras = { 'Content-Type': 'application/json' };
    if (clave) { cabeceras['X-Panel-Clave'] = clave; }

    return fetch(CFG.sistema.rutaApi, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({ accion: accion, datos: cuerpo || {} })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) {
          var err = new Error(j.error || ('Error ' + r.status));
          err.status = r.status;
          throw err;
        }
        return j;
      });
    });
  }

  /* --------------------------------------------------------------------------
     API PÚBLICA DEL ALMACÉN
     ------------------------------------------------------------------------ */

  var Almacen = {

    ahoraColombia: ahoraColombia,
    fechaHoyColombia: fechaHoyColombia,
    horaTextoColombia: horaTextoColombia,

    /** Modo con el que se guardó el último pedido ('nube' o 'local'). */
    ultimoModoUsado: null,

    /**
     * Crea un pedido.
     * Qué hace: le asigna turno y número, lo guarda y devuelve el pedido completo.
     * En modo 'auto': intenta la nube; si falla por lo que sea, guarda local y
     * NO le muestra ningún error al cliente (el pedido igual sale por WhatsApp).
     * @param {object} pedido  { nombre, telefono, tipo, direccion, pago, items, total, notas }
     * @returns {Promise<object>} pedido con turno, numero y fecha
     */
    crearPedido: function (pedido) {
      var modo = CFG.sistema.modo;

      if (modo === 'local') {
        Almacen.ultimoModoUsado = 'local';
        return Promise.resolve(crearPedidoLocal(pedido));
      }

      return llamarApi('crear', pedido)
        .then(function (res) {
          Almacen.ultimoModoUsado = 'nube';
          return res.pedido;
        })
        .catch(function (err) {
          if (modo === 'nube') { throw err; }   // modo estricto: el error sube
          // Modo 'auto': la nube falló, se sigue por el camino local.
          Almacen.ultimoModoUsado = 'local';
          return crearPedidoLocal(pedido);
        });
    },

    /**
     * Lista los pedidos para el panel del vendedor.
     * Devuelve { activos: [], historial: [] } ya separados por el servidor
     * según las 5 horas configuradas.
     * @param {string} clave  clave del panel
     */
    listarPedidos: function (clave) {
      if (CFG.sistema.modo === 'local') {
        return Promise.resolve(separarLocal(leerLocal().pedidos));
      }
      return llamarApi('listar', {}, clave).then(function (r) {
        // proximaLimpieza se pasa tal cual: el panel la muestra en la nota de
        // abajo ("Próximo borrado: …"). Si no se reenvía aquí, el dato llega
        // del servidor y se pierde en este punto, y la nota sale incompleta.
        return {
          activos: r.activos,
          historial: r.historial,
          proximaLimpieza: r.proximaLimpieza,
          modo: 'nube'
        };
      });
    },

    /**
     * Marca un pedido como entregado (deja de aparecer como pendiente).
     * @param {string} id     identificador del pedido
     * @param {string} clave  clave del panel
     */
    marcarEntregado: function (id, clave) {
      if (CFG.sistema.modo === 'local') {
        var doc = leerLocal();
        doc.pedidos.forEach(function (p) { if (p.id === id) { p.entregado = true; } });
        guardarLocal(doc);
        return Promise.resolve({ ok: true });
      }
      return llamarApi('entregado', { id: id }, clave);
    },

    /**
     * Borra el historial a mano (además del borrado automático de los sábados).
     * @param {string} clave  clave del panel
     */
    borrarHistorial: function (clave) {
      if (CFG.sistema.modo === 'local') {
        var doc = leerLocal();
        var corte = Date.now() - CFG.sistema.horasEnPanelActivo * 3600000;
        doc.pedidos = doc.pedidos.filter(function (p) { return p.creado > corte; });
        guardarLocal(doc);
        return Promise.resolve({ ok: true });
      }
      return llamarApi('borrar-historial', {}, clave);
    }
  };

  /**
   * Separa los pedidos guardados en el aparato entre activos e historial.
   * Qué hace: aplica la misma regla de las 5 horas que aplica el servidor, para
   * que el panel se vea igual funcione en la nube o en local.
   * @param {Array} lista  pedidos guardados
   */
  function separarLocal(lista) {
    var corte = Date.now() - CFG.sistema.horasEnPanelActivo * 3600000;
    var activos = [], historial = [];
    lista.forEach(function (p) {
      (p.creado > corte ? activos : historial).push(p);
    });
    // Activos: por turno de menor a mayor (turno 1 arriba, como en el mostrador).
    activos.sort(function (a, b) { return a.creado - b.creado; });
    // Historial: lo más reciente primero, que es lo que se consulta.
    historial.sort(function (a, b) { return b.creado - a.creado; });
    return { activos: activos, historial: historial, modo: 'local' };
  }

  window.Almacen = Almacen;
})();
