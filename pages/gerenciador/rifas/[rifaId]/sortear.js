import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../../../lib/formatters';

export default function RealizarSorteio() {
    const router = useRouter();
    const { rifaId } = router.query;

    const [rifa, setRifa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numeroLoteria, setNumeroLoteria] = useState('');
    const [sorteando, setSorteando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        if (!rifaId) return;
        carregarRifa();
    }, [rifaId]);

    const carregarRifa = async () => {
        try {
            const response = await fetch(`/api/rifas/${rifaId}`);
            const data = await response.json();

            if (response.ok) {
                setRifa(data.rifa);
            } else {
                setErro('Rifa não encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar rifa:', error);
            setErro('Erro ao carregar dados da rifa');
        } finally {
            setLoading(false);
        }
    };

    const handleSortear = async (e) => {
        e.preventDefault();

        if (!numeroLoteria || numeroLoteria.length < 5) {
            alert('Digite o número completo da Loteria Federal (5 ou 6 dígitos)');
            return;
        }

        setSorteando(true);
        setErro(null);

        try {
            const response = await fetch(`/api/rifas/${rifaId}/sortear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numero_loteria_federal: numeroLoteria
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResultado(data.resultado);
            } else {
                setErro(data.error || 'Erro ao realizar sorteio');
            }
        } catch (error) {
            console.error('Erro:', error);
            setErro('Erro ao conectar com o servidor');
        } finally {
            setSorteando(false);
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

    if (erro && !rifa) {
        return (
            <Layout title="Erro">
                <div className="container mx-auto px-4 py-8">
                    <div className="card bg-red-50">
                        <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
                        <p className="text-red-600">{erro}</p>
                        <Link href="/gerenciador/dashboard" className="btn btn-secondary mt-4 inline-block">
                            ← Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`Realizar Sorteio - ${rifa?.titulo}`}>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6">
                    <Link href={`/rifa/${rifaId}`} className="text-blue-600 hover:underline">
                        ← Voltar para a Rifa
                    </Link>
                </div>

                {/* Informações da Rifa */}
                <div className="card mb-6">
                    <h1 className="text-3xl font-bold mb-4">🎲 Realizar Sorteio</h1>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h2 className="font-bold text-lg mb-2">{rifa.titulo}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Data do Sorteio:</span>
                                <p className="font-semibold">{formatarData(rifa.data_sorteio)}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Tipo:</span>
                                <p className="font-semibold capitalize">{rifa.tipo_sorteio}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Total de Bilhetes:</span>
                                <p className="font-semibold">{rifa.qtde_bilhetes}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Status:</span>
                                <p className="font-semibold capitalize">{rifa.status}</p>
                            </div>
                        </div>
                    </div>

                    {rifa.status === 'concluido' && (
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                            <p className="text-green-800 font-bold">✅ Esta rifa já foi sorteada!</p>
                            <Link href={`/rifa/${rifaId}/resultado`} className="btn btn-primary mt-3 inline-block">
                                Ver Resultado
                            </Link>
                        </div>
                    )}
                </div>

                {/* Formulário de Sorteio */}
                {rifa.status !== 'concluido' && !resultado && (
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4">📝 Inserir Resultado da Loteria Federal</h2>

                        {/* Botão para abrir site da Caixa */}
                        <div className="mb-6">
                            <button
                                onClick={() => window.open('https://loterias.caixa.gov.br/Paginas/Federal.aspx', '_blank', 'width=1200,height=800')}
                                className="btn bg-blue-600 text-white hover:bg-blue-700 w-full text-lg"
                            >
                                🌐 Abrir Resultado da Loteria Federal (Caixa)
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Abre em uma nova janela para você consultar o resultado oficial
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800 mb-2">
                                <strong>⚠️ Instruções:</strong>
                            </p>
                            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                                <li>Clique no botão acima para abrir o site oficial da Caixa</li>
                                <li>Verifique o resultado do dia {formatarData(rifa.data_sorteio)}</li>
                                <li>Digite o número do <strong>1º Prêmio</strong> (5 ou 6 dígitos) no campo abaixo</li>
                                <li>O sistema extrairá automaticamente a {rifa.tipo_sorteio === 'dezena' ? 'dezena (2 últimos dígitos)' : 'milhar (4 últimos dígitos)'}</li>
                            </ul>
                        </div>

                        <form onSubmit={handleSortear} className="space-y-4">
                            <div>
                                <label className="label">Número da Loteria Federal (1º Prêmio) *</label>
                                <input
                                    type="text"
                                    value={numeroLoteria}
                                    onChange={(e) => setNumeroLoteria(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input text-2xl font-bold text-center"
                                    placeholder="Ex: 016064"
                                    maxLength={6}
                                    required
                                    disabled={sorteando}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Digite os 5 ou 6 dígitos do número sorteado
                                </p>
                            </div>

                            {numeroLoteria.length >= 5 && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700 mb-1">Número que será usado para o sorteio:</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {rifa.tipo_sorteio === 'dezena'
                                            ? numeroLoteria.slice(-2).padStart(2, '0')
                                            : numeroLoteria.slice(-4).padStart(4, '0')
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ({rifa.tipo_sorteio === 'dezena' ? 'Dezena' : 'Milhar'} extraída do número {numeroLoteria})
                                    </p>
                                </div>
                            )}

                            {erro && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800">{erro}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-full text-lg"
                                disabled={sorteando || numeroLoteria.length < 5}
                            >
                                {sorteando ? 'Realizando Sorteio...' : '🎲 Realizar Sorteio'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Resultado do Sorteio */}
                {resultado && (
                    <div className="card bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-3xl font-bold text-green-800 mb-2">Sorteio Realizado!</h2>
                            <p className="text-gray-600">O ganhador foi determinado com sucesso</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <p className="text-sm text-gray-600 mb-1">Número da Loteria Federal</p>
                                <p className="text-2xl font-bold text-gray-800">{resultado.numeroLoteriaFederal}</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow">
                                <p className="text-sm text-gray-600 mb-1">Número Sorteado ({rifa.tipo_sorteio})</p>
                                <p className="text-3xl font-bold text-blue-600">{resultado.numeroSorteado}</p>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-lg shadow-lg text-center">
                                <p className="text-sm text-yellow-900 mb-2">🏆 NÚMERO GANHADOR</p>
                                <p className="text-5xl font-bold text-white mb-3">{resultado.numeroGanhador}</p>
                                <p className="text-sm text-yellow-900 italic">{resultado.motivo}</p>
                                {resultado.distancia > 0 && (
                                    <p className="text-xs text-yellow-900 mt-1">
                                        (Distância: {resultado.distancia} {resultado.distancia === 1 ? 'número' : 'números'})
                                    </p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <p className="text-sm text-gray-600 mb-3">👤 Ganhador</p>
                                <p className="text-2xl font-bold text-gray-800 mb-2">{resultado.ganhador.nome}</p>
                                <p className="text-lg text-gray-600">{resultado.ganhador.telefone}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Link href={`/rifa/${rifaId}`} className="btn btn-primary flex-1">
                                Ver Página da Rifa
                            </Link>
                            <Link href="/gerenciador/dashboard" className="btn btn-secondary flex-1">
                                Ir para Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
