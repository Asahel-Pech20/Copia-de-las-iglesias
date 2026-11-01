# F1 · Tareas 01 — Base del frontend y componentes compartidos

### F1-01 · Proyecto Vite y herramientas
- **Fase:** 0 · **Tamaño:** S · **Depende de:** B1-01
- React + Vite + TS strict, alias `@/`, ESLint/Prettier del monorepo, Vitest + Testing Library, `.env.example`.
- **Criterios de aceptación**
  - [x] `pnpm --filter frontend dev` abre en `:5173`; `test` y `typecheck` pasan.

### F1-02 · Tokens de diseño, Tailwind y shadcn/ui
- **Fase:** 0 · **Tamaño:** M · **Depende de:** F1-01
- Variables CSS de `AGENTS.md §4` (claro/oscuro), fuente Inter, `tailwind.config` con los tokens, instalación de shadcn/ui (Button, Input, Select, Dialog, Sheet, DropdownMenu, Tabs, Toast/Sonner, Checkbox, Switch, Popover, Calendar, Table, Card, Badge, Skeleton, Tooltip).
- **Criterios de aceptación**
  - [x] Página `/_dev/ui` (solo en desarrollo) que muestra todos los componentes en claro y oscuro.
  - [x] Contraste AA verificado en los pares texto/fondo principales.

### F1-03 · Layout principal
- **Fase:** 0 · **Tamaño:** M · **Depende de:** F1-02
- `AppLayout`: barra lateral 240 px (logo + nombre de la iglesia, menú), barra superior (usuario, rol, menú de cuenta, alternar tema), contenido. En móvil, menú en `Sheet`. `app/menu.ts` con entradas `{ etiqueta, ruta, icono, permiso }` filtradas por permisos.
- **Criterios de aceptación**
  - [x] Funciona en 360 px sin scroll horizontal de página.
  - [x] Navegable con teclado; ítem activo resaltado.

### F1-04 · Cliente API y TanStack Query
- **Fase:** 0 · **Tamaño:** M · **Depende de:** F1-01
- `lib/api.ts`: Axios con `baseURL = VITE_API_URL`, `withCredentials`, interceptor que agrega Bearer y, ante `TOKEN_EXPIRED`, llama una sola vez a `/auth/refresh` (cola de peticiones en espera) y reintenta; si falla, cierra sesión. Normaliza errores a `ErrorApi`. `queryClient` con `retry` solo en errores de red.
- **Criterios de aceptación**
  - [x] Prueba: dos peticiones simultáneas con token expirado provocan **un** refresh.

### F1-05 · MSW y tipos comunes
- **Fase:** 0 · **Tamaño:** S · **Depende de:** F1-04
- MSW activado con `VITE_USE_MOCKS=true`. Estructura `mocks/handlers/<modulo>.ts` (cada dueño escribe los suyos) y `mocks/datos/`. Tipos `RespuestaLista<T>`, `RespuestaObjeto<T>`, `ErrorApi`, `Rol`, `Permiso`.
- **Criterios de aceptación**
  - [x] Handler de ejemplo funcionando en navegador y en pruebas.

### F1-06 · Componentes compartidos de datos
- **Fase:** 1 · **Tamaño:** L · **Depende de:** F1-02
- `PageHeader`, `DataTable` (columnas tipadas, orden, selección opcional, vista tarjeta en móvil), `Paginacion`, `FiltrosBar`, `CampoBusqueda` (debounce 300 ms), `EmptyState`, `ErrorState`, `SkeletonTabla`, `StatCard`, `BadgeEstado`, `DateRangePicker`. Hook `useFiltrosURL()` que sincroniza filtros con la query string.
- **Criterios de aceptación**
  - [x] Cada componente con prueba básica y ejemplo en `/_dev/ui`.
  - [x] Props documentadas con JSDoc.

### F1-07 · Componentes de formulario y feedback
- **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-06
- `FormField` (label, error con `aria-describedby`, hint), `SelectEnum`, `CampoFecha`, `CampoMoneda` (formato con la moneda configurada), `ConfirmDialog` (con campo de motivo opcional y obligatorio), toasts estándar. `lib/formato.ts` (`formatearFecha`, `formatearFechaHora`, `formatearMoneda`, etiquetas de enums en español).
- **Criterios de aceptación**
  - [x] `ConfirmDialog` con motivo no permite confirmar con motivo vacío.
  - [x] Pruebas de `lib/formato.ts`.
