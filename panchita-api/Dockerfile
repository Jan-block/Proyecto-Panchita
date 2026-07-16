# =============================================================
# Dockerfile - Panchita API (Spring Boot)
# Build multi-stage: primero compila con Maven, luego copia
# solo el .jar final a una imagen liviana de Java para correrlo.
# =============================================================

# ---------- Etapa 1: Build ----------
FROM maven:3.9-eclipse-temurin-11 AS build
WORKDIR /app

# Copiamos primero solo el pom.xml para aprovechar el cache de Docker:
# si no cambian las dependencias, no las vuelve a descargar en cada build.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Ahora copiamos el resto del código y compilamos
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---------- Etapa 2: Runtime ----------
FROM eclipse-temurin:11-jre-jammy
WORKDIR /app

# Copiamos únicamente el .jar generado en la etapa anterior
COPY --from=build /app/target/panchita-api-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]