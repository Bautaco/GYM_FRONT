# ⚡ Frontend - Plataforma Web de Entrenamiento Físico y Seguimiento

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=d3dotjs&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F97316?style=for-the-badge&logo=lucide&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

Frontend web moderno, reactivo y de alto rendimiento concebido para optimizar la interacción diaria entre **administradores**, **entrenadores** y **atletas**. Desarrollado con **React 18**, **Vite** y **TypeScript**, integrando prescripción de programas de entrenamiento, ejecución interactiva de rutinas, reproductor multimedia in-app (con soporte nativo para YouTube Shorts), temporizador flotante de descansos, celebración de récords personales con confeti, registro antropométrico, soporte multi-tema (Modo Oscuro / Claro) y paneles analíticos en tiempo real.

---

## 🎯 1. Título y Descripción General

### Nombre del Proyecto
**APEX FIT - Frontend: Plataforma Web de Entrenamiento Físico y Seguimiento**

### Resumen del Producto
La aplicación web ofrece una experiencia inmersiva, limpia y de nivel empresarial sin dependencias pesadas de UI, apoyada en un sistema de diseño propio basado en CSS semántico y tokens de diseño:
- **Control de Acceso Basado en Roles (RBAC)**: Segmentación estricta entre `ADMIN`, `ENTRENADOR` y `ATLETA`.
- **Panel de Administración Centralizado**: El `ADMIN` gestiona el alta y baja de cuentas institucionales; no existe registro público abierto al azar.
- **Reproductor Multimedia In-App**: Guías biomecánicas con videos demostrativos y **YouTube Shorts** sin redirigir al usuario fuera de la aplicación.
- **Registro de Marcas sin Fricción**: Registro serie por serie de pesos reales (kg) y repeticiones logradas, con selección manual de series ejecutadas y bloqueo de edición una vez guardada la sesión.
- **Celebración de Récords Personales (PRs)**: Detección inteligente de marcas superadas y ventana modal de felicitación con animación de confeti interactivo.
- **Temporizador de Descanso Flotante**: Cronómetro siempre visible para controlar los intervalos de pausa entre series según la prescripción.
- **Auditoría y Progresión Visual**: Gráficos interactivos de fuerza (cargas máximas por ejercicio con Recharts), evolución de peso corporal y medidor dinámico de adherencia al plan.
- **Autogestión de Perfil y Preferencias**: Edición de datos personales, teléfono, notas, selector de avatares, cambio seguro de contraseña y alternancia instantánea entre Modo Oscuro y Modo Claro.

> 🚫 **Delimitación de Alcance (Exclusiones Deliberadas)**: La aplicación web se enfoca estrictamente en el rendimiento deportivo, prescripción técnica de rutinas y evolución biomecánica. No contiene módulos de cobro, pasarelas de pago, facturación ni gestión de reservas físicas de turnos.

---

## 🏗️ 2. Arquitectura de Software y Estructura del Proyecto

El proyecto implementa una **Arquitectura Basada en Características (Feature-Based Architecture)**, organizando el estado, componentes y servicios por contexto de negocio:

```
GYM_FRONT/
├── public/                           # Assets estáticos y favicon
├── src/
│   ├── assets/                       # Iconografía y recursos gráficos
│   │
│   ├── components/                   # Componentes transversales reutilizables
│   │   ├── Navbar.tsx                # Barra superior con navegación, toggle de tema y perfil
│   │   ├── ProfileModal.tsx          # Modal de configuración de usuario, avatares y contraseña
│   │   ├── VideoPlayerModal.tsx      # Modal reproductor in-app con soporte YouTube Shorts y HTML5
│   │   ├── BodyWeightModal.tsx       # Modal de registro antropométrico rápido
│   │   ├── RestTimerWidget.tsx       # Widget flotante con cronómetro y presets de descanso
│   │   └── PrCelebrationModal.tsx    # Modal de celebración de récords personales con confeti
│   │
│   ├── features/                     # Módulos funcionales de negocio
│   │   ├── admin/                    # Gestión administrativa del sistema
│   │   │   └── AdminUserManagementPage.tsx # Panel de control de usuarios (HU-01)
│   │   │
│   │   ├── auth/                     # Autenticación y control de sesión
│   │   │   ├── AuthContext.tsx       # Contexto global de sesión, token JWT y datos de usuario
│   │   │   └── LoginPage.tsx         # Pantalla de inicio de sesión con botones de acceso rápido demo
│   │   │
│   │   ├── theme/                    # Sistema de Temas (Dark / Light)
│   │   │   └── ThemeContext.tsx      # Manejo de tema global y sincronización con localStorage
│   │   │
│   │   ├── training/                 # Prescripción y ejecución de entrenamientos
│   │   │   ├── AthleteDashboard.tsx  # Vista de atleta: selector de rutinas y tabla de ejecución (HU-06)
│   │   │   └── TrainerPlanBuilder.tsx# Vista de entrenador: creador de planes y plantillas (HU-04)
│   │   │
│   │   ├── exercises/                # Catálogo técnico de movimientos
│   │   │   └── ExerciseCatalogPage.tsx # Catálogo con filtros y CRUD completo (HU-03)
│   │   │
│   │   └── progress/                 # Métricas, gráficos y adherencia
│   │       └── ProgressPage.tsx      # Gráficos de fuerza (Recharts), peso y adherencia (HU-10/11)
│   │
│   ├── services/                     # Capa de comunicación HTTP con Axios
│   │   ├── api.ts                    # Cliente base con interceptores de autorización Bearer
│   │   ├── authService.ts            # Endpoints de login, registro, atletas, usuarios admin y perfil
│   │   ├── trainingService.ts        # Endpoints de planes, sesiones, catálogo, templates y pesajes
│   │   └── analyticsService.ts       # Endpoints de adherencia y progresión de fuerza
│   │
│   ├── routes/                       # Enrutamiento y control de acceso
│   │   └── AppRoutes.tsx             # Rutas públicas y privadas protegidas por rol (RBAC)
│   │
│   ├── types/                        # Tipado estricto TypeScript
│   │   └── index.ts                  # User, Role, Exercise, Plan, Session, LoggedSet, Metric, Template
│   │
│   ├── index.css                     # Sistema de diseño, tokens CSS, dark/light theme, animaciones
│   ├── App.tsx                       # Shell principal con Providers (Theme, Auth, Router)
│   └── main.tsx                      # Punto de entrada de la aplicación Vite
```

