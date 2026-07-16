package com.example.panchita_api.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.*;

// Representa cada insumo/producto registrado para usar durante la semana
// (verduras, carnes, bebidas, envases, etc.). El stock (cantidad) se
// actualiza automáticamente mediante los movimientos de compra/consumo,
// nunca se edita el número directamente desde el formulario de datos.
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_producto", nullable = false, unique = true, length = 30)
    private String codigoProducto;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "unidad_medida", nullable = false, length = 20)
    private String unidadMedida;

    @Column(name = "lugar_almacenaje", nullable = false, length = 60)
    private String lugarAlmacenaje;

    @Column(name = "stock_minimo", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private BigDecimal stockMinimo;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer state;

    public Producto() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public Integer getState() {
        return state;
    }

    public void setState(Integer state) {
        this.state = state;
    }
}
