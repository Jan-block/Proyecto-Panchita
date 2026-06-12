package com.example.panchita_api.controller;

import com.example.panchita_api.model.Usuario;
import com.example.panchita_api.repository.UsuarioRepository;
import com.google.common.base.Preconditions;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.validator.routines.EmailValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // ✅ LOGBACK: reemplaza todos los System.out.println
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String emailIngresado   = credentials.get("email");
        String passwordIngresado = credentials.get("password");

        // ✅ APACHE COMMONS: valida que no sean blancos
        if (StringUtils.isBlank(emailIngresado) || StringUtils.isBlank(passwordIngresado)) {
            log.warn("Intento de login con campos vacíos");
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email y contraseña son obligatorios."));
        }

        // ✅ APACHE COMMONS VALIDATOR: valida formato de email
        if (!EmailValidator.getInstance().isValid(emailIngresado)) {
            log.warn("Formato de email inválido: {}", emailIngresado);
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El formato del email no es válido."));
        }

        log.info("Intento de login para: {}", emailIngresado);

        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(emailIngresado);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (passwordEncoder.matches(passwordIngresado, usuario.getPassword())) {
                if ("inactivo".equals(usuario.getEstado())) {
                    log.warn("Usuario inactivo intentó acceder: {}", emailIngresado);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Tu cuenta está desactivada."));
                }

                log.info("Login exitoso para: {} con rol: {}", emailIngresado, usuario.getRol());

                Map<String, String> respuesta = new HashMap<>();
                respuesta.put("id",      String.valueOf(usuario.getId()));
                respuesta.put("mensaje", "¡Bienvenido de vuelta!");
                respuesta.put("nombre",  usuario.getNombre());
                respuesta.put("rol",     usuario.getRol());
                respuesta.put("token",   "jwt-token-panchita-real");
                return ResponseEntity.ok(respuesta);
            }
        }

        log.warn("Credenciales incorrectas para: {}", emailIngresado);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Correo o contraseña incorrectos."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        try {
            String nombre   = userData.get("nombre");
            String email    = userData.get("email");
            String password = userData.get("password");
            String telefono = userData.get("telefono");

            // ✅ APACHE COMMONS: valida campos obligatorios
            if (StringUtils.isAnyBlank(nombre, email, password)) {
                log.warn("Registro con campos obligatorios vacíos");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Nombre, email y contraseña son obligatorios."));
            }

            // ✅ APACHE COMMONS VALIDATOR: valida email
            if (!EmailValidator.getInstance().isValid(email)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "El formato del email no es válido."));
            }

            // ✅ GUAVA: valida longitud mínima de contraseña
            Preconditions.checkArgument(password.length() >= 6,
                    "La contraseña debe tener al menos 6 caracteres");

            // Verifica si el correo ya existe
            if (usuarioRepository.findByCorreo(email).isPresent()) {
                log.warn("Intento de registro con email ya existente: {}", email);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Ya existe una cuenta con ese correo."));
            }

            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(StringUtils.trimToEmpty(nombre));
            nuevoUsuario.setCorreo(email.toLowerCase());
            nuevoUsuario.setPassword(passwordEncoder.encode(password));
            nuevoUsuario.setTelefono(StringUtils.trimToEmpty(telefono));
            nuevoUsuario.setEstado("activo");
            nuevoUsuario.setRol("PANCHITA2026".equals(userData.get("codigoSecreto"))
                    ? "administrador" : "cliente");

            Usuario guardado = usuarioRepository.save(nuevoUsuario);
            log.info("Usuario registrado exitosamente: {} con rol: {}", email, guardado.getRol());

            return ResponseEntity.ok(Map.of(
                    "id",      guardado.getId(),
                    "mensaje", "¡Cuenta creada exitosamente!",
                    "nombre",  guardado.getNombre(),
                    "rol",     guardado.getRol()
            ));

        } catch (IllegalArgumentException e) {
            log.error("Error de validación en registro: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado en registro", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al procesar el registro."));
        }
    }
}