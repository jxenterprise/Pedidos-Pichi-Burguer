# Pichi Burguer — Sistema de pedidos

Sistema web de pedidos por turnos para **Pichi Burguer**, comida rápida en
Cartagena de Indias, Bolívar, Colombia.

**Dominio:** `pedidos-pichi-burguer-ctg.pages.dev`
**Desarrollado por:** JX Enterprise

---

## Qué hace

**El cliente** entra desde su celular, ve si el local está abierto, arma su pedido
con el menú completo y recibe **un número de turno en pantalla**. Al mismo tiempo
se le abre WhatsApp con el pedido ya escrito, listo para enviar.

**Todos los pedidos son para recoger en el local.** El local dejó de hacer
domicilios en septiembre de 2026, así que el formulario no pregunta la dirección.

**El vendedor** abre `/panel.html` con su clave y ve los pedidos entrando, en
orden de turno, uno debajo del otro: nombre, celular, número de pedido, hora
exacta, cuánto lleva esperando, qué pidió, la forma de pago, las notas y el
total. Puede marcarlo "En plancha", "Entregado", deshacerlo, imprimir la comanda
o borrarlo.

**Los pedidos se archivan solos.** A las 5 horas salen del panel activo y pasan al
historial. El historial completo se borra cada **sábado a las 7:00 a. m.**

> ⚠ **Ahora mismo el sitio está en modo 24 horas** (`js/config.js` →
> `horarios.siempreAbierto: true`), por decisión de JX mientras termina de montar
> la operación. Se puede pedir a cualquier hora y la pantalla de CERRADO no
> aparece nunca. **No es que el local abra 24 horas**: el horario real
> (6:00 p. m. – 11:00 p. m. todos los días) sigue guardado. Ver
> *Volver a los horarios reales* más abajo.

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

*Custom domains* → *Set up a domain* → `pedidos-pichi-burguer-ctg.pages.dev`.
Cloudflare configura el HTTPS solo. Deja una sola versión canónica (con `www` o
sin `www`, redirigiendo la otra) para no dividir el posicionamiento.

### 5. Avisarle a Google

Verifica el sitio en **Google Search Console** y envía `sitemap.xml`.
El archivo de verificación que Google te dé **nunca se borra del proyecto**.

---

## La pantalla de "CERRADO"

> ⚠ **Hoy esta pantalla NO aparece**, porque el sitio está en modo 24 horas.
> Todo lo que sigue vuelve a funcionar solo el día que se apague ese interruptor
> (*Volver a los horarios reales*, más abajo). El código está intacto esperando.

### Qué ve el cliente fuera del horario

Como el local abre solo de 6 a 11 de la noche, el resto del día la página se
tapa con una pantalla de **CERRADO**: un letrero colgado que se mece, el horario
de hoy y una cuenta regresiva que va diciendo cuánto falta para abrir.

La pantalla trae abajo un enlace, **"Ver el menú de todas formas"**. Si lo tocan,
pueden mirar el menú y los precios, pero **el botón de pedir sigue bloqueado**
hasta la hora de abrir. Eso es a propósito: el que busca a las 2 de la tarde para
pedir en la noche tiene que poder ver qué venden, y Google también.

A la hora de abrir la pantalla se quita sola. Nadie tiene que hacer nada.

---

## Qué sabe hacer el panel del vendedor

Todo esto está en `/panel.html`, después de escribir la clave.

