package com.biblioteca.facade;

import com.biblioteca.dto.LoanDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.model.*;
import com.biblioteca.service.*;
import com.biblioteca.state.LoanStateFactory;
import com.biblioteca.state.LoanState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * PADRÃO FACADE — Fachada do Fluxo de Empréstimo
 *
 * Encapsula a complexidade do processo completo de empréstimo e devolução,
 * oferecendo ao Controller uma interface simples com apenas dois métodos.
 *
 * Fluxo de criação de empréstimo:
 *   1. Busca o usuário e o livro
 *   2. Valida disponibilidade do livro
 *   3. Valida limite de empréstimos do usuário (delegado ao Proxy)
 *   4. Cria a entidade Loan com estado ATIVO
 *   5. Decrementa o estoque disponível
 *   6. Persiste e gera notificação de confirmação
 *
 * Fluxo de devolução:
 *   1. Verifica o estado atual via PADRÃO STATE
 *   2. Finaliza o empréstimo
 *   3. Incrementa o estoque do livro
 *   4. Verifica e notifica reservas pendentes
 *   5. Gera notificação de devolução
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LoanFacade {

    private final LoanService loanService;
    private final BookService bookService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final ReservationService reservationService;

    /**
     * Orquestra todo o fluxo de criação de um empréstimo.
     *
     * @param dto  dados do empréstimo (userId, bookId, returnDate)
     * @return     DTO do empréstimo criado
     */
    @Transactional
    public LoanDTO createLoan(LoanDTO dto) {
        log.debug("Facade: iniciando criação de empréstimo — user={}, book={}", dto.getUserId(), dto.getBookId());

        // Passo 1 — Resolver entidades
        User user = userService.findEntityById(dto.getUserId());
        Book book = bookService.findEntityById(dto.getBookId());

        // Passo 2 — Validar disponibilidade
        if (book.getAvailable() <= 0) {
            throw new BusinessException(
                    "O livro '" + book.getTitle() + "' não possui exemplares disponíveis. Faça uma reserva.");
        }

        // Passo 3 — Validar data de devolução
        LocalDate returnDate = LocalDate.parse(dto.getReturnDate());
        if (!returnDate.isAfter(LocalDate.now())) {
            throw new BusinessException("A data de devolução deve ser posterior à data atual.");
        }

        // Passo 4 — Montar e persistir o empréstimo
        Loan loan = Loan.builder()
                .user(user)
                .book(book)
                .loanDate(LocalDate.now())
                .returnDate(returnDate)
                .status(Loan.LoanStatus.ATIVO)
                .build();

        Loan saved = loanService.createRaw(loan);

        // Passo 5 — Decrementar estoque
        bookService.decrementAvailable(book.getId());

        // Passo 6 — Notificar
        notificationService.createInternal(
                "Empréstimo Confirmado",
                "O empréstimo do livro \"" + book.getTitle() + "\" para " + user.getName() + " foi registrado.",
                Notification.NotificationType.SUCCESS
        );

        log.info("Facade: empréstimo criado com sucesso — loanId={}", saved.getId());
        return LoanDTO.fromEntity(saved);
    }

    /**
     * Orquestra todo o fluxo de devolução de um livro.
     *
     * @param loanId  ID do empréstimo a ser devolvido
     * @return        DTO do empréstimo finalizado
     */
    @Transactional
    public LoanDTO returnLoan(Long loanId) {
        log.debug("Facade: iniciando devolução — loanId={}", loanId);

        Loan loan = loanService.findEntityById(loanId);

        // PADRÃO STATE — verifica permissão de devolução no estado atual
        LoanState state = LoanStateFactory.from(loan.getStatus());
        if (!state.canReturn()) {
            throw new BusinessException(
                    "Empréstimo já está no estado '%s' e não pode ser devolvido.".formatted(state.getStateName()));
        }

        // Gera notificação de atraso se necessário (State decide)
        if (state.requiresOverdueNotification()) {
            notificationService.createInternal(
                    "Devolução em Atraso",
                    "O livro \"" + loan.getBook().getTitle() + "\" foi devolvido com atraso por " + loan.getUser().getName() + ".",
                    Notification.NotificationType.WARNING
            );
        }

        // Finalizar empréstimo
        LoanDTO returned = loanService.returnLoan(loanId);

        // Devolver exemplar ao estoque
        bookService.incrementAvailable(loan.getBook().getId());

        // Notificar reservas pendentes (se houver)
        reservationService.notifyAvailability(loan.getBook().getId());

        // Notificação de confirmação
        notificationService.createInternal(
                "Devolução Registrada",
                "O livro \"" + loan.getBook().getTitle() + "\" foi devolvido por " + loan.getUser().getName() + ".",
                Notification.NotificationType.INFO
        );

        log.info("Facade: devolução concluída — loanId={}", loanId);
        return returned;
    }
}
