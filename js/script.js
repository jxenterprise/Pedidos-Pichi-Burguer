/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/script.js
   ----------------------------------------------------------------------------
   QUÉ CONTIENE: todo el comportamiento de la página del cliente (index.html).

   BLOQUES DE ESTE ARCHIVO:
     1. Semáforo abierto / cerrado
     2. Tabla de horarios
     3. Carrito de compras
     4. Ventana del pedido (formulario, envío y turno)
     5. Mensaje de WhatsApp (el respaldo del sistema)
     6. Barra de categorías
     7. Cookies, Google Analytics y mapa
     8. Arranque

   DEPENDE DE: js/config.js y js/almacen.js, que deben cargarse ANTES.
   NO TOCA: el menú ni los precios — esos viven escritos en index.html y este
   archivo solo los lee de los atributos data-nombre y data-precio.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.PICHI_CONFIG;
  var $  = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* Formato de precio colombiano: $16.000 con puntos de miles y sin decimales.
     Se usa Intl para que salga igual en todos los navegadores y celulares. */
  var formatoPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  });
  /* El menú escribe $16.000 sin espacio; el carrito, el WhatsApp y el panel
     tienen que escribirlo IGUAL. Intl mete un espacio fino entre el signo y el
     número, así que se quita del todo: antes se cambiaba por un espacio normal
     y quedaba "$ 16.000", distinto de lo que dice la tarjeta del plato. */
  function pesos(n) { return formatoPeso.format(n).replace(/\s/g, ''); }


  /* ==========================================================================
     1) SEMÁFORO ABIERTO / CERRADO
     Qué hace: compara la hora actual de Colombia con el horario de config.js y
     enciende la luz verde o roja, arriba y en la portada.
     Por qué importa: es la función central del sistema. Si el local está
     cerrado, NO se pueden mandar pedidos — así el vendedor no se encuentra con
     pedidos de madrugada que nadie va a preparar.
     Se vuelve a calcular cada minuto para que la página no se quede "abierta"
     si alguien la deja puesta y pasa la hora de cierre.
     ========================================================================== */

  /** Convierte "18:00" a minutos desde medianoche (1080). Facilita comparar. */
  function aMinutos(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  /** Convierte 1080 minutos a "6:00 p. m.", que es como se lee en Colombia. */
  function aTexto12h(minutos) {
    var h = Math.floor(minutos / 60), m = minutos % 60;
    // \u00A0 es el espacio duro. Sin él, en un celular angosto la hora se parte
    // en dos líneas y queda "11:00 p." arriba y "m." abajo.
    var sufijo = h < 12 ? 'a.\u00A0m.' : 'p.\u00A0m.';
    var h12 = h % 12; if (h12 === 0) { h12 = 12; }
    return h12 + ':' + String(m).padStart(2, '0') + '\u00A0' + sufijo;
  }

  /**
   * Calcula el estado del local en este momento.
   * @returns {{abierto:boolean, aceptaPedidos:boolean, texto:string, textoLargo:string}}
   *   abierto        → el local está atendiendo
   *   aceptaPedidos  → además queda tiempo para preparar (ver minutosAntesDelCierre)
   */
  function calcularEstado() {
    var ahora = window.Almacen.ahoraColombia();
    var hoy = CFG.horarios.dias[ahora.diaSemana];
    var minutosAhora = ahora.hora * 60 + ahora.minuto;

    // Día marcado como cerrado en la configuración.
    if (!hoy || hoy.cerrado) {
      return {
        abierto: false, aceptaPedidos: false,
        texto: 'Cerrado hoy',
        textoLargo: 'Hoy no abrimos. Puedes ver el menú y volver otro día.'
      };
    }

    var abre = aMinutos(hoy.abre);
    var cierra = aMinutos(hoy.cierra);

    // Si el cierre es menor que la apertura, el turno cruza la medianoche
    // (por ejemplo 18:00 a 01:00). Se suman 24 horas para poder compararlo.
    var cruzaMedianoche = cierra <= abre;
    var minutosCorregidos = (cruzaMedianoche && minutosAhora < abre) ? minutosAhora + 1440 : minutosAhora;
    var cierreCorregido = cruzaMedianoche ? cierra + 1440 : cierra;

    var abierto = minutosCorregidos >= abre && minutosCorregidos < cierreCorregido;
    // Se deja de recibir pedidos unos minutos antes del cierre: si alguien pide
    // a las 22:59 no da tiempo de prepararlo.
    var limitePedidos = cierreCorregido - CFG.horarios.minutosAntesDelCierre;
    var aceptaPedidos = abierto && minutosCorregidos < limitePedidos;

    if (abierto && !aceptaPedidos) {
      return {
        abierto: true, aceptaPedidos: false,
        texto: 'Cerrando',
        textoLargo: 'Ya no se reciben pedidos nuevos: cerramos a las ' + aTexto12h(cierra)
      };
    }
    if (abierto) {
      return {
        abierto: true, aceptaPedidos: true,
        texto: 'Abierto ahora',
        textoLargo: 'Abierto ahora · cerramos a las ' + aTexto12h(cierra)
      };
    }
    if (minutosAhora < abre) {
      return {
        abierto: false, aceptaPedidos: false,
        texto: 'Cerrado',
        textoLargo: 'Cerrado ahora. Abrimos hoy a las ' + aTexto12h(abre)
      };
    }
    // Ya pasó la hora de cierre: se busca el próximo día que sí abra.
    var siguiente = null;
    for (var i = 1; i <= 7; i++) {
      var d = CFG.horarios.dias[(ahora.diaSemana + i) % 7];
      if (d && !d.cerrado) { siguiente = d; break; }
    }
    return {
      abierto: false, aceptaPedidos: false,
      texto: 'Cerrado',
      textoLargo: siguiente
        ? 'Cerrado por hoy. Volvemos el ' + siguiente.nombre.toLowerCase() + ' a las ' + aTexto12h(aMinutos(siguiente.abre))
        : 'Cerrado por hoy.'
    };
  }

  /** Pinta el estado en la barra de arriba y en la portada. */
  function pintarEstado() {
    var e = calcularEstado();
    var clase = e.abierto ? 'esta-abierto' : 'esta-cerrado';

    var barra = $('#estadoBarra');
    barra.className = 'estado ' + clase;
    $('#estadoBarraTexto').textContent = e.texto;

    var aviso = $('#avisoEstado');
    aviso.className = 'aviso-estado ' + clase;
    $('#avisoEstadoTexto').textContent = e.textoLargo;

    // Se guarda para que el botón de pedir sepa si puede abrir la ventana.
    estadoActual = e;
    actualizarBotonPedir();
  }

  var estadoActual = { aceptaPedidos: false };


  /* ==========================================================================
     2) TABLA DE HORARIOS
     Qué hace: resalta la fila del día de hoy y rellena las horas de los días ya
     confirmados en config.js.
     Por qué: los días sin confirmar conservan su marcador {POR CONFIRMAR}
     escrito en el HTML. Nunca se rellena con un horario inventado.
     ========================================================================== */
  function pintarHorarios() {
    var hoy = window.Almacen.ahoraColombia().diaSemana;

    $$('#tablaHorario tr').forEach(function (fila) {
      var dia = parseInt(fila.getAttribute('data-dia'), 10);
      var cfg = CFG.horarios.dias[dia];
      if (dia === hoy) { fila.classList.add('hoy'); }
      if (!cfg) { return; }

      var celda = fila.querySelector('td');
      if (cfg.cerrado) {
        celda.textContent = 'Cerrado';
      } else if (cfg.confirmado) {
        celda.textContent = aTexto12h(aMinutos(cfg.abre)) + ' – ' + aTexto12h(aMinutos(cfg.cierra));
      }
      // Si no está confirmado, se deja el {POR CONFIRMAR} que trae el HTML.
    });
  }


  /* ==========================================================================
     3) CARRITO DE COMPRAS
     Qué hace: guarda lo que el cliente va escogiendo y calcula el total.
     Cómo lee los productos: de los atributos data-nombre y data-precio del
     botón "Agregar" de cada plato. Así, cambiar un precio en el HTML lo cambia
     también en el carrito, sin tocar este archivo.
     Dónde vive: solo en memoria. No se guarda entre visitas a propósito: un
     carrito de ayer con precios viejos causa más problemas de los que resuelve.
     ========================================================================== */

  var carrito = {};   // { idPlato: { nombre, precio, cantidad, elemento } }

  /** Suma el total en pesos de todo lo que hay en el carrito. */
  function totalCarrito() {
    return Object.keys(carrito).reduce(function (s, id) {
      return s + carrito[id].precio * carrito[id].cantidad;
    }, 0);
  }

  /** Cuenta cuántas unidades hay en total (no cuántos platos distintos). */
  function unidadesCarrito() {
    return Object.keys(carrito).reduce(function (s, id) { return s + carrito[id].cantidad; }, 0);
  }

  /**
   * Cambia la cantidad de un plato.
   * @param {HTMLElement} plato  el <article class="plato">
   * @param {number} delta       +1 para sumar, -1 para restar
   */
  function cambiarCantidad(plato, delta) {
    var id = plato.getAttribute('data-id');
    var boton = plato.querySelector('.plato__agregar');

    if (!carrito[id]) {
      carrito[id] = {
        nombre: boton.getAttribute('data-nombre'),
        precio: parseInt(boton.getAttribute('data-precio'), 10),
        cantidad: 0
      };
    }
    carrito[id].cantidad += delta;

    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
      plato.classList.remove('en-carrito');
    } else {
      plato.classList.add('en-carrito');
      plato.querySelector('.contador__n').textContent = carrito[id].cantidad;
    }
    pintarCarrito();
  }

  /** Actualiza la barra de abajo con el número de productos y el total. */
  function pintarCarrito() {
    var unidades = unidadesCarrito();
    var barra = $('#carritoBarra');

    $('#carritoN').textContent = unidades === 1 ? '1 producto' : unidades + ' productos';
    $('#carritoTotal').textContent = pesos(totalCarrito());

    barra.classList.toggle('visible', unidades > 0);
    // La clase en el <body> sube el botón de WhatsApp para que no quede tapado.
    document.body.classList.toggle('carrito-visible', unidades > 0);
  }

  /** Habilita o bloquea el botón de pedir según el horario del local. */
  function actualizarBotonPedir() {
    var btn = $('#btnPedir');
    if (!btn) { return; }
    if (estadoActual.aceptaPedidos) {
      btn.disabled = false;
      btn.textContent = 'Hacer el pedido';
    } else {
      btn.disabled = true;
      btn.textContent = 'Cerrado ahora';
    }
  }


  /* ==========================================================================
     4) VENTANA DEL PEDIDO
     Qué hace: muestra el resumen, valida los datos, guarda el pedido y enseña
     el número de turno.
     Accesibilidad: al abrir se lleva el foco al primer campo y se bloquea el
     scroll de atrás; al cerrar, el foco vuelve al botón que la abrió. Se cierra
     con la tecla Escape y tocando fuera de la caja.
     ========================================================================== */

  var elementoQueAbrio = null;

  /* Todo lo que puede recibir el foco con el tabulador. Va como LISTA y no como
     un solo texto separado por comas: en CSS, "#modalPedido a, button" significa
     "los enlaces DE la ventana y TODOS los botones de la página", así que el
     prefijo hay que pegárselo a cada uno por separado. */
  var ENFOCABLES = [
    'button:not([disabled])', '[href]', 'input:not([disabled])',
    'textarea', 'select', '[tabindex]:not([tabindex="-1"])'
  ];
  var SELECTOR_MODAL = ENFOCABLES.map(function (x) { return '#modalPedido ' + x; }).join(', ');

  /**
   * Encierra el foco dentro de la ventana del pedido.
   * POR QUÉ: la ventana se anuncia como aria-modal="true", o sea "detrás de mí
   * no hay nada". Sin esto era mentira: a los seis tabuladores el foco se
   * escapaba al menú de atrás y al banner de cookies, y quien usa teclado o
   * lector de pantalla se perdía sin saber que la ventana seguía abierta.
   * Cómo: si va hacia adelante y está en el último, salta al primero; si va
   * hacia atrás desde el primero, salta al último.
   */
  function encerrarFoco(e) {
    if (e.key !== 'Tab') { return; }
    var caja = $('#modalPedido');
    // Solo lo que de verdad se ve: el paso del formulario y el del turno se
    // turnan con hidden, y un elemento oculto no debe recibir el foco.
    var lista = $$(SELECTOR_MODAL).filter(function (el) {
      return el.getClientRects().length > 0;   // descarta lo que está en el paso oculto
    });
    if (!lista.length) { return; }

    var primero = lista[0], ultimo = lista[lista.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primero.focus();
    } else if (!caja.contains(document.activeElement)) {
      // Red de seguridad: si el foco terminó fuera por cualquier motivo,
      // se devuelve al primer elemento de la ventana.
      e.preventDefault(); primero.focus();
    }
  }

  function abrirModal() {
    if (!estadoActual.aceptaPedidos) { return; }
    if (unidadesCarrito() === 0) { return; }

    elementoQueAbrio = document.activeElement;
    pintarResumen();
    $('#pasoFormulario').hidden = false;
    $('#pasoTurno').hidden = true;
    $('#errorForm').classList.remove('visible');
    $('#modalPedido').classList.add('abierto');
    document.body.style.overflow = 'hidden';   // evita el scroll de fondo en iOS
    document.addEventListener('keydown', encerrarFoco, true);
    $('#campoNombre').focus();
  }

  function cerrarModal() {
    $('#modalPedido').classList.remove('abierto');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', encerrarFoco, true);
    if (elementoQueAbrio) { elementoQueAbrio.focus(); }
  }

  /** Escribe dentro de la ventana la lista de lo que se va a pedir. */
  function pintarResumen() {
    var caja = $('#resumenPedido');
    caja.innerHTML = '';

    Object.keys(carrito).forEach(function (id) {
      var it = carrito[id];
      var fila = document.createElement('div');
      fila.className = 'resumen__fila';
      // textContent (y no innerHTML) para que un nombre con símbolos raros no
      // pueda inyectar etiquetas en la página.
      var a = document.createElement('span'); a.textContent = it.cantidad + '×';
      var b = document.createElement('span'); b.textContent = it.nombre;
      var c = document.createElement('span'); c.textContent = pesos(it.precio * it.cantidad);
      fila.append(a, b, c);
      caja.appendChild(fila);
    });

    var total = document.createElement('div');
    total.className = 'resumen__total';
    var t1 = document.createElement('span'); t1.textContent = 'Total';
    var t2 = document.createElement('span'); t2.textContent = pesos(totalCarrito());
    total.append(t1, t2);
    caja.appendChild(total);
  }

  /** Muestra un error del formulario y lleva el foco al campo que falla. */
  function mostrarError(mensaje, campo) {
    var caja = $('#errorForm');
    caja.textContent = mensaje;
    caja.classList.add('visible');
    if (campo) { campo.focus(); }
    caja.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Envía el pedido.
   * Qué hace: valida, lo manda al almacén (nube o local), muestra el turno y
   * prepara el enlace de WhatsApp, que es el respaldo del sistema.
   */
  function enviarPedido(evento) {
    evento.preventDefault();

    // Segunda comprobación del horario: entre que abrió la ventana y le dio
    // enviar pudo pasar la hora de cierre.
    if (!estadoActual.aceptaPedidos) {
      mostrarError('El local acaba de cerrar. Vuelve a intentarlo en el horario de atención.');
      return;
    }

    var nombre = $('#campoNombre').value.trim();
    var telefono = $('#campoTelefono').value.replace(/\D/g, '');
    var tipo = $('input[name="tipo"]:checked').value;
    var direccion = $('#campoDir').value.trim();
    var pago = $('input[name="pago"]:checked').value;
    var notas = $('#campoNotas').value.trim();

    if (nombre.length < 2) { return mostrarError('Escribe tu nombre para saber de quién es el pedido.', $('#campoNombre')); }
    if (telefono.length < 7) { return mostrarError('Escribe un número de celular válido.', $('#campoTelefono')); }
    if (tipo === 'domicilio' && direccion.length < 6) {
      return mostrarError('Para el domicilio hace falta la dirección y el barrio.', $('#campoDir'));
    }
    if (unidadesCarrito() === 0) { return mostrarError('El pedido está vacío.'); }

    var items = Object.keys(carrito).map(function (id) {
      return { nombre: carrito[id].nombre, cantidad: carrito[id].cantidad, precio: carrito[id].precio };
    });

    var boton = $('#btnEnviar');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    window.Almacen.crearPedido({
      nombre: nombre, telefono: telefono, tipo: tipo,
      direccion: direccion, pago: pago, notas: notas,
      items: items, total: totalCarrito()
    }).then(function (pedido) {
      mostrarTurno(pedido);
      medirEvento('pedido_enviado', { valor: pedido.total });
    }).catch(function (err) {
      mostrarError('No se pudo enviar el pedido: ' + err.message + '. Intenta de nuevo o escríbenos por WhatsApp.');
    }).then(function () {
      boton.disabled = false;
      boton.textContent = 'Enviar el pedido';
    });
  }

  /** Cambia la ventana a la pantalla del turno con todos los datos. */
  function mostrarTurno(pedido) {
    $('#pasoFormulario').hidden = true;
    $('#pasoTurno').hidden = false;
    $('#turnoNumero').textContent = pedido.turno;

    var hora = window.Almacen.horaTextoColombia();
    var datos = [
      ['Pedido', pedido.numero || ('#' + pedido.turno)],
      ['Nombre', pedido.nombre],
      ['Hora', hora],
      ['Entrega', pedido.tipo === 'domicilio' ? 'A domicilio' : 'Paso a recogerlo'],
      ['Pago', pedido.pago],
      ['Total', pesos(pedido.total)]
    ];

    var caja = $('#turnoDatos');
    caja.innerHTML = '';
    datos.forEach(function (par) {
      var fila = document.createElement('div');
      var a = document.createElement('span'); a.textContent = par[0];
      var b = document.createElement('span'); b.textContent = par[1];
      fila.append(a, b);
      caja.appendChild(fila);
    });

    $('#btnWhatsAppPedido').href = enlaceWhatsApp(pedido);

    // El carrito se vacía: el pedido ya salió y dejarlo lleno haría que el
    // cliente lo mandara dos veces sin darse cuenta.
    carrito = {};
    $$('.plato.en-carrito').forEach(function (p) { p.classList.remove('en-carrito'); });
    pintarCarrito();
  }


  /* ==========================================================================
     5) MENSAJE DE WHATSAPP — el respaldo del sistema (parte B)
     Qué hace: arma el texto del pedido ya escrito, listo para enviar.
     Por qué existe: aunque el pedido quede guardado en la nube, el vendedor no
     está mirando el panel todo el día. El mensaje de WhatsApp es el aviso que
     sí le suena en el celular. Y si algún día falla Cloudflare o el internet,
     el pedido igual llega y no se pierde la venta.
     ========================================================================== */
  function enlaceWhatsApp(pedido) {
    var lineas = [];
    lineas.push('*PEDIDO PICHI BURGUER*');
    lineas.push('Turno: *' + pedido.turno + '*');
    if (pedido.numero) { lineas.push('N° de pedido: ' + pedido.numero); }
    lineas.push('Fecha: ' + fechaLegible() + ' · ' + window.Almacen.horaTextoColombia());
    lineas.push('');
    lineas.push('Cliente: ' + pedido.nombre);
    lineas.push('Celular: ' + pedido.telefono);
    lineas.push('Entrega: ' + (pedido.tipo === 'domicilio' ? 'A DOMICILIO' : 'Paso a recogerlo'));
    if (pedido.tipo === 'domicilio' && pedido.direccion) { lineas.push('Dirección: ' + pedido.direccion); }
    lineas.push('Pago: ' + pedido.pago);
    lineas.push('');
    lineas.push('*Pedido:*');
    pedido.items.forEach(function (i) {
      lineas.push('• ' + i.cantidad + 'x ' + i.nombre + ' — ' + pesos(i.precio * i.cantidad));
    });
    lineas.push('');
    lineas.push('*TOTAL: ' + pesos(pedido.total) + '*');
    if (pedido.notas) { lineas.push(''); lineas.push('Notas: ' + pedido.notas); }

    return 'https://wa.me/' + CFG.negocio.whatsapp + '?text=' + encodeURIComponent(lineas.join('\n'));
  }

  /** Fecha de hoy escrita como se lee en Colombia: "domingo 6 de septiembre". */
  function fechaLegible() {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: CFG.horarios.zonaHoraria,
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(new Date());
  }


  /* ==========================================================================
     6) BARRA DE CATEGORÍAS
     Qué hace: marca en rojo la categoría por la que va pasando el scroll.
     Cómo: con IntersectionObserver, que lo resuelve el propio navegador. Se
     eligió así en vez de escuchar el evento scroll porque no consume batería
     ni traba el desplazamiento en celulares de gama baja.
     ========================================================================== */
  function activarCategorias() {
    var enlaces = $$('#navCategorias a');
    var secciones = enlaces
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!('IntersectionObserver' in window) || !secciones.length) { return; }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        enlaces.forEach(function (a) {
          a.classList.toggle('activa', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-42% 0px -52% 0px' });   // se activa cuando la sección va por el centro

    secciones.forEach(function (s) { observador.observe(s); });
  }


  /* ==========================================================================
     7) COOKIES, GOOGLE ANALYTICS Y MAPA
     Qué hace: pide permiso ANTES de cargar cualquier cosa de Google.
     Por qué: en Colombia, la Resolución 32.126 de 2022 de la SIC exige que la
     autorización sea previa, expresa e informada. Cargar la analítica y después
     mostrar el banner de adorno no cumple la norma.
     Guarda la decisión en el navegador y se puede cambiar desde el footer.
     ========================================================================== */

  var CLAVE_COOKIES = 'pichi_cookies';

  function iniciarCookies() {
    var decision = null;
    try { decision = localStorage.getItem(CLAVE_COOKIES); } catch (e) { /* almacenamiento bloqueado */ }

    if (decision === 'aceptadas') {
      cargarAnalytics();
      cargarMapa();
    } else if (decision !== 'rechazadas') {
      mostrarBanner(true);
    }

    $('#btnAceptarCookies').addEventListener('click', function () {
      try { localStorage.setItem(CLAVE_COOKIES, 'aceptadas'); } catch (e) {}
      mostrarBanner(false);
      cargarAnalytics();
      cargarMapa();
    });

    $('#btnRechazarCookies').addEventListener('click', function () {
      try { localStorage.setItem(CLAVE_COOKIES, 'rechazadas'); } catch (e) {}
      mostrarBanner(false);
    });

    // Enlace permanente del footer para cambiar la decisión cuando se quiera.
    $('#btnCookiesConfig').addEventListener('click', function () {
      try { localStorage.removeItem(CLAVE_COOKIES); } catch (e) {}
      mostrarBanner(true);
    });

    // Botón "Ver el mapa": carga el mapa solo esta vez, sin activar la analítica.
    $('#btnVerMapa').addEventListener('click', cargarMapa);
  }

  /**
   * Muestra u oculta el banner de cookies.
   * Además marca el <body>, porque el CSS necesita saberlo para apartar el
   * botón de WhatsApp: si no, el banner, el carrito y el botón se amontonan
   * abajo y el cliente no alcanza a tocar "Hacer el pedido".
   * @param {boolean} visible
   */
  function mostrarBanner(visible) {
    $('#bannerCookies').classList.toggle('visible', visible);
    document.body.classList.toggle('cookies-visibles', visible);
  }

  /**
   * Inserta Google Analytics 4.
   * Solo se ejecuta después de que el visitante acepta. El script se marca
   * async para que no bloquee el pintado de la página.
   */
  function cargarAnalytics() {
    if (!CFG.analytics.activo) { return; }
    if (CFG.analytics.measurementId.indexOf('XXXX') !== -1) { return; }  // ID sin configurar
    if (window.gtagCargado) { return; }
    window.gtagCargado = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.analytics.measurementId;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CFG.analytics.measurementId);
  }

  /**
   * Registra un evento de conversión en Analytics.
   * Si el visitante rechazó las cookies, no hace nada — y no falla.
   */
  function medirEvento(nombre, datos) {
    if (typeof window.gtag === 'function') { window.gtag('event', nombre, datos || {}); }
  }

  /** Inserta el mapa de Google. Se llama solo tras el consentimiento. */
  function cargarMapa() {
    var caja = $('#mapaCaja');
    if (!caja || caja.querySelector('iframe')) { return; }

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps?q=' +
      encodeURIComponent('Cra 58A #6, Bernardo Jaramillo, Cartagena de Indias, Bolívar, Colombia') +
      '&output=embed';
    iframe.title = 'Mapa con la ubicación de Pichi Burguer en el barrio Bernardo Jaramillo, Cartagena';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');

    var aviso = $('#mapaAviso');
    if (aviso) { aviso.remove(); }
    caja.appendChild(iframe);
  }


  /* ==========================================================================
     8) ARRANQUE
     Qué hace: conecta todos los botones y deja la página lista.
     Se ejecuta cuando el HTML ya está leído (los scripts van con defer).
     ========================================================================== */
  function iniciar() {

    // Año del aviso de copyright, para que nunca quede desactualizado.
    $('#anio').textContent = new Date().getFullYear();

    pintarEstado();
    pintarHorarios();
    // Se revisa el horario cada minuto: si el local cierra mientras alguien
    // tiene la página abierta, el botón de pedir se bloquea solo.
    setInterval(pintarEstado, 60000);

    // Botones "Agregar" y contadores de cada plato.
    $$('.plato__agregar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cambiarCantidad(btn.closest('.plato'), 1);
      });
    });
    $$('.contador__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cambiarCantidad(btn.closest('.plato'), btn.getAttribute('data-accion') === 'mas' ? 1 : -1);
      });
    });

    // Ventana del pedido.
    $('#btnPedir').addEventListener('click', abrirModal);
    $('#btnCerrarModal').addEventListener('click', cerrarModal);
    $('#btnCerrarTurno').addEventListener('click', cerrarModal);
    $('#formPedido').addEventListener('submit', enviarPedido);

    // Cerrar tocando el fondo oscuro (pero no al tocar dentro de la caja).
    $('#modalPedido').addEventListener('click', function (e) {
      if (e.target === this) { cerrarModal(); }
    });
    // Cerrar con la tecla Escape: es lo que espera cualquiera que use teclado.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#modalPedido').classList.contains('abierto')) { cerrarModal(); }
    });

    // El campo de dirección solo aparece si escoge domicilio.
    $$('input[name="tipo"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        $('#campoDireccion').hidden = ($('input[name="tipo"]:checked').value !== 'domicilio');
      });
    });

    activarCategorias();
    iniciarCookies();

    // Eventos de conversión: qué botones toca de verdad la gente.
    $$('[data-evento]').forEach(function (el) {
      el.addEventListener('click', function () {
        medirEvento('clic_' + el.getAttribute('data-evento'));
      });
    });
    // Son DOS enlaces tel: (contacto y footer). Con $ solo se enganchaba el
    // primero y el del pie no se medía nunca.
    $$('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener('click', function () { medirEvento('clic_telefono'); });
    });
  }

  // Con defer el HTML ya está listo, pero se comprueba igual por si el archivo
  // se llegara a cargar de otra forma en el futuro.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
