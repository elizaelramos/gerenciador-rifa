# 🚀 Como Começar - Guia Rápido

## ✅ Estrutura Criada

O projeto está **100% pronto** para você começar a trabalhar! Tudo foi configurado:

- ✅ Next.js configurado
- ✅ Tailwind CSS configurado
- ✅ Schema do banco de dados criado
- ✅ Lógica de negócio implementada
- ✅ Sistema de dados mock funcionando
- ✅ Componentes básicos prontos
- ✅ APIs essenciais criadas

## 📦 Próximo Passo: Instalar Dependências

Abra o terminal **neste diretório** e execute:

```bash
npm install
```

Isso vai instalar:
- Next.js (framework React)
- Tailwind CSS (estilos)
- MySQL2 (conexão com banco - opcional por enquanto)
- QRCode (geração de QR codes)

## 🎯 Rodar o Projeto

Depois que as dependências instalarem, execute:

```bash
npm run dev
```

E abra no navegador:

```
http://localhost:3000
```

## 🎨 O Que Você Vai Ver

A aplicação vai abrir com:

1. **Página Inicial** - Sistema de gerenciamento de rifas
2. **Rifa de Exemplo** - Uma rifa mock já configurada
3. **Menu de Navegação** - Links para as principais páginas

## 🔧 Modo MOCK Ativado

**IMPORTANTE**: O sistema está rodando em **modo MOCK** (sem banco de dados).

Isso significa:
- ✅ Funciona **imediatamente**
- ✅ Não precisa configurar banco de dados
- ✅ Tem dados de exemplo pré-carregados
- ✅ Perfeito para desenvolvimento

### Dados Mock Disponíveis

**Em `lib/db.js` você encontra:**

- 1 Rifa: "Rifa Beneficente de Natal 2024"
  - 100 bilhetes (00-99)
  - 10 blocos
  - R$ 5,00 por bilhete

- 3 Prêmios:
  - 1º: Moto Honda 0km
  - 2º: Notebook Dell
  - 3º: R$ 1.000 em dinheiro

- 2 Vendedores cadastrados
- 2 Bilhetes já vendidos (para testar validação)

## 📝 Estrutura de Arquivos Importantes

```
rifa/
├── pages/
│   ├── index.js              ← Página inicial (já criada)
│   ├── validacao.js          ← Para criar: Validação de bilhetes
│   ├── venda/
│   │   └── registro.js       ← Para criar: Formulário do vendedor
│   └── gerenciador/
│       └── dashboard.js      ← Para criar: Painel admin
│
├── lib/
│   ├── db.js                 ← Dados mock + funções de BD
│   └── rifaLogic.js          ← Toda lógica de rifas
│
├── components/
│   ├── Layout.js             ← Layout padrão (já criado)
│   └── Header.js             ← Cabeçalho (já criado)
│
└── database/
    └── schema.sql            ← Schema completo do BD
```

## 🎯 Próximas Páginas a Criar

Você pode começar criando estas páginas em qualquer ordem:

### 1. Página de Validação (`pages/validacao.js`)
- Comprador escaneia QR Code
- Mostra dados do bilhete
- Status: vendido ou não vendido

### 2. Formulário de Registro (`pages/venda/registro.js`)
- Vendedor escaneia QR Code do canhoto
- Cadastra dados do comprador
- Define status: pago ou pendente

### 3. Dashboard do Gerenciador (`pages/gerenciador/dashboard.js`)
- Lista todas as rifas
- Botão para criar nova rifa
- Estatísticas gerais

### 4. Gerador de Impressão
- Componente para imprimir blocos em A4
- Orientações + Capa + 5 cartões por página
- QR Codes gerados dinamicamente

## 💡 Dicas para Desenvolvimento

### Testando a API de QR Code

A API já está funcionando! Teste no navegador:

```
http://localhost:3000/api/generate-qrcode?url=https://google.com
```

Você verá um QR Code gerado!

### Acessando Dados Mock

Em qualquer página, você pode importar:

```javascript
import { MOCK_RIFA, MOCK_BILHETES } from '../lib/db';
```

### Usando Funções Prontas

```javascript
import { getRifa, getBilheteByNumero } from '../lib/db';
import { formatarValor, formatarTelefone } from '../lib/rifaLogic';

// Em uma página:
export async function getServerSideProps() {
  const rifa = await getRifa(1);
  const bilhete = await getBilheteByNumero(1, '45');

  return { props: { rifa, bilhete } };
}
```

## 🗄️ Quando Conectar o Banco Real

**Por enquanto, NÃO precisa!**

Mas quando quiser:

1. Crie o banco de dados MySQL/MariaDB
2. Execute o script: `database/schema.sql`
3. Copie `.env.local.example` para `.env.local`
4. Adicione suas credenciais
5. Defina `USE_MOCK_DATA=false`
6. Reinicie o servidor

## 🎨 Estilos Disponíveis

O Tailwind CSS está configurado! Use classes prontas:

```jsx
<button className="btn btn-primary">Botão Primário</button>
<button className="btn btn-success">Botão Sucesso</button>
<div className="card">Cartão com sombra</div>
<input className="input" />
<label className="label">Label</label>
```

Classes customizadas em `styles/globals.css`.

## 📱 Testando Responsividade

O sistema é mobile-first! Teste em:
- Desktop
- Tablet
- Mobile

Use o DevTools do navegador (F12) → Toggle Device Toolbar.

## 🐛 Problemas Comuns

### Erro ao instalar dependências

```bash
# Limpe o cache
npm cache clean --force
# Tente novamente
npm install
```

### Porta 3000 em uso

```bash
# Rode em outra porta
npm run dev -- -p 3001
```

### Módulo não encontrado

```bash
# Reinstale
rm -rf node_modules
npm install
```

## 📚 Recursos de Aprendizado

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)

## 🎯 Seu Plano de Trabalho Sugerido

**Semana 1:**
1. ✅ Rodar o projeto (você está aqui!)
2. Criar página de validação
3. Criar formulário de registro do vendedor

**Semana 2:**
4. Criar dashboard do gerenciador
5. Implementar criação de rifas
6. Implementar geração de blocos

**Semana 3:**
7. Criar sistema de impressão
8. Implementar sorteio
9. Upload de imagem do resultado

**Semana 4:**
10. Acerto de contas
11. Testes finais
12. Deploy na Hostinger

## 🎊 Pronto para Começar!

Execute agora:

```bash
npm install
npm run dev
```

E comece a explorar o projeto em:
```
http://localhost:3000
```

---

**Qualquer dúvida, consulte o README.md ou o arquivo planejamento_app_rifa.txt!**
