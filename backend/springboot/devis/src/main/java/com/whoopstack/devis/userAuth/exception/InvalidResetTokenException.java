package com.whoopstack.devis.userAuth.exception;

import org.springframework.http.HttpStatus;

public class InvalidResetTokenException extends ApiException {
    public InvalidResetTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED); // 401
    }
}
