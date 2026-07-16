package com.example.panchita_api.controller;

import com.example.panchita_api.model.Pedido_delivery;
import com.example.panchita_api.repository.PedidoDeliveryRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final PedidoDeliveryRepository pedidoRepository;

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "Pendiente",
            "Preparando",
            "En camino",
            "Entregado",
            "Cancelado"
    );

    public DeliveryController(PedidoDeliveryRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    /**
     * Obtener todos los pedidos delivery.
     */
    @GetMapping
    public ResponseEntity<List<Pedido_delivery>> listarPedidos() {
        List<Pedido_delivery> pedidos =
                pedidoRepository.findAllByOrderByCreatedAtDesc();

        return ResponseEntity.ok(pedidos);
    }

    /**
     * Obtener un pedido por su identificador.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido_delivery> obtenerPedido(
            @PathVariable Long id) {

        return pedidoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Registrar un nuevo pedido.
     */
    @PostMapping
    public ResponseEntity<?> registrarPedido(
            @RequestBody Pedido_delivery pedido) {

        if (pedido.getNombreCliente() == null
                || pedido.getNombreCliente().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "El nombre del cliente es obligatorio"));
        }

        if (pedido.getDireccionEntrega() == null
                || pedido.getDireccionEntrega().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "La dirección de entrega es obligatoria"));
        }

        if (pedido.getTotal() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "El total del pedido es obligatorio"));
        }

        if (pedido.getEstado() == null
                || pedido.getEstado().trim().isEmpty()) {
            pedido.setEstado("Pendiente");
        }

        Pedido_delivery guardado = pedidoRepository.save(pedido);

        return ResponseEntity.ok(guardado);
    }

    /**
     * Actualizar el estado del pedido.
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {

        String nuevoEstado = datos.get("estado");

        if (nuevoEstado == null || !ESTADOS_VALIDOS.contains(nuevoEstado)) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensaje", "Estado de pedido no válido")
            );
        }

        Optional<Pedido_delivery> pedidoEncontrado =
                pedidoRepository.findById(id);

        if (pedidoEncontrado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido_delivery pedido = pedidoEncontrado.get();
        pedido.setEstado(nuevoEstado);

        Pedido_delivery actualizado = pedidoRepository.save(pedido);

        return ResponseEntity.ok(actualizado);
    }

    /**
     * Eliminar un pedido.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPedido(
            @PathVariable Long id) {

        if (!pedidoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        pedidoRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of("mensaje", "Pedido eliminado correctamente")
        );
    }
}