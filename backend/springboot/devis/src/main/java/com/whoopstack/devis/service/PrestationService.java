package com.whoopstack.devis.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.whoopstack.devis.model.Prestation;
import com.whoopstack.devis.repository.PrestationRepository;

@Service
public class PrestationService {

    private final PrestationRepository repository;

    public PrestationService(PrestationRepository repository) {
        this.repository = repository;
    }

    public List<Prestation> getAllPrestations() {
        return repository.findAll();
    }

    public Prestation getPrestationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prestation introuvable avec l'id " + id));
    }

    public Prestation addPrestation(Prestation prestation) {
        return repository.save(prestation);
    }

    public Prestation updatePrestationById(Long id, Prestation prestation) {
        Prestation existante = getPrestationById(id);
        existante.setIntitule(prestation.getIntitule());
        existante.setQuantite(prestation.getQuantite());
        existante.setMontant(prestation.getMontant());
        return repository.save(existante);
    }

    public void deletePrestation(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Prestation introuvable avec l'id " + id);
        }
        repository.deleteById(id);
    }
}