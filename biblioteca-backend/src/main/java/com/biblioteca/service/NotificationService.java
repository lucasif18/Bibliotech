package com.biblioteca.service;

import com.biblioteca.dto.NotificationDTO;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.Notification;
import com.biblioteca.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> findAll() {
        return notificationRepository.findByOrderByCreatedAtDesc().stream()
                .map(NotificationDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> findUnread() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc().stream()
                .map(NotificationDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return notificationRepository.countByReadFalse();
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação", id));
        notification.setRead(true);
        return NotificationDTO.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByReadFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Todas as notificações marcadas como lidas.");
    }

    @Transactional
    public void delete(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notificação", id);
        }
        notificationRepository.deleteById(id);
    }

    /** Criação interna usada pelo Facade ao gerar alertas automáticos */
    @Transactional
    public void createInternal(String title, String message, Notification.NotificationType type) {
        Notification n = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(n);
        log.debug("Notificação criada automaticamente: [{}] {}", type, title);
    }
}
