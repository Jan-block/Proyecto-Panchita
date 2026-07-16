#!/bin/bash
# =============================================================
# backup-panchita.sh
# Backup automático de la base de datos "restaurante" (MySQL)
# del proyecto Panchita.
#
# Uso manual:   ./backup-panchita.sh
# Uso por cron: ver crontab-panchita.txt
# =============================================================

# ---------- CONFIGURACIÓN ----------
DB_NAME="restaurante"
DB_USER="root"
# La contraseña NUNCA debe quedar escrita aquí en texto plano.
# Se lee de una variable de entorno definida en el sistema
# (ver sección "Configuración inicial" del Plan de Mantenimiento).
DB_PASS="${PANCHITA_DB_PASSWORD}"

BACKUP_DIR="/var/backups/panchita"
LOG_FILE="/var/log/panchita/backup.log"
RETENCION_DIAS=14          # cuántos días se conservan los backups
FECHA=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVO="${BACKUP_DIR}/panchita_backup_${FECHA}.sql.gz"

# ---------- PREPARACIÓN ----------
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "$(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$LOG_FILE"
}

if [ -z "$DB_PASS" ]; then
    log "ERROR: la variable de entorno PANCHITA_DB_PASSWORD no está definida. Abortando."
    exit 1
fi

# ---------- BACKUP ----------
log "Iniciando backup de la base de datos '$DB_NAME'..."

mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$ARCHIVO"

if [ $? -eq 0 ]; then
    TAMANO=$(du -h "$ARCHIVO" | cut -f1)
    log "Backup completado correctamente: $ARCHIVO ($TAMANO)"
else
    log "ERROR: falló la generación del backup."
    exit 1
fi

# ---------- LIMPIEZA (RETENCIÓN) ----------
log "Eliminando backups con más de $RETENCION_DIAS días..."
find "$BACKUP_DIR" -name "panchita_backup_*.sql.gz" -mtime +$RETENCION_DIAS -exec rm {} \;

log "Proceso de backup finalizado."
exit 0