| Botón | Qué hace | Por qué está ahí |
|---|---|---|
| **🔕 / 🔔 Activar avisos** | Campana (5 toques), notificación del sistema y pantalla que no se apaga | Lo primero que hay que tocar al abrir el panel. **Arranca en naranja porque apagado es el estado peligroso**: sin esto, un pedido entra y nadie se entera |
| **Buscar** | Filtra por nombre o por número de turno | Con 20 tarjetas parecidas, encontrar "el de Andrés" a ojo es lento y el cliente está esperando |
| **🍳 Modo cocina** | Un pedido a la vez, en letra grande. Se cambia con las flechas ← → y se sale con Escape | Para leerlo a un metro de distancia, con las manos ocupadas |
| **Empezar / 🔥 En plancha** | Marca que ese pedido ya se está preparando | Separa "ya lo estoy haciendo" de "ya lo entregué". **Al tocarlo, al cliente le cambia el estado en su celular** y, si activó el aviso, le suena. Además te sale por 10 segundos un botón **"Avisar al cliente"** que abre WhatsApp con el mensaje ya escrito |
| **Entregado** | Lo marca como entregado | Durante **10 segundos** sale un "Deshacer" por si fue sin querer |
| **🗑 Borrar** | Quita el pedido para siempre | Para un pedido repetido o uno que el cliente canceló por teléfono. Pide confirmación diciendo el turno **y** el nombre |
| **Avisar listo** | Abre WhatsApp con el mensaje ya escrito | Lleva el nombre, el turno y la dirección del local. ⚠ El botón **"Llamar"** se quitó el 21 de septiembre: en el mostrador no se llama, se escribe — una llamada interrumpe a quien está cocinando y no deja registro. El teléfono **sigue a la vista** en la tarjeta por si toca marcarlo a mano |
| **Actualizar** | Vuelve a consultar ahora mismo | El panel se refresca solo cada 15 segundos; esto es por si no quieres esperar |

**El reloj de cada tarjeta** dice cuánto lleva esperando ese pedido, y el color
es el aviso: gris normal, **naranja a los 15 minutos**, **rojo a los 25**.

> ⚠ **El número de turno nunca se recicla.** Si borras el turno 3, el siguiente
> cliente recibe el 5, no otra vez el 3. Es mejor que falte un número a que dos
> personas esperen el mismo en el mostrador.

---

## Qué sabe hacer la página del cliente

- **Semáforo** en la barra de arriba: abierto, cerrando o cerrado.
- **Menú por categorías** con una barra deslizable arriba.
- **Carrito** con contador −/+ en cada plato.
- **Repetir el último pedido**: si ya pidió antes desde ese celular, le sale un
  botón para rearmarlo de un toque. ⚠ **No guarda los precios viejos**, solo qué
  pidió: los precios se releen del menú de hoy. Cobrar un precio distinto al
  publicado iría contra el Estatuto del Consumidor.
- **Cola de turnos en vivo**: mientras mira su turno en pantalla, le dice
  *"Faltan 2 antes que tú · están preparando el turno 8"*.
- **Seguimiento del pedido al volver a entrar.** ⚠ El cartel verde de *"ya están
  preparando el tuyo"* sale **solo cuando tú tocas "Empezar"** en el panel, nunca
  antes. Si pidió hace menos de 6 horas
  y no se lo han entregado, **lo primero que ve al abrir la página es su turno y
  cuántos faltan** — aunque haya cerrado la pestaña, apagado el celular o
  reiniciado. Al tocarlo se abre el detalle con la cola en vivo, y cuando el
  vendedor toca "Empezar" la tarjeta se pone verde: *"🔥 Ya están preparando el
  tuyo"*. Cuando se lo entregan, desaparece sola.
- **Aviso en el celular**: con un botón, el cliente pide que le avisen. Cuando
  el vendedor empieza su pedido, **le suena y le vibra** aunque tenga la página
  en segundo plano. En iPhone el botón solo aparece si instaló la app (es una
  limitación de Apple); para ese caso está el WhatsApp del panel.
- **Instalar la app**: un aviso para dejar el sitio como icono en el celular.
- **Respaldo por WhatsApp**: además del turno en pantalla, se le abre WhatsApp
  con el pedido ya escrito.

### Un cliente, un turno a la vez

Antes, el mismo cliente podía enviar el pedido diez veces y quedarse con diez
turnos. Ya no: **un teléfono tiene un turno a la vez.**

Pero lo más común no es alguien queriendo turnos de más, es alguien que **se
acordó de que quería un perro más**. Por eso, si vuelve a pedir con el mismo
número, la página no le dice que no: le dice *"Ya tienes el turno 1 · ¿quieres
sumarle lo que acabas de escoger?"*. Si dice que sí, **se suma a su pedido sin
sacar otro turno**.

| Situación | ¿Otro turno? | ¿Agregarle algo? |
|---|---|---|
| Otro cliente (otro número) | ✅ Sí | — |
| El mismo, su pedido **en la fila** | ⛔ No | ✅ **Sí**, se suma a su turno |
| El mismo, **ya tocaste "Empezar"** | ⛔ No | ⛔ **No** — solo por WhatsApp |
| El mismo, **ya se lo entregaste** | ✅ Sí, turno nuevo | — |
| El mismo, **pasados 20 minutos** | ✅ Sí, turno nuevo | — |
| Cambia el nombre para colarse | ⛔ No sirve: la llave es **el teléfono** | |

