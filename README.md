# Boda Paola & Carlos — sitio web

Sitio estático (HTML + CSS + JavaScript puro), listo para GitHub Pages. Sin frameworks, sin compilación.

## 0. Importante: dos carpetas

- **`sitio/`** → todo lo que se sube a GitHub. No contiene códigos reales.
- **`privado-no-subir/`** → `Code.gs` (se pega en Google Apps Script) e `invitados.csv` (lista con códigos y enlaces personales). **Nunca subas esta carpeta a GitHub:** el repositorio es público y cualquiera vería todos los códigos.

## 1. Estructura de carpetas

```
sitio/                    ← SE SUBE A GITHUB
├── index.html            ← estructura de la página (rara vez se edita)
├── .nojekyll             ← indica a GitHub Pages que publique tal cual
├── README.md             ← esta guía
├── css/styles.css        ← diseño; la paleta está en :root, al inicio
├── js/config.js          ← TODO el contenido editable
├── js/main.js            ← lógica (no necesitas editarlo)
└── img/                  ← favicon, compartir.jpg, historia/, galeria/

privado-no-subir/         ← NUNCA SE SUBE A GITHUB
├── Code.gs               ← backend del RSVP; se pega en Google Apps Script
└── invitados.csv         ← lista con códigos y enlace personal de cada grupo
```

Para probarlo en tu computadora: abre `index.html` con doble clic, o mejor, desde la carpeta ejecuta `python3 -m http.server` y entra a `http://localhost:8000`.

---

## 2. Datos que debes reemplazar antes de publicar

Todos están en `js/config.js`, marcados con `// EDITAR`:

| Dato | Campo |
|---|---|
| Hora de inicio y fin | `evento.inicioISO`, `evento.finISO`, `evento.horaTexto` |
| Dirección exacta del salón | `evento.direccion` |
| Enlace exacto de Google Maps | `evento.mapsURL` (y opcional `mapaEmbedURL`) |
| Textos e imágenes de la historia | `historia.hitos` |
| Horarios del itinerario | `itinerario` |
| Distancias y enlaces de hoteles | `hospedaje.hoteles` |
| Mesa de regalos y CLABE | `regalos` |
| WhatsApp y correo | `contacto` |
| Respuestas de FAQ (estacionamiento, niños) | `faq` |

El enlace actual de Maps es una búsqueda por nombre del salón; funciona, pero conviene reemplazarlo por el enlace "Compartir" del punto exacto.

---

## 3. Publicar en GitHub Pages

1. Crea una cuenta en github.com (si no tienes).
2. Botón **New repository**. Nómbralo exactamente `TU-USUARIO.github.io` (con tu nombre de usuario). Así el sitio queda en la dirección raíz, sin carpetas: `https://TU-USUARIO.github.io/`. Visibilidad: **Public** (Pages gratuito requiere repositorio público en cuentas gratuitas).
   - El nombre de usuario no se compra: es gratuito y forma parte de la dirección. Elígelo pensando en eso (p. ej. `paolaycarlos`).
3. En el repositorio: **Add file → Upload files**. Arrastra el *contenido* de la carpeta `sitio` (no la carpeta en sí): `index.html`, `.nojekyll`, `css/`, `js/`, `img/`, `README.md`.
   - Si no ves `.nojekyll` por ser archivo oculto, no pasa nada: el sitio funciona sin él.
4. **Commit changes**.
5. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
6. En 1–3 minutos el sitio queda en `https://TU-USUARIO.github.io/`.
7. Edita `og:image` en `index.html` con la URL completa: `https://TU-USUARIO.github.io/img/compartir.jpg` (WhatsApp la necesita absoluta para la vista previa).

Para cambios posteriores: abre el archivo en GitHub, ícono de lápiz, edita, **Commit**. Se actualiza en un par de minutos (si no ves el cambio en el teléfono, recarga o abre en ventana privada).

**Dominio propio (opcional):** Settings → Pages → Custom domain. Requiere comprar el dominio (p. ej. `paolaycarlos.com`) y configurar DNS.

---

## 4. Seguridad: lo que GitHub Pages puede y no puede hacer

GitHub Pages solo sirve archivos. No ejecuta código en servidor ni guarda datos. Consecuencias concretas:

1. **Todo archivo publicado es legible por cualquiera.** Si la lista de invitados está en `config.js`, cualquiera que abra las herramientas de desarrollo del navegador puede ver todos los códigos y nombres de familias. Esto aplica a los modos `demo` y `forms`.
2. **Cualquier validación hecha solo en el navegador se puede saltar.** El límite de asistentes, el bloqueo por intentos y la fecha límite en `main.js` son comodidad para el invitado, no control real.
3. **Sin un servicio externo no se guarda nada.** El modo `demo` guarda en el navegador de quien prueba; tú no ves esas respuestas.

### Solución recomendada: modo `sheets`

