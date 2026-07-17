package com.example.panchita_api.repository;

import com.example.panchita_api.model.Pedido_delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoDeliveryRepository
        extends JpaRepository<Pedido_delivery, Long> {

    List<Pedido_delivery> findAllByOrderByCreatedAtDesc();

    List<Pedido_delivery> findByEstadoOrderByCreatedAtDesc(String estado);

    List<Pedido_delivery> findByCreatedAtBetween(LocalDateTime desde, LocalDateTime hasta);
}