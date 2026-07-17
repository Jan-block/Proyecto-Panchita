package com.example.panchita_api.dto;

import java.math.BigDecimal;

public class ReporteVentasDTO {

    private String periodo;       // etiqueta a mostrar, ej: "17/07/2026" o "Semana del 13/07"
    private BigDecimal totalReservas;
    private BigDecimal totalDelivery;
    private BigDecimal totalGeneral;
    private long cantidadPedidos;

    public ReporteVentasDTO() {
    }

    public ReporteVentasDTO(String periodo, BigDecimal totalReservas, BigDecimal totalDelivery,
                             BigDecimal totalGeneral, long cantidadPedidos) {
        this.periodo = periodo;
        this.totalReservas = totalReservas;
        this.totalDelivery = totalDelivery;
        this.totalGeneral = totalGeneral;
        this.cantidadPedidos = cantidadPedidos;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public BigDecimal getTotalReservas() {
        return totalReservas;
    }

    public void setTotalReservas(BigDecimal totalReservas) {
        this.totalReservas = totalReservas;
    }

    public BigDecimal getTotalDelivery() {
        return totalDelivery;
    }

    public void setTotalDelivery(BigDecimal totalDelivery) {
        this.totalDelivery = totalDelivery;
    }

    public BigDecimal getTotalGeneral() {
        return totalGeneral;
    }

    public void setTotalGeneral(BigDecimal totalGeneral) {
        this.totalGeneral = totalGeneral;
    }

    public long getCantidadPedidos() {
        return cantidadPedidos;
    }

    public void setCantidadPedidos(long cantidadPedidos) {
        this.cantidadPedidos = cantidadPedidos;
    }
}
