package com.biblioteca.controller;

import com.biblioteca.dto.NotificationDTO;
import com.biblioteca.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para gerenciamento de Notificações.
 *
 * Endpoints:
 *   GET    /api/notificacoes              — lista todas as notificações
 *   GET    /api/notificacoes/nao-lidas    — apenas não lidas
 *   GET    /api/notificacoes/contagem     — total de não lidas
 *   PUT    /api/notificacoes/{id}/lida    — marca uma como lida
 *   PUT    /api/notificacoes/marcar-todas — marca todas como lidas
 *   DELETE /api/notificacoes/{id}         — remove notificação
 */
@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> findAll() {
        return ResponseEntity.ok(notificationService.findAll());
    }

    @GetMapping("/nao-lidas")
    public ResponseEntity<List<NotificationDTO>> findUnread() {
        return ResponseEntity.ok(notificationService.findUnread());
    }

    @GetMapping("/contagem")
    public ResponseEntity<Map<String, Long>> countUnread() {
        return ResponseEntity.ok(Map.of("naoLidas", notificationService.countUnread()));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/marcar-todas")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
