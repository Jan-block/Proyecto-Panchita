package com.example.panchita_api.controller;

import com.example.panchita_api.model.Reserva;
import com.example.panchita_api.repository.ReservaRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:5173")
public class ReporteController {

    private static final Logger log = LoggerFactory.getLogger(ReporteController.class);

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping("/reservas/excel")
    public ResponseEntity<byte[]> exportarReservasExcel() {
        try {
            List<Reserva> reservas = reservaRepository.findAll();

            // ✅ APACHE POI: crea el archivo Excel
            XSSFWorkbook workbook = new XSSFWorkbook();
            XSSFSheet sheet = workbook.createSheet("Reservas Panchita");

            // ── Estilo encabezado (fondo dorado) ──────────────────────
            XSSFCellStyle estiloHeader = workbook.createCellStyle();
            XSSFFont fuenteHeader = workbook.createFont();
            fuenteHeader.setBold(true);
            fuenteHeader.setColor(IndexedColors.WHITE.getIndex());
            estiloHeader.setFont(fuenteHeader);
            estiloHeader.setFillForegroundColor(new XSSFColor(new byte[]{(byte)184, (byte)134, (byte)11}, null));
            estiloHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            estiloHeader.setAlignment(HorizontalAlignment.CENTER);

            // ── Título principal ───────────────────────────────────────
            Row titulo = sheet.createRow(0);
            Cell celdaTitulo = titulo.createCell(0);
            celdaTitulo.setCellValue("REPORTE DE RESERVAS - RESTAURANTE PANCHITA");
            XSSFCellStyle estiloTitulo = workbook.createCellStyle();
            XSSFFont fuenteTitulo = workbook.createFont();
            fuenteTitulo.setBold(true);
            fuenteTitulo.setFontHeightInPoints((short) 14);
            estiloTitulo.setFont(fuenteTitulo);
            celdaTitulo.setCellStyle(estiloTitulo);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

            // ── Fecha de generación ────────────────────────────────────
            Row fechaRow = sheet.createRow(1);
            fechaRow.createCell(0).setCellValue("Generado: " + LocalDate.now().toString());
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 6));

            // ── Encabezados de columnas ────────────────────────────────
            Row header = sheet.createRow(3);
            String[] columnas = {"ID", "Cliente", "Fecha", "Hora", "Personas", "Estado", "Precio (S/)"};
            for (int i = 0; i < columnas.length; i++) {
                Cell celda = header.createCell(i);
                celda.setCellValue(columnas[i]);
                celda.setCellStyle(estiloHeader);
            }

            // ── Datos ──────────────────────────────────────────────────
            int fila = 4;
            for (Reserva r : reservas) {
                Row row = sheet.createRow(fila++);
                row.createCell(0).setCellValue(r.getId());
                row.createCell(1).setCellValue(r.getUsuario() != null ? r.getUsuario().getNombre() : "Sin nombre");
                row.createCell(2).setCellValue(r.getFecha()         != null ? r.getFecha().toString()  : "");
                row.createCell(3).setCellValue(r.getHora()          != null ? r.getHora().toString()   : "");
                row.createCell(4).setCellValue(r.getCapacidad() != null ? r.getCapacidad() : 0);
                row.createCell(5).setCellValue(r.getEstadoReserva());
                row.createCell(6).setCellValue(r.getPrecio()        != null ? r.getPrecio().doubleValue() : 0);
            }

            // ── Autoajuste de columnas ─────────────────────────────────
            for (int i = 0; i <= 6; i++) sheet.autoSizeColumn(i);

            // ── Convierte a bytes y envía ──────────────────────────────
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            log.info("Reporte Excel generado con {} reservas", reservas.size());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reservas_panchita.xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());

        } catch (Exception e) {
            log.error("Error al generar reporte Excel", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}