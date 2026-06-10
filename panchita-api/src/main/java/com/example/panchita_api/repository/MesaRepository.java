package com.example.panchita_api.repository;

import com.example.panchita_api.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {

    // 🌟 AGREGA ESTA CONSULTA AQUÍ PARA QUE TU CONTROLLER ENCUENTRE LOS IDS OCUPADOS:
    @Query("SELECT r.mesa.id FROM Reserva r WHERE r.fecha = :fecha AND r.hora = :hora")
List<Integer> findReservasPorFechaYHora(@Param("fecha") LocalDate fecha, @Param("hora") LocalTime hora);
}