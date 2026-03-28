package com.biblioteca.service;

import com.biblioteca.dto.*;
import com.biblioteca.model.*;
import com.biblioteca.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Agrega todos os dados necessários para renderizar o dashboard do frontend.
 *
 * Computa em uma única transação:
 *   - Stats cards (totalBooks, borrowedBooks, activeLoans, overdueLoans …)
 *   - Top 5 livros para o "Resumo do Acervo"
 *   - Últimos empréstimos (fallback do frontend)
 *   - Últimas 10 atividades para o widget "Atividades Recentes"
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final BookRepository     bookRepository;
    private final UserRepository     userRepository;
    private final LoanRepository     loanRepository;
    private final ActivityLogService activityLogService;
        private final LoanService        loanService;

        @Transactional
    public DashboardResponseDTO buildDashboard() {

                loanService.refreshOverdueStatus();

        List<Book> allBooks = bookRepository.findAll();
        List<Loan> allLoans = loanRepository.findAll();

        // ── Stats ─────────────────────────────────────────────────────────────
        int totalBooks         = allBooks.stream().mapToInt(Book::getQuantity).sum();
        int totalTitles        = allBooks.size();
        int borrowedBooks      = allBooks.stream()
                                     .mapToInt(b -> b.getQuantity() - b.getAvailable())
                                     .sum();
        int totalUsers         = (int) userRepository.count();
        int activeLoans        = (int) allLoans.stream()
                                     .filter(l -> l.getStatus() == Loan.LoanStatus.ATIVO
                                               || l.getStatus() == Loan.LoanStatus.ATRASADO)
                                     .count();
        int overdueLoans       = (int) allLoans.stream()
                                     .filter(l -> l.getStatus() == Loan.LoanStatus.ATRASADO)
                                     .count();
        int unavailableBooks   = (int) allBooks.stream()
                                     .filter(b -> b.getAvailable() == 0)
                                     .count();

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalBooks(totalBooks)
                .totalTitles(totalTitles)
                .borrowedBooks(borrowedBooks)
                .totalUsers(totalUsers)
                .activeLoans(activeLoans)
                .overdueLoans(overdueLoans)
                .unavailableBooks(unavailableBooks)
                .build();

        // ── Top 5 livros para o resumo do acervo ──────────────────────────────
        List<BookDTO> top5Books = allBooks.stream()
                .limit(5)
                .map(BookDTO::fromEntity)
                .toList();

        // ── Últimos 10 empréstimos (fallback do frontend) ─────────────────────
        List<LoanDTO> recentLoans = allLoans.stream()
                .sorted((a, b) -> b.getLoanDate().compareTo(a.getLoanDate()))
                .limit(10)
                .map(LoanDTO::fromEntity)
                .toList();

        // ── Últimas 10 atividades ─────────────────────────────────────────────
        List<ActivityLogDTO> activities = activityLogService.findRecent(10);

        log.debug("Dashboard montado: books={}, loans={}, activities={}",
                totalTitles, allLoans.size(), activities.size());

        return DashboardResponseDTO.builder()
                .stats(stats)
                .books(top5Books)
                .loans(recentLoans)
                .activities(activities)
                .build();
    }
}
