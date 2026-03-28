# Biblioteca Digital

README do backend do sistema de gerenciamento de biblioteca digital.

O backend está em `biblioteca-backend/` e foi construído com Spring Boot, JPA e H2 em memória.

---

## Como rodar?

### Pré-requisitos

- Java 17+
- Maven 3.8+
- Node.js instalado
- npm disponível no terminal

### Rodando o backend

```bash
cd biblioteca-backend
mvn spring-boot:run
```

### Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

### Serviços disponíveis em desenvolvimento

- Interface web: `http://localhost:3000`
- API backend: `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console`

### Gerar build do backend

```bash
cd biblioteca-backend
mvn clean package -DskipTests
java -jar target/biblioteca-digital-1.0.0.jar
```

---

## Arquitetura

```text
biblioteca-backend/src/main/java/com/biblioteca/
│
├── controller/          ← camada REST
│   ├── BookController
│   ├── DashboardController
│   ├── LoanController
│   ├── LoginController
│   ├── NotificationController
│   ├── ReservationController
│   └── UserController
│
├── service/             ← regras de negócio
├── repository/          ← acesso a dados com Spring Data JPA
├── model/               ← entidades JPA e enums
├── dto/                 ← objetos de entrada e saída da API
├── security/            ← autorização centralizada
├── exception/           ← tratamento global de erros
├── config/              ← seed e configurações auxiliares
│
├── factory/             ← Factory Method
├── facade/              ← Facade
├── proxy/               ← Proxy
├── state/               ← State
└── iterator/            ← Iterator
```

---

## Padrões de Projeto

### Factory Method
Centraliza a criação de usuários por tipo em `com.biblioteca.factory`.

### Facade
`LoanFacade` encapsula o fluxo de criação e devolução de empréstimos.

### Proxy
`LoanServiceProxy` intercepta operações sensíveis de empréstimo antes de delegar ao facade.

### State
Os estados de empréstimo ficam em `com.biblioteca.state` e evitam condicionais espalhadas pelo fluxo.

### Iterator
Iteradores específicos percorrem coleções de livros e empréstimos de forma encapsulada.

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 17 | Linguagem principal |
| Spring Boot | 3.2.3 | Framework principal |
| Spring Data JPA | 3.2.3 | Persistência |
| Hibernate | 6.x | Implementação JPA |
| H2 Database | runtime | Banco em memória |
| Lombok | 1.18.x | Redução de boilerplate |
| Bean Validation | Jakarta | Validação dos DTOs |
| Maven | 3.8+ | Build e dependências |

---

## Banco H2

Configuração atual em `application.properties`:

| Campo | Valor |
|---|---|
| JDBC URL | `jdbc:h2:mem:bibliotecadb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE` |
| Username | `sa` |
| Password | vazio |
| Console | `/h2-console` |

Observação: o banco é recriado a cada inicialização porque o projeto usa `spring.jpa.hibernate.ddl-auto=create-drop`.

---

## Autenticação

O backend expõe autenticação em `/api/auth` com token Bearer simples baseado em Base64 no formato `user:{id}`.

### Endpoints de autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autentica usuário |
| POST | `/api/auth/logout` | Logout sem estado no servidor |
| GET | `/api/auth/me` | Retorna usuário autenticado |
| PUT | `/api/auth/profile` | Atualiza nome do usuário autenticado |
| PUT | `/api/auth/password` | Atualiza senha do usuário autenticado |