> ⚠ **Tocar "Empezar" cierra la puerta.** Desde ese momento nadie le mete nada
> a ese pedido sin que tú lo sepas. Si el cliente quiere algo más, la página le
> dice que te escriba por WhatsApp — con su turno y lo que quería ya escritos —
> y **tú decides** si alcanza a metérselo. Si te arrepientes y lo sacas de la
> plancha, la puerta se vuelve a abrir sola.

#### Qué ve el cliente cuando su pedido YA está en la cocina

Esto se rehízo el 21 de septiembre porque estaba mal de dos maneras.

**Lo que pasaba antes:** le salía el botón amarillo *"Sí, agrégalo a mi turno"*
igual que siempre. Lo tocaba, el servidor lo rechazaba con razón… **y en la
pantalla no pasaba nada.** El cliente no entendía que le habían dicho que no:
entendía que **la página estaba rota** — y una página rota no se vuelve a abrir.
(La causa era un detalle del CSS que hacía imposible esconder cualquier botón.
Al arreglarlo aparecieron **otros dos botones rotos por lo mismo**, que nadie
había reportado. Ver "Lo que ya se probó", más abajo.)

**Lo que ve ahora:** una pantalla distinta, no el mismo formulario apagado.

> 👨‍🍳 **Tu pedido ya está en la cocina**
> Lo sentimos: cuando el cocinero ya empezó, no podemos agregarle nada desde
> la página.
> **1.** Escríbenos por WhatsApp ahora mismo y te decimos si alcanza
> **2.** O pásate por el local antes de 20 minutos y se lo dices en el mostrador

El botón de WhatsApp le va **con su turno y lo que quería agregar ya escritos**,
así que a ti te llega todo listo y **decides tú** si alcanza a metérselo.

#### Si el pedido es para otra persona

Antes lo mandábamos a **tu WhatsApp**, y eso estaba mal: convertía al cliente en
intermediario de **dos pedidos que el sistema no puede separar**. El segundo
entraba por chat, a mano, **sin turno, sin aparecer en el panel y sin
seguimiento** — justo lo que esta web existe para evitar. Y a ti te llegaba
trabajo extra: transcribir un pedido mientras cocinas.

Ahora la página le muestra **el enlace de la web**, con un botón **"Copiar"** y
otro para **enviarlo por WhatsApp a quien sea**. La otra persona pide **desde su
celular con su número**, y por eso tiene **su propio turno, su propio
seguimiento y su propio aviso**.

> ⚠ **Por qué el teléfono y no la IP.** Pensamos en bloquear por IP y lo
> descartamos: en un barrio varias casas comparten el mismo wifi, y los
> operadores móviles le dan la misma IP a cientos de personas a la vez.
> **Dos vecinos que pidan el mismo día se bloquearían entre sí**, y tú nunca
> sabrías por qué perdiste esa venta.

### Cuando un cliente le agrega algo a su pedido

Solo puede hacerlo **mientras su pedido siga en la fila**. Aun así te avisa,
porque puede que ya hubieras leído la tarjeta:

1. **La tarjeta se marca** en naranja: `➕ AGREGÓ ALGO recién`.
2. **La campana suena las 5 veces**, igual que un pedido nuevo.
3. **Al cliente se le abre WhatsApp** con lo que agregó, para que te llegue
   también por ahí.

> Antes esa etiqueta decía *"Ampliado recién"* y JX preguntó qué significaba.
> Tenía razón: **"ampliado" es la palabra del código, no la del mostrador.**
> Lo que necesitas saber es que **ese cliente le sumó platos a un pedido que
> quizá ya leíste**, así que hay que volver a mirar la lista antes de
> entregarlo. Por eso ahora lo dice con esas palabras, va **en su propia
> línea** debajo del reloj de espera (antes iban pegados) y al pasar el cursor
> te lo explica entero.

Si alguna vez vieras una tarjeta **roja parpadeando** con `⚠️ AGREGÓ ALGO ·
REVISA LA LISTA`, es un pedido ampliado de antes de este cambio: revísalo igual.

