package com.example.panchita_api.model;

import java.math.BigDecimal;

import javax.persistence.*;

@Entity
@Table(name = "menu")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(length = 300)
    private String descripcion;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal precio;

    // Los tres componentes del menú se arman a partir de platos ya
    // registrados en /api/platos (evita duplicar datos de nombre/precio/imagen).
    @ManyToOne
    @JoinColumn(name = "entrada_id", nullable = false)
    private Plato entrada;

    @ManyToOne
    @JoinColumn(name = "fondo_id", nullable = false)
    private Plato fondo;

    @ManyToOne
    @JoinColumn(name = "bebida_id", nullable = false)
    private Plato bebida;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer state;

    public Menu() {
    }

    public Integer getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public Plato getEntrada() {
        return entrada;
    }

    public Plato getFondo() {
        return fondo;
    }

    public Plato getBebida() {
        return bebida;
    }

    public Integer getState() {
        return state;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public void setEntrada(Plato entrada) {
        this.entrada = entrada;
    }

    public void setFondo(Plato fondo) {
        this.fondo = fondo;
    }

    public void setBebida(Plato bebida) {
        this.bebida = bebida;
    }

    public void setState(Integer state) {
        this.state = state;
    }
}
