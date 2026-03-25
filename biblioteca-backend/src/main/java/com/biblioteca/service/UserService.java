package com.biblioteca.service;

import com.biblioteca.dto.UserDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.factory.UserFactory;
import com.biblioteca.model.User;
import com.biblioteca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserFactory userFactory;   // PADRÃO FACTORY METHOD

    // ─── Consultas ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        return UserDTO.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> search(String query) {
        return userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findByType(String type) {
        User.UserType userType = parseType(type);
        return userRepository.findByType(userType).stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    // ─── Persistência ────────────────────────────────────────────────────────────

    /**
     * Delega a criação ao PADRÃO FACTORY METHOD — o UserFactory
     * seleciona o criador adequado (Aluno, Professor ou Visitante).
     */
    @Transactional
    public UserDTO create(UserDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("E-mail já cadastrado: " + dto.getEmail());
        }

        User user = userFactory.createUser(dto.getType(), dto.getName(), dto.getEmail());
        User saved = userRepository.save(user);
        log.info("Usuário criado via Factory: id={}, tipo={}", saved.getId(), saved.getType());
        return UserDTO.fromEntity(saved);
    }

    @Transactional
    public UserDTO update(Long id, UserDTO dto) {
        User user = findEntityById(id);

        // Verifica e-mail duplicado em outro usuário
        userRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BusinessException("E-mail já está em uso por outro usuário.");
            }
        });

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setType(parseType(dto.getType()));

        log.info("Usuário atualizado: id={}", id);
        return UserDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = findEntityById(id);
        userRepository.delete(user);
        log.info("Usuário removido: id={}", id);
    }

    // ─── Métodos internos ────────────────────────────────────────────────────────

    public User findEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }

    private User.UserType parseType(String type) {
        try {
            return User.UserType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Tipo inválido: '%s'. Use: aluno, professor ou visitante.".formatted(type));
        }
    }
}