Si tocas "Actualizar" justo en ese momento, **el aviso de REVISA no se borra**:
manda sobre el mensaje normal de "Lista al día".

### Cuando tocas "Entregado": el cliente recibe el gracias

Desde la v1.2, tocar **Entregado** no solo archiva el pedido: **se lo dice al
cliente**. Dos caminos, según dónde esté:

| Dónde está | Qué le llega |
|---|---|
| **Con la página abierta** | Un cartel: 🍔 **"¡Gracias por tu compra!"**, su turno, *"Buen provecho 😋 Siempre a la orden"* y **confeti cayendo**. Se quita solo a los **10 segundos** (o antes, con su ✕) |
| **Fuera de la página** (en otra app) | La **notificación** al celular con vibración, si la activó. Y el cartel lo espera: le sale en cuanto vuelva a mirar |

> ⚠ **Solo se dispara cuando tocas "Entregado" en el panel.** No antes, y no por
> el hecho de que hayas entregado el pedido de otra persona.

> ⚠ **Si el cliente cerró la pestaña del todo, la notificación no le llega.** Es
> la misma limitación que la del aviso de "ya lo están preparando" y por el
> mismo motivo. Para ese caso está lo de siempre: entra a la página y lo ve.

### ¿Cómo sabe el cliente que ya están preparando su pedido?

Por **tres caminos a la vez**, porque ninguno solo alcanza:

| | Cómo llega | Cuándo sirve | Funciona en |
|---|---|---|---|
| **1** | **Entra a la página y lo ve** | Siempre. Es la base | **Todos** los celulares, sin permisos ni instalar nada |
| **2** | **Le suena y vibra el celular** | Si activó el aviso con el botón | Android siempre; iPhone solo si instaló la app |
| **3** | **Le llega un WhatsApp** | Si tú tocas "Avisar al cliente" | **Todos**, siempre |

**Lo importante es el 1**: no depende de que el cliente deje la página abierta,
ni de permisos, ni de que instale nada. Abre la página y ya lo sabe. El 2 es el
extra para quien lo quiera, y el 3 es tu red de seguridad.

> ⚠ En el celular del cliente **solo se guarda su número de turno y la hora**.
> Ni el nombre, ni el teléfono, ni lo que pidió. Y para saber cómo va, la página
> solo pregunta **números** al servidor (qué turno se está preparando y cuántos
> hay). Por eso **nadie puede espiar el pedido de otro**: no hay nada que espiar.

### ¿La "app" es una app de verdad?

**No es una app de tienda**: no está en Play Store ni en App Store y no hay nada
que descargar. Es la misma página web, que el celular guarda como un icono en el
escritorio y abre a pantalla completa, sin la barra del navegador.

**Lo importante:** como sigue siendo la web, **cualquier cambio que se publique
le llega solo a todo el que la tenga instalada**, la próxima vez que la abra. No
hay que actualizar nada ni pedirle a nadie que reinstale.

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

**Horario real del local: todos los días de 6:00 p. m. a 11:00 p. m.**, sin día
de descanso. Los pedidos se dejan de recibir 15 minutos antes del cierre, porque
un pedido a las 10:59 no da tiempo de prepararlo (se cambia en `js/config.js` →
`minutosAntesDelCierre`).

### ⚠ Volver a los horarios reales — hay que tocar 5 sitios

Hoy el sitio está en **modo 24 horas**. Con cambiar solo el interruptor la página
se contradice: el semáforo diría "Cerrado" mientras la tabla y Google siguen
anunciando 24 horas. Hay que cambiar los cinco:

| # | Archivo | Qué cambiar |
|---|---|---|
| 1 | `js/config.js` | `siempreAbierto: true` → `false` |
| 2 | `index.html` tabla visible | las 7 filas `Abierto 24 horas` → `6:00 p. m. – 11:00 p. m.` |
| 3 | `index.html` JSON-LD | `"opens": "00:00", "closes": "23:59"` → `"opens": "18:00", "closes": "23:00"` |
| 4 | `index.html` FAQ **y** JSON-LD | la pregunta sobre el horario, **con el mismo texto en los dos sitios** |
| 5 | `llms.txt` | la sección "## Horarios" |

Para comprobar que no quedó ninguno:

