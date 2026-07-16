package com.example.panchita_api.controller;

import com.example.panchita_api.model.Usuario;
import com.example.panchita_api.repository.UsuarioRepository;
import com.example.panchita_api.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de software del módulo de autenticación (login / registro).
 * Se usa @WebMvcTest para levantar solo la capa web (más rápido que un
 * contexto completo) y se deshabilitan los filtros de seguridad
 * (addFilters = false) porque aquí se prueba la LÓGICA del controlador;
 * las pruebas de seguridad de los endpoints protegidos se documentan por
 * separado en el Informe de Pruebas de Seguridad (Thunder Client).
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "app.admin.secret-code=PANCHITA2026")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private BCryptPasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtil jwtUtil;

    // ---------- LOGIN ----------

    @Test
    void login_conCamposVacios_retorna400() throws Exception {
        Map<String, String> body = Map.of("email", "", "password", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email y contraseña son obligatorios."));
    }

    @Test
    void login_conEmailInvalido_retorna400() throws Exception {
        Map<String, String> body = Map.of("email", "no-es-un-correo", "password", "123456");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El formato del email no es válido."));
    }

    @Test
    void login_conCredencialesIncorrectas_retorna401() throws Exception {
        Map<String, String> body = Map.of("email", "cliente@panchita.com", "password", "malaClave");
        when(usuarioRepository.findByCorreo("cliente@panchita.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Correo o contraseña incorrectos."));
    }

    @Test
    void login_deUsuarioInactivo_retorna403() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setCorreo("cliente@panchita.com");
        usuario.setPassword("hashSimulado");
        usuario.setEstado("inactivo");
        usuario.setRol("cliente");

        Map<String, String> body = Map.of("email", "cliente@panchita.com", "password", "123456");
        when(usuarioRepository.findByCorreo("cliente@panchita.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Tu cuenta está desactivada."));
    }

    @Test
    void login_exitoso_retorna200ConToken() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setCorreo("cliente@panchita.com");
        usuario.setPassword("hashSimulado");
        usuario.setEstado("activo");
        usuario.setRol("cliente");
        usuario.setNombre("Cliente Demo");

        Map<String, String> body = Map.of("email", "cliente@panchita.com", "password", "123456");
        when(usuarioRepository.findByCorreo("cliente@panchita.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generarToken("cliente@panchita.com", "cliente")).thenReturn("token.falso.jwt");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token.falso.jwt"))
                .andExpect(jsonPath("$.rol").value("cliente"));
    }

    // ---------- REGISTRO ----------

    @Test
    void registro_conCorreoYaExistente_retorna409() throws Exception {
        Map<String, String> body = Map.of(
                "nombre", "Admin Panchita",
                "email", "admin@panchita.com",
                "password", "admin123",
                "telefono", "999999999");

        when(usuarioRepository.findByCorreo("admin@panchita.com"))
                .thenReturn(Optional.of(new Usuario()));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ya existe una cuenta con ese correo."));

        // El usuario nunca debió guardarse si el correo ya existía
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registro_conPasswordMuyCorta_retorna400() throws Exception {
        Map<String, String> body = Map.of(
                "nombre", "Cliente Nuevo",
                "email", "nuevo@panchita.com",
                "password", "123");

        when(usuarioRepository.findByCorreo("nuevo@panchita.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registro_exitoso_asignaRolCliente_siNoMandaCodigoSecreto() throws Exception {
        Map<String, String> body = Map.of(
                "nombre", "Cliente Nuevo",
                "email", "nuevo@panchita.com",
                "password", "123456");

        when(usuarioRepository.findByCorreo("nuevo@panchita.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashSimulado");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setId(10);
            return u;
        });

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("cliente"));
    }

    @Test
    void registro_conCodigoSecretoCorrecto_asignaRolAdministrador() throws Exception {
        Map<String, String> body = Map.of(
                "nombre", "Admin Panchita",
                "email", "admin2@panchita.com",
                "password", "admin123",
                "codigoSecreto", "PANCHITA2026");

        when(usuarioRepository.findByCorreo("admin2@panchita.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashSimulado");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setId(11);
            return u;
        });

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("administrador"));
    }
}