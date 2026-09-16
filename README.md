# Pichi Burguer — Sistema de pedidos

Sistema web de pedidos por turnos para **Pichi Burguer**, comida rápida en
Cartagena de Indias, Bolívar, Colombia.

**Dominio:** `pedidos-pichiburguerctg.com`
**Desarrollado por:** JX Company

---

## Qué hace

**El cliente** entra desde su celular, ve si el local está abierto, arma su pedido
con el menú completo y recibe **un número de turno en pantalla**. Al mismo tiempo
se le abre WhatsApp con el pedido ya escrito, listo para enviar.

**El vendedor** abre `/panel.html` con su clave y ve los pedidos entrando, en
orden de turno, uno debajo del otro: nombre, celular, número de pedido, hora
exacta, qué pidió, si es domicilio o para recoger, la dirección, la forma de pago,
las notas y el total. Puede marcar cada uno como "Entregado".

**Los pedidos se archivan solos.** A las 5 horas salen del panel activo y pasan al
historial. El historial completo se borra cada **sábado a las 7:00 a. m.**

---

## Cómo verlo en tu computador

No necesita instalar nada ni compilar nada.

**Opción rápida:** doble clic en `index.html`. El menú, el semáforo y el carrito
funcionan. Los pedidos se guardan en el propio navegador.

**Opción recomendada** (si tienes Python instalado), desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

Y abres `http://localhost:8000` en el navegador. El panel está en
`http://localhost:8000/panel.html`.

---

## Cómo subirlo a internet (Cloudflare Pages)

### 1. Crear el proyecto

1. Entra a **dash.cloudflare.com** → *Workers & Pages* → *Create* → *Pages*.
2. Sube la carpeta del proyecto (*Upload assets*) o conéctala a un repositorio de
   GitHub, que es mejor porque cada cambio se publica solo.
3. **Build command:** déjalo vacío. **Build output directory:** `/` (la raíz).
   Este proyecto no necesita compilarse.

### 2. Crear el almacén de pedidos (KV) — obligatorio

Sin este paso el sistema arranca, pero los pedidos **no se guardan en la nube**:
la API responde un error claro (503) y el sitio sigue funcionando solo con
WhatsApp.

1. En el panel de Cloudflare: *Workers & Pages* → **KV** → *Create a namespace*.
2. Ponle de nombre `pichi-burguer-pedidos` y créalo.
3. Vuelve a tu proyecto de Pages → *Settings* → *Bindings* → *Add binding* → *KV namespace*.
4. **Variable name:** escribe exactamente `PEDIDOS` (en mayúsculas).
   **KV namespace:** escoge el que acabas de crear.
5. Guarda y vuelve a desplegar el proyecto.

> ⚠ El nombre de la variable tiene que ser **`PEDIDOS`**, tal cual. Es el nombre
> que busca el código en `functions/api/pedidos.js`.

### 3. Poner la clave del panel — obligatorio

1. En tu proyecto de Pages → *Settings* → *Variables and Secrets*.
2. *Add variable* → tipo **Secret** (no "Plaintext").
3. **Nombre:** `PANEL_CLAVE` · **Valor:** la clave que quieras para el panel.
4. Guarda y vuelve a desplegar.

> La clave **no está escrita en ningún archivo** del proyecto, y así debe quedarse.
> Si la pusiéramos en el código, cualquiera podría verla con "Ver código fuente".
> Para cambiarla, solo se edita esta variable en Cloudflare — no se toca el código.

### 4. Conectar el dominio

*Custom domains* → *Set up a domain* → `pedidos-pichiburguerctg.com`.
Cloudflare configura el HTTPS solo. Deja una sola versión canónica (con `www` o
sin `www`, redirigiendo la otra) para no dividir el posicionamiento.

### 5. Avisarle a Google

Verifica el sitio en **Google Search Console** y envía `sitemap.xml`.
El archivo de verificación que Google te dé **nunca se borra del proyecto**.

---

## Zonas editables — qué puedes cambiar tú

Abre `index.html` en cualquier editor de texto y busca con **Ctrl+F** las palabras
`ZONA EDITABLE`. Cada zona trae escrito arriba qué cambiar, cómo, un ejemplo, el
límite de caracteres y qué NO tocar.

| Zona | Qué cambia | Archivo | ¿Se repite en otro lado? |
|---|---|---|---|
| **TEXTOS** | Titular y lema de la portada | `index.html` | No |
| **PRODUCTOS** | Los platos: nombre, descripción y precio | `index.html` | **Sí** — el precio vive además en el `data-precio` del botón, en el JSON-LD del `<head>` y en `llms.txt` |
| **HORARIOS** | Días y horas de atención | `index.html` | **Sí** — también en `js/config.js` y en el JSON-LD |
| **CONTACTO** | Dirección, barrio y WhatsApp | `index.html` | **Sí** — en `tel:`, `wa.me`, JSON-LD, geo tags, mapa, `js/config.js` y footer |

