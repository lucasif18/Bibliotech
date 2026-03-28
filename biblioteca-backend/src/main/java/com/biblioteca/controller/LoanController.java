package com.biblioteca.controller;

import com.biblioteca.dto.LoanDTO;
import com.biblioteca.exception.AccessDeniedException;
import com.biblioteca.model.User;
import com.biblioteca.proxy.LoanServiceProxy;
import com.biblioteca.security.AuthorizationService;
import com.biblioteca.service.LoanService;
import com.biblioteca.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

/**
 * Controller REST para gerenciamento de Empréstimos.
 *
 * Operações sensíveis (criar e devolver) passam pelo PROXY,
 * que verifica permissões antes de delegar ao FACADE.
 *
 * Controle de Acesso:
 * - GET /api/emprestimos                   — ADMIN apenas
 * - GET /api/emprestimos/{id}              — ADMIN ou proprietário
 * - GET /api/emprestimos/busca             — ADMIN apenas
 * - GET /api/emprestimos/status            — ADMIN apenas
 * - GET /api/emprestimos/usuario/{userId}  — ADMIN ou o próprio usuário
 * - GET /api/emprestimos/atualizar-atrasos — ADMIN apenas
 * - POST /api/emprestimos                  — ADMIN apenas
 * - POST /api/emprestimos/{id}/devolver    — ADMIN ou proprietário
 * - DELETE /api/emprestimos/{id}           — ADMIN apenas
 */
@RestController
@RequestMapping("/api/emprestimos")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;
    private final LoanServiceProxy loanProxy;
    private final AuthorizationService authService;
    private final UserService userService;

    // ─── Rotas específicas (devem vir primeiro) ───────────────────────────────────
    @GetMapping("/busca")
    public ResponseEntity<List<LoanDTO>> search(@RequestParam String q,
                                               @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(loanService.search(q));
    }

    @GetMapping("/status")
    public ResponseEntity<List<LoanDTO>> findByStatus(@RequestParam String status,
                                                     @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(loanService.findByStatus(status));
    }

    @GetMapping("/atualizar-atrasos")
    public ResponseEntity<List<LoanDTO>> refreshOverdue(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(loanService.refreshOverdueStatus());
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<LoanDTO>> findByUser(@PathVariable Long userId,
                                                   @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAccessToUserLoans(authorization, userId);
        return ResponseEntity.ok(loanService.findByUserId(userId));
    }

    // ─── Rotas genéricas (com {id}, vêm por último) ──────────────────────────────
    @GetMapping
    public ResponseEntity<List<LoanDTO>> findAll(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(loanService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanDTO> findById(@PathVariable Long id,
                                           @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        LoanDTO loan = loanService.findById(id);
        requireAccessToLoan(authorization, loan.getUserId());
        return ResponseEntity.ok(loan);
    }

    @PostMapping
    public ResponseEntity<LoanDTO> create(@Valid @RequestBody LoanDTO dto,
                                         @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        LoanDTO created = loanProxy.createLoan(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<LoanDTO> returnLoan(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminForReturn(authorization);
        return ResponseEntity.ok(loanProxy.returnLoan(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                      @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        loanService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Métodos auxiliares ──────────────────────────────────────────────────────

    /**
     * Verifica se o usuário autenticado é administrador.
     */
    private void requireAdminAccess(String authorization) {
        User user = extractUserFromHeader(authorization);
        if (user == null || !authService.isAdmin(user)) {
            throw new AccessDeniedException("Acesso negado. Apenas administradores podem acessar este recurso.");
        }
    }

    /**
     * Verifica se o usuário é administrador para registrar devolução.
     */
    private void requireAdminForReturn(String authorization) {
        User user = extractUserFromHeader(authorization);
        if (user == null || !authService.isAdmin(user)) {
            throw new AccessDeniedException("Somente administradores podem registrar devoluções.");
        }
    }

    /**
     * Verifica se o usuário tem acesso a um empréstimo específico.
     * Administradores têm acesso total, visitantes apenas aos seus próprios.
     */
    private void requireAccessToLoan(String authorization, Long loanUserId) {
        User user = extractUserFromHeader(authorization);
        if (user == null || !authService.canAccessUserResource(user, loanUserId)) {
            throw new AccessDeniedException("Acesso negado. Você não tem permissão para acessar este empréstimo.");
        }
    }

    /**
     * Verifica se o usuário tem acesso aos empréstimos de um usuário específico.
     * Administradores têm acesso total, visitantes apenas aos seus próprios.
     */
    private void requireAccessToUserLoans(String authorization, Long targetUserId) {
        User user = extractUserFromHeader(authorization);
        if (user == null || !authService.canAccessUserResource(user, targetUserId)) {
            throw new AccessDeniedException("Acesso negado. Você não tem permissão para acessar empréstimos deste usuário.");
        }
    }

    /**
     * Extrai o usuário do header Authorization.
     */
    private User extractUserFromHeader(String authorization) {
        Optional<Long> userId = getUserIdFromBearerToken(authorization);
        if (userId.isEmpty()) {
            return null;
        }
        try {
            return userService.findEntityById(userId.get());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extrai o ID do usuário do token bearer.
     */
    private Optional<Long> getUserIdFromBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorization.substring(7);
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            if (!decoded.startsWith("user:")) {
                return Optional.empty();
            }
            return Optional.of(Long.parseLong(decoded.substring(5)));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
