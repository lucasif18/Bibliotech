package com.biblioteca.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção de regra de negócio — mapeada para HTTP 422 Unprocessable Entity.
 * Usada quando a requisição é sintaticamente válida, mas viola uma
 * regra de negócio (ex: livro sem estoque, usuário no limite de empréstimos).
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
