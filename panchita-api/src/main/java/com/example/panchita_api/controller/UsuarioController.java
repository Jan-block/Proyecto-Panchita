package com.example.panchita_api.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.panchita_api.model.Usuario;
import com.example.panchita_api.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/clientes")
    public ResponseEntity<List<Usuario>> listarClientes() {
        List<Usuario> clientes = usuarioRepository.findAll().stream()
                .filter(u -> "cliente".equalsIgnoreCase(u.getRol()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientes);
    }

    @PutMapping("/clientes/{id}")
    public ResponseEntity<?> actualizarCliente(@PathVariable Integer id, @RequestBody Map<String, String> datos) {
        Usuario cliente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));

        if (!"cliente".equalsIgnoreCase(cliente.getRol())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Este usuario no es un cliente. Usa /api/auth/empleados para editarlo."));
        }

        if (StringUtils.isNotBlank(datos.get("nombre"))) {
            cliente.setNombre(datos.get("nombre").trim());
        }
        if (StringUtils.isNotBlank(datos.get("telefono"))) {
            cliente.setTelefono(datos.get("telefono").trim());
        }

        return ResponseEntity.ok(usuarioRepository.save(cliente));
    }

    @PatchMapping("/clientes/{id}/estado")
    public ResponseEntity<?> cambiarEstadoCliente(@PathVariable Integer id) {
        Usuario cliente = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));

        if (!"cliente".equalsIgnoreCase(cliente.getRol())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Este usuario no es un cliente."));
        }

        cliente.setEstado("activo".equals(cliente.getEstado()) ? "inactivo" : "activo");
        return ResponseEntity.ok(usuarioRepository.save(cliente));
    }
}