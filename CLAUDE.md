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
| `index.html` | Página del cliente. **Cortina de cerrado (`#pantallaCerrado`)**, **franja de modo prueba (`#franjaPrueba`)**, barra fija con semáforo, portada con logo, menú de categorías deslizable, los 15 platos, bebidas, cómo pedir, preguntas frecuentes (`#preguntas`), horarios, contacto, mapa condicionado, footer, barra del carrito, ventana modal (formulario + pantalla de turno) y banner de cookies |
| `panel.html` | Panel del vendedor. Pantalla de clave → pestañas Activos / Historial |
| `404.html` | Error con el diseño del sitio |
| `privacidad.html` | Ley 1581 de 2012 (datos personales) |
| `cookies.html` | Resolución 32.126 de 2022 de la SIC |
| `terminos.html` | Uso del sitio + propiedad intelectual |
| `compras.html` | Compras, envíos, devoluciones, garantía y retracto (Ley 1480 de 2011) |
| `css/styles.css` | **Todo** el CSS. 25 variables en `:root`, ~250 bloques comentados |
| `js/config.js` | **El archivo que JX toca para cambiar cosas.** Negocio, horarios, entrega, pagos, modo del sistema y analytics |
| `js/almacen.js` | Capa de datos intercambiable: habla con la nube o con el propio aparato |
| `js/script.js` | Página del cliente: semáforo, horarios, carrito, pedido, WhatsApp, categorías, cookies |
| `js/panel.js` | Panel del vendedor |
| `functions/api/pedidos.js` | Cloudflare Pages Function: crear, listar, marcar entregado, borrar historial y limpieza semanal |
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

**20. Modo prueba: `index.html?prueba=1`.**
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
| **Razón social o nombre del responsable, NIT o cédula, correo de contacto** | `privacidad.html` (4), `terminos.html` (1), `compras.html` (2), `cookies.html` (1) | Lo exige la Ley 1581 de 2012, porque el sistema guarda nombre y teléfono de la gente. **Es el pendiente más importante de los tres**: sin un correo real, el cliente no puede ejercer sus derechos sobre sus datos |
| **Measurement ID de GA4** (`G-XXXXXXXXXX`) | `js/config.js` → `analytics.measurementId` | JX decidió instalarlo después. El snippet ya está listo y condicionado al consentimiento; solo falta pegar el ID |
| **Coordenadas exactas del local** | `index.html` línea ~59 (geo tags) y JSON-LD `geo` | Ahora están a nivel de barrio (10.398, −75.489). JX va a pasar el enlace de Google Maps del local; de ahí se sacan las coordenadas exactas |

### ✔ Datos CONFIRMADOS por JX — no volver a preguntar

| Dato | Valor |
|---|---|
| Nombre oficial | **Pichi Burguer** — con "gu", igual que el logo. El perfil de WhatsApp dice "Burger" pero manda el logo. Tiene que escribirse idéntico en todos lados o se rompe el SEO local |
| WhatsApp | +57 300 4752529 |
| Dirección | Cra 58A #6, Bernardo Jaramillo, Cartagena de Indias, Bolívar |
| **Dominio** | **`https://pedidos-pichi-burguer-ctg.pages.dev`** — es donde vive el sitio HOY (decisión de JX, sept. 2026). El dominio propio `pedidos-pichiburguerctg.com` **se conectará más adelante**; cuando pase, hay que cambiarlo en los 7 sitios de la tabla de abajo |
| **Horarios** | **Todos los días 18:00–23:00, sin día de descanso** (confirmado sept. 2026) |
| Menú | 15 platos con sus precios reales, transcritos del menú impreso del local |
| Pagos | Efectivo, Nequi, Transferencia |
| Entrega | Domicilio **y** para recoger |
| **Costo del domicilio** | **No hay tarifa fija**: depende del barrio y se acuerda por WhatsApp. Esto NO es un pendiente, es la forma de trabajar del local. Si algún día ponen tarifa, se escribe el número en `entrega.costoDomicilio` y el sistema la suma solo |
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

---

*Proyecto de JX Company · Cartagena, Colombia*
