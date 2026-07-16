package com.example.panchita_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.panchita_api.model.Menu;

public interface MenuRepository extends JpaRepository<Menu, Integer> {

}