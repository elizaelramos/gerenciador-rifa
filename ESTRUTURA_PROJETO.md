# 📂 Estrutura Completa do Projeto

## 🎯 Arquivos Criados e Prontos

```
projetoestrategico-rifa/
│
├── 📄 package.json                    # Dependências do projeto
├── 📄 next.config.js                  # Configuração Next.js
├── 📄 tailwind.config.js              # Configuração Tailwind CSS
├── 📄 postcss.config.js               # Configuração PostCSS
├── 📄 .gitignore                      # Arquivos ignorados pelo Git
├── 📄 .env.local.example              # Exemplo de variáveis de ambiente
│
├── 📄 README.md                       # Documentação completa
├── 📄 COMO_COMECAR.md                 # Guia rápido de início
├── 📄 ESTRUTURA_PROJETO.md            # Este arquivo
├── 📄 planejamento_app_rifa.txt       # Planejamento original
│
├── 📁 database/                       # Scripts do banco de dados
│   └── 📄 schema.sql                  # ✅ Schema completo MariaDB/MySQL
│
├── 📁 lib/                            # Lógica de negócio
│   ├── 📄 db.js                       # ✅ Conexão BD + dados mock
│   └── 📄 rifaLogic.js                # ✅ Lógica de rifas e sorteio
│
├── 📁 components/                     # Componentes React reutilizáveis
│   ├── 📄 Layout.js                   # ✅ Layout padrão com header/footer
│   └── 📄 Header.js                   # ✅ Cabeçalho com navegação
│
├── 📁 styles/                         # Estilos globais
│   └── 📄 globals.css                 # ✅ Tailwind + estilos customizados
│
├── 📁 pages/                          # Páginas e rotas Next.js
│   │
│   ├── 📄 _app.js                     # ✅ Componente raiz Next.js
│   ├── 📄 index.js                    # ✅ Página inicial
│   │
│   ├── 📁 api/                        # API Routes (backend)
│   │   │
│   │   ├── 📄 generate-qrcode.js     # ✅ API: Gera QR Codes
│   │   │
│   │   ├── 📁 rifas/                 # APIs de rifas
│   │   │   ├── 📄 index.js           # ✅ GET: Lista rifas
│   │   │   └── 📄 [rifaId].js        # ✅ GET: Detalhes de uma rifa
│   │   │
│   │   ├── 📁 venda/                 # APIs de vendas
│   │   │   └── 📄 registrar.js       # ⏳ POST: Registra venda
│   │   │
│   │   ├── 📁 sorteio/               # APIs de sorteio
│   │   │   └── 📄 executar.js        # ⏳ POST: Executa sorteio
│   │   │
│   │   └── 📁 gerenciador/           # APIs administrativas
│   │       └── 📄 editar-venda.js    # ⏳ PUT: Edita venda (admin)
│   │
│   ├── 📁 gerenciador/                # Páginas administrativas
│   │   ├── 📄 dashboard.js            # ⏳ Dashboard principal
│   │   └── 📁 rifas/
│   │       └── 📄 [rifaId]/
│   │           ├── 📄 distribuicao.js # ⏳ Distribuir blocos
│   │           └── 📄 acerto.js       # ⏳ Acerto de contas
│   │
│   ├── 📁 venda/                      # Páginas de venda
│   │   └── 📄 registro.js             # ⏳ Formulário do vendedor
│   │
│   └── 📄 validacao.js                # ⏳ Página de validação (comprador)
│
└── 📁 public/                         # Arquivos estáticos
    ├── 📁 assets/                     # Assets gerais
    ├── 📁 images/                     # Imagens
    └── 📁 uploads/                    # Uploads (prints de sorteios)
```

## 📊 Status de Implementação

### ✅ Concluído (Pronto para usar)

- **Configuração do Projeto**
  - ✅ Next.js configurado
  - ✅ Tailwind CSS configurado
  - ✅ Estrutura de pastas
  - ✅ Package.json com dependências

- **Banco de Dados**
  - ✅ Schema completo SQL
  - ✅ Tabelas: rifas, premios, blocos, vendedores, bilhetes, sorteios
  - ✅ Views: status_vendas, acerto_contas
  - ✅ Sistema de dados mock

- **Lógica de Negócio**
  - ✅ Geração de números aleatórios
  - ✅ Distribuição em blocos
  - ✅ Algoritmo de "número mais próximo"
  - ✅ Validações de dados
  - ✅ Funções de formatação
  - ✅ Cálculo de estatísticas

- **Componentes**
  - ✅ Layout padrão
  - ✅ Header com navegação
  - ✅ Estilos globais

- **Páginas**
  - ✅ Página inicial (index.js)

- **APIs**
  - ✅ Geração de QR Code
  - ✅ Listar rifas
  - ✅ Detalhes de rifa

