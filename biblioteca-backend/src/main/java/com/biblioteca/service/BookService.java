package com.biblioteca.service;

import com.biblioteca.dto.BookDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.iterator.BookIterator;
import com.biblioteca.model.ActivityLog;
import com.biblioteca.model.Book;
import com.biblioteca.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final ActivityLogService activityLogService;

    // ─── Consultas ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BookDTO> findAll() {
        return bookRepository.findAll().stream()
                .map(BookDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookDTO findById(Long id) {
        return BookDTO.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<BookDTO> search(String query) {
        return bookRepository
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query)
                .stream()
                .map(BookDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookDTO> findByCategory(String category) {
        return bookRepository.findByCategory(category).stream()
                .map(BookDTO::fromEntity)
                .toList();
    }

    /**
     * Utiliza o PADRÃO ITERATOR para percorrer apenas livros disponíveis
     * de forma encapsulada, sem expor a coleção interna.
     */
    @Transactional(readOnly = true)
    public List<BookDTO> findAvailable() {
        List<Book> allBooks = bookRepository.findAll();
        BookIterator iterator = BookIterator.onlyAvailable(allBooks);

        List<BookDTO> result = new java.util.ArrayList<>();
        while (iterator.hasNext()) {
            result.add(BookDTO.fromEntity(iterator.next()));
        }
        return result;
    }

    // ─── Persistência ────────────────────────────────────────────────────────────

    @Transactional
    public BookDTO create(BookDTO dto) {
        if (bookRepository.findByIsbn(dto.getIsbn()).isPresent()) {
            throw new BusinessException("Já existe um livro cadastrado com o ISBN: " + dto.getIsbn());
        }

        Book book = Book.builder()
                .title(dto.getTitle())
                .author(dto.getAuthor())
                .category(dto.getCategory())
                .isbn(dto.getIsbn())
                .quantity(dto.getQuantity())
                .available(dto.getQuantity())
                .status(Book.BookStatus.DISPONIVEL)
                .build();

        Book saved = bookRepository.save(book);
        activityLogService.log(
            ActivityLog.ActivityType.CADASTRO_LIVRO,
            "Novo livro adicionado: '%s' (%s).".formatted(saved.getTitle(), saved.getIsbn())
        );
        log.info("Livro criado: id={}, isbn={}", saved.getId(), saved.getIsbn());
        return BookDTO.fromEntity(saved);
    }

    @Transactional
    public BookDTO update(Long id, BookDTO dto) {
        Book book = findEntityById(id);

        // Valida ISBN duplicado em outro livro
        bookRepository.findByIsbn(dto.getIsbn()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BusinessException("ISBN já está em uso por outro livro.");
            }
        });

        int borrowed = book.getQuantity() - book.getAvailable();
        int newAvailable = dto.getQuantity() - borrowed;

        if (newAvailable < 0) {
            throw new BusinessException(
                    "Quantidade insuficiente: há %d exemplar(es) emprestado(s).".formatted(borrowed));
        }

        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setCategory(dto.getCategory());
        book.setIsbn(dto.getIsbn());
        book.setQuantity(dto.getQuantity());
        book.setAvailable(newAvailable);
        book.recalculateStatus();

        log.info("Livro atualizado: id={}", id);
        return BookDTO.fromEntity(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        Book book = findEntityById(id);
        int borrowed = book.getQuantity() - book.getAvailable();
        if (borrowed > 0) {
            throw new BusinessException(
                    "Não é possível excluir o livro pois há %d exemplar(es) emprestado(s).".formatted(borrowed));
        }
        bookRepository.delete(book);
        log.info("Livro removido: id={}", id);
    }

    // ─── Métodos de uso interno (chamados pelo Facade/Proxy) ─────────────────────

    @Transactional
    public void decrementAvailable(Long bookId) {
        Book book = findEntityById(bookId);
        if (book.getAvailable() <= 0) {
            throw new BusinessException("Livro '" + book.getTitle() + "' sem exemplares disponíveis.");
        }
        book.setAvailable(book.getAvailable() - 1);
        book.recalculateStatus();
        bookRepository.save(book);
    }

    @Transactional
    public void incrementAvailable(Long bookId) {
        Book book = findEntityById(bookId);
        book.setAvailable(book.getAvailable() + 1);
        book.recalculateStatus();
        bookRepository.save(book);
    }

    public Book findEntityById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livro", id));
    }
}
