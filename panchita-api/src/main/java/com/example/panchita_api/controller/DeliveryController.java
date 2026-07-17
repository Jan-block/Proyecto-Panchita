package com.example.panchita_api.controller;

import com.example.panchita_api.dto.ItemPedidoDTO;
import com.example.panchita_api.dto.PedidoDeliveryRequestDTO;
import com.example.panchita_api.model.DetallePedidoDelivery;
import com.example.panchita_api.model.Pedido_delivery;
import com.example.panchita_api.model.Plato;
import com.example.panchita_api.repository.PedidoDeliveryRepository;
import com.example.panchita_api.repository.PlatoRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final PedidoDeliveryRepository pedidoRepository;
    private final PlatoRepository platoRepository;

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "Pendiente",
            "Preparando",
            "En camino",
            "Entregado",
            "Cancelado"
    );

    public DeliveryController(PedidoDeliveryRepository pedidoRepository, PlatoRepository platoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.platoRepository = platoRepository;
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
     * Registrar un nuevo pedido, junto con el detalle de platos vendidos
     * (necesario para poder calcular después los platos más vendidos).
     */
    @PostMapping
    public ResponseEntity<?> registrarPedido(
            @RequestBody PedidoDeliveryRequestDTO datos) {

        if (datos.getNombreCliente() == null
                || datos.getNombreCliente().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "El nombre del cliente es obligatorio"));
        }

        if (datos.getDireccionEntrega() == null
                || datos.getDireccionEntrega().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "La dirección de entrega es obligatoria"));
        }

        if (datos.getTotal() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje",
                            "El total del pedido es obligatorio"));
        }

        Pedido_delivery pedido = new Pedido_delivery();
        pedido.setUsuarioId(datos.getUsuarioId());
        pedido.setNombreCliente(datos.getNombreCliente());
        pedido.setTelefonoContacto(datos.getTelefonoContacto());
        pedido.setDireccionEntrega(datos.getDireccionEntrega());
        pedido.setReferencia(datos.getReferencia());
        pedido.setDistrito(datos.getDistrito());
        pedido.setSubtotal(datos.getSubtotal());
        pedido.setCostoEnvio(datos.getCostoEnvio());
        pedido.setDescuento(datos.getDescuento());
        pedido.setTotal(datos.getTotal());
        pedido.setMetodoPago(datos.getMetodoPago());
        pedido.setEstado(
                (datos.getEstado() == null || datos.getEstado().trim().isEmpty())
                        ? "Pendiente" : datos.getEstado()
        );

        List<DetallePedidoDelivery> detalles = new ArrayList<>();
        if (datos.getItems() != null) {
            for (ItemPedidoDTO itemDto : datos.getItems()) {
                if (itemDto.getPlatoId() == null) continue;

                Plato plato = platoRepository.findById(itemDto.getPlatoId())
                        .orElseThrow(() -> new RuntimeException(
                                "Plato no encontrado con id: " + itemDto.getPlatoId()));

                DetallePedidoDelivery detalle = new DetallePedidoDelivery();
                detalle.setPedido(pedido);
                detalle.setPlato(plato);
                detalle.setCantidad(itemDto.getCantidad());
                detalle.setPrecioUnitario(itemDto.getPrecioUnitario());
                detalles.add(detalle);
            }
        }
        pedido.setDetalles(detalles);

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