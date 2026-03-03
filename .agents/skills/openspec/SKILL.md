---
name: openspec
description: Skill para implementar el protocolo OpenSpec (Spec-Driven Development) para tareas de IA.
---

# Skill: OpenSpec (Spec-Driven Development)

Este skill define el flujo de trabajo para usar OpenSpec en el desarrollo asistido por IA. OpenSpec actúa como una capa de especificación estructurada entre las intenciones del desarrollador y la generación de código de la IA.

## Flujo de Trabajo

### 1. Fase de Propuesta (Proposal)
Antes de escribir cualquier código, se deben definir los documentos de especificación:
- **`proposal.md`**: Define la intención, el alcance y los objetivos de la tarea.
- **`tasks.md`**: Lista de tareas detallada (checklist) para la implementación.
- **`design.md`** (opcional): Detalles de arquitectura o diseño visual.

Los documentos se guardan en `specs/<task-name>/`.

### 2. Fase de Definición y Revisión
Refinar las especificaciones mediante "spec deltas" que detallan cambios en los requisitos. Los documentos deben ser revisados y aprobados antes de la implementación.

### 3. Fase de Aplicación (Apply/Implementation)
La IA genera el código basándose estrictamente en las especificaciones aprobadas. El comando conceptual es `/openspec-apply`.

### 4. Fase de Archivo (Archive)
Una vez completada la tarea, los documentos de especificación se archivan o se integran en la documentación permanente del proyecto.

## Uso del Skill
Cuando el usuario mencione "OpenSpec" o quiera crear una tarea estructurada:
1.  Inicia la **Fase de Propuesta** creando el directorio `specs/<task-name>`.
2.  Usa las plantillas en `specs/.templates/` si están disponibles.
3.  No procedas a la implementación hasta que la especificación esté clara y aprobada.
