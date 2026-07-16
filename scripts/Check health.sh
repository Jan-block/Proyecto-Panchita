#!/bin/bash
# =============================================================
# check-health.sh
# Verifica periódicamente el estado del backend Panchita
# usando Spring Boot Actuator y registra el resultado.
# Pensado para ejecutarse por cron cada 5-10 minutos.
# =============================================================
 
HEALTH_URL="http://localhost:8080/actuator/health"
LOG_FILE="/var/log/panchita/health-check.log"
ADMIN_TOKEN="${PANCHITA_ADMIN_TOKEN}"   # token JWT de un usuario ADMINISTRADOR
 
mkdir -p "$(dirname "$LOG_FILE")"
 
log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$LOG_FILE"
}
 
# /actuator/health es público (ver SecurityConfig), no requiere token
RESPUESTA=$(curl -s -o /tmp/health_body.json -w "%{http_code}" "$HEALTH_URL")
 
if [ "$RESPUESTA" -eq 200 ]; then
    ESTADO=$(grep -o '"status":"[A-Z]*"' /tmp/health_body.json | cut -d':' -f2 | tr -d '"')
    log "OK - HTTP $RESPUESTA - status=$ESTADO"
else
    log "ALERTA - El backend no respondió correctamente (HTTP $RESPUESTA)."
    # Punto de extensión: aquí se puede agregar notificación
    # por correo, Slack o Telegram cuando el sistema esté caído.
    # Ejemplo: curl -s -X POST "$SLACK_WEBHOOK_URL" -d '{"text":"Panchita API caída"}'
fi
 
rm -f /tmp/health_body.json
exit 0
 