**Cómo se hace:** buscas la zona, cambias solo el texto que está entre `>` y `<`,
guardas. Si el sitio está conectado a GitHub: editas el archivo → *Commit changes*
→ Cloudflare vuelve a publicarlo solo en 1 o 2 minutos.

> **Regla de JX:** el teléfono, la dirección y los horarios **los cambia JX, no el
> cliente.** Esos datos tocan el JSON-LD y las geo tags, y si quedan distintos en
> un solo sitio, el posicionamiento local se rompe sin que nadie se dé cuenta.

### Los precios: se cambian en 4 sitios

Un precio no vive en un solo lugar. Para cambiar, por ejemplo, la Hamburguesa
Sencilla de $16.000 a $17.000:

1. `index.html` → zona **PRODUCTOS** → el texto `$16.000` que se ve.
2. `index.html` → en ese mismo plato, el atributo `data-precio="16000"` del botón
   *(sin puntos)*. **Este es el que suma el carrito** — si se olvida, la página
   muestra un precio y cobra otro.
3. `index.html` → el JSON-LD del `<head>`, en el `price` de ese plato.
4. `llms.txt` → la lista de precios.

### Los horarios: se cambian en 3 sitios

1. `js/config.js` → `horarios.dias` → el día que corresponda. **Este es el que
   enciende el semáforo verde o rojo.**
2. `index.html` → zona **HORARIOS** → la tabla que se ve.
3. `index.html` → el JSON-LD → `openingHoursSpecification`.

**Horario actual confirmado: todos los días de 6:00 p. m. a 11:00 p. m.**, sin día
de descanso. Los pedidos se dejan de recibir 15 minutos antes del cierre, porque
un pedido a las 10:59 no da tiempo de prepararlo (se cambia en `js/config.js` →
`minutosAntesDelCierre`).

En `js/config.js` cada día tiene además un campo `confirmado`. Si algún día el
local cambia el horario y todavía no está seguro, se pone en `false`: la página
muestra `{POR CONFIRMAR}` en la tabla y ese día **no se publica en el JSON-LD**,
para que Google no le diga a la gente un horario que no es.

### Cambiar la clave del panel

No se toca el código: se edita la variable `PANEL_CLAVE` en Cloudflare
(*Settings* → *Variables and Secrets*) y se vuelve a desplegar.

### Cambiar una foto

Toda imagen del proyecto va en **WebP**. Si tienes una foto en JPG o PNG, hay que
convertirla primero, conservando su resolución y calidad, guardarla en `img/` con
un nombre descriptivo (nunca `foto1.webp`) y actualizar el `src` en el HTML.

---

## Google Analytics — dónde ves cuánta gente entra

El sitio trae GA4 listo, pero **falta el identificador**. Para activarlo:

1. Entra a **analytics.google.com** y crea una propiedad para el sitio.
2. Google te dará un código con la forma `G-XXXXXXXXXX`.
3. Ábrelo en `js/config.js` → `analytics.measurementId` y reemplaza
   `'G-XXXXXXXXXX'` por el tuyo. Guarda y publica.

**Dónde mirar después**, en analytics.google.com:
- **Informes → Tiempo real**: cuánta gente está en la página ahorita mismo.
- **Informes → Adquisición**: de dónde llega la gente (Google, Instagram,
  WhatsApp, o escribiendo el enlace directo).
- **Informes → Interacción → Eventos**: cuántos hicieron clic en WhatsApp,
  cuántos abrieron el mapa y cuántos enviaron un pedido. Eso es lo que de verdad
  importa: no las visitas, sino cuántas se volvieron pedidos.

> El script de Google **no carga hasta que el visitante acepta las cookies**. No
> es un capricho: en Colombia la Resolución 32.126 de 2022 de la SIC es más
> estricta que la norma europea y exige consentimiento previo, expreso e
> informado. Cargar Analytics antes de que acepten sería una infracción.

---

## Ficha de Google (Google Business Profile)

Para un negocio local, **aparecer bien en Google Maps rinde más que el SEO
tradicional**. Mucha gente busca "hamburguesas cerca de mí" y pide en el primer
sitio que sale con buenas fotos.

Qué hacer:
1. Reclamar y verificar la ficha en **business.google.com**.
2. **Enlazar este sitio web** desde la ficha.
3. Escribir el nombre, la dirección y el teléfono **exactamente igual** que en la
   página: *Pichi Burguer* · *Cra 58A #6, Bernardo Jaramillo, Cartagena* ·
   *+57 300 4752529*. Una sola letra distinta debilita el posicionamiento.
