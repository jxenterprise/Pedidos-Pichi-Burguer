/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/panel.js
   ----------------------------------------------------------------------------
   QUÉ CONTIENE: el comportamiento del panel del vendedor (panel.html).

   BLOQUES DE ESTE ARCHIVO:
     1. Acceso con clave
     2. Carga y refresco de los pedidos
     3. Dibujo de cada tarjeta de pedido
     4. Acciones: entregado, borrar historial, salir
     5. Arranque

   DEPENDE DE: js/config.js y js/almacen.js, que deben cargarse ANTES.

   ⚠ SOBRE LA SEGURIDAD DE LA CLAVE — leerlo antes de tocar nada:
     · En modo nube (el normal), la clave la revisa el SERVIDOR: viaja en un
       encabezado y Cloudflare la compara con la variable de entorno
       PANEL_CLAVE. La clave NO está en este archivo ni en ningún archivo del
       sitio, así que no se puede sacar mirando el código.
     · En modo local (una tablet fija en el mostrador, sin backend) no hay
       servidor que revise nada, así que la comprobación se hace aquí con un
       resumen criptográfico de la clave. Eso NO es seguridad de verdad: sirve
       para que un cliente curioso no toque la tablet, nada más. En ese modo los
       pedidos viven solo en ese aparato, así que no hay nada que robar de
       lejos. Si alguna vez el panel va a estar expuesto en internet, tiene que
       ser SIEMPRE en modo nube.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.PICHI_CONFIG;
  var $  = function (s) { return document.querySelector(s); };

  /* Resumen SHA-256 de la clave, usado ÚNICAMENTE en modo local (ver aviso
     de arriba). En modo nube este valor no se usa para nada. */
  var HASH_CLAVE_LOCAL = '179dd6e34921eabb7886b4c898a0e6342f8b181c73f792b2eb8ac860f4e22275';

  /* La clave escrita se guarda en memoria mientras dura la sesión y en
     sessionStorage para que al refrescar la página no toque escribirla otra
     vez. Se usa sessionStorage y NO localStorage a propósito: al cerrar la
     pestaña se borra sola. */
  var clave = '';
  var pestanaActual = 'activos';
  var idsConocidos = {};      // para detectar cuáles pedidos son nuevos
  var temporizador = null;

  var formatoPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  });
  function pesos(n) { return formatoPeso.format(n); }


  /* ==========================================================================
     1) ACCESO CON CLAVE
     ========================================================================== */

  /** Calcula el resumen SHA-256 de un texto (solo para el modo local). */
  function hash(texto) {
    var datos = new TextEncoder().encode(texto);
    return crypto.subtle.digest('SHA-256', datos).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  /**
   * Comprueba la clave y, si es correcta, abre el panel.
   * En modo nube la comprobación real la hace el servidor: se intenta listar
   * los pedidos y, si devuelve "clave incorrecta", no se entra.
   */
  function intentarEntrar(evento) {
    evento.preventDefault();
    var escrita = $('#campoClave').value;
    var boton = $('#btnEntrar');
    var error = $('#errorAcceso');

    error.classList.remove('visible');
    boton.disabled = true;
    boton.textContent = 'Comprobando…';

    var comprobacion;

    if (CFG.sistema.modo === 'local') {
      comprobacion = hash(escrita).then(function (h) {
        if (h !== HASH_CLAVE_LOCAL) { throw new Error('Clave incorrecta.'); }
      });
    } else {
      // La clave se manda al servidor; si está mal, la API responde 401.
      comprobacion = window.Almacen.listarPedidos(escrita).then(function () {});
    }

    comprobacion.then(function () {
      clave = escrita;
      try { sessionStorage.setItem('pichi_panel', clave); } catch (e) {}
      abrirPanel();
    }).catch(function (err) {
      error.textContent = err.message === 'Clave incorrecta.'
        ? 'Esa clave no es. Revísala e intenta otra vez.'
        : 'No se pudo entrar: ' + err.message;
      error.classList.add('visible');
      $('#campoClave').focus();
      $('#campoClave').select();
    }).then(function () {
      boton.disabled = false;
      boton.textContent = 'Entrar';
    });
  }

  /** Muestra la pantalla de pedidos y arranca el refresco automático. */
  function abrirPanel() {
    $('#pantallaAcceso').hidden = true;
    $('#pantallaPedidos').hidden = false;
    cargarPedidos(true);

    // Refresco automático. El intervalo sale de config.js; no bajarlo de 10
    // segundos para no gastar el cupo de lecturas del plan gratuito.
    if (temporizador) { clearInterval(temporizador); }
    temporizador = setInterval(function () { cargarPedidos(false); },
                               CFG.sistema.refrescoPanelSegundos * 1000);
  }


  /* ==========================================================================
     2) CARGA Y REFRESCO DE LOS PEDIDOS
     ========================================================================== */

  /**
   * Trae los pedidos y los pinta.
   * @param {boolean} primeraVez  si es la carga inicial (no avisa de "nuevos")
   */
  function cargarPedidos(primeraVez) {
    window.Almacen.listarPedidos(clave).then(function (datos) {
      marcarConexion(true, datos.modo || 'nube');

      // Detectar pedidos nuevos para avisar al vendedor con un aviso discreto.
      var nuevos = 0;
      datos.activos.forEach(function (p) {
        if (!idsConocidos[p.id]) { nuevos++; idsConocidos[p.id] = true; }
      });
      if (!primeraVez && nuevos > 0) {
        avisar(nuevos === 1 ? '🔔 Entró 1 pedido nuevo' : '🔔 Entraron ' + nuevos + ' pedidos nuevos');
      }

      pintarLista($('#listaActivos'), datos.activos, false);
      pintarLista($('#listaHistorial'), datos.historial, true);
      $('#nActivos').textContent = datos.activos.length;
      $('#nHistorial').textContent = datos.historial.length;

      var pendientes = datos.activos.filter(function (p) { return !p.entregado; }).length;
      $('#tituloPanel').textContent = pendientes === 0
        ? 'Todo al día'
        : (pendientes === 1 ? '1 pedido por entregar' : pendientes + ' pedidos por entregar');
      $('#subtituloPanel').textContent =
        'Actualizado a las ' + window.Almacen.horaTextoColombia() +
        ' · se revisa solo cada ' + CFG.sistema.refrescoPanelSegundos + ' segundos.';

      $('#notaLimpieza').textContent =
        'Los pedidos pasan al historial ' + CFG.sistema.horasEnPanelActivo +
        ' horas después de entrar. El historial se borra solo los sábados a las 7:00 a. m.' +
        (datos.proximaLimpieza ? ' Próximo borrado: ' + datos.proximaLimpieza + '.' : '');

    }).catch(function (err) {
      marcarConexion(false);
      if (err.status === 401) {
        // La clave dejó de servir (la cambiaron en Cloudflare): se pide de nuevo.
        cerrarSesion();
        avisar('La clave cambió. Vuelve a entrar.');
      } else {
        avisar('Sin conexión: ' + err.message);
      }
    });
  }

  /** Pinta el semáforo de conexión de la barra superior. */
  function marcarConexion(ok, modo) {
    var caja = $('#estadoConexion');
    caja.className = 'estado ' + (ok ? 'esta-abierto' : 'esta-cerrado');
    $('#estadoConexionTexto').textContent = ok
      ? (modo === 'local' ? 'En este aparato' : 'Conectado')
      : 'Sin conexión';
  }


  /* ==========================================================================
     3) DIBUJO DE CADA TARJETA DE PEDIDO
     Qué muestra cada tarjeta: turno, nombre, celular, número de pedido, fecha y
     hora exacta, lo que pidió, el total, la forma de entrega y de pago, y las
     notas para la cocina. Es todo lo que el vendedor necesita sin preguntar.
     ========================================================================== */

  /**
   * Llena una de las dos listas del panel.
   * @param {HTMLElement} caja        contenedor donde se pinta
   * @param {Array} pedidos           pedidos a mostrar
   * @param {boolean} esHistorial     cambia el mensaje de "no hay nada"
   */
  function pintarLista(caja, pedidos, esHistorial) {
    caja.innerHTML = '';

    if (!pedidos.length) {
      var vacio = document.createElement('div');
      vacio.className = 'vacio';
      var t = document.createElement('strong');
      t.textContent = esHistorial ? 'El historial está vacío' : 'No hay pedidos ahora mismo';
      var s = document.createElement('span');
      s.textContent = esHistorial
        ? 'Aquí quedan los pedidos de más de ' + CFG.sistema.horasEnPanelActivo + ' horas.'
        : 'Los pedidos aparecen solos apenas alguien los envíe.';
      vacio.append(t, s);
      caja.appendChild(vacio);
      return;
    }

    pedidos.forEach(function (p) { caja.appendChild(tarjeta(p, esHistorial)); });
  }

  /** Construye la tarjeta de un pedido. */
  function tarjeta(p, esHistorial) {
    var art = document.createElement('article');
    art.className = 'pedido' + (p.entregado ? ' entregado' : '') + (esHistorial ? ' viejo' : '');

    /* --- Encabezado: turno, nombre, celular, hora --- */
    var cab = document.createElement('div');
    cab.className = 'pedido__cab';

    var turno = document.createElement('div');
    turno.className = 'pedido__turno';
    var tn = document.createElement('b'); tn.textContent = p.turno;
    var te = document.createElement('span'); te.textContent = 'Turno';
    turno.append(tn, te);

    var quien = document.createElement('div');
    quien.className = 'pedido__quien';
    var h3 = document.createElement('h3'); h3.textContent = p.nombre;
    var meta = document.createElement('p');
    meta.className = 'pedido__meta';
    meta.textContent = p.telefono + ' · ' + fechaHora(p.creado) +
                       (p.numero ? ' · N° ' + p.numero : '');
    quien.append(h3, meta);

    var tipo = document.createElement('span');
    tipo.className = 'pedido__tipo' + (p.tipo === 'domicilio' ? ' domicilio' : '');
    tipo.textContent = p.tipo === 'domicilio' ? 'Domicilio' : 'Recoge';

    cab.append(turno, quien, tipo);
    art.appendChild(cab);

    /* --- Lo que pidió --- */
    var lista = document.createElement('ul');
    lista.className = 'pedido__items';
    p.items.forEach(function (i) {
      var li = document.createElement('li');
      var b = document.createElement('b'); b.textContent = i.cantidad + '×';
      var n = document.createElement('span'); n.textContent = i.nombre;
      var v = document.createElement('span'); v.textContent = pesos(i.precio * i.cantidad);
      li.append(b, n, v);
      lista.appendChild(li);
    });
    art.appendChild(lista);

    /* --- Datos extra: dirección, pago y notas --- */
    var extra = document.createElement('div');
    extra.className = 'pedido__extra';
    var filas = [];
    if (p.tipo === 'domicilio' && p.direccion) { filas.push(['Dirección', p.direccion]); }
    if (p.pago) { filas.push(['Pago', p.pago]); }
    if (p.notas) { filas.push(['Notas', p.notas]); }
    if (filas.length) {
      filas.forEach(function (par) {
        var d = document.createElement('div');
        var a = document.createElement('span'); a.textContent = par[0];
        var b = document.createElement('span'); b.textContent = par[1];
        d.append(a, b);
        extra.appendChild(d);
      });
      art.appendChild(extra);
    }

    /* --- Pie: total y botones --- */
    var pie = document.createElement('div');
    pie.className = 'pedido__pie';

    var total = document.createElement('span');
    total.className = 'pedido__total';
    total.textContent = pesos(p.total);
    pie.appendChild(total);

    // Llamar y escribir al cliente sin tener que copiar el número a mano.
    var llamar = document.createElement('a');
    llamar.className = 'btn btn--linea';
    llamar.href = 'tel:+57' + p.telefono;
    llamar.textContent = 'Llamar';
    pie.appendChild(llamar);

    var wa = document.createElement('a');
    wa.className = 'btn btn--linea';
    wa.href = 'https://wa.me/57' + p.telefono + '?text=' +
              encodeURIComponent('Hola ' + p.nombre + ', tu pedido de Pichi Burguer (turno ' + p.turno + ') ya está listo.');
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.textContent = 'WhatsApp';
    pie.appendChild(wa);

    if (!p.entregado) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--rojo';
      btn.textContent = 'Entregado';
      btn.addEventListener('click', function () { marcarEntregado(p.id, btn); });
      pie.appendChild(btn);
    } else {
      var ok = document.createElement('span');
      ok.style.cssText = 'color:var(--verde);font-weight:700;font-size:.88rem';
      ok.textContent = '✓ Entregado';
      pie.appendChild(ok);
    }

    art.appendChild(pie);
    return art;
  }

  /** Convierte la marca de tiempo del pedido a "6 sept, 7:42 p. m." */
  function fechaHora(ms) {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: CFG.horarios.zonaHoraria,
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
    }).format(new Date(ms));
  }


  /* ==========================================================================
     4) ACCIONES DEL VENDEDOR
     ========================================================================== */

  /** Marca un pedido como entregado y refresca la lista. */
  function marcarEntregado(id, boton) {
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    window.Almacen.marcarEntregado(id, clave).then(function () {
      avisar('Pedido marcado como entregado');
      cargarPedidos(false);
    }).catch(function (err) {
      avisar('No se pudo guardar: ' + err.message);
      boton.disabled = false;
      boton.textContent = 'Entregado';
    });
  }

  /** Borra el historial a mano. Pide confirmación: la acción no tiene vuelta. */
  function borrarHistorial() {
    if (!confirm('¿Borrar todos los pedidos del historial?\n\nLos pedidos de las últimas ' +
                 CFG.sistema.horasEnPanelActivo + ' horas NO se borran. Esta acción no se puede deshacer.')) {
      return;
    }
    window.Almacen.borrarHistorial(clave).then(function () {
      avisar('Historial borrado');
      idsConocidos = {};
      cargarPedidos(true);
    }).catch(function (err) {
      avisar('No se pudo borrar: ' + err.message);
    });
  }

  /** Cierra la sesión y vuelve a la pantalla de la clave. */
  function cerrarSesion() {
    clave = '';
    try { sessionStorage.removeItem('pichi_panel'); } catch (e) {}
    if (temporizador) { clearInterval(temporizador); temporizador = null; }
    $('#pantallaPedidos').hidden = true;
    $('#pantallaAcceso').hidden = false;
    $('#campoClave').value = '';
    $('#campoClave').focus();
  }

  /** Cambia entre las pestañas de activos e historial. */
  function cambiarPestana(cual) {
    pestanaActual = cual;
    var esActivos = cual === 'activos';
    $('#tabActivos').classList.toggle('activa', esActivos);
    $('#tabHistorial').classList.toggle('activa', !esActivos);
    $('#tabActivos').setAttribute('aria-selected', String(esActivos));
    $('#tabHistorial').setAttribute('aria-selected', String(!esActivos));
    $('#listaActivos').hidden = !esActivos;
    $('#listaHistorial').hidden = esActivos;
  }

  /** Aviso flotante: aparece, se lee y se va sola a los 3 segundos. */
  var tiempoAviso = null;
  function avisar(texto) {
    var caja = $('#avisoFlotante');
    caja.textContent = texto;
    caja.classList.add('visible');
    if (tiempoAviso) { clearTimeout(tiempoAviso); }
    tiempoAviso = setTimeout(function () { caja.classList.remove('visible'); }, 3000);
  }


  /* ==========================================================================
     5) ARRANQUE
     ========================================================================== */
  function iniciar() {
    $('#anio').textContent = new Date().getFullYear();

    $('#formAcceso').addEventListener('submit', intentarEntrar);
    $('#tabActivos').addEventListener('click', function () { cambiarPestana('activos'); });
    $('#tabHistorial').addEventListener('click', function () { cambiarPestana('historial'); });
    $('#btnRefrescar').addEventListener('click', function () { cargarPedidos(false); });
    $('#btnBorrarHistorial').addEventListener('click', borrarHistorial);
    $('#btnSalir').addEventListener('click', cerrarSesion);

    // Si el vendedor solo refrescó la página, se entra directo sin pedir clave.
    var guardada = null;
    try { guardada = sessionStorage.getItem('pichi_panel'); } catch (e) {}
    if (guardada) { clave = guardada; abrirPanel(); }

    // Al volver a la pestaña después de un rato, se refresca de inmediato en
    // vez de esperar el siguiente ciclo. Es lo que espera el vendedor cuando
    // deja el celular un momento y vuelve a mirarlo.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && clave) { cargarPedidos(false); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