```bash
grep -n "Abierto 24 horas\|siempreAbierto\|00:00" index.html js/config.js llms.txt
```

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
- **Informes → Interacción → Eventos**: aquí está lo que de verdad importa. No
  las visitas, sino cuántas se volvieron pedidos.

### Los 18 eventos que el sitio ya mide

No hay que configurar nada: apenas pegues el ID, empiezan a llegar solos.

| Evento | Cuándo se dispara | Para qué te sirve |
|---|---|---|
| `pedido_enviado` | El cliente envía el pedido | **El más importante.** Lleva además el valor del pedido, así que GA4 te suma cuánto vendiste por la web |
| `clic_whatsapp` | Toca el botón verde de WhatsApp | Cuántos prefieren escribir antes que pedir por la página |
| `clic_whatsapp_cerrado` | Escribe por WhatsApp desde la pantalla de CERRADO | Cuántos insisten fuera del horario (hoy no se dispara: el sitio está en modo 24 horas) |
| `clic_telefono` | Toca el número para llamar | |
| `clic_mapa` | Abre la ubicación | Cuánta gente busca cómo llegar |
| `repitio_pedido` | Usa "Repetir mi último pedido" | Te dice cuántos clientes son repetidos |
| `abrio_seguimiento` | Toca la tarjeta de "cómo va mi pedido" | Cuántos vuelven a entrar a ver su turno |
| `choco_pedido_en_curso` | Intenta pedir teniendo un turno en curso | **Si este número es alto, la gente se está quedando corta en el primer pedido** |
| `amplio_pedido` | Le suma algo a su pedido, con el valor | Cuánto se vende por ampliaciones |
| `activo_aviso_cola` | Activa el aviso en su celular | Cuántos quieren que les avisen |
| `aviso_cola_recibido` | Le llegó el aviso de "ya lo preparan" | Cuántos avisos llegaron de verdad |
| `amplio_tarde` | Quiso sumarle algo a su pedido cuando ya estaba en la plancha, y la página le dijo que no | **Si este número es alto, estás tocando "Empezar" muy rápido** — o la gente se acuerda tarde de lo que quería. Cada uno es alguien que terminó escribiéndote por WhatsApp |
| `aviso_entregado_recibido` | Le llegó al celular el aviso de "pedido entregado" | Cuántos clientes tenían los avisos activados hasta el final |
| `vio_gracias_entrega` | Vio el cartel de "¡Gracias por tu compra!" con la página delante | Cuántos siguen la página hasta que les entregas |
| `instalo_app` | El celular confirma que quedó instalada | Cuántos clientes vuelven por el icono y no por Google |
| `instalar_si` / `instalar_no` | Acepta o rechaza el aviso de instalar | Si `instalar_no` es muy alto, el aviso está molestando |
| `clic_ver_menu_cerrado` | Con el local cerrado, toca "Ver el menú de todas formas" | Cuánta gente busca fuera del horario. **Si este número es alto, vale la pena abrir más temprano** |

> ⚠ Ninguno de estos eventos manda el nombre ni el teléfono del cliente a
> Google. Solo el hecho de que pasó, y en el pedido el monto. Es a propósito.

---

## Que la página aparezca en Google

El sitio ya trae todo el trabajo técnico hecho. Lo que falta son **tres cosas que
solo puedes hacer tú**, y sin ellas Google tarda mucho más en encontrarlo.

### 1. Google Search Console (15 minutos, una sola vez)

1. Entra a **search.google.com/search-console** con tu cuenta de Google.
2. *Agregar propiedad* → **Prefijo de la URL** → pega
   `https://pedidos-pichi-burguer-ctg.pages.dev`
3. Google te pide verificar que el sitio es tuyo. La forma más fácil aquí es la
   **etiqueta HTML**: te da una línea `<meta name="google-site-verification" ...>`
   que se pega en el `<head>` de `index.html`, justo debajo del `<title>`.
   ⚠ **Esa etiqueta nunca se borra**, o Google pierde la verificación.
4. Ya verificado: *Sitemaps* → escribe `sitemap.xml` → *Enviar*.
5. *Inspección de URL* → pega la dirección del sitio → **Solicitar indexación**.
   Eso lo mete en la fila de Google en vez de esperar a que pase solo.

**Qué mirar después**, cada par de semanas:
- **Rendimiento**: qué buscó la gente para llegar. Si ves "hamburguesas bernardo
  jaramillo" o "comida rápida cerca", vas bien.
