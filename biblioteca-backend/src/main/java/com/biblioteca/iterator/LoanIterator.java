package com.biblioteca.iterator;

import com.biblioteca.model.Loan;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * PADRÃO ITERATOR — Iterador Concreto: Empréstimos
 *
 * Percorre uma coleção de {@link Loan} de forma encapsulada.
 * Útil para varrer empréstimos ativos, detectar atrasos
 * e gerar relatórios sem expor a estrutura interna.
 */
public class LoanIterator implements LibraryIterator<Loan> {

    private final List<Loan> loans;
    private int cursor;

    public LoanIterator(List<Loan> loans) {
        this.loans = List.copyOf(loans);
        this.cursor = 0;
    }

    @Override
    public boolean hasNext() {
        return cursor < loans.size();
    }

    @Override
    public Loan next() {
        if (!hasNext()) {
            throw new NoSuchElementException("Não há mais empréstimos na coleção.");
        }
        return loans.get(cursor++);
    }

    @Override
    public void reset() {
        cursor = 0;
    }

    /**
     * Retorna um iterador filtrando apenas empréstimos atrasados.
     */
    public static LoanIterator onlyOverdue(List<Loan> loans) {
        List<Loan> overdue = loans.stream()
                .filter(Loan::isOverdue)
                .toList();
        return new LoanIterator(overdue);
    }

    /**
     * Retorna um iterador filtrando apenas empréstimos ativos.
     */
    public static LoanIterator onlyActive(List<Loan> loans) {
        List<Loan> active = loans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.ATIVO)
                .toList();
        return new LoanIterator(active);
    }
}
