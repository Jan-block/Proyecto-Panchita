package com.example.panchita_api.controller;

import com.example.panchita_api.model.*;
import com.example.panchita_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:5173")
public class ReservaController {

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private MesaRepository mesaRepository;
    @Autowired private ReservaRepository reservaRepository;

    @Transactional
    @PostMapping
    public ResponseEntity<?> guardarReserva(@RequestBody Reserva reserva) {
        try {
            // Normalización
            reserva.setEstadoPago((reserva.getEstadoPago() != null) ? reserva.getEstadoPago() : "pendiente");
            reserva.setEstadoReserva((reserva.getEstadoReserva() != null) ? reserva.getEstadoReserva() : "confirmada");
            
            if (reserva.getCodigoReserva() == null || reserva.getCodigoReserva().isEmpty()) {
                reserva.setCodigoReserva("RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }

            // Validar Usuario y Mesa
            Usuario usuarioDb = usuarioRepository.findById(reserva.getUsuario().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            Mesa mesaDb = mesaRepository.findById(reserva.getMesa().getId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

            reserva.setUsuario(usuarioDb);
            reserva.setMesa(mesaDb);

            return ResponseEntity.ok(reservaRepository.save(reserva));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerTodasLasReservas() {
        return ResponseEntity.ok(reservaRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
    }
@PutMapping("/{id}/estado")
public ResponseEntity<?> actualizarEstado(@PathVariable Integer id, @RequestBody Map<String, String> body) {
    String nuevoEstado = body.get("estado");
    Reserva reserva = reservaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    
    // Si el valor recibido pertenece a las opciones de pago, guardamos en la columna correcta
    if (List.of("pendiente", "pagado", "reembolsado").contains(nuevoEstado)) {
        reserva.setEstadoPago(nuevoEstado);
    } 
    // Si el valor es de reserva, guardamos en la columna de estado_reserva
    else if (List.of("confirmada", "asistió", "cancelada", "no_asistió").contains(nuevoEstado)) {
        reserva.setEstadoReserva(nuevoEstado);
    } else {
        return ResponseEntity.badRequest().body("Estado no válido para esta columna");
    }
    
    reservaRepository.save(reserva);
    return ResponseEntity.ok("Actualizado correctamente");
}
@PutMapping("/{id}")
public ResponseEntity<?> actualizarReservaCompleta(@PathVariable Integer id, @RequestBody Reserva reservaDetalles) {
    Reserva reservaDb = reservaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reserva no encontrada con ID: " + id));

    reservaDb.setFecha(reservaDetalles.getFecha());
    // ¡Añade esta línea!
    reservaDb.setHora(reservaDetalles.getHora()); 
    
    reservaDb.setEstadoReserva(reservaDetalles.getEstadoReserva());
    reservaDb.setObservaciones(reservaDetalles.getObservaciones());
    
    if (reservaDetalles.getMesa() != null) {
        Mesa mesaDb = mesaRepository.findById(reservaDetalles.getMesa().getId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        reservaDb.setMesa(mesaDb);
    }

    reservaRepository.save(reservaDb);
    return ResponseEntity.ok(reservaDb);
}
@DeleteMapping("/{id}")
public ResponseEntity<?> eliminarReserva(@PathVariable Integer id) {
    if (!reservaRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }
    reservaRepository.deleteById(id);
    return ResponseEntity.ok("Reserva eliminada con éxito");
}
}