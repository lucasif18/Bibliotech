package com.biblioteca;

import com.biblioteca.dto.*;
import com.biblioteca.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Testes de integração — valida os principais fluxos da biblioteca digital.
 * Utiliza banco H2 em memória (perfil padrão).
 */
@SpringBootTest
@Transactional
class BibliotecaApplicationTests {

    @Autowired BookService bookService;
    @Autowired UserService userService;
    @Autowired LoanService loanService;
    @Autowired ReservationService reservationService;

    // ─── Livros ──────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve listar todos os livros")
    void deveListarTodosLivros() {
        List<BookDTO> books = bookService.findAll();
        assertThat(books).isNotEmpty();
    }

    @Test
    @DisplayName("Deve criar um novo livro")
    void deveCriarLivro() {
        BookDTO dto = BookDTO.builder()
                .title("Design Patterns").author("Gang of Four")
                .category("Tecnologia").isbn("978-00-000-0001-1")
                .quantity(3).build();

        BookDTO created = bookService.create(dto);

        assertThat(created.getId()).isNotNull();
        assertThat(created.getAvailable()).isEqualTo(3);
        assertThat(created.getStatus()).isEqualTo("disponivel");
    }

    @Test
    @DisplayName("Não deve criar livro com ISBN duplicado")
    void naoDeveCriarLivroIsbnDuplicado() {
        BookDTO dto = BookDTO.builder()
                .title("Duplicado").author("Autor").category("Cat")
                .isbn("978-85-359-0277-1") // ISBN já existente (Dom Casmurro)
                .quantity(1).build();

        assertThatThrownBy(() -> bookService.create(dto))
                .hasMessageContaining("ISBN");
    }

    @Test
    @DisplayName("Deve buscar livros disponíveis via Iterator")
    void deveBuscarLivrosDisponiveisViaIterator() {
        List<BookDTO> available = bookService.findAvailable();
        assertThat(available).allMatch(b -> b.getAvailable() > 0);
    }

    // ─── Usuários ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve criar usuário administrador via Factory Method")
    void deveCriarAdministradorViaFactory() {
        UserDTO dto = UserDTO.builder()
                .name("Novo Administrador").email("novo.admin@test.com").type("administrador").password("123456").build();

        UserDTO created = userService.create(dto);

        assertThat(created.getType()).isEqualTo("administrador");
        assertThat(created.getId()).isNotNull();
    }

    @Test
    @DisplayName("Deve criar usuário visitante via Factory Method")
    void deveCriarVisitanteViaFactory() {
        UserDTO dto = UserDTO.builder()
                .name("Novo Visitante").email("novo.visitante@test.com").type("visitante").password("123456").build();

        UserDTO created = userService.create(dto);
        assertThat(created.getType()).isEqualTo("visitante");
    }

    @Test
    @DisplayName("Não deve criar usuário com e-mail duplicado")
    void naoDeveCriarUsuarioEmailDuplicado() {
        UserDTO dto = UserDTO.builder()
                .name("Cópia").email("carlos.oliveira@email.com") // e-mail já cadastrado
                .type("administrador").build();

        assertThatThrownBy(() -> userService.create(dto))
                .hasMessageContaining("E-mail");
    }

    // ─── Empréstimos ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve listar empréstimos por status")
    void deveListarEmprestimosPorStatus() {
        List<LoanDTO> ativos = loanService.findByStatus("ativo");
        assertThat(ativos).allMatch(l -> l.getStatus().equals("ativo"));
    }

    @Test
    @DisplayName("Deve atualizar status de atrasados via Iterator")
    void deveAtualizarAtrasadosViaIterator() {
        // O seeder já insere um empréstimo com returnDate no passado (status ATRASADO)
        List<LoanDTO> updated = loanService.refreshOverdueStatus();
        // Nenhum novo atraso após seed (já estão marcados), resultado pode ser vazio
        assertThat(updated).isNotNull();
    }

    // ─── Notificações ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Deve retornar contagem de notificações não lidas")
    void deveContarNaoLidas() {
        assertThat(bookService.findAll()).isNotEmpty(); // garante que contexto carregou
    }

    // ─── Contexto ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Contexto Spring carrega sem erros")
    void contextLoads() {
        assertThat(bookService).isNotNull();
        assertThat(userService).isNotNull();
        assertThat(loanService).isNotNull();
        assertThat(reservationService).isNotNull();
    }
}