---

## 🎯 3. Mapeo Integral de Historias de Usuario (HU-01 a HU-12)

| Historia de Usuario | Módulo / Vista | Rol | Descripción y Criterios Cumplidos |
| :--- | :--- | :--- | :--- |
| **HU-01: Gestión Centralizada de Usuarios** | `/admin/users` | `ADMIN` | Creación de cuentas institucionales (`ENTRENADOR` y `ATLETA`) desde el panel de control. Listado general y eliminación. Se descarta el registro público abierto para mantener la seguridad institucional. |
| **HU-02: Autenticación, Sesión y Perfil** | `/login`, `ProfileModal` | Todos | Login con JWT persistido en `localStorage`. Botones de acceso rápido para demostración rápida de los 3 roles. Modal de perfil para actualización de datos, avatar preset y cambio seguro de contraseña. |
| **HU-03: Catálogo Multimedia de Ejercicios** | `/exercises` | Compartido | Catálogo de ejercicios clasificados por grupo muscular. Los entrenadores cuentan con CRUD completo (creación, edición completa de todos los campos y baja segura). |
| **HU-04: Constructor y Asignador de Planes** | `/trainer/assign-plan` | `ENTRENADOR` | Creación de planes con rutinas diarias, series, repeticiones sugeridas y descansos. Gestión de plantillas de rutina (guardado y carga rápida para agilizar prescripciones). |
| **HU-05: Reproductor Multimedia In-App** | `VideoPlayerModal` | Compartido | Visualización de técnica y guías en modal in-app. Soporta videos estándar de YouTube, enlaces de **YouTube Shorts** (`youtube.com/shorts/...`) y archivos de video MP4 directos. |
| **HU-06: Ejecución Interactiva de Rutinas** | `/` (Atleta) | `ATLETA` | Navegación entre días de la rutina activa. Registro interactivo de peso real (kg) y repeticiones logradas serie por serie con selección manual. Escala RPE (1-10), feedback y sellado de sesión completada. |
| **HU-07: Récords Personales (PRs)** | `PrCelebrationModal` | `ATLETA` | Comparación automática de las cargas levantadas con el histórico. Si se supera una marca anterior, se dispara una celebración con confeti animado (`canvas-confetti`). |
| **HU-08: Temporizador Flotante de Descanso** | `RestTimerWidget` | Compartido | Widget flotante persistente en pantalla con presets de descanso (30s, 60s, 90s, 120s), pausa, reanudación y alerta visual y sonora. |
| **HU-09: Registro Antropométrico** | `BodyWeightModal` | `ATLETA` | Modal accesible desde la barra superior y panel de progreso para ingresar pesajes en kg con fecha y validación numérica estricta. |
| **HU-10: Analítica de Progresión de Cargas** | `/progress` | Compartido | Gráficos interactivos de líneas (**Recharts**) con la evolución del peso máximo (1RM / carga máx) alcanzado por ejercicio a lo largo del tiempo. |
| **HU-11: Métricas de Adherencia al Plan** | `/progress` | Compartido | Cálculo y visualización en tiempo real del porcentaje de adherencia, comparando rutinas ejecutadas vs. prescritas por el entrenador. |
| **HU-12: Sistema Multi-tema y Accesibilidad** | Barra de navegación | Todos | Alternancia instantánea entre **Modo Oscuro** (obsidian & neon) y **Modo Claro** (alto contraste), persistido en `localStorage` y aplicado mediante variables CSS nativas. |

---

## 🚦 4. Rutas del Sistema y Control de Acceso (RBAC)

