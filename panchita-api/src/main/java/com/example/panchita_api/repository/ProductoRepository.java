package com.example.panchita_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.panchita_api.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    boolean existsByCodigoProducto(String codigoProducto);
}
