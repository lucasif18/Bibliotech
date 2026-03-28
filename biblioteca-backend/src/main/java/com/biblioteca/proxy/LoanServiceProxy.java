package com.biblioteca.proxy;

import com.biblioteca.dto.LoanDTO;
import com.biblioteca.exception.AccessDeniedException;
import com.biblioteca.facade.LoanFacade;
import com.biblioteca.model.User;
import com.biblioteca.service.LoanService;
import com.biblioteca.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * PADRÃO PROXY — Proxy de Controle de Acesso para Empréstimos
 *
 * Intercepta as operações sensíveis (criar empréstimo e devolver livro)
 * antes de delegar ao {@link LoanFacade} real, realizando:
 *
 *   • Verificação de limite de empréstimos por tipo de usuário
 *   • Bloqueio de visitantes para operações restritas
 *   • Logging de auditoria de todas as tentativas
 *
 * O Controller faz referência apenas a este Proxy — nunca ao Facade diretamente.
 *
 * Regras de acesso:
 *   - VISITANTE      : máx. 2 empréstimos simultâneos
 *   - ADMINISTRADOR  : máx. 10 empréstimos simultâneos
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LoanServiceProxy {

    private final LoanFacade loanFacade;           // objeto real
    private final LoanService loanService;
    private final UserService userService;

    /**
     * Controla o acesso à criação de empréstimo.
     * Verifica se o usuário atingiu seu limite antes de delegar ao Facade.
     */
    public LoanDTO createLoan(LoanDTO dto) {
        User user = userService.findEntityById(dto.getUserId());

        log.info("Proxy: verificando permissão de empréstimo — usuário={} ({})",
                user.getName(), user.getType());

        long activeLoans = loanService.countActiveByUser(user.getId());
        int maxAllowed = user.getMaxLoans();

        if (activeLoans >= maxAllowed) {
            String msg = "Usuário '%s' (%s) atingiu o limite de %d empréstimo(s) simultâneo(s). Ativos: %d."
                    .formatted(user.getName(), user.getType(), maxAllowed, activeLoans);
            log.warn("Proxy: acesso NEGADO — {}", msg);
            throw new AccessDeniedException(msg);
        }

        log.info("Proxy: acesso PERMITIDO — delegando ao Facade (ativos: {}/{})", activeLoans, maxAllowed);
        return loanFacade.createLoan(dto);
    }

    /**
     * Controla o acesso à devolução de livro.
     * Verifica se o empréstimo pertence ao usuário informado (ou é uma operação administrativa).
     */
    public LoanDTO returnLoan(Long loanId, Long requestingUserId) {
        log.info("Proxy: verificando permissão de devolução — loanId={}, solicitante={}",
                loanId, requestingUserId);

        var loan = loanService.findEntityById(loanId);

        // Permite devolução se o solicitante é o dono do empréstimo
        // (em produção, aqui entraria a verificação de role ADMIN)
        if (requestingUserId != null && !loan.getUser().getId().equals(requestingUserId)) {
            log.warn("Proxy: tentativa de devolução por usuário não autorizado — loanId={}, solicitante={}",
                    loanId, requestingUserId);
            throw new AccessDeniedException(
                    "Você não tem permissão para devolver o empréstimo de outro usuário.");
        }

        log.info("Proxy: acesso PERMITIDO — delegando devolução ao Facade.");
        return loanFacade.returnLoan(loanId);
    }
}
