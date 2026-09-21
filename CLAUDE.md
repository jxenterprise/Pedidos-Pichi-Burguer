# CLAUDE.md — Pichi Burguer · Sistema de pedidos

Contexto para cualquier chat futuro (mío o de otra IA) que retome este proyecto.
**Léelo completo antes de tocar un solo archivo.**

---

## 📌 Qué es este proyecto

Sistema web de **pedidos por turnos** para **Pichi Burguer**, local de comida
rápida en Cartagena (Bolívar, Colombia). Hecho por **JX Company**.

No es una landing informativa: es un **sistema funcional de dos caras**.

| Cara | Archivo | Quién la usa |
|---|---|---|
| Pública | `index.html` | El cliente: ve el menú, arma su pedido y recibe un número de turno |
| Privada | `panel.html` | El vendedor: ve los pedidos entrando, en orden de turno |

**Flujo completo:** el cliente entra → ve si el local está abierto (semáforo) →
agrega platos al carrito → llena nombre, celular, si es domicilio o para recoger,
y forma de pago → envía → **recibe su número de turno en pantalla** y, en
paralelo, se le abre WhatsApp con el pedido ya escrito → el vendedor lo ve en el
panel → lo marca "Entregado" → a las 5 horas el pedido sale del panel activo y
pasa al historial → el historial se borra solo, el sábado a las 7:00 a. m.

**Alcance del skill**: `skill-jx-landing-pages-2026` está escrito para landings de
UNA sola página. Este proyecto tiene dos páginas funcionales (`index` + `panel`)
más las legales. Se aplicaron todas las reglas del skill igual, pero conviene
saberlo: **no es una landing normal**.

---

## 🖼️ REGLA DE IMÁGENES — SIEMPRE WebP

Todas las imágenes de este proyecto van en **WebP**, sin excepción. Cualquier foto
nueva que JX entregue (JPG, PNG, HEIC, capturas, lo que sea) se **convierte a WebP
de inmediato** antes de meterla al proyecto, conservando resolución y calidad
originales, y se guarda en `img/`. Nunca dejar JPG/PNG en el proyecto ni entregar
copias de respaldo en otros formatos.

**Única excepción técnica**: `favicon` (`.ico`/`.png`/`.svg`) y
`apple-touch-icon.png`, porque ningún navegador soporta favicons en WebP.

---

## 🎨 REGLA DE DISEÑO — TODO LO NUEVO USA ESTE MISMO DISEÑO

Cualquier sección, componente, botón o página que se agregue a futuro debe usar
**exactamente** el diseño de esta web: mismos colores, mismas tipografías, mismos
tamaños, radios, sombras y espaciados, y los mismos patrones de componente que ya
existen. **Nunca un diseño distinto.** Si algo no alcanza con lo que hay,
preguntarle a JX antes de inventar.

### Ficha de diseño de este proyecto

**Modo de diseño usado: MODO 2** — diseño libre a partir de imagen de referencia.
La paleta se extrajo **píxel a píxel del logo real** del local (análisis con PIL
sobre `logo-pichi-burguer-cartagena.webp`, 1254×1254). No se usó "Diseño JX": JX
no lo autorizó para este proyecto y la identidad del cliente manda.

**Paleta — variables `:root` de `css/styles.css`:**

| Variable | Hex | Uso |
|---|---|---|
| `--negro` | `#000000` | Fondo general. Es el 68% de los píxeles del logo; el logo tiene fondo negro sólido sin transparencia, así que el sitio va en negro para que se funda sin recuadro feo |
| `--negro-sup` | `#0C0C0C` | Superficie de tarjetas |
| `--negro-sup-2` | `#141414` | Superficie elevada: modal y panel |
| `--linea` | `rgba(255,255,255,.10)` | Bordes sutiles |
| `--linea-fuerte` | `rgba(255,255,255,.18)` | Bordes de énfasis |
| `--rojo` | `#E01220` | Rojo de marca: bloques grandes y botones |
| `--rojo-vivo` | `#FB0212` | Rojo EXACTO del marco del logo. **Solo detalles finos** — en bloques grandes se ve casi neón y el skill prohíbe neones |
| `--rojo-oscuro` | `#9E0A14` | Estados presionados |
| `--amarillo` | `#FFD100` | Etiquetas de categoría, igual que el menú impreso del local |
| `--naranja` | `#FE9B05` | Naranja del pan de la hamburguesa: acentos cálidos |
| `--verde` | `#29B24A` | Semáforo "abierto" |
| `--blanco` | `#FFFFFF` | Textos fuertes |
| `--texto` | `#F2F2F2` | Texto de cuerpo |
| `--texto-suave` | `#B5B5B5` | Descripciones y textos secundarios |
| `--texto-tenue` | `#7E7E7E` | Notas al pie y avisos menores |

**Tipografías** (Google Fonts, carga no bloqueante con `preload` + `onload`):
- Títulos: **Archivo**, itálica, peso 800 — se parece a la del logo.
- Cuerpo y precios: **Inter**, pesos 400/500/600/700 — neutra y muy legible en pantallas pequeñas.
- Los `h1`, `h2` y `h3` van en MAYÚSCULAS por CSS (`text-transform: uppercase`),
  igual que el menú impreso. **Excepción**: `.pedido__quien h3` del panel, donde
  va el nombre del cliente — ese se respeta tal cual lo escribió.

**Radios, sombras y espaciados:**
```
--radio-sm: 10px    --radio: 14px    --radio-lg: 20px    --radio-full: 999px
--sombra:      0 4px 16px rgba(0,0,0,.55)
--sombra-alta: 0 10px 34px rgba(0,0,0,.7)
--espacio-seccion: clamp(48px, 8vw, 84px)
--ancho-max: 1180px  (1240px desde 1440px de ancho)
--alto-barra: 62px   (56px en móvil ≤500px)
```

**Patrones de componente:**
- **Tarjeta de plato** (`.plato`): fondo `--negro-sup`, borde `--linea`, radio
  `--radio`, nombre en Archivo mayúsculas, descripción en `--texto-suave`, precio
  en Inter 700, y botón "Agregar" que se transforma en un contador −/+.
- **Botón** (`.btn`): radio `--radio-sm` (10px), altura mínima 48px, peso 700.
  (`--radio-full` NO es para botones: se usa en las píldoras del semáforo, en los
  chips de la barra de categorías y en el contador del panel.)
  Variantes: `.btn--rojo` (acción principal), `.btn--ama` (amarillo, aceptar),
  `.btn--linea` (contorno, secundario).
- **Sección**: `<section>` con `padding: var(--espacio-seccion) 0`, título `h2`
  centrado con una línea amarilla corta debajo.
- **Estados del semáforo**: `.estado` es una píldora; `.esta-abierto` la pinta de
  verde y `.esta-cerrado` de rojo.

**Prohibido en este proyecto** (regla del skill, ya respetada): neones, glows,
`text-shadow` de colores brillantes, degradado morado-azul de plantilla, blobs de
fondo, animaciones exageradas.

---

## 🗂️ ÍNDICE DE ZONAS EDITABLES

Las zonas existen SOLO en `index.html`. Son 4 de las 6 permitidas. **No inventar
zonas nuevas ni duplicar estas.** Nunca hay zonas en el CSS, el JS ni el `<head>`.

| Zona | Línea aprox. | Qué contiene | ⚠ Se repite en |
|---|---|---|---|
| `ZONA EDITABLE · TEXTOS` | 252 | Titular y lema de la portada | — |
| `ZONA EDITABLE · PRODUCTOS` | 290 | Los 15 platos: nombre, descripción y precio | **JSON-LD `Menu`** (en el `<head>`), atributo `data-precio` de cada botón, y `llms.txt`. Si cambia un precio hay que cambiarlo en los 4 sitios |
| `ZONA EDITABLE · HORARIOS` | 685 | Tabla de días y horas | **`js/config.js` → `horarios.dias`** (de ahí sale el semáforo) y **JSON-LD `openingHoursSpecification`**. Los tres tienen que decir lo mismo |
| `ZONA EDITABLE · CONTACTO` | 714 | Dirección, barrio, WhatsApp | Enlace `tel:`, botón flotante `wa.me`, JSON-LD `telephone` y `address`, geo tags del `<head>`, iframe del mapa, `js/config.js` → `negocio`, y el footer |

**Regla de JX que aplica aquí**: teléfono, dirección y horarios **los cambia JX,
no el cliente** — tocan JSON-LD y geo tags, y ahí es donde se rompe el SEO local
sin que nadie se dé cuenta.

**Fuera de zona pero igual de delicado**: la sección `#preguntas` (FAQ visible) y
el bloque `FAQPage` del `<head>` tienen que decir **exactamente lo mismo**. Si se
cambia una pregunta hay que cambiar las dos, y si se borra la sección hay que
borrar también el `FAQPage`. Ver decisión 13.

---

## 🧭 MAPA DEL CÓDIGO

Registro de todo el código. **Se suma, nunca se borra lo anterior.**

### Archivos y qué hace cada uno

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página del cliente. **Cortina de cerrado (`#pantallaCerrado`)**, barra fija con semáforo, portada con logo, menú de categorías deslizable, los 15 platos, bebidas, cómo pedir, preguntas frecuentes (`#preguntas`), horarios, contacto, mapa condicionado, footer, barra del carrito, ventana modal (formulario + pantalla de turno) y banner de cookies |
| `panel.html` | Panel del vendedor. Pantalla de clave → pestañas Activos / Historial, buscador, **modo cocina (`#cocina`)** y **ventana de confirmar (`#modalConfirmar`)** |
| `404.html` | Error con el diseño del sitio |
| `privacidad.html` | Ley 1581 de 2012 (datos personales) |
| `cookies.html` | Resolución 32.126 de 2022 de la SIC |
| `terminos.html` | Uso del sitio + propiedad intelectual |
| `compras.html` | Compras, envíos, devoluciones, garantía y retracto (Ley 1480 de 2011) |
| `css/styles.css` | **Todo** el CSS. 25 variables en `:root`, ~250 bloques comentados |
| `js/config.js` | **El archivo que JX toca para cambiar cosas.** Negocio, horarios, entrega, pagos, modo del sistema y analytics |
| `js/almacen.js` | Capa de datos intercambiable: habla con la nube o con el propio aparato |
| `js/script.js` | Página del cliente: semáforo, horarios, carrito, pedido, WhatsApp, categorías, cookies, **seguimiento del pedido en curso (bloque 4quater)** y **aviso al celular** |
| `js/panel.js` | Panel del vendedor. El **bloque 0** es la ventana de confirmar que reemplaza al `confirm()` del navegador — ver decisión 31 |
| `functions/api/pedidos.js` | Cloudflare Pages Function: crear, listar, marcar entregado, cambiar estado, deshacer entregado, cola pública de turnos, borrar un pedido, borrar historial y limpieza semanal |
| `_headers` | `no-cache` en CSS/JS, `no-store` en `/api/`, cabeceras de seguridad, `noindex` en el panel |
| `robots.txt` · `sitemap.xml` · `llms.txt` · `site.webmanifest` | SEO y metadatos |

### Decisiones tomadas y POR QUÉ (esto es lo importante)

**1. Un solo documento en KV por día — no una clave por pedido.**
El plan gratuito de Cloudflare KV da 100.000 lecturas/día pero solo **1.000
escrituras, 1.000 borrados y 1.000 operaciones de listado**. Si cada pedido fuera
una clave suelta, el panel refrescando cada 15 segundos agotaría el cupo de
listados en media jornada y el sistema se caería solo. Por eso:
```
dia:AAAA-MM-DD  →  { turno: N, pedidos: [ … ] }
indice:dias     →  ["2026-09-06", …]
meta:limpieza   →  timestamp del último borrado sabatino
```
Refrescar el panel = **1 lectura**. Crear un pedido = 1 lectura + 1 escritura.
**Cero operaciones de listado.** Con 60 pedidos diarios se usan ~120 escrituras.
⚠ **No cambiar esto a una clave por pedido.** Parece más ordenado y rompe el cupo.

**2. Limpieza semanal "al pasar", no con cron.**
Cloudflare Pages **no tiene cron triggers** (eso es de Workers). La primera
petición que llega después del sábado 7:00 a. m. (hora Colombia) borra los días
anteriores al corte y guarda la marca en `meta:limpieza`. Mismo efecto, cero
infraestructura. Función `limpiezaSemanal()` en `functions/api/pedidos.js`.

**3. Zona horaria fija America/Bogota (UTC−5, sin horario de verano).**
Todos los cálculos de fecha y hora pasan por `Intl.DateTimeFormat` con esa zona.
Si se usara la hora del navegador, un turista con el celular en otra zona vería el
local "abierto" cuando está cerrado, y los turnos se saltarían de día.

**4. El total se recalcula SIEMPRE en el servidor.**
`functions/api/pedidos.js` ignora el total que manda el navegador y lo suma otra
vez contra los precios que recibe. Si se confiara en el navegador, cualquiera
podría abrir la consola y enviar un pedido por $0.
⚠ No "optimizar" esto aceptando el total del cliente.
⚠ **Esto solo era la mitad del problema.** Hasta el 21 de septiembre de 2026 el
servidor recalculaba el total pero **aceptaba el precio de cada plato** que
mandaba el navegador. Ver **decisión 35**: ahora los precios salen de `CARTA`.

**5. Clave del panel en variable de entorno, nunca en el código.**
`PANEL_CLAVE` se configura en Cloudflare y se compara en el servidor con
**comparación de tiempo constante** (`comparaSegura()`), para no filtrar la clave
por el tiempo que tarda la respuesta. La clave **no aparece en texto plano en
ningún archivo del proyecto** — verificado por la auditoría.
En **modo local** el panel simplemente **NO ABRE**, y lo dice con un mensaje.
Hasta septiembre de 2026 había aquí un resumen SHA-256 de una clave; se quitó
porque el resumen de una palabra adivinable se rompe por diccionario en segundos
(se comprobó: salió al primer intento). Ver decisión 21.
⚠ **Regla dura del proyecto**: no puede existir una clave, ni un resumen de una
clave, ni nada parecido, en ningún archivo del repositorio. La única clave vive
en la variable `PANEL_CLAVE` de Cloudflare y la revisa el servidor.

**6. El menú está escrito en el HTML, no inyectado por JS.**
Los 15 platos con sus precios están en el `index.html` servido. El JS solo lee los
atributos `data-nombre` y `data-precio` de cada botón. Así Google y los bots de IA
leen el menú completo. ⚠ Nunca mover el menú a un JSON que pinte el JS.

**7. Horarios: los siete días confirmados (sept. 2026).**
El local abre **todos los días de 18:00 a 23:00**, sin día de descanso.
Confirmado por JX; antes solo se conocía el domingo (del perfil de WhatsApp
Business) y los demás días estaban provisionales.
Los siete días tienen `confirmado: true` en `js/config.js` y por eso los siete se
publican en el JSON-LD, que es lo que hace que Google muestre "Abierto ahora ·
cierra a las 11 p. m." en el buscador y en el mapa.
El campo `confirmado` sigue existiendo por una razón: si el local cambia de
horario y el dato nuevo no está seguro, se pone en `false` y la página muestra
`{POR CONFIRMAR}` en la tabla y **saca ese día del JSON-LD**. ⚠ Nunca publicar un
horario sin confirmar: Google le diría a la gente una hora inventada y llegarían
clientes con el local cerrado.
Se dejan de recibir pedidos **15 minutos antes del cierre**
(`horarios.minutosAntesDelCierre`), porque un pedido a las 22:59 no da tiempo de
prepararlo.

**8. El botón de WhatsApp del turno lleva el enlace real escrito en el HTML.**
No un `href="#"` que el JS reemplaza. Si el JS fallara, el botón igual funciona;
el JS solo le agrega el texto del pedido.

**9. El banner de cookies se aparta cuando hay carrito.**
Detectado probando en celular: con productos en el carrito, el banner quedaba
encima de la barra y **tapaba el botón "Hacer el pedido"** — el cliente no podía
comprar. Reglas `body.carrito-visible .cookies` y `body.cookies-visibles
.wa-float` en el CSS. ⚠ No quitarlas.

**10. En modo local el pedido nace con los mismos campos que en la nube.**
`crearPedidoLocal()` pone `id`, `numero`, `turno`, `creado` y `entregado`, igual
que el servidor. Sin `creado`, el panel mandaba todos los pedidos al historial y
el botón "Entregado" no sabía a cuál se refería. ⚠ Si algún día se agrega un campo
en `functions/api/pedidos.js`, hay que agregarlo también en `js/almacen.js`.

**11. Freno anti-spam a los 200 pedidos del día.** Protege el cupo gratuito de
escrituras si alguien intentara inundar el sistema.

