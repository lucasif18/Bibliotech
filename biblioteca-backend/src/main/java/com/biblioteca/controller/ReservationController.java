package com.biblioteca.controller;

import com.biblioteca.dto.ReservationDTO;
import com.biblioteca.model.User;
import com.biblioteca.security.AuthorizationService;
import com.biblioteca.service.ReservationService;
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
 * Controller REST para gerenciamento de Reservas.
 *
 * Endpoints:
 *   GET    /api/reservas              — lista todas as reservas
 *   GET    /api/reservas/{id}         — busca por ID
 *   GET    /api/reservas/busca        — busca por usuário ou livro (?q=)
 *   GET    /api/reservas/status       — filtra por status (?status=pendente|disponivel|cancelada)
 *   POST   /api/reservas              — cria nova reserva
 *   POST   /api/reservas/{id}/cancelar — cancela reserva
 *   DELETE /api/reservas/{id}         — remove reserva
 */
@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;
    private final AuthorizationService authService;

    @GetMapping
    public ResponseEntity<List<ReservationDTO>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<ReservationDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(reservationService.search(q));
    }

    @GetMapping("/status")
    public ResponseEntity<List<ReservationDTO>> findByStatus(@RequestParam String status) {
        return ResponseEntity.ok(reservationService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<ReservationDTO> create(@Valid @RequestBody ReservationDTO dto,
                                                  @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        User requester = extractUserFromHeader(authorization);
        boolean createdByAdmin = authService.isAdmin(requester);
        ReservationDTO created = reservationService.create(dto, createdByAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<ReservationDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }

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
