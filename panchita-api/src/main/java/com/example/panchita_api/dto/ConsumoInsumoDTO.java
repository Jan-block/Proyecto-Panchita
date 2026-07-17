package com.example.panchita_api.dto;

import java.math.BigDecimal;

public class ConsumoInsumoDTO {

    private Integer productoId;
    private String nombre;
    private String unidadMedida;
    private BigDecimal cantidadConsumida;

    public ConsumoInsumoDTO() {
    }

    public ConsumoInsumoDTO(Integer productoId, String nombre, String unidadMedida, BigDecimal cantidadConsumida) {
        this.productoId = productoId;
        this.nombre = nombre;
        this.unidadMedida = unidadMedida;
        this.cantidadConsumida = cantidadConsumida;
    }

    public Integer getProductoId() {
        return productoId;
    }

    public void setProductoId(Integer productoId) {
        this.productoId = productoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public BigDecimal getCantidadConsumida() {
        return cantidadConsumida;
    }

    public void setCantidadConsumida(BigDecimal cantidadConsumida) {
        this.cantidadConsumida = cantidadConsumida;
    }
}
