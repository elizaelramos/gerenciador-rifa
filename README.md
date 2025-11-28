# 🎫 Sistema de Gerenciamento de Rifas

Sistema completo para gerenciamento manual de rifas com sorteios baseados na Loteria Federal.

## 📋 Características

- ✅ **Sorteio Justo**: Baseado na Loteria Federal com regra de "número mais próximo"
- ✅ **QR Code Duplo**: Validação para comprador e registro para vendedor
- ✅ **Gestão Completa**: Controle de vendas, acerto de contas e estatísticas
- ✅ **Impressão A4**: Layout otimizado para impressão de blocos físicos
- ✅ **Modo Mock**: Desenvolvimento sem necessidade de banco de dados
- ✅ **Transparência**: Compradores validam bilhetes via QR Code

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ instalado
- Navegador web moderno

### Instalação

1. **Instale as dependências:**

```bash
npm install
```

2. **Configure as variáveis de ambiente (opcional):**

Por padrão, o sistema roda em **modo MOCK** (sem banco de dados). Para desenvolvimento inicial, não é necessário configurar nada!

Se quiser conectar ao banco de dados real depois:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do banco.

3. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

4. **Abra no navegador:**

```
http://localhost:3000
```

## 🎯 Modo MOCK vs Modo Real

### Modo MOCK (Padrão)

- ✅ **Sem banco de dados** - Funciona imediatamente
- ✅ **Dados de exemplo** - Rifa pré-configurada para testes
- ✅ **Desenvolvimento rápido** - Ideal para testar funcionalidades

O sistema está configurado para usar dados mock por padrão. Você pode desenvolver e testar tudo sem precisar de banco de dados!

### Modo Real (Produção)

Para usar o banco de dados real:

1. Crie o banco de dados MySQL/MariaDB usando o arquivo `database/schema.sql`
2. Configure as credenciais em `.env.local`
3. Adicione a variável: `USE_MOCK_DATA=false`

## 📁 Estrutura do Projeto

```
projetoestrategico-rifa/
├── pages/                      # Páginas Next.js
│   ├── api/                   # API Routes
│   │   ├── generate-qrcode.js # Geração de QR Codes
│   │   ├── rifas/             # APIs de rifas
│   │   ├── venda/             # APIs de vendas
│   │   ├── sorteio/           # APIs de sorteio
│   │   └── gerenciador/       # APIs administrativas
│   ├── gerenciador/           # Painel do organizador
│   ├── venda/                 # Páginas de venda
│   ├── validacao.js           # Validação de bilhetes
│   └── index.js               # Página inicial
├── components/                 # Componentes React
│   ├── Layout.js
│   └── Header.js
├── lib/                       # Lógica de negócio
│   ├── db.js                  # Conexão banco + dados mock
│   └── rifaLogic.js           # Lógica de rifas e sorteio
├── styles/                    # Estilos globais
│   └── globals.css
├── database/                  # Schema do banco
│   └── schema.sql
└── public/                    # Arquivos estáticos
    ├── assets/
    ├── images/
    └── uploads/
```

## 🔧 Funcionalidades Principais

### 1. Criação de Rifas

- Defina título, descrição e prêmios
- Configure quantidade de bilhetes (dezena ou milhar)
- Distribua em blocos para vendedores
- Números da sorte gerados aleatoriamente

### 2. Distribuição de Blocos

- Impressão em formato A4
- Orientações para vendedores
- Capa do bloco (recortável)
- 5 cartões por página com QR Codes

### 3. Registro de Vendas

- Vendedor se auto-cadastra no primeiro acesso
- Registro via QR Code (sem senha)
- Dados imutáveis após registro
- Status: Pago ou Pendente

### 4. Validação de Bilhetes

- QR Code do comprador abre página de validação
- Mostra: número da sorte, proprietário, vendedor
- Transparência total para o comprador

### 5. Sorteio

- Baseado na Loteria Federal
- Organizador insere resultado + print oficial
- Sistema aplica regra de "número mais próximo"
- Ganhador identificado automaticamente

### 6. Acerto de Contas

- Painel mostra vendas por vendedor
- Total a receber calculado automaticamente
- Relatórios de pagos vs pendentes

## 🎲 Como Funciona o Sorteio

