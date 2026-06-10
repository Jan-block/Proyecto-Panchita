package com.example.panchita_api.controller;

import com.example.panchita_api.model.Mesa;
import com.example.panchita_api.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "http://localhost:5173") 
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository; // Convención estándar: minúscula al inicio
    @GetMapping("/disponibilidad")
    public ResponseEntity<?> obtenerDisponibilidad(
            @RequestParam("fecha") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam("hora") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime hora) {
        
        try {
            // 1. Traer todas las mesas
            List<Mesa> todasLasMesas = mesaRepository.findAll();

            // 2. Traer IDs de mesas ocupadas (asegúrate de tener este método en MesaRepository)
            List<Integer> idsOcupados = mesaRepository.findReservasPorFechaYHora(fecha, hora);

            // 3. Mapeo dinámico: No cambia la DB, solo el estado en la respuesta JSON
            List<Mesa> mesasMapeadas = todasLasMesas.stream().map(mesa -> {
                if (idsOcupados.contains(mesa.getId())) {
                    mesa.setEstado("ocupada");
                } else {
                    mesa.setEstado("disponible");
                }
                return mesa;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(mesasMapeadas);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al calcular disponibilidad: " + e.getMessage());
        }
    }

    // 🚀 Obtener todas las mesas sin filtros (Estado base)
    @GetMapping
    public ResponseEntity<List<Mesa>> obtenerMesas() {
        return ResponseEntity.ok(mesaRepository.findAll());
    }

    // 🛠️ Crear nueva mesa
    @PostMapping
    public ResponseEntity<?> crearMesa(@RequestBody Mesa mesa) {
        if (mesa.getEstado() == null) mesa.setEstado("disponible");
        return ResponseEntity.ok(mesaRepository.save(mesa));
    }
}