- **Cobertura / Páginas**: que la página principal salga como *Indexada*.

### 2. La ficha de Google Maps — rinde más que todo lo demás

Para un local de barrio, **salir bien en Maps vale más que el SEO tradicional**.
La gente busca "hamburguesas cerca de mí" y pide en el primero que sale con
buenas fotos. Está explicado abajo, en *Ficha de Google Business Profile*.

### 3. Lo que ya está hecho y no hay que tocar

| Qué | Dónde | Para qué |
|---|---|---|
| **Datos estructurados** (JSON-LD) | `index.html` `<head>` | Le dice a Google que esto es un **restaurante**, con su dirección, teléfono, horario, **los 15 platos con precio** y que **solo hace recoger**. Es lo que hace que salga "Abierto ahora · cierra a las 11 p. m." en el buscador |
| **El menú escrito en el HTML** | `index.html` | Google lee los 15 platos aunque el JavaScript no cargue |
| **FAQ visible** | sección `#preguntas` | Google exige que lo que declaras como preguntas frecuentes **se vea en la página**. Declararlo sin mostrarlo puede costar una penalización |
| **`sitemap.xml`** y **`robots.txt`** | raíz | El mapa del sitio y el permiso de rastreo |
| **`llms.txt`** | raíz | Lo mismo pero para **ChatGPT, Claude, Perplexity y Gemini**, que quedan permitidos a propósito: si alguien le pregunta a una IA por hamburguesas en Cartagena, que pueda recomendar el local |
| **Open Graph** | `<head>` | Que al compartir el enlace por WhatsApp salga la foto y el título, no el enlace pelado |
| **`canonical`** | `<head>` | Que Google sepa cuál es la dirección "de verdad" del sitio |

> ⚠ **El día que se conecte el dominio propio** hay que cambiarlo en **7 sitios**
> y **volver a enviar el sitemap** en Search Console. La lista completa está en
> `CLAUDE.md`, decisión 22. Si se cambia a medias, Google deja de indexar el que
> sí funciona.

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
├── compras.html            Compras, entregas, devoluciones, garantía y retracto
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
- **Los precios los pone el servidor**, no el navegador. La constante `CARTA`
  de `functions/api/pedidos.js` tiene los 15 platos; lo que llegue del navegador
  se ignora. Así nadie puede enviar un pedido con un precio inventado.
  ⚠ Por eso **un precio vive ahora en 5 sitios** y hay que cambiarlo en los
  cinco: el precio visible, el `data-precio`, el JSON-LD, `llms.txt` y `CARTA`.
- **Modo local disponible.** Si algún día no se quiere backend, en `js/config.js`
  se cambia `sistema.modo` de `'nube'` a `'local'` y todo funciona en una sola
  tablet en el mostrador. Es **una sola línea**.
- **Respaldo por WhatsApp siempre activo.** Si Cloudflare o el internet fallan, el
  pedido igual le llega al vendedor por WhatsApp y no se pierde la venta.
- **El menú está escrito en el HTML**, no lo pinta el JavaScript. Así Google y los
  bots de IA leen los 15 platos con sus precios aunque el JS no cargue.
- **La cola de turnos que ve el cliente no lleva clave**, así que devuelve
  **solo números**: qué turno se está preparando, cuántos faltan y cuál fue el
  último entregado. Nunca nombres ni teléfonos.
- **Nada de Google carga antes de que el visitante acepte las cookies** — ni
  Analytics ni el mapa.

### Reglas del proyecto que conviene no romper

- **Ninguna pregunta usa el cuadro gris de Chrome.** Ni `confirm()`, ni `alert()`,
  ni `prompt()`. Todas pasan por la ventana propia del sitio (`confirmar()`, en el
  bloque 0 de `js/panel.js`). Es una regla de JX, sin excepciones.
- **La clave del panel no existe en ningún archivo**, ni siquiera como hash.
- **El total lo recalcula el servidor**, nunca se acepta el del navegador.
- **Todas las imágenes van en WebP**, salvo los favicons (ningún navegador los
  soporta en WebP).
- **El número de turno nunca se recicla.**

---

## Cómo hacer una copia de seguridad

- **Del sitio:** copia la carpeta completa del proyecto. Eso es todo — no hay base
  de datos que respaldar ni servicios externos de los que dependa.
