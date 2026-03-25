package com.biblioteca.iterator;

import com.biblioteca.model.Book;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * PADRÃO ITERATOR — Iterador Concreto: Livros
 *
 * Percorre uma coleção de {@link Book} de forma encapsulada.
 * Permite filtrar apenas livros disponíveis sem alterar
 * a coleção original ou expor detalhes de implementação.
 */
public class BookIterator implements LibraryIterator<Book> {

    private final List<Book> books;
    private int cursor;

    public BookIterator(List<Book> books) {
        this.books = List.copyOf(books);
        this.cursor = 0;
    }

    @Override
    public boolean hasNext() {
        return cursor < books.size();
    }

    @Override
    public Book next() {
        if (!hasNext()) {
            throw new NoSuchElementException("Não há mais livros na coleção.");
        }
        return books.get(cursor++);
    }

    @Override
    public void reset() {
        cursor = 0;
    }

    /**
     * Retorna um novo iterador filtrando apenas livros disponíveis.
     */
    public static BookIterator onlyAvailable(List<Book> books) {
        List<Book> available = books.stream()
                .filter(b -> b.getAvailable() > 0)
                .toList();
        return new BookIterator(available);
    }
}
