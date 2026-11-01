# Proyectos del portfolio y código disponible

El catálogo describe 20 iniciativas o módulos. El ZIP original contiene únicamente
el portfolio y seis recreaciones educativas integradas. Las fichas no incluyen
automáticamente el código de los proyectos que describen.

Inventario revisado el 1 de noviembre de 2026 en la cuenta `Lauaf`:

| Proyecto o grupo | Código localizado | Situación para integrarlo |
| --- | --- | --- |
| Portfolio y seis demos | Este repositorio, `index.html` | Funciona con un servidor local. |
| ArkyBites y ArkyCash-e | [Arky-Bites](https://github.com/Lauaf/Arky-Bites), privado | Su README describe ambos módulos ya unificados, con backend FastAPI, frontend Angular y Docker Compose. Falta probar e integrar su arranque desde este repositorio. |
| Arky Finances independiente | [Arky-Finances](https://github.com/Lauaf/Arky-Finances), público | Versión independiente de finanzas. Confirmar si se conserva además de la versión integrada en Arky-Bites. |
| Algoritmos y tres en raya | [TP1_Prog3](https://github.com/Lauaf/TP1_Prog3), público | Contiene `tp-pathfinding`, `tp-tateti` y `tp-tsp`. Son proyectos separados de las demos educativas del portfolio. |
| Reconocimiento facial | [TP1_CV](https://github.com/Lauaf/TP1_CV), público | El README describe backend, Gradio, modelos y Docker Compose. Su frontend usa 8080: requiere otro puerto para convivir con el portfolio. No se ejecutó en esta revisión. |
| Otros trabajos de visión y PDI | [TP2_VC](https://github.com/Lauaf/TP2_VC), [TP2](https://github.com/Lauaf/TP2), [TP_1_PDI](https://github.com/Lauaf/TP_1_PDI), [TP_2_PDI](https://github.com/Lauaf/TP_2_PDI), [TP_3_PDI](https://github.com/Lauaf/TP_3_PDI) | Repositorios encontrados. Falta seleccionar cuáles forman parte del portfolio y revisar sus requisitos. |
| Arky AI | [Arky-DM](https://github.com/Lauaf/Arky-DM), privado, es un proyecto relacionado | Confirmar qué versión corresponde al asistente descrito en el portfolio. |
| Barista, Valdor y recursos pixel art | No incluidos en el ZIP | La demo de espresso sí está integrada. Para las versiones completas faltan sus carpetas o repositorios. |
| Nobilis, HL7, WHONET y demás casos profesionales | El ZIP contiene descripciones y demos conceptuales | Sus implementaciones laborales no están incluidas. Las demos HL7, WHONET y plantillas funcionan con datos ficticios. |

## Levantar varios proyectos juntos

Hay dos opciones compatibles con este portfolio:

1. Mantener los repositorios originales y agregar un lanzador central que use
   rutas locales o checkouts de versiones concretas.
2. Reunir los proyectos elegidos en un repositorio con varias aplicaciones y
   preparar un `compose.yml` con puertos, variables y volúmenes por servicio.

Antes de definir el lanzador hace falta elegir las implementaciones concretas.
Los distintos backends suelen usar el puerto 8000, y varios frontends usan
4200 u 8080. Copiar sus comandos actuales sin adaptar puertos no permite
ejecutarlos todos a la vez.

GitHub almacena el código; GitHub Pages sirve el portfolio estático y sus seis
demos. Los backends Python, bases de datos y modelos de IA necesitan su propio
entorno de ejecución o un arranque local.
