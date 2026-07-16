package com.example.panchita_api.controller;

import com.example.panchita_api.model.Mesa;
import com.example.panchita_api.model.Reserva;
import com.example.panchita_api.model.Usuario;
import com.example.panchita_api.repository.MesaRepository;
import com.example.panchita_api.repository.ReservaRepository;
import com.example.panchita_api.repository.UsuarioRepository;
import com.example.panchita_api.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de software del módulo de reservas: validan la regla de negocio
 * más importante (no permitir doble reserva de una misma mesa en el mismo
 * horario) y el manejo correcto de recursos inexistentes.
 */
@WebMvcTest(ReservaController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReservaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private MesaRepository mesaRepository;

    @MockBean
    private ReservaRepository reservaRepository;

    // JwtAuthFilter (un Filter) se auto-detecta y construye al levantar el
    // contexto de @WebMvcTest, aunque los filtros estén deshabilitados con
    // addFilters = false. Como su constructor necesita JwtUtil, hay que
    // "mockearlo" aquí también para que el contexto pueda armarse.
    @MockBean
    private JwtUtil jwtUtil;

    private Map<String, Object> crearPayloadReserva() {
        Map<String, Object> reserva = new HashMap<>();
        reserva.put("usuario", Map.of("id", 1));
        reserva.put("mesa", Map.of("id", 2));
        reserva.put("fecha", "2026-08-01");
        reserva.put("hora", "20:00:00");
        reserva.put("capacidad", 4);
        reserva.put("metodoPago", "tarjeta");
        reserva.put("precio", 50.00);
        return reserva;
    }

    @Test
    void guardarReserva_conMesaYaOcupadaEnEseHorario_retorna400() throws Exception {
        when(reservaRepository.existsByMesaIdAndFechaAndHora(2, LocalDate.of(2026, 8, 1), LocalTime.of(20, 0)))
                .thenReturn(true);

        mockMvc.perform(post("/api/reservas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearPayloadReserva())))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: La mesa ya se encuentra reservada en este horario."));

        // No debe intentar guardar nada si la mesa ya estaba ocupada
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void guardarReserva_conHorarioLibre_seGuardaCorrectamente() throws Exception {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        Mesa mesa = new Mesa();
        mesa.setId(2);

        when(reservaRepository.existsByMesaIdAndFechaAndHora(2, LocalDate.of(2026, 8, 1), LocalTime.of(20, 0)))
                .thenReturn(false);
        when(usuarioRepository.findById(1)).thenReturn(java.util.Optional.of(usuario));
        when(mesaRepository.findById(2)).thenReturn(java.util.Optional.of(mesa));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/reservas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearPayloadReserva())))
                .andExpect(status().isOk());

        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    void eliminarReserva_queNoExiste_retorna404() throws Exception {
        when(reservaRepository.existsById(999)).thenReturn(false);

        mockMvc.perform(delete("/api/reservas/999"))
                .andExpect(status().isNotFound());

        verify(reservaRepository, never()).deleteById(anyInt());
    }

    @Test
    void eliminarReserva_queExiste_seEliminaYRetorna200() throws Exception {
        when(reservaRepository.existsById(5)).thenReturn(true);

        mockMvc.perform(delete("/api/reservas/5"))
                .andExpect(status().isOk())
                .andExpect(content().string("Reserva eliminada con éxito"));

        verify(reservaRepository, times(1)).deleteById(5);
    }

    @Test
    void actualizarEstado_conValorInvalido_retorna400() throws Exception {
        Reserva reservaExistente = new Reserva();
        reservaExistente.setId(3);
        when(reservaRepository.findById(3)).thenReturn(java.util.Optional.of(reservaExistente));

        Map<String, String> body = Map.of("estado", "estado_que_no_existe");

        mockMvc.perform(put("/api/reservas/3/estado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Estado no válido para esta columna"));

        verify(reservaRepository, never()).save(any());
    }
}