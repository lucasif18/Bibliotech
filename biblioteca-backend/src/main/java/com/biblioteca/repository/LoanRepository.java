package com.biblioteca.repository;

import com.biblioteca.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserId(Long userId);

    List<Loan> findByBookId(Long bookId);

    List<Loan> findByStatus(Loan.LoanStatus status);

    @Query("SELECT l FROM Loan l WHERE l.status = 'ATIVO' AND l.returnDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.user.id = :userId AND l.status = 'ATIVO'")
    long countActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM Loan l WHERE " +
           "LOWER(l.user.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(l.book.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Loan> searchByUserNameOrBookTitle(@Param("query") String query);
}
