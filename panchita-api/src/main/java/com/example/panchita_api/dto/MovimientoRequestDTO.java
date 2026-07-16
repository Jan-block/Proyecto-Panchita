package com.example.panchita_api.dto;

import java.math.BigDecimal;

// DTO usado tanto en /api/inventario/compra como en /api/inventario/consumo.
// El "tipo" (COMPRA o CONSUMO) lo decide el endpoint que se llama, no el DTO.
public class MovimientoRequestDTO {

    private Integer productoId;
    private BigDecimal cantidad;
    private String observacion;

    public Integer getProductoId() {
        return productoId;
    }

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}
