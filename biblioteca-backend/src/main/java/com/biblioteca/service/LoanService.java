package com.biblioteca.service;

import com.biblioteca.dto.LoanDTO;
import com.biblioteca.exception.BusinessException;
import com.biblioteca.exception.ResourceNotFoundException;
import com.biblioteca.iterator.LoanIterator;
import com.biblioteca.model.Loan;
import com.biblioteca.repository.LoanRepository;
import com.biblioteca.state.LoanStateFactory;
import com.biblioteca.state.LoanState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Serviço central de empréstimos — responsável apenas por
 * operações CRUD e consultas. A orquestração do fluxo complexo
 * (validação + criação + notificação) é delegada ao {@link com.biblioteca.facade.LoanFacade}.
 * O controle de acesso é delegado ao {@link com.biblioteca.proxy.LoanServiceProxy}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanService {

    private final LoanRepository loanRepository;

    // ─── Consultas ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LoanDTO> findAll() {
        return loanRepository.findAll().stream()
                .map(LoanDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoanDTO findById(Long id) {
        return LoanDTO.fromEntity(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> findByUserId(Long userId) {
        return loanRepository.findByUserId(userId).stream()
                .map(LoanDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> findByStatus(String status) {
        Loan.LoanStatus loanStatus = parseStatus(status);
        return loanRepository.findByStatus(loanStatus).stream()
                .map(LoanDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> search(String query) {
        return loanRepository.searchByUserNameOrBookTitle(query).stream()
                .map(LoanDTO::fromEntity)
                .toList();
    }

    /**
     * Usa o PADRÃO ITERATOR para percorrer e atualizar empréstimos atrasados
     * sem expor a coleção interna.
     */
    @Transactional
    public List<LoanDTO> refreshOverdueStatus() {
        List<Loan> all = loanRepository.findAll();
        LoanIterator iterator = LoanIterator.onlyActive(all);

        List<Loan> toUpdate = new java.util.ArrayList<>();
        while (iterator.hasNext()) {
            Loan loan = iterator.next();
            if (loan.isOverdue() && loan.getStatus() == Loan.LoanStatus.ATIVO) {
                loan.setStatus(Loan.LoanStatus.ATRASADO);
                toUpdate.add(loan);
            }
        }

        if (!toUpdate.isEmpty()) {
            loanRepository.saveAll(toUpdate);
            log.info("{} empréstimo(s) marcado(s) como ATRASADO.", toUpdate.size());
        }

        return toUpdate.stream().map(LoanDTO::fromEntity).toList();
    }

    // ─── Operações principais (chamadas pelo Facade) ──────────────────────────────

    @Transactional
    public Loan createRaw(Loan loan) {
        // CORREÇÃO: Impede datas retroativas
        if (loan.getLoanDate().isBefore(LocalDate.now())) {
            throw new BusinessException("A data do empréstimo não pode ser anterior a hoje.");
        }
        
        Loan saved = loanRepository.save(loan);
        log.info("Empréstimo criado: id={}, usuário={}, livro={}",
                saved.getId(), saved.getUser().getName(), saved.getBook().getTitle());
        return saved;
    }

    
    @Transactional
    public LoanDTO returnLoan(Long loanId) {
        Loan loan = findEntityById(loanId);

        LoanState state = LoanStateFactory.from(loan.getStatus());
        if (!state.canReturn()) {
            throw new BusinessException(
                    "Empréstimo no estado '%s' não pode ser devolvido.".formatted(state.getStateName()));
        }

        // CORREÇÃO: Atualiza o status do empréstimo
        loan.setStatus(Loan.LoanStatus.FINALIZADO);
        
        // CORREÇÃO: IMPORTANTE! Devolve o livro ao estoque
        com.biblioteca.model.Book book = loan.getBook();
        book.setAvailable(book.getAvailable() + 1); 
        // Aqui assumimos que você tem o bookRepository injetado ou o hibernate cuida do save
        
        Loan saved = loanRepository.save(loan);
        log.info("Devolução registrada e estoque atualizado: loanId={}", loanId);
        return LoanDTO.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        Loan loan = findEntityById(id);
        if (loan.getStatus() == Loan.LoanStatus.ATIVO || loan.getStatus() == Loan.LoanStatus.ATRASADO) {
            throw new BusinessException("Não é possível excluir um empréstimo ativo ou atrasado.");
        }
        loanRepository.delete(loan);
        log.info("Empréstimo removido: id={}", id);
    }

    public long countActiveByUser(Long userId) {
        return loanRepository.countActiveByUserId(userId);
    }

    // ─── Helpers internos ────────────────────────────────────────────────────────

    public Loan findEntityById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empréstimo", id));
    }

    private Loan.LoanStatus parseStatus(String status) {
        try {
            return Loan.LoanStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Status inválido: '%s'. Use: ativo, atrasado ou finalizado.".formatted(status));
        }
    }
}
