/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/panel.js
   ----------------------------------------------------------------------------
   QUÉ CONTIENE: el comportamiento del panel del vendedor (panel.html).

   BLOQUES DE ESTE ARCHIVO:
     1. Acceso con clave
     2. Carga y refresco de los pedidos
     3. Dibujo de cada tarjeta de pedido
     3bis. Avisos: campana, notificación y pantalla encendida
     4. Acciones: entregado, borrar historial, borrar pruebas, probar, salir
     5. Arranque

   DEPENDE DE: js/config.js y js/almacen.js, que deben cargarse ANTES.

   ⚠ SOBRE LA SEGURIDAD DE LA CLAVE — leerlo antes de tocar nada:
     · En modo nube (el normal), la clave la revisa el SERVIDOR: viaja en un
       encabezado y Cloudflare la compara con la variable de entorno
       PANEL_CLAVE. La clave NO está en este archivo ni en ningún archivo del
       sitio, así que no se puede sacar mirando el código.
     · En modo local (sistema.modo = 'local' en js/config.js) NO hay servidor
       que revise nada, así que el panel simplemente NO ABRE y lo dice. Antes
       había aquí un resumen SHA-256 de la clave; se quitó porque un resumen de
       una palabra adivinable se rompe por diccionario en segundos, y la regla
       de este proyecto es que la clave no exista en el código bajo ninguna
       forma. ⚠ NUNCA volver a poner una clave, ni un hash de una clave, en
       este archivo ni en ningún otro del repositorio.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.PICHI_CONFIG;
  var $  = function (s) { return document.querySelector(s); };

  /* La clave escrita se guarda en memoria mientras dura la sesión y en
     sessionStorage para que al refrescar la página no toque escribirla otra
     vez. Se usa sessionStorage y NO localStorage a propósito: al cerrar la
     pestaña se borra sola. */
  var clave = '';
  var idsConocidos = {};      // para detectar cuáles pedidos son nuevos
  var temporizador = null;

  var formatoPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  });
  /* Sin espacio entre el signo y el número, igual que el menú y el carrito
     de la página del cliente. Intl mete un espacio fino que se quita. */
  function pesos(n) { return formatoPeso.format(n).replace(/\s/g, ''); }


  /* ==========================================================================
     1) ACCESO CON CLAVE
     ========================================================================== */

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
      // Sin servidor no hay dónde guardar la clave fuera del alcance del
      // navegador: cualquier comprobación hecha aquí (aunque fuera contra un
      // resumen criptográfico) se puede leer y romper abriendo el código. Antes
      // había un hash aquí y se sacó por diccionario al primer intento. Así que
      // en modo local el panel no abre, y se dice por qué.
      comprobacion = Promise.reject(new Error(
        'El panel solo funciona con el sistema en la nube. Revisa sistema.modo en js/config.js.'
      ));
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
    mantenerPantallaEncendida();
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
      if (!primeraVez && nuevos > 0) { avisarPedidoNuevo(nuevos); }

      pintarLista($('#listaActivos'), datos.activos, false);
      pintarLista($('#listaHistorial'), datos.historial, true);
      $('#nActivos').textContent = datos.activos.length;
      $('#nHistorial').textContent = datos.historial.length;

      var pendientes = datos.activos.filter(function (p) { return !p.entregado; }).length;
      $('#tituloPanel').textContent = pendientes === 0
        ? 'Todo al día'
        : (pendientes === 1 ? '1 pedido por entregar' : pendientes + ' pedidos por entregar');
      // El título de la pestaña lleva la cuenta: con el panel en segundo plano,
      // el vendedor ve "(2) Panel de pedidos" sin tener que entrar a mirar.
      pintarTitulo(pendientes);

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
    art.className = 'pedido' + (p.entregado ? ' entregado' : '') + (esHistorial ? ' viejo' : '') +
                    (p.prueba ? ' es-prueba' : '');

    // Franja naranja arriba del todo: lo primero que se ve de la tarjeta, para
    // que nadie se ponga a preparar un pedido que nadie pidió.
    if (p.prueba) {
      var aviso = document.createElement('span');
      aviso.className = 'pedido__prueba';
      aviso.textContent = '⚠ Pedido de prueba · no preparar';
      art.appendChild(aviso);
    }

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
    // El número pasa por telefonoLocal() para que no salga +5757… si el cliente
    // ya había escrito el indicativo.
    var tel = telefonoLocal(p.telefono);
    var llamar = document.createElement('a');
    llamar.className = 'btn btn--linea';
    llamar.href = 'tel:+57' + tel;
    llamar.textContent = 'Llamar';
    pie.appendChild(llamar);

    var wa = document.createElement('a');
    wa.className = 'btn btn--linea';
    wa.href = 'https://wa.me/57' + tel + '?text=' +
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

  /**
   * Deja el celular en el formato local de 10 dígitos, listo para pegarle el
   * indicativo del país.
   * POR QUÉ EXISTE: el cliente escribe su número como quiere. Si lo escribe con
   * el indicativo ("573001234567" o "+57 300 123 4567"), concatenarle otro 57
   * dejaba el enlace en +5757301234567: el botón "Llamar" no marcaba y el de
   * WhatsApp abría un chat con un número que no existe.
   * @param {string} bruto  el teléfono tal como quedó guardado en el pedido
   * @returns {string} solo dígitos, sin indicativo de país
   */
  function telefonoLocal(bruto) {
    var d = String(bruto || '').replace(/\D/g, '');
    if (d.indexOf('00') === 0) { d = d.slice(2); }                  // marcación internacional vieja: 0057…
    if (d.length === 12 && d.indexOf('57') === 0) { d = d.slice(2); } // 57 + celular de 10 dígitos
    return d;
  }

  /** Convierte la marca de tiempo del pedido a "6 sept, 7:42 p. m." */
  function fechaHora(ms) {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: CFG.horarios.zonaHoraria,
      day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true
    }).format(new Date(ms));
  }


  /* ==========================================================================
     3bis) AVISOS AL VENDEDOR — campana, notificación y pantalla encendida
     ----------------------------------------------------------------------------
     EL PROBLEMA QUE RESUELVE: el panel avisaba de un pedido nuevo solo con un
     mensajito en pantalla. Si el vendedor estaba atendiendo a alguien, o el
     celular estaba con la pantalla apagada, el pedido se quedaba ahí esperando
     y el cliente creyendo que ya se lo estaban preparando. La venta no se
     perdía por un error del sistema: se perdía porque nadie se enteró.

     TRES CAPAS, porque ninguna sola alcanza:
       1. CAMPANA  — suena aunque el vendedor no esté mirando la pantalla.
       2. NOTIFICACIÓN — aparece aunque el panel esté en otra pestaña o el
          navegador en segundo plano.
       3. PANTALLA ENCENDIDA — el celular no se bloquea mientras el panel está
          abierto, que es lo que hacía que las otras dos no se vieran.
     Y de propina, el número de pedidos pendientes va en el título de la pestaña.

     POR QUÉ HAY QUE DARLE A UN BOTÓN Y NO SE ENCIENDE SOLO: los navegadores
     bloquean el sonido y las notificaciones hasta que la persona hace clic en
     algo. No es un capricho del diseño: sin un gesto de por medio, el navegador
     silencia la campana y nunca sonaría. El botón, además, evita que le salte
     un permiso por sorpresa a alguien que solo quería mirar los pedidos.

     POR QUÉ localStorage Y NO sessionStorage: la preferencia es del aparato del
     vendedor, no de la sesión. Si refresca o vuelve mañana, los avisos siguen
     encendidos. La clave sí va en sessionStorage, que es otra cosa.
     ========================================================================== */

  var CLAVE_AVISOS = 'pichi_avisos';
  var audio = null;          // se crea al primer clic; antes el navegador lo silencia
  var pantallaDespierta = null;

  function avisosEncendidos() {
    try { return localStorage.getItem(CLAVE_AVISOS) === '1'; } catch (e) { return false; }
  }

  /**
   * Toca tres notas cortas.
   * Se genera con el propio navegador en vez de bajar un archivo de sonido:
   * así no hay que esperar a que cargue, funciona sin internet y no se suma un
   * archivo más al proyecto.
   */
  function sonarCampana() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { return; }
      if (!audio) { audio = new AC(); }
      // Si el navegador lo dejó dormido (pasa al volver de segundo plano), se
      // despierta; si no, la campana no sonaría y nadie se enteraría del fallo.
      if (audio.state === 'suspended') { audio.resume(); }

      var t0 = audio.currentTime;
      [880, 1174.7, 1568].forEach(function (hz, i) {
        var osc = audio.createOscillator();
        var vol = audio.createGain();
        osc.type = 'sine';
        osc.frequency.value = hz;
        var t = t0 + i * 0.15;
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.linearRampToValueAtTime(0.35, t + 0.02);   // ataque rápido
        vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        osc.connect(vol); vol.connect(audio.destination);
        osc.start(t); osc.stop(t + 0.6);
      });
    } catch (e) { /* sin sonido: quedan la notificación y el aviso en pantalla */ }
  }

  /** Notificación del sistema, la que se ve con el panel en segundo plano. */
  function notificar(texto) {
    if (!('Notification' in window) || Notification.permission !== 'granted') { return; }
    try {
      var n = new Notification('Pichi Burguer · pedido nuevo', {
        body: texto,
        icon: 'img/icon-192.png',
        // Mismo tag para que no se amontonen diez notificaciones en la barra;
        // renotify hace que igual vuelva a sonar/vibrar con cada pedido.
        tag: 'pichi-pedido', renotify: true
      });
      n.onclick = function () { window.focus(); n.close(); };
    } catch (e) {}
  }

  /** Evita que el celular se bloquee mientras el panel está abierto. */
  function mantenerPantallaEncendida() {
    if (!avisosEncendidos() || !('wakeLock' in navigator)) { return; }
    try {
      navigator.wakeLock.request('screen').then(function (w) {
        pantallaDespierta = w;
        w.addEventListener('release', function () { pantallaDespierta = null; });
      }).catch(function () { /* el navegador no lo permitió: no es grave */ });
    } catch (e) {}
  }

  function soltarPantalla() {
    if (pantallaDespierta) { try { pantallaDespierta.release(); } catch (e) {} pantallaDespierta = null; }
  }

  /** Lo que se dispara cuando de verdad entra un pedido. */
  function avisarPedidoNuevo(cuantos) {
    var texto = cuantos === 1 ? 'Entró 1 pedido nuevo' : 'Entraron ' + cuantos + ' pedidos nuevos';
    avisar('🔔 ' + texto);
    if (!avisosEncendidos()) { return; }
    sonarCampana();
    notificar(texto);
  }

  /** Pinta el botón según esté encendido o apagado. */
  function pintarBotonAvisos() {
    var b = $('#btnAvisos');
    if (!b) { return; }
    var on = avisosEncendidos();
    b.classList.toggle('avisos-on', on);
    b.textContent = on ? '🔔 Avisos activos' : '🔕 Activar avisos';
    b.setAttribute('aria-pressed', String(on));
  }

  /** Enciende o apaga los avisos. Se llama SIEMPRE desde un clic. */
  function alternarAvisos() {
    if (avisosEncendidos()) {
      try { localStorage.setItem(CLAVE_AVISOS, '0'); } catch (e) {}
      soltarPantalla();
      pintarBotonAvisos();
      avisar('Avisos apagados');
      return;
    }

    try { localStorage.setItem(CLAVE_AVISOS, '1'); } catch (e) {}
    // Suena de una para dos cosas: que el vendedor compruebe el volumen, y que
    // el navegador registre el gesto y no vuelva a silenciar la campana.
    sonarCampana();

    if ('Notification' in window && Notification.permission === 'default') {
      try { Notification.requestPermission().then(pintarBotonAvisos); } catch (e) {}
    }
    mantenerPantallaEncendida();
    pintarBotonAvisos();
    avisar('Avisos encendidos · así suena');
  }

  /** Cuántos pedidos faltan, en el título de la pestaña del navegador. */
  function pintarTitulo(pendientes) {
    document.title = (pendientes > 0 ? '(' + pendientes + ') ' : '') + 'Panel de pedidos · Pichi Burguer';
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

  /**
   * Borra los pedidos de prueba, dejando intactos los de verdad.
   * Se pide confirmación igual que con el historial: no tiene vuelta atrás.
   */
  function borrarPruebas() {
    if (!confirm('¿Borrar los pedidos marcados como PRUEBA?\n\nLos pedidos reales NO se tocan. Esta acción no se puede deshacer.')) {
      return;
    }
    window.Almacen.borrarPruebas(clave).then(function (r) {
      var n = r && typeof r.borrados === 'number' ? r.borrados : 0;
      avisar(n === 1 ? 'Se borró 1 pedido de prueba' : 'Se borraron ' + n + ' pedidos de prueba');
      idsConocidos = {};
      cargarPedidos(true);
    }).catch(function (err) {
      avisar('No se pudo borrar: ' + err.message);
    });
  }

  /**
   * Abre la página del cliente en modo prueba, en una pestaña aparte.
   * Para qué: el local abre 5 horas al día; sin esto, comprobar que el sistema
   * funciona obligaría a esperar hasta las 6 de la tarde.
   */
  function probarLaPagina() {
    window.open('index.html?prueba=1', '_blank', 'noopener');
  }

  /** Cierra la sesión y vuelve a la pantalla de la clave. */
  function cerrarSesion() {
    clave = '';
    soltarPantalla();
    pintarTitulo(0);
    try { sessionStorage.removeItem('pichi_panel'); } catch (e) {}
    if (temporizador) { clearInterval(temporizador); temporizador = null; }
    $('#pantallaPedidos').hidden = true;
    $('#pantallaAcceso').hidden = false;
    $('#campoClave').value = '';
    $('#campoClave').focus();
  }

  /** Cambia entre las pestañas de activos e historial. */
  function cambiarPestana(cual) {
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
    $('#btnBorrarPruebas').addEventListener('click', borrarPruebas);
    $('#btnProbarPagina').addEventListener('click', probarLaPagina);
    $('#btnSalir').addEventListener('click', cerrarSesion);
    $('#btnAvisos').addEventListener('click', alternarAvisos);
    pintarBotonAvisos();

    // Si el vendedor solo refrescó la página, se entra directo sin pedir clave.
    var guardada = null;
    try { guardada = sessionStorage.getItem('pichi_panel'); } catch (e) {}
    if (guardada) { clave = guardada; abrirPanel(); }

    // Al volver a la pestaña después de un rato, se refresca de inmediato en
    // vez de esperar el siguiente ciclo. Es lo que espera el vendedor cuando
    // deja el celular un momento y vuelve a mirarlo.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && clave) {
        cargarPedidos(false);
        // El navegador suelta el bloqueo de pantalla al irse a segundo plano.
        // Sin volver a pedirlo, el celular se apagaría a los dos minutos y los
        // avisos no se verían — que es justo lo que veníamos a arreglar.
        mantenerPantallaEncendida();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
