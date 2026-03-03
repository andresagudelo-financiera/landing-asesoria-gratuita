## 1. Fase 1: Preparación del Estado Global y Estructura

- [ ] 1.1 Configurar el enrutador o la lógica de modal para `LeadFunnelContainer` en `src/pages/index.astro`.
- [ ] 1.2 Actualizar botones CTA de la landing para abrir el nuevo Modal de LeadFunnelContainer y eliminar la dependencia de Typebot.
- [ ] 1.3 Crear estructura de carpetas y componentes base huecos (`DynamicForm`, `CalendarPicker`, `ConfirmationView`) dentro de React.

## 2. Fase 2: Frontend - Formulario Dinámico y UI

- [ ] 2.1 Crear archivo `form-config.json` o equivalente para modelar las preguntas del perfilamiento y el árbol de enrutamiento condicional.
- [ ] 2.2 Codificar `DynamicForm.tsx` con su estado interno leyendo el JSON y renderizando preguntas. Lógica de "Califica" / "No Califica".
- [ ] 2.3 Implementar el componente visual `CalendarPicker.tsx` (estructura y animaciones, data mock).
- [ ] 2.4 Implementar `ConfirmationView.tsx` y aplicar animaciones GSAP y estilos consistentes (Tailwind 4) sobre todo el embudo.

## 3. Fase 3: Backend - Endpoint de Availability (Clint + GCal)

- [ ] 3.1 Habilitar Output de servidor en Astro.
- [ ] 3.2 Crear función/utilería segura para validar el Token JWT/CAPI (si aplica).
- [ ] 3.3 Desarrollar rutina en Backend para conectarse a API Clint y capturar array de coaches.
- [ ] 3.4 Configurar conexión y testeo contra la API de Google Calendar.
- [ ] 3.5 Crear el API Endpoint `/api/calendar/availability` que procese la intersección e iteraciones en base a GCal.

## 4. Fase 4: Backend - Reservas y DB del Puntero (Round Robin)

- [ ] 4.1 Levantar y configurar Base de Datos (Redis o SQLite) alojada en DigitalOcean para tracking de estado.
- [ ] 4.2 Crear utilería en backend para leer/actualizar el puntero (Index del coach en la lista circular).
- [ ] 4.3 Desarrollar el API Endpoint `/api/calendar/schedule` consumiendo Google Calendar Events.
- [ ] 4.4 Integrar el movimiento del puntero en la DB después de agendar exitosa. Coordinar reintentos en conflictos de horarios.

## 5. Fase 5: Meta CAPI Tracking

- [ ] 5.1 Crear el endpoint genérico interno `/api/tracking/meta-capi` que inyecte de forma segura los eventos de servidor a Facebook/Meta Graph API.
- [ ] 5.2 Incorporar peticiones POST al backend desde React para disparar CAPI al renderizar la Landing.
- [ ] 5.3 Enlazar peticiones CAPI de 'Lead' al calificar en el cuestionario.
- [ ] 5.4 Enlazar peticiones CAPI de 'Schedule' al completar la reserva de la cita efectivamente.

## 6. Fase 6: Pruebas y End-to-End

- [ ] 6.1 Probar persistencia del Round-Robin Puntero con calendarios test en base real (simulando 3 iteraciones de citas simultáneas).
- [ ] 6.2 Verificar eventos del Pixel/CAPI mediante Network Tab.
