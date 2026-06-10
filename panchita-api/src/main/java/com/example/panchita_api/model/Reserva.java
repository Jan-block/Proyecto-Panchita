package com.example.panchita_api.model;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 👈 Cambiado de Long a Integer para acoplarse al INT de MySQL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 👈 AGREGA ESTA LÍNEA
    private Usuario usuario;

    // Relación con la tabla Mesas
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // 👈 AGREGA ESTA LÍNEA
    private Mesa mesa;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(name = "codigo_reserva", nullable = false, unique = true, length = 20)
    private String codigoReserva;

    @Column(name = "metodo_pago", nullable = false, length = 20)
    private String metodoPago;
    
    @Column(name = "estado_pago", nullable = false, length = 20)
    private String estadoPago = "pendiente";
 
    @Column(name = "estado_reserva", nullable = false, length = 30)
    private String estadoReserva = "confirmada";

    @Column(nullable = false)
    private Integer estacionamiento = 0; // 0 = No, 1 = Sí

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "created_at", insertable = false, updatable = false)
    private java.sql.Timestamp createdAt;

    // ... dentro de tu clase Reserva
private String observaciones;

// Asegúrate de tener los métodos getter y setter
public String getObservaciones() {
    return observaciones;
}

public void setObservaciones(String observaciones) {
    this.observaciones = observaciones;
}

    // Constructores
    public Reserva() {}

    // Getters y Setters Actualizados
    public Integer getId() { return id; } // 👈 Tipo de retorno modificado
    public void setId(Integer id) { this.id = id; } // 👈 Parámetro modificado

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Mesa getMesa() { return mesa; }
    public void setMesa(Mesa mesa) { this.mesa = mesa; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public Integer getCapacidad() { return capacidad; }
    public void setCapacidad(Integer capacidad) { this.capacidad = capacidad; }

    public String getCodigoReserva() { return codigoReserva; }
    public void setCodigoReserva(String codigoReserva) { this.codigoReserva = codigoReserva; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public String getEstadoReserva() { return estadoReserva; }
    public void setEstadoReserva(String estadoReserva) { this.estadoReserva = estadoReserva; }

    public Integer getEstacionamiento() { return estacionamiento; }
    public void setEstacionamiento(Integer estacionamiento) { this.estacionamiento = estacionamiento; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public java.sql.Timestamp getCreatedAt() { return createdAt; }
}