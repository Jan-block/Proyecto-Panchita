package com.example.panchita_api.controller;

import com.example.panchita_api.dto.ConsumoInsumoDTO;
import com.example.panchita_api.dto.PlatoVendidoDTO;
import com.example.panchita_api.dto.ReporteVentasDTO;
import com.example.panchita_api.model.DetallePedidoDelivery;
import com.example.panchita_api.model.MovimientoInventario;
import com.example.panchita_api.model.Pedido_delivery;
import com.example.panchita_api.model.Plato;
import com.example.panchita_api.model.Producto;
import com.example.panchita_api.model.Reserva;
import com.example.panchita_api.repository.DetallePedidoDeliveryRepository;
import com.example.panchita_api.repository.MovimientoInventarioRepository;
import com.example.panchita_api.repository.PedidoDeliveryRepository;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "http://localhost:5173")
public class ReporteController {

    private static final Logger log = LoggerFactory.getLogger(ReporteController.class);

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private PedidoDeliveryRepository pedidoDeliveryRepository;

    @Autowired
    private DetallePedidoDeliveryRepository detalleRepository;

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @GetMapping("/reservas/excel")
    public ResponseEntity<byte[]> exportarReservasExcel() {
        try {
            List<Reserva> reservas = reservaRepository.findAll();

            XSSFWorkbook workbook = new XSSFWorkbook();
            XSSFSheet sheet = workbook.createSheet("Reservas Panchita");  
            XSSFCellStyle estiloHeader = workbook.createCellStyle();
            XSSFFont fuenteHeader = workbook.createFont();
            fuenteHeader.setBold(true);
            fuenteHeader.setColor(IndexedColors.WHITE.getIndex());
            estiloHeader.setFont(fuenteHeader);
            estiloHeader.setFillForegroundColor(new XSSFColor(new byte[]{(byte)184, (byte)134, (byte)11}, null));
            estiloHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            estiloHeader.setAlignment(HorizontalAlignment.CENTER);

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

            Row fechaRow = sheet.createRow(1);
            fechaRow.createCell(0).setCellValue("Generado: " + LocalDate.now().toString());
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 6));

            Row header = sheet.createRow(3);
            String[] columnas = {"ID", "Cliente", "Fecha", "Hora", "Personas", "Estado", "Precio (S/)"};
            for (int i = 0; i < columnas.length; i++) {
                Cell celda = header.createCell(i);
                celda.setCellValue(columnas[i]);
                celda.setCellStyle(estiloHeader);
            }

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

            for (int i = 0; i <= 6; i++) sheet.autoSizeColumn(i);

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

    /**
     * Ventas agrupadas por día, semana o mes (combina Reservas + Delivery).
     * periodo = "diario" (últimos 14 días), "semanal" (últimas 8 semanas) o
     * "mensual" (últimos 6 meses).
     */
    @GetMapping("/ventas")
    public ResponseEntity<List<ReporteVentasDTO>> reporteVentas(
            @RequestParam(defaultValue = "diario") String periodo) {

        LocalDate hoy = LocalDate.now();
        int cantidadBuckets;
        if ("semanal".equalsIgnoreCase(periodo)) {
            cantidadBuckets = 8;
        } else if ("mensual".equalsIgnoreCase(periodo)) {
            cantidadBuckets = 6;
        } else {
            periodo = "diario";
            cantidadBuckets = 14;
        }

        DateTimeFormatter fmtCorto = DateTimeFormatter.ofPattern("dd/MM");
        List<String> etiquetas = new ArrayList<>();
        List<LocalDate[]> rangos = new ArrayList<>();

        if ("mensual".equals(periodo)) {
            for (int i = cantidadBuckets - 1; i >= 0; i--) {
                YearMonth ym = YearMonth.from(hoy.minusMonths(i));
                rangos.add(new LocalDate[]{ym.atDay(1), ym.atEndOfMonth()});
                String mes = ym.getMonth().getDisplayName(TextStyle.FULL, new Locale("es", "ES"));
                etiquetas.add(mes.substring(0, 1).toUpperCase() + mes.substring(1) + " " + ym.getYear());
            }
        } else if ("semanal".equals(periodo)) {
            LocalDate inicioSemanaActual = hoy.with(DayOfWeek.MONDAY);
            for (int i = cantidadBuckets - 1; i >= 0; i--) {
                LocalDate inicio = inicioSemanaActual.minusWeeks(i);
                LocalDate fin = inicio.plusDays(6);
                rangos.add(new LocalDate[]{inicio, fin});
                etiquetas.add("Semana del " + inicio.format(fmtCorto));
            }
        } else {
            for (int i = cantidadBuckets - 1; i >= 0; i--) {
                LocalDate dia = hoy.minusDays(i);
                rangos.add(new LocalDate[]{dia, dia});
                etiquetas.add(dia.format(fmtCorto));
            }
        }

        LocalDate desde = rangos.get(0)[0];
        LocalDate hasta = rangos.get(rangos.size() - 1)[1];

        List<Reserva> reservas = reservaRepository.findByFechaBetween(desde, hasta).stream()
                .filter(r -> !"cancelada".equalsIgnoreCase(r.getEstadoReserva()))
                .collect(Collectors.toList());

        List<Pedido_delivery> pedidos = pedidoDeliveryRepository
                .findByCreatedAtBetween(desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay()).stream()
                .filter(p -> !"Cancelado".equalsIgnoreCase(p.getEstado()))
                .collect(Collectors.toList());

        List<ReporteVentasDTO> resultado = new ArrayList<>();
        for (int i = 0; i < rangos.size(); i++) {
            LocalDate ini = rangos.get(i)[0];
            LocalDate fin = rangos.get(i)[1];

            List<Reserva> reservasBucket = reservas.stream()
                    .filter(r -> !r.getFecha().isBefore(ini) && !r.getFecha().isAfter(fin))
                    .collect(Collectors.toList());

            BigDecimal totalReservas = reservasBucket.stream()
                    .map(r -> r.getPrecio() == null ? BigDecimal.ZERO : r.getPrecio())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<Pedido_delivery> pedidosBucket = pedidos.stream()
                    .filter(p -> {
                        LocalDate f = p.getCreatedAt().toLocalDate();
                        return !f.isBefore(ini) && !f.isAfter(fin);
                    })
                    .collect(Collectors.toList());

            BigDecimal totalDelivery = pedidosBucket.stream()
                    .map(Pedido_delivery::getTotal)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long cantidadPedidos = reservasBucket.size() + pedidosBucket.size();

            resultado.add(new ReporteVentasDTO(
                    etiquetas.get(i),
                    totalReservas,
                    totalDelivery,
                    totalReservas.add(totalDelivery),
                    cantidadPedidos
            ));
        }

        return ResponseEntity.ok(resultado);
    }

