package com.biblioteca.dto;

import com.biblioteca.model.Book;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {

    private Long id;

    @NotBlank(message = "Título é obrigatório")
    private String title;

    @NotBlank(message = "Autor é obrigatório")
    private String author;

    @NotBlank(message = "Categoria é obrigatória")
    private String category;

    @NotBlank(message = "ISBN é obrigatório")
    private String isbn;

    @Min(value = 1, message = "Quantidade deve ser ao menos 1")
    private int quantity;

    private int available;
    private String status;

    public static BookDTO fromEntity(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .category(book.getCategory())
                .isbn(book.getIsbn())
                .quantity(book.getQuantity())
                .available(book.getAvailable())
                .status(book.getStatus().name().toLowerCase())
                .build();
    }
}
