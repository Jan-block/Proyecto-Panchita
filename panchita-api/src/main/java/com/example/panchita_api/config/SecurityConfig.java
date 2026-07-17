package com.example.panchita_api.config;

import com.example.panchita_api.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests(auth -> auth
                        // Preflight de CORS: el navegador manda OPTIONS antes de cada request real
                        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Gestion de empleados: solo el administrador puede crear, listar o
                        // editar cuentas de personal (cajero, mesero, chef, otro admin).
                        .antMatchers("/api/auth/empleados/**").hasRole("ADMINISTRADOR")
                        // Gestion de clientes (editar/desactivar): tambien solo administrador.
                        .antMatchers("/api/usuarios/**").hasRole("ADMINISTRADOR")
                        // Rutas publicas: login y registro de clientes
                        .antMatchers("/api/auth/**").permitAll()
                        // Health check publico para que el monitoreo externo pueda consultarlo sin
                        // token
                        .antMatchers("/actuator/health", "/actuator/info").permitAll()
                        // Rutas administrativas: dashboard, reportes y auditoria general
                        .antMatchers("/api/admin/**", "/api/reportes/**").hasRole("ADMINISTRADOR")
                        // Inventario: solo quien cocina (chef) o el administrador puede dar de alta
                        // productos, registrar compras/consumos o editar el maestro de insumos.
                        .antMatchers(HttpMethod.POST, "/api/inventario/**").hasAnyRole("CHEF", "ADMINISTRADOR")
                        .antMatchers(HttpMethod.PUT, "/api/inventario/**").hasAnyRole("CHEF", "ADMINISTRADOR")
                        .antMatchers(HttpMethod.PATCH, "/api/inventario/**").hasAnyRole("CHEF", "ADMINISTRADOR")
                        // Delivery: el cajero es quien gestiona los pedidos externos junto al
                        // administrador (antes esto era exclusivo de ADMINISTRADOR).
                        .antMatchers("/api/delivery/**").hasAnyRole("CAJERO", "ADMINISTRADOR")
                        // Todo lo demas requiere estar logueado (con cualquier rol: cliente,
                        // mesero, cajero, chef o administrador)
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}