    /**
     * Platos más vendidos dentro de un rango de fechas (por defecto, últimos
     * 30 días). Se calcula a partir de los platos guardados en cada pedido
     * de delivery.
     */
    @GetMapping("/platos-mas-vendidos")
    public ResponseEntity<List<PlatoVendidoDTO>> platosMasVendidos(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta,
            @RequestParam(defaultValue = "10") int limite) {

        LocalDate fechaHasta = hasta != null ? LocalDate.parse(hasta) : LocalDate.now();
        LocalDate fechaDesde = desde != null ? LocalDate.parse(desde) : fechaHasta.minusDays(30);

        List<DetallePedidoDelivery> detalles = detalleRepository
                .findByPedido_CreatedAtBetweenAndPedido_EstadoNot(
                        fechaDesde.atStartOfDay(), fechaHasta.plusDays(1).atStartOfDay(), "Cancelado");

        Map<Integer, PlatoVendidoDTO> acumulado = new LinkedHashMap<>();
        for (DetallePedidoDelivery d : detalles) {
            Plato plato = d.getPlato();
            BigDecimal ingresoLinea = d.getPrecioUnitario() != null
                    ? d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad()))
                    : BigDecimal.ZERO;

            PlatoVendidoDTO actual = acumulado.get(plato.getId());
            if (actual == null) {
                acumulado.put(plato.getId(), new PlatoVendidoDTO(
                        plato.getId(), plato.getName(), plato.getCategory(), d.getCantidad(), ingresoLinea));
            } else {
                actual.setCantidadVendida(actual.getCantidadVendida() + d.getCantidad());
                actual.setTotalIngresos(actual.getTotalIngresos().add(ingresoLinea));
            }
        }

        List<PlatoVendidoDTO> resultado = acumulado.values().stream()
                .sorted((a, b) -> Long.compare(b.getCantidadVendida(), a.getCantidadVendida()))
                .limit(limite)
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }

    /**
     * Consumo de insumos (movimientos de tipo CONSUMO) dentro de un rango de
     * fechas, por defecto los últimos 30 días.
     */
    @GetMapping("/consumo-insumos")
    public ResponseEntity<List<ConsumoInsumoDTO>> consumoInsumos(
            @RequestParam(required = false) String desde,
            @RequestParam(required = false) String hasta) {

        LocalDate fechaHasta = hasta != null ? LocalDate.parse(hasta) : LocalDate.now();
        LocalDate fechaDesde = desde != null ? LocalDate.parse(desde) : fechaHasta.minusDays(30);

        List<MovimientoInventario> movimientos = movimientoRepository.findByFechaBetween(
                fechaDesde.atStartOfDay(), fechaHasta.plusDays(1).atStartOfDay());

        Map<Integer, ConsumoInsumoDTO> acumulado = new LinkedHashMap<>();
        for (MovimientoInventario m : movimientos) {
            if (!"CONSUMO".equalsIgnoreCase(m.getTipo())) continue;

            Producto producto = m.getProducto();
            ConsumoInsumoDTO actual = acumulado.get(producto.getId());
            if (actual == null) {
                acumulado.put(producto.getId(), new ConsumoInsumoDTO(
                        producto.getId(), producto.getNombre(), producto.getUnidadMedida(), m.getCantidad()));
            } else {
                actual.setCantidadConsumida(actual.getCantidadConsumida().add(m.getCantidad()));
            }
        }

        List<ConsumoInsumoDTO> resultado = acumulado.values().stream()
                .sorted((a, b) -> b.getCantidadConsumida().compareTo(a.getCantidadConsumida()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }
}