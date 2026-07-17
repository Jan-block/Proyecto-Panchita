package com.example.panchita_api.dto;

import java.math.BigDecimal;

// Un plato dentro del pedido que llega desde el formulario de "Nuevo pedido".
public class ItemPedidoDTO {

    private Integer platoId;
    private Integer cantidad;
    private BigDecimal precioUnitario;

    public Integer getPlatoId() {
        return platoId;
    }

    public void setPlatoId(Integer platoId) {
        this.platoId = platoId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}
