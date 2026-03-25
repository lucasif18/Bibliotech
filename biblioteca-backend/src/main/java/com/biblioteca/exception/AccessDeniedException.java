package com.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção de acesso negado — mapeada para HTTP 403 Forbidden.
 * Lançada pelo Proxy quando o usuário não tem permissão
 * para executar a operação solicitada.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
