package com.example.panchita_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales como cookies o headers de autenticación
        config.setAllowCredentials(true);
        
        // El origen exacto de tu frontend en React
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        
        // Todos los encabezados permitidos
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Métodos HTTP necesarios para tu API rest
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Registrar la configuración para todas las rutas del backend
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
