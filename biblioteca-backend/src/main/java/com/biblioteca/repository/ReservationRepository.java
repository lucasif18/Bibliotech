package com.biblioteca.repository;

import com.biblioteca.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByBookId(Long bookId);

    List<Reservation> findByStatus(Reservation.ReservationStatus status);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
           "WHERE r.user.id = :userId AND r.book.id = :bookId AND r.status = 'PENDENTE'")
    boolean existsActivereservation(@Param("userId") Long userId, @Param("bookId") Long bookId);

    @Query("SELECT r FROM Reservation r WHERE " +
           "LOWER(r.user.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.book.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Reservation> searchByUserNameOrBookTitle(@Param("query") String query);
}
