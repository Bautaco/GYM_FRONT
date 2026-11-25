# ⚡ Frontend - Plataforma Web de Entrenamiento Físico y Alto Rendimiento (APEX FIT)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=d3dotjs&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F97316?style=for-the-badge&logo=lucide&logoColor=white)
![CSS3](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

Frontend web moderno, reactivo y de alto rendimiento concebido para optimizar la gestión integral del entrenamiento físico entre **directores deportivos / administradores (`ADMIN`)**, **entrenadores (`ENTRENADOR`)** y **atletas (`ATLETA`)**. Desarrollado con **React**, **Vite** y **TypeScript**, integrando prescripción de microciclos, ejecución interactiva de rutinas, reproductor multimedia in-app (con soporte para YouTube Shorts y MP4), panel de control ejecutivo de alto rendimiento con gráficos interactivos, mapa anatómico biomecánico, temporizador flotante de descansos, celebración de récords personales con confeti, sistema multi-tema (Modo Oscuro / Claro) y suite completa de pruebas automatizadas con **Vitest** y **Testing Library**.

---

## 🎯 1. Resumen del Producto y Capacidades Clave

### 📊 Dashboard Ejecutivo para el Administrador del CAR (`/progress`)
Diseñado específicamente para directores deportivos y administradores de centros de alto rendimiento:
- **1. Adherencia y Cobertura de Planes**:
  - Semáforos de adherencia global y por atleta: Verde (`≥ 80%`), Amarillo (`50–79%`) y Rojo (`< 50%`).
  - Cobertura de planes activos vs. planes vencidos o atletas sin plan.
  - Tabla de auditoría con buscador en tiempo real por nombre de atleta o plan.
- **2. Carga, Fatiga y Rendimiento Deportivo**:
  - Gráficos interactivos con **Recharts**: distribución de RPE en 4 bandas de esfuerzo (Recuperación, Moderado, Alto, Máximo).
  - Promedio de RPE ponderado de la institución.
  - Tonelaje acumulado (volumen total levantado en kg).
  - Récords Personales (PRs) detectados y evolución agregada de fuerza.
  - Frecuencia de registros antropométricos (pesajes corporales).
- **3. Operación del Staff y Catálogo de Ejercicios**:
  - Desglose de usuarios activos por rol (`ADMIN`, `ENTRENADOR`, `ATLETA`).
  - Métricas de rendimiento por entrenador (atletas asignados, microciclos prescritos, uso de plantillas de rutina y adherencia promedio).
  - Auditoría multimedia del catálogo (total de ejercicios, cobertura porcentual de video y desglose por YouTube estándar, Shorts y MP4).
- **Filtros Interactivos**: Período temporal (`Todos`, `30 días`, `90 días`, `1 año`), filtro por entrenador asignado y filtro por rango de adherencia.

### 🏋️ Catálogo Biomecánico Dinámico (`/exercises`)
- **Grupos y Zonas Trabajadas Dinámicas**: Selección rápida desde la base de datos o creación sobre la marcha de nuevos grupos musculares y zonas anatómicas específicas.
- **Muñeco Anatómico Interactivo (`AnatomicalBodyFigure.tsx`)**: Representación esquemática del cuerpo humano que ilumina las regiones musculares involucradas en cada ejercicio.
- **Soporte Multimedia In-App**: Reproducción directa de videos demostrativos de YouTube estándar, YouTube Shorts y archivos directos MP4/WebM.
- **Manejo Robusto de Ejercicios Sin Video**:
  - Al editar un ejercicio y dejar el campo de video vacío o borrarlo, el sistema lo persiste como `null` en la base de datos.
  - En la tarjeta del catálogo se exhibe el badge especial `Sin video` y el aviso *"Sin video demostrativo"*.
  - En el modal de detalle se presenta un bloque visual explicativo con recomendaciones técnicas y anatómicas alternativas.
  - En el formulario de edición se alerta al entrenador antes de guardar la eliminación de un video.

### ⚡ Flujos de Entrenador y Atleta
- **Prescripción de Microciclos (`/trainer/assign-plan`)**: Creador visual de rutinas con series, repeticiones sugeridas, descansos, cadencia/tempo, frecuencia semanal y sesiones por día. Historial cronológico con acordeón colapsable y **validación de superposición de fechas**.
- **Ejecución Interactiva (`/`)**: Registro serie por serie de pesos reales y repeticiones, calificación de esfuerzo RPE (1–10) y temporizador flotante de descansos persistente en pantalla.
- **Celebración de Récords Personales (PRs)**: Detección automática al registrar marcas superiores a las históricas y animación modal con confeti interactivo (`canvas-confetti`).
- **Sistema Multi-tema**: Conmutación instantánea entre **Modo Oscuro** y **Modo Claro** sin parpadeos, persistido en `localStorage` y gobernado por variables CSS.

> 🚫 **Delimitación de Alcance**: La aplicación se enfoca estrictamente en la preparación física y el rendimiento deportivo. No contiene módulos de cobro, pasarelas de pago, facturación ni molinetes físicos.

---

## 🏗️ 2. Estructura del Proyecto

```
GYM_FRONT/
├── src/
│   ├── app/                          # Conecta router, providers y rutas
│   │   ├── App.tsx
│   │   ├── AppRoutes.tsx             # Rutas y permisos por rol (RBAC)
│   │   └── providers/AppProviders.tsx
│   │
│   ├── modules/                      # Funcionalidades separadas por dominio
│   │   ├── auth/                     # Inicio de sesión
│   │   │   ├── pages/LoginPage.tsx
│   │   │   └── auth.css
│   │   ├── exercises/                # Catálogo y administración de ejercicios
│   │   │   ├── components/           # Lista, filtros, modales y mapa anatómico
│   │   │   ├── hooks/useExerciseCatalog.ts
│   │   │   ├── pages/ExerciseCatalogPage.tsx
│   │   │   ├── exercises.service.ts  # Endpoints de ejercicios
│   │   │   ├── exercises.types.ts    # Tipos del dominio
│   │   │   ├── exercises.schema.ts   # Validaciones del formulario
│   │   │   ├── exercises.routes.ts
│   │   │   └── exercises.css
│   │   ├── training/                 # Planes, plantillas y ejecución de rutina
│   │   │   ├── components/PrCelebrationModal.tsx
│   │   │   ├── pages/                # Dashboard del atleta y constructor
│   │   │   ├── training.service.ts
│   │   │   ├── training.types.ts
│   │   │   ├── training.routes.ts
│   │   │   └── training.css
│   │   ├── progress/                 # Métricas, gráficos y peso corporal
│   │   │   ├── components/BodyWeightModal.tsx
│   │   │   ├── pages/ProgressPage.tsx
│   │   │   ├── progress.service.ts
│   │   │   ├── progress.types.ts
│   │   │   ├── progress.routes.ts
│   │   │   └── progress.css
│   │   └── admin/                    # Gestión de usuarios y roles
│   │       ├── pages/AdminUserManagementPage.tsx
│   │       ├── admin.service.ts
│   │       ├── admin.types.ts
│   │       ├── admin.routes.ts
│   │       └── admin.css
│   │
│   ├── shared/                       # Código transversal reutilizable
│   │   ├── api/api.ts                # Axios, token y errores comunes
│   │   ├── auth/                     # Contexto y servicio de autenticación
│   │   ├── theme/ThemeContext.tsx
│   │   ├── ui/                       # Navbar, perfil, temporizador y CSS compartido
│   │   └── utils/profilePhoto.ts
│   │
│   ├── types/index.ts                # Tipos compartidos temporalmente
│   ├── assets/                       # Recursos estáticos
│   ├── index.css                     # Variables, estilos globales e históricos
│   ├── main.tsx                      # Entrada de React
│   └── setupTests.ts                 # Configuración de pruebas
├── vite.config.ts                    # Configuración de compilación Vite
├── vitest.config.ts                  # Configuración de Vitest + JSDOM
└── tsconfig.app.json                 # Configuración de TypeScript
```

### ¿Cómo se organiza esta arquitectura?

La aplicación se organiza **por módulos de negocio**. Cada carpeta dentro de
`modules` reúne el código de una funcionalidad concreta: sus pantallas
(`pages`), piezas visuales (`components`), pedidos al backend (`*.service.ts`),
tipos (`*.types.ts`), rutas, estilos y, cuando existen, pruebas. Por ejemplo,
todo lo necesario para el catálogo está en `modules/exercises`.

La carpeta `shared` contiene lo **transversal**: código que reutilizan dos o
más módulos y que no pertenece exclusivamente a uno de ellos. Allí viven
Axios, la sesión, el tema, la barra de navegación y utilidades comunes.

`app` conecta las partes: registra las rutas, aplica los providers globales y
define qué pantalla se muestra. Las páginas no escriben URLs del backend; usan
el servicio de su módulo, y este utiliza `shared/api/api.ts`.

---

## ⚙️ 3. Configuración e Instalación

### Requisitos Previos
- **Node.js**: `v20.x` o superior.
- **npm**: `v9.x` o superior.
- **Backend Activo**: `GYM_BACK` ejecutándose en `http://localhost:3000`.

### Variables de Entorno

Crear el archivo `.env` en la raíz de `GYM_FRONT`:
```env
VITE_API_URL=http://localhost:3000
```

### Comandos Principales

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Iniciar servidor de desarrollo (con HMR)
npm run dev

# 3. Ejecutar suite de pruebas automatizadas (Vitest + Testing Library)
npm run test

# 4. Compilar para producción (validación de tipos estricta y bundle optimizado)
npm run build

# 5. Previsualizar el paquete de producción localmente
npm run preview
```

---

## 🧪 4. Testing y Calidad de Código (QA)

El frontend cuenta con una suite integral de **116 tests automatizados (30 unitarios y de componentes + 86 tests End-to-End en navegador real)** con **100% de tests exitosos (0 fallos)** utilizando **Vitest**, **Testing Library React**, **JSDOM** y **Playwright**.

### 🚀 Ejecución de Pruebas

```bash
# 1. Ejecutar solo tests unitarios y de componentes (30 tests)
npm test

# 2. Ejecutar tests End-to-End (E2E) con Playwright en Chromium (86 tests)
npm run test:e2e

# 3. Listar todos los tests E2E reconocidos
npx playwright test --list

# 4. Modo interactivo visual de Playwright (UI Mode)
npx playwright test --ui
```

### ⚡ Ejecución Unificada de Todo el Sistema (Front + Back + E2E)
Desde la **carpeta raíz del proyecto (`GYM`)**:

```bash
# Ejecutar los 256 tests de la plataforma completa en una sola corrida
npm run test:all

# O usando el script con salida formateada a color en PowerShell:
.\test-all.ps1

# O desde la consola clásica de Windows (CMD):
test-all.bat
```

> **Nota:** La configuración de Playwright en `playwright.config.ts` levanta automáticamente el backend (puerto 3000) y el servidor de desarrollo Vite (puerto 5173) en caso de que no se encuentren ya iniciados.

---

### Cobertura de las Suites del Frontend

#### 1. Tests Unitarios y de Componentes (`src/**/*.test.{ts,tsx}` — 30 tests)
- **`ExerciseDetailModal.test.tsx` (5 tests)**:
  - Renderizado de reproductor `iframe` embebido para videos de YouTube válidos.
  - Mensaje amigable y badge visual de *"Sin video asignado"* cuando `videoUrl` es `null` o vacío `""`.
  - Comportamiento de cierre con botón de cruz y tecla `Escape`.
  - Integración del muñeco anatómico interactivo con iluminación biomecánica de grupos musculares.
- **`auth.service.test.ts` (6 tests)**:
  - Almacenamiento y recuperación de token JWT en `localStorage`.
  - Manejo de roles, usuario activo y limpieza segura en logout.
- **`training.service.test.ts` (6 tests)**:
  - Peticiones REST a planes de entrenamiento, sesiones, rutinas y plantillas (`/api/v1/templates`).
- **`admin.service.test.ts` (5 tests)**:
  - Consulta de usuarios por administrador, alta con rol y baja definitiva.
- **`progress.service.test.ts` (5 tests)**:
  - Petición al endpoint ejecutivo `/api/v1/analytics/admin/overview` con parámetros de filtro (`period`, `trainerId`, `adherenceRange`), curvas de fuerza y reportes de adherencia.
- **`exercises.service.test.ts` (3 tests)**:
  - Búsqueda, taxonomía muscular y envío explícito de `videoUrl: null` al eliminar un video.

#### 2. Tests End-to-End (E2E) con Playwright (`e2e/*.spec.ts` — 86 tests)
- **`01-auth-session.spec.ts` (12 tests)**: Renderizado de login, botones de acceso rápido 1-Click (Admin, Entrenador, Atleta), inicio de sesión manual, validación de contraseñas incorrectas y correos inexistentes, cierre de sesión, redirección basada en roles y persistencia de sesión tras recarga (F5).
- **`02-admin-users.spec.ts` (12 tests)**: Navegación al panel administrativo, tabla de usuarios, filtros y búsqueda en vivo, modal de alta, registro de Entrenador y Atleta, validación de correo duplicado, modal de confirmación de baja definitiva y cancelación.
- **`03-trainer-catalog-multimedia.spec.ts` (20 tests)**: Tarjetas del catálogo de ejercicios, filtros por grupo muscular, buscador reactivo, modal de creación de ejercicio, inserción de chips musculares con `Enter` y `,`, URLs de YouTube estándar, Shorts y MP4, badge «Sin video», modal biomecánico con figura anatómica y cierre con `Escape`.
- **`04-trainer-plans-overlap.spec.ts` (16 tests)**: Diseñador de microciclos `/trainer/assign-plan`, selector de alumnos con avatar, fechas de inicio y fin, configuración de frecuencia y turnos, acordeón colapsable de historial, badges de estado (`En Curso`, `Programado`, `Finalizado`), detección visual de superposición de fechas (`"rango de fechas"`), carga de planes históricos en modo edición y biblioteca de plantillas.
- **`05-athlete-workout-execution.spec.ts` (14 tests)**: Dashboard del atleta `/`, banner de microciclo activo, selector de jornadas diarias, lista de ejercicios con cadencia/tempo y notas, tabla de series interactivas, edición de pesos y repeticiones reales, casillas de serie completada (`row-completed`), temporizador flotante de descansos (Rest Timer), presets de tiempo y estructura de celebración de Récord Personal (PR).
- **`06-progress-executive-theme.spec.ts` (12 tests)**: Toggle de modo oscuro/claro en Navbar, alternancia de `data-theme="light"` / `"dark"`, persistencia tras navegación, modal de pesaje corporal con validación de peso positivo, gráficos de evolución de fuerza del atleta, Dashboard Ejecutivo CAR del administrador con bloques KPI, filtros temporales (`30d`, `90d`), filtro por semáforo de adherencia (verde/amarillo/rojo) y buscador de alumnos.

---

## 🔑 5. Credenciales Demo para Pruebas Rápidas

La pantalla de login incluye accesos directos con 1 solo clic:

| Rol | Correo Electrónico | Contraseña | Vistas Accesibles |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@gym.com` | `admin123` | Gestión de Usuarios (`/admin/users`) y **Dashboard Ejecutivo CAR** (`/progress`) |
| **ENTRENADOR** | `entrenador@gym.com` | `admin123` | Asignar Planes e Historial (`/trainer/assign-plan`), Catálogo Biomecánico (`/exercises`) y Analítica de Alumnos |
| **ATLETA 1** | `atleta@gym.com` | `atleta123` | Rutina activa diaria (`/`), registro interactivo de series/RPE, pesajes y gráficos personales |
| **ATLETA 2** | `marcos@gym.com` | `atleta123` | Atleta disponible para asignación de nuevos microciclos |
