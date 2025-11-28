import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../../../lib/formatters';

export default function AcertoContas() {
    const router = useRouter();
    const { rifaId } = router.query;

    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processando, setProcessando] = useState(false);
    const [blocoSelecionado, setBlocoSelecionado] = useState(null);

    useEffect(() => {
        if (!rifaId) return;

        carregarDados();
    }, [rifaId]);

    async function carregarDados() {
        try {
            const response = await fetch(`/api/rifas/${rifaId}`);

            if (!response.ok) {
                throw new Error('Rifa não encontrada');
            }

            const data = await response.json();
            setDados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleRecolherBloco = async (blocoId) => {
        if (!confirm('Confirma o recolhimento deste bloco? Esta ação marca o bloco como devolvido pelo vendedor.')) {
            return;
        }

        setProcessando(true);

        try {
            const response = await fetch(`/api/blocos/${blocoId}/recolher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                await carregarDados(); // Recarregar dados
                setBlocoSelecionado(null);
            } else {
                alert(data.error || 'Erro ao recolher bloco');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao recolher bloco');
        } finally {
            setProcessando(false);
        }
    };

    const abrirDetalhesBloco = (bloco) => {
        setBlocoSelecionado(bloco);
    };

    if (loading) {
        return (
            <Layout title="Carregando...">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Erro">
                <div className="container mx-auto px-4 py-8">
                    <div className="card bg-red-50 border border-red-200">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
                        <p className="text-red-600">{error}</p>
                        <Link href={`/rifa/${rifaId}`} className="btn btn-primary mt-4 inline-block">
                            Voltar
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const { rifa, blocos, bilhetes } = dados;

    // Filtrar blocos distribuídos
    const blocosDistribuidos = blocos.filter(b => b.status === 'distribuido' || b.status === 'recolhido');

    // Calcular estatísticas por bloco
    const blocosComEstatisticas = blocosDistribuidos.map(bloco => {
        const bilhetesDoBloco = bilhetes.filter(b => b.bloco_id === bloco.id);
        const vendidosPagos = bilhetesDoBloco.filter(b => b.status_venda === 'pago' || b.status_venda === 'confirmado').length;
        const vendidosPendentes = bilhetesDoBloco.filter(b => b.status_venda === 'pendente').length;
        const naoVendidos = bilhetesDoBloco.filter(b => b.status_venda === 'nao_vendido').length;
        const totalVendidos = vendidosPagos + vendidosPendentes;
        const valorArrecadado = vendidosPagos * rifa.valor_bilhete;
        const valorPendente = vendidosPendentes * rifa.valor_bilhete;

        return {
            ...bloco,
            totalBilhetes: bilhetesDoBloco.length,
            vendidosPagos,
            vendidosPendentes,
            naoVendidos,
            totalVendidos,
            valorArrecadado,
            valorPendente,
            percentualVendido: ((totalVendidos / bilhetesDoBloco.length) * 100).toFixed(1)
        };
    });

    // Agrupar por vendedor
    const vendedoresMap = new Map();
    blocosComEstatisticas.forEach(bloco => {
        if (bloco.vendedor_id) {
            if (!vendedoresMap.has(bloco.vendedor_id)) {
                vendedoresMap.set(bloco.vendedor_id, {
                    id: bloco.vendedor_id,
                    nome: bloco.vendedor_nome,
                    telefone: bloco.vendedor_telefone,
                    blocos: [],
                    totalBilhetes: 0,
                    totalVendidos: 0,
                    totalArrecadado: 0,
                    totalPendente: 0
                });
            }

            const vendedor = vendedoresMap.get(bloco.vendedor_id);
            vendedor.blocos.push(bloco);
            vendedor.totalBilhetes += bloco.totalBilhetes;
            vendedor.totalVendidos += bloco.totalVendidos;
            vendedor.totalArrecadado += bloco.valorArrecadado;
            vendedor.totalPendente += bloco.valorPendente;
        }
    });

    const vendedores = Array.from(vendedoresMap.values());

    return (
        <Layout title={`Acerto de Contas - ${rifa.titulo}`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href={`/rifa/${rifaId}`} className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                        ← Voltar para Detalhes da Rifa
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">💰 Acerto de Contas</h1>
                    <p className="text-gray-600">{rifa.titulo}</p>
                </div>

                {/* Resumo Geral */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-blue-50 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600 mb-1">Total de Vendedores</p>
                        <p className="text-3xl font-bold text-blue-600">{vendedores.length}</p>
                    </div>
                    <div className="card bg-green-50 border-l-4 border-green-500">
                        <p className="text-sm text-gray-600 mb-1">Blocos Distribuídos</p>
                        <p className="text-3xl font-bold text-green-600">{blocosDistribuidos.length}</p>
                    </div>
                    <div className="card bg-purple-50 border-l-4 border-purple-500">
                        <p className="text-sm text-gray-600 mb-1">Blocos Recolhidos</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {blocosDistribuidos.filter(b => b.status === 'recolhido').length}
                        </p>
                    </div>
                    <div className="card bg-yellow-50 border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-600 mb-1">Valor do Bilhete</p>
                        <p className="text-3xl font-bold text-yellow-600">{formatarValor(rifa.valor_bilhete)}</p>
                    </div>
                </div>

                {/* Lista de Vendedores */}
                {vendedores.length === 0 ? (
                    <div className="card bg-yellow-50 border border-yellow-200">
                        <p className="text-yellow-800 font-medium">
                            ⚠️ Nenhum bloco foi distribuído ainda
                        </p>
                        <p className="text-sm text-yellow-600 mt-2">
                            Atribua blocos aos vendedores para realizar o acerto de contas
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {vendedores.map(vendedor => (
                            <div key={vendedor.id} className="card">
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">{vendedor.nome}</h2>
                                            <p className="text-gray-600">{vendedor.telefone}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Total Arrecadado</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {formatarValor(vendedor.totalArrecadado)}
                                            </p>
                                            {vendedor.totalPendente > 0 && (
                                                <p className="text-sm text-yellow-600 mt-1">
                                                    + {formatarValor(vendedor.totalPendente)} pendente
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="bg-blue-50 p-3 rounded">
                                            <p className="text-xs text-gray-600">Bilhetes Distribuídos</p>
                                            <p className="text-xl font-bold text-blue-600">{vendedor.totalBilhetes}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded">
                                            <p className="text-xs text-gray-600">Bilhetes Vendidos</p>
                                            <p className="text-xl font-bold text-green-600">{vendedor.totalVendidos}</p>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded">
                                            <p className="text-xs text-gray-600">Taxa de Conversão</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {((vendedor.totalVendidos / vendedor.totalBilhetes) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Blocos do Vendedor */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3">Bloco</th>
                                                <th className="text-center p-3">Status</th>
                                                <th className="text-center p-3">Bilhetes</th>
                                                <th className="text-center p-3">Vendidos</th>
                                                <th className="text-center p-3">Pagos</th>
                                                <th className="text-center p-3">Pendentes</th>
                                                <th className="text-right p-3">Valor Arrecadado</th>
                                                <th className="text-center p-3">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendedor.blocos.map(bloco => (
                                                <tr key={bloco.id} className="border-t hover:bg-gray-50">
                                                    <td className="p-3 font-semibold">Bloco #{bloco.numero}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`badge ${bloco.status === 'distribuido' ? 'badge-pendente' : 'badge-pago'
                                                            }`}>
                                                            {bloco.status === 'distribuido' ? 'Em Posse' : 'Recolhido'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">{bloco.totalBilhetes}</td>
                                                    <td className="p-3 text-center">
                                                        <span className="font-semibold text-blue-600">{bloco.totalVendidos}</span>
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            ({bloco.percentualVendido}%)
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-green-600 font-semibold">{bloco.vendidosPagos}</span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-yellow-600 font-semibold">{bloco.vendidosPendentes}</span>
                                                    </td>
                                                    <td className="p-3 text-right font-semibold text-green-600">
                                                        {formatarValor(bloco.valorArrecadado)}
                                                        {bloco.valorPendente > 0 && (
                                                            <span className="text-xs text-yellow-600 block">
                                                                +{formatarValor(bloco.valorPendente)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {bloco.status === 'distribuido' ? (
                                                            <button
                                                                onClick={() => abrirDetalhesBloco(bloco)}
                                                                className="btn btn-primary text-xs px-3 py-1"
                                                            >
                                                                Recolher
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-500">
                                                                ✓ Recolhido
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Recolhimento */}
                {blocoSelecionado && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">
                                🔄 Recolher Bloco #{blocoSelecionado.numero}
                            </h2>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="font-semibold text-gray-800 mb-2">Vendedor</p>
                                <p className="text-lg">{blocoSelecionado.vendedor_nome}</p>
                                <p className="text-sm text-gray-600">{blocoSelecionado.vendedor_telefone}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600 mb-1">Total de Bilhetes</p>
                                    <p className="text-2xl font-bold">{blocoSelecionado.totalBilhetes}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded">
                                    <p className="text-sm text-gray-600 mb-1">Bilhetes Vendidos</p>
                                    <p className="text-2xl font-bold text-green-600">{blocoSelecionado.totalVendidos}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded">
                                    <p className="text-sm text-gray-600 mb-1">Vendidos (Pagos)</p>
                                    <p className="text-2xl font-bold text-blue-600">{blocoSelecionado.vendidosPagos}</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded">
                                    <p className="text-sm text-gray-600 mb-1">Vendidos (Pendentes)</p>
                                    <p className="text-2xl font-bold text-yellow-600">{blocoSelecionado.vendidosPendentes}</p>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-1">💰 Valor a Receber (Pagos)</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatarValor(blocoSelecionado.valorArrecadado)}
                                </p>
                                {blocoSelecionado.valorPendente > 0 && (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        + {formatarValor(blocoSelecionado.valorPendente)} em vendas pendentes
                                    </p>
                                )}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="font-semibold text-yellow-800 mb-2">⚠️ Atenção</p>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Confirme o recebimento do valor arrecadado</li>
                                    <li>• Verifique se todos os bilhetes vendidos foram pagos</li>
                                    <li>• O bloco será marcado como "Recolhido"</li>
                                    <li>• Esta ação não pode ser desfeita facilmente</li>
                                </ul>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRecolherBloco(blocoSelecionado.id)}
                                    className="btn btn-success flex-1"
                                    disabled={processando}
                                >
                                    {processando ? 'Processando...' : '✓ Confirmar Recolhimento'}
                                </button>
                                <button
                                    onClick={() => setBlocoSelecionado(null)}
                                    className="btn btn-secondary flex-1"
                                    disabled={processando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
