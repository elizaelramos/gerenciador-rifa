import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../../lib/formatters';

export default function ResultadoRifa() {
    const router = useRouter();
    const { rifaId } = router.query;

    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!rifaId) return;
        carregarDados();
    }, [rifaId]);

    const carregarDados = async () => {
        try {
            const response = await fetch(`/api/rifas/${rifaId}`);
            const data = await response.json();

            if (response.ok) {
                setDados(data);
            } else {
                setErro('Rifa não encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setErro('Erro ao carregar resultado');
        } finally {
            setLoading(false);
        }
    };

    const handleCompartilhar = async () => {
        const texto = `🎉 Resultado da Rifa: ${dados.rifa.titulo}\n\n🏆 Número Ganhador: ${dados.rifa.numero_ganhador}\n👤 Ganhador: ${bilheteGanhador?.comprador_nome}\n\nConfira: ${window.location.href}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Resultado - ${dados.rifa.titulo}`,
                    text: texto,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            navigator.clipboard.writeText(texto);
            alert('Resultado copiado para a área de transferência!');
        }
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

    if (erro || !dados) {
        return (
            <Layout title="Erro">
                <div className="container mx-auto px-4 py-8">
                    <div className="card bg-red-50">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
                        <p className="text-red-600">{erro || 'Dados não encontrados'}</p>
                        <Link href="/" className="btn btn-secondary mt-4 inline-block">
                            ← Voltar
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const { rifa, premios, bilhetes } = dados;
    const bilheteGanhador = bilhetes?.find(b => b.id === rifa.bilhete_ganhador_id);

    if (rifa.status !== 'concluido') {
        return (
            <Layout title={rifa.titulo}>
                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    <div className="card bg-yellow-50 text-center">
                        <div className="text-6xl mb-4">⏳</div>
                        <h2 className="text-2xl font-bold mb-2">Sorteio Ainda Não Realizado</h2>
                        <p className="text-gray-600 mb-4">
                            O sorteio desta rifa será realizado em {formatarData(rifa.data_sorteio)}
                        </p>
                        <Link href={`/rifa/${rifaId}`} className="btn btn-primary inline-block">
                            Ver Detalhes da Rifa
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`Resultado - ${rifa.titulo}`}>
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-8xl mb-4 animate-bounce">🎉</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                            Resultado do Sorteio
                        </h1>
                        <p className="text-xl text-gray-600">{rifa.titulo}</p>
                    </div>

                    {/* Card Principal - Ganhador */}
                    <div className="card bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white mb-6 shadow-2xl">
                        <div className="text-center">
                            <p className="text-sm opacity-90 mb-2">🏆 NÚMERO GANHADOR</p>
                            <p className="text-7xl md:text-8xl font-bold mb-6 drop-shadow-lg">
                                {rifa.numero_ganhador}
                            </p>

                            {bilheteGanhador && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 mb-4">
                                    <p className="text-sm opacity-90 mb-2">👤 Ganhador</p>
                                    <p className="text-3xl font-bold mb-2">{bilheteGanhador.comprador_nome}</p>
                                    <p className="text-lg opacity-90">{bilheteGanhador.comprador_telefone}</p>
                                </div>
                            )}

                            <button
                                onClick={handleCompartilhar}
                                className="btn bg-white text-yellow-600 hover:bg-yellow-50 font-bold"
                            >
                                🔗 Compartilhar Resultado
                            </button>
                        </div>
                    </div>

                    {/* Informações do Sorteio */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="card">
                            <h3 className="font-bold text-lg mb-3">📊 Detalhes do Sorteio</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Loteria Federal:</span>
                                    <span className="font-bold">{rifa.numero_loteria_federal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Número Sorteado:</span>
                                    <span className="font-bold text-blue-600">{rifa.numero_sorteado}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Data do Sorteio:</span>
                                    <span className="font-bold">{formatarData(rifa.data_sorteio)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tipo:</span>
                                    <span className="font-bold capitalize">{rifa.tipo_sorteio}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="font-bold text-lg mb-3">🎫 Estatísticas</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total de Bilhetes:</span>
                                    <span className="font-bold">{rifa.qtde_bilhetes}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valor por Bilhete:</span>
                                    <span className="font-bold">{formatarValor(rifa.valor_bilhete)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Blocos:</span>
                                    <span className="font-bold">{rifa.qtde_blocos}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prêmios */}
                    {premios && premios.length > 0 && (
                        <div className="card mb-6">
                            <h3 className="font-bold text-lg mb-4">🏆 Prêmios</h3>
                            <div className="space-y-3">
                                {premios.map((premio) => (
                                    <div key={premio.id} className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                        {premio.imagem_url ? (
                                            <img
                                                src={premio.imagem_url}
                                                alt={premio.descricao}
                                                className="w-20 h-20 object-cover rounded-md border-2 border-yellow-300"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-yellow-100 rounded-md flex items-center justify-center text-4xl border-2 border-yellow-300">
                                                🎁
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <span className="text-xs font-bold uppercase text-yellow-700 block mb-1">
                                                {premio.posicao}º Prêmio
                                            </span>
                                            <p className="font-bold text-gray-800 text-lg leading-tight">
                                                {premio.descricao}
                                            </p>
                                            {premio.valor_estimado && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Valor estimado: {formatarValor(premio.valor_estimado)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href={`/rifa/${rifaId}`} className="btn btn-primary">
                            Ver Detalhes da Rifa
                        </Link>
                        <Link href="/" className="btn btn-secondary">
                            Voltar ao Início
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
