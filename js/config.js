/* =====================================================================
   CONFIG.JS — TODO EL CONTENIDO EDITABLE DEL SITIO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que normalmente necesitas modificar.
   - Cambia textos, horarios, enlaces e imágenes aquí.
   - Respeta comillas, comas y llaves. Si algo deja de verse, revisa
     que no falte una coma al final de una línea.
   - Las líneas marcadas con  // PENDIENTE  aún tienen datos de ejemplo.
   ===================================================================== */

const CONFIG = {

  /* ---------------- DATOS GENERALES ---------------- */
  novios: {
    nombre1: "Paola",
    nombre2: "Carlos",
    iniciales: "P & C"
  },

  evento: {
    // Hora de la cita (la cuenta regresiva llega a cero aquí). Zona horaria de
    // Chetumal: UTC-05:00 todo el año.
    inicioISO: "2027-01-02T16:00:00-05:00",
    finISO:    "2027-01-02T23:00:00-05:00",
    fechaTexto: "Sábado 2 de enero de 2027",
    fechaCorta: "02 · Enero · 2027",
    horaTexto: "4:00 p.m. · Ceremonia civil a las 4:30 p.m. en punto",
    lugar: "Salón de Fiestas Vaivén",
    direccion: "Boulevard Bahía, rumbo a Calderitas",
    ciudad: "Chetumal, Quintana Roo",
    // Enlace exacto del salón (Google Maps > Compartir > Copiar vínculo)
    mapsURL: "https://maps.app.goo.gl/5U5YRCiaktzYexfH9",
    // Mapa incrustado: vacío para no mostrar un punto aproximado.
    // Para activarlo: Google Maps > Compartir > Insertar un mapa, y pega aquí
    // solo la URL que está dentro de src="...".
    mapaEmbedURL: ""
  },

  /* ---------------- TEXTOS POÉTICOS ----------------
     Frases breves que acompañan cada sección. Puedes cambiarlas o dejar ""
     para ocultar cualquiera. Todas son originales, salvo la de Bécquer
     (dominio público). */
  poesia: {
    hero: "Una tarde de enero, frente a quienes más queremos, diremos que sí.",
    epigrafe: {
      versos: [
        "Por una mirada, un mundo;",
        "por una sonrisa, un cielo;",
        "por un beso… ¡yo no sé",
        "qué te diera por un beso!"
      ],
      autor: "Gustavo Adolfo Bécquer, Rima XXIII"
    },
    evento: "El lugar y la hora en que dos historias empiezan a escribirse con la misma tinta.",
    itinerario: "Una tarde, una noche y todo lo que cabe entre ambas.",
    galeria: "Lo que la memoria guarda, la luz lo devuelve.",
    rsvp: "Hay un lugar apartado con tu nombre. Solo falta que nos digas que vienes.",
    despedida: "Gracias por ser parte de lo que somos."
  },

  /* ---------------- NUESTRA HISTORIA ----------------
     Agrega, quita o reordena hitos. "imagen" puede ser "" para un hito sin foto. */
  historia: {
    intro: "No empezó con un gran momento, sino con muchos pequeños que fueron sumando.",
    hitos: [
      {
        fecha: "Año",                                                     // PENDIENTE
        titulo: "Nos conocimos",
        texto: "Cómo se conocieron, en dos o tres líneas.",               // PENDIENTE
        imagen: "img/historia/historia-01.jpg",
        alt: "Paola y Carlos el día que se conocieron"
      },
      {
        fecha: "Año",                                                     // PENDIENTE
        titulo: "Un recuerdo nuestro",
        texto: "Un momento que les guste contar.",                        // PENDIENTE
        imagen: "img/historia/historia-02.jpg",
        alt: "Paola y Carlos juntos"
      },
      {
        fecha: "Año",                                                     // PENDIENTE
        titulo: "La propuesta",
        texto: "Dónde y cómo fue la pregunta.",                           // PENDIENTE
        imagen: "img/historia/historia-03.jpg",
        alt: "El momento de la propuesta"
      },
      {
        fecha: "2027",
        titulo: "Nos casamos",
        texto: "Y queremos que estés ahí cuando lo hagamos oficial.",
        imagen: "",
        alt: ""
      }
    ]
  },

  /* ---------------- ITINERARIO ----------------
     Propuesta para boda civil de 4:00 a 11:00 p.m. Ajusten horas libremente. */
  itinerario: [
    { hora: "4:00 p.m.",  titulo: "Llegada de invitados",  texto: "Les pedimos puntualidad: a las 4:30 comienza la ceremonia." },
    { hora: "4:30 p.m.",  titulo: "Ceremonia civil",       texto: "Lectura del acta, palabras de los novios y firma de testigos." },
    { hora: "5:15 p.m.",  titulo: "Brindis y felicitaciones", texto: "El primer brindis como esposos." },
    { hora: "5:45 p.m.",  titulo: "Fotografías y cóctel",  texto: "Fotos con familia y amigos mientras cae la tarde." },
    { hora: "6:30 p.m.",  titulo: "Comida",                texto: "" },
    { hora: "8:00 p.m.",  titulo: "Primer baile",          texto: "" },
    { hora: "8:15 p.m.",  titulo: "Baile",                 texto: "La pista queda abierta." },
    { hora: "9:30 p.m.",  titulo: "Pastel",                texto: "" },
    { hora: "11:00 p.m.", titulo: "Despedida",             texto: "Gracias por acompañarnos hasta el final." }
  ],

  /* ---------------- CÓDIGO DE VESTIMENTA ---------------- */
  vestimenta: {
    tipo: "Formal",
    descripcion: "Traje para ellos; vestido largo o de cóctel para ellas. La celebración es en interior.",  // PENDIENTE: confirmar
    sugeridos: [
      { nombre: "Verde olivo", hex: "#6B7350" },
      { nombre: "Azul bahía",  hex: "#3F5F73" },
      { nombre: "Terracota",   hex: "#B4694A" },
      { nombre: "Arena",       hex: "#D9C7A7" },
      { nombre: "Gris carbón", hex: "#3A3A3A" }
    ],
    noRecomendados: [
      { nombre: "Blanco",  hex: "#FFFFFF", nota: "Reservado para la novia" },
      { nombre: "Marfil",  hex: "#F3EBDD", nota: "" },
      { nombre: "Champán", hex: "#E8D7B9", nota: "" }
    ]
  },

  /* ---------------- GALERÍA ----------------
     Reemplaza los archivos en img/galeria/ conservando el nombre.
     Recomendado: JPG vertical 1200×1500, menos de 400 KB. */
  galeria: [
    { src: "img/galeria/foto-01.jpg", alt: "Fotografía 1 de Paola y Carlos" },
    { src: "img/galeria/foto-02.jpg", alt: "Fotografía 2 de Paola y Carlos" },
    { src: "img/galeria/foto-03.jpg", alt: "Fotografía 3 de Paola y Carlos" },
    { src: "img/galeria/foto-04.jpg", alt: "Fotografía 4 de Paola y Carlos" },
    { src: "img/galeria/foto-05.jpg", alt: "Fotografía 5 de Paola y Carlos" },
    { src: "img/galeria/foto-06.jpg", alt: "Fotografía 6 de Paola y Carlos" }
  ],

  /* ---------------- HOSPEDAJE ---------------- */
  hospedaje: {
    intro: "Algunas opciones para quienes nos visitan desde fuera de Chetumal.",
    hoteles: [
      { nombre: "Fiesta Inn Chetumal",              distancia: "Distancia por confirmar", nota: "", url: "https://www.google.com/maps/search/?api=1&query=Fiesta+Inn+Chetumal" },             // PENDIENTE
      { nombre: "Hotel Los Cocos",                  distancia: "Distancia por confirmar", nota: "", url: "https://www.google.com/maps/search/?api=1&query=Hotel+Los+Cocos+Chetumal" },         // PENDIENTE
      { nombre: "Holiday Inn Chetumal Puerta Maya", distancia: "Distancia por confirmar", nota: "", url: "https://www.google.com/maps/search/?api=1&query=Holiday+Inn+Chetumal+Puerta+Maya" } // PENDIENTE
    ]
  },

  /* ---------------- MESA DE REGALOS ---------------- */
  regalos: {
    mensaje: "Su presencia es lo más importante. Si desean hacernos un regalo, dejamos estas opciones.",
    enlaces: [
      // PENDIENTE: agrega aquí tus mesas de regalos reales, por ejemplo:
      // { nombre: "Mesa de regalos Liverpool", detalle: "Evento n.º 00000000", url: "https://mesaderegalos.liverpool.com.mx/" },
    ],
    transferencia: {
      mostrar: false,                // PENDIENTE: cambiar a true cuando tengas los datos
      banco: "Nombre del banco",
      titular: "Nombre del titular",
      clabe: "000000000000000000",
      concepto: "Boda Paola y Carlos"
    }
  },

  /* ---------------- PREGUNTAS FRECUENTES ---------------- */
  faq: [
    { p: "¿Cuál es el horario?", r: "La cita es a las 4:00 p.m. La ceremonia civil inicia a las 4:30 p.m. en punto, por lo que les pedimos llegar con tiempo. La celebración termina a las 11:00 p.m." },
    { p: "¿Cómo llego al salón?", r: "El Salón de Fiestas Vaivén está sobre el Boulevard Bahía, rumbo a Calderitas. En la sección «El evento» está el botón para abrir la ubicación exacta en Google Maps." },
    { p: "¿Habrá estacionamiento?", r: "Sí. El salón cuenta con estacionamiento para invitados." },  // PENDIENTE: confirmar con el salón
    { p: "¿Pueden asistir niños?", r: "Cada invitación indica el número de lugares reservados. Les pedimos respetarlo, ya que la distribución de mesas está hecha con ese número." },
    { p: "¿Hasta cuándo puedo confirmar?", r: "Hasta el 1 de diciembre de 2026. Después de esa fecha el formulario se cierra." },
    { p: "Perdí mi enlace o mi código", r: "Escríbenos por WhatsApp y con gusto te lo compartimos de nuevo." },
    { p: "¿A quién contacto?", r: "A Carlos, por WhatsApp. El botón está en la sección de contacto." }
  ],

  /* ---------------- CONTACTO ----------------
     WhatsApp: lada internacional + número, solo dígitos (México: 52 + 10 dígitos).
     Deja numero: "" o correo: "" para ocultar ese botón. */
  contacto: {
    whatsappNovia:  { nombre: "Paola",  numero: "" },              // PENDIENTE (opcional)
    whatsappNovio:  { nombre: "Carlos", numero: "529831080125" },
    mensajeWhatsApp: "Hola, tengo una duda sobre la boda de Paola y Carlos.",
    correo: ""                                                     // PENDIENTE (opcional)
  },

  /* ---------------- RSVP ----------------
     modo:
       "demo"   → solo para probar el funcionamiento; usa la lista ficticia de
                  abajo y NO registra nada real.
       "sheets" → PARA LA BODA. Valida y guarda en Google Sheets; la lista real
                  de invitados vive en tu hoja privada (ver README, sección 5).
       "forms"  → alternativa con Microsoft Forms.
  */
  rsvp: {
    modo: "demo",
    fechaLimiteISO: "2026-12-01T23:59:59-05:00",
    fechaLimiteTexto: "1 de diciembre de 2026",
    sheetsURL: "",               // PENDIENTE: URL /exec de Apps Script
    formsURL: "",
    maxIntentos: 5,
    // Mostrar al invitado su número de mesa después de confirmar.
    // Recomendado false hasta que el acomodo esté cerrado.
    mostrarMesa: false
  }
};

/* =====================================================================
   INVITADOS DE PRUEBA (solo modo "demo")
   ---------------------------------------------------------------------
   Esta lista es FICTICIA. La lista real con sus códigos está en
   apps-script/Code.gs y en invitados.csv, y debe vivir solo en Google
   Sheets: todo lo que se escribe aquí es visible para cualquiera.
   ===================================================================== */
const INVITADOS = {
  "PRUEBA1": { "familia": "Familia de prueba", "lugares": 4, "mesa": 1 },
  "PRUEBA2": { "familia": "Invitado de prueba", "lugares": 1, "mesa": 2 }
};
