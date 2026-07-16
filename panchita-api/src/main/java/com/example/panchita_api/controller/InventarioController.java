package com.example.panchita_api.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.panchita_api.dto.MovimientoRequestDTO;
import com.example.panchita_api.dto.ProductoRequestDTO;
import com.example.panchita_api.model.MovimientoInventario;
import com.example.panchita_api.model.Producto;
import com.example.panchita_api.repository.MovimientoInventarioRepository;
import com.example.panchita_api.repository.ProductoRepository;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "http://localhost:5173")
public class InventarioController {

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private MovimientoInventarioRepository movimientoRepo;

    // ── LISTAR PRODUCTOS ──
    @GetMapping
    public ResponseEntity<List<Producto>> listar() {
        return ResponseEntity.ok(productoRepo.findAll());
    }

    // ── REGISTRAR PRODUCTO NUEVO (código, vencimiento, cantidad, almacenaje) ──
    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody ProductoRequestDTO dto) {
        if (dto.getCodigoProducto() == null || dto.getCodigoProducto().isBlank()) {
            return ResponseEntity.badRequest().body("El código de producto es obligatorio.");
        }
        if (productoRepo.existsByCodigoProducto(dto.getCodigoProducto())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un producto registrado con el código " + dto.getCodigoProducto());
        }

        Producto producto = new Producto();
        producto.setCodigoProducto(dto.getCodigoProducto());
        producto.setNombre(dto.getNombre());
        producto.setFechaVencimiento(dto.getFechaVencimiento());
        producto.setCantidad(dto.getCantidad() != null ? dto.getCantidad() : BigDecimal.ZERO);
        producto.setUnidadMedida(dto.getUnidadMedida());
        producto.setLugarAlmacenaje(dto.getLugarAlmacenaje());
        producto.setStockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : BigDecimal.ZERO);
        producto.setState(1);

        Producto guardado = productoRepo.save(producto);

        // Si al crearlo ya se le da una cantidad inicial mayor a 0, queda
        // registrado como el primer movimiento de "COMPRA" para mantener
        // el historial completo desde el origen del stock.
        if (guardado.getCantidad() != null && guardado.getCantidad().compareTo(BigDecimal.ZERO) > 0) {
            registrarMovimiento(guardado, "COMPRA", guardado.getCantidad(), "Stock inicial de registro");
        }

        return ResponseEntity.ok(guardado);
    }

    // ── ACTUALIZAR DATOS MAESTROS (no toca la cantidad/stock) ──
    @PutMapping
    public ResponseEntity<Producto> actualizar(@RequestParam Integer id, @RequestBody ProductoRequestDTO dto) {
        Producto existente = productoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));

        existente.setCodigoProducto(dto.getCodigoProducto());
        existente.setNombre(dto.getNombre());
        existente.setFechaVencimiento(dto.getFechaVencimiento());
        existente.setUnidadMedida(dto.getUnidadMedida());
        existente.setLugarAlmacenaje(dto.getLugarAlmacenaje());
        if (dto.getStockMinimo() != null) {
            existente.setStockMinimo(dto.getStockMinimo());
        }

        return ResponseEntity.ok(productoRepo.save(existente));
    }

    // ── ACTIVAR / DESACTIVAR PRODUCTO ──
    @PatchMapping("/estado")
    public ResponseEntity<Producto> actualizarEstado(@RequestParam Integer id) {
        Producto existente = productoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
        existente.setState(existente.getState() == 1 ? 0 : 1);
        return ResponseEntity.ok(productoRepo.save(existente));
    }

    // ── REGISTRAR COMPRA: suma al stock automáticamente ──
    @PostMapping("/compra")
    public ResponseEntity<?> registrarCompra(@RequestBody MovimientoRequestDTO dto) {
        if (dto.getCantidad() == null || dto.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("La cantidad de la compra debe ser mayor a 0.");
        }

        Producto producto = productoRepo.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + dto.getProductoId()));

        producto.setCantidad(producto.getCantidad().add(dto.getCantidad()));
        Producto actualizado = productoRepo.save(producto);

        registrarMovimiento(actualizado, "COMPRA", dto.getCantidad(), dto.getObservacion());

        return ResponseEntity.ok(actualizado);
    }

    // ── REGISTRAR CONSUMO DE COCINA: resta del stock automáticamente ──
    @PostMapping("/consumo")
    public ResponseEntity<?> registrarConsumo(@RequestBody MovimientoRequestDTO dto) {
        if (dto.getCantidad() == null || dto.getCantidad().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("La cantidad del consumo debe ser mayor a 0.");
        }

        Producto producto = productoRepo.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + dto.getProductoId()));

        if (producto.getCantidad().compareTo(dto.getCantidad()) < 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Stock insuficiente. Disponible: " + producto.getCantidad() + " " + producto.getUnidadMedida());
        }

        producto.setCantidad(producto.getCantidad().subtract(dto.getCantidad()));
        Producto actualizado = productoRepo.save(producto);

        registrarMovimiento(actualizado, "CONSUMO", dto.getCantidad(), dto.getObservacion());

        return ResponseEntity.ok(actualizado);
    }

    // ── HISTORIAL DE MOVIMIENTOS (general o filtrado por producto) ──
    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventario>> listarMovimientos(
            @RequestParam(required = false) Integer productoId) {
        if (productoId != null) {
            return ResponseEntity.ok(movimientoRepo.findByProducto_IdOrderByFechaDesc(productoId));
        }
        return ResponseEntity.ok(movimientoRepo.findAllByOrderByFechaDesc());
    }

    private void registrarMovimiento(Producto producto, String tipo, BigDecimal cantidad, String observacion) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setTipo(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setObservacion(observacion);
        movimiento.setFecha(LocalDateTime.now());
        movimientoRepo.save(movimiento);
    }
}
