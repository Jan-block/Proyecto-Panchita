package com.example.panchita_api.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

// Cada fila representa un plato específico dentro de un pedido de delivery.
// Antes solo se guardaba el total en soles del pedido; con esto se puede
// saber exactamente qué platos se vendieron y en qué cantidad.
@Entity
@Table(name = "detalle_pedido_delivery")
public class DetallePedidoDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // JsonIgnore: sin esto, al convertir el pedido a JSON se genera un bucle
    // infinito (pedido -> detalles -> detalle.pedido -> detalles -> ...) que
    // rompe la respuesta del backend a mitad de camino.
    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonIgnore
    private Pedido_delivery pedido;

    @ManyToOne
    @JoinColumn(name = "plato_id", nullable = false)
    private Plato plato;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    public DetallePedidoDelivery() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Pedido_delivery getPedido() {
        return pedido;
    }

    public void setPedido(Pedido_delivery pedido) {
        this.pedido = pedido;
    }

    public Plato getPlato() {
        return plato;
    }

    public void setPlato(Plato plato) {
        this.plato = plato;
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
