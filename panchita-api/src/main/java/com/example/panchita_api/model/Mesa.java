package com.example.panchita_api.model;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importante para evitar errores

@Entity
@Table(name = "mesas")
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; 

    @Column(name = "sala_id", nullable = false)
    private Integer salaId; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Sala sala;

    @ManyToOne
@JoinColumn(name = "reserva_id") 
private Reserva reserva;

    @Column(nullable = false, length = 10)
    private String numero;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(length = 20)
    private String estado = "disponible";

    @Column(length = 50)
    private String ubicacion;

    public Mesa() {}

    public Sala getSala() {
        return sala;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getSalaId() { return salaId; }
    public void setSalaId(Integer salaId) { this.salaId = salaId; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getUbicacion() { return ubicacion; } 
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
}