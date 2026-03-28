package com.biblioteca.service;

import com.biblioteca.dto.ReservationDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.model.*;
import com.biblioteca.model.Reservation.ReservationStatus;
import com.biblioteca.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final BookService bookService;
    private final NotificationService notificationService;

    // ─── Consultas ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ReservationDTO> findAll() {
        return reservationRepository.findAll().stream()
                .map(ReservationDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReservationDTO findById(Long id) {
        return ReservationDTO.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<ReservationDTO> search(String query) {
        return reservationRepository.searchByUserNameOrBookTitle(query).stream()
                .map(ReservationDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationDTO> findByStatus(String status) {
        Reservation.ReservationStatus s = parseStatus(status);
        return reservationRepository.findByStatus(s).stream()
                .map(ReservationDTO::fromEntity)
                .toList();
    }

    // ─── Criação ─────────────────────────────────────────────────────────────────

    @Transactional
    public ReservationDTO create(ReservationDTO dto) {
        User user = userService.findEntityById(dto.getUserId());
        Book book = bookService.findEntityById(dto.getBookId());

        // Visitantes não podem fazer reservas
        if (user.getType() == User.UserType.VISITANTE) {
            throw new BusinessException("Visitantes não podem realizar reservas.");
        }

        // Verifica reserva duplicada
        if (reservationRepository.existsActivereservation(user.getId(), book.getId())) {
            throw new BusinessException("Já existe uma reserva pendente para este livro.");
        }

        // Livros disponíveis não precisam de reserva
        if (book.getAvailable() > 0) {
            throw new BusinessException(
                    "O livro '" + book.getTitle() + "' está disponível. Faça o empréstimo diretamente.");
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .book(book)
                .reservationDate(java.time.LocalDate.now()) // 🔥 AQUI
                .status(Reservation.ReservationStatus.PENDENTE)
                .build();

        Reservation saved = reservationRepository.save(reservation);
        log.info("Reserva criada: id={}, usuário={}, livro={}", saved.getId(), user.getName(), book.getTitle());

        notificationService.createInternal(
                "Reserva Confirmada",
                "Sua reserva para o livro \"" + book.getTitle() + "\" foi confirmada.",
                Notification.NotificationType.SUCCESS);

        return ReservationDTO.fromEntity(saved);
    }

    // ─── Cancelamento ────────────────────────────────────────────────────────────

    @Transactional
    public ReservationDTO cancel(Long id) {
        Reservation reservation = findEntityById(id);

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELADA) {
            throw new BusinessException("Esta reserva já foi cancelada.");
        }
        if (reservation.getStatus() == Reservation.ReservationStatus.DISPONIVEL) {
            throw new BusinessException("Reservas com livro disponível devem ser convertidas em empréstimo.");
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELADA);
        Reservation saved = reservationRepository.save(reservation);
        log.info("Reserva cancelada: id={}", id);
        return ReservationDTO.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        Reservation r = findEntityById(id);
        if (r.getStatus() == Reservation.ReservationStatus.PENDENTE) {
            throw new BusinessException("Cancele a reserva antes de excluí-la.");
        }
        reservationRepository.delete(r);
        log.info("Reserva removida: id={}", id);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    public Reservation findEntityById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva", id));
    }

    private Reservation.ReservationStatus parseStatus(String status) {
        try {
            return Reservation.ReservationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Status inválido: '%s'. Use: pendente, disponivel ou cancelada.".formatted(status));
        }
    }

    @Transactional
    public void processQueue(Long bookId) {
        List<Reservation> list = reservationRepository
                .findByBookIdAndStatusOrderByReservationDateAsc(bookId, ReservationStatus.PENDENTE);

        if (!list.isEmpty()) {
            Reservation next = list.get(0);

            next.setStatus(ReservationStatus.DISPONIVEL);
            reservationRepository.save(next);

            notificationService.createInternal(
                    "Livro Disponível",
                    "O livro \"" + next.getBook().getTitle() + "\" está disponível para você.",
                    Notification.NotificationType.SUCCESS);
        }
    }

    @Transactional
    public Reservation getNextInQueue(Long bookId) {
        List<Reservation> list = reservationRepository
                .findByBookIdAndStatusOrderByReservationDateAsc(
                        bookId, ReservationStatus.PENDENTE);
        if (list.isEmpty())
            return null;
        return list.get(0);
    }

    @Transactional
    public void markAsCompleted(Reservation reservation) {
        reservation.setStatus(ReservationStatus.CANCELADA); // ou CRIAR um status "ATENDIDA"
        reservationRepository.save(reservation);
    }

}
