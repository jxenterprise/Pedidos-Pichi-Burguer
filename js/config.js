/* ============================================================================
   PICHI BURGUER · Sistema de pedidos en línea
   ARCHIVO: js/config.js
   ----------------------------------------------------------------------------
   QUÉ CONTIENE: toda la configuración operativa del sistema en un solo lugar.
   Es el ÚNICO archivo JS que se toca para cambiar horarios, número de WhatsApp,
   domicilios, métodos de pago o el modo de guardado de los pedidos.

   FUNCIÓN EN EL SISTEMA:
     · js/script.js  lo lee para pintar el semáforo abierto/cerrado y armar
                     el mensaje de WhatsApp del pedido.
     · js/almacen.js lo lee para saber si guarda en la nube (Cloudflare KV)
                     o en el propio aparato (modo local).
     · js/panel.js   lo lee para el reloj, las horas de archivado y la limpieza.

   OJO — LO QUE **NO** VA AQUÍ:
     El menú (productos, descripciones y precios) NO está en este archivo:
     vive escrito en el HTML de index.html, dentro de la ZONA EDITABLE ·
     PRODUCTOS. Se hizo así a propósito para que Google y los bots de IA lean
     el menú en el código servido; si el menú lo pintara el JavaScript, los
     buscadores verían la página vacía y el negocio no posicionaría.

   ⚠ ESTE ARCHIVO ES PÚBLICO: cualquiera puede verlo desde el navegador.
     NUNCA escribir aquí contraseñas, claves ni datos privados.
     La clave del panel del vendedor vive en Cloudflare (variable de entorno
     PANEL_CLAVE), no en este archivo. Ver README.md → "Clave del panel".
   ========================================================================== */

