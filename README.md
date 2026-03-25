# 📚 Biblioteca Digital — Backend Spring Boot

Backend completo para o sistema de gerenciamento de biblioteca digital, com **5 padrões de projeto GoF** implementados e arquitetura em camadas.

---

## 🏗️ Arquitetura e Padrões de Projeto

```
src/main/java/com/biblioteca/
│
├── controller/          ← Camada REST (HTTP in/out)
│   ├── BookController
│   ├── UserController
│   ├── LoanController
│   ├── ReservationController
│   └── NotificationController
│
├── service/             ← Regras de negócio
│   ├── BookService
│   ├── UserService
│   ├── LoanService
│   ├── ReservationService
│   └── NotificationService
│
├── repository/          ← Acesso ao banco (Spring Data JPA)
│   ├── BookRepository
│   ├── UserRepository
│   ├── LoanRepository
│   ├── ReservationRepository
│   └── NotificationRepository
│
├── model/               ← Entidades JPA
│   ├── Book
│   ├── User
│   ├── Loan
│   ├── Reservation
│   └── Notification
│
├── dto/                 ← Objetos de transferência de dados
│   ├── BookDTO
│   ├── UserDTO
│   ├── LoanDTO
│   ├── ReservationDTO
│   └── NotificationDTO
│
├── factory/             ← 🏭 PADRÃO FACTORY METHOD
│   ├── UserCreator        (interface)
│   ├── AlunoCreator       (concreto)
│   ├── ProfessorCreator   (concreto)
│   ├── VisitanteCreator   (concreto)
│   └── UserFactory        (coordenador)
│
├── facade/              ← 🎭 PADRÃO FACADE
│   └── LoanFacade         (orquestra empréstimo/devolução)
│
├── proxy/               ← 🔒 PADRÃO PROXY
│   └── LoanServiceProxy   (controle de acesso)
│
├── state/               ← 🔄 PADRÃO STATE
│   ├── LoanState          (interface)
│   ├── AtivoState
│   ├── AtrasadoState
│   ├── FinalizadoState
│   └── LoanStateFactory
│
├── iterator/            ← 🔁 PADRÃO ITERATOR
│   ├── LibraryIterator    (interface)
│   ├── BookIterator
│   └── LoanIterator
│
├── exception/           ← Tratamento de erros
│   ├── BusinessException
│   ├── ResourceNotFoundException
│   ├── AccessDeniedException
│   └── GlobalExceptionHandler
│
└── config/              ← Configurações
    ├── CorsConfig         (libera o frontend Next.js)
    └── DataSeeder         (carga inicial dos dados)
```

---

## 🎯 Padrões de Projeto — Detalhamento

### 🏭 Factory Method — Criação de Usuários
**Local:** `com.biblioteca.factory`

Centraliza a criação de usuários por tipo, eliminando `if/else` no serviço e tornando o código extensível (Open/Closed).

```
UserFactory → escolhe o Creator correto
  ├── AlunoCreator     → cria User(ALUNO,   max=5 empréstimos)
  ├── ProfessorCreator → cria User(PROFESSOR, max=10 empréstimos)
  └── VisitanteCreator → cria User(VISITANTE, max=2 empréstimos)
```

---

### 🎭 Facade — Fluxo de Empréstimo
**Local:** `com.biblioteca.facade.LoanFacade`

Encapsula a complexidade do processo em dois métodos simples:

```
loanFacade.createLoan(dto)  → valida + cria + decrementa estoque + notifica
loanFacade.returnLoan(id)   → verifica estado + finaliza + incrementa + notifica reservas
```

---

### 🔒 Proxy — Controle de Acesso
**Local:** `com.biblioteca.proxy.LoanServiceProxy`

Intercepta as operações sensíveis antes de chegar ao Facade:

```
Controller → LoanServiceProxy (verifica limites/permissões) → LoanFacade
```

| Tipo       | Limite de empréstimos |
|------------|----------------------|
| Visitante  | 2                    |
| Aluno      | 5                    |
| Professor  | 10                   |

---

### 🔄 State — Estados do Empréstimo
**Local:** `com.biblioteca.state`

Elimina condicionais extensas no fluxo de devolução:

```
ATIVO      → canReturn=true,  isOverdue=false, requiresNotification=false
ATRASADO   → canReturn=true,  isOverdue=true,  requiresNotification=true
FINALIZADO → canReturn=false, isOverdue=false, requiresNotification=false
```

---

### 🔁 Iterator — Percorrer Coleções
**Local:** `com.biblioteca.iterator`

Abstrai a iteração sobre livros e empréstimos:

```java
BookIterator.onlyAvailable(books)   // filtra livros disponíveis
LoanIterator.onlyActive(loans)      // filtra empréstimos ativos
LoanIterator.onlyOverdue(loans)     // filtra empréstimos atrasados
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Java 17+** (`java -version`)
- **Maven 3.8+** (`mvn -version`)

### Passo a passo

```bash
# 1. Entrar no diretório do projeto
cd biblioteca-backend

# 2. Compilar e executar
mvn spring-boot:run

# Ou gerar o JAR e executar diretamente:
mvn clean package -DskipTests
java -jar target/biblioteca-digital-1.0.0.jar
```

### Verificar que está funcionando

```bash
curl http://localhost:8080/api/livros
```

Deve retornar um array JSON com 8 livros.

---

## 🗄️ Console H2 (banco em memória)

Acesse: **http://localhost:8080/h2-console**

| Campo    | Valor                                                |
|----------|------------------------------------------------------|
| JDBC URL | `jdbc:h2:mem:bibliotecadb;DB_CLOSE_DELAY=-1`         |
| Username | `sa`                                                 |
| Password | *(vazio)*                                            |

---

## 🔗 Conectando ao Frontend Next.js

```bash
# Terminal 1 — Backend (porta 8080)
cd biblioteca-backend
mvn spring-boot:run