### Exemplo de login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.oliveira@email.com","password":"123456"}'
```

---

## Papéis de Usuário

O sistema trabalha com dois tipos de usuário:

| Papel | Descrição |
|---|---|
| ADMINISTRADOR | Acesso administrativo ao sistema |
| VISITANTE | Acesso restrito aos próprios recursos |

### Regras atuais de acesso

- Usuários são protegidos no backend e exigem ADMINISTRADOR.
- Empréstimos possuem controle granular no backend.
- VISITANTE pode consultar apenas os próprios empréstimos quando usar rotas por usuário ou por ID compatível com seu recurso.
- Apenas ADMINISTRADOR pode criar empréstimos.
- Apenas ADMINISTRADOR pode registrar devoluções.
- Apenas ADMINISTRADOR pode listar todos os empréstimos.

---

## Dados Iniciais

Ao subir a aplicação, `DataSeeder` popula o banco com livros, usuários, empréstimos, reservas e notificações.

### Usuários padrão

| Nome | E-mail | Senha | Tipo |
|---|---|---|---|
| Carlos Oliveira | `carlos.oliveira@email.com` | `123456` | ADMINISTRADOR |
| João Ferreira | `joao.ferreira@email.com` | `123456` | VISITANTE |
| Pedro Costa | `pedro.costa@email.com` | `123456` | ADMINISTRADOR |

---

## Endpoints da API

### Livros

Base: `/api/livros`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/livros` | Lista todos os livros |
| GET | `/api/livros/{id}` | Busca livro por ID |
| GET | `/api/livros/busca?q=` | Busca por título ou autor |
| GET | `/api/livros/disponiveis` | Lista apenas livros disponíveis |
| GET | `/api/livros/categoria?categoria=` | Filtra por categoria |
| POST | `/api/livros` | Cadastra livro |
| PUT | `/api/livros/{id}` | Atualiza livro |
| DELETE | `/api/livros/{id}` | Remove livro |

### Usuários

Base: `/api/usuarios`

Todos os endpoints exigem ADMINISTRADOR.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios/{id}` | Busca usuário por ID |
| GET | `/api/usuarios/busca?q=` | Busca por nome ou e-mail |
| GET | `/api/usuarios/tipo?tipo=` | Filtra por tipo |
| POST | `/api/usuarios` | Cria usuário |
| PUT | `/api/usuarios/{id}` | Atualiza usuário |
| DELETE | `/api/usuarios/{id}` | Remove usuário |

### Empréstimos

Base: `/api/emprestimos`

| Método | Endpoint | Regra atual |
|---|---|---|
| GET | `/api/emprestimos` | ADMINISTRADOR apenas |
| GET | `/api/emprestimos/{id}` | ADMINISTRADOR ou proprietário |
| GET | `/api/emprestimos/busca?q=` | ADMINISTRADOR apenas |
| GET | `/api/emprestimos/status?status=` | ADMINISTRADOR apenas |
| GET | `/api/emprestimos/usuario/{userId}` | ADMINISTRADOR ou o próprio usuário |
| GET | `/api/emprestimos/atualizar-atrasos` | ADMINISTRADOR apenas |
| POST | `/api/emprestimos` | ADMINISTRADOR apenas |
| POST | `/api/emprestimos/{id}/devolver` | ADMINISTRADOR apenas |
| DELETE | `/api/emprestimos/{id}` | ADMINISTRADOR apenas |

### Reservas

Base: `/api/reservas`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/reservas` | Lista reservas |
| GET | `/api/reservas/{id}` | Busca reserva por ID |
| GET | `/api/reservas/busca?q=` | Busca por usuário ou livro |
| GET | `/api/reservas/status?status=` | Filtra por status |
| POST | `/api/reservas` | Cria reserva |
| POST | `/api/reservas/{id}/cancelar` | Cancela reserva |
| DELETE | `/api/reservas/{id}` | Remove reserva |

### Notificações

Base: `/api/notificacoes`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/notificacoes` | Lista notificações |
| GET | `/api/notificacoes/nao-lidas` | Lista apenas não lidas |
| GET | `/api/notificacoes/contagem` | Retorna total de não lidas |
| PUT | `/api/notificacoes/{id}/lida` | Marca uma notificação como lida |
| PUT | `/api/notificacoes/marcar-todas` | Marca todas como lidas |
| DELETE | `/api/notificacoes/{id}` | Remove notificação |

### Dashboard

Base: `/api/dashboard`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/dashboard` | Retorna payload completo do dashboard |
| GET | `/api/dashboard/stats` | Retorna estatísticas |
| GET | `/api/dashboard/books` | Retorna livros para resumo |
| GET | `/api/dashboard/loans` | Retorna empréstimos recentes |
| GET | `/api/dashboard/activities` | Retorna atividades recentes |

---

## Testes

```bash
cd biblioteca-backend
mvn test
```

---

## Observações

- O backend roda por padrão na porta `8080`.
- A interface web costuma ser acessada pela porta `3000` em desenvolvimento.
- O log do projeto está configurado com `logging.level.com.biblioteca=DEBUG`.
- Como o banco é em memória, qualquer reinício recria os dados seedados.
