package com.whoopstack.devis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.whoopstack.devis.model.Prestation;

public interface PrestationRepository extends JpaRepository<Prestation, Long> {
}