package com.example.panchita_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// DTO que recibe el frontend al registrar o actualizar un producto de
// inventario. La cantidad aquí es solo el stock INICIAL al crear el
// producto; una vez creado, el stock solo cambia vía /compra o /consumo.
public class ProductoRequestDTO {

    private String codigoProducto;
    private String nombre;
    private LocalDate fechaVencimiento;
    private BigDecimal cantidad;
    private String unidadMedida;
    private String lugarAlmacenaje;
    private BigDecimal stockMinimo;

    public String getCodigoProducto() {
        return codigoProducto;
    }

    public void setCodigoProducto(String codigoProducto) {
        this.codigoProducto = codigoProducto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public String getLugarAlmacenaje() {
        return lugarAlmacenaje;
    }

    public void setLugarAlmacenaje(String lugarAlmacenaje) {
        this.lugarAlmacenaje = lugarAlmacenaje;
    }

    public BigDecimal getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(BigDecimal stockMinimo) {
        this.stockMinimo = stockMinimo;
    }
}
