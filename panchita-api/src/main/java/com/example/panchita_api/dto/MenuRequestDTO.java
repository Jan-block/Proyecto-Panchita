package com.example.panchita_api.dto;

import java.math.BigDecimal;

// DTO que recibe el frontend al crear/actualizar un Menú: solo los ids de los
// platos que lo componen, no los objetos Plato completos.
public class MenuRequestDTO {

    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer entradaId;
    private Integer fondoId;
    private Integer bebidaId;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getEntradaId() {
        return entradaId;
    }

    public void setEntradaId(Integer entradaId) {
        this.entradaId = entradaId;
    }

    public Integer getFondoId() {
        return fondoId;
    }

    public void setFondoId(Integer fondoId) {
        this.fondoId = fondoId;
    }

    public Integer getBebidaId() {
        return bebidaId;
    }

    public void setBebidaId(Integer bebidaId) {
        this.bebidaId = bebidaId;
    }
}