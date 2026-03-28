package com.biblioteca.controller;

import com.biblioteca.dto.ReservationDTO;
import com.biblioteca.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Reservas.
 *
 * Endpoints:
 * GET /api/reservas — lista todas as reservas
 * GET /api/reservas/{id} — busca por ID
 * GET /api/reservas/busca — busca por usuário ou livro (?q=)
 * GET /api/reservas/status — filtra por status
 * (?status=pendente|disponivel|cancelada)
 * POST /api/reservas — cria nova reserva
 * POST /api/reservas/{id}/cancelar — cancela reserva
 * DELETE /api/reservas/{id} — remove reserva
 */
@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

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
    public ResponseEntity<ReservationDTO> create(@Valid @RequestBody ReservationDTO dto) {
        ReservationDTO created = reservationService.create(dto);
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
}