**12. GA4 y el mapa de Google NO cargan hasta que el visitante acepte cookies.**
Obligatorio en Colombia por la Resolución 32.126 de 2022 de la SIC, que es **más
estricta que Europa**: el consentimiento debe ser previo, expreso e informado.

**13. La FAQ tiene que estar VISIBLE, no solo en el JSON-LD.**
Durante la revisión de septiembre se encontró que el `<head>` le declaraba a
Google un bloque `FAQPage` con cuatro preguntas que **no existían en la página**.
Google exige que el contenido de un `FAQPage` se vea; declararlo sin mostrarlo
incumple su política de datos estructurados y puede costar una acción manual.
Se creó la sección `#preguntas` con las cuatro preguntas y respuestas idénticas
al JSON-LD. Usa `<details>`/`<summary>`: abre y cierra sin JavaScript, funciona
con teclado y Google lo acepta como contenido visible aunque arranque plegado.
⚠ Si algún día se quita la sección, hay que quitar también el `FAQPage`.

**14. Las barras fijas van con `backdrop-filter` y casi opacas.**
Estaban a `rgba(0,0,0,.94)` / `.92` / `.97` **sin desenfoque**, y se leía el
contenido pasando por detrás: el botón rojo "Agregar" se veía cruzando la barra
superior y la del carrito al hacer scroll. Ahora van a `.98` con
`backdrop-filter: blur(16px)`, más un bloque `@supports not` que las pinta
opacas en los navegadores que no saben desenfocar. ⚠ No bajar la opacidad: el
efecto de profundidad ya lo da el desenfoque.

**15. El precio se escribe IGUAL en los cuatro sitios: `$16.000`, sin espacio.**
`Intl` mete un espacio fino entre el signo y el número. `pesos()` antes lo
cambiaba por un espacio normal y quedaba `$ 16.000` en el carrito, en el mensaje
de WhatsApp y en el panel, distinto de lo que decía la tarjeta del plato. Ahora
se quita del todo (`.replace(/\s/g, '')`) en `js/script.js` y en `js/panel.js`.

**16. El teléfono del cliente se normaliza antes de armar los enlaces del panel.**
El cliente escribe su celular como quiere. Si lo escribía con el indicativo
(`573001234567`), el panel le pegaba otro 57 y armaba `tel:+57573001234567` y
`wa.me/57573001234567`: el vendedor **no podía llamarlo ni escribirle**.
`telefonoLocal()` en `js/panel.js` quita el `00` internacional y el `57` cuando
el número queda de 12 dígitos. ⚠ Si algún día se agregan otros países, esta
función es el único sitio que hay que tocar.

**17. La ventana del pedido encierra el foco (`encerrarFoco`).**
Se anuncia como `aria-modal="true"` — "detrás de mí no hay nada" — pero el
tabulador se escapaba al menú de atrás y al banner de cookies a los seis saltos.
Ojo con el selector: `'#modalPedido a, button'` en CSS significa "los enlaces de
la ventana y TODOS los botones de la página". Por eso `ENFOCABLES` es una lista
y el prefijo se le pega a cada selector por separado.

**18. `.barra` va con `min-height`, nunca con `height`.**
Tenía `height: var(--alto-barra)` y `padding-top: env(safe-area-inset-top)`. Con
`box-sizing: border-box`, en un iPhone con notch el padding se comía el espacio
del contenido y además abría un hueco antes de la barra de categorías, que se
coloca a `var(--alto-barra) + el notch`. Hoy no se nota porque el `<meta
viewport>` **no lleva `viewport-fit=cover`** y por eso todos los `env(safe-area-
inset-*)` del CSS valen 0. Se dejó blindado para el día que se agregue.

**19. Cortina de cerrado: TAPA la página, no la esconde.**
El local abre 5 horas al día; las otras 19 la página se veía idéntica a cuando
sí atienden y cualquiera podía armar un pedido creyendo que se lo preparaban.
La cortina (`#pantallaCerrado`) es una capa fija con `z-index: 150` que cubre
todo, con el letrero de CERRADO colgado que se mece y una cuenta regresiva al
segundo hasta la hora de abrir.
⚠ **Por qué es una capa encima y no `display:none` sobre el contenido**: el menú
y los 15 precios siguen existiendo en el HTML debajo. Si se ocultaran de verdad,
Google —que rastrea de madrugada, con el local cerrado— no leería el menú, que es
exactamente lo que este sitio necesita posicionar. Tapar sí, borrar nunca.
Lleva una salida, **"Ver el menú de todas formas"**, que la quita por lo que dure
la visita (`sessionStorage`). PEDIR sigue bloqueado: eso no lo cambia la salida.
Sin esa salida, el cliente que busca a las 2 de la tarde para pedir en la noche
se estrella con un muro y se va a otro local.
La cortina arranca con `hidden` en el HTML y la enciende el JS: si el JavaScript
fallara, no aparece y la página se ve normal — **falla del lado seguro**, nunca
dejando al cliente encerrado.
En estado "Cerrando" (los 15 minutos finales) **no** se tapa: el local está
abierto y hay gente adentro.

**20. Modo prueba — ⛔ ELIMINADO el 21 de septiembre de 2026.**

_Lo que sigue es el registro de lo que fue, para que nadie lo reinvente sin
saber que ya existió y por qué se quitó. **El código ya no está en el
proyecto.** Decisión de JX: el sitio tenía que quedar totalmente real, sin
nada que pudiera confundirse con una prueba. Con el interruptor de 24 horas
(decisión 23) el modo prueba dejó de hacer falta para poder pedir fuera de
horario, que era su motivo principal._

_Se quitó de los 7 archivos a la vez: la franja de `index.html`, el bloque 0 y
las 6 conexiones de `js/script.js`, el campo `prueba` y la acción
`borrar-pruebas` de `functions/api/pedidos.js`, `borrarPruebas` de
`js/almacen.js`, la marca de la tarjeta y los dos botones de `js/panel.js` y
`panel.html`, y el bloque 7ter de `css/styles.css`. Comprobado después: el
servidor responde "Acción no reconocida" a `borrar-pruebas`, ignora un
`prueba:true` que le manden, y el pedido guardado ya no trae el campo._

_Cómo era:_
Para qué: JX no puede comprobar el sistema si tiene que esperar a las 6 de la
tarde. En modo prueba `calcularEstado()` devuelve "abierto" y el pedido recorre
el circuito COMPLETO — Cloudflare, turno real, panel.
Está marcado de punta a punta para que nadie lo confunda con un pedido de verdad:
franja naranja arriba de la página, `prueba: true` guardado en el servidor,
aviso de primera línea en el mensaje de WhatsApp (`⚠️ PEDIDO DE PRUEBA — NO
PREPARAR`), franja naranja en la tarjeta del panel, y un botón **"Borrar pedidos
de prueba"** que los quita sin tocar ni uno de los reales.
Se recuerda en `sessionStorage` para no apagarse al navegar, y se borra al cerrar
la pestaña. El panel tiene el botón "Probar la página como cliente", que abre esa
dirección en otra pestaña.
⚠ **Los pedidos de prueba SÍ consumen turno y el contador NO se devuelve.**
Reciclar un turno sería peor: dos clientes distintos podrían terminar con el
mismo número. Por eso conviene probar antes de abrir y borrar las pruebas al
terminar.
⚠ El alto de la franja naranja (`--alto-franja`) **lo mide el JS**, no se escribe
a mano: con un valor fijo de 30px, en pantalla angosta el texto pasaba a dos
líneas y la franja tapaba la barra del logo.

**21. La clave del panel no existe en el repositorio, en ninguna forma.**
Ni en texto plano, ni como hash, ni en el CSS, ni en los comentarios, ni en el
README, ni en este archivo. Vive **solo** en la variable de entorno
`PANEL_CLAVE` de Cloudflare y la compara el servidor con tiempo constante.
Consecuencia aceptada: con `sistema.modo = 'local'` el panel no abre. Es el
precio de que la clave no se pueda sacar inspeccionando el navegador.

**22. El dominio vive en UN solo sitio conceptual, pero se escribe en 7.**
Hoy el sitio se sirve desde `https://pedidos-pichi-burguer-ctg.pages.dev`.
JX conectará `pedidos-pichiburguerctg.com` más adelante.

⚠ **POR QUÉ IMPORTA QUE COINCIDA CON LA DIRECCIÓN REAL**: no es cosmético.
El `canonical` le dice a Google cuál es la página "de verdad"; si apunta a un
dominio que no sirve el sitio, Google deja de indexar el que sí funciona. Y las
direcciones de `og:image`/`og:url` **tienen que ser absolutas y vivas**: si no,
al compartir el enlace por WhatsApp no sale ni la foto ni el título — sale el
enlace pelado. Para un local que se promociona por WhatsApp, eso es la diferencia
entre que le den clic o no.

**LOS 7 SITIOS, en orden. El día que se conecte el dominio propio hay que
cambiarlos TODOS o el SEO queda a medias:**

| # | Archivo | Qué hay que cambiar |
|---|---|---|
| 1 | `index.html` `<head>` | `canonical`, `og:url`, `og:image`, `twitter:image` |
| 2 | `index.html` JSON-LD | `@id` del sitio, del negocio y del FAQ, `url`, `image` |
| 3 | `sitemap.xml` | la etiqueta `<loc>` |
| 4 | `robots.txt` | la línea `Sitemap:` del final |
| 5 | `llms.txt` | los 9 enlaces de la sección "Secciones" |
| 6 | `js/config.js` | `negocio.dominio` |
| 7 | `functions/api/pedidos.js` | el comentario "SE ACTIVA EN" de la cabecera |

Comando para comprobar que no quedó ninguno:
`grep -rn "pages.dev" --include=*.html --include=*.js --include=*.txt --include=*.xml .`

Al hacer el cambio hay que **volver a enviar el sitemap** en Google Search
Console, porque el anterior apunta a direcciones que dejarán de existir.

**23. ⚠ INTERRUPTOR DE 24 HORAS — ESTADO ACTUAL DEL SITIO (sept. 2026).**

`js/config.js` → `horarios.siempreAbierto: true`.

**QUÉ SIGNIFICA:** el sitio acepta pedidos a cualquier hora. El semáforo queda
verde siempre, la cortina de CERRADO no aparece nunca y el corte de 15 minutos
antes del cierre no se aplica.

**POR QUÉ:** decisión de JX. Mientras termina de montar la operación, la web
tiene que poder usarse y probarse a cualquier hora sin levantar un sitio aparte.
(Antes existía un "modo prueba" para eso; se eliminó — ver decisión 20.) **NO es que el local abra 24 horas.** El horario real
(18:00–23:00 todos los días) sigue guardado intacto en `horarios.dias`.

**👉 CÓMO VOLVER A LOS HORARIOS REALES — hay que tocar 5 SITIOS.**
Con cambiar solo el interruptor, la página se contradice: el semáforo diría
"Cerrado" mientras la tabla y Google siguen anunciando 24 horas.

| # | Archivo | Qué cambiar |
|---|---|---|
| 1 | `js/config.js` | `siempreAbierto: true` → `false` |
| 2 | `index.html` tabla visible | las 7 filas `<td>Abierto 24 horas</td>` → `<td>6:00 p. m. – 11:00 p. m.</td>` |
| 3 | `index.html` JSON-LD | `"opens": "00:00", "closes": "23:59"` → `"opens": "18:00", "closes": "23:00"` |
| 4 | `index.html` FAQ **y** JSON-LD `FAQPage` | la pregunta "¿A qué hora puedo hacer un pedido?" vuelve a "¿Se puede pedir cuando el local está cerrado?" — **los dos sitios con el MISMO texto** (ver decisión 13) |
| 5 | `llms.txt` | la sección "## Horarios" |

Comprobación después de cambiarlo:
`grep -n "Abierto 24 horas\|siempreAbierto\|00:00" index.html js/config.js llms.txt`

⚠ Los comentarios de `index.html` (el del JSON-LD en el `<head>` y el de la
ZONA EDITABLE · HORARIOS) también avisan de esto. Actualizarlos al volver.

**24. El panel AVISA: campana, notificación y pantalla encendida.**

**El problema real que resuelve** (encontrado en la auditoría del 21 de sept.):
el panel avisaba de un pedido nuevo solo con un mensajito en pantalla. Si el
vendedor estaba atendiendo a alguien, o el celular tenía la pantalla apagada,
el pedido se quedaba esperando y el cliente creyendo que ya se lo preparaban.
**La venta no se perdía por un fallo del sistema: se perdía porque nadie se
enteraba.** El respaldo por WhatsApp solo funciona si el cliente presiona el
botón, y no todos lo presionan.

**Tres capas, porque ninguna sola alcanza:**
1. **Campana** — tres notas generadas con Web Audio. No es un archivo de sonido
   a propósito: así no hay que esperar a que cargue, funciona sin internet y no
   se agrega un archivo más al proyecto.
2. **Notificación del sistema** — se ve con el panel en segundo plano. Lleva
   `tag` fijo para que no se amontonen diez, y `renotify` para que igual avise.
3. **Pantalla encendida** (`navigator.wakeLock`) — sin esto el celular se
   bloquea a los dos minutos y las otras dos no se ven, que era el problema.

Y el número de pendientes va en el título de la pestaña: `(2) Panel de pedidos`.

⚠ **POR QUÉ HAY UN BOTÓN Y NO SE ENCIENDE SOLO**: los navegadores bloquean el
sonido y las notificaciones hasta que la persona hace clic en algo. Sin un
gesto de por medio el navegador silencia la campana y **nunca sonaría**. El
botón además evita soltarle un permiso por sorpresa a quien solo vino a mirar.

⚠ El botón arranca **en naranja** porque APAGADO es el estado peligroso. Al
encenderlo pasa a verde y suena una vez, para que el vendedor compruebe el
volumen. La preferencia va en `localStorage` (es del aparato, no de la sesión).

⚠ El bloqueo de pantalla **se suelta solo** cuando el navegador pasa a segundo
plano. Por eso se vuelve a pedir en `visibilitychange`. Si se quita esa línea,
el arreglo deja de servir justo cuando más falta hace.

**25. Borrar un pedido suelto (acción `borrar-pedido`).**

Lo pidió JX: un pedido repetido, uno que el cliente canceló por teléfono o una
prueba que quedó ahí. "Entregado" lo deja en la lista; esto lo quita.

⚠ **EL CONTADOR DE TURNOS NO SE DEVUELVE, y es a propósito.** Si al borrar el
turno 3 el contador volviera a 2, el siguiente cliente recibiría otra vez el
número 3 y habría **dos personas esperando el mismo turno en el mostrador**. Es
mejor que falte un número a que se repita. Lo mismo valía para los pedidos de
prueba cuando existían.

**Detalles del diseño, que no son casualidad:**
- El botón va **de último y con aspecto de icono** (🗑, 44×44 px, gris). Borrar
  no tiene vuelta atrás y no puede competir por el dedo con "Entregado", que es
  la acción de todos los días. Solo se pone rojo al pasar el cursor.
- La confirmación dice **el turno Y el nombre**: en una lista de tarjetas
  parecidas, un "¿seguro?" pelado no evita que se borre la equivocada.
- Si el pedido era el último de su día, el documento `dia:AAAA-MM-DD` se borra
  entero y el día sale de `indice:dias`, para no dejar una clave vacía gastando
  cupo del plan gratuito.

**26. Los objetivos táctiles miden 44px, sin robar espacio de pantalla.**

Auditoría del 21 de sept. sobre 15 celulares reales: los chips de la barra de
categorías medían **38px de alto** y el enlace del logo entre 32 y 38. El mínimo
cómodo para un pulgar es 44. En un celular angosto, 38px hace fácil darle al
chip de al lado.

**El truco para que no cueste pantalla:** los chips subieron a 44px Y el relleno
de `.categorias__int` bajó de 9px a 6px. Cuentas: 6+44+6+1 = **57px, exactamente
lo que medía antes**. Los dedos ganan, la pantalla no pierde nada — y en un
celular de 320px eso es justo lo que importa.

⚠ **Si alguien sube ese relleno o el alto del chip, tiene que subir también los
`58px` del `scroll-margin-top` de `section[id]` y del `padding-top` de
`.portada`**, o los títulos de categoría vuelven a quedar pegados a la barra
(el bug que se arregló el 19 de sept.).

**27. ⛔ SOLO PARA RECOGER — el domicilio se quitó (sept. 2026).**

Decisión de JX: *"por ahora la gente solo lo va a ir a recoger"*. El formulario
ya no pregunta la forma de entrega ni la dirección, y el servidor **fija
`tipo: 'recoger'` a mano**, sin aceptar lo que mande el navegador — así nadie
puede colar un pedido "a domicilio" que nadie va a llevar.

**Efecto de lado bueno:** el formulario pasó de 6 campos a 4. Menos fricción es
más pedidos terminados.

