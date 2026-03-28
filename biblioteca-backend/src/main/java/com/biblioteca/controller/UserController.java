package com.biblioteca.controller;

import com.biblioteca.dto.UserDTO;
import com.biblioteca.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para gerenciamento de Usuários.
 *
 * Endpoints:
 *   GET    /api/usuarios             — lista todos os usuários
 *   GET    /api/usuarios/{id}        — busca usuário por ID
 *   GET    /api/usuarios/busca       — busca por nome ou e-mail (?q=)
 *   GET    /api/usuarios/tipo        — filtra por tipo (?tipo=administrador|visitante)
 *   POST   /api/usuarios             — cadastra novo usuário (via Factory Method)
 *   PUT    /api/usuarios/{id}        — atualiza usuário
 *   DELETE /api/usuarios/{id}        — remove usuário
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(userService.search(q));
    }

    @GetMapping("/tipo")
    public ResponseEntity<List<UserDTO>> findByType(@RequestParam String tipo) {
        return ResponseEntity.ok(userService.findByType(tipo));
    }

    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO dto) {
        UserDTO created = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id,
                                          @Valid @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