La lista de códigos vive en tu Google Sheet privada. El sitio solo pregunta al Apps Script "¿este código es válido?" y este responde con la familia y el cupo de ese código, nada más. El Apps Script además:

- rechaza cualquier envío con más asistentes que los autorizados (aunque alguien manipule la página);
- guarda **una sola confirmación por código**: si la familia vuelve a enviar, se **reemplaza** la anterior, así el total nunca se acumula por encima del cupo;
- cierra el registro después de la fecha límite;
- limita los intentos fallidos (40 cada 10 min en total) para frenar a quien quiera adivinar códigos;
- neutraliza textos que empiezan con `=`, `+`, `-`, `@` para que no se ejecuten como fórmulas en tu hoja;
- usa un bloqueo (`LockService`) para que dos envíos simultáneos no se pisen.

### Riesgos que siguen existiendo (y cómo reducirlos)

| Riesgo | Mitigación |
|---|---|
| Alguien adivina un código | Los códigos de tu lista son aleatorios de 6 caracteres sobre 25 símbolos (sin letras confundibles como O/0 o I/1): unos 244 millones de combinaciones, con solo 25 válidas. Adivinarlos a mano no es práctico, y el servidor frena los intentos masivos. |
| Un invitado reenvía su código a alguien más | No se puede impedir técnicamente; el cupo por código sí se respeta. |
| Alguien con el código cambia la respuesta de la familia | La columna "Veces actualizado" lo deja visible; revisa los casos con valor mayor a 0. |
| La URL del Apps Script es pública | Es normal: no expone la hoja, solo responde a las dos acciones programadas. |

---

## 5. Conectar el RSVP con Google Sheets (recomendado)

1. Crea una hoja nueva en sheets.google.com. Nómbrala, p. ej., "RSVP Boda".
2. **Extensiones → Apps Script**. Borra el contenido y pega todo `privado-no-subir/Code.gs`. Guarda (ícono de disco).
3. Ajusta `FECHA_LIMITE` si cambiaste la del sitio.
4. En la barra superior selecciona la función **`configurarHojas`** → **Ejecutar**. Google pedirá permisos: *Revisar permisos → tu cuenta → Configuración avanzada → Ir a (proyecto) → Permitir*. (La advertencia aparece porque el script es tuyo y no está verificado por Google; es esperado.)
5. Se crean tres pestañas: **Invitados** (ya con tu lista real de 25 grupos, 44 lugares, y sus códigos), **Confirmaciones** y **Resumen** (totales automáticos).
6. Para agregar o corregir invitados después, edita directamente la pestaña **Invitados**: `Codigo | Familia | Lugares | Mesa | Asiento | Notas`. Los cambios aplican de inmediato, sin tocar el sitio.
7. **Implementar → Nueva implementación → ⚙ Tipo: Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario** (Anyone)
   - **Implementar** y copia la URL que termina en `/exec`.
8. En `js/config.js`:
   ```js
   rsvp: {
     modo: "sheets",
     sheetsURL: "https://script.google.com/macros/s/XXXXXXXX/exec",
     ...
   }
   ```
   y vacía la lista local: `const INVITADOS = {};`
9. Prueba: abre `TU-URL/exec?accion=validar&codigo=K7QM4A` en el navegador; debe responder `{"ok":true,"familia":"...","lugares":...}`.

**Importante:** si modificas `Code.gs` después, ve a **Implementar → Gestionar implementaciones → ✏ → Versión: Nueva versión → Implementar**. Si creas una implementación nueva, la URL cambia y tendrías que actualizar `config.js`.

**Excel:** desde la hoja, *Archivo → Descargar → Microsoft Excel (.xlsx)* para trabajar la lista de mesas en Excel.

---

## 6. Alternativa: Microsoft Forms (+ Excel Online)

Útil si prefieres el ecosistema Microsoft. Microsoft Forms permite enlaces prellenados (función disponible desde 2024: menú **⋯ → Get pre-filled URL**, activando *Enable pre-filled answers*).

**Limitación honesta:** Forms no puede consultar el cupo por código. En este modo la lista de códigos queda pública en `config.js` y el límite de asistentes no se valida en servidor. Lo revisas tú en Excel.

1. Crea un formulario en forms.office.com con estas preguntas, en este orden:
   1. Código (texto)
   2. Familia (texto)
   3. Lugares autorizados (texto)
   4. ¿Asistirán? (opción: Sí / No)
   5. Nombre completo (texto)
   6. Número de asistentes (texto con restricción *Número*, entre 1 y el cupo máximo general)
   7. Nombres de los asistentes (texto largo)
   8. Restricciones alimenticias (texto)
   9. Comentarios (texto largo)
