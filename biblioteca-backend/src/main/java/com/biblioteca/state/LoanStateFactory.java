package com.biblioteca.state;

import com.biblioteca.model.Loan;

/**
 * Fábrica utilitária para instanciar o {@link LoanState} correto
 * a partir do {@link Loan.LoanStatus} persistido no banco.
 */
public final class LoanStateFactory {

    private LoanStateFactory() {}

    public static LoanState from(Loan.LoanStatus status) {
        return switch (status) {
            case ATIVO      -> new AtivoState();
            case ATRASADO   -> new AtrasadoState();
            case FINALIZADO -> new FinalizadoState();
        };
    }
}
