import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [gerenciadores, setGerenciadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  useEffect(() => {
    // Verificar se está logado
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
    carregarGerenciadores();
  }, [router]);

  const carregarGerenciadores = async () => {
    try {
      const response = await fetch('/api/admin/gerenciadores');
      const data = await response.json();
      setGerenciadores(data.gerenciadores || []);
    } catch (error) {
      console.error('Erro ao carregar gerenciadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/gerenciadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar gerenciador');
      }

      alert('Gerenciador criado com sucesso!');
      setShowForm(false);
      setFormData({ nome: '', email: '', senha: '' });
      carregarGerenciadores();
    } catch (error) {
      alert(error.message);
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
    <Layout title="Painel do Administrador">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel do Administrador</h1>
            <p className="text-gray-600">Olá, {usuario.nome}!</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Sair
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">👤 Gerenciadores</h3>
            <p className="text-4xl font-bold text-blue-600">{gerenciadores.length}</p>
            <p className="text-sm text-gray-600 mt-2">Ativos no sistema</p>
          </div>

          <div className="card bg-green-50">
            <h3 className="text-lg font-semibold mb-2">🎫 Rifas Totais</h3>
            <p className="text-4xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600 mt-2">Criadas no sistema</p>
          </div>

          <div className="card bg-purple-50">
            <h3 className="text-lg font-semibold mb-2">💰 Sistema</h3>
            <p className="text-2xl font-bold text-purple-600">Ativo</p>
            <p className="text-sm text-gray-600 mt-2">Funcionando normalmente</p>
          </div>
        </div>

        {/* Seção de Gerenciadores */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gerenciadores</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
            >
              {showForm ? 'Cancelar' : '+ Novo Gerenciador'}
            </button>
          </div>

          {/* Formulário de Criação */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold mb-4">Criar Novo Gerenciador</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Senha</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="input"
                  required
                  minLength="6"
                />
                <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <button type="submit" className="btn btn-success">
                Criar Gerenciador
              </button>
            </form>
          )}

          {/* Lista de Gerenciadores */}
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : gerenciadores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum gerenciador cadastrado ainda
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Cadastrado em</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {gerenciadores.map((g) => (
                    <tr key={g.id} className="border-t">
                      <td className="p-3 font-semibold">{g.nome}</td>
                      <td className="p-3">{g.email}</td>
                      <td className="p-3">
                        <span className={`badge ${g.ativo ? 'badge-pago' : 'badge-nao-vendido'}`}>
                          {g.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(g.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">
                          Editar
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Desativar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Links Rápidos */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link href="/admin/relatorios" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-2">📊 Relatórios</h3>
            <p className="text-sm text-gray-600">Ver relatórios gerais do sistema</p>
          </Link>

          <Link href="/admin/configuracoes" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-2">⚙️ Configurações</h3>
            <p className="text-sm text-gray-600">Configurar sistema</p>
          </Link>

          <Link href="/" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-bold mb-2">🏠 Site Público</h3>
            <p className="text-sm text-gray-600">Ver site público</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
