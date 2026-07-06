package com.whoopstack.devis.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.whoopstack.devis.model.Prestation;
import com.whoopstack.devis.service.PrestationService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("api/prestations")
public class PrestationController {

    private final PrestationService service;

    public PrestationController(PrestationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Prestation>> getAllPrestations() {
        return ResponseEntity.ok(service.getAllPrestations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestation> getPrestationById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPrestationById(id));
    }

    @PostMapping
    public ResponseEntity<Prestation> creerPrestation(@RequestBody Prestation prestation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addPrestation(prestation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prestation> updatePrestationById(@PathVariable Long id, @RequestBody Prestation prestation) {
        return ResponseEntity.ok(service.updatePrestationById(id, prestation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerPrestation(@PathVariable Long id) {
        service.deletePrestation(id);
        return ResponseEntity.noContent().build();
    }
}