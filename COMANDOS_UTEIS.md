# 🛠️ Comandos Úteis

## 🚀 Iniciar o Projeto

```bash
# Primeira vez - instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir no navegador
# http://localhost:3000
```

---

## 📦 Gerenciamento de Dependências

```bash
# Instalar dependências
npm install

# Adicionar nova dependência
npm install nome-do-pacote

# Adicionar dependência de desenvolvimento
npm install --save-dev nome-do-pacote

# Atualizar dependências
npm update

# Limpar cache do npm
npm cache clean --force

# Reinstalar tudo do zero
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Build e Produção

```bash
# Compilar para produção
npm run build

# Iniciar servidor de produção
npm start

# Verificar código (lint)
npm run lint
```

---

## 🐛 Resolução de Problemas

```bash
# Porta 3000 ocupada? Use outra porta
npm run dev -- -p 3001

# Erro de dependências? Reinstale
rm -rf node_modules
npm install

# Limpar cache do Next.js
rm -rf .next

# Rebuild completo
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🗄️ Banco de Dados

```bash
# Acessar MySQL/MariaDB (quando configurado)
mysql -u seu_usuario -p

# Criar banco de dados
mysql -u seu_usuario -p < database/schema.sql

# Backup do banco
mysqldump -u seu_usuario -p rifa_db > backup.sql

# Restaurar backup
mysql -u seu_usuario -p rifa_db < backup.sql
```

---

## 🔍 Verificar Status

```bash
# Ver processos Node rodando
ps aux | grep node

# Matar processo na porta 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill

# Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F

# Ver versão do Node
node --version

# Ver versão do npm
npm --version
```

---

## 📂 Navegação Rápida

```bash
# Listar arquivos
ls -la

# Árvore de diretórios (se tree instalado)
tree -L 2

# Buscar arquivo
find . -name "*.js"

# Contar linhas de código
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l
```

---

## 🧪 Testes Rápidos

```bash
# Testar API de QR Code (com curl)
curl "http://localhost:3000/api/generate-qrcode?url=https://google.com" -o test-qr.png

# Testar API de rifas
curl http://localhost:3000/api/rifas

# Testar API de rifa específica
curl http://localhost:3000/api/rifas/1
```

---

## 📝 Git (quando inicializar)

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Estrutura inicial do projeto"

# Ver status
git status

# Ver histórico
git log --oneline

# Criar branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main
```

---

## 🔄 Alternar entre Mock e Banco Real

```bash
# Editar .env.local

# Para usar MOCK (padrão - sem banco)
USE_MOCK_DATA=true

# Para usar banco REAL
USE_MOCK_DATA=false

# Depois de alterar, reinicie o servidor
# Ctrl+C para parar
# npm run dev para reiniciar
```

---

## 📊 Monitoramento

```bash
# Ver logs em tempo real (se estiver rodando)
# Os logs aparecem automaticamente no terminal onde rodou npm run dev

# Ver uso de memória
top
# ou
htop (se instalado)

# Ver espaço em disco
df -h
```

---

## 🎨 Desenvolvimento

```bash
# Adicionar nova página
# Criar arquivo em: pages/nome-da-pagina.js

# Adicionar nova API
# Criar arquivo em: pages/api/nome-da-api.js

# Adicionar novo componente
# Criar arquivo em: components/NomeDoComponente.js

# Verificar erros de sintaxe
npm run lint

# Formatar código (se configurar prettier)
npm run format
```

---

## 🌐 Testes no Navegador

```bash
# Página inicial
http://localhost:3000

# API de rifas
http://localhost:3000/api/rifas

# API de QR Code
http://localhost:3000/api/generate-qrcode?url=https://google.com

# Validação (quando implementar)
http://localhost:3000/validacao?rifaId=1&numero=45

# Registro vendedor (quando implementar)
http://localhost:3000/venda/registro?rifaId=1&blocoNum=1&bilheteId=1

# Dashboard (quando implementar)
http://localhost:3000/gerenciador/dashboard
```

---

## 🔧 Configurações Úteis

```bash
# Ver configuração do Next.js
cat next.config.js

# Ver configuração do Tailwind
cat tailwind.config.js

# Ver dependências instaladas
npm list --depth=0

# Ver dependências desatualizadas
npm outdated
```

---

## 📱 Teste em Dispositivos Móveis

```bash
# 1. Descubra seu IP local
# Windows:
ipconfig

# Linux/Mac:
ifconfig
# ou
ip addr

# 2. Inicie o servidor
npm run dev

# 3. No celular, acesse:
# http://SEU_IP_LOCAL:3000
# Exemplo: http://192.168.1.100:3000
```

---

## 🎯 Atalhos do VS Code

```
Ctrl+P (Cmd+P)     - Buscar arquivo
Ctrl+Shift+F       - Buscar em todos os arquivos
Ctrl+`             - Abrir/fechar terminal
Ctrl+B             - Abrir/fechar sidebar
F5                 - Debug
Ctrl+Shift+P       - Command palette
```

---

## 🚨 Comandos de Emergência

```bash
# Parar TUDO
Ctrl+C (no terminal onde está rodando)

# Matar todos os processos Node (CUIDADO!)
pkill node

# Limpar TUDO e recomeçar
rm -rf node_modules .next package-lock.json
npm install
npm run dev

# Reverter arquivo para versão anterior (Git)
git checkout -- arquivo.js
```

---

## 📖 Comandos de Ajuda

```bash
# Ajuda do npm
npm help

# Ajuda de comando específico
npm help install

# Ver todas as variáveis de ambiente
env

# Ver variável específica
echo $NODE_ENV
```

---

## 🎨 Tailwind CSS

```bash
# Testar classes no navegador
# Abra DevTools (F12) e inspecione elementos

# Ver todas as classes geradas
npm run build
# Arquivo gerado em: .next/static/css/

# Purgar CSS não utilizado (automático no build)
npm run build
```

---

## 🔒 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Verificar dependências desatualizadas
npm outdated

# Atualizar pacote específico
npm update nome-do-pacote
```

---

## 📊 Estatísticas do Projeto

```bash
# Contar linhas de código JavaScript
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l

# Contar arquivos
find . -type f -not -path "./node_modules/*" | wc -l

# Tamanho do projeto
du -sh .

# Tamanho sem node_modules
du -sh --exclude=node_modules .
```

---

## ⚡ Comandos Rápidos Combinados

```bash
# Setup completo do zero
npm install && npm run dev

# Rebuild completo
rm -rf .next node_modules && npm install && npm run build

# Commit rápido (Git)
git add . && git commit -m "mensagem" && git push

# Ver tudo
npm run dev & sleep 3 && open http://localhost:3000
```

---

## 💡 Dicas

- Use `Ctrl+C` para parar o servidor
- Use `npm run dev` ao invés de `npm start` durante desenvolvimento
- Reinicie o servidor após alterar arquivos de configuração
- Use DevTools do navegador (F12) para debugar
- Consulte `package.json` para ver todos os scripts disponíveis

---

**Guarde este arquivo como referência rápida! 📌**