⚠ **Se tocaron también las páginas legales, y eso NO era opcional**:
`privacidad.html` declaraba que se recogía la dirección del cliente. Una
política de datos que dice recoger algo que ya no se recoge es un problema
legal, no un detalle de redacción. `compras.html` prometía servicio a domicilio
y `terminos.html` hablaba del valor del envío.

**👉 SI VUELVE EL DOMICILIO — hay que tocar 9 sitios:**

| # | Archivo | Qué devolver |
|---|---|---|
| 1 | `js/config.js` | `entrega.domicilio: true` |
| 2 | `index.html` formulario | el `radiogroup` de entrega y el campo `#campoDireccion` |
| 3 | `index.html` portada | "Pides y pasas a recogerlo" → mencionar domicilio |
| 4 | `index.html` FAQ **y** JSON-LD | la pregunta "¿Dónde recojo mi pedido?" (las dos con el mismo texto, ver decisión 13) |
| 5 | `js/script.js` | leer `tipo` y `direccion`, validarlos y mandarlos; la línea "Entrega" del WhatsApp |
| 6 | `functions/api/pedidos.js` | volver a aceptar `tipo` y guardar `direccion` |
| 7 | `js/panel.js` | la etiqueta Domicilio/Recoge y la fila "Dirección" de la tarjeta |
| 8 | `css/styles.css` | `.pedido__tipo` y `.pedido__tipo.domicilio` |
| 9 | Legales | `compras.html` (sección 3), `privacidad.html` (los datos que se recogen), `terminos.html` (precios) y `llms.txt` |

**28. Tres mejoras para el cliente (sept. 2026).**

**Repetir el último pedido** (`#repetirPedido`). En comida rápida mucha gente
repite siempre lo mismo; rearmarlo plato por plato es la fricción más tonta que
puede tener un sistema de pedidos.
⚠ **NO se guardan los precios**, solo los identificadores y las cantidades. Al
agregarlo, los precios se releen del menú de la página. Si se guardaran, un
cliente que pidió hace un mes volvería con los precios viejos — y cobrar un
precio distinto al publicado va contra el Estatuto del Consumidor. También se
descartan los platos que ya no estén en el menú.
Vive en `localStorage`: es de ese aparato y no viaja a ningún servidor.

**Cómo va la cola** (acción pública `turnos`). Mientras el cliente tiene abierta
la pantalla de su turno, le dice *"Faltan 2 antes que tú · están preparando el
turno 8"*. Le quita la ansiedad y le quita llamadas al local.
⚠ **Esa acción NO lleva clave**, así que devuelve **solo números**: turno en
preparación, cuántos en cola y último entregado. Si devolviera la lista de
pedidos, cualquiera sacaría los nombres y celulares de todos los clientes del
día con una sola petición. **Nunca agregarle campos sin pensar en eso.**
Pregunta cada 30 s, solo con la pantalla abierta y visible, y se corta sola a
los 45 minutos.

**Instalar la app** (`#avisoInstalar`). Son dos mundos: Android avisa con
`beforeinstallprompt` y ahí el botón instala de verdad; iPhone no tiene ese
evento, la instalación es manual y lo único honesto es explicar los dos pasos.
El texto se decide por **si hay evento**, no por si es un iPhone: si algún día
Safari lo soporta, el aviso se adapta solo.
⚠ No aparece mientras el banner de cookies esté en pantalla: el consentimiento
manda, y dos cajas abajo a la vez es justo el amontonamiento que rompió esta
página una vez (decisión 9).

**29. El panel, después de usarlo de verdad en el local.**

JX lo probó en el mostrador y salieron tres cosas. Ninguna era un fallo técnico;
las tres eran el sistema funcionando sin que la persona se diera cuenta:

- **El botón de borrar no se veía.** Se había hecho gris y discreto a propósito,
  para que no compitiera con "Entregado". Se pasó de largo: **un botón que el
  vendedor no encuentra es un botón que no existe.** Ahora va rojo, con fondo y
  con la palabra "Borrar" al lado del icono. Lo que lo mantiene fuera del camino
  del dedo ya no es ser invisible, sino ir de último, ser más angosto que
  "Entregado" y pedir confirmación nombrando al cliente.
- **"Actualizar" parecía roto.** Sí consultaba al servidor, pero si no había
  novedades la pantalla quedaba idéntica y no pasaba nada visible. Ahora se
  bloquea y dice "Buscando…", y al terminar avisa qué encontró — **aunque la
  respuesta sea "nada"**. Un botón que no da señal de vida es un botón en el que
  nadie confía.
- **La campana sonaba una sola vez** y se perdía entre el ruido de la freidora.
  Ahora suena **5 veces** con 0,9 s entre una y otra, y más fuerte
  (`CAMPANA_VECES = 5`, `CAMPANA_VOLUMEN = 0.6`). Empezó en 3; JX pidió 5 el
  mismo día, después de oírla en el local. Menos pausa suena a alarma de carro;
  más pausa parece que entraron cinco pedidos distintos.
  ⚠ Las repeticiones se programan todas de una con el reloj del audio, **no con
  `setTimeout`**: el reloj de audio no se desordena aunque el celular esté
  ocupado, y un `setTimeout` puede llegar tarde o no llegar.

**30. El logo pesado se partió en dos archivos.**

`logo-pichi-burguer-cartagena.webp` son 1254×1254 y **110 KB**: era el 75% del
peso de la página, sirviendo una imagen enorme para un hueco de 220px.
Se generó `logo-pichi-burguer-cartagena-440.webp` (440×440, **21 KB**) y es el
que usan las 7 páginas. **89 KB menos en cada primera visita.**

⚠ **El original NO se borró y NO se toca**: el JSON-LD del `<head>` lo sigue
usando como `image` del negocio, porque Google quiere una imagen grande para la
ficha. Ese archivo no lo descarga el cliente, solo lo lee el buscador.

⚠ Esto es una **excepción expresa a la regla de imágenes** de este archivo
("conservando resolución original"), aprobada por JX. La regla sigue valiendo
para los originales; lo que se permite es **generar derivados más pequeños para
servirlos**, siempre en WebP y sin tocar el original.

**31. ⛔ NUNCA MÁS `confirm()`, `alert()` NI `prompt()` DEL NAVEGADOR.**

**Regla dura del proyecto, pedida por JX el 21 de septiembre de 2026:**
*"no me gustan estas confirmaciones así... quiero como un modal con el mismo
diseño de la web bien bacano y atractivo, y que diga seguro que quieres
eliminar"*. Aplica a **todo el sitio, para siempre**: si mañana hace falta una
pregunta nueva, se llama a `confirmar()`, **no** se pone un `confirm()`.

**Por qué tenía razón, más allá del gusto:**
- El cuadro de Chrome se ve como una alerta del sistema operativo, no como esta
  página. El vendedor pasa de una web negra y roja a un cuadro blanco de Windows
  con el nombre del dominio arriba. Parece un error, no una pregunta del sistema.
- **No se puede dar formato.** El turno y el nombre del cliente —que son justo lo
  único que evita borrar la tarjeta equivocada— salían en texto plano, del mismo
  tamaño y color que el resto.
- Algunos navegadores lo bloquean según desde dónde se llame, y entonces la
  acción se ejecuta sola o no se ejecuta nunca.

**Dónde vive:** bloque 0 de `js/panel.js` (`confirmar()` + `responderConfirmar()`
+ `confTeclado()`), markup `#modalConfirmar` al final de `panel.html`, y las
clases `.modal--conf` / `.conf__*` en `css/styles.css`. Reusa `.modal` y
`.modal__caja`, que ya existían para la ventana del pedido del cliente: mismos
`--negro-sup-2`, `--radio-lg`, `--sombra-alta` y los mismos `.btn--rojo` /
`.btn--linea`. **No se inventó ningún color ni componente nuevo.**

**Cómo se usa** (devuelve una promesa que nunca se rechaza: cancelar no es un
error, es una respuesta):
```js
confirmar({
  titulo:    '¿Seguro que quieres eliminar?',
  resaltado: 'Turno 4 — Andrés Pérez',
  texto:     'Se borra para siempre y no se puede deshacer.',
  detalle:   'El número de turno NO se vuelve a usar.',
  ok:        'Sí, borrar'
}).then(function (siOno) { if (siOno) { /* … */ } });
```

⚠ **TODOS los campos se pintan con `textContent`, NUNCA con `innerHTML`.** Por
ahí pasa el nombre que escribió el cliente, que es texto de fuera. Con
`innerHTML`, un nombre como `<img src=x onerror=…>` se ejecutaría **en el
navegador del vendedor, que es justo quien tiene la sesión del panel abierta**.
Al ser `textContent` no hay nada que escapar ni que acordarse de escapar: es
seguro por construcción. Por eso el turno y el nombre van en su propio campo
`resaltado` en vez de armar HTML a mano. Probado con un nombre malicioso real.

**Detalles que no son casualidad:**
- **El foco arranca en CANCELAR, no en el botón rojo.** Si arrancara en el rojo,
  un Enter de más —el mismo que el vendedor acaba de pulsar para otra cosa—
  borraría el pedido sin que alcance a leer de quién era.
- El **turno y el nombre** van en amarillo, más grandes y en su propia caja: si
  el vendedor solo lee una línea de toda la ventana, tiene que ser esa.
- **Escape y el clic en el fondo cancelan.** Encierra el foco igual que la
  ventana del pedido (decisión 17) y con el mismo cuidado del selector: la lista
  de enfocables se arma pegándole el prefijo a cada selector por separado.
- Se escucha el teclado **en fase de captura** para llegar antes que el atajo de
  Escape del modo cocina, que si no cerraría los dos a la vez.
- `z-index: 140`, por encima del modo cocina (120) y del aviso flotante (110):
  una pregunta sin responder bloquea todo lo demás por definición.
- En pantalla ≤380px los botones se apilan y **Cancelar queda abajo**, que es
  donde cae el pulgar. Se invierte solo el orden visual (`column-reverse`), no
  el del HTML, donde Cancelar va primero porque es el que recibe el foco.

**32. Las 6 mejoras del panel que escogió JX (21 de septiembre de 2026).**

| # | Mejora | Qué resuelve |
|---|---|---|
| 1 | **Reloj de espera** en cada tarjeta | El vendedor no sabía si el turno 4 entró hace 2 minutos o hace media hora: la hora exacta hay que restarla mentalmente y con el local lleno nadie lo hace. Gris → naranja a los 15 min → rojo a los 25. **El color es el aviso, no decoración.** |
| 2 | **Modo cocina** | Un pedido a la vez, en letra grande, para leerlo a un metro con las manos ocupadas. Flechas ←/→ y Escape para salir. |
| 3 | **Estado "En plancha"** (`estado`) | Separa "ya lo estoy haciendo" de "ya lo entregué". Se guarda en el servidor, así que **alimenta la cola pública** que ve el cliente (decisión 28). |
| ~~7~~ | ~~**Imprimir la comanda** (🖨)~~ | ⛔ **QUITADO** el mismo día por JX. Ver decisión 37. |
| 8 | **Deshacer 10 segundos** | "Entregado" está al lado de otros botones y se toca por error. El servidor acepta deshacer **siempre**; el panel solo lo ofrece 10 s, pero si el vendedor se da cuenta 5 minutos después tiene que poder arreglarlo igual. |
| 9 | **Buscador** por nombre o turno | Con 20 tarjetas parecidas, encontrar "el de Andrés" a ojo es lento y el cliente está esperando en el mostrador. |

⚠ El estado nuevo se guarda **además** de `entregado`, no en su lugar: los
pedidos que ya estaban en KV no tienen el campo y el panel tiene que seguir
pintándolos bien. **Sin campo = `'nuevo'`.** Misma regla que la decisión 10.

⚠ El sistema **no obliga a seguir un orden**: un pedido puede ir de 'nuevo' a
entregado directo sin pasar por "En plancha". El vendedor que no quiera usar ese
botón no debe quedar bloqueado.

⚠ El texto del botón dice **"🔥 En plancha"** y no "En la plancha" porque el
largo se partía en dos líneas a 390px y deformaba toda la fila.

**33. Los archivos de SEO se revisan CON los de código, nunca aparte.**

Auditoría del 21 de septiembre: el código estaba al día pero los archivos que
lee Google se habían quedado atrás. Ninguno daba error; simplemente **decían
cosas que ya no eran ciertas**, que es peor, porque nadie se entera.

**Lo que estaba mal y se corrigió:**

| Archivo | Qué decía | Por qué importaba |
|---|---|---|
| `llms.txt` | Una sección decía "se reciben pedidos las 24 horas" y **otra decía "los pedidos solo se reciben dentro del horario de atención"** | **Se contradecía a sí mismo.** Una IA que lo leyera le diría a la gente que no puede pedir de día, cuando sí puede. Este archivo existe justo para que ChatGPT, Claude o Perplexity recomienden el local |
| `sitemap.xml` | `lastmod` en 2026-09-19 | Es la señal que usa Google para decidir si vale la pena volver a rastrear. Con la fecha vieja tarda más en ver los precios nuevos |
| `index.html` JSON-LD | No declaraba nada sobre la entrega | Se quitó el domicilio (decisión 27) pero **Google seguía sin saberlo**. Ahora lleva `potentialAction` con `ServicePickup` y `acceptsReservations: false` |
| `index.html` `<meta description>` | 172 caracteres | Google corta en ~160: en los resultados salía **cortada a media frase**. Ahora 153 |
| `site.webmanifest` | Sin `id` | Sin ese campo, el día que cambie `start_url` el celular trata la app instalada como si fuera otra distinta y **duplica el icono** |
| `README.md` | De antes del cambio a solo-recoger | Ver la bitácora del 21 |

⚠ **REGLA QUE SALE DE AQUÍ:** cuando se cambia algo que el cliente ve —un
precio, el menú, el horario, la forma de entrega— hay que preguntarse en cuáles
de estos **siete** archivos se repite el dato: `index.html` (texto visible),
`index.html` (JSON-LD del `<head>`), `js/config.js`, `llms.txt`, `sitemap.xml`
(la fecha), `README.md` y este archivo. Un dato que solo se cambia en la página
visible deja a Google y a las IA repitiendo el viejo durante semanas.

**Lo que ya estaba bien y no se tocó:** `robots.txt` (panel bloqueado, bots de
IA permitidos a propósito), las cabeceras de seguridad de `_headers`, el
`canonical` y el Open Graph absolutos, y los 15 platos escritos en el HTML.

**34. Los 9 eventos de Analytics ya están puestos; solo falta el ID.**

`pedido_enviado` (con el valor del pedido), `clic_whatsapp`,
`clic_whatsapp_cerrado`, `clic_telefono`, `clic_mapa`, `repitio_pedido`,
`instalo_app`, `instalar_si` / `instalar_no` y `clic_ver_menu_cerrado`.

No hay que configurar nada en GA4: apenas se pegue el `G-XXXXXXXXXX` en
`js/config.js` empiezan a llegar solos.

⚠ **Ningún evento manda el nombre ni el teléfono del cliente a Google.** Solo el
hecho de que pasó, y en el pedido el monto. Mandar datos personales a Analytics
sin consentimiento específico es una infracción, y además GA4 los rechaza.

⚠ `clic_ver_menu_cerrado` es el más interesante para el negocio: dice cuánta
gente busca con el local cerrado. **Si ese número es alto, vale la pena abrir más
temprano.** Hoy no se dispara porque el sitio está en modo 24 horas.

**35. 🔒 LOS PRECIOS LOS PONE EL SERVIDOR — `CARTA` en `functions/api/pedidos.js`.**

**Encontrado probando el sitio EN VIVO el 21 de septiembre de 2026.** La
decisión 4 decía "el total se recalcula siempre en el servidor", y era verdad a
medias: el servidor recalculaba el **total**, pero usaba los **precios que
mandaba el navegador**. Bastaba abrir la consola y enviar
`{ nombre: 'Hamburguesa Pichi', cantidad: 1, precio: 1 }` para que el pedido
quedara guardado en **$1** — y el servidor "recalculaba" 1 × 1 = 1 tan tranquilo.
Se comprobó contra el sitio publicado: **entró un pedido de $1**.

**Por qué importaba aunque aquí no se pague en línea:** no se roba dinero,
porque el pago se hace en el local. El daño es otro y es más difícil de ver:
**al vendedor le llega al panel un pedido que dice $1**, y si está de afán lo
cobra así. O entran cien pedidos con precios inventados y las cuentas del día no
cuadran con nada.

**Cómo quedó:** la constante `CARTA` tiene los 15 platos con su precio real. El
precio **siempre** sale de ahí; lo que manda el navegador se ignora por completo.
Un plato que no esté en la carta entra en **$0** y se ve así en el panel, en vez
de rechazar el pedido entero por un nombre mal escrito y perder la venta.

