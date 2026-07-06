package com.whoopstack.devis.userAuth.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends ApiException {
    public EmailAlreadyExistsException(String message) {
        super(message, HttpStatus.CONFLICT); // 409
    }
}
