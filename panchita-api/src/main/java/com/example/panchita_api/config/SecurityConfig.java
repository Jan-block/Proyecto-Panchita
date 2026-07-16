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
                        // Rutas publicas: login y registro
                        .antMatchers("/api/auth/**").permitAll()
                        // Health check publico para que el monitoreo externo pueda consultarlo sin
                        // token
                        .antMatchers("/actuator/health", "/actuator/info").permitAll()
                        // El resto de Actuator (metrics) solo para administradores
                        .antMatchers(
                                "/api/admin/**",
                                "/api/reportes/**",
                                "/api/delivery/**")
                        .hasRole("ADMINISTRADOR") // Rutas administrativas: dashboard y reportes
                        .antMatchers("/api/admin/**", "/api/reportes/**").hasRole("ADMINISTRADOR")
                        // Todo lo demas requiere estar logueado (con cualquier rol)
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}