- **De los pedidos:** en el panel, la pestaña *Historial* muestra los pedidos
  archivados de la semana. Si se quieren guardar, se copian antes del sábado, que
  es cuando se borran.

### Vaciar los pedidos y reiniciar los turnos en 1

**Primero comprueba si hace falta**, que es más rápido y no arriesga borrar nada
que no toca. Pega esto en cualquier terminal:

```bash
curl -s -X POST https://pedidos-pichi-burguer-ctg.pages.dev/api/pedidos \
  -H "Content-Type: application/json" -d '{"accion":"turnos","datos":{}}'
```

Si responde `"turnoDelDia": 0`, **ya está listo**: el siguiente cliente recibe el
turno 1 y no hay que tocar nada.

Si no, en Cloudflare → *Workers & Pages* → **KV** → `pichi-burguer-pedidos` →
*Pares de KV*:

| Clave | Qué es | ¿Se puede borrar? |
|---|---|---|
| `dia:AAAA-MM-DD` | Los pedidos de ese día y el contador de turnos | **Sí** — esta es la que vacía los pedidos |
| `indice:dias` | La lista de días con pedidos | **Sí**, se recrea sola |
| `meta:limpieza` | La marca del último borrado de los sábados | ⛔ **NO la borres** |

> ⚠ **Que no aparezca ninguna clave `dia:...` es normal** cuando no hay pedidos
> del día — no significa que algo se haya roto. Esa clave nace con el primer
> pedido del día.

---

## Propiedad

**El código fuente y todo el contenido de este sitio son propiedad de Pichi
Burguer.** Se entregan todos los archivos sin minificar ni ofuscar, listos para
abrir, leer y editar. No hay ninguna parte del sistema que dependa de un servicio
propietario de JX Enterprise.

**Dominio y hosting**: por ser un negocio pequeño sin equipo técnico, el sitio
queda alojado en la **cuenta de Cloudflare de JX Enterprise**. Cuando el cliente lo
pida, se transfiere a su propia cuenta: se crea la cuenta de Cloudflare a su
nombre, se le da acceso al repositorio, se mueve el dominio y se le entregan las
credenciales de GA4 y Search Console. Sin costo y sin tiempo de caída.

---

## Estado del sistema — ¿está listo para usarse?

**Sí. El sistema funciona de punta a punta** y un cliente puede pedir ahora
mismo: arma el pedido, recibe su turno, le llega al vendedor al panel, suena la
campana, y el vendedor lo marca y lo entrega.

Lo que falta **no es código**: son datos que solo el negocio puede dar.

| Qué falta | Quién lo hace | Qué pasa si no se hace |
|---|---|---|
| **Razón social o nombre del responsable, NIT o cédula y un correo de contacto** | El negocio | **Es lo más importante.** Las 4 páginas legales tienen 7 marcadores `{POR CONFIRMAR}` (4 en `privacidad.html`, 1 en cada una de las otras tres). Sin un correo real, un cliente no puede ejercer sus derechos sobre sus datos, y la Ley 1581 de 2012 lo exige porque el sistema guarda nombres y teléfonos |
| **Comprobar que los turnos empiezan en 1** | JX | Si probaste el sitio hoy, esos pedidos gastaron turnos y el primer cliente real no empezaría en el 1. **No hace falta entrar a Cloudflare**: mira el comando de "Vaciar los pedidos y reiniciar los turnos en 1", más arriba. Si dice `"turnoDelDia": 0`, ya está |
| **Precios de bebidas y adiciones** | El negocio | Hoy la página dice que sí las venden y que se piden por el campo de notas. Publicar un precio inventado iría contra el Estatuto del Consumidor |
| **Coordenadas exactas del local** | JX, desde el enlace de Google Maps | Ahora están a nivel de barrio. Afecta qué tan preciso sale en el mapa |
| **Identificador de GA4** (`G-XXXXXXXXXX`) | JX | No se sabría cuánta gente entra. El código ya está listo, solo falta pegar el ID |
| **Enviar el `sitemap.xml`** en Search Console | JX | Google tarda más en encontrar la página |

Y una decisión pendiente del negocio: **volver a los horarios reales** cuando la
operación esté montada (hoy está en modo 24 horas). Son los 5 sitios de la tabla
de más arriba.

