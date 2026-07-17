package com.example.panchita_api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.panchita_api.model.MovimientoInventario;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {

    List<MovimientoInventario> findByProducto_IdOrderByFechaDesc(Integer productoId);

    List<MovimientoInventario> findAllByOrderByFechaDesc();

    List<MovimientoInventario> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);
}
