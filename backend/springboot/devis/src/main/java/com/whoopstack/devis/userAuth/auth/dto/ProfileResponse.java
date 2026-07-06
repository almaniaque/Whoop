package com.whoopstack.devis.userAuth.auth.dto;

public class ProfileResponse {

    private Boolean success;
    private String message;
    private Long userId;
    private String email;
    private String name;
    private String nbSiret;
    private String telephone;
    private String adresse;
    private String photoUrl;

    public ProfileResponse() {

    }

    public ProfileResponse(Boolean success, String message, Long userId, String email,
            String name, String nbSiret, String telephone, String adresse, String photoUrl) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.nbSiret = nbSiret;
        this.telephone = telephone;
        this.adresse = adresse;
        this.photoUrl = photoUrl;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

}