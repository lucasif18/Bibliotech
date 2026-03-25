package com.biblioteca.controller;

import com.biblioteca.dto.BookDTO;
import com.biblioteca.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Livros.
 *
 * Endpoints:
 *   GET    /api/livros              — lista todos os livros
 *   GET    /api/livros/{id}         — busca livro por ID
 *   GET    /api/livros/busca        — busca por título ou autor (?q=)
 *   GET    /api/livros/disponiveis  — apenas livros com estoque > 0
 *   GET    /api/livros/categoria    — filtra por categoria (?categoria=)
 *   POST   /api/livros              — cadastra novo livro
 *   PUT    /api/livros/{id}         — atualiza livro existente
 *   DELETE /api/livros/{id}         — remove livro
 */
@RestController
@RequestMapping("/api/livros")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<BookDTO>> findAll() {
        return ResponseEntity.ok(bookService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findById(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<BookDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(bookService.search(q));
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<BookDTO>> findAvailable() {
        return ResponseEntity.ok(bookService.findAvailable());
    }

    @GetMapping("/categoria")
    public ResponseEntity<List<BookDTO>> findByCategory(@RequestParam String categoria) {
        return ResponseEntity.ok(bookService.findByCategory(categoria));
    }

    @PostMapping
    public ResponseEntity<BookDTO> create(@Valid @RequestBody BookDTO dto) {
        BookDTO created = bookService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDTO> update(@PathVariable Long id,
                                          @Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(bookService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
