package com.biblioteca.state;

import com.biblioteca.model.Loan;

/**
 * PADRÃO STATE — Interface de Estado
 *
 * Define as operações que variam de acordo com o estado atual do empréstimo.
 * Cada estado concreto (Ativo, Atrasado, Finalizado) implementa
 * este contrato com seu próprio comportamento — eliminando condicionais
 * extensas (if/else ou switch) no código do serviço.
 */
public interface LoanState {

    /**
     * Retorna o nome legível do estado atual.
     */
    String getStateName();

    /**
     * Verifica se o empréstimo pode ser devolvido a partir deste estado.
     */
    boolean canReturn();

    /**
     * Verifica se o empréstimo está em atraso a partir deste estado.
     */
    boolean isOverdue();

    /**
     * Determina se uma notificação de atraso deve ser gerada.
     */
    boolean requiresOverdueNotification();

    /**
     * Retorna o enum {@link Loan.LoanStatus} correspondente a este estado.
     */
    Loan.LoanStatus toStatus();
}