2. **⋯ → Get pre-filled URL → Enable pre-filled answers**. En las preguntas 1, 2 y 3 escribe literalmente `CODIGO_AQUI`, `FAMILIA_AQUI` y `LUGARES_AQUI`. **Get pre-filled link** y copia el enlace.
3. En `config.js`: `modo: "forms"` y `formsURL: "el enlace copiado"`. Deja tu lista en `INVITADOS`.
4. El sitio valida el código, sustituye esos tres valores y abre el formulario ya identificado.
5. Respuestas en Excel: en Forms, pestaña **Respuestas → Abrir en Excel**. Agrega una columna con `=SI(F2>C2,"EXCEDE","")` para detectar a quien ponga más asistentes que su cupo.

Si tienes Microsoft 365 empresarial, Power Automate puede avisarte por correo cuando una respuesta exceda el cupo (flujo: *Cuando se envía una respuesta nueva → Obtener detalles → Condición → Enviar correo*).

---

## 7. Generar códigos QR

**Un QR general (al sitio):** usa la URL `https://TU-USUARIO.github.io/`.

**Un QR por familia (recomendado):** el sitio acepta el código en la URL y valida automáticamente al abrir:

```
https://TU-USUARIO.github.io/?i=K7QM4A
```

El invitado escanea o toca el enlace y llega directo a su confirmación, sin teclear nada. El enlace no muestra nombres: solo un código como `?i=K7QM4A`.

`invitados.csv` ya trae el enlace personal de cada grupo; solo reemplaza `TU-USUARIO` por tu usuario de GitHub (en Excel o Sheets: Buscar y reemplazar).

Opciones para generarlos:

- **Rápido, uno por uno:** en Chrome, menú de compartir de la página → "Crear código QR". O en qr-code-generator.com / qrcode-monkey.com (elige QR **estático**; los dinámicos de pago pueden caducar).
- **Todos de una vez (Python):**
  ```bash
  pip install qrcode[pil]
  ```
  ```python
  import qrcode
  BASE = "https://TU-USUARIO.github.io/?i={}"
  codigos = ["K7QM4A", "P3XT9C", "M4HQ7R"]   # o léelos de invitados.csv
  for c in codigos:
      qrcode.make(BASE.format(c), box_size=12, border=2).save(f"qr-{c}.png")
  ```
- **En Google Sheets** (columna junto al código): `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="&ENCODEURL("https://TU-USUARIO.github.io/?i="&A2))`
  (Si tu hoja está en configuración regional de México y marca error, cambia las comas por punto y coma.)

Imprime el QR de al menos 2 × 2 cm y pruébalo con dos teléfonos distintos antes de mandar a imprenta.

---

## 8. Personalizar textos e imágenes

**Textos:** todos en `js/config.js`. Reglas para no romper nada:
- Los textos van entre comillas `"..."`. Si necesitas comillas dentro, usa `«...»` o `\"`.
- Cada elemento de una lista termina en coma, excepto el último (una coma de más no rompe nada; una de menos sí).
- Si una sección deja de verse: abre la consola del navegador (F12 → Consola); el error indica la línea.

**Agregar un hito, hotel, pregunta o foto:** copia un bloque `{ ... },` existente y pégalo debajo; edita sus valores.

**Imágenes:**
- Sustituye los archivos en `img/galeria/` e `img/historia/` **conservando el nombre**, y no tienes que tocar código.
- Formato recomendado: JPG vertical 4:5 (p. ej. 1200×1500), menos de 400 KB. squoosh.app reduce peso sin perder calidad visible.
- Para más fotos: agrega el archivo y una línea en `galeria` de `config.js`.
- Escribe un `alt` descriptivo en cada foto (lo leen los lectores de pantalla).

**Colores y tipografía:** en `css/styles.css`, bloque `:root` al inicio. `--accent` cambia botones y detalles; `--bg` el fondo. Las fuentes se cargan desde Google Fonts en `index.html`.

**Ocultar una sección:** en `index.html`, agrega `hidden` a su `<section ...>` y quita su enlace del menú.

**Agregar / cambiar invitados en modo demo:** formato JSON en `config.js`:
```js
"CODIGO": { "familia": "Nombre visible", "lugares": 3 },
```

---

## 9. Funciones incluidas

- Cuenta regresiva con hora de Chetumal (UTC−5), correcta aunque el invitado esté en otra zona horaria.
- Botón "Agregar al calendario" (.ics compatible con iPhone, Android y Outlook, con recordatorio un día antes).
- Galería con deslizamiento táctil, flechas, teclado y visor a pantalla completa.
- RSVP: código sin importar mayúsculas, espacios ni acentos; un campo de nombre por asistente; opción "no podremos asistir"; muestra y permite modificar la respuesta previa; campo trampa contra bots.
- Accesibilidad: navegación por teclado, etiquetas para lectores de pantalla, contraste AA, respeta "reducir movimiento" del sistema, campos de 16 px (evita el zoom automático en iPhone).
- `noindex`: los buscadores no listan el sitio (discreción, no seguridad).
