// Los lugares del pueblo, qué proyecto vive en cada uno y sus ejemplos visuales.
// Sin dependencias del navegador: lo usan pueblo.js y las pruebas (tests/pueblo.test.cjs).
export const IMG = '../assets/pueblo/';

// ---------- Contenido: lugares, proyectos y ejemplos visuales ----------

// Esquemas ilustrativos para lo profesional, donde no se puede mostrar el sistema real.
const flujo = (pasos, cap) => ({ flujo: pasos, cap: cap || 'Esquema ilustrativo: no es una captura del sistema real.' });
const img = (archivo, cap) => ({ img: IMG + archivo + '.webp', cap });

export const VISUALES = {
  'SaaS multi-tenant para salud': [flujo(['Clientes (tenants)', 'Keycloak · permisos', 'API FastAPI', 'Módulos de negocio'])],
  'Integraciones clínicas HL7 / FHIR': [img('demo-hl7', 'Recreación en el laboratorio: un mensaje HL7 v2.6 ficticio interpretado segmento por segmento.'), flujo(['Sistema externo', 'HL7 v2.6 por MLLP · FHIR', 'Integrador: mapeos y reintentos', 'Sistema del laboratorio'])],
  'Exportación de antibiogramas': [img('demo-antibiograma', 'Recreación: exportación de un antibiograma con validación de CMI, halo o S/I/R.'), flujo(['Antibiograma', 'Validación CMI / halo / SIR', 'Vista previa', 'Archivo de exportación'])],
  'Plantillas de informes': [img('demo-plantillas', 'Recreación: una plantilla con variables, renderizada con datos ficticios.'), flujo(['Plantilla con {{variables}}', 'Estilos por fragmento', 'Vista previa', 'Aplicación masiva'])],
  'Arky AI': [img('arky-portada', 'Arky: un asistente para la cocina y la plata.'), img('arky-chat', 'El chat ejecuta acciones contra la base, con confirmación cuando hay plata de por medio.'), img('arky-panel', 'El panel: un número principal y lo que conviene decidir hoy.')],
  'ArkyBites': [img('arky-recetas', 'Recetas ordenadas por lo que ya tenés en la despensa.'), img('arky-cocina', 'Modo cocción paso a paso: descuenta el stock real.')],
  'ArkyCash-e': [img('arky-plata', 'Cuánto podés gastar sin romper el ahorro ni el colchón.'), img('arky-comprar', '«¿Me lo puedo comprar?»: simula la compra mes a mes antes de decidir.')],
  'Sandō 三道': [img('sando-pueblo', 'El pueblo: Arky camina entre el dojo, el cine, la sala de música, el café y la casa.'), img('sando-kana', 'Dojo: batallas de kana contra yokai.'), img('sando-espresso', 'Academia de barismo: el espresso paso a paso, con presión, caudal y canalización simulados.'), img('sando-latte', 'Latte Art Academy: se dibuja con el vertido sobre una superficie simulada.'), img('sando-canciones', 'Sala de música: canciones con notas que caen y teclado MIDI o micrófono.'), img('sando-cine', 'Cine: videos de YouTube con subtítulos japoneses analizados por una IA local.')],
  'Valdor — D&D tools': [flujo(['Acertijo de varias etapas', 'Pistas', 'Decisiones de los jugadores', 'La historia cambia'], 'Esquema ilustrativo de cómo funcionan los puzles de la campaña.')],
  'Arky Pixel Assets': [{ sprite: true, cap: 'La hoja de sprites de Arky, animada: caminata en cuatro direcciones.' }, { caras: true, cap: 'Expresiones: feliz, enojado, pensativo y sorprendido.' }],
  'Reconocimiento facial': [img('facial-embeddings', 'Embeddings del dataset propio con PCA y t-SNE: cada persona forma su propio grupo.'), img('facial-umbral', 'Barrido del umbral: reconocer a los conocidos contra rechazar a los desconocidos.'), img('facial-confusion', 'Matriz de confusión de la evaluación closed-set.')],
  'Algoritmos de búsqueda e IA': [img('demo-busqueda', 'A* resolviendo el laberinto del laboratorio: 14 pasos.'), img('demo-minimax', 'Minimax: un agente que no pierde al tres en raya.')],
  'Razas de perros': [img('perros-metricas', 'ResNet18 con fine-tuning contra una CNN propia, en test.'), img('perros-confusion', 'Matriz de confusión de la ResNet18 sobre 70 razas.'), img('perros-similitud', 'Búsqueda por similitud: accuracy por modelo.'), img('perros-entrenamiento', 'Curvas de entrenamiento.')],
  'Visión clásica con OpenCV': [img('vision-ecualizacion', 'Ecualización local: aparecen un cuadrado, una diagonal, una «a», cuatro líneas y un círculo escondidos.'), img('vision-formulario', 'Validación de formularios: en verde lo válido, en rojo lo que falla.'), img('vision-patente', 'Segmentación de los caracteres de una patente.'), img('vision-monedas', 'Monedas y dados: $7,40 en monedas, dados 5 y 3.')],
  'Dados en video': [img('vision-dados', 'El cuadro elegido de la tirada 4: cinco dados quietos, 14 puntos.'), { video: '../assets/pdi/tirada_4.mp4', cap: 'La tirada original.' }],
};