4. Subir fotos reales del local y de la comida, escoger bien la categoría
   (*Restaurante de hamburguesas*) y mantener los horarios actualizados.
5. Responder las reseñas, todas, incluidas las malas.

---

## Estructura de archivos

```
pichi-burguer-pedidos/
├── index.html              Página del cliente
├── panel.html              Panel del vendedor (no lo indexa Google)
├── 404.html                Página de error con el diseño del sitio
├── privacidad.html         Política de privacidad (Ley 1581 de 2012)
├── cookies.html            Política de cookies (Resolución 32.126 de 2022)
├── terminos.html           Términos, condiciones y propiedad intelectual
├── compras.html            Compras, envíos, devoluciones, garantía y retracto
├── _headers                Cache, seguridad y noindex del panel
├── robots.txt              Permite los bots de IA y apunta al sitemap
├── sitemap.xml
├── llms.txt                Mapa del sitio para agentes de IA
├── site.webmanifest
├── CLAUDE.md               Contexto técnico para futuros chats de IA
├── README.md               Este archivo
├── css/
│   └── styles.css          Todo el CSS
├── js/
│   ├── config.js           ← el archivo que se toca para cambiar cosas
│   ├── almacen.js          Capa de datos (nube o aparato local)
│   ├── script.js           Página del cliente
│   └── panel.js            Panel del vendedor
├── img/                    Todas las imágenes en WebP (+ favicon e iconos)
└── functions/
    └── api/
        └── pedidos.js      Función serverless de Cloudflare (KV)
```

---

## Cómo funciona por dentro (resumen)

- **Sin base de datos.** Los pedidos de cada día viven en **un solo documento** de
  Cloudflare KV (`dia:AAAA-MM-DD`). Refrescar el panel cuesta 1 lectura; crear un
  pedido, 1 lectura y 1 escritura. Con 60 pedidos diarios se usan unas 120
  escrituras de las 1.000 gratuitas.
- **Los turnos reinician en 1 cada día.**
- **El total se recalcula en el servidor**, nunca se acepta el que manda el
  navegador.
- **Modo local disponible.** Si algún día no se quiere backend, en `js/config.js`
  se cambia `sistema.modo` de `'nube'` a `'local'` y todo funciona en una sola
  tablet en el mostrador. Es **una sola línea**.
- **Respaldo por WhatsApp siempre activo.** Si Cloudflare o el internet fallan, el
  pedido igual le llega al vendedor por WhatsApp y no se pierde la venta.

---

## Cómo hacer una copia de seguridad

- **Del sitio:** copia la carpeta completa del proyecto. Eso es todo — no hay base
  de datos que respaldar ni servicios externos de los que dependa.
- **De los pedidos:** en el panel, la pestaña *Historial* muestra los pedidos
  archivados de la semana. Si se quieren guardar, se copian antes del sábado, que
  es cuando se borran.

---

## Propiedad

**El código fuente y todo el contenido de este sitio son propiedad de Pichi
Burguer.** Se entregan todos los archivos sin minificar ni ofuscar, listos para
abrir, leer y editar. No hay ninguna parte del sistema que dependa de un servicio
propietario de JX Company.

**Dominio y hosting**: por ser un negocio pequeño sin equipo técnico, el sitio
queda alojado en la **cuenta de Cloudflare de JX Company**. Cuando el cliente lo
pida, se transfiere a su propia cuenta: se crea la cuenta de Cloudflare a su
nombre, se le da acceso al repositorio, se mueve el dominio y se le entregan las
credenciales de GA4 y Search Console. Sin costo y sin tiempo de caída.

---

## Aviso legal

Las páginas legales (`privacidad.html`, `cookies.html`, `terminos.html`,
`compras.html`) están redactadas siguiendo el marco colombiano vigente —Ley 1581
de 2012, Resolución 32.126 de 2022 de la SIC y Ley 1480 de 2011—, pero **no son
asesoría jurídica**. Antes de publicarlas conviene que las revise un abogado,
sobre todo porque este sitio recoge nombres y teléfonos de clientes.

Además, hay datos marcados `{POR CONFIRMAR}` que deben completarse antes de
publicar: razón social o nombre del responsable, NIT o cédula, y un correo de
contacto real para que los clientes puedan ejercer sus derechos sobre sus datos.
Mientras tanto el sistema funciona, pero esas páginas están incompletas.

También quedan pendientes los **precios de las bebidas y adiciones**. El sitio
avisa que sí las venden y que se piden por el campo de notas; publicar un precio
inventado iría contra el Estatuto del Consumidor.

---

<p align="center">
  <sub>DISEÑO Y DESARROLLO: <b>JX COMPANY</b></sub>
</p>
