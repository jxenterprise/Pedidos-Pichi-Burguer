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
| `js/script.js` | Página del cliente: semáforo, horarios, carrito, pedido, WhatsApp, categorías, cookies |
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
| 7 | **Imprimir la comanda** (🖨) | Imprime **solo esa tarjeta** escondiendo el resto con CSS. Sin ventana aparte ni documento nuevo: el papel sale con el diseño que ya está probado. |
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

---

*Proyecto de JX Company · Cartagena, Colombia*
