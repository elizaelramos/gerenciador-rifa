import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../lib/formatters';

export default function GerenciadorDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [rifas, setRifas] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    vendedores: { total: 0 },
    vendas: { total_bilhetes: 0, total_arrecadado: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se está logado
    const usuarioStorage = localStorage.getItem('usuario');
    if (!usuarioStorage) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(usuarioStorage);
    if (user.tipo !== 'gerenciador' && user.tipo !== 'admin') {
      router.push('/login');
      return;
    }

    setUsuario(user);
    carregarDados();
  }, [router]);

  const carregarDados = async () => {
    try {
      const [rifasResponse, estatisticasResponse] = await Promise.all([
        fetch('/api/rifas'),
        fetch('/api/estatisticas/dashboard'),
      ]);

      const rifasData = await rifasResponse.json();
      const estatisticasData = await estatisticasResponse.json();

      setRifas(rifasData.rifas || []);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
    <Layout title="Painel do Gerenciador">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel do Gerenciador</h1>
            <p className="text-gray-600">Olá, {usuario.nome}!</p>
          </div>
          <div className="flex gap-2">
            {usuario.tipo === 'admin' && (
              <Link href="/admin/dashboard" className="btn btn-secondary">
                Painel Admin
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">🎫 Minhas Rifas</h3>
            <p className="text-4xl font-bold text-blue-600">{rifas.length}</p>
            <p className="text-sm text-gray-600 mt-2">Criadas</p>
          </div>

          <div className="card bg-green-50">
            <h3 className="text-lg font-semibold mb-2">✓ Ativas</h3>
            <p className="text-4xl font-bold text-green-600">
              {rifas.filter(r => r.status !== 'concluido').length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Em andamento</p>
          </div>

          <div className="card bg-purple-50">
            <h3 className="text-lg font-semibold mb-2">👥 Vendedores</h3>
            <p className="text-4xl font-bold text-purple-600">{estatisticas.vendedores.total}</p>
            <p className="text-sm text-gray-600 mt-2">Cadastrados</p>
          </div>

          <div className="card bg-yellow-50">
            <h3 className="text-lg font-semibold mb-2">💰 Vendas</h3>
            <p className="text-4xl font-bold text-yellow-600">
              {formatarValor(estatisticas.vendas.total_arrecadado)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Total arrecadado</p>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/gerenciador/rifas/nova" className="card bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-2">➕</div>
            <h3 className="font-bold text-lg mb-1">Nova Rifa</h3>
            <p className="text-sm opacity-90">Criar uma nova rifa</p>
          </Link>

          <Link href="/gerenciador/vendedores" className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-bold text-lg mb-1">Vendedores</h3>
            <p className="text-sm text-gray-600">Gerenciar vendedores</p>
          </Link>

          <Link href="/gerenciador/relatorios" className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-lg mb-1">Relatórios</h3>
            <p className="text-sm text-gray-600">Ver estatísticas</p>
          </Link>
        </div>

        {/* Lista de Rifas */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Minhas Rifas</h2>
            <Link href="/gerenciador/rifas/nova" className="btn btn-primary">
              + Nova Rifa
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : rifas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-gray-500 text-lg mb-4">Você ainda não criou nenhuma rifa</p>
              <Link href="/gerenciador/rifas/nova" className="btn btn-primary">
                Criar Primeira Rifa
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {rifas.map((rifa) => (
                <div key={rifa.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{rifa.titulo}</h3>
                    <span className={`badge ${
                      rifa.status === 'preparacao' ? 'bg-blue-100 text-blue-800' :
                      rifa.status === 'distribuido' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rifa.status === 'preparacao' ? 'Em Preparação' :
                       rifa.status === 'distribuido' ? 'Distribuído' :
                       'Concluído'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {rifa.descricao || 'Sem descrição'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Data do Sorteio:</span>
                      <p className="font-semibold">{formatarData(rifa.data_sorteio)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor:</span>
                      <p className="font-semibold text-green-600">
                        {formatarValor(rifa.valor_bilhete)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Bilhetes:</span>
                      <p className="font-semibold">{rifa.qtde_bilhetes}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Blocos:</span>
                      <p className="font-semibold">{rifa.qtde_blocos}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/rifa/${rifa.id}`}
                      className="btn btn-primary flex-1 text-center text-sm"
                    >
                      Ver Detalhes
                    </Link>
                    {rifa.status === 'preparacao' && (
                      <Link
                        href={`/gerenciador/rifas/${rifa.id}/imprimir`}
                        className="btn btn-success text-sm"
                      >
                        Imprimir
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
