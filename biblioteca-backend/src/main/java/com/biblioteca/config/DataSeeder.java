package com.biblioteca.config;

import com.biblioteca.model.*;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Popula o banco H2 com dados iniciais idênticos aos mocks do frontend,
 * garantindo integração imediata sem configuração extra.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        log.info("Iniciando carga de dados iniciais...");
        seedBooks();
        seedUsers();
        seedLoans();
        seedReservations();
        seedNotifications();
        log.info("Dados iniciais carregados com sucesso.");
    }

    private void seedBooks() {
        List<Book> books = List.of(
            Book.builder().title("Dom Casmurro").author("Machado de Assis")
                .category("Literatura Brasileira").isbn("978-85-359-0277-1")
                .quantity(5).available(3).status(Book.BookStatus.DISPONIVEL).build(),
            Book.builder().title("1984").author("George Orwell")
                .category("Ficção Científica").isbn("978-85-359-0278-8")
                .quantity(3).available(0).status(Book.BookStatus.EMPRESTADO).build(),
            Book.builder().title("O Senhor dos Anéis").author("J.R.R. Tolkien")
                .category("Fantasia").isbn("978-85-359-0279-5")
                .quantity(4).available(2).status(Book.BookStatus.DISPONIVEL).build(),
            Book.builder().title("Clean Code").author("Robert C. Martin")
                .category("Tecnologia").isbn("978-85-359-0280-1")
                .quantity(2).available(1).status(Book.BookStatus.DISPONIVEL).build(),
            Book.builder().title("O Pequeno Príncipe").author("Antoine de Saint-Exupéry")
                .category("Infantil").isbn("978-85-359-0281-8")
                .quantity(6).available(4).status(Book.BookStatus.DISPONIVEL).build(),
            Book.builder().title("Harry Potter e a Pedra Filosofal").author("J.K. Rowling")
                .category("Fantasia").isbn("978-85-359-0282-5")
                .quantity(8).available(0).status(Book.BookStatus.EMPRESTADO).build(),
            Book.builder().title("A Arte da Guerra").author("Sun Tzu")
                .category("Estratégia").isbn("978-85-359-0283-2")
                .quantity(3).available(2).status(Book.BookStatus.DISPONIVEL).build(),
            Book.builder().title("Sapiens").author("Yuval Noah Harari")
                .category("História").isbn("978-85-359-0284-9")
                .quantity(4).available(1).status(Book.BookStatus.DISPONIVEL).build()
        );
        bookRepository.saveAll(books);
        log.debug("{} livros inseridos.", books.size());
    }

    private void seedUsers() {
        List<User> users = List.of(
            User.builder().name("Ana Silva").email("ana.silva@email.com")
                .type(User.UserType.ALUNO).createdAt(LocalDate.of(2024, 1, 15)).build(),
            User.builder().name("Carlos Oliveira").email("carlos.oliveira@email.com")
                .type(User.UserType.PROFESSOR).createdAt(LocalDate.of(2024, 2, 20)).build(),
            User.builder().name("Maria Santos").email("maria.santos@email.com")
                .type(User.UserType.ALUNO).createdAt(LocalDate.of(2024, 3, 10)).build(),
            User.builder().name("João Ferreira").email("joao.ferreira@email.com")
                .type(User.UserType.VISITANTE).createdAt(LocalDate.of(2024, 4, 5)).build(),
            User.builder().name("Beatriz Lima").email("beatriz.lima@email.com")
                .type(User.UserType.ALUNO).createdAt(LocalDate.of(2024, 5, 12)).build(),
            User.builder().name("Pedro Costa").email("pedro.costa@email.com")
                .type(User.UserType.PROFESSOR).createdAt(LocalDate.of(2024, 6, 18)).build()
        );
        userRepository.saveAll(users);
        log.debug("{} usuários inseridos.", users.size());
    }

    private void seedLoans() {
        User ana      = userRepository.findByEmail("ana.silva@email.com").orElseThrow();
        User carlos   = userRepository.findByEmail("carlos.oliveira@email.com").orElseThrow();
        User maria    = userRepository.findByEmail("maria.santos@email.com").orElseThrow();
        User beatriz  = userRepository.findByEmail("beatriz.lima@email.com").orElseThrow();
        User joao     = userRepository.findByEmail("joao.ferreira@email.com").orElseThrow();

        Book orwell   = bookRepository.findByIsbn("978-85-359-0278-8").orElseThrow(); // 1984
        Book harry    = bookRepository.findByIsbn("978-85-359-0282-5").orElseThrow(); // Harry Potter
        Book dom      = bookRepository.findByIsbn("978-85-359-0277-1").orElseThrow(); // Dom Casmurro
        Book clean    = bookRepository.findByIsbn("978-85-359-0280-1").orElseThrow(); // Clean Code
        Book aneis    = bookRepository.findByIsbn("978-85-359-0279-5").orElseThrow(); // Senhor dos Anéis

        List<Loan> loans = List.of(
            Loan.builder().user(ana).book(orwell)
                .loanDate(LocalDate.of(2024, 3, 1))
                .returnDate(LocalDate.of(2024, 3, 15))
                .status(Loan.LoanStatus.ATIVO).build(),
            Loan.builder().user(carlos).book(harry)
                .loanDate(LocalDate.of(2024, 2, 20))
                .returnDate(LocalDate.of(2024, 3, 5))
                .status(Loan.LoanStatus.ATRASADO).build(),
            Loan.builder().user(maria).book(dom)
                .loanDate(LocalDate.of(2024, 2, 10))
                .returnDate(LocalDate.of(2024, 2, 24))
                .status(Loan.LoanStatus.FINALIZADO).build(),
            Loan.builder().user(beatriz).book(clean)
                .loanDate(LocalDate.of(2024, 3, 5))
                .returnDate(LocalDate.of(2024, 3, 19))
                .status(Loan.LoanStatus.ATIVO).build(),
            Loan.builder().user(joao).book(aneis)
                .loanDate(LocalDate.of(2024, 3, 8))
                .returnDate(LocalDate.of(2024, 3, 22))
                .status(Loan.LoanStatus.ATIVO).build()
        );
        loanRepository.saveAll(loans);
        log.debug("{} empréstimos inseridos.", loans.size());
    }

    private void seedReservations() {
        User maria   = userRepository.findByEmail("maria.santos@email.com").orElseThrow();
        User beatriz = userRepository.findByEmail("beatriz.lima@email.com").orElseThrow();
        User ana     = userRepository.findByEmail("ana.silva@email.com").orElseThrow();

        Book orwell  = bookRepository.findByIsbn("978-85-359-0278-8").orElseThrow();
        Book harry   = bookRepository.findByIsbn("978-85-359-0282-5").orElseThrow();
        Book sapiens = bookRepository.findByIsbn("978-85-359-0284-9").orElseThrow();

        List<Reservation> reservations = List.of(
            Reservation.builder().user(maria).book(orwell)
                .reservationDate(LocalDate.of(2024, 3, 10))
                .status(Reservation.ReservationStatus.PENDENTE).build(),
            Reservation.builder().user(beatriz).book(harry)
                .reservationDate(LocalDate.of(2024, 3, 12))
                .status(Reservation.ReservationStatus.PENDENTE).build(),
            Reservation.builder().user(ana).book(sapiens)
                .reservationDate(LocalDate.of(2024, 3, 8))
                .status(Reservation.ReservationStatus.DISPONIVEL).build()
        );
        reservationRepository.saveAll(reservations);
        log.debug("{} reservas inseridas.", reservations.size());
    }

    private void seedNotifications() {
        List<Notification> notifications = List.of(
            Notification.builder()
                .title("Livro Disponível")
                .message("O livro \"Sapiens\" que você reservou está disponível para retirada.")
                .type(Notification.NotificationType.SUCCESS)
                .read(false)
                .createdAt(LocalDateTime.of(2024, 3, 15, 10, 30)).build(),
            Notification.builder()
                .title("Empréstimo Atrasado")
                .message("O empréstimo de \"Harry Potter\" está atrasado. Por favor, devolva o mais rápido possível.")
                .type(Notification.NotificationType.WARNING)
                .read(false)
                .createdAt(LocalDateTime.of(2024, 3, 14, 9, 0)).build(),
            Notification.builder()
                .title("Novo Livro Adicionado")
                .message("O livro \"O Alquimista\" foi adicionado ao acervo da biblioteca.")
                .type(Notification.NotificationType.INFO)
                .read(true)
                .createdAt(LocalDateTime.of(2024, 3, 13, 14, 20)).build(),
            Notification.builder()
                .title("Reserva Confirmada")
                .message("Sua reserva para o livro \"1984\" foi confirmada.")
                .type(Notification.NotificationType.SUCCESS)
                .read(true)
                .createdAt(LocalDateTime.of(2024, 3, 12, 11, 45)).build()
        );
        notificationRepository.saveAll(notifications);
        log.debug("{} notificações inseridas.", notifications.size());
    }
}
