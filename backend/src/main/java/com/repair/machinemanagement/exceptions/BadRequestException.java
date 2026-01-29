package com.repair.machinemanagement.exceptions;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String me) {
        super(me);
    }
}