⚠ **AHORA UN PRECIO VIVE EN 5 SITIOS** (antes eran 4). Si cambia uno, hay que
cambiarlo en los cinco o el cliente ve un precio y se le cobra otro:
`index.html` (precio visible) · `index.html` (`data-precio`) · `index.html`
(JSON-LD) · `llms.txt` · **`functions/api/pedidos.js` → `CARTA`**.

⚠ Los nombres de `CARTA` tienen que estar escritos **igual** que el
`data-nombre` del botón, tildes incluidas: es la llave con la que se busca.

**36. El panel llevaba `noindex` en la dirección equivocada.**

También salió probando en vivo. Cloudflare Pages **redirige `/panel.html` →
`/panel`**, así que `/panel` es la dirección que de verdad se visita. Las reglas
estaban escritas solo para `/panel.html`:

- `_headers` → `/panel` salía **sin `X-Robots-Tag: noindex`** y **sin
  `Cache-Control: no-store`**. O sea que **Google podía indexar el panel del
  vendedor** y el navegador se lo guardaba en la caché.
- `robots.txt` → `Disallow: /panel.html` tampoco cubría `/panel`.

Arreglado: las dos direcciones en los dos archivos. ⚠ Si algún día se agrega otra
página privada, va con sus **dos** formas.

**37. Fuera el botón de imprimir la comanda (21 de sept. de 2026).**

Duró unas horas. JX: *"quitemos eso de imprimir, ese botón de imprimir"*. Se
quitó de `js/panel.js` (el botón y `imprimirComanda()`) y de `css/styles.css`
(`.pedido__imprimir` y el bloque `@media print` de `body.imprimiendo-una`).

**Lo que SÍ se quedó**: el `@media print` general. El vendedor siempre puede
imprimir el panel entero desde el menú del navegador, y ahí el buscador, el modo
cocina y el aviso flotante siguen sin ensuciar el papel.

**38. La ventana de borrar explica el PORQUÉ, no solo la regla.**

Decía *"el número de turno NO se vuelve a usar"*. JX lo leyó y preguntó, con
razón: **si el turno se borró, ¿por qué no dárselo al siguiente?**

Que lo pregunte quien usa el sistema significa que el texto estaba mal escrito.
La respuesta es que **el cliente recibe su número en el mismo instante en que
envía el pedido**, y lo tiene en la pantalla y en el WhatsApp. El sistema no
puede saber si ya lo vio. Si el contador retrocediera, otro cliente recibiría el
mismo número y en el mostrador **dos personas responderían al mismo grito** —
las dos con razón. Y en el historial quedarían dos pedidos `260921-004`.

El caso que más duele es el más común: se borra un pedido porque el cliente dijo
por teléfono que cancelaba, y media hora después aparece igual.

Ahora la ventana lo dice con el nombre y el turno de quien se va a borrar:
*"El turno 4 no se le da a nadie más: Andrés Pérez ya lo tiene en su celular, y
dos personas no pueden esperar el mismo número."*

⚠ **Regla de redacción que sale de aquí**: en un aviso que frena una acción sin
vuelta atrás, decir la regla no basta. Hay que decir **qué pasa si no se cumple**,
o quien lo lee piensa que el sistema está siendo caprichoso y busca cómo saltárselo.

**39. EL CLIENTE YA NO QUEDA A CIEGAS — tres capas, porque ninguna sola basta.**

**Lo pidió JX:** *"que el cliente le llegue esa notificación tipo: ya tu pedido
está en proceso... o se vea en la misma app... y no estar así sin saber nada"*.
Y luego lo afinó, que es lo que de verdad resolvió el problema: *"no importa si
cierra la pestaña; si el cliente quiere saber cómo va su pedido, que entre a la
app y le notifique de una vez"*.

**El problema real:** la cola en vivo (decisión 28) solo funcionaba con la
pantalla del turno abierta. El cliente que cerraba la pestaña —que es lo que
hace cualquiera después de pedir— se quedaba con un número en la mano y nada
más. La única salida era llamar al local, que es tiempo que el vendedor no está
cocinando.

**Capa 1 · Seguimiento al entrar** (`#pedidoEnCurso`, bloque 4quater de
`js/script.js`). **Es la base, no el extra.** Si este celular pidió hace menos
de 6 horas y no se lo han entregado, lo primero que ve al abrir la página es su
turno y cuántos faltan. Al tocarlo se abre la pantalla del turno con la cola en
vivo.
✅ Funciona en **todos** los celulares, iPhone incluido · sin permisos · sin
instalar nada · sin dejar la pestaña abierta.

**Capa 2 · Aviso al celular** (`#colaAvisar`). Con un botón, el cliente activa
la notificación del navegador. Cuando el vendedor toca "Empezar", **le suena y
le vibra** aunque tenga la página en segundo plano.
⚠ **Tiene que ser un botón**: los navegadores solo dejan pedir ese permiso
después de que la persona toca algo. Pedirlo al cargar lo bloquea en silencio y
el aviso **no llegaría nunca**.
⚠ En **iPhone no existe `Notification`** si no instaló la app, así que el botón
**no aparece**: mejor no ofrecer lo que no se puede cumplir. Para ese caso está
la capa 3.
⚠ Se manda **una sola vez** (`yaAvisado`). La cola se consulta cada 30 s y sin
esa bandera el cliente recibiría el mismo aviso hasta que lo recoja — la forma
más rápida de que desactive las notificaciones para siempre.

**Capa 3 · WhatsApp desde el panel.** Al tocar "Empezar", al vendedor le sale
por 10 segundos un **"Avisar al cliente"** que abre WhatsApp con el mensaje
escrito.
✅ Llega al **100% de los celulares**, sin permisos y sin instalar nada. Es la
red de seguridad de las otras dos.
⚠ Se **ofrece**, no se manda solo: abrir WhatsApp sin que el vendedor lo pida le
sacaría el panel de encima en plena hora pico. Si no lo toca, el aviso se va.
⚠ Va en el aviso flotante y **no** como botón en la tarjeta: el pie ya tiene
cinco botones y no cabe otro sin que el dedo empiece a equivocarse. Por eso
`avisarConDeshacer()` se generalizó a `avisarConBoton()`.

**⚠ NO SE GUARDA NINGÚN DATO PERSONAL.** En el aparato solo queda el **número de
turno y la hora**: ni el nombre, ni el teléfono, ni lo que pidió. Y para saber
cómo va se usa la acción pública `turnos`, que devuelve **solo números**: el
navegador compara su turno con el que están preparando y saca la cuenta él
mismo. **Así nadie puede consultar el pedido de otro, porque no hay nada que
consultar.**

**⚠ DOS CADUCIDADES, y las dos son necesarias:**
1. **6 horas** desde que pidió. Un turno viejo no sirve para nada.
2. **Si su turno es mayor que el más alto que ha dado el local hoy**
   (`turnoDelDia`), el pedido es de ayer y se suelta. Los turnos **reinician en
   1 cada día**, así que sin esta comprobación el cliente vería mañana la cola
   del turno 4 de OTRA persona creyendo que es el suyo. Probado.
3. Y cuando `ultimoEntregado` alcanza su turno, el cartel se quita solo: ya lo
   recogió.

**⚠ Se quitó el `if (document.hidden) return` de la cola.** Ahorraba lecturas
pero rompía justo lo que el cliente venía a buscar: con la página en segundo
plano dejaba de mirar, así que el aviso **nunca llegaba** — y el segundo plano
es el único momento en que hace falta. Ahora se sigue consultando y lo que se
salta es el repintado, que no se ve. El corte pasó de 45 a **90 minutos** por lo
mismo.

**Por qué NO se hizo push real (notificación con todo cerrado):** necesita un
*service worker*, y eso rompe algo que hoy funciona: las actualizaciones llegan
al instante a todo el que tenga la app instalada (decisión 28). Con service
worker hay que manejar versiones o la gente se queda con la página vieja. Y en
iPhone **igual solo funciona si instaló la app**, que es justo el caso que la
capa 3 ya cubre por otro lado. Es el 80% del trabajo para el 20% que falta.

**40. QUÉ HAY DENTRO DEL KV, Y QUÉ NO SE DEBE BORRAR.**

JX abrió *Pares de KV* en Cloudflare para vaciar los pedidos de prueba y vio dos
claves que no esperaba. Conviene dejar escrito qué es cada una, porque **es fácil
borrar la equivocada creyendo que es basura**.

| Clave | Qué es | ¿Se puede borrar? |
|---|---|---|
| `dia:AAAA-MM-DD` | Todos los pedidos de ese día y el contador de turnos | **Sí.** Borrarla vacía ese día y el contador vuelve a 1 |
| `indice:dias` | La lista de días que tienen pedidos | **Sí.** Se recrea sola con el siguiente pedido. Vacía se ve como `[]` |
| `meta:limpieza` | La marca de cuándo fue el último borrado sabatino | ⛔ **NO.** Sin ella el sistema cree que nunca ha limpiado y hace una pasada innecesaria en la siguiente visita. No rompe nada, pero no hay motivo |

**Cómo saber si el contador está en cero sin entrar a Cloudflare**, que es más
rápido y no arriesga borrar nada:

```bash
curl -s -X POST https://pedidos-pichi-burguer-ctg.pages.dev/api/pedidos \
  -H "Content-Type: application/json" -d '{"accion":"turnos","datos":{}}'
```

Si responde `"turnoDelDia": 0`, **el siguiente cliente recibe el turno 1**. Esa
acción es pública y no lleva clave, así que se puede consultar desde cualquier
parte sin exponer nada (decisión 28).

⚠ **Que no aparezca ninguna clave `dia:*` es lo NORMAL cuando no hay pedidos del
día**, no una señal de que algo se rompió. El documento del día nace con el
primer pedido y se borra entero si se borra el último (decisión 25).

**41. 🐛 EL BUG DE "YA ESTÁN PREPARANDO EL TUYO" — el servidor ADIVINABA.**

**Lo encontró JX usando la página**, no una prueba: *"aparece de una vez apenas
el cliente le da en enviar pedido... va a pensar que de una vez ya se lo están
haciendo y no es así, porque es por turno"*.

**Qué pasaba:** la acción `turnos` tenía escrito, con todas sus letras, que si
nadie estaba en la plancha `preparando` se caía al turno más bajo pendiente
*"como la mejor suposición"*. Resultado: al **primer cliente del día**, que
tiene el turno 1 y es el único pendiente, el servidor le respondía
`preparando: 1`. Su página comparaba `suTurno <= preparando` → verdadero → y
mostraba **"🔥 Ya están preparando el tuyo · ya puedes ir pasando"** en el mismo
segundo en que tocaba enviar.

**Y era peor de lo que se veía:** la notificación al celular se disparaba con
esa misma condición, así que además **le sonaba el aviso**. El cliente salía
para el local creyendo que su pedido estaba hecho.

**Cómo quedó:** el endpoint devuelve **dos datos separados**, y ninguno adivina:
- `preparando` → el turno en la plancha, o **`null`** si el vendedor no ha
  tocado "Empezar". El verde y la notificación dependen SOLO de esto.
- `siguiente` → el primero de la fila, para contar. No promete nada.
- `pendientes` → la lista de turnos que faltan.

⚠ **REGLA QUE SALE DE AQUÍ, y vale para todo el proyecto:** un endpoint **no
adivina**. Si el dato no se sabe, va en `null` y la página decide qué decir.
Una suposición razonable metida en un campo que parece un hecho es peor que no
tener el campo: nadie vuelve a dudar de ella.

⚠ **`pendientes` existe porque restar no alcanza.** Con solo `siguiente`, el
cálculo `miTurno − siguiente` sobreestimaba: si están pendientes el 1 y el 3 y
tú eres el 3, la resta da 2 pero delante va **uno solo** — el 2 ya se entregó o
se borró. Ahora se cuentan los turnos menores que el suyo, uno por uno
(`cuantosDelante()`). Decirle a alguien que faltan dos cuando falta uno es la
clase de detalle que hace que deje de creerle a la pantalla.

⚠ El mismo fallo estaba en `verTurnos` del **modo local** (`js/almacen.js`).
Corregido también: las dos caras tienen que contar igual.

**42. 🔒 UN TELÉFONO, UN TURNO A LA VEZ — y la ampliación del pedido.**

**Lo encontró JX probando desde su propio celular**: *"puedo desde mi celular
pedir varias veces con el mismo número y usuario"*. Cierto, y sin ningún freno.
Un cliente podía quedarse con diez turnos: el mostrador llamaría números que no
existen y la fila que ve todo el mundo sería mentira.

**Pero el caso real más común no es el vivo que quiere turnos**: es el que se
acordó de que quería un perro más. Por eso el sistema no dice "no" a secas.

**Cómo funciona:**
1. El servidor busca si ese teléfono tiene un pedido **de hoy, sin entregar y de
   hace menos de 20 minutos** (`pedidoEnCurso()`).
2. Si lo tiene, `crear` responde **409** con el código `PEDIDO_EN_CURSO` y **le
   devuelve su propio pedido**.
3. La página muestra el paso `#pasoEnCurso`: *"Ya tienes el turno 1 · ¿quieres
   sumarle lo que acabas de escoger?"*.
4. Si dice que sí, la acción **`agregar`** le suma los platos **sin sacar turno
   nuevo**, recalcula el total y marca `ampliado`.

⚠ **LA LLAVE ES EL TELÉFONO, no el nombre ni la IP.** El nombre repite (hay
muchos "Andrés") y bloquearía a personas distintas. **La IP es peor**: en un
barrio varias casas comparten wifi y un operador móvil le da la misma IP a
cientos de personas, así que **dos vecinos que pidan el mismo día se bloquearían
entre sí** — y el local nunca sabría por qué perdió esa venta. JX la propuso y
se descartó por eso.

⚠ **EL FRENO VIVE EN EL SERVIDOR.** Lo que guarde el navegador se borra
limpiando los datos, y entonces no frenaría nada.

⚠ **En modo `auto`, un 4xx ya NO cae a local.** Antes, cualquier error de la
nube hacía que el pedido se creara en el aparato. Con el freno nuevo eso era un
agujero: bastaba que la nube contestara 409 para que el pedido se creara igual
por lo local. Ahora solo se cae a local si de verdad no hubo respuesta o el
servidor falló (5xx).

⚠ **`agregar` NO lleva clave, y está bien.** La manda el cliente, no el
vendedor. Lo que la hace segura es que **solo alcanza un pedido del mismo
teléfono**, de hoy y reciente: sin el teléfono correcto no encuentra nada, y con
él solo toca lo suyo. Y los precios salen de `CARTA` (decisión 35), o este
habría sido el hueco por donde volvían los precios falsos.

**Quién SÍ puede pedir de nuevo, y es importante que pueda:**
- Otro teléfono, siempre.
- El mismo teléfono **cuando ya se lo entregaron** — es un cliente que vuelve.
- El mismo teléfono **pasados los 20 minutos** — ese ya es otro pedido.

**43. ⚠️ CUANDO AMPLÍAN UN PEDIDO QUE YA ESTÁ EN LA PLANCHA.**

> ⛔ **SUPERADA POR LA DECISIÓN 46** el mismo día. Ya **no se puede** agregar a
> un pedido en la plancha. Lo que sigue se conserva porque **los avisos siguen
> existiendo** (ahora para las ampliaciones normales, y como red de seguridad),
> y para que nadie vuelva a abrir esa puerta sin saber por qué se cerró.

JX eligió al principio **dejar agregar aunque ya esté en la plancha**, y pidió
que avisara fuerte: *"que tenga un sonido también, el mismo de 5 veces, con el aviso fuerte,
y que avise por WhatsApp también para mayor aseguramiento"*.

El riesgo es real: **el vendedor ya leyó la comanda** y cree saber qué lleva. Si
no se entera, entrega incompleto y el cliente reclama en el mostrador. Por eso
el mismo hecho se avisa por **tres caminos**, que uno solo se pierde en hora
pico:

1. **La tarjeta grita en rojo** y parpadea despacio (1,8 s): `⚠️ Agregó algo ·
   REVISA`. Dos niveles: naranja `➕ Ampliado` si aún no se había empezado, rojo
   si ya estaba en la plancha.
2. **La campana suena las 5 veces**, igual que un pedido nuevo. Y con razón: un
   pedido nuevo todavía no se ha leído; uno ampliado el vendedor cree conocerlo.
3. **El cliente lo manda por WhatsApp**: al ampliar, el botón del turno cambia a
   *"Avisar por WhatsApp lo que agregué"* con el texto `➕ AGREGUÉ A MI PEDIDO`.

⚠ **`ampliacionesVistas` guarda la MARCA DE TIEMPO, no un sí/no.** Si el cliente
agrega dos veces, la segunda también tiene que sonar.

⚠ **"Actualizar" ya no pisa el aviso de ampliación** (`avisoQueNoSePisa`). Antes,
tocar ese botón justo cuando alguien ampliaba borraba el "REVISA" y lo dejaba en
"Lista al día": el aviso más importante del sistema tapado por el menos
importante.

