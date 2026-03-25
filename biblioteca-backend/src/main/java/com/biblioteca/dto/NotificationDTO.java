package com.biblioteca.dto;

import com.biblioteca.model.Notification;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String createdAt;

    public static NotificationDTO fromEntity(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name().toLowerCase())
                .read(n.isRead())
                .createdAt(n.getCreatedAt().toString())
                .build();
    }
}
