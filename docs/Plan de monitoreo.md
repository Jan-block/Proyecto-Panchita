# Plan de Monitoreo — Proyecto Panchita

## 1. Objetivo
Detectar de forma oportuna problemas de disponibilidad, rendimiento o
errores en el sistema Panchita (backend Spring Boot + MySQL), antes de que
afecten a los usuarios finales.

## 2. Herramientas utilizadas

| Herramienta | Uso |
|---|---|
| Spring Boot Actuator | Expone `/actuator/health`, `/actuator/info`, `/actuator/metrics` |
| Logback | Registro estructurado de eventos y errores, con rotación diaria |
| `check-health.sh` | Script de verificación periódica del endpoint de salud |

## 3. Métricas y endpoints monitoreados

| Endpoint / Métrica | Qué indica | Acceso |
|---|---|---|
| `/actuator/health` | Si la aplicación y la conexión a MySQL están activas | Público |
| `/actuator/info` | Versión y datos generales de la app | Público |
| `/actuator/metrics` | Uso de memoria, threads, tiempos de respuesta HTTP | Solo rol ADMINISTRADOR |
| Logs (`logs/panchita.log`) | Errores de aplicación, excepciones, accesos denegados | Servidor |

## 4. Frecuencia de revisión

| Tarea | Frecuencia |
|---|---|
| Ejecución automática de `check-health.sh` (cron) | Cada 10 minutos |
| Revisión manual de `/actuator/metrics` | Diaria |
| Revisión de logs de errores | Diaria |
| Revisión general de tendencias (memoria, tiempos de respuesta) | Semanal |

## 5. Cron job sugerido

```
*/10 * * * * /opt/panchita/scripts/check-health.sh
```
Se agrega a `crontab-panchita.txt` junto con las tareas de mantenimiento.

## 6. Procedimiento ante una alerta

1. `check-health.sh` registra en `health-check.log` cuando `/actuator/health`
   no responde con HTTP 200.
2. El encargado de despliegue revisa `logs/panchita.log` para identificar la
   causa (caída de MySQL, error de aplicación, saturación de memoria).
3. Si es un problema de base de datos: verificar que el servicio MySQL esté
   activo y que las credenciales sigan siendo válidas.
4. Si es un problema de la aplicación: reiniciar el servicio y documentar el
   incidente (fecha, causa, solución) para referencia futura.
5. Si el incidente compromete datos, aplicar el procedimiento de
   restauración descrito en el Plan de Mantenimiento.

## 7. Responsables

| Actividad | Frecuencia | Responsable |
|---|---|---|
| Monitoreo automático (cron) | Continuo | Sistema (automático) |
| Revisión de métricas y logs | Diaria | Encargado de despliegue |
| Atención de incidentes | Cuando ocurran | Equipo completo |

## 8. Mejoras futuras
- Integrar un dashboard visual (Grafana + Prometheus) sobre las métricas de
  Actuator en lugar de revisión manual.
- Enviar alertas automáticas por Slack/correo cuando `check-health.sh`
  detecte una caída, en vez de solo registrar en log.