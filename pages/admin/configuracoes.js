import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function AdminConfiguracoes() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [sistema, setSistema] = useState(null);
  const [loadingSistema, setLoadingSistema] = useState(true);

  // Formulário de troca de senha
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [mensagemSenha, setMensagemSenha] = useState(null); // { tipo: 'sucesso'|'erro', texto }

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario');
    if (!usuarioStorage) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(usuarioStorage);
    if (user.tipo !== 'admin') {
      router.push('/login');
      return;
    }

    setUsuario(user);
    carregarSistema();
  }, [router]);

  const carregarSistema = async () => {
    try {
      const response = await fetch('/api/admin/configuracoes');
      const data = await response.json();
      if (response.ok) setSistema(data.sistema);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoadingSistema(false);
    }
  };

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    setMensagemSenha(null);

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      setMensagemSenha({ tipo: 'erro', texto: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      setMensagemSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setSalvandoSenha(true);
    try {
      const response = await fetch('/api/admin/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'mudar-senha',
          senhaAtual: senhaForm.senhaAtual,
          novaSenha: senhaForm.novaSenha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagemSenha({ tipo: 'sucesso', texto: data.message });
        setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      } else {
        setMensagemSenha({ tipo: 'erro', texto: data.error });
      }
    } catch (err) {
      setMensagemSenha({ tipo: 'erro', texto: 'Erro ao alterar senha. Tente novamente.' });
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  if (!usuario) {
    return (
      <Layout title="Carregando...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Configurações — Admin">
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
              {' / '}Configurações
            </p>
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Sair
          </button>
        </div>

        <div className="space-y-8">

          {/* ── Seção 1: Conta do Administrador ── */}
          <section className="card">
            <h2 className="text-xl font-bold mb-5">Conta do Administrador</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome</p>
                <p className="font-semibold text-gray-800">{usuario.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">E-mail</p>
                <p className="font-semibold text-gray-800">{usuario.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tipo</p>
                <span className="badge bg-purple-100 text-purple-800 text-xs">
                  Administrador
                </span>
              </div>
            </div>

            {/* Troca de senha */}
            <h3 className="text-lg font-semibold mb-4 border-t pt-4">Alterar Senha</h3>

            {mensagemSenha && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                mensagemSenha.tipo === 'sucesso'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {mensagemSenha.tipo === 'sucesso' ? '✓ ' : '✗ '}
                {mensagemSenha.texto}
              </div>
            )}

            <form onSubmit={handleMudarSenha} className="space-y-4">
              <div>
                <label className="label">Senha Atual</label>
                <input
                  type="password"
                  value={senhaForm.senhaAtual}
                  onChange={(e) => setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })}
                  className="input"
                  placeholder="Digite sua senha atual"
                  required
                  disabled={salvandoSenha}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.novaSenha}
                    onChange={(e) => setSenhaForm({ ...senhaForm, novaSenha: e.target.value })}
                    className="input"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                    disabled={salvandoSenha}
                  />
                </div>
                <div>
                  <label className="label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={senhaForm.confirmarSenha}
                    onChange={(e) => setSenhaForm({ ...senhaForm, confirmarSenha: e.target.value })}
                    className="input"
                    placeholder="Repita a nova senha"
                    minLength={6}
                    required
                    disabled={salvandoSenha}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvandoSenha}
              >
                {salvandoSenha ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </form>
          </section>

          {/* ── Seção 2: Status do Sistema ── */}
          <section className="card">
            <h2 className="text-xl font-bold mb-5">Status do Sistema</h2>

            {loadingSistema ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="spinner"></div>
                <span>Verificando...</span>
              </div>
            ) : sistema ? (
              <div className="space-y-4">

                {/* Modo de Operação */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-800">Modo de Operação</p>
                    <p className="text-sm text-gray-500">
                      {sistema.modoMock
                        ? 'Usando dados simulados (sem banco de dados real)'
                        : 'Conectado ao banco de dados real'}
                    </p>
                  </div>
                  <span className={`badge ${sistema.modoMock
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'}`}>
                    {sistema.modoMock ? 'Mock' : 'Produção'}
                  </span>
                </div>

                {/* Banco de dados */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-800">Banco de Dados</p>
                    <p className="text-sm text-gray-500">
                      {sistema.dbHost} / {sistema.dbNome}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{sistema.dbStatus.mensagem}</p>
                  </div>
                  <span className={`badge ${sistema.dbStatus.conectado
                    ? 'bg-green-100 text-green-800'
                    : sistema.modoMock
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-red-100 text-red-800'}`}>
                    {sistema.dbStatus.conectado
                      ? 'Conectado'
                      : sistema.modoMock ? 'Mock' : 'Erro'}
                  </span>
                </div>

                {/* URL Base */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-800">URL Pública</p>
                    <p className="text-sm text-gray-500 break-all">{sistema.urlBase}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Usada para geração de QR Codes e links de compartilhamento
                    </p>
                  </div>
                  <a
                    href={sistema.urlBase}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap ml-4"
                  >
                    Abrir →
                  </a>
                </div>

                <p className="text-xs text-gray-400 pt-2">
                  Para alterar URL e configurações de banco, edite o arquivo{' '}
                  <code className="bg-gray-100 px-1 rounded">.env.local</code> no servidor.
                </p>
              </div>
            ) : (
              <p className="text-red-500">Não foi possível carregar as informações do sistema.</p>
            )}
          </section>

          {/* ── Seção 3: Acesso Rápido ── */}
          <section>
            <h2 className="text-xl font-bold mb-4">Acesso Rápido</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/admin/dashboard" className="card hover:shadow-md transition-shadow text-center">
                <p className="text-3xl mb-2">🖥️</p>
                <p className="font-semibold">Painel Admin</p>
                <p className="text-xs text-gray-500 mt-1">Gerenciar usuários</p>
              </Link>
              <Link href="/admin/relatorios" className="card hover:shadow-md transition-shadow text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="font-semibold">Relatórios</p>
                <p className="text-xs text-gray-500 mt-1">Ver estatísticas</p>
              </Link>
              <Link href="/gerenciador/dashboard" className="card hover:shadow-md transition-shadow text-center">
                <p className="text-3xl mb-2">🎫</p>
                <p className="font-semibold">Gerenciador</p>
                <p className="text-xs text-gray-500 mt-1">Gerir rifas</p>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
