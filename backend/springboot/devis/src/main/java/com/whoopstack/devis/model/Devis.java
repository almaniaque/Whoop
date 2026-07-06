package com.whoopstack.devis.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.whoopstack.devis.userAuth.user.AppUser;
import jakarta.persistence.CascadeType;

@Entity
@Table(name = "devis")
public class Devis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(pattern = "dd MMMM yyyy", locale = "fr")
    private LocalDate date;

    @JsonFormat(pattern = "dd MMMM yyyy", locale = "fr")

    private LocalDate echeance;
    private String categorie;

    private String statut;

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "devis_prestation", joinColumns = @JoinColumn(name = "devis_id"), inverseJoinColumns = @JoinColumn(name = "prestation_id"))
    @JsonManagedReference
    private Set<Prestation> prestation = new HashSet<>();

    public Devis(Long id, LocalDate date, LocalDate echeance, String categorie, int montant, String statut,
            Set<Prestation> prestation, Client client, AppUser user) {
        this.id = id;
        this.date = date;
        this.echeance = echeance;
        this.categorie = categorie;

        this.statut = statut;
        this.prestation = prestation;
        this.client = client;
        this.user = user;
    }

    public Set<Prestation> getPrestation() {
        return prestation;
    }

    public void setPrestation(Set<Prestation> prestation) {
        this.prestation = prestation;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Devis() {

    }

    public Devis(Client client) {
        this.client = client;
    }

    public Client getClient() {
        return client;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
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

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

}