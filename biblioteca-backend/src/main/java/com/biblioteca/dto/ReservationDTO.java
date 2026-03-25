package com.biblioteca.dto;

import com.biblioteca.model.Reservation;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationDTO {

    private Long id;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long userId;

    private String userName;

    @NotNull(message = "ID do livro é obrigatório")
    private Long bookId;

    private String bookTitle;
    private String reservationDate;
    private String status;

    public static ReservationDTO fromEntity(Reservation r) {
        return ReservationDTO.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .reservationDate(r.getReservationDate().toString())
                .status(r.getStatus().name().toLowerCase())
                .build();
    }
}
