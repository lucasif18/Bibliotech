package com.biblioteca.controller;

import com.biblioteca.dto.LoanDTO;
import com.biblioteca.proxy.LoanServiceProxy;
import com.biblioteca.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Empréstimos.
 *
 * Operações sensíveis (criar e devolver) passam pelo PROXY,
 * que verifica permissões antes de delegar ao FACADE.
 *
 * Endpoints:
 *   GET    /api/emprestimos                   — lista todos os empréstimos
 *   GET    /api/emprestimos/{id}              — busca por ID
 *   GET    /api/emprestimos/busca             — busca por usuário ou livro (?q=)
 *   GET    /api/emprestimos/status            — filtra por status (?status=ativo|atrasado|finalizado)
 *   GET    /api/emprestimos/usuario/{userId}  — empréstimos de um usuário
 *   GET    /api/emprestimos/atualizar-atrasos — atualiza status de atrasados (job manual)
 *   POST   /api/emprestimos                   — cria empréstimo (via Proxy → Facade)
 *   POST   /api/emprestimos/{id}/devolver     — devolução (via Proxy → Facade)
 *   DELETE /api/emprestimos/{id}              — remove empréstimo finalizado
 */
@RestController
@RequestMapping("/api/emprestimos")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;         // consultas
    private final LoanServiceProxy loanProxy;      // operações sensíveis (Proxy → Facade)

    @GetMapping
    public ResponseEntity<List<LoanDTO>> findAll() {
        return ResponseEntity.ok(loanService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.findById(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<LoanDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(loanService.search(q));
    }

    @GetMapping("/status")
    public ResponseEntity<List<LoanDTO>> findByStatus(@RequestParam String status) {
        return ResponseEntity.ok(loanService.findByStatus(status));
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<LoanDTO>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(loanService.findByUserId(userId));
    }

    @GetMapping("/atualizar-atrasos")
    public ResponseEntity<List<LoanDTO>> refreshOverdue() {
        return ResponseEntity.ok(loanService.refreshOverdueStatus());
    }

    /**
     * Criação de empréstimo — passa pelo PROXY (controle de acesso)
     * que delega ao FACADE (orquestração do fluxo completo).
     */
    @PostMapping
    public ResponseEntity<LoanDTO> create(@Valid @RequestBody LoanDTO dto) {
        LoanDTO created = loanProxy.createLoan(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Devolução de livro — passa pelo PROXY antes de chegar ao FACADE.
     * O parâmetro {@code userId} é opcional; quando fornecido, o Proxy
     * verifica se o solicitante é o dono do empréstimo.
     */
    @PostMapping("/{id}/devolver")
    public ResponseEntity<LoanDTO> returnLoan(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(loanProxy.returnLoan(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        loanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