# Terminal 2 — Frontend (porta 3000)
cd <pasta-do-frontend>
npm install
npm run dev
```

O CORS já está configurado para `http://localhost:3000`.

Para conectar o frontend à API real, substitua os dados mockados em `lib/data.ts` por chamadas ao backend usando `fetch` ou `axios`:

```typescript
// Exemplo:
const res = await fetch('http://localhost:8080/api/livros')
const books = await res.json()
```

---

## 📡 Endpoints da API

### 📖 Livros — `/api/livros`
| Método | Endpoint                     | Descrição                        |
|--------|------------------------------|----------------------------------|
| GET    | `/api/livros`                | Lista todos os livros            |
| GET    | `/api/livros/{id}`           | Busca por ID                     |
| GET    | `/api/livros/busca?q=`       | Busca por título ou autor        |
| GET    | `/api/livros/disponiveis`    | Apenas com estoque disponível    |
| GET    | `/api/livros/categoria?categoria=` | Filtra por categoria       |
| POST   | `/api/livros`                | Cadastra novo livro              |
| PUT    | `/api/livros/{id}`           | Atualiza livro                   |
| DELETE | `/api/livros/{id}`           | Remove livro                     |

### 👤 Usuários — `/api/usuarios`
| Método | Endpoint                     | Descrição                        |
|--------|------------------------------|----------------------------------|
| GET    | `/api/usuarios`              | Lista todos os usuários          |
| GET    | `/api/usuarios/{id}`         | Busca por ID                     |
| GET    | `/api/usuarios/busca?q=`     | Busca por nome ou e-mail         |
| GET    | `/api/usuarios/tipo?tipo=`   | Filtra por tipo                  |
| POST   | `/api/usuarios`              | Cria usuário (via Factory)       |
| PUT    | `/api/usuarios/{id}`         | Atualiza usuário                 |
| DELETE | `/api/usuarios/{id}`         | Remove usuário                   |

### 📋 Empréstimos — `/api/emprestimos`
| Método | Endpoint                          | Descrição                           |
|--------|-----------------------------------|-------------------------------------|
| GET    | `/api/emprestimos`                | Lista todos                         |
| GET    | `/api/emprestimos/{id}`           | Busca por ID                        |
| GET    | `/api/emprestimos/busca?q=`       | Busca por usuário/livro             |
| GET    | `/api/emprestimos/status?status=` | Filtra por status                   |
| GET    | `/api/emprestimos/usuario/{id}`   | Empréstimos de um usuário           |
| GET    | `/api/emprestimos/atualizar-atrasos` | Atualiza status atrasados        |
| POST   | `/api/emprestimos`                | Cria empréstimo (Proxy → Facade)    |
| POST   | `/api/emprestimos/{id}/devolver`  | Devolve livro (Proxy → Facade)      |
| DELETE | `/api/emprestimos/{id}`           | Remove empréstimo finalizado        |

### 🔖 Reservas — `/api/reservas`
| Método | Endpoint                        | Descrição              |
|--------|---------------------------------|------------------------|
| GET    | `/api/reservas`                 | Lista todas            |
| GET    | `/api/reservas/{id}`            | Busca por ID           |
| GET    | `/api/reservas/busca?q=`        | Busca                  |
| GET    | `/api/reservas/status?status=`  | Filtra por status      |
| POST   | `/api/reservas`                 | Cria reserva           |
| POST   | `/api/reservas/{id}/cancelar`   | Cancela reserva        |
| DELETE | `/api/reservas/{id}`            | Remove reserva         |

### 🔔 Notificações — `/api/notificacoes`
| Método | Endpoint                           | Descrição                    |
|--------|------------------------------------|------------------------------|
| GET    | `/api/notificacoes`                | Lista todas                  |
| GET    | `/api/notificacoes/nao-lidas`      | Apenas não lidas             |
| GET    | `/api/notificacoes/contagem`       | Total não lidas (JSON)       |
| PUT    | `/api/notificacoes/{id}/lida`      | Marca uma como lida          |
| PUT    | `/api/notificacoes/marcar-todas`   | Marca todas como lidas       |
| DELETE | `/api/notificacoes/{id}`           | Remove notificação           |

---

## 🧪 Testes

```bash
mvn test
```

Os testes de integração validam:
- Criação via Factory Method (Aluno, Professor)
- Listagem de livros disponíveis via Iterator
- Validações de negócio (ISBN duplicado, e-mail duplicado)
- Atualização de status via Iterator
- Carregamento correto do contexto Spring

---

## 📦 Tecnologias

| Tecnologia        | Versão  | Uso                             |
|-------------------|---------|---------------------------------|
| Java              | 17      | Linguagem principal             |
| Spring Boot       | 3.2.3   | Framework web/IoC               |
| Spring Data JPA   | 3.2.3   | Persistência / ORM              |
| Hibernate         | 6.4     | Implementação JPA               |
| H2 Database       | 2.2     | Banco em memória (dev/testes)   |
| Lombok            | 1.18    | Redução de boilerplate          |
| Bean Validation   | 3.0     | Validações nos DTOs             |
| JUnit 5           | 5.10    | Testes unitários/integração     |
| Maven             | 3.8+    | Build e dependências            |
