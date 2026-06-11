package com.example.panchita_api.repository;

import com.example.panchita_api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// CORRECCIÓN: Cambiado de Long a Integer para acoplarse al ID de tu tabla
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);
}
