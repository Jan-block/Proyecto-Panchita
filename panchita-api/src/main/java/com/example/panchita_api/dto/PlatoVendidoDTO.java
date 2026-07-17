package com.example.panchita_api.dto;

import java.math.BigDecimal;

public class PlatoVendidoDTO {

    private Integer platoId;
    private String nombre;
    private String categoria;
    private long cantidadVendida;
    private BigDecimal totalIngresos;

    public PlatoVendidoDTO() {
    }

    public PlatoVendidoDTO(Integer platoId, String nombre, String categoria,
                            long cantidadVendida, BigDecimal totalIngresos) {
        this.platoId = platoId;
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidadVendida = cantidadVendida;
        this.totalIngresos = totalIngresos;
    }

    public Integer getPlatoId() {
        return platoId;
    }

    public void setPlatoId(Integer platoId) {
        this.platoId = platoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public long getCantidadVendida() {
        return cantidadVendida;
    }

    public void setCantidadVendida(long cantidadVendida) {
        this.cantidadVendida = cantidadVendida;
    }

    public BigDecimal getTotalIngresos() {
        return totalIngresos;
    }

    public void setTotalIngresos(BigDecimal totalIngresos) {
        this.totalIngresos = totalIngresos;
    }
}
