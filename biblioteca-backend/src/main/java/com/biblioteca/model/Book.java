package com.biblioteca.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "livros")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Título é obrigatório")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Autor é obrigatório")
    @Column(nullable = false)
    private String author;

    @NotBlank(message = "Categoria é obrigatória")
    @Column(nullable = false)
    private String category;

    @NotBlank(message = "ISBN é obrigatório")
    @Column(unique = true, nullable = false)
    private String isbn;

    @Min(value = 1, message = "Quantidade deve ser ao menos 1")
    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int available;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookStatus status = BookStatus.DISPONIVEL;

    public enum BookStatus {
        DISPONIVEL, EMPRESTADO
    }

    /** Atualiza o status com base na disponibilidade */
    public void recalculateStatus() {
        this.status = (this.available > 0) ? BookStatus.DISPONIVEL : BookStatus.EMPRESTADO;
    }
}
