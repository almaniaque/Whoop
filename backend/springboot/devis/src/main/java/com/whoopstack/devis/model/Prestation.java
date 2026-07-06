package com.whoopstack.devis.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "prestation")
public class Prestation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPrestation;

    private String intitule;
    private int quantite;
    private int montant;

    @ManyToMany(mappedBy = "prestation")
    @JsonIgnore
    private Set<Devis> devisList = new HashSet<>();

    public Prestation(String intitule, String detail, int quantite, int montant) {
        this.intitule = intitule;
        this.quantite = quantite;
        this.montant = montant;
    }

    public String getIntitule() {
        return intitule;
    }

    public void setIntitule(String intitule) {
        this.intitule = intitule;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public int getMontant() {
        return montant;
    }

    public void setMontant(int montant) {
        this.montant = montant;
    }

    public Prestation() {
    }

    public Long getIdPrestation() {
        return idPrestation;
    }

    public void setIdPrestation(Long idPrestation) {
        this.idPrestation = idPrestation;
    }

    public Set<Devis> getDevisList() {
        return devisList;
    }

    public void setDevisList(Set<Devis> devisList) {
        this.devisList = devisList;
    }
}