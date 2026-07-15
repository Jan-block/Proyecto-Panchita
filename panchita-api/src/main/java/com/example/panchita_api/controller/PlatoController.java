package com.example.panchita_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.panchita_api.model.Plato;
import com.example.panchita_api.repository.PlatoRepository;

@RestController
@RequestMapping("/api/platos")
@CrossOrigin(origins = "http://localhost:5173") 
public class PlatoController {

    @Autowired
    private PlatoRepository platoRepo;

    @GetMapping
    public ResponseEntity<List<Plato>> listar() {
        return ResponseEntity.ok(platoRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Plato> registrar(@RequestBody Plato p) {
        p.setState(1);
        return ResponseEntity.ok(platoRepo.save(p));
    }

    @PutMapping
    public ResponseEntity<Plato> actualizar(@RequestParam Integer id, @RequestBody Plato p) {
        Plato existente = platoRepo.findById(id).orElseThrow(() -> new RuntimeException("Plato no encontrado con id: " + id));
        
        existente.setName(p.getName());
        existente.setImage(p.getImage());
        existente.setDescription(p.getDescription());
        existente.setPrice(p.getPrice());
        existente.setCategory(p.getCategory());

        return ResponseEntity.ok(platoRepo.save(existente));
    }

    @PatchMapping("/estado")
    public ResponseEntity<Plato> actualizarEstado (@RequestParam Integer id){
        Plato existente = platoRepo.findById(id).orElseThrow(() -> new RuntimeException("Plato no encontrado con id: " + id));
        existente.setState(existente.getState() == 1 ? 0 : 1);

        return ResponseEntity.ok(platoRepo.save(existente));
    }

}
