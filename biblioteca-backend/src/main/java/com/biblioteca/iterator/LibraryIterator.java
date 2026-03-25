package com.biblioteca.iterator;

/**
 * PADRÃO ITERATOR — Interface do Iterador
 *
 * Define o contrato de iteração genérico para coleções da biblioteca.
 * Permite percorrer livros, empréstimos ou qualquer coleção
 * sem expor a estrutura interna de dados subjacente.
 *
 * @param <T> tipo dos elementos da coleção
 */
public interface LibraryIterator<T> {

    /** Verifica se há mais elementos a percorrer */
    boolean hasNext();

    /** Retorna o próximo elemento da coleção */
    T next();

    /** Reinicia o cursor para o início da coleção */
    void reset();
}