⚠ El parpadeo es **lento y solo del borde**, y se apaga con
`prefers-reduced-motion` dejando el rojo fijo. Un aviso no puede depender de una
animación, y quien mira el panel cinco horas seguidas no aguanta un parpadeo
rápido.

**44. 🐛 EL BUG SILENCIOSO DE LAS COOKIES — Analytics dejaba de medir al cliente que VOLVÍA.**

Salió en la auditoría final, y es el más difícil de ver de todos los que ha
tenido este proyecto: **no se notaba mirando la página**, no daba un error
visible y solo le pasaba al visitante que ya había estado antes.

**La cadena:**
1. `iniciarCookies()` leía la decisión guardada **primero**. Si decía
   "aceptadas", llamaba a `cargarMapa()`.
2. `cargarMapa()` **borra el aviso del mapa** (`#mapaAviso`), y con él el botón
   "Ver el mapa".
3. Dos líneas más abajo: `$('#btnVerMapa').addEventListener(...)` — sobre un
   botón que **ya no existía**. `null.addEventListener` → excepción.
4. La función se cortaba ahí, y con ella **todo lo que `iniciar()` llamaba
   después**: `iniciarInstalar()` y, sobre todo, el enganche de los eventos de
   Analytics.

**Consecuencia:** a **todo cliente que volvía** —los que ya conocen el local,
los que más valen— dejaba de medírsele cualquier clic: WhatsApp, el mapa, el
teléfono. Y nunca le salía el aviso de instalar la app. **En silencio.**

**Por qué ninguna prueba lo había visto:** todas empezaban con el navegador
limpio. Ahí `decision` es `null`, el mapa no se carga de entrada, el botón sigue
existiendo y no hay error. **El bug solo vive en la segunda visita.**

**Cómo quedó:** los `addEventListener` van **primero** y la decisión **después**,
más un `if (verMapa)` por si acaso. Enganchar antes de decidir lo hace imposible
de repetir.

⚠ **REGLA QUE SALE DE AQUÍ:** en cualquier función de arranque, **enganchar los
eventos antes de ejecutar lógica que pueda cambiar el DOM**. Y probar siempre el
caso del **visitante que vuelve**, no solo el de la primera visita: hay bugs que
solo existen ahí. Se creó la batería `vuelve.js` para eso (15 comprobaciones,
con las tres decisiones posibles de cookies).

**45. La salida por WhatsApp de "ya tienes un pedido" medía 14px.**

Medido en 9 celulares reales: el enlace *"Escríbenos por WhatsApp"* del paso
`#pasoEnCurso` iba suelto dentro de un párrafo y daba **14px de alto** (34 en
los más grandes), muy por debajo de los 44 de la decisión 26.

Importa más de lo que parece porque es **la única salida** del cliente legítimo
que pide para otra persona desde el mismo celular. Si no la puede tocar, se
queda sin camino. Ahora va en su propia línea con la clase `.encurso__salida`,
como bloque de 44px, subrayado y sin fondo para que **no compita** con el botón
amarillo de "agrégalo a mi turno", que es lo que hará casi todo el mundo.

**46. ⛔ TOCAR "EMPEZAR" CIERRA LA PUERTA — ya no se le puede agregar nada.**

**Corrige la decisión 43, que duró unas horas.** JX lo probó en el local:
*"aun así pude pedir después de que el vendedor le diera a ese botón"*.

**Antes:** el cliente podía sumarle platos a un pedido aunque ya estuviera en la
plancha, y el sistema avisaba fuerte (rojo, campana, WhatsApp).
**Ahora:** con la carne en el fuego, **no se agrega nada**.

**Por qué se cambió:** al preguntar, JX dio dos respuestas que se contradecían
—"déjalo agregar avisando fuerte" y "mientras no lo hayas empezado"— y se
resolvió a favor de la primera **sin decírselo**. Ese fue el error: la
contradicción había que señalarla, no decidirla por él. Al probarlo en el
mostrador quedó claro cuál manda: **cuando ya leíste la comanda y la carne está
en el fuego, un plato nuevo que entra sin que lo veas es un reclamo en el
mostrador**, y el rojo parpadeando no basta en hora pico.

**Qué puede y qué no puede hacer el cliente, según el estado:**

| Estado de su pedido | ¿Otro turno? | ¿Agregarle algo? |
|---|---|---|
| En la fila (`nuevo`) | ⛔ No | ✅ **Sí**, se suma a su turno |
| **En la plancha** (`preparando`) | ⛔ No | ⛔ **No** — solo por WhatsApp |
| Ya entregado | ✅ Sí, turno nuevo | — |
| Pasados 20 minutos | ✅ Sí, turno nuevo | — |

⚠ **LA COMPROBACIÓN VIVE EN EL SERVIDOR, no en la página**, y esto no es un
detalle: entre que al cliente le sale la pregunta y toca "agregar" pueden pasar
veinte segundos, y en ese rato el vendedor puede haber tocado "Empezar". **Solo
el servidor sabe el estado en el instante exacto.** Probado: se simula la
carrera y el servidor lo frena igual, dejando el pedido intacto.

⚠ **No se le deja sin salida.** Con el pedido en la plancha, la pantalla
esconde el botón amarillo, le explica *"Ya está en la cocina, así que esto no se
puede sumar solo"* y le deja el WhatsApp **con el turno y lo que quería agregar
ya escritos**. Decirle "no" sin decirle a dónde ir sería peor que no frenarlo:
el vendedor sigue pudiendo metérselo si alcanza, pero **decide él**.

⚠ Si el vendedor se arrepiente y lo saca de la plancha, **la puerta se vuelve a
abrir sola**. No hay estado pegado.

⚠ `ampliadoEnPlancha` y la tarjeta roja **se quedan en el código**: hay pedidos
en KV con la marca puesta de antes del cambio, y si algún día volviera a salir
`true` significaría que hay un camino que se saltó la comprobación — y el rojo
es justo lo que haría falta para enterarse.

**47. 🏷️ LA VERSIÓN DEL SITIO, al lado del nombre — `v1.0`.**

**Lo pidió JX** *"para saber si la web se actualiza correctamente como debería"*.
Ese es todo su propósito, y define cómo está hecha.

**Dónde:** en la barra de arriba, pegada a **PICHI BURGUER**, en las **7
páginas**. Píldora gris, 11px, Inter.

⚠ **ESTÁ ESCRITA EN EL HTML, no la pinta el JS**, y es deliberado: si la pintara
el JavaScript y el JavaScript fallara, no se vería justo cuando hace falta. Así
se ve siempre, incluso con el JS apagado. **Si el número es el viejo, el
navegador está sirviendo una copia guardada** — que es exactamente lo que JX
quiere poder comprobar de un vistazo.

⚠ **ES DELIBERADAMENTE DISCRETA.** Va en Inter (no en Archivo, la de los
títulos), en gris y a 11px frente a los 15 del nombre. Lo que la mantiene en
segundo plano son las tres cosas juntas, no solo el tamaño. El cliente viene a
pedir una hamburguesa, no a leer un número de versión: quien lo necesita sabe
dónde mirar.

⚠ **11px FIJOS, no `rem`.** En `rem` caía a **8,96px** en los celulares que
encogen la raíz — medido en 26 aparatos reales. Un número que no se puede leer
no sirve para lo que se creó.

**👉 CÓMO SUBIR LA VERSIÓN** (v1.0 → v1.1 → v1.2, de uno en uno):

```bash
sed -i 's|\(class="sitio-version"[^>]*\)>v1\.1<|\1>v1.2<|' *.html
grep -h 'class="sitio-version"' *.html | grep -o 'v1\.[0-9]*' | sort | uniq -c   # tiene que decir "7 v1.2"
```

⚠ **El comando que estaba escrito aquí NO servía**, y se descubrió al usarlo el
21 de septiembre para pasar a v1.1: `grep -rl 'sitio-version">v'` solo acierta
si el texto va **pegado** a la clase, y en 6 de las 7 páginas en medio está el
`title="Versión publicada del sitio"`. Resultado: **cambiaba una sola página y
dejaba las otras seis atrás** — justo la desincronización que la versión existe
para detectar. El comando de arriba ancla en la clase y **no le importa qué
atributos haya en medio**: comprobado, las 7 a la vez.

Y se anota en la bitácora de este archivo qué trae esa versión. ⚠ Si una página
se desincroniza, lo canta la batería `version.js`, que comprueba que las 7 digan
lo mismo.

**48. Los objetivos táctiles del pie y el teléfono.**

Salieron en la revisión responsive de 26 aparatos reales. Ninguno rompía el
diseño; simplemente **eran difíciles de acertar con el dedo**:

| Qué | Medía | Por qué importaba |
|---|---|---|
| Enlaces del pie (menú y legales) | **16–20px de alto** | Van uno debajo de otro; a 16px se toca el de al lado |
| El teléfono de contacto | **17px** | Es un enlace que **LLAMA**: acertarlo por error abre el marcador |
| Botón "Configuración de cookies" | 38px | Es un `<button>`, le tocan los 44 completos |
| Etiqueta "TURNO" (panel y seguimiento) | **9px** | Por debajo de 11 no se lee aunque el número de al lado sea enorme |

⚠ **El truco del pie, para no estirarlo:** el margen de `.pie li` bajó de 9px a
4px y esa diferencia se la llevó el **padding del enlace**. El pie se ve igual
de separado, pero ahora **el área que responde al dedo es la del enlace entero**
y no solo la altura de la letra. Mismo criterio que la decisión 26 con los chips
de categorías: los dedos ganan, la pantalla no pierde.

⚠ **Un enlace de navegación no necesita 44px, un botón sí.** El mínimo que se
exige en la batería es 32px para enlaces del pie (van apilados, lo que importa
es no tocar el de al lado) y **44px para todo lo que sea un control**. Mezclar
los dos criterios llenaba el informe de ruido y escondía los fallos de verdad.

**49. 🐛 EL BOTÓN AMARILLO QUE NO HACÍA NADA — `hidden` perdía contra `display`.**

**Lo encontró JX usando la página**, y su frase lo dice todo: *"cuando ya el
vendedor le dio a comenzar y decidió pedir otra con el mismo número de teléfono
y le doy en el botón amarillo y simplemente no hace nada"*.

**Qué pasaba, y por qué es peor de lo que parece:**
La decisión 46 dejó bien hecha la mitad importante —el servidor frena la
ampliación si el pedido ya está en la plancha— pero la página seguía
**mostrando el botón amarillo "Sí, agrégalo a mi turno"**. El cliente lo tocaba,
el servidor lo rechazaba con razón, y en la pantalla **no pasaba NADA**. Es la
peor forma de fallar: el cliente no cree que le dijeron que no, cree que la
página está rota, y una página rota no se vuelve a abrir.

**La causa, que vale para todo el proyecto:**
`js/script.js` hacía `$('#btnAgregarAlPedido').hidden = true`. Correcto. Pero el
atributo `hidden` lo aplica el navegador desde su **hoja de estilos por
defecto**, y esa pierde contra **cualquier** clase del sitio:

```css
.btn { display: inline-flex; }   /* gana */
[hidden]  /* la del navegador: display: none  → pierde */
```

O sea que **cualquier elemento con clase `.btn` era imposible de esconder** con
`hidden`. No era un fallo de esa pantalla: era un fallo de todo el sitio
esperando a que alguien lo pisara.

**Cómo quedó:** una sola línea, arriba del todo en el bloque de botones de
`css/styles.css`:
```css
[hidden] { display: none !important; }
```
⚠ **Es el único `!important` que se acepta sin discusión en este proyecto**, y
tiene que ir **antes que cualquier regla de `display`**. Lo que hace es que
esconder algo signifique esconderlo. Sin ella, cada vez que alguien escriba
`.loQueSea { display: … }` vuelve a romper un `hidden` que hoy funciona, y no se
entera hasta que un cliente lo pisa.

**⚠ NO ERA UN BOTÓN: ERAN TRES.** Después del arreglo se auditaron las 7
páginas borrando esa regla del CSS en caliente y midiendo qué elementos con
`hidden` se quedaban a la vista igual. Salieron **seis**, y **tres de ellos
estaban rotos de verdad para un cliente**:

| Elemento | Qué pasaba | ¿Lo veía alguien? |
|---|---|---|
| `#btnAgregarAlPedido` | El botón amarillo con el pedido en la plancha | **Sí** — es el que reportó JX |
| `#colaAvisar` | El botón **"🔔 Avísame cuando lo estén preparando"** salía en navegadores que **no pueden notificar** | **Sí, en TODO iPhone sin la app instalada.** Ahí no existe `Notification`, el JS lo escondía, el CSS lo mostraba igual, y al tocarlo no pasaba nada — **el mismo fallo que reportó JX, en otro sitio** |
| `#btnLimpiarBuscar` | La **✕** del buscador del panel salía con la casilla vacía | **Sí**, cada vez que el vendedor abría el panel |
| `#mapaAviso`, `#avisoFlotante`, `#encursoWhatsAlto` | Mismo problema latente | No: se quitan del DOM o se manejan por clase. Quedan protegidos igual |

Es exactamente lo que hacía falta demostrar: **no era un fallo de esa pantalla,
era un fallo del sitio**. Una línea de CSS arregló los tres a la vez, y cierra
la puerta a los que habrían aparecido después.

⚠ La batería `segui.js` **daba por bueno** el caso de `#colaAvisar`: pedía que
el botón apareciera siempre, y pasaba **porque el bug lo mostraba**. Corregida:
ahora comprueba la regla de verdad — el botón aparece **solo si este navegador
puede notificar**. Una prueba que pasa gracias al bug es peor que no tenerla.

