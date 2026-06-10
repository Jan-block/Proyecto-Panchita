package com.example.panchita_api.controller;

import com.example.panchita_api.model.Usuario;
import com.example.panchita_api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String emailIngresado = credentials.get("email");
        String passwordIngresado = credentials.get("password");

        // 🔴 LÍNEAS DE RASTREO: Verifican qué llega desde React
        System.out.println(">>> REPETICIÓN RECIBIDA DESDE REACT <<<");
        System.out.println("Email ingresado: [" + emailIngresado + "]");
        System.out.println("Password ingresado: [" + passwordIngresado + "]");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(emailIngresado);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // 🔴 LÍNEAS DE RASTREO: Verifican qué leyó desde MySQL Workbench
            System.out.println(">>> USUARIO ENCONTRADO EN MYSQL <<<");
            System.out.println("Password en Base de Datos: [" + usuario.getPassword() + "]");
            System.out.println("Estado del usuario: [" + usuario.getEstado() + "]");

            if (usuario.getPassword().equals(passwordIngresado)) {
                if ("inactivo".equals(usuario.getEstado())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Tu cuenta está desactivada."));
                }

                Map<String, String> respuesta = new HashMap<>();
                respuesta.put("id", String.valueOf(usuario.getId())); // 🌟 AGREGA ESTA LÍNEA
                respuesta.put("mensaje", "¡Bienvenido de vuelta!");
                respuesta.put("nombre", usuario.getNombre());
                respuesta.put("rol", usuario.getRol());
                respuesta.put("token", "jwt-token-panchita-real");
                return ResponseEntity.ok(respuesta);
            } else {
                System.out.println("❌ LA CONTRASEÑA NO COINCIDIÓ");
            }
        } else {
            System.out.println("❌ EL CORREO NO EXISTE EN LA BASE DE DATOS");
        }

        Map<String, String> errorRespuesta = new HashMap<>();
        errorRespuesta.put("message", "Correo o contraseña incorrectos.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorRespuesta);
    }

    @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
    try {
        // ... (tu lógica de validación de correo existente)

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(userData.get("nombre"));
        nuevoUsuario.setCorreo(userData.get("email"));
        nuevoUsuario.setPassword(userData.get("password"));
        nuevoUsuario.setTelefono(userData.get("telefono"));
        nuevoUsuario.setEstado("activo");

        if ("PANCHITA2026".equals(userData.get("codigoSecreto"))) {
            nuevoUsuario.setRol("administrador");
        } else {
            nuevoUsuario.setRol("cliente");
        }

        // Guardamos y obtenemos el usuario con el ID ya generado por MySQL
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // RESPUESTA EXITOSA CON EL ID
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", usuarioGuardado.getId()); // ¡Esto soluciona el ERROR CRÍTICO!
        respuesta.put("mensaje", "¡Cuenta creada exitosamente!");
        respuesta.put("nombre", usuarioGuardado.getNombre());
        respuesta.put("rol", usuarioGuardado.getRol());
        
        return ResponseEntity.ok(respuesta);

    } catch (Exception e) {
        // Esto captura por qué da error 400 (ej. algún campo nulo que no debe serlo)
        e.printStackTrace(); 
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(Map.of("message", "Error al procesar el registro: " + e.getMessage()));
    }
}
}
