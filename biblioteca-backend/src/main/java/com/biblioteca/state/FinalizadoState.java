package com.biblioteca.state;

import com.biblioteca.model.Loan;
import com.biblioteca.exception.BusinessException;

/**
 * PADRÃO STATE — Estado Concreto: Finalizado
 *
 * Representa um empréstimo já encerrado (livro devolvido).
 * Neste estado nenhuma operação de devolução é permitida.
 */
public class FinalizadoState implements LoanState {

    @Override
    public String getStateName() {
        return "Finalizado";
    }

    @Override
    public boolean canReturn() {
        return false; // empréstimo já encerrado
    }

    @Override
    public boolean isOverdue() {
        return false;
    }

    @Override
    public boolean requiresOverdueNotification() {
        return false;
    }

    @Override
    public Loan.LoanStatus toStatus() {
        return Loan.LoanStatus.FINALIZADO;
    }
}
