package com.biblioteca.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String name;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserType type;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDate createdAt = LocalDate.now();

    /**
     * Máximo de empréstimos simultâneos permitidos por tipo de usuário.
     * Utilizado pelo padrão Proxy para controle de acesso.
     */
    public int getMaxLoans() {
        return switch (this.type) {
            case PROFESSOR  -> 10;
            case ALUNO      -> 5;
            case VISITANTE  -> 2;
        };
    }

    public enum UserType {
        ALUNO, PROFESSOR, VISITANTE
    }
}
