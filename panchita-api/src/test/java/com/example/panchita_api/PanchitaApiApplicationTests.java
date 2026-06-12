package com.example.panchita_api;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;

class PanchitaApiApplicationTests {
	@Test
	void passwordEncriptadaNoEsTextoPlano() {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String passwordOriginal = "mati123";
		String hash = encoder.encode(passwordOriginal);
		assertNotEquals(passwordOriginal, hash);
		assertTrue(hash.startsWith("$2a$"));
	}

	@Test
	void passwordCorrectaEsAceptada() {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String passwordOriginal = "admin123";
		String hash = encoder.encode(passwordOriginal);
		assertTrue(encoder.matches(passwordOriginal, hash));
	}

	@Test
	void passwordIncorrectaEsRechazada() {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String hash = encoder.encode("admin123");

		assertFalse(encoder.matches("otraPassword", hash));
	}

	@Test
	void emailVacioEsDetectado() {
		String email = "   ";

		assertTrue(email.isBlank());
	}

	@Test
	void passwordMenorA6CaracteresEsInvalida() {
		String password = "abc";
		assertTrue(password.length() < 6);
	}
}