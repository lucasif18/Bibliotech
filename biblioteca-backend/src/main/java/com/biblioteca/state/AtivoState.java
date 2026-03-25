package com.biblioteca.state;

import com.biblioteca.model.Loan;

/**
 * PADRÃO STATE — Estado Concreto: Ativo
 *
 * Representa um empréstimo dentro do prazo, ainda não devolvido.
 * Neste estado o livro pode ser devolvido e não há notificação de atraso.
 */
public class AtivoState implements LoanState {

    @Override
    public String getStateName() {
        return "Ativo";
    }

    @Override
    public boolean canReturn() {
        return true;
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
        return Loan.LoanStatus.ATIVO;
    }
}