El enrutamiento está centralizado en [`src/routes/AppRoutes.tsx`](file:///d:/Bautaco/Documents/Universidad/Ingenieria%20y%20calidad%20de%20software/Proyecto%203/GYM/GYM_FRONT/src/routes/AppRoutes.tsx):

| Ruta | Componente | Roles Permitidos | Comportamiento / Redirección |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage` | Público | Si ya está autenticado, redirige automáticamente según el rol del usuario. |
| `/` | `AthleteDashboard` | `ATLETA` | Si el rol es `ADMIN`, redirige a `/admin/users`. Si es `ENTRENADOR`, redirige a `/trainer/assign-plan`. |
| `/admin/users` | `AdminUserManagementPage` | `ADMIN` | Si no es admin, redirige a la ruta principal correspondiente a su rol. |
| `/trainer/assign-plan` | `TrainerPlanBuilder` | `ENTRENADOR` | Si no es entrenador, redirige a la ruta principal correspondiente a su rol. |
| `/exercises` | `ExerciseCatalogPage` | Todos los roles | Vista compartida; los botones de creación, edición y borrado solo se activan para el entrenador. |
| `/progress` | `ProgressPage` | Todos los roles | Atletas ven sus propias curvas; entrenadores y admins pueden auditar a cualquier atleta mediante selector. |

---

## ⚙️ 5. Requisitos Previos, Configuración e Instalación

### Prerrequisitos
- **Node.js**: Versión LTS `v18.x`, `v20.x` o superior.
- **npm**: `v9.x` o superior.
- **Backend Activo**: El servicio `GYM_BACK` debe estar ejecutándose en `http://localhost:3000`.

### Variables de Entorno

Crear un archivo `.env` en la raíz de `GYM_FRONT` tomando como modelo `.env.example`:

```bash
cp .env.example .env
```

#### Contenido de `.env.example`
```env
# URL base de la API REST del backend
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Comandos de Instalación y Ejecución

1. **Instalar dependencias del proyecto:**
   ```bash
   cd GYM_FRONT
   npm install --legacy-peer-deps
   ```

2. **Iniciar servidor de desarrollo (con HMR y recarga instantánea):**
   ```bash
   npm run dev
   ```
   *La aplicación se levantará en un puerto disponible (por defecto `http://localhost:5173` o `http://localhost:5175`).*

3. **Verificación de tipos y Compilación para Producción:**
   ```bash
   npm run build
   ```
   *Valida el 100% de tipos TypeScript (0 errores) y genera el paquete optimizado en `dist/`.*

4. **Previsualizar el paquete de Producción localmente:**
   ```bash
   npm run preview
   ```

---

## 🔒 6. Integración con la API y Seguridad

### Interceptor de Solicitudes HTTP (Axios)
La capa HTTP centralizada en [`src/services/api.ts`](file:///d:/Bautaco/Documents/Universidad/Ingenieria%20y%20calidad%20de%20software/Proyecto%203/GYM/GYM_FRONT/src/services/api.ts) intercepta automáticamente cada petición saliente para adjuntar el token JWT:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

En caso de recibir una respuesta con código de estado `401 Unauthorized`, el interceptor descarta el token almacenado y restablece el estado para redirigir al usuario al login de forma limpia.

---

## 🎨 7. Sistema de Diseño y Tokens CSS

La interfaz utiliza variables semánticas en [`src/index.css`](file:///d:/Bautaco/Documents/Universidad/Ingenieria%20y%20calidad%20de%20software/Proyecto%203/GYM/GYM_FRONT/src/index.css), lo que garantiza consistencia visual y soporte multi-tema fluido:

```css
:root {
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --color-principal: #10b981;
  --color-principal-al-pasar: #059669;
  --color-acento: #6366f1;
}

[data-theme='dark'] {
  --bg-main: #0b0f19;
  --color-fondo-tarjeta: #111827;
  --text-main: #f9fafb;
  --text-muted: #9ca3af;
  --border-subtle: #1f2937;
}

[data-theme='light'] {
  --bg-main: #f8fafc;
  --color-fondo-tarjeta: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-subtle: #e2e8f0;
}
```

---

## 🔑 8. Credenciales Demo para Pruebas Rápidas

Para facilitar las pruebas de auditoría y evaluación del sistema, la pantalla de inicio de sesión incorpora botones de **acceso rápido con 1 solo clic** para los siguientes usuarios demo pre-cargados:

| Rol | Correo Electrónico | Contraseña | Vistas y Capacidades |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@gym.com` | `admin123` | Control total de usuarios (`/admin/users`), creación y eliminación de cuentas de entrenadores y atletas |
| **ENTRENADOR** | `entrenador@gym.com` | `admin123` | Asignar planes a atletas (`/trainer/assign-plan`), plantillas de rutinas, CRUD de catálogo, auditar analíticas de alumnos |
| **ATLETA 1** | `atleta@gym.com` | `atleta123` | Rutina activa asignada de 2 días, registro interactivo de series, pesaje antropométrico y gráficos de fuerza/adherencia |
| **ATLETA 2** | `marcos@gym.com` | `atleta123` | Alumno registrado disponible en el selector del entrenador para asignación de nuevos microciclos |
