package com.example.panchita_api.dto;

import java.math.BigDecimal;

public class DashboardDTO {
    private BigDecimal ingresosDia;
    private long ordenesActivas;
    private long reservasHoy;
    private BigDecimal ticketPromedio;
    private int[] flujoHorarios; 
    // NUEVOS CAMPOS PARA LAS MESAS
    private long mesasOcupadas;
    private long mesasTotales;

    public DashboardDTO(BigDecimal ingresosDia, long ordenesActivas, long reservasHoy, 
                        BigDecimal ticketPromedio, int[] flujoHorarios, long mesasOcupadas, long mesasTotales) {
        this.ingresosDia = ingresosDia != null ? ingresosDia : BigDecimal.ZERO;
        this.ordenesActivas = ordenesActivas;
        this.reservasHoy = reservasHoy;
        this.ticketPromedio = ticketPromedio != null ? ticketPromedio : BigDecimal.ZERO;
        this.flujoHorarios = flujoHorarios;
        this.mesasOcupadas = mesasOcupadas;
        this.mesasTotales = mesasTotales;
    }

    // Getters y Setters Existentes
    public BigDecimal getIngresosDia() { return ingresosDia; }
    public void setIngresosDia(BigDecimal ingresosDia) { this.ingresosDia = ingresosDia; }
    
    public long getOrdenesActivas() { return ordenesActivas; }
    public void setOrdenesActivas(long ordenesActivas) { this.ordenesActivas = ordenesActivas; }
    
    public long getReservasHoy() { return reservasHoy; }
    public void setReservasHoy(long reservasHoy) { this.reservasHoy = reservasHoy; }
    
    public BigDecimal getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(BigDecimal ticketPromedio) { this.ticketPromedio = ticketPromedio; }

    public int[] getFlujoHorarios() { return flujoHorarios; }
    public void setFlujoHorarios(int[] flujoHorarios) { this.flujoHorarios = flujoHorarios; }

    // NUEVOS GETTERS Y SETTERS PARA LAS MESAS
    public long getMesasOcupadas() { return mesasOcupadas; }
    public void setMesasOcupadas(long mesasOcupadas) { this.mesasOcupadas = mesasOcupadas; }

    public long getMesasTotales() { return mesasTotales; }
    public void setMesasTotales(long mesasTotales) { this.mesasTotales = mesasTotales; }
}
