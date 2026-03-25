package com.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção para entidades não encontradas — mapeada para HTTP 404 Not Found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Long id) {
        super("%s com ID %d não encontrado(a).".formatted(resource, id));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
