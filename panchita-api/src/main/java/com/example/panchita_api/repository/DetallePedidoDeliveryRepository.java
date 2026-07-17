package com.example.panchita_api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.panchita_api.model.DetallePedidoDelivery;

public interface DetallePedidoDeliveryRepository extends JpaRepository<DetallePedidoDelivery, Integer> {

    // Trae todos los platos vendidos en pedidos creados dentro del rango de
    // fechas, sin contar los pedidos cancelados (esos no fueron una venta real).
    List<DetallePedidoDelivery> findByPedido_CreatedAtBetweenAndPedido_EstadoNot(
            LocalDateTime desde, LocalDateTime hasta, String estadoExcluido);
}
