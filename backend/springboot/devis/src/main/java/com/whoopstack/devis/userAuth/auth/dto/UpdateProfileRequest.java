package com.whoopstack.devis.userAuth.auth.dto;

public class UpdateProfileRequest {

    private String name;
    private String nbSiret;
    private String telephone;
    private String adresse;

    public UpdateProfileRequest() {

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNbSiret() {
        return nbSiret;
    }

    public void setNbSiret(String nbSiret) {
        this.nbSiret = nbSiret;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

}