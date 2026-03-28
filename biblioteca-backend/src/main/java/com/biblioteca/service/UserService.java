package com.biblioteca.service;

import com.biblioteca.dto.UserDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.factory.UserFactory;
import com.biblioteca.model.ActivityLog;
import com.biblioteca.model.User;
import com.biblioteca.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserFactory userFactory;   // PADRÃO FACTORY METHOD
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

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
     * seleciona o criador adequado (Administrador ou Visitante).
     */
    @Transactional
    public UserDTO create(UserDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("E-mail já cadastrado: " + dto.getEmail());
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BusinessException("Senha é obrigatória");
        }

        User user = userFactory.createUser(dto.getType(), dto.getName(), dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        User saved = userRepository.save(user);
        activityLogService.log(
            ActivityLog.ActivityType.CADASTRO_USUARIO,
            "Novo usuário adicionado: %s (%s).".formatted(saved.getName(), saved.getType().name().toLowerCase())
        );
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

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        log.info("Usuário atualizado: id={}", id);
        return UserDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserDTO updateProfile(Long id, String name) {
        User user = findEntityById(id);
        user.setName(name);
        User saved = userRepository.save(user);
        log.info("Usuário atualizado (perfil): id={}", id);
        return UserDTO.fromEntity(saved);
    }

    @Transactional
    public void updatePassword(Long id, String currentPassword, String newPassword) {
        User user = findEntityById(id);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Senha atual incorreta");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Senha atualizada: id={}", id);
    }

    @Transactional
    public void delete(Long id) {
        User user = findEntityById(id);
        userRepository.delete(user);
        log.info("Usuário removido: id={}", id);
    }

    @Transactional(readOnly = true)
    public UserDTO authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Credenciais inválidas"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("Credenciais inválidas");
        }

        return UserDTO.fromEntity(user);
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
                    "Tipo inválido: '%s'. Use: administrador ou visitante.".formatted(type));
        }
    }
}
