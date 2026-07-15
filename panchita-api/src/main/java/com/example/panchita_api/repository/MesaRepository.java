package com.example.panchita_api.repository;

import com.example.panchita_api.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalTime; 

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Integer> {

@Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.mesa.id = :mesaId AND r.fecha = :fecha " +
       "AND (r.hora BETWEEN :inicio AND :fin)")
boolean existsByMesaAndRange(Integer mesaId, LocalDate fecha, LocalTime inicio, LocalTime fin);
}