window.PICHI_CONFIG = {

  /* --------------------------------------------------------------------------
     1) DATOS DEL NEGOCIO
     De dónde salen: logo, menú impreso y perfil de WhatsApp Business del local.
     ⚠ SE REPITEN EN: index.html (texto visible, JSON-LD, geo tags, footer),
       panel.html, las 4 páginas legales, llms.txt y sitemap.xml.
       Si cambia el teléfono o la dirección, hay que cambiarlo en TODOS.
     ------------------------------------------------------------------------ */
  negocio: {
    nombre: 'Pichi Burguer',            // Se escribe con "gu", igual que el logo
    ciudad: 'Cartagena de Indias',
    direccion: 'Cra 58A #6, Bernardo Jaramillo',
    barrio: 'Bernardo Jaramillo',
    // Teléfono en formato internacional SIN "+", espacios ni guiones.
    // Así lo exige la URL de wa.me; con espacios el enlace no abre.
    whatsapp: '573004752529',
    telefonoVisible: '+57 300 4752529',
    dominio: 'https://pedidos-pichiburguerctg.com'
  },

  /* --------------------------------------------------------------------------
     2) HORARIOS DE ATENCIÓN  ·  ZONA EDITABLE · HORARIOS
     Qué controla: el semáforo verde/rojo del encabezado, el bloqueo del botón
     de pedir cuando está cerrado y el mensaje "abrimos a las …".

     CÓMO SE EDITA: cambia solo "abre" y "cierra" (formato 24 horas "HH:MM").
       · cerrado: true      → ese día el local no abre.
       · confirmado: false  → dato provisional que JX todavía no confirmó.

     ✔ CONFIRMADO POR JX (sept. 2026): el local abre TODOS LOS DÍAS de
       18:00 a 23:00, sin día de descanso. Los siete días quedan con
       confirmado: true, y por eso los siete se publican en el JSON-LD.

     Si algún día el local cambia de horario o decide descansar un día, se
     edita aquí y se pone confirmado: false mientras el dato nuevo no esté
     seguro: así la página muestra {POR CONFIRMAR} y ese día NO se publica en
     el JSON-LD. Nunca publicar un horario sin confirmar — Google le diría a
     la gente una hora inventada y llegarían clientes con el local cerrado.

     ⚠ SE REPITE EN: index.html (bloque de horarios visible + JSON-LD
       openingHoursSpecification). Al confirmar, actualizar los dos lugares.

     ZONA HORARIA: todos los cálculos se hacen en hora de Colombia
     (America/Bogota, UTC-5, sin horario de verano), no en la hora del celular
     del visitante. Así un turista con el teléfono en otra zona horaria ve el
     estado correcto del local.
     ------------------------------------------------------------------------ */
  horarios: {
    zonaHoraria: 'America/Bogota',
    dias: {
      // 0 = domingo … 6 = sábado (mismo orden que Date.getDay() de JavaScript)
      0: { nombre: 'Domingo',   abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      1: { nombre: 'Lunes',     abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      2: { nombre: 'Martes',    abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      3: { nombre: 'Miércoles', abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      4: { nombre: 'Jueves',    abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      5: { nombre: 'Viernes',   abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  },
      6: { nombre: 'Sábado',    abre: '18:00', cierra: '23:00', cerrado: false, confirmado: true  }
    },
    // Minutos antes del cierre en que se dejan de recibir pedidos nuevos.
    // Motivo: si alguien pide a las 22:59 no da tiempo de prepararlo.
    minutosAntesDelCierre: 15
  },

  /* --------------------------------------------------------------------------
     3) ENTREGA Y PAGOS
     Confirmado por JX: hacen domicilio Y también se puede recoger en el local.
     ✔ CONFIRMADO POR JX: el domicilio NO tiene tarifa fija — depende del
       barrio y se acuerda por WhatsApp. Por eso el sistema no suma ningún
       valor de envío y lo dice en el resumen del pedido. Esto NO es un dato
       pendiente: es la forma de trabajar del local.
       Si algún día ponen tarifa fija, se escribe el número en costoDomicilio
       (ej. 4000) y el sistema la suma y la muestra sola.
     ------------------------------------------------------------------------ */
  entrega: {
    domicilio: true,
    recoger: true,
    costoDomicilio: null,               // null = no se cobra ni se muestra valor
    notaDomicilio: 'El valor del domicilio se acuerda por WhatsApp según el barrio.'
  },
  pagos: ['Efectivo', 'Nequi', 'Transferencia'],

  /* --------------------------------------------------------------------------
     4) MOTOR DE PEDIDOS (arquitectura A + B)
     ----------------------------------------------------------------------------
     A) NUBE  — los pedidos se guardan en Cloudflare KV a través de la función
        /api/pedidos. El vendedor los ve desde cualquier celular en panel.html.
     B) WHATSAPP — además, cada pedido abre WhatsApp con el resumen ya escrito.
        Es el respaldo: aunque se caiga el internet o Cloudflare, el pedido
        igual le llega al vendedor y no se pierde la venta.

     modo:
       'auto'  → RECOMENDADO. Intenta la nube; si falla, guarda en el propio
                 aparato y sigue funcionando. El cliente nunca ve un error.
       'nube'  → obliga a usar Cloudflare KV (si falla, avisa del fallo).
       'local' → todo en el navegador del vendedor, sin backend. Sirve para
                 probar el sistema o para trabajar con una tablet en el mostrador.

     👉 CAMBIAR DE MODO ES ESTA SOLA LÍNEA. Nada más se toca.
     ------------------------------------------------------------------------ */
  sistema: {
    modo: 'auto',
    rutaApi: '/api/pedidos',

    // Horas que un pedido permanece en el panel activo antes de pasar al
    // historial. Pedido por JX: 5 horas. No se borra, solo cambia de pestaña.
    horasEnPanelActivo: 5,

    // Limpieza automática del historial: sábados a las 7:00 AM (hora Colombia).
    // Formato: día de la semana (0=domingo … 6=sábado) y hora en 24h.
    limpiezaHistorial: { dia: 6, hora: 7, minuto: 0 },

    // Cada cuántos segundos el panel del vendedor busca pedidos nuevos.
    // NO BAJAR DE 10: cada consulta gasta una lectura del plan gratuito de
    // Cloudflare (100.000 al día). A 15 segundos, 12 horas de trabajo gastan
    // unas 2.900 lecturas — sobra muchísimo margen.
    refrescoPanelSegundos: 15,

    // Los turnos vuelven a empezar en 1 cada día, como se maneja en el local.
    turnosReinicianCadaDia: true
  },

  /* --------------------------------------------------------------------------
     5) GOOGLE ANALYTICS 4
     JX pidió dejarlo instalado pero con el ID pendiente.
     ⚠ {POR CONFIRMAR}: reemplazar 'G-XXXXXXXXXX' por el ID real.
     El script NO se carga hasta que el visitante acepte las cookies
     (Resolución 32.126 de 2022 de la SIC: el consentimiento debe ser previo).
     ------------------------------------------------------------------------ */
  analytics: {
    activo: true,
    measurementId: 'G-XXXXXXXXXX'       // {POR CONFIRMAR}
  }
};
