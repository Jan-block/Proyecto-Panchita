package com.example.panchita_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.panchita_api.model.Menu;

public interface MenuRepository extends JpaRepository<Menu, Integer> {

    // Permite verificar si un plato está siendo usado como entrada, fondo o
    // bebida en algún menú, antes de permitir borrarlo.
    boolean existsByEntrada_IdOrFondo_IdOrBebida_Id(Integer entradaId, Integer fondoId, Integer bebidaId);
}