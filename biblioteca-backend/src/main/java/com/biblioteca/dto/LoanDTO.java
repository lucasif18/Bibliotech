package com.biblioteca.dto;

import com.biblioteca.model.Loan;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDTO {

    private Long id;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long userId;

    private String userName;

    @NotNull(message = "ID do livro é obrigatório")
    private Long bookId;

    private String bookTitle;
    private String loanDate;

    @NotBlank(message = "Data de devolução é obrigatória")
    private String returnDate;

    private String status;

    public static LoanDTO fromEntity(Loan loan) {
        return LoanDTO.builder()
                .id(loan.getId())
                .userId(loan.getUser().getId())
                .userName(loan.getUser().getName())
                .bookId(loan.getBook().getId())
                .bookTitle(loan.getBook().getTitle())
                .loanDate(loan.getLoanDate().toString())
                .returnDate(loan.getReturnDate().toString())
                .status(loan.getStatus().name().toLowerCase())
                .build();
    }
}
