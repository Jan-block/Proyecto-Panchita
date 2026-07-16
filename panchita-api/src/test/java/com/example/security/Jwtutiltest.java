package com.example.panchita_api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.panchita_api.security.JwtUtil;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas de software: verifican la lógica de generación y validación
 * de JWT de forma aislada (sin levantar el contexto de Spring).
 */
class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Se inyectan manualmente los valores que normalmente vienen de application.properties
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "ClaveDePruebaSuficientementeLargaParaHS256DeAlMenos256Bits123456");
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L); // 1 hora
    }

    @Test
    void generarToken_generaUnTokenNoNuloYNoVacio() {
        String token = jwtUtil.generarToken("cliente@panchita.com", "cliente");

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void tokenGenerado_esValido() {
        String token = jwtUtil.generarToken("cliente@panchita.com", "cliente");

        assertTrue(jwtUtil.esTokenValido(token));
    }

    @Test
    void obtenerCorreo_devuelveElCorreoUsadoEnLaGeneracion() {
        String token = jwtUtil.generarToken("admin@panchita.com", "administrador");

        assertEquals("admin@panchita.com", jwtUtil.obtenerCorreo(token));
    }

    @Test
    void obtenerRol_devuelveElRolUsadoEnLaGeneracion() {
        String token = jwtUtil.generarToken("admin@panchita.com", "administrador");

        assertEquals("administrador", jwtUtil.obtenerRol(token));
    }

    @Test
    void tokenManipulado_noEsValido() {
        String token = jwtUtil.generarToken("cliente@panchita.com", "cliente");
        String tokenAlterado = token.substring(0, token.length() - 2) + "xx";

        assertFalse(jwtUtil.esTokenValido(tokenAlterado));
    }

    @Test
    void tokenExpirado_noEsValido() {
        // Se genera un token que expiró hace 1 segundo
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", -1000L);
        String tokenExpirado = jwtUtil.generarToken("cliente@panchita.com", "cliente");

        assertFalse(jwtUtil.esTokenValido(tokenExpirado));
    }
}