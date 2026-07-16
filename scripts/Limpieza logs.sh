#!/bin/bash
# =============================================================
# limpieza-logs.sh
# Mantenimiento de los logs generados por Logback
# (panchita-api/logs/panchita.*.log).
#
# Logback ya rota los archivos por día (ver logback-spring.xml,
# maxHistory=7), pero este script agrega una segunda capa de
# limpieza y comprime logs antiguos para ahorrar espacio en
# el servidor de despliegue.
# =============================================================

LOG_DIR="/opt/panchita/logs"          # carpeta de logs en el servidor
DIAS_COMPRESION=3     # comprimir logs con más de 3 días
DIAS_ELIMINACION=30   # eliminar comprimidos con más de 30 días
LOG_FILE="/var/log/panchita/maintenance.log"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$LOG_FILE"
}

log "Iniciando mantenimiento de logs..."

# Comprimir logs antiguos no comprimidos
find "$LOG_DIR" -name "*.log" -mtime +$DIAS_COMPRESION -exec gzip {} \;
log "Logs con más de $DIAS_COMPRESION días comprimidos."

# Eliminar logs comprimidos muy antiguos
find "$LOG_DIR" -name "*.log.gz" -mtime +$DIAS_ELIMINACION -exec rm {} \;
log "Logs comprimidos con más de $DIAS_ELIMINACION días eliminados."

log "Mantenimiento de logs finalizado."
exit 0