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
- **Botón** (`.btn`): radio `--radio-full`, altura mínima 48px, peso 700.
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

---

## 🧭 MAPA DEL CÓDIGO

Registro de todo el código. **Se suma, nunca se borra lo anterior.**

### Archivos y qué hace cada uno

| Archivo | Qué contiene |
|---|---|
| `index.html` | Página del cliente. Barra fija con semáforo, portada con logo, menú de categorías deslizable, los 15 platos, horarios, contacto, mapa condicionado, FAQ, footer, barra del carrito, ventana modal (formulario + pantalla de turno) y banner de cookies |
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
En **modo local** (tablet en el mostrador, sin backend) se compara contra el hash
SHA-256 `179dd6e34921eabb7886b4c898a0e6342f8b181c73f792b2eb8ac860f4e22275`. Eso
**no es seguridad real**: solo evita que un cliente curioso toque la tablet. La
seguridad de verdad está en el modo nube.

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
| Dominio | pedidos-pichiburguerctg.com |
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

*Proyecto de JX Company · Cartagena, Colombia*
