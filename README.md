# Landing Page - Asesoría Gratuita (Finanzas con Claudia Uribe)

Landing page optimizada para la conversión de leads interesados en asesorías financieras gratuitas. Este proyecto utiliza tecnologías modernas para garantizar velocidad, diseño responsivo y seguimiento efectivo de campañas de marketing.

## 🚀 Tecnologías

*   **[Astro](https://astro.build/)**: Framework principal para optimización de rendimiento y SEO.
*   **[React](https://react.dev/)**: Biblioteca UI para componentes interactivos.
*   **[Tailwind CSS v4](https://tailwindcss.com/)**: Motor de estilos para un diseño rápido y consistente.
*   **DigitalOcean App Platform**: Plataforma de despliegue y hosting.

## ✨ Características Principales

### 1. Roadmap Visual (Línea de Tiempo)
La sección de beneficios ("Lo que sucede en las Asesorías") se presenta como una línea de tiempo vertical interactiva.
*   **Diseño**: 10 hitos numerados que alternan entre izquierda y derecha.
*   **Estilo**: Uso de gradientes de marca (Naranja/Oscuro) con sombras y efectos hover.
*   **Objetivo**: Guiar visualmente al usuario a través del proceso de asesoría.

### 2. Rastreo UTM (Marketing Tracking)
El proyecto incluye un script personalizado en `src/layouts/MainLayout.astro` para la persistencia de datos de campañas.
*   **Funcionamiento**: Detecta automáticamente parámetros UTM en la URL (`utm_source`, `utm_medium`, `utm_campaign`, etc.).
*   **Persistencia**: Anexa estos parámetros a todos los enlaces de llamada a la acción (CTA) que dirigen a **LeapChat**.
*   **Beneficio**: Permite atribuir correctamente las conversiones a sus fuentes de tráfico originales.

### 3. Integración LeapChat
Todos los botones de "Agendar Asesoría" están vinculados directamente a la experiencia de conversión en LeapChat.

## 🛠️ Instalación y Desarrollo Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/andresagudelo-financiera/landing-asesoria-gratuita.git
    cd landing-asesoria-gratuita
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    El sitio estará disponible en `http://localhost:4321`.

4.  **Construir para producción**:
    ```bash
    npm run build
    ```
    Los archivos estáticos se generarán en la carpeta `dist/`.

## ☁️ Despliegue (DigitalOcean)

Este proyecto está configurado para desplegarse automáticamente en **DigitalOcean App Platform** usando el archivo `app.yaml`.

*   **Repositorio**: `andresagudelo-financiera/landing-asesoria-gratuita`
*   **Rama**: `main`
*   **Comando de Build**: `npm run build`
*   **Directorio de Salida**: `dist`
*   **Sitio Estático**: Configurado para servir contenido estático generado por Astro.

## 🎨 Identidad Visual

El diseño sigue estrictamente los lineamientos de marca de "Finanzas con Claudia Uribe":
*   **Colores**: Naranja (`#ff9800`) y Oscuro (`#1a1a1a`) como primarios.
*   **Tipografía**: Work Sans.
*   **Estilo**: "Rebelión Elegante" - Moderno, profesional y directo.