// Lo que no es una ficha del catálogo pero vive en un edificio.
export const EXTRAS = {
  'Café y barismo': {
    resumen: 'El café empezó como curiosidad y terminó en simulaciones. A largo plazo, una cafetería propia: un espacio cálido, jazz de fondo y tiempo para conversar.',
    trabajado: 'Modelos de extracción, vaporizado y latte art dentro de Sandō, y una versión mínima para probar en el laboratorio del portfolio.',
    tags: 'Café,Simulación,JavaScript', icono: '☕', estado: 'Lo que me mueve',
    visuales: [img('demo-espresso', 'Espresso Lab, la versión mínima del laboratorio.'), img('sando-cafe', 'El kissaten de Kenji: la academia completa dentro de Sandō.')],
    enlaces: [{ url: '../#demo=barista', label: 'Probar Espresso Lab ↗', live: true }],
  },
};

export const LUGARES = [
  {
    id: 'lab', nombre: 'Laboratorio clínico', kanji: '研究所', estilo: 'musica', icono: '🏥', x: 23, y: 2, w: 8, h: 6, puerta: { x: 26, y: 7 },
    linea: 'Mi trabajo en Wiener Lab',
    intro: 'Soy desarrollador Full-Stack en Wiener Lab: me encargo principalmente del backend y la base de datos, y colaboro con el frontend. Acá están los tipos de desarrollo que hago, explicados de forma general. Como es software de salud de la empresa, no muestro código, pantallas, nombres de productos ni detalles internos: solo recreaciones con datos ficticios y esquemas.',
    proyectos: ['SaaS multi-tenant para salud', 'Integraciones clínicas HL7 / FHIR', 'Exportación de antibiogramas', 'Plantillas de informes'],
  },
  {
    id: 'arky', nombre: 'Casa de Arky', kanji: 'アーキー', estilo: 'casa', icono: '🐉', x: 26, y: 12, w: 7, h: 5, puerta: { x: 28, y: 16 },
    linea: 'Un asistente con IA para la cocina y la plata, en producción',
    intro: 'Arky es un dragoncito con IA que maneja dos áreas del día a día y las cruza en una misma conversación: la cocina (ArkyBites) y las finanzas (ArkyCash-e). Está en producción en Railway, con usuarios reales y registro abierto.',
    proyectos: ['Arky AI', 'ArkyBites', 'ArkyCash-e'],
  },
  {
    id: 'cafe', nombre: 'Kissaten: Sandō y café', kanji: '喫茶店', estilo: 'cafe', icono: '☕', x: 2, y: 12, w: 8, h: 5, puerta: { x: 6, y: 16 },
    linea: 'Sandō, el juego de este pueblo, y la academia de barismo',
    intro: 'Este pueblo sale de Sandō, un juego que hice para practicar japonés, piano y barismo. Adentro del kissaten está la academia de café: ocho minijuegos donde cada shot, cada leche y cada vertido salen de un modelo de simulación.',
    proyectos: ['Sandō 三道', 'Café y barismo'],
  },
  {
    id: 'facultad', nombre: 'Facultad · UNR', kanji: '大学', estilo: 'dojo', icono: '🎓', x: 4, y: 2, w: 8, h: 6, puerta: { x: 8, y: 7 },
    linea: 'Tecnicatura en Inteligencia Artificial',
    intro: 'El dojo donde entreno: la Tecnicatura Universitaria en Inteligencia Artificial de la UNR, que curso mientras trabajo a jornada completa. Visión por computadora, procesamiento de imágenes, algoritmos de búsqueda y agentes para juegos. Varios trabajos fueron en equipo.',
    proyectos: ['Reconocimiento facial', 'Razas de perros', 'Visión clásica con OpenCV', 'Dados en video', 'Algoritmos de búsqueda e IA'],
  },
  {
    id: 'estudio', nombre: 'Estudio creativo', kanji: '工房', estilo: 'cine', icono: '🎨', x: 13, y: 1, w: 9, h: 7, puerta: { x: 17, y: 7 },
    linea: 'Pixel art y mundos para jugar',
    intro: 'Videojuegos, pixel art y sistemas interactivos: donde se juntan la lógica y lo visual. También desarrollo un universo para Dungeons & Dragons, con reglas, acertijos y herramientas donde las decisiones de los jugadores cambian la historia.',
    proyectos: ['Arky Pixel Assets', 'Valdor — D&D tools'],
  },
];
export const PLAZA = { id: 'plaza', nombre: 'Sobre mí', icono: '⛲', linea: 'La fuente de la plaza' };


// Camino más corto por casillas libres (BFS). Las personas cuentan como obstáculo solo si `conGente`.
export function camino(m, desde, hasta, conGente = false) {
  const libre = (x, y) => (conGente ? m.libre(x, y) : x >= 0 && y >= 0 && x < m.w && y < m.h && !m.bloqueado[y][x]);
  const clave = (x, y) => y * m.w + x, previo = new Map([[clave(desde.x, desde.y), null]]), cola = [desde];
  while (cola.length) {
    const p = cola.shift();
    if (p.x === hasta.x && p.y === hasta.y) {
      const ruta = [];
      for (let k = clave(p.x, p.y); k !== clave(desde.x, desde.y); k = previo.get(k)) ruta.unshift({ x: k % m.w, y: Math.floor(k / m.w) });
      return ruta;
    }
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0]]) {
      const x = p.x + dx, y = p.y + dy, k = clave(x, y);
      if (previo.has(k) || !libre(x, y)) continue;
      previo.set(k, clave(p.x, p.y));
      cola.push({ x, y });
    }
  }
  return null;
}

