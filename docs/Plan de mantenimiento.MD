# Plan de Mantenimiento — Proyecto Panchita

## 1. Objetivo
Garantizar la continuidad, integridad y disponibilidad del sistema de reservas
Panchita (backend Spring Boot + MySQL, frontend React) mediante tareas
programadas de respaldo, limpieza y verificación periódica.

## 2. Alcance
Este plan cubre:
- Respaldo (backup) de la base de datos `restaurante`.
- Rotación y limpieza de logs de la aplicación.
- Verificación periódica del estado del sistema.
- Procedimiento de restauración ante fallas.

## 3. Tareas programadas (Cron Jobs)

| Tarea | Script | Frecuencia | Horario |
|---|---|---|---|
| Backup de base de datos | `backup-panchita.sh` | Diaria | 2:00 a.m. |
| Limpieza y compresión de logs | `limpieza-logs.sh` | Semanal | Domingos, 1:00 a.m. |

La configuración de cron se encuentra en `crontab-panchita.txt`.

## 4. Backups

- **Herramienta:** `mysqldump`, comprimido con `gzip`.
- **Contenido:** dump completo de la base de datos `restaurante`.
- **Ubicación:** `/var/backups/panchita/`.
- **Retención:** 14 días. Backups más antiguos se eliminan automáticamente.
- **Seguridad:** la contraseña de la base de datos se lee de la variable de
  entorno `PANCHITA_DB_PASSWORD` (nunca se escribe en texto plano en el
  script ni en el repositorio).

### Procedimiento de restauración
```bash
gunzip < panchita_backup_2026-07-15_02-00-00.sql.gz | mysql -u root -p restaurante
```

## 5. Gestión de logs

La aplicación ya usa **Logback** (`logback-spring.xml`) con rotación diaria y
`maxHistory=7`. El script `limpieza-logs.sh` agrega una segunda capa:
- Comprime logs con más de 3 días.
- Elimina comprimidos con más de 30 días.

Esto evita que el disco del servidor se llene en despliegues de largo plazo.

## 6. Configuración inicial (una sola vez, en el servidor)

```bash
# Definir la contraseña de BD como variable de entorno permanente
echo 'export PANCHITA_DB_PASSWORD="********"' >> /etc/profile.d/panchita.sh

# Copiar scripts al servidor
mkdir -p /opt/panchita/scripts
cp backup-panchita.sh limpieza-logs.sh /opt/panchita/scripts/
chmod +x /opt/panchita/scripts/*.sh

# Instalar el cron
crontab crontab-panchita.txt
```

## 7. Verificación y responsables

| Actividad | Frecuencia | Responsable |
|---|---|---|
| Revisar que el backup diario se generó correctamente (log en `/var/log/panchita/backup.log`) | Diaria | Encargado de despliegue |
| Probar restauración de un backup en un entorno de prueba | Mensual | Equipo completo |
| Revisar espacio en disco del servidor | Semanal | Encargado de despliegue |
| Revisar `/actuator/health` y métricas | Diaria (ver Plan de Monitoreo) | Equipo completo |

## 8. Mejoras futuras
- Subir los backups a almacenamiento externo (ej. S3, Google Drive) para
  evitar pérdida total si el servidor falla.
- Alertas automáticas (correo/Slack) si un backup o la limpieza de logs falla.