**Y el aviso se rediseñó entero, que era la otra mitad de lo que pidió JX**
(*"la idea es innovar y que saliera un modal o algo así diciéndole al cliente
que lo sentimos, ya su pedido está en preparación... y que avise por WhatsApp o
llegue personalmente al local antes de 20 minutos... lo dejamos muy simple y
seco"*).

Antes era **el mismo formulario con el botón escondido**: seguía la pregunta
"¿quieres sumarle lo que escogiste?" y seguía la lista de platos, sin nada que
hacer con ella. Ahora son **dos bloques distintos** (`#encursoPuede` y
`#encursoNoPuede`) y el JS muestra uno u otro:

| Su pedido está… | Qué ve |
|---|---|
| En la fila (`nuevo`) | La pregunta, la lista y el botón amarillo. Igual que antes |
| **En la plancha** | 👨‍🍳 **"Tu pedido ya está en la cocina"**, la explicación, y **dos salidas numeradas**: escribir por WhatsApp (con el turno y lo que quería, ya escrito) o pasar por el local |

⚠ **Es un AVISO, no un formulario con el botón apagado.** No se pinta la lista
de lo que quería agregar: enseñar lo que el cliente no puede tener es
justamente lo que lo deja con la sensación de que el sistema le falló. Se le
dice qué pasó, por qué, y **a dónde ir** — las dos salidas, no una.

⚠ **El título de la ventana también cambia** ("Ya tienes un pedido" → "Tu
pedido ya se está preparando") y la caja del turno pasa de naranja a roja
apagada (`.encurso--cocina`). El color y el título dicen que esto no es una
pregunta **antes de que el cliente lea una sola palabra**.

⚠ El botón de WhatsApp lleva **el turno y lo que quería agregar ya escritos**.
El vendedor no tiene que preguntar nada: lee y decide si alcanza. Sigue
decidiendo él (decisión 46), pero con la información en la mano.

**50. 🔗 "¿ES PARA OTRA PERSONA?" → SE LE DA EL ENLACE, NO EL WHATSAPP DEL LOCAL.**

**JX:** *"lo que dice '¿es un pedido para otra persona? mejor pide aquí'... no
pongamos el WhatsApp, deja el mismo link de la web ahí, y que si es para otra
persona que simplemente le mande el link y lo haga desde su propio celular"*.

**Por qué tenía razón, y no es un detalle de redacción:**
Mandar a esa persona al WhatsApp del local convierte al cliente en
**intermediario de dos pedidos que el sistema no puede separar**. Ese segundo
pedido entra por chat, a mano, sin turno, sin quedar en el panel y sin
seguimiento — justo lo que este sistema existe para evitar. Y al vendedor le
llega trabajo extra en hora pico: transcribir un pedido mientras cocina.

Con el enlace, **la otra persona pide desde su celular con su número**, y por
eso mismo obtiene **su propio turno, su propio seguimiento (decisión 39) y su
propio aviso**. La regla de "un teléfono, un turno" (decisión 42) deja de ser un
estorbo y pasa a ser exactamente lo que debe ser: cada persona, su pedido.

**Cómo quedó** (`.encurso-otro`, al final de la ventana y separado por una línea
porque **no es parte de lo anterior**, es otra cosa):
- El enlace a la vista, en su caja: `pedidos-pichi-burguer-ctg.pages.dev`.
- Botón **"Copiar"**, que confirma en sí mismo con **"¡Copiado!"** en verde y
  vuelve solo a los 2 segundos.
- **"Enviar el enlace por WhatsApp"**, que usa `wa.me/?text=…` **sin número**:
  abre el selector de contactos para mandárselo **a quien sea**. Antes era
  `wa.me/573004752529`, que es el del local — el error de fondo.

⚠ **Si no hay permiso de portapapeles** (o el sitio se abre por http), el botón
**selecciona el texto** y cambia a "Cópialo". Un botón "Copiar" que no copia y
además no avisa es peor que no tener botón.

⚠ **El enlace sale de `CFG.negocio.dominio`, no escrito a mano.** El día que se
conecte el dominio propio (decisión 22) este sitio se actualiza solo. En el HTML
queda el texto por defecto por si el JS fallara, y por eso **sigue contando como
uno de los 7 sitios** donde vive el dominio.

**51. Fuera el botón "Llamar" del panel, y qué decía la etiqueta naranja.**

Dos cosas del mismo día, las dos de JX mirando el panel de verdad.

**"Llamar" se quitó por completo** (*"que no quede basura de eso"*). El pie de
la tarjeta tenía cinco botones y en el mostrador **no se llama, se escribe**:
una llamada interrumpe a quien está cocinando y no deja registro. El teléfono
**sigue a la vista** en la tarjeta por si hay que marcarlo a mano.
⚠ `telefonoLocal()` **se queda**: la sigue usando el botón de WhatsApp, y es la
que evita el `+5757…` de la decisión 16.

**La etiqueta decía "AMPLIADO RECIÉN" y JX preguntó qué significaba.** Con
razón: *"ampliado"* es la palabra del **código**, no la del mostrador. Lo que el
vendedor necesita saber no es el nombre del campo, es **que el cliente le agregó
platos a un pedido que él quizá ya leyó**. Ahora dice **"➕ AGREGÓ ALGO recién"**
(y **"⚠️ AGREGÓ ALGO · REVISA LA LISTA"** en el caso rojo), con un `title` que
lo explica entero al pasar el cursor.

⚠ **Y estaba mal puesta**: iba en la misma línea que el reloj de espera,
pegada, sin saberse dónde terminaba uno y empezaba el otro. Ahora va **debajo,
en su propia línea, con 7px de aire**. Son **dos avisos distintos** —cuánto
lleva esperando y que el pedido cambió— y ponerlos juntos los hacía ilegibles a
los dos.

⚠ **Regla que sale de aquí, y vale para todo el proyecto:** *una etiqueta que
el usuario tiene que preguntar qué significa está mal escrita.* Se nombra **lo
que pasó**, no cómo se llama el campo por dentro. Misma familia que la decisión
38: si quien usa el sistema pregunta, el texto es el que falla, no la persona.

### Verificación hecha antes de entregar

- **28 comprobaciones estáticas** (títulos únicos, un solo `h1`, JSON-LD válido,
  Open Graph, imágenes WebP con `alt` y dimensiones, enlaces vivos, crédito JX,
  breakpoints, sintaxis JS, sin basura de producción, precios coherentes en los 3
  sitios, NAP coherente, clave ausente del código).
- **27 pruebas funcionales en navegador real** (Playwright/Chromium): semáforo,
  carrito, validaciones, flujo de pedido completo, turnos consecutivos, mensaje de
  WhatsApp, banner de cookies, mapa condicionado, panel completo, responsive en 10
  tamaños de 320 a 1920px, consola limpia.
- **27 pruebas de la lógica del servidor** con un KV falso en memoria: turnos,
  recálculo del total, clave, corte de 5 horas, borrado sabatino en 4 momentos
  distintos de la semana, freno anti-spam y conteo de operaciones KV.

**Tres bugs reales encontrados por las pruebas y corregidos**: el banner tapando
el botón de pedir, los pedidos sin `creado` en modo local, y el nombre del cliente
saliendo en mayúsculas en el panel.

---

## ⚠️ {POR CONFIRMAR} PENDIENTES

Nada de esto se inventó. Está marcado visible en el código y hay que pedírselo a JX.

| Qué falta | Dónde está marcado | Por qué importa |
|---|---|---|
| **Precios de bebidas y adiciones** (gaseosas, jugos, agua, queso, papa, carne extra) | `index.html` línea ~622 (aviso visible), `llms.txt` | Publicar un precio inventado va contra el Estatuto del Consumidor. Hoy el sitio dice que sí las venden y que se piden por el campo de notas |
| **Razón social o nombre del responsable, NIT o cédula, correo de contacto** | `privacidad.html` (4), `terminos.html` (1), `compras.html` (1), `cookies.html` (1) — **7 en total**, verificado con grep el 21 de sept. | Lo exige la Ley 1581 de 2012, porque el sistema guarda nombre y teléfono de la gente. **Es el pendiente más importante de los tres**: sin un correo real, el cliente no puede ejercer sus derechos sobre sus datos |
| **Measurement ID de GA4** (`G-XXXXXXXXXX`) | `js/config.js` → `analytics.measurementId` | JX decidió instalarlo después. El snippet ya está listo y condicionado al consentimiento; solo falta pegar el ID |
| **Coordenadas exactas del local** | `index.html` línea ~59 (geo tags) y JSON-LD `geo` | Ahora están a nivel de barrio (10.398, −75.489). JX va a pasar el enlace de Google Maps del local; de ahí se sacan las coordenadas exactas |

### ✔ Datos CONFIRMADOS por JX — no volver a preguntar

| Dato | Valor |
|---|---|
| Nombre oficial | **Pichi Burguer** — con "gu", igual que el logo. El perfil de WhatsApp dice "Burger" pero manda el logo. Tiene que escribirse idéntico en todos lados o se rompe el SEO local |
| WhatsApp | +57 300 4752529 |
| Dirección | Cra 58A #6, Bernardo Jaramillo, Cartagena de Indias, Bolívar |
| **Dominio** | **`https://pedidos-pichi-burguer-ctg.pages.dev`** — es donde vive el sitio HOY (decisión de JX, sept. 2026). El dominio propio `pedidos-pichiburguerctg.com` **se conectará más adelante**; cuando pase, hay que cambiarlo en los 7 sitios de la tabla de abajo |
| **Horarios** | Horario REAL del local: **todos los días 18:00–23:00**, sin día de descanso (confirmado sept. 2026). ⚠ **PERO EL SITIO ESTÁ HOY EN MODO 24 HORAS** por decisión de JX, mientras monta la operación — ver decisión 23 para volver a lo real |
| Menú | 15 platos con sus precios reales, transcritos del menú impreso del local |
| Pagos | Efectivo, Nequi, Transferencia |
| **Entrega** | **SOLO para recoger** en el local (decisión de JX, sept. 2026). El domicilio se quitó del sistema entero — ver decisión 27 para devolverlo |
| ~~Costo del domicilio~~ | Ya no aplica: no hay domicilio. Se deja anotado que existió y que no tenía tarifa fija (se acordaba por WhatsApp), por si el servicio vuelve |
| Archivado | 5 horas → historial |
| Borrado del historial | Sábado 7:00 a. m. |
| Arquitectura | A + B: Cloudflare KV **y** respaldo por WhatsApp |
| Clave del panel | Definida por JX, guardada en la variable `PANEL_CLAVE` de Cloudflare — **nunca en el código** |

---

## 🚧 Reglas para el próximo chat

1. **Leer este archivo y `css/styles.css` (las `:root`) antes de agregar nada.**
2. Todo lo nuevo usa la ficha de diseño de arriba. Nunca un estilo distinto.
3. Toda imagen nueva → WebP, sin excepción.
4. Después de agregar cualquier cosa, revisar el responsive en TODOS los
   breakpoints: ≥1440, 768–900, 600–767, ≤900, ≤768, ≤500, ≤480, ≤380.
5. Comentar el código en español explicando **el porqué**, no el qué, y anotarlo
   en el "Mapa del código" de este archivo.
6. Ante cualquier duda o cosa rara, **preguntarle a JX** — nunca improvisar.
7. Las páginas legales deberían ser revisadas por un abogado antes de publicarse.
8. **Ninguna pregunta al usuario usa `confirm()`, `alert()` ni `prompt()`** del
   navegador. Se llama a `confirmar()` del bloque 0 de `js/panel.js`. Regla de
   JX, sin excepciones — ver decisión 31.
9. **Todo lo que escriba el cliente** (nombre, notas) se pinta con `textContent`,
   nunca con `innerHTML`, y lleva `overflow-wrap: anywhere` si va en una caja
   angosta. Las dos reglas nacieron de bugs reales, no de teoría.

---

## 📅 Bitácora — qué se hizo y cuándo

**Se suma, nunca se borra.** Cada chat que toque el proyecto anota aquí qué hizo.

### Septiembre 2026 · Construcción y entrega inicial
- Sistema completo construido desde cero: página del cliente, panel del vendedor,
  función serverless con Cloudflare KV, 4 páginas legales, SEO y deploy listos.
- Paleta extraída píxel a píxel del logo real (Modo 2).
- Menú transcrito del menú impreso: 15 platos con precios.
- **Tres bugs reales encontrados por las pruebas y corregidos:**
  1. El banner de cookies tapaba el botón "Hacer el pedido" en celular cuando ya
     había productos en el carrito — el cliente no podía comprar.
  2. En modo local los pedidos nacían sin `creado`, así que el panel los mandaba
     todos al historial y el botón "Entregado" no sabía a cuál se refería.
  3. El nombre del cliente salía en MAYÚSCULAS en el panel, heredado del estilo
     global de los `h3`.
- Auditoría anti-vibecoded de 24 puntos: 23 cumplidos, 1 no aplica (versión en
  inglés — Bernardo Jaramillo es barrio residencial, no zona turística).
- **Horarios confirmados por JX**: todos los días 18:00–23:00. Aplicado en los
  tres sitios (`js/config.js`, tabla visible del `index.html`, JSON-LD) y en el
  `llms.txt`. Los siete días pasaron a `confirmado: true`.
- **Costo del domicilio resuelto**: no hay tarifa fija, se acuerda por WhatsApp.
  Dejó de ser un `{POR CONFIRMAR}` y pasó a ser una decisión del negocio.
- **GA4 aplazado** por decisión de JX: el snippet queda listo, falta el ID.

---

### 19 de septiembre de 2026 · Revisión completa y correcciones

Revisión pedida por JX: responsive, errores y "que todo funcione". Se probó en
navegador real (Chromium) y con un KV falso en memoria, no solo leyendo código.

**Lo que se probó:** 14 tamaños de 320 a 1920 px más celular acostado en las 7
páginas; el semáforo en 7 momentos del día con el reloj congelado en hora de
Colombia; el flujo completo de pedido; las 20 comprobaciones de la API; la
limpieza sabatina en 4 momentos de la semana; y el panel con pedidos sembrados.

**Lo que salió BIEN y no se tocó:** cero scroll horizontal y cero desbordes en
todos los tamaños; el semáforo y el corte de 15 minutos antes del cierre; los
turnos consecutivos; el recálculo del total en el servidor (se le mandó
`total: 0` y un precio de −5.000 y respondió 32.000 y 0); el freno de 200
pedidos; el 401 cuando falta `PANEL_CLAVE`; la limpieza de los sábados; el
consentimiento de cookies (nada de Google carga antes de aceptar); los precios
coherentes en los 3 sitios; y que el banner de cookies **no** tapa "Hacer el
pedido" en ningún tamaño (el arreglo de la entrega inicial sigue funcionando).

**Bugs encontrados y corregidos:**
1. **"cerramos a las 11:00 p. m.."** — doble punto en los 4 mensajes del
   semáforo, visible en la portada todo el día. `aTexto12h()` ya devolvía el
   punto de "m." y el mensaje le sumaba otro.
2. **"p. m." se partía en dos líneas** en celulares angostos. Ahora lleva
   espacios duros (`\u00A0`).
3. **Las tres barras fijas dejaban ver el contenido por detrás** — el botón rojo
   "Agregar" se leía cruzando la barra superior y la del carrito. Ver decisión 14.
4. **El precio se escribía distinto** en la tarjeta (`$16.000`) y en el carrito,
   el WhatsApp y el panel (`$ 16.000`). Ver decisión 15.
5. **PANEL: "Llamar" y "WhatsApp" no servían** si el cliente escribía su celular
   con el 57. Salía `tel:+57573001234567`. Ver decisión 16.
6. **La etiqueta amarilla quedaba pegada a la barra** al saltar por categorías:
   el `scroll-margin-top` valía exactamente el alto de las dos barras, cero aire,
   y la rotación de −1.2° hacía que la esquina se metiera debajo. Se le sumaron
   18px.
7. **El `FAQPage` del `<head>` no existía en la página.** Ver decisión 13.
8. **La ventana del pedido no encerraba el foco.** Ver decisión 17.
9. **`<label>` huérfanos** (sin `for`) rotulando los grupos de entrega y pago.
   Pasaron a `<span class="campo__titulo">`, que se ve igual; el nombre
   accesible del grupo ya lo daba el `aria-labelledby` del `role="radiogroup"`.
10. **"Actualizar" estaba dentro del `role="tablist"`** del panel y el lector de
    pantalla lo anunciaba como una tercera pestaña. Las dos pestañas se movieron
    a un contenedor propio con `display: contents` (cero cambio visual).
11. **Solo se medía el primero de los dos enlaces `tel:`** (el del pie nunca).
12. **`.barra` con `height` fijo** — blindado. Ver decisión 18.

**Limpieza menor:** se quitó `pestanaActual` de `js/panel.js` (se asignaba y
nunca se leía); el año del copyright de la 404 y las 4 legales ahora se calcula
solo (antes decía 2026 fijo y esas páginas no cargan JS); `sitemap.xml` al día;
y se corrigió la ficha de diseño de este archivo, que decía que los botones
usaban `--radio-full` cuando usan `--radio-sm`.

**Pendiente nuevo para JX:** la clave del modo local es adivinable. Está anotado
arriba en la tabla de `{POR CONFIRMAR}`.

### 20 de septiembre de 2026 · Puesta en marcha

Pedido de JX: poner la web a funcionar ya. Tres cosas.

**1. Cortina de cerrado (a partir de un video de referencia que pasó JX).**
Letrero de CERRADO colgado de dos cuerdas que se mece como péndulo, "Te
esperamos pronto" arriba, el horario del día y una cuenta regresiva en vivo al
segundo. Mismos colores del sitio: fondo negro con el degradado rojizo de la
portada, tabla blanca con borde y letras en `--rojo`, reloj en `--amarillo`.
El vaivén son dos animaciones encadenadas: un empujón inicial que se va
apagando (`letrero-entrada`, 2,6 s) y un vaivén suave permanente
(`letrero-vaiven`). Un solo `@keyframes` infinito no sirve: al repetirse
volvería a dar el golpe fuerte. Ver decisión 19.

**2. Modo prueba.** Ver decisión 20.

**3. Clave del panel fuera del código.** Se eliminó el hash SHA-256 que había en
`js/panel.js` y toda la lógica de acceso en modo local. Ver decisión 21.

**Archivos tocados:** `index.html` (cortina + franja), `css/styles.css`
(bloques 7bis y 7ter), `js/script.js` (bloques 0 y 1bis, marcado del pedido),
`js/almacen.js` (`borrarPruebas`, campo `prueba` en modo local),
`js/panel.js` (hash fuera, marca de prueba, botones nuevos), `panel.html`
(dos botones), `functions/api/pedidos.js` (campo `prueba`, acción
`borrar-pruebas`).

**Probado en navegador real:** la cortina aparece a las 14:14 y no a las 19:30;
la cuenta regresiva calcula y corre; "Ver el menú" la quita pero deja PEDIR
bloqueado; los 15 platos siguen en el HTML con la cortina puesta (lo que ve
Google); el modo prueba desbloquea el pedido, lo marca en los cuatro sitios y se
puede apagar; el panel entra solo con la clave del servidor y la clave no
aparece en el HTML servido; borrar pruebas deja los reales intactos. Responsive
comprobado en 10 tamaños de 320 a 1920 px más dos horizontales: el letrero nunca
se sale de pantalla ni pisa el texto de abajo, y la franja naranja nunca tapa la
barra del logo.

**Bug encontrado y corregido durante el trabajo:** el alto de la franja de
prueba estaba fijo en 30px; en pantallas angostas el texto pasa a dos líneas, la
franja crecía a 48px y tapaba la barra del logo. Ahora lo mide el JS y lo vuelve
a medir al girar el teléfono.

### 21 de septiembre de 2026 · En producción, abierto 24 horas

**El sitio salió al aire**: `https://pedidos-pichi-burguer-ctg.pages.dev`

- Cloudflare Pages quedó configurado: espacio KV `pichi-burguer-pedidos`
  enlazado como `PEDIDOS`, y la clave del panel como **secreto** `PANEL_CLAVE`.
- El dominio del código pasó del `.com` (que no sirve el sitio) al `pages.dev`
  real. Ver decisión 22.
- **Interruptor de 24 horas encendido** por decisión de JX. Ver decisión 23.
  El horario real (18:00–23:00) queda guardado y documentado para volver.

**Comprobado contra el sitio EN VIVO** (no contra una copia local):
la web responde en 0,6 s; el KV quedó enlazado; se creó un pedido real de prueba
(turno 1) y **el servidor ignoró un total falso de $1.000 y cobró los $38.000
correctos**; el panel devuelve 401 sin clave y con clave falsa; **la clave no
aparece en los 138 KB que sirve el sitio**; las 7 páginas cargan; la 404 sale con
el diseño del sitio; las 4 cabeceras de seguridad están puestas; consola limpia.

**Probado el modo 24 horas en 6 momentos del día** (madrugada, mediodía, justo
antes de abrir, el corte de los 15 minutos, después de cerrar y medianoche): en
los seis se puede pedir, la cortina no aparece y la tabla dice "Abierto 24
horas". Un pedido hecho a las 3 de la madrugada **sin** modo prueba sale como
pedido real, sin marca de prueba ni en el panel ni en el WhatsApp.

**Nota sobre el modo prueba:** ese mismo día, más tarde, JX pidió eliminarlo
por completo. Ver decisión 20.

### 21 de septiembre de 2026 (tarde) · Avisos al vendedor

Auditoría pedida por JX ("dime qué falta para que un cliente ya pueda usarla").
Salieron dos cosas de verdad:

**1. El vendedor no se enteraba de los pedidos.** Ver decisión 24. Arreglado con
campana, notificación del sistema, pantalla que no se apaga y contador en el
título de la pestaña. Probado: 13 comprobaciones en navegador real.

**2. Un `{POR CONFIRMAR}` que ya no debía estar.** `compras.html` decía "El
costo del domicilio {POR CONFIRMAR} se acuerda por WhatsApp". JX ya lo había
resuelto hacía días: no hay tarifa fija. Esa página la lee el cliente antes de
comprar, y el marcador naranja le decía que el negocio no sabe cuánto cobra.

**Nota sobre las pruebas de la cortina de cerrado**: con `siempreAbierto: true`
esas pruebas fallan a propósito, porque la cortina ya no aparece nunca. Se
comprobó aparte que al poner el interruptor en `false` la cortina vuelve, la
cuenta regresiva calcula y la tabla recupera el horario real. El código de la
cortina sigue intacto esperando el día que JX vuelva a los horarios reales.

### 21 de septiembre de 2026 (noche) · Fuera el modo prueba

JX: *"en el panel quitemos también todo eso de prueba, que sea totalmente real"*.

Se eliminó el modo prueba **completo**, de los 7 archivos donde vivía. Ver
decisión 20, que queda como registro de lo que fue y por qué se quitó.

**Lo que desaparece de la pantalla:** la franja naranja de la página del
cliente, los botones "Probar la página como cliente" y "Borrar pedidos de
prueba" del panel, la marca naranja de las tarjetas y el aviso de prueba en el
mensaje de WhatsApp. `index.html?prueba=1` ya no hace absolutamente nada.

**Comprobado después de quitarlo:** el pedido guardado ya no trae el campo
`prueba` (14 campos, ninguno de prueba); el servidor responde "Acción no
reconocida" a `borrar-pruebas`; si alguien manda `prueba: true` a mano, se
ignora; el panel sigue con sus 6 botones útiles; el flujo de pedido completo y
los avisos al vendedor siguen pasando sus pruebas.

⚠ **Pendiente para JX (lo hace él):** vaciar el KV para que el contador de
turnos vuelva a 1. Los pedidos de prueba del día gastaron los turnos 1, 2 y 3,
así que el primer cliente real recibiría el turno 4. Se borran las claves
`dia:AAAA-MM-DD` e `indice:dias` desde Cloudflare → Workers KV →
`pichi-burguer-pedidos` → Pares de KV.

### 21 de septiembre de 2026 (cierre) · Borrar pedidos sueltos

Último pedido de JX del día: poder borrar cualquier pedido desde el panel.
Ver decisión 25. Botón 🗑 en cada tarjeta, acción `borrar-pedido` en el
servidor y `borrarPedido()` en el almacén (nube y local).

Probado: 401 sin clave, 400 sin decir cuál, 404 con un id inventado, borra el
del medio dejando los otros dos, **el siguiente turno sigue siendo el 4 y no
recicla el 2 borrado**, y si era el último del día el documento se borra entero
y el día sale del índice. En el panel: el botón mide 44×44 en los tres tamaños
probados, la confirmación nombra al cliente, cancelar no borra, y al vaciarse
sale "No hay pedidos ahora mismo".

### 21 de septiembre de 2026 (auditoría final) · Listo para entregar

JX pidió la revisión final antes de entregar, con foco en celulares.

**Probado contra el sitio EN VIVO, no contra una copia**, con los perfiles
reales de Playwright (ancho, alto, densidad de pantalla y user-agent de cada
aparato):

- **15 celulares y tabletas**: Galaxy S5, S8, S9+, Tab S4; iPhone SE, 8, 11, 12,
  13, 14 Pro Max, 15; Pixel 5 y 7; iPad Mini y Pro 11.
  **Cero scroll horizontal, cero desbordes, consola limpia en los 15.**
- **Flujo completo con toques reales** (no clics simulados) en iPhone SE, iPhone
  14 Pro Max y Galaxy S8: carrito, contador +/−, ventana del pedido, validación
  y foco al campo que falla. Los campos miden 16px, así que **iOS no hace zoom**
  al escribir.
- **Pedido extremo en el panel** (nombre de 48 caracteres, dirección de 110,
  notas de 150 y 3 platos) en tres anchos: nada se desborda.
- **Celular acostado** en tres tamaños: la ventana del pedido cabe y se desplaza
  por dentro.
- **Sin JavaScript**: los 15 platos y los precios se leen igual, el botón de
  WhatsApp sigue funcionando (es un enlace real) y la cortina no se queda puesta.
- **Velocidad en 4G flojo** (1,6 Mbps, 150 ms): primer dibujo a **1,36 s**,
  página completa a 2,27 s, **148 KB** y 6 archivos. Ninguna petición falló.

**Lo único que salió**: los objetivos táctiles de la barra de categorías.
Corregido. Ver decisión 26.

**Anotado para JX, no corregido** (toca la regla de imágenes, decide él): el
logo pesa 111 KB de los 148 KB de la página, porque se sirve el original de
1254×1254 para un hueco de 220px. Una versión de 440px bajaría la página a unos
60 KB. Son **3 de cada 4 KB** que descarga el cliente.

### 21 de septiembre de 2026 (noche) · Solo recoger + 5 mejoras + panel

**1. Se quitó el domicilio de todo el sistema.** Ver decisión 27. Tocó 9 sitios,
incluidas las 3 páginas legales que lo prometían o declaraban recoger la
dirección del cliente. El formulario pasó de 6 campos a 4.

**2. Las 5 mejoras que JX escogió de la lista de recomendaciones:**
- Logo partido en dos archivos: **89 KB menos por visita**. Decisión 30.
- Repetir el último pedido. Decisión 28.
- Ver la cola de turnos en vivo. Decisión 28.
- Invitación a instalar la app. Decisión 28.
- "Avisar listo" en el panel: el botón de WhatsApp ya no abre un chat en blanco,
  manda el mensaje escrito con el nombre, el turno y la dirección. Para un
  pedido ya entregado cambia a un agradecimiento.

**3. Tres arreglos del panel tras usarlo en el mostrador.** Ver decisión 29:
el botón de borrar ahora se ve, "Actualizar" da señal de vida, y la campana
suena 3 veces.

**Bug propio encontrado y corregido durante el trabajo:** el aviso de instalar
mostraba las instrucciones de iPhone aunque el navegador sí pudiera instalar,
porque miraba el modelo del aparato antes que la capacidad real. Ahora decide
por si existe el evento del navegador.

**Probado**: 7 comprobaciones del flujo solo-recoger, 13 de las mejoras del
cliente (incluida la que confirma que repetir un pedido usa los precios de HOY
y no los guardados), 12 del panel, 22 del servidor y 6 de borrar pedidos.

### 21 de septiembre de 2026, 9:04 a. m. · Fuera los cuadros grises de Chrome + 6 mejoras del panel

JX, interrumpiendo el trabajo anterior: *"no me gustan estas confirmaciones
así... quiero como un modal con el mismo diseño de la web bien bacano y
atractivo... esos del mismo Chrome no me gusta. Si la página tiene eso en más
partes aparte de solo esa, cambiémoslas todas, para que vayas sabiendo desde
ahora"*.

**1. Ventana de confirmar propia.** Ver decisión 31, que queda como **regla
permanente del proyecto**. Se buscó en todo el repositorio: había exactamente
dos `confirm()`, los dos en `js/panel.js` (borrar un pedido y borrar el
historial). Los dos pasaron a la ventana nueva. **No queda ni un `confirm()`,
`alert()` ni `prompt()` en el sitio** — comprobado con grep y, en navegador
real, saboteando `window.confirm` para que la prueba cantara si alguien lo
llamara.

**2. Las 6 mejoras del panel** (#1, #2, #3, #7, #8, #9 de la lista que JX
escogió). Ver decisión 32. Quedaron terminadas: el JS ya estaba escrito y en
esta tanda se le agregó el markup de `panel.html` y todo el CSS.

**3. La campana pasó de 3 a 5 toques y más fuerte**, como pidió JX
(`CAMPANA_VECES = 5`, `CAMPANA_VOLUMEN = 0.6`). Actualiza lo que decía la
decisión 29.

**Tres bugs reales encontrados por las pruebas y corregidos:**
1. **Un nombre largo sin espacios rompía el panel entero.** Con un cliente
   llamado `MariaJoseRodriguezHernandezDeLaTorre`, a 320px el ancho del
   documento se iba a **555px** y el vendedor tenía que arrastrar de lado para
   ver el botón "Entregado". La auditoría del 21 había probado un nombre de 48
   caracteres, pero **con espacios**, y esos sí parten solos. Arreglado con
   `overflow-wrap: anywhere` en el nombre, en las notas y en los platos — todo
   lo que escribe el cliente. Comprobado: 555px → 320px.
2. **"🔥 En la plancha" se partía en dos líneas** a 390px y dejaba la fila de
   botones con alturas distintas, que se lee como si algo estuviera roto. Texto
   acortado y `white-space: nowrap` en todos los botones del pie.
3. **El botón "Borrar" medía 40px de ancho** en celulares de ≤380px: al esconder
   la palabra quedaba solo el emoji con 12px de relleno. Por debajo del mínimo
   de 44 de la decisión 26, justo el tamaño donde el pulgar empieza a fallar.
   Arreglado con `min-width: 44px`.

**Probado en navegador real (Chromium):**
- **51 comprobaciones** de la ventana de confirmar y las 6 mejoras: que no se
  llame ningún diálogo nativo, qué dice la ventana, que el foco arranque en
  Cancelar, que cancelar/Escape/clic en el fondo no borren, que el tabulador no
  se escape en 10 saltos, que aceptar sí borre, **que un nombre con
  `<img onerror>` no ejecute nada**, y las 6 mejoras una por una.
- **6 anchos** (320 a 1280): la ventana cabe entera, sin scroll lateral, con los
  botones a 48px.
- **5 anchos**: los 13 objetivos táctiles del panel miden 44px o más.
- **22 comprobaciones del servidor** con un KV falso: el campo `prueba` ya no
  existe y se ignora si lo mandan, `borrar-pruebas` responde "Acción no
  reconocida", el estado se guarda y un estado inventado cae a `'nuevo'`,
  deshacer entregado funciona y da 401/404 cuando toca, **la cola pública
  devuelve solo números y no filtra ni un nombre ni un teléfono**, y el turno
  sigue sin reciclarse al borrar.
- Las baterías anteriores (solo-recoger, mejoras del cliente, flujo en celular,
  borrar pedidos) vuelven a pasar.

**README.md puesto al día** (estaba de antes del cambio a solo-recoger): decía
que el panel muestra "si es domicilio o para recoger, la dirección"; que la
pantalla de CERRADO aparece fuera del horario, cuando con el modo 24 horas no
sale nunca; y no mencionaba ninguna de las funciones nuevas. Ahora lleva además
dos tablas que antes no existían: **qué sabe hacer el panel** (los 9 botones, uno
por uno) y **qué sabe hacer la página del cliente**, más una sección
**"¿está listo para usarse?"** con lo que falta y quién lo hace.

**Dos arneses de prueba actualizados, no el código:** el de borrar esperaba el
`confirm()` nativo, y `api2.mjs` comprobaba entero el modo prueba que JX eliminó
el 21 (decisión 20). Este último se reescribió al revés —ahora verifica que del
modo prueba no quede rastro— y de paso **se le quitó la clave real que tenía
escrita**; usa una ficticia.

### 21 de septiembre de 2026 · Los archivos de SEO, al día

JX: *"ojo pero ya sabes que no solo el README y el CLAUDE... también otros
documentos que estén desactualizados, el SEO y todo, y para agregarlo en web
analytics para que aparezca en Google"*. Tenía razón: el código estaba al día y
los archivos que lee Google se habían quedado atrás.

**Cinco cosas corregidas.** Ver decisión 33 para el detalle y el porqué de cada
una. La peor era `llms.txt`, que **se contradecía a sí mismo** sobre el horario.

**Lo que se le agregó al README** (es el archivo que lee JX, así que ahí va lo
práctico):
- **"Que la página aparezca en Google"**: los pasos de Search Console uno por
  uno, incluida la etiqueta de verificación que **nunca se borra**, cómo enviar
  el sitemap y cómo pedir la indexación en vez de esperar.
- **Los 9 eventos de Analytics** en una tabla, diciendo qué mide cada uno y para
  qué sirve leerlo. Ver decisión 34.
- **Qué está ya hecho y no hay que tocar**: JSON-LD, menú en el HTML, FAQ
  visible, sitemap, robots, llms.txt, Open Graph y canonical.

**Probado:** 26 comprobaciones de SEO — que los 4 archivos se sirvan, que el
JSON-LD siga siendo válido y declare lo de recoger, que **los precios digan lo
mismo en los 4 sitios** (tarjeta visible, `data-precio`, JSON-LD y `llms.txt`),
que **config, tabla, JSON-LD y llms.txt coincidan en el horario**, que el NAP
(nombre, dirección, teléfono) sea idéntico en todo, y que las descripciones de
las 7 páginas quepan en Google. Más las 23 de la revisión general, otra vez en
verde.

### 21 de septiembre de 2026 · Dos agujeros que solo salieron probando EN VIVO

Al probar contra el sitio publicado —no contra una copia local— salieron dos
cosas que ninguna prueba anterior había visto, porque **las dos dependen de cómo
sirve Cloudflare el sitio de verdad**.

**1. Se podían mandar precios falsos.** Ver decisión 35. El servidor recalculaba
el total pero aceptaba el precio de cada plato. Se le envió una Hamburguesa
Pichi a $1 y **la guardó en $1**. Ahora los precios salen de `CARTA`, una tabla
del propio servidor, y lo que mande el navegador se ignora. Probado con 11
comprobaciones: precio falso, precio 0, precio negativo, precio inflado, un
plato inventado y los 15 de la carta.

**2. El panel del vendedor podía salir en Google.** Ver decisión 36. Cloudflare
redirige `/panel.html` → `/panel`, y tanto `_headers` como `robots.txt` estaban
escritos solo para la primera. La dirección que de verdad se visita salía **sin
`noindex` y sin `no-store`**. Comprobado con `curl` contra el sitio en vivo:
`/panel.html` traía las cabeceras, `/panel` no.

**Dos cambios que pidió JX el mismo día:**
- **Fuera el botón de imprimir** la comanda. Ver decisión 37.
- **La ventana de borrar ahora explica el porqué.** JX leyó "el turno no se
  vuelve a usar" y preguntó por qué no dárselo al siguiente. Ver decisión 38,
  que deja escrita la regla de redacción que sale de ahí.

**Probado después de todo:** 51 comprobaciones del panel y la ventana de
confirmar, 22 del servidor, 11 de los precios, 26 de SEO y 23 de revisión
general. Todo en verde.

### 21 de septiembre de 2026 · El cliente ya sabe cómo va su pedido

JX: *"no sé si haya manera de que le llegue la notificación a un cliente... que
no solo haya enviado a hacerlo y ya, no sepa más de él"*. Y la frase que definió
la solución: *"no importa si cierra la pestaña; que entre a la app y le
notifique de una vez"*.

Se implementaron **tres capas** (decisión 39), después de descartar el push real
por escrito y explicando por qué. La clave fue darse cuenta de que **la capa que
más sirve es la más simple**: que al entrar a la página ya lo vea, sin permisos
ni notificaciones de por medio. Eso funciona hasta en un iPhone que no instaló
nada, que es donde las otras dos fallan.

**Un bug propio encontrado y corregido:** la tarjeta de seguimiento quedaba
**2px ENCIMA** de la etiqueta amarilla de la primera categoría —medido a 390px,
se tocaban— porque la sección se copió de `.repetir`, que no lleva espacio
abajo. Ahora lleva 26px y quedan 24px de aire, comprobado en 6 anchos y con las
dos tarjetas visibles a la vez.

**Probado (27 comprobaciones en navegador real):** que sin pedido previo no
aparezca nada; que al pedir se guarde solo el turno y la hora y **nada
personal**; que al cerrar la pestaña y volver a entrar ya diga cómo va; que
cambie a verde cuando el vendedor toca "Empezar"; que al tocarla abra la
pantalla del turno y no el formulario; que se borre sola al entregarse; que **un
turno de ayer no se confunda con uno de hoy**; que caduque a las 6 horas; y el
responsive en 6 anchos. Más 12 de la notificación: que arranque apagada, que el
botón la active, que **llegue con la página en segundo plano**, que vibre y que
**no se repita** pasados otros 30 segundos.

Las 11 baterías del proyecto vuelven a pasar: 51 del panel, 27 del seguimiento,
26 de SEO, 23 de revisión general, 24 del flujo en celular, 22 del servidor, 13
de las mejoras del cliente, 12 de la notificación, 11 de los precios, 7 de
solo-recoger y 6 de borrar pedidos.

### 21 de septiembre de 2026 · Qué hay dentro del KV

JX fue a vaciar los pedidos de prueba y se encontró con dos claves que no sabía
qué eran. Se comprobó contra el servidor en vivo que **el contador ya estaba en
cero** (`turnoDelDia: 0`), así que no había nada que borrar: el siguiente cliente
recibe el turno 1.

Queda documentado en la decisión 40 qué es cada clave y **cuál no se debe
borrar** (`meta:limpieza`), más la forma de comprobar el contador con un solo
comando, sin entrar a Cloudflare y sin arriesgarse a borrar la equivocada.

De paso quedó confirmado que **la limpieza automática de los sábados funciona**:
la marca decía que la última pasada fue ese mismo día a la 1:21 de la madrugada.

### 21 de septiembre de 2026 · Dos fallos que encontró JX usando la página

Ninguna prueba los había visto. Los dos salieron de usar el sistema como lo usa
un cliente.

**1. "Ya están preparando el tuyo" salía apenas pedía.** Ver decisión 41. El
servidor adivinaba: si nadie estaba en la plancha, devolvía el turno más bajo
pendiente *"como la mejor suposición"*. Al primer cliente del día eso le decía
que su pedido ya estaba en la plancha en el mismo segundo en que lo enviaba —
**y le sonaba la notificación**. Ahora el endpoint devuelve `preparando: null`
mientras nadie toque "Empezar", y de ahí sale la regla: **un endpoint no
adivina**.

**2. El mismo cliente podía coger todos los turnos que quisiera.** Ver decisión
42. JX lo comprobó desde su celular. Ahora un teléfono tiene un turno a la vez,
y si vuelve a pedir se le ofrece **sumarlo a lo que ya pidió** en vez de darle
otro número. Se descartó identificar por IP y queda escrito por qué: en un
barrio, bloquear por IP bloquea vecinos.

**3. Ampliar un pedido que ya está en la plancha** avisa por tres caminos a la
vez. Ver decisión 43.

**Dos bugs propios corregidos durante el trabajo:**
- **"Actualizar" pisaba el aviso de "REVISA"** y lo dejaba en "Lista al día": el
  aviso más importante tapado por el menos importante.
- En el texto nuevo se coló **"No se cobra domicilio"**. El local no hace
  domicilios (decisión 27) y nombrar la palabra, aunque sea para negarla, planta
  la duda. Lo cazó la batería de revisión general.

**Probado:** 25 comprobaciones del servidor (un teléfono no coge dos turnos,
cambiar el nombre no sirve, otro cliente sí puede, ampliar no gasta turno, los
precios salen de la carta, no se puede tocar el pedido de otro, entregado →
turno nuevo, a los 21 minutos → turno nuevo) y 28 en navegador real de punta a
punta, incluidas las marcas del panel en naranja y en rojo. Más 8 del bug del
verde, con el caso de la cuenta exacta cuando falta un turno en medio.

### 21 de septiembre de 2026 (auditoría final) · 323 comprobaciones, cero fallos

JX: *"busca más errores posibles y si todo quedó en perfectas condiciones ya
listo"*. Se buscaron de verdad, con dos baterías nuevas hechas para eso.

**Auditoría del servidor (34 comprobaciones nuevas):** entradas basura (nombre
en blanco, de 500 letras, teléfono con letras, cantidad 9999, cantidad negativa,
200 platos, notas de 1000), inyección (`<script>`, carácter nulo, tildes y
chino), métodos y acciones desconocidas, **siete variantes de la clave**,
el cupo de KV con 200 pedidos reales, y las combinaciones raras del pedido en
curso (entregar y volver a pedir, deshacer un entregado, borrar el que está en
curso, ampliar hasta 40 platos, ampliar uno ya entregado).

**Auditoría del cliente (12 comprobaciones nuevas):** accesibilidad de las 7
páginas (imágenes sin `alt` o sin medidas, botones sin nombre, campos sin
etiqueta, saltos en la jerarquía de títulos), títulos únicos, enlaces y anclas
rotas, que todas las imágenes sean WebP y ninguna pase de 60KB, el peso total,
**cero `console.log`, TODO o `debugger`** en el código servido, y un pedido
monstruoso en el panel (turno 999, nombre de 56 letras sin espacios, 12 platos
de nombre larguísimo, 20 unidades cada uno, notas de 180 caracteres) en 4 anchos.

**Dos bugs reales encontrados y corregidos:**
1. **El bug silencioso de las cookies.** Ver decisión 44. El peor de todos los
   que ha tenido el proyecto porque no se veía: a todo cliente que volvía
   dejaba de medírsele cualquier clic en Analytics.
2. **La salida por WhatsApp medía 14px.** Ver decisión 45.

**Dos falsos positivos que NO eran bugs, comprobados y descartados:**
- *"La clave con un espacio al final entra"* — no es el código: `claveValida()`
  compara longitud exacta y sin `trim`. **HTTP recorta los espacios de las
  cabeceras por especificación**, así que el espacio nunca llega. Solo le sirve
  a quien ya sabe la clave.
- *"Hay TODO/FIXME en el código"* — era la palabra española **TODOS** y el
  `G-XXXXXXXXXX` de GA4, que es un pendiente marcado a propósito.

**Estado final: 323 comprobaciones en 18 baterías, cero fallos.**

### 21 de septiembre de 2026 (cierre) · "Empezar" cierra la puerta

JX lo probó en el local: *"aun así pude pedir después de que el vendedor le
diera a ese botón"*. Tenía razón en esperar lo contrario.

Al revisarlo salió que **sus dos respuestas se habían contradicho** cuando se le
preguntó —"déjalo agregar avisando fuerte" y "mientras no lo hayas empezado"— y
que se resolvió a favor de la primera **sin señalárselo**. Ese fue el error de
método: una contradicción del usuario se le dice, no se decide por él.

Ahora **tocar "Empezar" cierra la puerta**: ese cliente no puede sacar otro
turno *ni* agregarle nada. Ver decisión 46, con la tabla de qué puede hacer
según el estado.

**La comprobación se puso en el SERVIDOR**, no en la página, y se probó la
carrera: el vendedor toca "Empezar" entre que al cliente le sale la pregunta y
responde. El servidor lo frena igual y el pedido queda intacto. Solo él sabe el
estado en el instante exacto.

**Y no se le deja sin salida:** con el pedido en la cocina, la pantalla esconde
el botón, le explica por qué y le deja el WhatsApp **con su turno y lo que
quería agregar ya escritos**. El vendedor sigue pudiendo metérselo si alcanza,
pero decide él.

**Probado:** 15 comprobaciones nuevas del servidor (antes y después de
"Empezar", que no pueda sacar turno, que se reabra si el vendedor se arrepiente,
la carrera, y que una ampliación normal nunca lleve ya la marca roja) y 31 en
navegador real. Dos arneses viejos actualizados al comportamiento nuevo.

**Estado final: 335 comprobaciones en 19 baterías, cero fallos.**

### lunes 21 de septiembre de 2026, 2:01 p. m. · Versión visible + revisión responsive completa

**1. Se le puso versión al sitio: `v1.0`**, al lado de PICHI BURGUER en las 7
páginas. Ver decisión 47, con el comando para subirla. JX lo pidió para
comprobar de un vistazo si una actualización llegó de verdad al celular de
alguien o si el navegador está sirviendo una copia guardada.

Nota: JX dijo *"v1.0 y después v1.2"*; se usa la numeración habitual
**v1.0 → v1.1 → v1.2**, de uno en uno, para que no queden números saltados. Se
le avisó.

**2. Revisión responsive completa**, que es lo que JX pidió expresamente:
*"los clientes usan más celulares... android e iphones tanto pequeños como
grandes, gama baja, alta, media y altísima, y tablets"*.

**26 aparatos reales × 7 páginas × 2 orientaciones = 364 pantallas revisadas**,
con los perfiles de Playwright (ancho, alto, densidad y user-agent de verdad de
cada modelo, no solo un tamaño de ventana):

| Gama | Aparatos |
|---|---|
| **Android bajo/viejo** | Galaxy S III, Note II, S5 |
| **Android medio** | Galaxy S8, A55, Pixel 5 |
| **Android alto** | Galaxy S9+, Pixel 7, **Galaxy S24** |
| **iPhone pequeños** | SE (320px), 6, 12 Mini, 13 Mini |
| **iPhone normales** | 8, XR, 12, 14, 15 |
| **iPhone grandes** | 8 Plus, 14 Pro Max, **15 Pro Max** |
| **Tablets** | iPad Mini, iPad gen 7, iPad Pro 11, Galaxy Tab S4, Tab S9 |

**En cada pantalla se revisó:** scroll lateral, elementos que se salen, texto
cortado dentro de su caja, objetivos táctiles, letra por debajo de 11px, campos
por debajo de 16px (que harían zoom en iOS) y errores de consola.

**Cuatro hallazgos reales, todos corregidos.** Ver decisión 48. Ninguno rompía
el diseño: eran cosas difíciles de acertar con el dedo o de leer.

**Dos falsos positivos descartados por escrito:** el texto `.sr-only` (está
recortado a 1px a propósito, es para lectores de pantalla) y el crédito de JX
Company (lleva formato exacto obligatorio que no se modifica).

**Resultado: 26 aparatos ✅ / 0 ❌ de pie y acostados.**

**Estado final: 724 comprobaciones (360 funcionales + 364 pantallas), cero
fallos.**

### lunes 21 de septiembre de 2026, 2:54 p. m. · Los 4 arreglos que pidió JX, y 3 bugs más que salieron detrás

JX, con capturas: *"NADA, NO hemos arreglado nada"*. Tenía razón en las cuatro.

**1. El botón amarillo que no hacía nada.** Ver decisión 49. La causa no era de
esa pantalla: era **de todo el sitio**. `hidden` perdía contra cualquier clase
con `display`, así que esconder un botón no lo escondía.
**Y al arreglarlo aparecieron dos botones más rotos por lo mismo**, que nadie
había reportado porque nadie sabía que estaban ahí:
- **"🔔 Avísame cuando lo estén preparando"** salía en celulares que **no pueden
  notificar** — es decir, en **todo iPhone sin la app instalada**. El cliente lo
  tocaba y no pasaba nada: *el mismo fallo que reportó JX, en otro sitio*.
- La **✕** del buscador del panel salía con la casilla vacía, cada vez que el
  vendedor abría el panel.
Se auditaron las **7 páginas** borrando la regla del CSS en caliente para
encontrarlos todos: salieron 6, tres de ellos rotos de verdad.

**2. El aviso de "ya está en la cocina" se rehízo entero**, porque JX dijo que
estaba *"muy simple y seco"*. Ya no es el formulario con el botón apagado: es
un bloque aparte (`#encursoNoPuede`) con el cocinero, el título en rojo y **dos
salidas numeradas** — WhatsApp con el turno y lo que quería ya escrito, o pasar
por el local. Ver decisión 49.

**3. Fuera el botón "Llamar" del panel** y **la etiqueta naranja ahora se
entiende**: "AMPLIADO RECIÉN" → **"➕ AGREGÓ ALGO recién"**, en su propia línea
y con 7px de aire (antes iba pegada al reloj de espera). Ver decisión 51.

**4. "¿Es un pedido para otra persona?" ya no manda al WhatsApp del local**:
muestra **el enlace de la web**, con botón **Copiar** y "Enviar el enlace por
WhatsApp" **sin número**, para mandárselo a quien sea. Así la otra persona pide
desde su celular y tiene **su propio turno**. Ver decisión 50.

**Un bug propio, encontrado por la revisión de 26 aparatos:** el botón nuevo
**"Copiar" medía 40px**, por debajo del mínimo de 44 del proyecto (decisión 26).
Corregido antes de subir.

**Seis arneses de prueba corregidos — ninguno era un fallo del código**, y esto
importa porque un informe con fallos falsos esconde los de verdad:

| Arnés | Qué daba por bueno / por malo |
|---|---|
| `segui.js` | Pedía que el botón "Avísame" saliera **siempre**, y pasaba **porque el bug lo mostraba**. Ahora comprueba la regla: sale solo si el navegador puede notificar |
| `tactil2.js` | Medía la ✕ del buscador **con la casilla vacía** (0×0). Ahora escribe algo antes, que es cuando el dedo la toca |
| `api.mjs`, `api2.mjs`, `precios.mjs` | Reusaban **el mismo teléfono** en todos los pedidos y chocaban con el freno de la decisión 42; `api.mjs` además usaba nombres de platos que no están en `CARTA`, y por eso los totales daban $0 |
| `limpieza.mjs` | Llamaba "viernes" al **2026-09-19, que es sábado**, y sembraba "nunca he limpiado" — con eso, limpiar era lo CORRECTO cualquier día. Culpaba al servidor de acertar |
| `ampliar.js`, `panel3.js`, `avisos.js`, `h24.js` | Esperaban la campana a 3 toques (hoy son 5), la etiqueta vieja, el markup viejo y el campo `prueba` que ya no existe |
| `cerrado.js` | Reportaba 4 fallos porque el sitio está en **modo 24 horas** y la cortina no aparece nunca. Ahora detecta el interruptor y se salta solo, diciendo por qué |

**Tres arneses retirados a `viejas/`** (`resp2.js`, `panel.js`, `panel2.js`):
probaban el **modo prueba**, que se eliminó entero (decisión 20). No se borran,
se guardan con una nota de qué probaban y qué batería los cubre hoy.

⚠ **REGLA QUE SALE DE ESTE DÍA:** *una prueba que pasa gracias a un bug es peor
que no tener la prueba.* La de `segui.js` llevaba días en verde tapando un botón
roto en todos los iPhone. Cuando una batería empiece a fallar tras un arreglo,
lo primero es preguntarse si la que estaba mal era la prueba.

**Y un arnés más, que se delató solo:** `version.js` comprobaba que las 7
páginas dijeran **`v1.0` literal**. Al subir a **v1.1** soltó **8 fallos
falsos**. Se volvió ciego al número: ahora comprueba el **formato** (`vN.N`) y
que **las 7 digan lo mismo**, que es la regla de verdad de la decisión 47.
Escribir el valor esperado a mano convierte un arnés en algo que caduca solo.

**🏷️ VERSIÓN PUBLICADA: `v1.1`** en las 7 páginas. Trae los 4 arreglos de JX,
los 2 botones rotos que aparecieron detrás y el botón "Copiar" a 44px.

⚠ **Y el comando documentado para subir la versión ESTABA MAL** — se descubrió
usándolo: `grep -rl 'sitio-version">v'` solo acierta si el texto va pegado a la
clase, y en 6 de las 7 páginas en medio está el `title`. **Cambió una sola
página y dejó las otras seis en v1.0** — exactamente la desincronización que la
versión existe para detectar. Corregido en los tres sitios donde estaba escrito
(`index.html`, la decisión 47 y el README) y comprobado sobre las 7.

**Estado final: 586 comprobaciones en 45 baterías, cero fallos.**

---

*Proyecto de JX Company · Cartagena, Colombia*
