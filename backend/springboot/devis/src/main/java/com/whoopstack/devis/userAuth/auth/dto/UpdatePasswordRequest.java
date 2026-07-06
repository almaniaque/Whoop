package com.whoopstack.devis.userAuth.auth.dto;

public class UpdatePasswordRequest {

    private String oldMdp;
    private String newMdp;

    public UpdatePasswordRequest() {

    }

    public UpdatePasswordRequest(String oldMdp, String newMdp) {
        this.oldMdp = oldMdp;
        this.newMdp = newMdp;
    }

    public String getOldMdp() {
        return oldMdp;
    }

    public void setOldMdp(String oldMdp) {
        this.oldMdp = oldMdp;
    }

    public String getNewMdp() {
        return newMdp;
    }

    public void setNewMdp(String newMdp) {
        this.newMdp = newMdp;
    }

}
