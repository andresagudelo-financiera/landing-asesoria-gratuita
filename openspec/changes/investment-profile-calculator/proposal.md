## Why

Muchas personas llegan buscando asesoría o formas de invertir, pero no tienen claro su perfil real, su nivel de riesgo, ni si están preparados financieramente para iniciar. Esto genera fricción y expectativas irreales (ej. querer alta rentabilidad sin tener fondo de emergencia). 
Crear una "Calculadora de Perfil de Inversión" interactiva resuelve esto: educa al usuario, filtra prospectos según su preparación (gates de seguridad) y ofrece un punto de partida accionable (Plan Semilla o asignación de portafolio) basado en regulaciones locales (Decreto 661 de 2018) y buenas prácticas internacionales (MiFID II).

## What Changes

- **Nueva ruta en el Frontend:** `/calculadora-perfil` (o similar) con una experiencia interactiva paso a paso (14 preguntas en 4 bloques).
- **Motor de cálculo de score (0-100):** Implementación de la fórmula `Perfil = 0.40*CF + 0.30*TR + 0.20*HO + 0.10*CE`.
- **Implementación de "Gates" de seguridad:** Reglas estrictas que limitan el nivel de riesgo recomendado si el usuario incumple criterios básicos (ej. no tener fondo de emergencia o tener mucha deuda cara).
- **Pantalla de Resultados Dinámica:** 
  - Renderizado de un "Plan Semilla" (90-180 días) para usuarios que no aplican aún para inversiones de riesgo.
  - Renderizado de Perfiles (Conservador, Moderado Conservador, Moderado, Agresivo) con sugerencias de distribución de portafolio para usuarios aptos.
- **Recolección de Leads:** Integración (potencial) para capturar los datos y resultados del usuario como lead calificado antes o después de mostrar el resultado.

## Capabilities

### New Capabilities
- `investment-profile-calculator`: Flujo de interfaz de usuario interactivo paso a paso para recolectar las respuestas del usuario a través de los 4 bloques del perfil (Capacidad Financiera, Tolerancia al Riesgo, Horizonte, Conocimiento). Incluye la UI, la gestión de estado de las respuestas y la lógica de validación.
- `investment-profile-scoring-engine`: Motor lógico central que procesa las respuestas, aplica la fórmula ponderada y evalúa los *gates* críticos (reglas de seguridad restrictivas) para escupir un resultado final validado (Score 0-100 o estado "No Aplica").

### Modified Capabilities


## Impact

- **Frontend:** Creación de nuevos componentes de UI fluidos (similares a interfaces conversacionales o forms tipo Typeform).
- **Marketing/Conversión:** Mejora en la cualificación de usuarios que llegan a la landing page o solicitan asesoría.
- **Backend/Datos:** Necesidad de estructurar cómo se guardarán de forma segura los resultados de este perfilamiento en la base de datos (por definir en la fase de diseño) para seguimiento.
