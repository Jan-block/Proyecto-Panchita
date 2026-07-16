# Plan de Despliegue — Proyecto Panchita

## 1. Objetivo
Documentar cómo se construye y despliega la aplicación Panchita (backend
Spring Boot + MySQL), tanto en un entorno local reproducible (Docker) como
en la nube con una URL pública accesible.

## 2. Build con Maven

El backend se empaqueta como un `.jar` ejecutable usando el plugin
`spring-boot-maven-plugin` ya configurado en `pom.xml`:

```bash
cd panchita-api
./mvnw clean package -DskipTests
```

Esto genera `target/panchita-api-0.0.1-SNAPSHOT.jar`, que puede ejecutarse
directamente con:

```bash
java -jar target/panchita-api-0.0.1-SNAPSHOT.jar
```

Este `.jar` es exactamente lo que se empaqueta dentro del contenedor Docker
(ver sección 3).

---

## 3. Opción A — Despliegue local con Docker

### 3.1 Arquitectura del despliegue
Se usan dos contenedores conectados en una misma red Docker:
- **`panchita-backend`**: la aplicación Spring Boot (construida con un
  Dockerfile multi-stage: primero compila con Maven, luego corre solo el
  `.jar` sobre una imagen liviana de Java).
- **`panchita-mysql`**: la base de datos MySQL 8, con un volumen para que
  los datos persistan aunque se reinicie el contenedor.

### 3.2 Archivos involucrados
- `panchita-api/Dockerfile` — build multi-stage del backend.
- `docker-compose.yml` (raíz del repo) — orquesta backend + MySQL juntos.
- `.env.example` — plantilla de variables de entorno (contraseñas, secretos).

### 3.3 Pasos para levantarlo

```bash
# 1. Copiar la plantilla de variables de entorno y completarla
cp .env.example .env
# Editar .env y poner una contraseña real

# 2. Construir y levantar todo
docker compose up --build

# 3. Verificar que responde
curl http://localhost:8080/actuator/health
```

La API queda disponible en `http://localhost:8080` y MySQL en el puerto
`3306`, igual que en desarrollo local, pero ahora corriendo de forma
aislada y reproducible (cualquier compañero de equipo puede levantar el
mismo entorno exacto con un solo comando).

### 3.4 Observaciones levantadas y aplicadas
- **Observación:** las credenciales (contraseña de BD, JWT secret) estaban
  hardcodeadas en `application.properties`.
  **Corrección:** se parametrizaron con variables de entorno
  (`DB_PASSWORD`, `JWT_SECRET`, etc., con valores por defecto solo para
  desarrollo local), y `docker-compose.yml` las inyecta desde `.env`, el
  cual **no** se sube al repositorio (agregado a `.gitignore`).
- **Observación:** la primera vez que el backend arrancaba junto con MySQL
  en Docker, fallaba porque intentaba conectarse antes de que MySQL
  terminara de inicializar.
  **Corrección:** se agregó un `healthcheck` a MySQL y `depends_on` con
  `condition: service_healthy` en el backend, para que espere a que la base
  de datos esté realmente lista.

[ ESPACIO PARA CAPTURA — Despliegue Docker: salida de `docker compose up --build` mostrando ambos contenedores arriba (backend + mysql) ]

[ ESPACIO PARA CAPTURA — Prueba del endpoint `/actuator/health` respondiendo `{"status":"UP"}` desde el contenedor ]

---

## 4. Opción B — Despliegue en la nube (URL pública)

### 4.1 Servicios usados
- **Backend:** [Render](https://render.com) — Web Service con runtime Docker
  (usa el mismo `Dockerfile` del repo, sin cambios).
- **Base de datos:** [Aiven](https://aiven.io) — plan gratuito de MySQL
  administrado (siempre gratis, sin tarjeta de crédito, 1 GB de
  almacenamiento).

### 4.2 Pasos — Base de datos (Aiven)
1. Crear cuenta en Aiven y crear un servicio **MySQL** en el plan Free.
2. Esperar a que el servicio quede "Running".
3. Copiar los datos de conexión: host, puerto, usuario, contraseña y nombre
   de base de datos (Aiven los muestra en la pestaña "Overview" del
   servicio, incluyendo el string de conexión JDBC completo).
4. Aiven exige conexión por SSL — usar el string de conexión tal como lo da
   Aiven (ya incluye los parámetros SSL necesarios).

[ ESPACIO PARA CAPTURA — Panel de Aiven con el servicio MySQL en estado "Running" y los datos de conexión visibles ]

### 4.3 Pasos — Backend (Render)
1. Subir el código a GitHub (ya lo tienen).
2. En Render: **New → Web Service → Build and deploy from a Git
   repository**, conectar el repositorio.
3. Runtime: **Docker** (Render detecta el `Dockerfile` en
   `panchita-api/`, indicar esa carpeta como "Root Directory").
4. En la sección **Environment Variables**, agregar las mismas variables
   que usa `application.properties`, con los valores reales de Aiven:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `ADMIN_SECRET_CODE`
5. Deploy. Render construye la imagen Docker y expone una URL pública tipo
   `https://panchita-api.onrender.com`.

[ ESPACIO PARA CAPTURA — Dashboard de Render mostrando el servicio "Live" con su URL pública ]

[ ESPACIO PARA CAPTURA — Petición desde Thunder Client a la URL pública de Render, ej. `https://panchita-api.onrender.com/actuator/health`, respondiendo 200 ]

### 4.4 Observaciones sobre el plan gratuito
- El plan free de Render **suspende el servicio tras ~15 minutos sin
  tráfico** y tarda unos segundos en "despertar" con la primera petición
  siguiente. Es aceptable para una demo/sustentación, pero no para
  producción real de alto tráfico.
- El plan free de Aiven para MySQL tiene 1 GB de almacenamiento — más que
  suficiente para el volumen de datos de este proyecto.

---

## 5. Conclusión

El proyecto cuenta con dos formas de despliegue documentadas y probadas:
un entorno local reproducible con Docker (ideal para desarrollo en equipo
y para la sustentación sin depender de internet), y un despliegue en la
nube con URL pública real (Render + Aiven), ambos construidos a partir del
mismo `Dockerfile` y usando Maven para el build de la aplicación Java.