package com.whoopstack.devis.ressource;

import java.time.LocalDate;

public class DevisClientDto {

    private Long id;
    private String categorie;
    private LocalDate date;
    private LocalDate echeance;
    private int montant;
    private String statut;

    public DevisClientDto() {
    }

    public DevisClientDto(Long id, String categorie, LocalDate date, LocalDate echeance, int montant, String statut) {
        this.id = id;
        this.categorie = categorie;
        this.date = date;
        this.echeance = echeance;
        this.montant = montant;
        this.statut = statut;
    }

    public Long getId() {
        return id;
    }

    public String getCategorie() {
        return categorie;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalDate getEcheance() {
        return echeance;
    }

    public int getMontant() {
        return montant;
    }

    public String getStatut() {
        return statut;
    }
}