### La versión del sitio

Al lado de **PICHI BURGUER**, arriba, verás una etiqueta gris: **v1.2**.

Sirve para una cosa concreta: **saber si una actualización llegó de verdad.**
Si publicas un cambio y en tu celular sigue diciendo el número viejo, es que el
navegador te está mostrando una copia guardada, no la página nueva.

**Para subirla** cuando publiques algo nuevo (v1.0 → v1.1 → v1.2, de uno en
uno), desde la carpeta del proyecto:

```bash
sed -i 's|\(class="sitio-version"[^>]*\)>v1\.2<|\1>v1.3<|' *.html
grep -h 'class="sitio-version"' *.html | grep -o 'v1\.[0-9]*' | sort | uniq -c   # tiene que decir "7 v1.3"
```

Y anota en `CLAUDE.md` qué trae esa versión.

### Lo que ya se probó

- Las **7 páginas en 26 celulares y tabletas reales, de pie y acostados** —
  **364 pantallas**. Android de gama baja (Galaxy S III, 2012) a altísima
  (Galaxy S24), iPhone del SE de 320px al 15 Pro Max, y 5 tabletas.
  **Cero scroll horizontal, cero desbordes, consola limpia en los 26.**
- **El flujo completo con toques reales**, no clics simulados.
- **Sin JavaScript**: los 15 platos y sus precios se leen igual y el botón de
  WhatsApp sigue funcionando.
- **Velocidad en 4G flojo**: primer dibujo a 1,36 s.
- **Seguridad**: el panel no abre con clave mala, la clave no aparece en nada de
  lo que sirve el sitio, el servidor ignora un total falso, el freno anti-spam
  corta a los 200 pedidos del día, y la cola pública no filtra ni un nombre.
- **La lógica del servidor** con un almacén KV falso: turnos, recálculo del
  total, corte de 5 horas, borrado de los sábados y conteo de operaciones.

**Revisión final del 22 de septiembre:**

- **Todas las ventanas que se abren encima, en 11 celulares y tabletas de pie
  y acostados — 110 estados, cero fallos.** El formulario, "ya tienes un
  pedido" en sus dos versiones, el turno, el gracias con confeti, el
  seguimiento, el panel con tarjetas, la ventana de borrar y el modo cocina.
  En cada uno: que cada botón se pueda alcanzar, que nada lo tape, que mida lo
  que tiene que medir para el dedo, y que la letra se pueda leer.
- **Las 7 páginas otra vez en los 26 aparatos, de pie y acostados — 364
  pantallas, cero fallos.**
- **Limpieza de lo viejo:** un estilo que ya nadie usaba, una regla de
  impresión que apuntaba a él (por eso "AGREGÓ ALGO" salía en color al imprimir
  el panel), dos comentarios del código que decían algo que dejó de ser cierto,
  y los documentos al día — este README decía 14 eventos de Analytics y son 18.

**Del 21 de septiembre por la tarde**, con los cuatro arreglos que pidió JX:

- **Los 6 botones del sitio que se escondían mal.** El fallo que reportó JX (el
  botón amarillo que no hacía nada) no era de esa pantalla: era **del sitio
  entero**. Al arreglarlo se auditaron las 7 páginas y salieron dos más que
  estaban rotos **sin que nadie lo hubiera notado**:
  - El botón **"🔔 Avísame cuando lo estén preparando"** aparecía en celulares
    que **no pueden notificar** — o sea, en **todo iPhone sin la app instalada**.
    El cliente lo tocaba y no pasaba nada.
  - La **✕** del buscador del panel salía con la casilla vacía.
- **Un botón nuevo que medía 40px** ("Copiar" el enlace), por debajo del mínimo
  de 44 del proyecto. Lo cazó la revisión de 26 aparatos, y se corrigió.
- **Diez arneses de prueba corregidos o retirados.** Ninguno era un fallo del
  código: daban por bueno lo que estaba mal (una prueba pedía que el botón
  "Avísame" saliera **siempre**, y pasaba **porque el bug lo mostraba**) o
  probaban cosas que ya no existen, como el modo prueba. **Una prueba que pasa
  gracias a un bug es peor que no tener la prueba.**

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
  <sub>DISEÑO Y DESARROLLO: <b>JX ENTERPRISE</b></sub>
</p>
