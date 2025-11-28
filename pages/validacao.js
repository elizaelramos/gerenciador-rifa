import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData, formatarTelefone } from '../lib/formatters';

export default function Validacao() {
  const router = useRouter();
  const { rifaId, numero } = router.query;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rifaId || !numero) {
      setLoading(false);
      return;
    }

    async function carregarDados() {
      try {
        // Buscar dados da rifa
        const responseRifa = await fetch(`/api/rifas/${rifaId}`);
        if (!responseRifa.ok) {
          throw new Error('Rifa não encontrada');
        }
        const dataRifa = await responseRifa.json();

        // Buscar dados do bilhete específico
        const responseBilhete = await fetch(`/api/bilhetes-validacao/${numero}?rifaId=${rifaId}`);
        if (!responseBilhete.ok) {
          throw new Error('Bilhete não encontrado');
        }
        const dataBilhete = await responseBilhete.json();

        setDados({
          rifa: dataRifa.rifa,
          premios: dataRifa.premios,
          bilhete: dataBilhete.bilhete,
          vendedor: dataBilhete.vendedor,
          sorteio: dataBilhete.sorteio,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [rifaId, numero]);

  // Formulário de busca (quando não há parâmetros na URL)
  if (!rifaId || !numero) {
    return (
      <Layout title="Validar Bilhete">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="card">
            <h1 className="text-3xl font-bold mb-6 text-center">
              🔍 Validar Bilhete
            </h1>

            <p className="text-gray-600 mb-6 text-center">
              Digite os dados do seu bilhete para verificar o status e informações
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const rifaId = formData.get('rifaId');
                const numero = formData.get('numero');
                router.push(`/validacao?rifaId=${rifaId}&numero=${numero}`);
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">ID da Rifa</label>
                <input
                  type="number"
                  name="rifaId"
                  className="input"
                  placeholder="Ex: 1"
                  required
                />
              </div>

              <div>
                <label className="label">Número da Sorte</label>
                <input
                  type="text"
                  name="numero"
                  className="input"
                  placeholder="Ex: 45"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Validar Bilhete
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 <strong>Dica:</strong> Use o QR Code do seu bilhete para validação automática!
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="card bg-red-50 border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-2">❌ Erro</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/validacao" className="btn btn-primary">
              Tentar Novamente
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Verificar se dados foram carregados
  if (!dados) {
    return (
      <Layout title="Carregando...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const { rifa, premios, bilhete, vendedor, sorteio } = dados;
  const statusVendido = bilhete.status_venda === 'pago' || bilhete.status_venda === 'pendente' || bilhete.status_venda === 'confirmado';

  return (
    <Layout title={`Validação - Bilhete ${numero}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header com Status */}
        <div className="text-center mb-8">
          {statusVendido ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-4">
              <div className="text-5xl mb-2">✅</div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Bilhete Registrado!
              </h1>
              <p className="text-green-700">
                {bilhete.status_venda === 'pago' && 'Este bilhete está PAGO'}
                {bilhete.status_venda === 'confirmado' && 'Este bilhete está CONFIRMADO'}
                {bilhete.status_venda === 'pendente' && 'Este bilhete está PENDENTE (aguardando confirmação do vendedor)'}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-4">
              <div className="text-5xl mb-2">⚠️</div>
              <h1 className="text-3xl font-bold text-yellow-800 mb-2">
                Bilhete NÃO Cadastrado
              </h1>
              <p className="text-yellow-700">
                Este bilhete ainda não foi vendido ou registrado no sistema
              </p>
            </div>
          )}
        </div>

        {/* Informações do Bilhete */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">📄 Informações do Bilhete</h2>

          <div className="space-y-4">
            <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
              <p className="text-sm opacity-90 mb-1">Número da Sorte</p>
              <p className="text-6xl font-black">{bilhete.numero_sorte}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">Rifa:</span>
                <p className="font-semibold">{rifa.titulo}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Data do Sorteio:</span>
                <p className="font-semibold">{formatarData(rifa.data_sorteio)}</p>
              </div>
            </div>

            {statusVendido && (
              <>
                <hr className="my-4" />

                <div>
                  <span className="text-gray-500 text-sm">Este bilhete pertence a:</span>
                  <p className="text-xl font-bold text-blue-600">{bilhete.comprador_nome}</p>
                </div>

                <div>
                  <span className="text-gray-500 text-sm">Telefone (final):</span>
                  <p className="font-semibold">
                    {formatarTelefone(bilhete.comprador_telefone, true)}
                  </p>
                </div>

                {bilhete.observacao && (
                  <div>
                    <span className="text-gray-500 text-sm">Observação:</span>
                    <p className="font-medium">{bilhete.observacao}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-500 text-sm block mb-1">Status:</span>
                  <span className={`badge ${
                    bilhete.status_venda === 'pago' ? 'badge-pago' :
                    bilhete.status_venda === 'confirmado' ? 'badge-pago' :
                    'badge-pendente'
                  }`}>
                    {bilhete.status_venda === 'pago' && '✓ PAGO'}
                    {bilhete.status_venda === 'confirmado' && '✓ CONFIRMADO'}
                    {bilhete.status_venda === 'pendente' && '⏳ PENDENTE'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Informações do Vendedor */}
        {vendedor && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">👤 Vendedor Responsável</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Nome:</span>
                <p className="font-semibold">{vendedor.nome}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Contato:</span>
                <a
                  href={`https://wa.me/55${vendedor.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success inline-flex items-center gap-2"
                >
                  <span>📱</span>
                  WhatsApp: {formatarTelefone(vendedor.telefone)}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Prêmios */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">🏆 O que você está concorrendo</h2>

          {premios.length === 0 ? (
            <p className="text-gray-500">Prêmios não cadastrados</p>
          ) : (
            <div className="space-y-3">
              {premios.map((premio) => (
                <div key={premio.id} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-yellow-700">
                        {premio.posicao}º Prêmio
                      </span>
                      <p className="font-medium text-lg">{premio.descricao}</p>
                    </div>
                    {premio.valor_estimado && (
                      <span className="text-sm text-gray-600 font-semibold">
                        {formatarValor(premio.valor_estimado)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resultado do Sorteio (se já foi realizado) */}
        {sorteio && (
          <div className="card bg-purple-50 border-2 border-purple-500">
            <h2 className="text-xl font-bold mb-4 text-purple-800">🎉 Resultado do Sorteio</h2>

            <div className="space-y-4">
              <div>
                <span className="text-gray-600 text-sm">Número Sorteado (Loteria Federal):</span>
                <p className="text-3xl font-bold text-purple-600">{sorteio.resultado_oficial_1}</p>
              </div>

              <div>
                <span className="text-gray-600 text-sm">Número da Sorte Premiado:</span>
                <p className="text-2xl font-bold">{sorteio.resultado_numero_sorte_1}</p>
              </div>

              {sorteio.imagem_url_oficial && (
                <div>
                  <span className="text-gray-600 text-sm block mb-2">Comprovante Oficial:</span>
                  <img
                    src={sorteio.imagem_url_oficial}
                    alt="Print Loteria Federal"
                    className="rounded border max-w-full"
                  />
                </div>
              )}

              <hr />

              <div className="text-center p-4 bg-white rounded">
                {sorteio.ganhador_bilhete_id_1 === bilhete.id ? (
                  <div>
                    <div className="text-6xl mb-2">🎊</div>
                    <p className="text-2xl font-bold text-green-600">
                      PARABÉNS! VOCÊ GANHOU!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">😔</div>
                    <p className="text-lg font-semibold text-gray-600">
                      Seu bilhete não foi premiado desta vez
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        {!statusVendido && (
          <div className="card bg-orange-50 border border-orange-200">
            <h3 className="font-bold mb-2 text-orange-800">⚠️ Atenção!</h3>
            <p className="text-sm text-gray-700 mb-3">
              Este bilhete ainda não foi cadastrado no sistema. Se você comprou este número,
              entre em contato IMEDIATAMENTE com o vendedor para garantir o seu registro!
            </p>
            {vendedor && (
              <a
                href={`https://wa.me/55${vendedor.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success w-full"
              >
                📱 Entrar em Contato com Vendedor
              </a>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-4 mt-6">
          <Link href="/validacao" className="btn btn-secondary flex-1 text-center">
            Validar Outro Bilhete
          </Link>
          <Link href="/" className="btn btn-primary flex-1 text-center">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </Layout>
  );
}