1. **Data do Sorteio**: Aguarda resultado da Loteria Federal
2. **Inserção Manual**: Organizador insere os números sorteados
3. **Extração**: Sistema extrai dezena (2 dígitos) ou milhar (4 dígitos)
4. **Busca do Ganhador**:
   - Verifica se o número exato foi PAGO
   - Se não, busca número POSTERIOR mais próximo
   - Se não houver, busca número ANTERIOR mais próximo
5. **Divulgação**: Resultado disponível via QR Code

## 📱 QR Codes

### QR Code do Vendedor (Canhoto)
- Abre formulário de registro
- URL: `/venda/registro?rifaId=X&blocoNum=Y&bilheteId=Z`
- Sem autenticação

### QR Code do Comprador (Cartão)
- Abre página de validação
- URL: `/validacao?rifaId=X&numero=YY`
- Mostra status e dados do bilhete

## 🗄️ Banco de Dados

### Tabelas Principais

- `rifas` - Informações das rifas
- `premios` - Prêmios de cada rifa
- `blocos` - Blocos físicos distribuídos
- `vendedores` - Cadastro de vendedores
- `bilhetes` - Bilhetes individuais
- `sorteios` - Resultados dos sorteios
- `usuarios` - Gerenciadores/Admin

### Views

- `view_status_vendas` - Estatísticas por rifa
- `view_acerto_contas` - Totais por vendedor

Ver arquivo completo: [database/schema.sql](database/schema.sql)

## 🖨️ Impressão

O sistema está otimizado para impressão em A4:

1. **Página de Orientação** - Instruções para o vendedor
2. **Capa do Bloco** - Identificação (recortável, 1/5 da página)
3. **Cartões** - 5 por página:
   - 30% = Canhoto do vendedor (QR Code de registro)
   - 70% = Cartão do comprador (QR Code de validação)

Use o recurso de impressão do navegador (Ctrl+P / Cmd+P).

## 🔐 Segurança

- ✅ Vendedores **não podem editar** vendas após registro
- ✅ Apenas gerenciador tem acesso administrativo
- ✅ Validações em todas as APIs
- ✅ Dados de comprador protegidos (telefone parcial)

## 📊 Próximos Passos

Funcionalidades a implementar:

- [ ] Página de validação de bilhetes
- [ ] Formulário de registro do vendedor
- [ ] Painel do gerenciador (dashboard)
- [ ] Sistema de criação de rifas
- [ ] Gerador de impressão de blocos
- [ ] API de registro de vendas
- [ ] API de execução de sorteio
- [ ] Upload de imagem do resultado
- [ ] Acerto de contas

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Compila para produção
npm start        # Inicia servidor de produção
npm run lint     # Verifica código
```

## 📝 Variáveis de Ambiente

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=rifa_db
DB_PORT=3306

# Aplicação
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Modo Mock (padrão: true)
USE_MOCK_DATA=true
```

## 🌐 Deploy (Hostinger)

### Preparação

1. Configure o banco de dados MariaDB/MySQL
2. Execute o script `database/schema.sql`
3. Configure as variáveis de ambiente
4. Defina `USE_MOCK_DATA=false`

### Build e Deploy

```bash
npm run build
npm start
```

## 💡 Dicas de Desenvolvimento

### Testando sem Banco

O sistema vem com dados mock pré-configurados em `lib/db.js`:
- 1 rifa de exemplo (100 bilhetes, 10 blocos)
- 2 vendedores
- 2 vendas registradas

### Adicionando Novos Dados Mock

Edite `lib/db.js` e adicione aos arrays:
- `MOCK_RIFA`
- `MOCK_PREMIOS`
- `MOCK_BLOCOS`
- `MOCK_BILHETES`

### Conectando ao Banco Real

1. Crie `.env.local` com suas credenciais
2. Defina `USE_MOCK_DATA=false`
3. Reinicie o servidor

## 🤝 Contribuindo

Este é um projeto customizado. Para alterações:

1. Entenda o fluxo completo no arquivo `planejamento_app_rifa.txt`
2. Mantenha a compatibilidade com o modo mock
3. Teste tanto mock quanto banco real

## 📄 Licença

Projeto proprietário - Uso interno

## 🆘 Suporte

Para dúvidas sobre o projeto, consulte:
- Arquivo de planejamento: `planejamento_app_rifa.txt`
- Schema do banco: `database/schema.sql`
- Lógica de negócio: `lib/rifaLogic.js`

---

**Desenvolvido com ❤️ para gerenciamento transparente de rifas**
