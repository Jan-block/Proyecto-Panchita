package com.example.panchita_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.panchita_api.dto.MenuRequestDTO;
import com.example.panchita_api.model.Menu;
import com.example.panchita_api.model.Plato;
import com.example.panchita_api.repository.MenuRepository;
import com.example.panchita_api.repository.PlatoRepository;

@RestController
@RequestMapping("/api/menus")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuController {

    @Autowired
    private MenuRepository menuRepo;

    @Autowired
    private PlatoRepository platoRepo;

    @GetMapping
    public ResponseEntity<List<Menu>> listar() {
        return ResponseEntity.ok(menuRepo.findAll());
    }

    @PostMapping
    public ResponseEntity<Menu> registrar(@RequestBody MenuRequestDTO dto) {
        Menu menu = construirMenu(new Menu(), dto);
        menu.setState(1);
        return ResponseEntity.ok(menuRepo.save(menu));
    }

    @PutMapping
    public ResponseEntity<Menu> actualizar(@RequestParam Integer id, @RequestBody MenuRequestDTO dto) {
        Menu existente = menuRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Menú no encontrado con id: " + id));
        construirMenu(existente, dto);
        return ResponseEntity.ok(menuRepo.save(existente));
    }

    @PatchMapping("/estado")
    public ResponseEntity<Menu> actualizarEstado(@RequestParam Integer id) {
        Menu existente = menuRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Menú no encontrado con id: " + id));
        existente.setState(existente.getState() == 1 ? 0 : 1);
        return ResponseEntity.ok(menuRepo.save(existente));
    }

    // Arma/actualiza el Menu a partir del DTO, resolviendo los ids de platos
    // recibidos contra los platos ya registrados en /api/platos.
    private Menu construirMenu(Menu menu, MenuRequestDTO dto) {
        Plato entrada = platoRepo.findById(dto.getEntradaId())
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada con id: " + dto.getEntradaId()));
        Plato fondo = platoRepo.findById(dto.getFondoId())
                .orElseThrow(() -> new RuntimeException("Plato de fondo no encontrado con id: " + dto.getFondoId()));
        Plato bebida = platoRepo.findById(dto.getBebidaId())
                .orElseThrow(() -> new RuntimeException("Bebida no encontrada con id: " + dto.getBebidaId()));

        menu.setNombre(dto.getNombre());
        menu.setDescripcion(dto.getDescripcion());
        menu.setPrecio(dto.getPrecio());
        menu.setEntrada(entrada);
        menu.setFondo(fondo);
        menu.setBebida(bebida);
        return menu;
    }
}