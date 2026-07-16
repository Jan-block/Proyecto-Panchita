package com.example.panchita_api.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

// Cada compra o consumo de cocina queda registrado aquí, para poder
// reconstruir el historial de un producto y auditar cómo llegó a su
// stock actual (no solo el número final).
@Entity
@Table(name = "movimiento_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    // "COMPRA" suma al stock, "CONSUMO" resta (uso en cocina).
    @Column(nullable = false, length = 10)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(length = 200)
    private String observacion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    public MovimientoInventario() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
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

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
