package com.example.panchita_api.repository;

import com.example.panchita_api.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> { 
    // Asegúrate de que aquí también sea Integer
    boolean existsByMesaIdAndFechaAndHora(Integer mesaId, LocalDate fecha, LocalTime hora);
}