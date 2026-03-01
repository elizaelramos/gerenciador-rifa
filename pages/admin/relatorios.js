import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../lib/formatters';

export default function AdminRelatorios() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
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
    if (user.tipo !== 'admin') {
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

  const handlePrint = () => {
    window.print();
  };

  const rifasFiltradas = relatorio.rifas.detalhes.filter((rifa) => {
    if (filtroStatus === 'todos') return true;
    return rifa.status === filtroStatus;
  });

  const totalPotencial = relatorio.rifas.detalhes.reduce(
    (acc, r) => acc + r.total_bilhetes * r.valor_bilhete,
    0
  );

  const percentualGeralVendido =
    relatorio.rifas.detalhes.reduce((acc, r) => acc + r.total_bilhetes, 0) > 0
      ? (
          (relatorio.vendas.total_bilhetes /
            relatorio.rifas.detalhes.reduce((acc, r) => acc + r.total_bilhetes, 0)) *
          100
        ).toFixed(1)
      : 0;

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
    <Layout title="Relatórios — Admin">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 no-print">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
              {' / '}Relatórios
            </p>
            <h1 className="text-3xl font-bold">Relatórios do Sistema</h1>
            <p className="text-gray-600 mt-1">Visão consolidada de todas as rifas e vendas</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary flex items-center gap-2"
            >
              Imprimir
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Sair
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── Bloco 1: Resumo Geral ── */}
            <section>
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Resumo Geral
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="card bg-green-50 border border-green-100">
                  <p className="text-sm text-gray-500 mb-1">Total Arrecadado</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatarValor(relatorio.vendas.total_arrecadado)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    de {formatarValor(totalPotencial)} potencial
                  </p>
                </div>

                <div className="card bg-blue-50 border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Bilhetes Vendidos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {relatorio.vendas.total_bilhetes}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {percentualGeralVendido}% do total emitido
                  </p>
                </div>

                <div className="card bg-yellow-50 border border-yellow-100">
                  <p className="text-sm text-gray-500 mb-1">Pendentes de Confirmação</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {relatorio.vendas.bilhetes_pendentes}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {relatorio.vendas.bilhetes_confirmados} já confirmados
                  </p>
                </div>

                <div className="card bg-purple-50 border border-purple-100">
                  <p className="text-sm text-gray-500 mb-1">Rifas no Sistema</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {relatorio.rifas.total}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {relatorio.rifas.ativas} ativas · {relatorio.rifas.concluidas} concluídas
                  </p>
                </div>
              </div>
            </section>

            {/* ── Bloco 2: Barra de progresso geral ── */}
            {relatorio.rifas.detalhes.length > 0 && (
              <section className="card">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-700">Progresso Geral de Vendas</h2>
                  <span className="text-sm font-semibold text-gray-600">{percentualGeralVendido}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full transition-all"
                    style={{ width: `${percentualGeralVendido}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{relatorio.vendas.total_bilhetes} vendidos</span>
                  <span>{formatarValor(relatorio.vendas.total_arrecadado)} arrecadados</span>
                </div>
              </section>
            )}

            {/* ── Bloco 3: Desempenho por Rifa ── */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-700">Desempenho por Rifa</h2>
                <div className="flex gap-2 no-print">
                  {['todos', 'preparacao', 'distribuido', 'concluido'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFiltroStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filtroStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'todos' && 'Todas'}
                      {status === 'preparacao' && 'Em Prep.'}
                      {status === 'distribuido' && 'Distribuídas'}
                      {status === 'concluido' && 'Concluídas'}
                    </button>
                  ))}
                </div>
              </div>

              {rifasFiltradas.length === 0 ? (
                <div className="card text-center py-10 text-gray-500">
                  Nenhuma rifa encontrada para este filtro.
                </div>
              ) : (
                <div className="space-y-4">
                  {rifasFiltradas.map((rifa) => {
                    const totalBilhetes = rifa.total_bilhetes || 1;
                    const pct = Math.min(
                      ((rifa.bilhetes_vendidos / totalBilhetes) * 100).toFixed(1),
                      100
                    );
                    const potencial = totalBilhetes * rifa.valor_bilhete;
                    const disponiveis = totalBilhetes - rifa.bilhetes_vendidos;

                    return (
                      <div key={rifa.id} className="card hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold">{rifa.titulo}</h3>
                            <p className="text-sm text-gray-500">
                              Sorteio: {formatarData(rifa.data_sorteio)}
                            </p>
                          </div>
                          <span className={`badge text-xs ${
                            rifa.status === 'preparacao' ? 'bg-blue-100 text-blue-800' :
                            rifa.status === 'distribuido' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {rifa.status === 'preparacao' && 'Em Preparação'}
                            {rifa.status === 'distribuido' && 'Distribuída'}
                            {rifa.status === 'concluido' && 'Concluída'}
                          </span>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold">{totalBilhetes}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Vendidos</p>
                            <p className="text-xl font-bold text-green-600">{rifa.bilhetes_vendidos}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Disponíveis</p>
                            <p className="text-xl font-bold text-blue-600">{disponiveis}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Arrecadado</p>
                            <p className="text-lg font-bold text-purple-600">
                              {formatarValor(rifa.total_arrecadado)}
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso de Vendas</span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                pct >= 80 ? 'bg-green-500' :
                                pct >= 50 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-400">
                            Potencial total: {formatarValor(potencial)}
                          </p>
                          <Link
                            href={`/rifa/${rifa.slug || rifa.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium no-print"
                          >
                            Ver detalhes →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Bloco 4: Vendedores ── */}
            <section>
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                Vendedores
              </h2>

              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <div className="card bg-blue-50 border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Total Ativos</p>
                  <p className="text-3xl font-bold text-blue-600">{relatorio.vendedores.total}</p>
                </div>
                <div className="card bg-green-50 border border-green-100">
                  <p className="text-sm text-gray-500 mb-1">Com Vendas</p>
                  <p className="text-3xl font-bold text-green-600">{relatorio.vendedores.com_vendas}</p>
                </div>
                <div className="card bg-red-50 border border-red-100">
                  <p className="text-sm text-gray-500 mb-1">Sem Vendas</p>
                  <p className="text-3xl font-bold text-red-500">{relatorio.vendedores.sem_vendas}</p>
                </div>
              </div>

              {/* Ranking */}
              {relatorio.vendedores.ranking.length > 0 ? (
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Ranking de Vendedores</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="p-3 font-semibold text-gray-600 w-12">#</th>
                          <th className="p-3 font-semibold text-gray-600">Vendedor</th>
                          <th className="p-3 font-semibold text-gray-600">Telefone</th>
                          <th className="p-3 font-semibold text-gray-600 text-right">Bilhetes</th>
                          <th className="p-3 font-semibold text-gray-600 text-right">Arrecadado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorio.vendedores.ranking.map((v, i) => (
                          <tr key={v.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-lg font-bold text-center">
                              {i === 0 && '🥇'}
                              {i === 1 && '🥈'}
                              {i === 2 && '🥉'}
                              {i > 2 && <span className="text-gray-400 text-sm">{i + 1}º</span>}
                            </td>
                            <td className="p-3 font-semibold">{v.nome}</td>
                            <td className="p-3 text-gray-500">{v.telefone}</td>
                            <td className="p-3 text-right font-bold text-blue-600">
                              {v.total_vendas}
                            </td>
                            <td className="p-3 text-right font-bold text-green-600">
                              {formatarValor(v.total_arrecadado)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-8 text-gray-500">
                  Nenhum vendedor com vendas registradas ainda.
                </div>
              )}
            </section>

            {/* Rodapé do relatório (só na impressão) */}
            <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-gray-400">
              Gerado em {new Date().toLocaleString('pt-BR')} · Sistema de Rifas
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
}
