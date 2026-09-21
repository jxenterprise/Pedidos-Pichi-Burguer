/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/panel.js
   ----------------------------------------------------------------------------
   QUÉ CONTIENE: el comportamiento del panel del vendedor (panel.html).

   BLOQUES DE ESTE ARCHIVO:
     0. Ventana de confirmar (reemplaza el confirm() del navegador)
     1. Acceso con clave
     2. Carga y refresco de los pedidos
     3. Dibujo de cada tarjeta de pedido
     3bis. Avisos: campana, notificación y pantalla encendida
     3ter. Cuánto lleva esperando cada pedido
     3quater. Buscador y modo cocina
     4. Acciones: entregado, borrar un pedido, borrar historial, salir
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
     0) VENTANA DE CONFIRMAR — reemplaza el confirm() del navegador
     --------------------------------------------------------------------------
     POR QUÉ EXISTE: las preguntas de "¿seguro?" las hacía confirm(), que es el
     cuadro gris del propio Chrome. Tiene tres problemas de verdad, no de gusto:
       · Se ve como una alerta de sistema, no como esta página. El vendedor
         pasa de una web negra y roja a un cuadro blanco de Windows.
       · No se puede dar formato: el turno y el nombre del cliente, que son
         justo lo que hay que leer antes de borrar, salen en texto plano.
       · Algunos navegadores lo bloquean si se llama desde ciertos contextos,
         y entonces la acción se ejecuta sola o no se ejecuta nunca.
     ⚠ REGLA DEL PROYECTO (JX, 21 de sept. de 2026): en este sitio NO se vuelve
     a usar confirm(), alert() ni prompt() del navegador. Toda pregunta pasa por
     esta ventana. Si hace falta una nueva, se llama a confirmar(), no se
     inventa otra.

     CÓMO SE USA:
       confirmar({
         titulo:    '¿Seguro que quieres eliminar?',
         resaltado: 'Turno 4 — Andrés',        // lo que hay que leer antes de dar clic
         texto:     'Se borra para siempre.',
         detalle:   'El número de turno NO se vuelve a usar.',
         ok:        'Sí, borrar',
         peligro:   true
       }).then(function (siOno) { if (siOno) { ... } });

     ⚠ TODOS los campos se pintan con textContent, NUNCA con innerHTML, y eso es
     a propósito. Por aquí pasa el nombre que escribió el cliente, que es texto
     de fuera: con innerHTML, un nombre como <img onerror=...> se ejecutaría en
     el navegador del vendedor, que es justo quien tiene la sesión del panel
     abierta. Al ser textContent no hay nada que escapar ni que recordar
     escapar — es seguro por construcción. Por eso el turno y el nombre van en
     su propio campo "resaltado" en vez de armar HTML a mano.
     ========================================================================== */

  /* Lo que puede recibir el foco dentro de la ventana. Va como LISTA y no como
     un solo texto con comas: en CSS "#modalConfirmar button, [href]" significa
     "los botones DE la ventana y TODOS los enlaces de la página", así que el
     prefijo hay que pegárselo a cada selector por separado. Mismo tropiezo que
     ya se documentó en la ventana del pedido (decisión 17). */
  var CONF_ENFOCABLES = ['button:not([disabled])', '[href]', '[tabindex]:not([tabindex="-1"])'];
  var CONF_SELECTOR = CONF_ENFOCABLES.map(function (x) {
    return '#modalConfirmar ' + x;
  }).join(', ');

  var confResolver = null;      // la función que desbloquea la promesa
  var confQuienAbrio = null;    // a quién se le devuelve el foco al cerrar

  /**
   * Abre la ventana y devuelve una promesa con true (aceptó) o false (canceló).
   * Nunca se rechaza: cancelar no es un error, es una respuesta.
   */
  function confirmar(opciones) {
    var o = opciones || {};
    var caja = $('#modalConfirmar');

    // Si ya había una pregunta abierta se responde que no antes de abrir otra,
    // para no dejar una promesa colgada para siempre esperando un clic que
    // nunca va a llegar.
    if (confResolver) { responderConfirmar(false); }

    $('#confIcono').textContent     = o.icono || '🗑';
    $('#confTitulo').textContent    = o.titulo || '¿Seguro que quieres eliminar?';
    $('#confResaltado').textContent = o.resaltado || '';
    $('#confResaltado').hidden      = !o.resaltado;
    $('#confTexto').textContent     = o.texto || '';
    $('#confTexto').hidden          = !o.texto;
    $('#confDetalle').textContent   = o.detalle || '';
    $('#confDetalle').hidden        = !o.detalle;

    var botonOk = $('#confOk');
    botonOk.textContent = o.ok || 'Sí, borrar';
    // El botón que hace el daño va en rojo; el de una acción normal, en
    // amarillo. Son las dos variantes que ya existen en el sitio: aquí no se
    // inventa un color nuevo.
    botonOk.className = 'btn ' + (o.peligro === false ? 'btn--ama' : 'btn--rojo');
    $('#confCancelar').textContent = o.cancelar || 'Cancelar';

    confQuienAbrio = document.activeElement;
    caja.classList.add('abierto');
    document.body.style.overflow = 'hidden';   // sin scroll de fondo en iOS
    document.addEventListener('keydown', confTeclado, true);

    /* ⚠ El foco arranca en CANCELAR, no en el botón rojo. Si arrancara en el
       rojo, un Enter de más —el mismo que acaba de pulsar el vendedor para
       otra cosa— borraría el pedido sin que alcance a leer de quién era. */
    $('#confCancelar').focus();

    return new Promise(function (resolver) { confResolver = resolver; });
  }

  /** Cierra la ventana y entrega la respuesta a quien esté esperando. */
  function responderConfirmar(respuesta) {
    var pendiente = confResolver;
    confResolver = null;
    $('#modalConfirmar').classList.remove('abierto');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', confTeclado, true);
    if (confQuienAbrio && document.body.contains(confQuienAbrio)) {
      confQuienAbrio.focus();
    }
    confQuienAbrio = null;
    if (pendiente) { pendiente(respuesta); }
  }

  /**
   * Escape cancela y el tabulador no se sale de la ventana.
   * POR QUÉ el encierro: la ventana se anuncia como aria-modal="true", o sea
   * "detrás de mí no hay nada". Sin encerrar el foco eso es mentira y quien
   * usa teclado se va a la lista de pedidos de atrás sin saber que la pregunta
   * sigue abierta — y ahí ya no hay forma de responderla.
   * Se escucha en fase de captura (true) para llegar antes que el atajo de
   * Escape del modo cocina, que si no cerraría los dos a la vez.
   */
  function confTeclado(e) {
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      responderConfirmar(false);
      return;
    }
    if (e.key !== 'Tab') { return; }
    var lista = Array.prototype.slice.call(document.querySelectorAll(CONF_SELECTOR))
      .filter(function (el) { return el.getClientRects().length > 0; });
    if (!lista.length) { return; }
    var primero = lista[0], ultimo = lista[lista.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primero.focus();
    } else if (!$('#modalConfirmar').contains(document.activeElement)) {
      e.preventDefault(); primero.focus();
    }
  }



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
    // Devuelve la promesa para que "Actualizar" pueda esperar el resultado y
    // decirle al vendedor qué encontró.
    return window.Almacen.listarPedidos(clave).then(function (datos) {
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

      // Al repintar las listas se pierde el filtro y la copia del modo cocina:
      // hay que rehacerlos o el vendedor vería aparecer pedidos que había
      // filtrado, o una tarjeta vieja en la pantalla grande.
      filtrarPedidos();
      if (document.body.classList.contains('modo-cocina')) { pintarCocina(); }

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

      return datos;

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

  /**
   * "Actualizar" a mano.
   * SÍ funcionaba antes: volvía a preguntarle al servidor. El problema era que
   * no se notaba — si no había pedidos nuevos la pantalla quedaba idéntica y
   * parecía que el botón estaba roto. Ahora se bloquea mientras consulta y
   * después dice en voz alta qué encontró, aunque la respuesta sea "nada".
   * Un botón que no da señal de vida es un botón en el que nadie confía.
   */
  function refrescarAMano() {
    var b = $('#btnRefrescar');
    var antes = Object.keys(idsConocidos).length;
    b.disabled = true;
    b.textContent = 'Buscando…';

    cargarPedidos(false).then(function (datos) {
      var nuevos = datos ? datos.activos.filter(function (p) { return !idsConocidos[p.id]; }).length : 0;
      // idsConocidos ya lo actualizó cargarPedidos, así que se compara el total.
      var total = Object.keys(idsConocidos).length;
      if (total > antes) {
        var n = total - antes;
        avisar(n === 1 ? 'Llegó 1 pedido que no estaba' : 'Llegaron ' + n + ' pedidos que no estaban');
      } else if (datos) {
        var p = datos.activos.filter(function (x) { return !x.entregado; }).length;
        avisar(p === 0 ? 'Lista al día · no hay pedidos por entregar'
                       : 'Lista al día · ' + p + (p === 1 ? ' pedido por entregar' : ' pedidos por entregar'));
      }
    }).catch(function () {
      // El aviso de error ya lo puso cargarPedidos; aquí no se repite.
    }).then(function () {
      b.disabled = false;
      b.textContent = 'Actualizar';
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

  /* ==========================================================================
     3ter) CUÁNTO LLEVA ESPERANDO
     Qué hace: cada tarjeta dice "hace 3 min" y se va poniendo naranja y luego
     roja según pasa el tiempo.
     Por qué: la hora de entrada ya estaba, pero nadie está restando en la
     cabeza mientras atiende. Con el color, el vendedor ve cuál se está
     demorando ANTES de que el cliente venga a reclamar.
     Los cortes salen de la experiencia del local, no de un número bonito: a los
     15 minutos un cliente empieza a mirar el reloj, a los 25 ya está molesto.
     ========================================================================== */

  var MIN_AVISO = 15;    // naranja
  var MIN_TARDE = 25;    // rojo

  /** Minutos enteros desde que entró el pedido. */
  function minutosDesde(ms) {
    return Math.max(0, Math.floor((Date.now() - ms) / 60000));
  }

  /** "recién", "hace 3 min", "hace 1 h 5 min". */
  function haceCuanto(min) {
    if (min < 1) { return 'recién'; }
    if (min < 60) { return 'hace ' + min + ' min'; }
    var h = Math.floor(min / 60), m = min % 60;
    return 'hace ' + h + ' h' + (m ? ' ' + m + ' min' : '');
  }

  /** Qué color le toca según lo que lleva esperando. */
  function claseEspera(min) {
    if (min >= MIN_TARDE) { return 'espera--tarde'; }
    if (min >= MIN_AVISO) { return 'espera--aviso'; }
    return '';
  }

  /**
   * Repinta los relojes de todas las tarjetas, sin volver a pedir nada al
   * servidor. Corre cada 20 segundos: el minuto tiene que cambiar solo, o el
   * vendedor vería "hace 3 min" durante un cuarto de hora.
   */
  function refrescarEsperas() {
    var ahora = Date.now();
    Array.prototype.forEach.call(document.querySelectorAll('[data-creado]'), function (el) {
      var min = Math.max(0, Math.floor((ahora - parseInt(el.getAttribute('data-creado'), 10)) / 60000));
      el.textContent = haceCuanto(min);
      el.className = 'espera ' + claseEspera(min);
    });
  }


  /** Construye la tarjeta de un pedido. */
  function tarjeta(p, esHistorial) {
    var art = document.createElement('article');
    var enPlancha = !p.entregado && p.estado === 'preparando';
    art.className = 'pedido' + (p.entregado ? ' entregado' : '') + (esHistorial ? ' viejo' : '') +
                    (enPlancha ? ' en-plancha' : '');
    art.setAttribute('data-id', p.id);
    // Se guarda en el elemento lo que necesita el buscador, para no recorrer el
    // pedido entero en cada tecla.
    art.setAttribute('data-busca', ((p.nombre || '') + ' ' + p.turno + ' ' + (p.numero || '') + ' ' + (p.telefono || '')).toLowerCase());

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

    // Cuánto lleva esperando. Solo en los activos: en el historial ya no
    // significa nada y solo confundiría con un "hace 6 horas" en rojo.
    quien.append(h3, meta);
    if (!esHistorial && !p.entregado) {
      var min = minutosDesde(p.creado);
      var esp = document.createElement('span');
      esp.className = 'espera ' + claseEspera(min);
      esp.setAttribute('data-creado', p.creado);   // lo usa refrescarEsperas()
      esp.textContent = haceCuanto(min);
      quien.appendChild(esp);
    }

    // Aquí iba la etiqueta "Domicilio / Recoge". El local dejó de hacer
    // domicilios (sept. 2026): todos los pedidos son para recoger, así que la
    // etiqueta decía siempre lo mismo y solo apretaba la tarjeta en un celular.
    cab.append(turno, quien);
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

    // "Avisar listo" y no "WhatsApp": el vendedor no necesita un botón que abra
    // un chat en blanco, necesita uno que mande EL mensaje. El texto ya va
    // escrito con el nombre y el turno, así que es un toque y enviar.
    // Para un pedido ya entregado no tiene sentido avisar que está listo, así
    // que ahí el mensaje cambia a uno neutro de agradecimiento.
    var wa = document.createElement('a');
    wa.className = 'btn ' + (p.entregado ? 'btn--linea' : 'btn--ama');
    wa.href = 'https://wa.me/57' + tel + '?text=' + encodeURIComponent(
      p.entregado
        ? 'Hola ' + p.nombre + ', gracias por tu pedido en Pichi Burguer. ¡Te esperamos pronto!'
        : '¡Hola ' + p.nombre + '! Tu pedido de Pichi Burguer ya está listo 🍔\n' +
          'Turno ' + p.turno + ' · puedes pasar a recogerlo cuando quieras.\n' +
          'Cra 58A #6, Bernardo Jaramillo.'
    );
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.textContent = p.entregado ? 'WhatsApp' : 'Avisar listo';
    pie.appendChild(wa);

    if (!p.entregado) {
      // "Empezar" va ANTES de "Entregado": es el orden real de la cocina, y así
      // el dedo encuentra primero el botón que se usa primero.
      var emp = document.createElement('button');
      emp.type = 'button';
      emp.className = 'btn ' + (enPlancha ? 'btn--ama' : 'btn--linea');
      // Texto corto a propósito: "En la plancha" se partía en dos líneas a 390px
      // y deformaba toda la fila de botones. "En plancha" dice lo mismo y cabe
      // de una línea hasta en un celular de 320px.
      emp.textContent = enPlancha ? '🔥 En plancha' : 'Empezar';
      emp.title = enPlancha ? 'Quitarlo de la plancha' : 'Marcar que ya se está preparando';
      emp.addEventListener('click', function () {
        cambiarEstadoPedido(p, enPlancha ? 'nuevo' : 'preparando', emp);
      });
      pie.appendChild(emp);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--rojo';
      btn.textContent = 'Entregado';
      btn.addEventListener('click', function () { marcarEntregado(p, btn); });
      pie.appendChild(btn);
    } else {
      var ok = document.createElement('span');
      ok.className = 'pedido__ok';
      ok.textContent = '✓ Entregado';
      pie.appendChild(ok);

      // Deshacer. El panel lo ofrece siempre en el historial y en los activos:
      // "Entregado" está pegado a otros botones y se toca por error. Sin esto,
      // el único arreglo era borrar el pedido y perder el registro.
      var des = document.createElement('button');
      des.type = 'button';
      des.className = 'btn btn--linea';
      des.textContent = 'Deshacer';
      des.title = 'Volver a marcarlo como pendiente';
      des.addEventListener('click', function () { deshacerEntregado(p, des); });
      pie.appendChild(des);
    }

    // Imprimir la comanda para la cocina. El CSS de impresión ya existía desde
    // la entrega inicial; solo faltaba de dónde dispararlo.
    var imp = document.createElement('button');
    imp.type = 'button';
    imp.className = 'pedido__imprimir';
    imp.title = 'Imprimir esta comanda';
    imp.setAttribute('aria-label', 'Imprimir la comanda del turno ' + p.turno);
    imp.textContent = '🖨';
    imp.addEventListener('click', function () { imprimirComanda(art); });
    pie.appendChild(imp);

    // Borrar este pedido. Va de último y con aspecto de icono, no de botón
    // grande: el dedo tiene que caer antes en "Entregado", que es la acción de
    // todos los días. Borrar no tiene vuelta atrás, así que no compite por el
    // mismo espacio visual.
    var borrar = document.createElement('button');
    borrar.type = 'button';
    borrar.className = 'pedido__borrar';
    // Icono + palabra. Solo con el icono no se entendía qué hacía, y con el
    // color gris de antes ni se veía. En pantallas muy angostas el CSS esconde
    // la palabra y deja el icono, pero el color fuerte se queda.
    var bIcono = document.createElement('span'); bIcono.textContent = '🗑'; bIcono.setAttribute('aria-hidden','true');
    var bTxt = document.createElement('span'); bTxt.className = 'pedido__borrar-txt'; bTxt.textContent = 'Borrar';
    borrar.append(bIcono, bTxt);
    borrar.title = 'Borrar este pedido';
    borrar.setAttribute('aria-label', 'Borrar el pedido del turno ' + p.turno + ' de ' + p.nombre);
    borrar.addEventListener('click', function () { borrarPedido(p, borrar); });
    pie.appendChild(borrar);

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

  /* Cuántas veces se repite la campana y cada cuánto.
     ⚠ CINCO REPETICIONES Y MÁS VOLUMEN, pedido por JX después de usar el panel
     en el local: una sola vez se perdía entre el ruido de la freidora y la
     gente, y tres seguían quedándose cortas. Cinco veces a 0.6 sí se oye y el
     vendedor voltea a mirar.
     ⚠ El volumen NO se sube a 1.0: el sonido se satura y suena roto en el
     parlante de un celular, que es donde va a sonar. 0.6 es fuerte y limpio.
     0,9 s entre una y otra: menos suena a alarma de carro; más y parece que
     entraron tres pedidos distintos. */
  var CAMPANA_VECES = 5;
  var CAMPANA_VOLUMEN = 0.6;   // antes 0.35: se perdía con el ruido del local
  var CAMPANA_PAUSA = 0.9;

  /**
   * Toca la campana: tres notas cortas, repetidas cinco veces.
   * Se genera con el propio navegador en vez de bajar un archivo de sonido:
   * así no hay que esperar a que cargue, funciona sin internet y no se suma un
   * archivo más al proyecto.
   * Las repeticiones se programan TODAS de una con el reloj del audio, no con
   * setTimeout: el reloj de audio no se desordena aunque el celular esté
   * ocupado, y un setTimeout sí puede llegar tarde o no llegar.
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
      for (var v = 0; v < CAMPANA_VECES; v++) {
        var inicio = t0 + v * CAMPANA_PAUSA;
        [880, 1174.7, 1568].forEach(function (hz, i) {
          var osc = audio.createOscillator();
          var vol = audio.createGain();
          osc.type = 'sine';
          osc.frequency.value = hz;
          var t = inicio + i * 0.15;
          vol.gain.setValueAtTime(0.0001, t);
          vol.gain.linearRampToValueAtTime(CAMPANA_VOLUMEN, t + 0.02);   // ataque rápido
          vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
          osc.connect(vol); vol.connect(audio.destination);
          osc.start(t); osc.stop(t + 0.6);
        });
      }
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
     3quater) BUSCAR Y MODO COCINA
     ========================================================================== */

  /**
   * Buscador.
   * Filtra las tarjetas que ya están en pantalla, sin pedirle nada al servidor:
   * con 15 tarjetas y un cliente llamando "soy Andrés", esperar una consulta
   * sería peor que bajar buscando.
   * Se busca por nombre, turno, número de pedido y celular, todo junto, porque
   * el vendedor no sabe de antemano cuál de los cuatro le va a decir el cliente.
   */
  function filtrarPedidos() {
    var q = ($('#campoBuscar').value || '').trim().toLowerCase();
    var listas = [$('#listaActivos'), $('#listaHistorial')];
    var hallados = 0, hay = 0;

    listas.forEach(function (lista) {
      Array.prototype.forEach.call(lista.querySelectorAll('.pedido'), function (t) {
        hay++;
        var coincide = !q || (t.getAttribute('data-busca') || '').indexOf(q) !== -1;
        t.hidden = !coincide;
        if (coincide) { hallados++; }
      });
    });

    var aviso = $('#buscarNada');
    aviso.hidden = !(q && hallados === 0 && hay > 0);
    $('#btnLimpiarBuscar').hidden = !q;
  }

  function limpiarBusqueda() {
    $('#campoBuscar').value = '';
    filtrarPedidos();
    $('#campoBuscar').focus();
  }

  /**
   * MODO COCINA: un pedido a la vez, en letra grande.
   * Para quién: el que está en la plancha con las manos ocupadas y el celular a
   * un metro. Leer letra chiquita entre seis tarjetas desde allá no se puede.
   * Qué muestra: solo los pedidos SIN entregar, en orden de turno. Los ya
   * entregados no tienen nada que hacer en la plancha.
   */
  var cocinaIndice = 0;

  function pedidosDeCocina() {
    return Array.prototype.slice.call(
      $('#listaActivos').querySelectorAll('.pedido:not(.entregado)')
    );
  }

  function abrirCocina() {
    if (!pedidosDeCocina().length) { avisar('No hay pedidos por preparar'); return; }
    cocinaIndice = 0;
    document.body.classList.add('modo-cocina');
    $('#cocina').hidden = false;
    pintarCocina();
  }

  function cerrarCocina() {
    document.body.classList.remove('modo-cocina');
    $('#cocina').hidden = true;
  }

  function moverCocina(paso) {
    var lista = pedidosDeCocina();
    if (!lista.length) { cerrarCocina(); return; }
    cocinaIndice = (cocinaIndice + paso + lista.length) % lista.length;
    pintarCocina();
  }

  /** Copia la tarjeta que toca dentro de la pantalla grande. */
  function pintarCocina() {
    var lista = pedidosDeCocina();
    if (!lista.length) {
      avisar('Ya no quedan pedidos por preparar');
      cerrarCocina();
      return;
    }
    if (cocinaIndice >= lista.length) { cocinaIndice = 0; }

    var caja = $('#cocinaTarjeta');
    caja.innerHTML = '';
    // Se clona la tarjeta en vez de volver a construirla: así el modo cocina
    // nunca se queda atrás cuando se le agregue algo a la tarjeta normal.
    var copia = lista[cocinaIndice].cloneNode(true);
    copia.hidden = false;
    // Los botones de la copia no funcionan (no tienen sus escuchadores), así
    // que se quitan en vez de dejar botones muertos que el vendedor va a tocar.
    Array.prototype.forEach.call(copia.querySelectorAll('.pedido__pie'), function (e) { e.remove(); });
    caja.appendChild(copia);
    $('#cocinaPos').textContent = (cocinaIndice + 1) + ' de ' + lista.length;
  }


  /* ==========================================================================
     4) ACCIONES DEL VENDEDOR
     ========================================================================== */

  /** Marca un pedido como entregado y ofrece deshacerlo unos segundos. */
  function marcarEntregado(p, boton) {
    boton.disabled = true;
    boton.textContent = 'Guardando…';
    window.Almacen.marcarEntregado(p.id, clave).then(function () {
      // El aviso lleva su propio botón de deshacer: si se tocó por error, el
      // arreglo está justo ahí y no hay que ir a buscarlo.
      avisarConDeshacer('Turno ' + p.turno + ' entregado', function () {
        window.Almacen.deshacerEntregado(p.id, clave).then(function () {
          avisar('Turno ' + p.turno + ' volvió a pendientes');
          cargarPedidos(false);
        }).catch(function (e) { avisar('No se pudo deshacer: ' + e.message); });
      });
      cargarPedidos(false);
    }).catch(function (err) {
      avisar('No se pudo guardar: ' + err.message);
      boton.disabled = false;
      boton.textContent = 'Entregado';
    });
  }

  /** Deshace un "entregado" desde la tarjeta (no desde el aviso). */
  function deshacerEntregado(p, boton) {
    boton.disabled = true;
    boton.textContent = 'Volviendo…';
    window.Almacen.deshacerEntregado(p.id, clave).then(function () {
      avisar('Turno ' + p.turno + ' volvió a pendientes');
      cargarPedidos(false);
    }).catch(function (err) {
      avisar('No se pudo deshacer: ' + err.message);
      boton.disabled = false;
      boton.textContent = 'Deshacer';
    });
  }

  /** Pone o quita un pedido de la plancha. */
  function cambiarEstadoPedido(p, estado, boton) {
    boton.disabled = true;
    boton.textContent = '…';
    window.Almacen.cambiarEstado(p.id, estado, clave).then(function () {
      avisar(estado === 'preparando'
        ? 'Turno ' + p.turno + ' en la plancha'
        : 'Turno ' + p.turno + ' vuelve a la cola');
      cargarPedidos(false);
    }).catch(function (err) {
      avisar('No se pudo guardar: ' + err.message);
      boton.disabled = false;
      boton.textContent = estado === 'preparando' ? 'Empezar' : '🔥 En plancha';
    });
  }

  /**
   * Imprime UNA comanda.
   * Cómo: se le pone una marca a la tarjeta escogida y el CSS de impresión
   * esconde todo lo demás. Así no hace falta abrir otra ventana ni armar un
   * documento aparte — y el papel sale con el mismo diseño que ya se probó.
   */
  function imprimirComanda(tarjeta) {
    var antes = document.querySelector('.pedido.imprimiendo');
    if (antes) { antes.classList.remove('imprimiendo'); }
    tarjeta.classList.add('imprimiendo');
    document.body.classList.add('imprimiendo-una');
    window.print();
    // Se limpia después de imprimir. El navegador no siempre avisa cuándo
    // terminó, así que se hace en el siguiente ciclo y no se depende de eso.
    setTimeout(function () {
      tarjeta.classList.remove('imprimiendo');
      document.body.classList.remove('imprimiendo-una');
    }, 500);
  }

  /**
   * Borra un pedido suelto.
   * La confirmación dice el turno Y el nombre a propósito: en una lista de
   * tarjetas parecidas, un "¿seguro?" pelado no evita que se borre la
   * equivocada. Así el vendedor lee a quién va a borrar antes de aceptar.
   */
  function borrarPedido(p, boton) {
    confirmar({
      icono:     '🗑',
      titulo:    '¿Seguro que quieres eliminar?',
      resaltado: 'Turno ' + p.turno + ' — ' + p.nombre,
      texto:     'Se borra para siempre y no se puede deshacer.',
      detalle:   'El número de turno NO se vuelve a usar: el siguiente cliente recibirá el que sigue, no este.',
      ok:        'Sí, borrar'
    }).then(function (siOno) {
      if (!siOno) { return; }
      boton.disabled = true;
      window.Almacen.borrarPedido(p.id, clave).then(function () {
        avisar('Pedido del turno ' + p.turno + ' borrado');
        cargarPedidos(false);
      }).catch(function (err) {
        avisar('No se pudo borrar: ' + err.message);
        boton.disabled = false;
      });
    });
  }

  /** Borra el historial a mano. Pide confirmación: la acción no tiene vuelta. */
  function borrarHistorial() {
    var n = $('#nHistorial') ? $('#nHistorial').textContent : '';
    confirmar({
      icono:     '🗑',
      titulo:    '¿Seguro que quieres eliminar?',
      resaltado: 'Todo el historial' + (n ? ' · ' + n + ' pedidos' : ''),
      texto:     'Los pedidos de las últimas ' + CFG.sistema.horasEnPanelActivo +
                 ' horas NO se borran: siguen en la pestaña Activos.',
      detalle:   'Esta acción no se puede deshacer.',
      ok:        'Sí, borrar el historial'
    }).then(function (siOno) {
      if (!siOno) { return; }
      window.Almacen.borrarHistorial(clave).then(function () {
        avisar('Historial borrado');
        idsConocidos = {};
        cargarPedidos(true);
      }).catch(function (err) {
        avisar('No se pudo borrar: ' + err.message);
      });
    });
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

  /**
   * Aviso con botón de deshacer, que dura más.
   * 10 segundos y no 3: el vendedor tiene que darse cuenta del error, leer y
   * alcanzar a tocar. Tres segundos no alcanzan ni para lo primero.
   */
  function avisarConDeshacer(texto, alDeshacer) {
    var caja = $('#avisoFlotante');
    caja.textContent = texto + ' ';
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'aviso-flot__deshacer';
    b.textContent = 'Deshacer';
    b.addEventListener('click', function () {
      caja.classList.remove('visible');
      if (tiempoAviso) { clearTimeout(tiempoAviso); }
      alDeshacer();
    });
    caja.appendChild(b);
    caja.classList.add('visible');
    if (tiempoAviso) { clearTimeout(tiempoAviso); }
    tiempoAviso = setTimeout(function () { caja.classList.remove('visible'); }, 10000);
  }


  /* ==========================================================================
     5) ARRANQUE
     ========================================================================== */
  function iniciar() {
    $('#anio').textContent = new Date().getFullYear();

    $('#formAcceso').addEventListener('submit', intentarEntrar);
    $('#tabActivos').addEventListener('click', function () { cambiarPestana('activos'); });
    $('#tabHistorial').addEventListener('click', function () { cambiarPestana('historial'); });
    $('#btnRefrescar').addEventListener('click', refrescarAMano);
    $('#btnBorrarHistorial').addEventListener('click', borrarHistorial);
    $('#btnSalir').addEventListener('click', cerrarSesion);
    $('#btnAvisos').addEventListener('click', alternarAvisos);
    pintarBotonAvisos();

    /* Ventana de confirmar. El clic en el fondo cancela, igual que la ventana
       del pedido del cliente: es el gesto que ya espera cualquiera. Se compara
       con e.target para que un clic DENTRO de la caja no cierre nada. */
    $('#confOk').addEventListener('click', function () { responderConfirmar(true); });
    $('#confCancelar').addEventListener('click', function () { responderConfirmar(false); });
    $('#modalConfirmar').addEventListener('click', function (e) {
      if (e.target === this) { responderConfirmar(false); }
    });

    $('#campoBuscar').addEventListener('input', filtrarPedidos);
    $('#btnLimpiarBuscar').addEventListener('click', limpiarBusqueda);
    $('#btnCocina').addEventListener('click', abrirCocina);
    $('#cocinaCerrar').addEventListener('click', cerrarCocina);
    $('#cocinaAnterior').addEventListener('click', function () { moverCocina(-1); });
    $('#cocinaSiguiente').addEventListener('click', function () { moverCocina(1); });
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('modo-cocina')) { return; }
      if (e.key === 'Escape') { cerrarCocina(); }
      if (e.key === 'ArrowRight') { moverCocina(1); }
      if (e.key === 'ArrowLeft') { moverCocina(-1); }
    });

    // Los relojes de espera se repintan solos cada 20 segundos. Sin esto, el
    // vendedor vería "hace 3 min" durante un cuarto de hora.
    setInterval(refrescarEsperas, 20000);

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
