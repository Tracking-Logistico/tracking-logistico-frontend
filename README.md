# LogisTrack — Frontend

Frontend React/Vite. Se integra con la API por `VITE_API_URL` y presenta flujos separados para Cliente, Operador y Conductor.

## Docker con PostgreSQL y API

Extraiga ambos ZIP en la misma carpeta padre y ejecute desde el backend:

```bash
cd tracking-logistico-backend-main
docker compose up --build
```

Frontend: http://localhost:5173. API: http://localhost:8080. Bandeja de correos de prueba: http://localhost:8025.

## Desarrollo sin Docker para el frontend

```bash
npm ci
npm run dev
```

Copie `.env.example` como `.env` si necesita fijar la URL del backend: `VITE_API_URL=http://localhost:8080/api/v1`.

## Netlify

Configure en el build `VITE_API_URL` con la URL pública del servicio de Render terminada en `/api/v1`. En local Docker usa el servidor Vite; Netlify usa el build `npm run build`. Los textos de términos y política incluidos en este bloque son demostrativos: la entidad responsable debe aprobar los documentos definitivos antes de aceptar registros reales.

## Bloque 3 — panel de rutas

El operador puede seleccionar varios pedidos, comparar ocupación real de los conductores y reasignar una parada con motivo e historial; el conductor ve su propia ruta con dirección/destinatario/prioridad y avisos internos leídos o pendientes. No se ingresan IDs técnicos a mano. Requiere backend bloque 3 (migración Flyway V13). Las credenciales y el despliegue Docker siguen siendo los del bloque anterior.

## Bloque 4

- El panel ahora usa destinos reales por rol (`/panel/cliente`, `/panel/operador`, `/panel/conductor`).
- Renovación automática de sesión ante HTTP 401, con control de solicitudes simultáneas y un solo reintento. Si el refresh falla, cierra la sesión.
- Cierre local por inactividad a los 30 minutos para Cliente y 15 minutos para roles internos; backend mantiene la validación de autoridad.
- Despachos conserva pedidos al pasar por `CREADO`, `RECIBIDO_EN_ORIGEN` y `EN_TRANSITO`, con seguimiento y PDF de etiqueta.
- En localhost y sin `VITE_API_URL`, la API apunta a `localhost:8080`, no a producción. En Netlify configura `VITE_API_URL` para el backend público con `/api/v1`.

Este ZIP sustituye por completo el frontend del bloque 3, sin requerir cambios en las contraseñas actuales de Docker ni Render.
