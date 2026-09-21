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
     4bis. Cómo va la cola de turnos
     4ter. Repetir el último pedido
     5. Mensaje de WhatsApp (el respaldo del sistema)
     6. Barra de categorías
     7. Cookies, Google Analytics y mapa
     7bis. Instalar la app en el celular
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

    // Interruptor de 24 horas (js/config.js → horarios.siempreAbierto).
    // TEMPORAL mientras JX termina de montar la operación: el sitio tiene que
    // poder usarse a cualquier hora. Al ponerlo en false vuelven a mandar los
    // horarios de config.js, que siguen intactos. Ver decisión 23 del CLAUDE.md.
    if (CFG.horarios.siempreAbierto) {
      return {
        abierto: true, aceptaPedidos: true,
        texto: 'Abierto ahora',
        textoLargo: 'Abierto ahora · recibimos pedidos a toda hora.'
      };
    }

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
    // La cortina de cerrado se pone o se quita según el mismo estado: así no
    // hay forma de que la barra diga "Abierto" y la cortina siga puesta.
    actualizarCortina(e);
  }

  var estadoActual = { aceptaPedidos: false };


  /* ==========================================================================
     1bis) CORTINA DE CERRADO Y CUENTA REGRESIVA
     Qué hace: tapa la página mientras el local no atiende y muestra cuánto
     falta para abrir, al segundo.
     Por qué tapa en vez de esconder: el menú sigue en el HTML debajo. Si se
     ocultara de verdad, Google no leería los 15 platos de madrugada y el
     negocio perdería justo lo que vino a buscar aquí.
     Salida: el botón "Ver el menú de todas formas" la quita por lo que dure la
     visita. PEDIR sigue bloqueado hasta la hora de abrir; eso no lo cambia.
     ========================================================================== */

  var CLAVE_VIO_MENU = 'pichi_vio_menu';
  var relojCortina = null;

  /**
   * Calcula cuántos segundos faltan para que el local abra.
   * Cómo: recorre los días de la semana desde hoy hasta encontrar el primero
   * que abra y cuya hora de apertura todavía no haya pasado.
   * @returns {{segundos:number, dia:object, esHoy:boolean}|null}
   *   null si no hay ningún día abierto en la configuración.
   */
  function proximaApertura() {
    var a = window.Almacen.ahoraColombia();
    var segundosAhora = a.hora * 3600 + a.minuto * 60 + a.segundo;

    for (var i = 0; i <= 7; i++) {
      var d = CFG.horarios.dias[(a.diaSemana + i) % 7];
      if (!d || d.cerrado) { continue; }
      var faltan = i * 86400 + aMinutos(d.abre) * 60 - segundosAhora;
      // faltan <= 0 significa que esa apertura ya pasó (es la de hoy más
      // temprano): se sigue buscando en el día siguiente.
      if (faltan > 0) { return { segundos: faltan, dia: d, esHoy: i === 0 }; }
    }
    return null;
  }

  /** Convierte 13563 segundos en "03:46:03". */
  function aRelojLargo(segundos) {
    var h = Math.floor(segundos / 3600);
    var m = Math.floor((segundos % 3600) / 60);
    var sg = segundos % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sg).padStart(2, '0');
  }

  /** Pone o quita la cortina según el estado del local. */
  function actualizarCortina(estado) {
    var cortina = $('#pantallaCerrado');
    if (!cortina) { return; }

    var yaVioElMenu = false;
    try { yaVioElMenu = sessionStorage.getItem(CLAVE_VIO_MENU) === '1'; } catch (e) {}

    // Se tapa solo cuando el local no está atendiendo. En "Cerrando" (los 15
    // minutos finales) el local SÍ está abierto y hay gente adentro: taparlo
    // ahí sería mentirle al cliente que va de camino.
    var debeTapar = !estado.abierto && !yaVioElMenu;

    cortina.hidden = !debeTapar;
    cortina.classList.toggle('visible', debeTapar);
    document.body.classList.toggle('cerrado-visible', debeTapar);

    if (debeTapar) {
      pintarCuentaRegresiva();
      if (!relojCortina) { relojCortina = setInterval(pintarCuentaRegresiva, 1000); }
    } else if (relojCortina) {
      clearInterval(relojCortina);
      relojCortina = null;
    }
  }

  /** Escribe el horario y mueve la cuenta regresiva. Corre una vez por segundo. */
  function pintarCuentaRegresiva() {
    var prox = proximaApertura();
    var reloj = $('#cerradoReloj');
    var horario = $('#cerradoHorario');

    if (!prox) {
      reloj.textContent = '--:--:--';
      horario.textContent = 'Escríbenos por WhatsApp para saber cuándo abrimos.';
      return;
    }

    horario.textContent = (prox.esHoy ? 'Hoy abrimos de ' : 'Abrimos el ' + prox.dia.nombre.toLowerCase() + ' de ') +
      aTexto12h(aMinutos(prox.dia.abre)) + ' a ' + aTexto12h(aMinutos(prox.dia.cierra));

    if (prox.segundos <= 0) {
      // Llegó la hora: se recalcula el estado, la cortina se quita sola y el
      // botón de pedir se desbloquea sin que el cliente tenga que recargar.
      pintarEstado();
      return;
    }
    reloj.textContent = aRelojLargo(prox.segundos);
  }

  /** Quita la cortina por lo que dure la visita, sin desbloquear los pedidos. */
  function verElMenu() {
    try { sessionStorage.setItem(CLAVE_VIO_MENU, '1'); } catch (e) {}
    pintarEstado();
    medirEvento('clic_ver_menu_cerrado');
    // El foco se lleva a la barra de categorías: quien usa teclado necesita
    // saber dónde quedó parado cuando la cortina desaparece.
    var primera = $('#navCategorias a');
    if (primera) { primera.focus(); }
  }


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
      // Con el interruptor de 24 horas puesto, la tabla no puede seguir
      // anunciando 6 a 11: diría una cosa y el semáforo otra.
      if (CFG.horarios.siempreAbierto) {
        celda.textContent = 'Abierto 24 horas';
      } else if (cfg.cerrado) {
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
    $('#pasoEnCurso').hidden = true;
    $('#pasoTurno').hidden = true;
    $('#colaTurnos').hidden = true;
    $('#errorForm').classList.remove('visible');
    $('#modalPedido').classList.add('abierto');
    document.body.style.overflow = 'hidden';   // evita el scroll de fondo en iOS
    document.addEventListener('keydown', encerrarFoco, true);
    $('#campoNombre').focus();
  }

  function cerrarModal() {
    // Al cerrar la ventana se deja de preguntar por la cola: no tiene sentido
    // gastar lecturas por alguien que ya no está mirando.
    pararCola();
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
    var pago = $('input[name="pago"]:checked').value;
    var notas = $('#campoNotas').value.trim();

    if (nombre.length < 2) { return mostrarError('Escribe tu nombre para saber de quién es el pedido.', $('#campoNombre')); }
    if (telefono.length < 7) { return mostrarError('Escribe un número de celular válido.', $('#campoTelefono')); }
    if (unidadesCarrito() === 0) { return mostrarError('El pedido está vacío.'); }

    var items = Object.keys(carrito).map(function (id) {
      return { nombre: carrito[id].nombre, cantidad: carrito[id].cantidad, precio: carrito[id].precio };
    });

    var boton = $('#btnEnviar');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    window.Almacen.crearPedido({
      nombre: nombre, telefono: telefono, pago: pago, notas: notas,
      items: items, total: totalCarrito()
    }).then(function (pedido) {
      mostrarTurno(pedido);
      medirEvento('pedido_enviado', { valor: pedido.total });
    }).catch(function (err) {
      /* Ese teléfono ya tiene un turno sin entregar. No es un error del
         sistema: es el cliente que se acordó de algo. En vez de un mensaje
         rojo, se le ofrece sumarlo a lo que ya pidió. */
      if (err.codigo === 'PEDIDO_EN_CURSO' && err.pedidoActivo) {
        mostrarEnCurso(err.pedidoActivo, telefono);
        medirEvento('choco_pedido_en_curso');
        return;
      }
      mostrarError('No se pudo enviar el pedido: ' + err.message + '. Intenta de nuevo o escríbenos por WhatsApp.');
    }).then(function () {
      boton.disabled = false;
      boton.textContent = 'Enviar el pedido';
    });
  }

  /* Lo que el cliente quiere sumar y a qué teléfono pertenece. Se guarda
     mientras decide, porque el carrito sigue intacto por si dice que no. */
  var ampliacionPendiente = null;

  /**
   * Muestra "ya tienes un pedido" y le ofrece sumarle lo que acaba de escoger.
   * ⚠ Todo con textContent, nunca innerHTML: por aquí pasan los nombres de los
   * platos y lo que el servidor devuelva. Misma regla 9 del proyecto.
   */
  function mostrarEnCurso(activo, telefono) {
    ampliacionPendiente = { telefono: telefono, turno: activo.turno };

    $('#pasoFormulario').hidden = true;
    $('#pasoEnCurso').hidden = false;
    $('#encursoTurno').textContent = activo.turno;

    var yaTiene = (activo.items || []).map(function (i) {
      return i.cantidad + '× ' + i.nombre;
    }).join(', ');
    $('#encursoTexto').textContent = activo.estado === 'preparando'
      ? (yaTiene ? 'Ya lo están preparando: ' + yaTiene : 'Ya lo están preparando.')
      : (yaTiene ? 'Está en la fila: ' + yaTiene : 'Está en la fila.');

    // Lo que quiere sumar, para que lo vea antes de decidir.
    var caja = $('#encursoNuevo');
    caja.innerHTML = '';
    Object.keys(carrito).forEach(function (id) {
      var fila = document.createElement('div');
      fila.className = 'encurso__fila';
      var a = document.createElement('span');
      a.textContent = carrito[id].cantidad + '× ' + carrito[id].nombre;
      var b = document.createElement('span');
      b.textContent = pesos(carrito[id].precio * carrito[id].cantidad);
      fila.append(a, b);
      caja.appendChild(fila);
    });

    /* ⛔ Con el pedido YA EN LA PLANCHA no se ofrece agregar (decisión 46). Se
       muestra OTRO bloque entero, no el mismo con el botón escondido: un aviso
       explicando qué pasó y qué puede hacer. Antes se escondía solo el botón y
       quedaba la lista de lo que quería agregar sin nada que hacer con ella —
       y el botón, por un fallo del CSS, ni siquiera se escondía. Ver
       decisión 49. */
    var enPlancha = activo.estado === 'preparando';
    $('#encursoTitulo').textContent = enPlancha ? 'Tu pedido ya se está preparando' : 'Ya tienes un pedido';
    $('#encursoPuede').hidden = enPlancha;
    $('#encursoNoPuede').hidden = !enPlancha;
    $('#encursoCaja').classList.toggle('encurso--cocina', enPlancha);

    // Lo que quiere agregar, para el mensaje de WhatsApp y para la lista.
    var lista = Object.keys(carrito).map(function (id) {
      return '• ' + carrito[id].cantidad + '× ' + carrito[id].nombre;
    }).join('\n');

    if (enPlancha) {
      // El WhatsApp va con el turno y lo que quería, ya escrito: el vendedor
      // no tiene que preguntarle nada.
      $('#encursoWhatsAlto').href = 'https://wa.me/' + CFG.negocio.whatsapp + '?text=' +
        encodeURIComponent('Hola, tengo el turno ' + activo.turno +
          ' y quisiera agregarle:\n' + lista + '\n¿Todavía alcanza?');
    } else {
      $('#btnAgregarAlPedido').disabled = false;
      $('#btnAgregarAlPedido').textContent = 'Sí, agrégalo a mi turno ' + activo.turno;
    }

    /* Salida "es para otra persona": se le da el ENLACE DE LA PÁGINA, no el
       WhatsApp del local. Que la otra persona pida desde su propio celular con
       su propio número es lo correcto: así tiene su turno, su seguimiento y su
       aviso, en vez de que uno haga de intermediario para dos pedidos que el
       sistema no puede separar. Ver decisión 50. */
    var enlace = 'https://' + CFG.negocio.dominio.replace(/^https?:\/\//, '');
    $('#encursoEnlace').textContent = enlace.replace(/^https:\/\//, '');
    $('#encursoCompartir').href = 'https://wa.me/?text=' + encodeURIComponent(
      'Pide tu propia hamburguesa en Pichi Burguer 🍔\n' + enlace);
  }

  /**
   * Copia el enlace de la página al portapapeles.
   * El botón confirma en sí mismo ("¡Copiado!") y vuelve solo a los 2
   * segundos: un aviso flotante para algo tan pequeño sería más ruido que
   * información, y aquí el cliente está mirando justo ese botón.
   */
  function copiarEnlace() {
    var btn = $('#btnCopiarEnlace');
    var texto = 'https://' + CFG.negocio.dominio.replace(/^https?:\/\//, '');
    var listo = function () {
      btn.textContent = '¡Copiado!';
      btn.classList.add('copiado');
      setTimeout(function () { btn.textContent = 'Copiar'; btn.classList.remove('copiado'); }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(listo).catch(function () { seleccionar(); });
    } else { seleccionar(); }

    /* Sin permiso de portapapeles (o en http), se selecciona el texto para que
       lo copie a mano. Es lo único honesto: un botón "Copiar" que no copia y
       no avisa es peor que no tenerlo. */
    function seleccionar() {
      var r = document.createRange();
      r.selectNodeContents($('#encursoEnlace'));
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(r);
      btn.textContent = 'Cópialo';
    }
  }

  /** Suma lo del carrito al pedido que ya tiene, sin sacar turno nuevo. */
  function agregarAlPedido() {
    if (!ampliacionPendiente) { return; }
    var boton = $('#btnAgregarAlPedido');
    boton.disabled = true;
    boton.textContent = 'Agregando…';

    var items = Object.keys(carrito).map(function (id) {
      return { nombre: carrito[id].nombre, cantidad: carrito[id].cantidad, precio: carrito[id].precio };
    });
    var loQueAgrego = items.slice();   // para el mensaje de WhatsApp

    window.Almacen.agregarAPedido(ampliacionPendiente.telefono, items)
      .then(function (pedido) {
        $('#pasoEnCurso').hidden = true;
        mostrarTurno(pedido);
        /* ⚠ El botón de WhatsApp del turno pasa a decir lo que AGREGÓ, no el
           pedido entero. Es el respaldo de esta ampliación: si el vendedor ya
           leyó la comanda en el panel, el mensaje es lo que lo hace mirar otra
           vez. Por eso JX pidió que también avisara por ahí. */
        $('#btnWhatsAppPedido').href = enlaceAmpliacion(pedido, loQueAgrego);
        $('#btnWhatsAppPedido').textContent = 'Avisar por WhatsApp lo que agregué';
        // El carrito lo vacía mostrarTurno(); aquí no hay que hacerlo otra vez.
        medirEvento('amplio_pedido', { valor: pedido.total });
      })
      .catch(function (err) {
        boton.disabled = false;
        boton.textContent = 'Sí, agrégalo a mi turno';
        /* El vendedor tocó "Empezar" entre que salió la pregunta y el cliente
           respondió. No es un error: se le vuelve a pintar la pantalla, ahora
           con el aviso de que ya está en la cocina y solo la salida por
           WhatsApp. El servidor es el que manda sobre el estado. */
        if (err.codigo === 'YA_EN_PLANCHA') {
          mostrarEnCurso({ turno: err.turno || ampliacionPendiente.turno,
                           estado: 'preparando', items: [] },
                         ampliacionPendiente.telefono);
          medirEvento('amplio_tarde');
          return;
        }
        mostrarError('No se pudo agregar: ' + err.message + '. Escríbenos por WhatsApp.');
        $('#pasoEnCurso').hidden = true;
        $('#pasoFormulario').hidden = false;
      });
  }

  /** El mensaje de WhatsApp de una ampliación: corto y sin ambigüedad. */
  function enlaceAmpliacion(pedido, agregados) {
    var t = '➕ AGREGUÉ A MI PEDIDO\n';
    t += 'Turno ' + pedido.turno + ' · ' + pedido.nombre + '\n\n';
    t += 'Lo que agregué ahora:\n';
    agregados.forEach(function (i) { t += '• ' + i.cantidad + '× ' + i.nombre + '\n'; });
    t += '\nTotal del pedido completo: ' + pesos(pedido.total);
    return 'https://wa.me/' + CFG.negocio.whatsapp + '?text=' + encodeURIComponent(t);
  }

  /** Cambia la ventana a la pantalla del turno con todos los datos. */
  function mostrarTurno(pedido) {
    $('#pasoFormulario').hidden = true;
    $('#pasoEnCurso').hidden = true;
    $('#pasoTurno').hidden = false;
    $('#turnoNumero').textContent = pedido.turno;

    var hora = window.Almacen.horaTextoColombia();
    var datos = [
      ['Pedido', pedido.numero || ('#' + pedido.turno)],
      ['Nombre', pedido.nombre],
      ['Hora', hora],
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

    // Se guarda QUÉ pidió (sin precios) antes de vaciar el carrito, para poder
    // ofrecerle repetirlo la próxima vez que entre.
    guardarUltimoPedido();

    // Y arranca el contador de la cola: "faltan 2 antes que tú".
    arrancarCola(pedido.turno);
    // Se guarda para poder seguirlo aunque cierre la pestaña. Ver bloque 4quater.
    guardarPedidoEnCurso(pedido);

    // El carrito se vacía: el pedido ya salió y dejarlo lleno haría que el
    // cliente lo mandara dos veces sin darse cuenta.
    carrito = {};
    $$('.plato.en-carrito').forEach(function (p) { p.classList.remove('en-carrito'); });
    pintarCarrito();
  }


  /* ==========================================================================
     4bis) CÓMO VA LA COLA
     Qué hace: mientras el cliente tiene abierta la pantalla de su turno, le va
     diciendo por dónde van. "Vas de tercero · están preparando el turno 11".
     Por qué: hoy recibía su número y quedaba a ciegas. Eso genera ansiedad y,
     sobre todo, genera llamadas al local preguntando "¿ya va?" — que es tiempo
     que el vendedor no está cocinando.
     Qué pide al servidor: SOLO números (ver la acción 'turnos'). Ni un nombre
     ni un teléfono de nadie, porque esa consulta no lleva clave.
     Cuánto gasta: 1 lectura de KV cada 30 segundos, y solo mientras la pantalla
     está abierta y visible. Al cerrarla o al irse a otra aplicación, para.
     ========================================================================== */

  var relojCola = null;
  var turnoDelCliente = null;
  var colaDesde = 0;
  /* 90 y no 45: cuando el cliente activa el aviso al celular, la espera puede
     ser larga en hora pico y cortar a los 45 minutos sería dejarlo justo sin
     el aviso que vino a pedir. Con la pantalla en segundo plano cada consulta
     cuesta 1 lectura de KV cada 30 s, que cabe de sobra en el plan gratuito. */
  var COLA_MAX_MINUTOS = 90;
  var yaAvisado = false;       // para no repetir el aviso en cada consulta
  var avisoActivado = false;   // el cliente tocó el botón y dio permiso

  /**
   * Enciende el aviso al celular. Lo dispara un TOQUE del cliente, nunca solo.
   * POR QUÉ UN BOTÓN: los navegadores solo dejan pedir el permiso de
   * notificación después de que la persona toca algo. Si se pidiera al cargar,
   * el navegador lo bloquea en silencio y el aviso no llegaría nunca — y
   * además es de mala educación soltarle un permiso por sorpresa a alguien que
   * solo vino a pedir una hamburguesa.
   */
  function activarAvisoCola() {
    var btn = $('#colaAvisar');
    if (!('Notification' in window)) { btn.hidden = true; return; }
    Notification.requestPermission().then(function (permiso) {
      if (permiso === 'granted') {
        avisoActivado = true;
        btn.textContent = '🔔 Te avisaremos en este celular';
        btn.disabled = true;
        btn.classList.add('activo');
        medirEvento('activo_aviso_cola');
      } else {
        // Si dice que no, se le dice qué hacer en vez de dejar un botón muerto.
        btn.textContent = 'No se pudo activar · mira la pantalla o el WhatsApp';
        btn.disabled = true;
      }
    }).catch(function () { btn.hidden = true; });
  }

  /**
   * Avisa al celular que ya están preparando SU pedido.
   * Se manda una sola vez (yaAvisado): la cola se consulta cada 30 segundos y
   * sin esa bandera el cliente recibiría el mismo aviso una y otra vez hasta
   * que lo recoja, que es la forma más rápida de que desactive las
   * notificaciones para siempre.
   */
  function avisarQueYaVa() {
    if (yaAvisado || !avisoActivado) { return; }
    yaAvisado = true;
    try {
      var n = new Notification('🔥 Ya están preparando tu pedido', {
        body: 'Turno ' + turnoDelCliente + ' · Pichi Burguer. Ya puedes ir pasando.',
        icon: '/img/icon-192.png',
        badge: '/img/icon-192.png',
        tag: 'pichi-turno',      // uno solo, no se amontonan
        renotify: true
      });
      n.addEventListener('click', function () { window.focus(); n.close(); });
    } catch (e) { /* si el navegador la rechaza, la pantalla igual lo dice */ }
    // Vibrar además del aviso: en el bolsillo se siente antes de lo que se ve.
    if (navigator.vibrate) { try { navigator.vibrate([200, 100, 200]); } catch (e) {} }
    medirEvento('aviso_cola_recibido');
  }

  function arrancarCola(turno) {
    turnoDelCliente = turno;
    colaDesde = Date.now();
    yaAvisado = false;
    $('#colaTurnos').hidden = false;
    // El botón de avisar solo se ofrece si el navegador sabe notificar y el
    // cliente no ha dicho ya que no. En iPhone sin la app instalada no existe
    // Notification, así que no aparece: mejor no ofrecer lo que no se puede
    // cumplir. Para ese caso está el WhatsApp del vendedor.
    var btnAvisar = $('#colaAvisar');
    if ('Notification' in window && Notification.permission !== 'denied') {
      btnAvisar.hidden = false;
      if (Notification.permission === 'granted') {
        // Ya lo había dado en un pedido anterior: no hay que volver a pedirlo.
        avisoActivado = true;
        btnAvisar.textContent = '🔔 Te avisaremos en este celular';
        btnAvisar.disabled = true;
        btnAvisar.classList.add('activo');
      }
    } else {
      btnAvisar.hidden = true;
    }
    pintarCola();
    if (relojCola) { clearInterval(relojCola); }
    relojCola = setInterval(pintarCola, 30000);
  }

  function pararCola() {
    if (relojCola) { clearInterval(relojCola); relojCola = null; }
  }

  function pintarCola() {
    // Si el cliente dejó la pantalla abierta y se fue, no tiene sentido seguir
    // gastando lecturas: se corta a los 45 minutos.
    if (Date.now() - colaDesde > COLA_MAX_MINUTOS * 60000) { pararCola(); return; }
    /* ⚠ ANTES aquí había un "if (document.hidden) return", que ahorraba
       lecturas pero rompía justo lo que el cliente vino a buscar: con la
       página en segundo plano dejaba de mirar, así que el aviso de "ya lo
       están preparando" NUNCA llegaba — que es el único momento en que el
       cliente no está mirando la pantalla. Ahora se sigue consultando; lo que
       se salta es el repintado, que no se ve. */
    var enSegundoPlano = document.hidden;

    window.Almacen.verTurnos().then(function (c) {
      var caja = $('#colaTurnos');
      var estado = $('#colaEstado');
      var detalle = $('#colaDetalle');

      /* El aviso se dispara ESTÉ O NO la pantalla a la vista: es justo cuando
         no la está mirando cuando hace falta.
         ⚠ SOLO con c.preparando, que el servidor pone a null mientras nadie
         toque "Empezar". Antes esto se disparaba con el turno más bajo
         pendiente, así que al primer cliente del día le sonaba el aviso
         "ya están preparando tu pedido" APENAS pedía. */
      if (c.preparando !== null && turnoDelCliente <= c.preparando) { avisarQueYaVa(); }
      if (enSegundoPlano) { return; }   // consultar sí; repintar no hace falta

      /* VERDE solo si el vendedor tocó "Empezar" en ESTE turno o en uno
         posterior. c.preparando viene en null mientras nadie lo toque, y eso
         es lo que impide prometerle al cliente algo que no está pasando. */
      if (c.preparando !== null && turnoDelCliente <= c.preparando) {
        caja.classList.add('es-tuyo');
        estado.textContent = '¡Están preparando el tuyo!';
        detalle.textContent = 'Turno ' + turnoDelCliente + ' · ya puedes ir pasando.';
        return;
      }

      caja.classList.remove('es-tuyo');
      var delante = cuantosDelante(c, turnoDelCliente);

      if (delante === 0) {
        estado.textContent = 'Eres el siguiente';
        detalle.textContent = c.preparando !== null
          ? 'Están preparando el turno ' + c.preparando + ' · el tuyo sigue.'
          : 'Tu pedido es el primero de la fila.';
      } else {
        estado.textContent = delante === 1 ? 'Falta uno antes que tú' : 'Faltan ' + delante + ' antes que tú';
        detalle.textContent = c.preparando !== null
          ? 'Están preparando el turno ' + c.preparando + ' · el tuyo es el ' + turnoDelCliente + '.'
          : 'Tu pedido está en la fila · el tuyo es el ' + turnoDelCliente + '.';
      }
    }).catch(function () {
      // Sin conexión no se le muestra un error al cliente: se esconde la caja
      // y ya. Su turno, que es lo que importa, lo sigue viendo arriba.
      $('#colaTurnos').hidden = true;
      pararCola();
    });
  }


  /* ==========================================================================
     4quater) SEGUIMIENTO DEL PEDIDO EN CURSO
     --------------------------------------------------------------------------
     QUÉ HACE: si este celular hizo un pedido hace poco y todavía no se lo han
     entregado, al ENTRAR a la página lo primero que ve es cómo va. Sin tener
     que preguntar, sin dejar la pestaña abierta y sin permisos de nada.

     POR QUÉ EXISTE (lo pidió JX): la cola en vivo del bloque 4bis solo
     funcionaba con la pantalla del turno abierta. El cliente que cerraba la
     pestaña —que es lo que hace cualquiera después de pedir— se quedaba a
     ciegas con un número en la mano. La única salida era llamar al local, que
     es tiempo que el vendedor no está cocinando.

     ⚠ POR QUÉ ESTO Y NO SOLO LA NOTIFICACIÓN: la notificación del navegador no
     llega en un iPhone que no haya instalado la app, y no llega nunca si el
     cliente cerró la pestaña. Esto funciona en TODOS los celulares, sin
     permisos y sin instalar nada, porque no depende de que el navegador avise:
     el cliente entra y lo ve. Es la base; la notificación es el extra.

     ⚠ NO SE GUARDA NINGÚN DATO PERSONAL. En el aparato solo queda el número de
     turno y la hora. Ni el nombre, ni el teléfono, ni lo que pidió. Y para
     saber cómo va se usa la acción pública 'turnos', que devuelve SOLO números
     (ver decisión 28): el navegador compara su turno con el que están
     preparando y saca la cuenta él mismo. Así nadie puede consultar el pedido
     de otro, porque no hay nada que consultar.

     ⚠ CADUCA A LAS 6 HORAS. Un turno viejo no sirve: los turnos reinician cada
     día, así que mañana el turno 4 sería el de otra persona y el cliente vería
     el pedido de un desconocido como si fuera suyo.
     ========================================================================== */

  /**
   * Cuántos pedidos van DELANTE del turno dado.
   * Se cuentan los turnos pendientes menores que el suyo, uno por uno, en vez
   * de restar (miTurno − elPrimero). La resta sobreestimaba: si están
   * pendientes el 1 y el 3 y tú eres el 3, restar da 2 pero delante va uno
   * solo — el 2 ya se entregó o se borró. Decirle a alguien que faltan dos
   * cuando falta uno es la clase de detalle que hace que deje de creerle a la
   * pantalla.
   * Si el servidor no mandó la lista (versión vieja en caché), se cae a la
   * resta, que es peor pero no rompe nada.
   */
  function cuantosDelante(c, miTurno) {
    if (Array.isArray(c.pendientes)) {
      return c.pendientes.filter(function (t) { return t < miTurno; }).length;
    }
    var base = c.preparando !== null ? c.preparando : c.siguiente;
    return base === null || base === undefined ? 0 : Math.max(0, miTurno - base);
  }

  var CLAVE_CURSO = 'pichi_pedido_curso';
  var CURSO_MAX_HORAS = 6;        // lo mismo que dura un pedido en el panel + 1
  var relojCurso = null;

  /** Guarda el turno en curso. Solo el número y la hora: nada personal. */
  function guardarPedidoEnCurso(pedido) {
    try {
      localStorage.setItem(CLAVE_CURSO, JSON.stringify({
        turno: pedido.turno,
        numero: pedido.numero || '',
        cuando: Date.now()
      }));
    } catch (e) { /* almacenamiento bloqueado: se pierde el seguimiento, nada más */ }
  }

  function olvidarPedidoEnCurso() {
    try { localStorage.removeItem(CLAVE_CURSO); } catch (e) {}
    if (relojCurso) { clearInterval(relojCurso); relojCurso = null; }
    var sec = $('#pedidoEnCurso');
    if (sec) { sec.hidden = true; }
  }

  /** Lee el pedido en curso, si lo hay y si todavía vale. */
  function leerPedidoEnCurso() {
    var g = null;
    try { g = JSON.parse(localStorage.getItem(CLAVE_CURSO) || 'null'); } catch (e) {}
    if (!g || !g.turno) { return null; }
    if (Date.now() - g.cuando > CURSO_MAX_HORAS * 3600000) { olvidarPedidoEnCurso(); return null; }
    return g;
  }

  /**
   * Enciende el seguimiento al cargar la página.
   * Pregunta cada 45 segundos y no cada 30 como la pantalla del turno: aquí el
   * cliente está mirando el menú, no esperando el dato, y cada consulta cuesta
   * una lectura del plan gratuito.
   */
  function arrancarSeguimiento() {
    var g = leerPedidoEnCurso();
    if (!g) { return; }
    $('#pedidoEnCurso').hidden = false;
    $('#cursoNumero').textContent = g.turno;
    pintarSeguimiento();
    if (relojCurso) { clearInterval(relojCurso); }
    relojCurso = setInterval(pintarSeguimiento, 45000);
  }

  /**
   * Al tocar la tarjeta se abre la pantalla del turno con la cola en vivo.
   * Se reusa la ventana que ya existe en vez de inventar otra pantalla: el
   * cliente ya la conoce, es la misma que vio al pedir.
   * ⚠ Se muestra SOLO el paso del turno, nunca el formulario: aquí no se está
   * pidiendo nada, y ver el carrito de otro pedido confundiría.
   */
  function abrirSeguimiento() {
    var g = leerPedidoEnCurso();
    if (!g) { return; }
    elementoQueAbrio = document.activeElement;
    $('#pasoFormulario').hidden = true;
    $('#pasoTurno').hidden = false;
    $('#turnoNumero').textContent = g.turno;
    // Los datos del pedido (nombre, total…) no se guardaron a propósito, así
    // que la caja se deja vacía en vez de inventar nada.
    $('#turnoDatos').innerHTML = '';
    $('#modalPedido').classList.add('abierto');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', encerrarFoco, true);
    arrancarCola(g.turno);
    $('#btnCerrarTurno').focus();
    medirEvento('abrio_seguimiento');
  }

  function pintarSeguimiento() {
    var g = leerPedidoEnCurso();
    if (!g) { return; }
    if (document.hidden) { return; }   // aquí sí se puede esperar: no hay aviso que dar

    window.Almacen.verTurnos().then(function (c) {
      var estado = $('#cursoEstado');
      var detalle = $('#cursoDetalle');
      var sec = $('#pedidoEnCurso');

      /* Ya se lo entregaron: el último entregado alcanzó su turno. Se quita el
         seguimiento en vez de dejarlo diciendo algo viejo — y así el cliente que
         vuelve mañana no se encuentra el cartel de un pedido que ya recogió. */
      if (c.ultimoEntregado !== null && c.ultimoEntregado >= g.turno) {
        olvidarPedidoEnCurso();
        return;
      }

      /* ⚠ El contador del día reinicia en 1 cada mañana. Si el turno guardado
         es MAYOR que el más alto que ha dado el local hoy, el pedido es de
         ayer: ese número ya no le pertenece y hay que soltarlo, o el cliente
         estaría viendo la cola de un pedido que no existe. */
      if (c.turnoDelDia !== null && g.turno > c.turnoDelDia) {
        olvidarPedidoEnCurso();
        return;
      }

      /* ⚠ VERDE SOLO cuando el vendedor tocó "Empezar". Mientras no lo toque,
         c.preparando viene en null y esto no entra. Antes entraba siempre para
         el primer cliente del día, que veía "ya están preparando el tuyo" en
         el mismo segundo en que enviaba el pedido. */
      if (c.preparando !== null && g.turno <= c.preparando) {
        sec.classList.add('es-tuyo');
        estado.textContent = '🔥 Ya están preparando el tuyo';
        detalle.textContent = 'Puedes ir pasando a recogerlo.';
        return;
      }

      sec.classList.remove('es-tuyo');
      var delante = cuantosDelante(c, g.turno);

      if (delante === 0) {
        estado.textContent = 'Eres el siguiente';
        detalle.textContent = c.preparando !== null
          ? 'Están preparando el turno ' + c.preparando + '.'
          : 'Tu pedido es el primero de la fila.';
      } else {
        estado.textContent = delante === 1 ? 'Falta uno antes que tú' : 'Faltan ' + delante + ' antes que tú';
        detalle.textContent = c.preparando !== null
          ? 'Están preparando el turno ' + c.preparando + '.'
          : 'Tu pedido está en la fila.';
      }
    }).catch(function () {
      // Sin conexión no se le muestra un error: se esconde y ya. Volverá a
      // intentarlo en el siguiente ciclo sin molestar a nadie.
      $('#pedidoEnCurso').hidden = true;
    });
  }


  /* ==========================================================================
     4ter) REPETIR EL ÚLTIMO PEDIDO
     Qué hace: si este celular ya pidió antes, ofrece volver a armar lo mismo
     con un toque.
     Por qué: en comida rápida mucha gente repite siempre lo mismo. Obligarlo a
     rearmar el pedido plato por plato es la fricción más tonta que puede tener
     un sistema de pedidos.
     ⚠ NO SE GUARDAN LOS PRECIOS, solo los identificadores de los platos y las
     cantidades. Al agregarlo, los precios se vuelven a leer del menú de la
     página. Si se guardaran, un cliente que pidió hace un mes volvería con los
     precios viejos — y publicar un precio que no es el real va contra el
     Estatuto del Consumidor.
     Vive en localStorage: es de ESTE aparato y no viaja a ningún servidor.
     ========================================================================== */

  var CLAVE_ULTIMO = 'pichi_ultimo_pedido';

  /** Guarda qué pidió, sin precios. Se llama al confirmar un pedido. */
  function guardarUltimoPedido() {
    var lista = Object.keys(carrito).map(function (id) {
      return { id: id, cantidad: carrito[id].cantidad };
    });
    if (!lista.length) { return; }
    try {
      localStorage.setItem(CLAVE_ULTIMO, JSON.stringify({ cuando: Date.now(), items: lista }));
    } catch (e) { /* almacenamiento bloqueado: simplemente no se ofrece */ }
  }

  /** Lee el pedido anterior y descarta lo que ya no exista en el menú. */
  function leerUltimoPedido() {
    var guardado = null;
    try { guardado = JSON.parse(localStorage.getItem(CLAVE_ULTIMO) || 'null'); } catch (e) {}
    if (!guardado || !guardado.items || !guardado.items.length) { return null; }

    // Si un plato salió del menú desde la última vez, se ignora. Sin esto, el
    // botón agregaría un producto que ya no se vende.
    var vivos = guardado.items.filter(function (it) {
      return document.querySelector('.plato[data-id="' + it.id + '"]');
    });
    return vivos.length ? vivos : null;
  }

  function mostrarRepetir() {
    var items = leerUltimoPedido();
    var caja = $('#repetirPedido');
    if (!caja) { return; }
    if (!items) { caja.hidden = true; return; }

    // El texto se arma con los nombres y precios de AHORA, no con los de antes.
    var partes = [], total = 0;
    items.forEach(function (it) {
      var plato = document.querySelector('.plato[data-id="' + it.id + '"]');
      var btn = plato.querySelector('.plato__agregar');
      partes.push(it.cantidad + '× ' + btn.getAttribute('data-nombre'));
      total += parseInt(btn.getAttribute('data-precio'), 10) * it.cantidad;
    });
    $('#repetirDetalle').textContent = partes.join(' · ') + ' — ' + pesos(total);
    caja.hidden = false;
  }

  /** Mete el pedido anterior en el carrito, con los precios de hoy. */
  function repetirPedido() {
    var items = leerUltimoPedido();
    if (!items) { return; }
    items.forEach(function (it) {
      var plato = document.querySelector('.plato[data-id="' + it.id + '"]');
      for (var i = 0; i < it.cantidad; i++) { cambiarCantidad(plato, 1); }
    });
    $('#repetirPedido').hidden = true;
    medirEvento('repitio_pedido');
    // Se lleva al cliente al carrito para que vea que sí se agregó.
    $('#carritoBarra').scrollIntoView({ block: 'nearest' });
  }

  function olvidarUltimoPedido() {
    try { localStorage.removeItem(CLAVE_ULTIMO); } catch (e) {}
    $('#repetirPedido').hidden = true;
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
    lineas.push('Entrega: Paso a recogerlo');
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
    /* ⚠ LOS BOTONES SE ENGANCHAN ANTES DE DECIDIR NADA, y el orden importa.
       Antes, la decisión iba primero: a un visitante que YA había aceptado las
       cookies se le llamaba cargarMapa(), que BORRA el aviso del mapa y con él
       el botón "Ver el mapa". Dos líneas después se le pedía un
       addEventListener a ese botón que ya no existía → error de JavaScript →
       la función se cortaba ahí y **nunca se ejecutaba lo que venía después**:
       el aviso de instalar la app y TODA la medición de Analytics (clics en
       WhatsApp, en el mapa y en el teléfono).
       O sea: a todo cliente que volvía —los más valiosos— dejaba de medírsele
       cualquier clic, en silencio. No se veía probando porque en una sesión
       nueva la decisión aún no existe y el mapa no se carga de entrada.
       Enganchar primero y decidir después lo hace imposible de repetir. */
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
    // Se comprueba que exista además del orden: si el mapa ya está puesto, el
    // botón no está, y eso es normal — no un fallo que deba tumbar la página.
    var verMapa = $('#btnVerMapa');
    if (verMapa) { verMapa.addEventListener('click', cargarMapa); }

    // Y AHORA sí se decide qué hacer con lo que el visitante ya había dicho.
    var decision = null;
    try { decision = localStorage.getItem(CLAVE_COOKIES); } catch (e) { /* almacenamiento bloqueado */ }

    if (decision === 'aceptadas') {
      cargarAnalytics();
      cargarMapa();
    } else if (decision !== 'rechazadas') {
      mostrarBanner(true);
    }
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
    // Al desaparecer el banner queda libre la esquina de abajo: ahí sí se puede
    // ofrecer la instalación, que estaba esperando su turno.
    if (!visible) { setTimeout(mostrarInstalar, 800); }
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
     7bis) INSTALAR LA APP EN EL CELULAR
     Qué hace: ofrece poner el ícono del local en la pantalla de inicio.
     Por qué: el cliente que la instala no tiene que acordarse de la dirección
     web ni buscarla otra vez. Entra de un toque, como a cualquier aplicación.

     SON DOS MUNDOS DISTINTOS Y HAY QUE TRATARLOS DISTINTO:
       · Android/Chrome avisa solo con el evento beforeinstallprompt, y el
         navegador muestra su propio cuadro de instalación. Ahí el botón
         "Instalar" instala de verdad.
       · iPhone/Safari NO tiene ese evento: la instalación es manual, por el
         menú Compartir. Ahí no se puede instalar por código, así que lo único
         honesto es explicarle los dos pasos. Prometer un botón que no instala
         sería mentirle.

     CUÁNDO NO SE MUESTRA:
       · Si ya está instalada (se detecta con display-mode: standalone).
       · Mientras el banner de cookies esté en pantalla: el consentimiento manda,
         y dos cajas abajo a la vez es justo el amontonamiento que ya rompió esta
         página una vez (ver decisión 9 del CLAUDE.md).
       · Si el cliente dijo "ahora no": no se le vuelve a preguntar.
     ========================================================================== */

  var CLAVE_INSTALAR = 'pichi_instalar_no';
  var eventoInstalar = null;

  function yaEstaInstalada() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  function esIPhone() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function dijoQueNo() {
    try { return localStorage.getItem(CLAVE_INSTALAR) === '1'; } catch (e) { return false; }
  }

  function mostrarInstalar() {
    var caja = $('#avisoInstalar');
    if (!caja) { return; }
    if (yaEstaInstalada() || dijoQueNo()) { return; }
    // El banner de cookies manda: primero se decide eso.
    if (document.body.classList.contains('cookies-visibles')) { return; }
    // En Android solo se ofrece si el navegador dijo que se puede instalar.
    if (!eventoInstalar && !esIPhone()) { return; }

    // El texto depende de si se puede instalar de verdad o hay que explicarlo.
    // Se mira PRIMERO si hay evento del navegador y no si es un iPhone: si
    // algún día Safari soporta la instalación automática, este aviso se adapta
    // solo en vez de seguir dando instrucciones que ya no harían falta.
    if (eventoInstalar) {
      $('#instalarComo').textContent = 'Instálala en tu celular y pide sin buscar la página.';
      $('#btnInstalar').textContent = 'Instalar';
    } else {
      $('#instalarComo').textContent = 'Toca Compartir y luego "Añadir a pantalla de inicio".';
      $('#btnInstalar').textContent = 'Entendido';
    }
    caja.hidden = false;
    caja.classList.add('visible');
  }

  function esconderInstalar(paraSiempre) {
    var caja = $('#avisoInstalar');
    caja.classList.remove('visible');
    caja.hidden = true;
    if (paraSiempre) {
      try { localStorage.setItem(CLAVE_INSTALAR, '1'); } catch (e) {}
    }
  }

  function iniciarInstalar() {
    var caja = $('#avisoInstalar');
    if (!caja) { return; }

    window.addEventListener('beforeinstallprompt', function (e) {
      // Se corta el cuadro automático del navegador para mostrarlo cuando
      // convenga, no encima del menú apenas entra.
      e.preventDefault();
      eventoInstalar = e;
      mostrarInstalar();
    });

    window.addEventListener('appinstalled', function () {
      esconderInstalar(true);
      medirEvento('instalo_app');
    });

    $('#btnInstalar').addEventListener('click', function () {
      if (eventoInstalar) {
        eventoInstalar.prompt();
        eventoInstalar.userChoice.then(function (r) {
          medirEvento('instalar_' + (r && r.outcome === 'accepted' ? 'si' : 'no'));
          eventoInstalar = null;
          esconderInstalar(true);
        });
      } else {
        // iPhone: el botón solo cierra el aviso; la instrucción ya está leída.
        esconderInstalar(true);
      }
    });

    $('#btnCerrarInstalar').addEventListener('click', function () { esconderInstalar(true); });

    // En iPhone no hay evento que esperar: se ofrece tras un momento, cuando ya
    // vio el menú y no cuando acaba de entrar.
    if (esIPhone()) { setTimeout(mostrarInstalar, 12000); }
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
    $('#colaAvisar').addEventListener('click', activarAvisoCola);
    $('#btnAgregarAlPedido').addEventListener('click', agregarAlPedido);
    $('#btnCopiarEnlace').addEventListener('click', copiarEnlace);
    $('#btnCerrarEnCurso').addEventListener('click', cerrarModal);

    /* Seguimiento del pedido en curso: se enciende al cargar la página, no al
       pedir. Es justo el caso del cliente que ya cerró la pestaña y vuelve. */
    arrancarSeguimiento();
    $('#cursoAbrir').addEventListener('click', abrirSeguimiento);
    $('#formPedido').addEventListener('submit', enviarPedido);

    // Cerrar tocando el fondo oscuro (pero no al tocar dentro de la caja).
    $('#modalPedido').addEventListener('click', function (e) {
      if (e.target === this) { cerrarModal(); }
    });
    // Cerrar con la tecla Escape: es lo que espera cualquiera que use teclado.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#modalPedido').classList.contains('abierto')) { cerrarModal(); }
    });

    // Cortina de cerrado: la salida al menú.
    var btnMenu = $('#btnVerMenu');
    if (btnMenu) { btnMenu.addEventListener('click', verElMenu); }

    // "¿Lo mismo de la otra vez?" — solo aparece si este celular ya pidió antes.
    mostrarRepetir();
    var btnRep = $('#btnRepetir');
    if (btnRep) { btnRep.addEventListener('click', repetirPedido); }
    var btnOlv = $('#btnOlvidarPedido');
    if (btnOlv) { btnOlv.addEventListener('click', olvidarUltimoPedido); }

    // Si el cliente se va a otra aplicación y vuelve, la cola se pone al día de
    // una en vez de esperar los 30 segundos del siguiente ciclo.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && relojCola) { pintarCola(); }
    });

    activarCategorias();
    iniciarCookies();
    iniciarInstalar();

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
