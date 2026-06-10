package com.example.panchita_api.controller;

import com.example.panchita_api.model.Sala;
import com.example.panchita_api.repository.SalaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@CrossOrigin(origins = "http://localhost:5173") // 👈 Permisos CORS listos para React
public class SalaController {

    @Autowired
    private SalaRepository salaRepository;

    // 🚀 GET: Para que el formulario de mesas cargue las salas reales de la BD
    @GetMapping
    public ResponseEntity<List<Sala>> obtenerSalas() {
        try {
            return ResponseEntity.ok(salaRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 🛠️ POST: Para crear un área nueva desde la interfaz web del administrador
    @PostMapping
    public ResponseEntity<?> crearSala(@RequestBody Sala sala) {
        try {
            if (sala.getNombre() == null || sala.getCapacidadTotal() == null) {
                return ResponseEntity.badRequest().body("Error: Nombre y capacidad total son requeridos.");
            }
            if (sala.getEstado() == null) {
                sala.setEstado("activo");
            }
            Sala nuevaSala = salaRepository.save(sala);
            return ResponseEntity.ok(nuevaSala);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al guardar sala: " + e.getMessage());
        }
    }
}
