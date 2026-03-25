package com.biblioteca.state;

import com.biblioteca.model.Loan;

/**
 * PADRÃO STATE — Estado Concreto: Atrasado
 *
 * Representa um empréstimo cujo prazo foi ultrapassado e o livro
 * ainda não foi devolvido. Gera notificação de atraso e ainda
 * permite devolução (para encerrar o empréstimo).
 */
public class AtrasadoState implements LoanState {

    @Override
    public String getStateName() {
        return "Atrasado";
    }

    @Override
    public boolean canReturn() {
        return true; // ainda pode (e deve) ser devolvido
    }

    @Override
    public boolean isOverdue() {
        return true;
    }

    @Override
    public boolean requiresOverdueNotification() {
        return true;
    }

    @Override
    public Loan.LoanStatus toStatus() {
        return Loan.LoanStatus.ATRASADO;
    }
}
