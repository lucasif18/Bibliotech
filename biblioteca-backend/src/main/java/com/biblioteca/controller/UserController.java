package com.biblioteca.controller;

import com.biblioteca.dto.UserDTO;
import com.biblioteca.exception.AccessDeniedException;
import com.biblioteca.model.User;
import com.biblioteca.security.AuthorizationService;
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
 * Controller REST para gerenciamento de Usuários.
 *
 * Endpoints:
 *   GET    /api/usuarios             — lista todos os usuários (ADMIN)
 *   GET    /api/usuarios/{id}        — busca usuário por ID (ADMIN)
 *   GET    /api/usuarios/busca       — busca por nome ou e-mail (ADMIN)
 *   GET    /api/usuarios/tipo        — filtra por tipo (ADMIN)
 *   POST   /api/usuarios             — cadastra novo usuário (ADMIN)
 *   PUT    /api/usuarios/{id}        — atualiza usuário (ADMIN)
 *   DELETE /api/usuarios/{id}        — remove usuário (ADMIN)
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthorizationService authService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> findAll(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id,
                                           @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String q,
                                               @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(userService.search(q));
    }

    @GetMapping("/tipo")
    public ResponseEntity<List<UserDTO>> findByType(@RequestParam String tipo,
                                                   @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(userService.findByType(tipo));
    }

    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO dto,
                                         @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        UserDTO created = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id,
                                          @Valid @RequestBody UserDTO dto,
                                          @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                      @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        requireAdminAccess(authorization);
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Métodos auxiliares ──────────────────────────────────────────────────────

    /**
     * Verifica se o usuário autenticado é administrador.
     * Lança AccessDeniedException se não for.
     */
    private void requireAdminAccess(String authorization) {
        User user = extractUserFromHeader(authorization);
        if (user == null || !authService.isAdmin(user)) {
            throw new AccessDeniedException("Acesso negado. Apenas administradores podem acessar este recurso.");
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
        return userService.findEntityById(userId.get());
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