### ⏳ A Implementar (Próximos passos)

- **Páginas Públicas**
  - ⏳ Validação de bilhetes
  - ⏳ Formulário de registro do vendedor

- **Painel Administrativo**
  - ⏳ Dashboard principal
  - ⏳ Criação de rifas
  - ⏳ Distribuição de blocos
  - ⏳ Acerto de contas
  - ⏳ Processamento de sorteio

- **Componentes Especiais**
  - ⏳ Gerador de impressão (A4)
  - ⏳ PrintLayout (orientação + capa + cartões)
  - ⏳ Formulários de venda
  - ⏳ Cards de estatísticas

- **APIs**
  - ⏳ Registro de vendas
  - ⏳ Execução de sorteio
  - ⏳ Edição administrativa
  - ⏳ Upload de imagem

## 🎯 Ordem Sugerida de Implementação

### Fase 1: Funcionalidades Públicas (Usuários Finais)

1. **Página de Validação** (`pages/validacao.js`)
   - URL: `/validacao?rifaId=1&numero=45`
   - Mostra dados do bilhete
   - Status: vendido/não vendido
   - Informações do vendedor

2. **Formulário de Registro** (`pages/venda/registro.js`)
   - URL: `/venda/registro?rifaId=1&blocoNum=3&bilheteId=45`
   - Auto-cadastro de vendedor
   - Registro de comprador
   - Integração com API

3. **API de Registro de Vendas** (`pages/api/venda/registrar.js`)
   - POST: Registra venda
   - Validações
   - Regra de imutabilidade

### Fase 2: Painel Administrativo

4. **Dashboard** (`pages/gerenciador/dashboard.js`)
   - Lista todas as rifas
   - Estatísticas gerais
   - Botão criar nova rifa

5. **Criação de Rifas**
   - Formulário completo
   - Geração de blocos e bilhetes
   - Integração com `lib/rifaLogic.js`

6. **Distribuição de Blocos**
   - Atribuir blocos a vendedores
   - Gerar impressão

### Fase 3: Sistema de Impressão

7. **PrintLayout Component** (`components/PrintLayout.js`)
   - Orientação do vendedor (página completa)
   - Capa do bloco (1/5 da página)
   - 5 cartões por página
   - QR Codes dinâmicos

### Fase 4: Sorteio e Finalização

8. **Processamento de Sorteio**
   - Formulário de inserção de resultado
   - Upload de print oficial
   - Execução do algoritmo
   - Identificação do ganhador

9. **Acerto de Contas**
   - Relatório por vendedor
   - Total a receber
   - Status de pagamentos

## 📝 Arquivos de Suporte

### Documentação

- **README.md** - Documentação completa do projeto
- **COMO_COMECAR.md** - Guia rápido de início
- **ESTRUTURA_PROJETO.md** - Este arquivo (visão geral)
- **planejamento_app_rifa.txt** - Planejamento detalhado original

### Configuração

- **.env.local.example** - Template de variáveis de ambiente
- **.gitignore** - Arquivos ignorados pelo Git
- **package.json** - Dependências e scripts
- **tailwind.config.js** - Configuração do Tailwind
- **next.config.js** - Configuração do Next.js

## 🔑 Arquivos-Chave para Entender

Se você quiser entender rapidamente o projeto, leia nesta ordem:

1. **COMO_COMECAR.md** - Como rodar o projeto
2. **lib/rifaLogic.js** - Toda a lógica de negócio
3. **lib/db.js** - Dados mock + funções de BD
4. **database/schema.sql** - Estrutura do banco
5. **pages/index.js** - Exemplo de página completa

## 💡 Dicas de Navegação

### Onde encontrar cada funcionalidade:

| Funcionalidade | Arquivo |
|----------------|---------|
| Gerar números aleatórios | `lib/rifaLogic.js` → `gerarNumerosAleatorios()` |
| Lógica de sorteio | `lib/rifaLogic.js` → `encontrarGanhadorPorProximidade()` |
| Buscar bilhete | `lib/db.js` → `getBilheteByNumero()` |
| Dados de exemplo | `lib/db.js` → `MOCK_*` |
| Schema do BD | `database/schema.sql` |
| Gerar QR Code | `pages/api/generate-qrcode.js` |
| Estilos globais | `styles/globals.css` |

## 🚀 Como Usar Esta Estrutura

1. **Explore os arquivos criados** - Tudo tem comentários explicativos
2. **Comece pelas páginas** - Implemente validação e registro
3. **Use os mocks** - Desenvolva sem precisar de banco
4. **Teste frequentemente** - `npm run dev` e veja no navegador
5. **Conecte o BD depois** - Quando estiver pronto para produção

---

**Estrutura criada e documentada! Pronto para começar o desenvolvimento! 🎉**
