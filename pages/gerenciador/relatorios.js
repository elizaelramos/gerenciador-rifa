import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../lib/formatters';

export default function Relatorios() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatorio, setRelatorio] = useState({
    vendas: {
      total_bilhetes: 0,
      total_arrecadado: 0,
      bilhetes_pendentes: 0,
      bilhetes_confirmados: 0,
    },
    vendedores: {
      total: 0,
      com_vendas: 0,
      sem_vendas: 0,
      ranking: [],
    },
    rifas: {
      total: 0,
      ativas: 0,
      concluidas: 0,
      detalhes: [],
    },
  });

  useEffect(() => {
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
    carregarRelatorio();
  }, [router]);

  const carregarRelatorio = async () => {
    try {
      const response = await fetch('/api/relatorios/geral');
      const data = await response.json();

      if (response.ok) {
        setRelatorio(data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
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
    <Layout title="Relatórios">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 Relatórios</h1>
            <p className="text-gray-600">Visão geral do desempenho</p>
          </div>
          <div className="flex gap-2">
            <Link href="/gerenciador/dashboard" className="btn btn-secondary">
              ← Voltar
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resumo Geral de Vendas */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">💰 Resumo de Vendas</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Arrecadado</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatarValor(relatorio.vendas.total_arrecadado)}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bilhetes Vendidos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {relatorio.vendas.total_bilhetes}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {relatorio.vendas.bilhetes_pendentes}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Confirmados</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {relatorio.vendas.bilhetes_confirmados}
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas de Vendedores */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">👥 Estatísticas de Vendedores</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total de Vendedores</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {relatorio.vendedores.total}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Com Vendas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {relatorio.vendedores.com_vendas}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sem Vendas</p>
                  <p className="text-3xl font-bold text-red-600">
                    {relatorio.vendedores.sem_vendas}
                  </p>
                </div>
              </div>

              {/* Ranking de Vendedores */}
              {relatorio.vendedores.ranking.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">🏆 Ranking de Vendedores</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3">Posição</th>
                          <th className="text-left p-3">Vendedor</th>
                          <th className="text-left p-3">Telefone</th>
                          <th className="text-right p-3">Bilhetes Vendidos</th>
                          <th className="text-right p-3">Total Arrecadado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorio.vendedores.ranking.map((vendedor, index) => (
                          <tr key={vendedor.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <span className="font-bold text-lg">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                                {index > 2 && `${index + 1}º`}
                              </span>
                            </td>
                            <td className="p-3 font-semibold">{vendedor.nome}</td>
                            <td className="p-3 text-gray-600">{vendedor.telefone}</td>
                            <td className="p-3 text-right font-semibold">
                              {vendedor.total_vendas}
                            </td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {formatarValor(vendedor.total_arrecadado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Detalhes por Rifa */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">🎫 Desempenho por Rifa</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total de Rifas</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {relatorio.rifas.total}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Rifas Ativas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {relatorio.rifas.ativas}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {relatorio.rifas.concluidas}
                  </p>
                </div>
              </div>

              {relatorio.rifas.detalhes.length > 0 && (
                <div className="space-y-4">
                  {relatorio.rifas.detalhes.map((rifa) => {
                    const percentualVendido = ((rifa.bilhetes_vendidos / rifa.total_bilhetes) * 100).toFixed(1);

                    return (
                      <div key={rifa.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold">{rifa.titulo}</h3>
                            <p className="text-sm text-gray-600">
                              Sorteio: {formatarData(rifa.data_sorteio)}
                            </p>
                          </div>
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

                        <div className="grid md:grid-cols-5 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Total de Bilhetes</p>
                            <p className="text-lg font-bold">{rifa.total_bilhetes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Vendidos</p>
                            <p className="text-lg font-bold text-green-600">{rifa.bilhetes_vendidos}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Disponíveis</p>
                            <p className="text-lg font-bold text-blue-600">
                              {rifa.total_bilhetes - rifa.bilhetes_vendidos}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Arrecadado</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatarValor(rifa.total_arrecadado)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Potencial Total</p>
                            <p className="text-lg font-bold text-purple-600">
                              {formatarValor(rifa.total_bilhetes * rifa.valor_bilhete)}
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso de Vendas</span>
                            <span className="font-semibold">{percentualVendido}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                              style={{ width: `${percentualVendido}%` }}
                            ></div>
                          </div>
                        </div>

                        <Link
                          href={`/rifa/${rifa.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Ver detalhes →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
