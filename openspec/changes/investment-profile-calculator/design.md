## Context

Se requiere construir una nueva funcionalidad (ruta y vista completa) en el frontend (Astro + React/Preact o Vanilla, dependiendo del stack exacto de la landing) para alojar la "Calculadora de Perfil de Inversión". Actualmente los usuarios no tienen una herramienta propia de auto-evaluación antes de agendar asesorías. 
El diseño debe contemplar un flujo tipo *wizard* o formulario paso a paso (14 preguntas) para maximizar la conversión, un motor matemático ligero en el cliente para el scoring, y una vista condicional de resultados que actúe según las reglas de seguridad financieras (Gates).

## Goals / Non-Goals

**Goals:**
- Implementar un flujo UI fluido de 14 preguntas, mostrando 1 pregunta a la vez (o agrupadas por bloque de manera muy concisa).
- Desarrollar un motor de cálculo puro (función utilitaria) que reciba el array/objeto de respuestas y retorne el `score` (0-100) y el `estado` (Perfil o "No Aplica").
- Renderizar dinámicamente el resultado final con gráficos simples (ej. diagrama de torta CSS o SVG) y recomendaciones accionables.
- Asegurar que la ruta `/calculadora-perfil` sea completamente *responsive*, con prioridad en diseño móvil.

**Non-Goals:**
- No se construirá un backend complejo ni base de datos en esta fase inicial, a menos que ya exista una integración directa con el CRM actual. El cálculo se hará 100% *client-side*.
- No se implementará autenticación obligatoria para usar la calculadora (debe ser una herramienta de *lead magnet* de libre acceso o con *gate* de email al final opcional).

## Decisions

1. **Arquitectura del Estado (Client-Side):** 
   - Se utilizará un gestor de estado ligero del framework actual de la landing (ej. React Context, Zustand, o stores nativos de Astro/Preact si aplica) para mantener las respuestas del usuario (`answers: { q1: 3, q2: 1, ... }`) a medida que navega por el *wizard*.
   - *Rationale:* Evita re-renders innecesarios y limpiar el estado si el usuario refresca (podría acoplarse a `localStorage` si se desea persistencia).

2. **Scoring Engine (Logica Desacoplada):**
   - La lógica matemática y las validaciones de "gates" vivirán en un archivo utilitario separado (ej. `src/utils/scoringEngine.ts`).
   - *Rationale:* Permite hacer pruebas unitarias (Unit Tests) a la fórmula independientemente de la UI, garantizando que el "Gate" de fondo de emergencia funcione perfectamente siempre.

3. **Estructura de Componentes UI:**
   - `<ProfileCalculator />` (Contenedor principal, maneja la ruta y el estado global).
   - `<QuestionStep />` (Componente reutilizable que renderiza la pregunta actual y sus 5 opciones).
   - `<ProgressBar />` (Indicador visual del avance (1/14)).
   - `<ResultView />` (Componente dinámico que recibe el resultado del *Scoring Engine* y decide qué UI mostrar).

4. **Captura de Leads (Opcional en MVP):**
   - Al llegar a la pregunta 14, se puede solicitar Nombre y Correo para "Ver el resultado", integrándose con el endpoint actual de leads de la landing. Si falla la red, el cálculo local igual se debe mostrar para no dañar la UX.

## Risks / Trade-offs

- **[Riesgo] Abandono del formulario por longitud (14 preguntas).** → *Mitigación:* Se implementará una UI sin distracciones, botones grandes de un solo clic (auto-avance a la siguiente pregunta sin botón de "Siguiente"), y una barra de progreso motivacional.
- **[Riesgo] Inconsistencia en la lógica de los "Gates".** → *Mitigación:* Cobertura de pruebas completa sobre el archivo `scoringEngine.ts` validando los casos límite dictados en la propuesta.
- **[Riesgo] Pérdida de estado al refrescar.** → *Mitigación:* Implementar persistencia básica en `sessionStorage` para guardar el índice de la pregunta actual y las respuestas previas.
