package com.whoopstack.devis.ressource;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class DevisCreateRequest {

    private LocalDate date;
    private LocalDate echeance;
    private String categorie;
    private String statut;

    private Set<Long> prestationIds = new HashSet<>();

    public DevisCreateRequest() {
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate getEcheance() {
        return echeance;
    }

    public void setEcheance(LocalDate echeance) {
        this.echeance = echeance;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Set<Long> getPrestationIds() {
        return prestationIds;
    }

    public void setPrestationIds(Set<Long> prestationIds) {
        this.prestationIds = prestationIds;
    }
}