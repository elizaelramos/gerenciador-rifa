import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../lib/formatters';
import { formatarTelefone, validarTelefone } from '../../lib/telefone';

export default function BilheteComprador() {
  const router = useRouter();
  const { bilheteId } = router.query;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etapa, setEtapa] = useState('visualizacao'); // visualizacao, auto-cadastro, sucesso
  const [salvando, setSalvando] = useState(false);

  // Dados do formulário de auto-cadastro
  const [dadosComprador, setDadosComprador] = useState({
    nome: '',
    telefone: '',
    observacao: '',
  });

  useEffect(() => {
    if (!bilheteId) return;
    carregarDados();
  }, [bilheteId]);

  const carregarDados = async () => {
    try {
      const response = await fetch(`/api/bilhetes/${bilheteId}`);
      const data = await response.json();

      if (!response.ok) {
        alert('Bilhete não encontrado');
        return;
      }

      setDados(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do bilhete');
      setLoading(false);
    }
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setDadosComprador({ ...dadosComprador, telefone: valorFormatado });
  };

  const handleAutoCadastro = (e) => {
    e.preventDefault();

    // Validar telefone
    if (!validarTelefone(dadosComprador.telefone)) {
      alert('Telefone inválido! Use o formato: DD XXXXX-XXXX (ex: 67 98129-7591)');
      return;
    }

    setEtapa('confirmacao');
  };

  const handleConfirmarAutoCadastro = async () => {
    setSalvando(true);

    try {
      const response = await fetch(`/api/bilhetes/${bilheteId}/auto-cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosComprador),
      });

      const data = await response.json();

      if (response.ok) {
        setEtapa('sucesso');
        // Recarregar dados
        await carregarDados();
      } else {
        alert(data.error || 'Erro ao salvar seus dados');
        setEtapa('auto-cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar seus dados');
      setEtapa('auto-cadastro');
    } finally {
      setSalvando(false);
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

  if (!dados) {
    return (
      <Layout title="Erro">
        <div className="container mx-auto px-4 py-8">
          <div className="card bg-red-50">
            <h2 className="text-xl font-bold text-red-800 mb-2">Bilhete não encontrado</h2>
            <p className="text-red-600">O bilhete que você está procurando não existe.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const { bilhete, rifa, premios, vendedor } = dados;
  const numero = bilhete.numero_sorte;
  const rifaId = rifa.id;
  const jaCadastrado = bilhete.status_venda !== 'nao_vendido';

  return (
    <Layout title={`Bilhete ${numero}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Etapa: Visualização */}
          {etapa === 'visualizacao' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Status do Bilhete */}
              <div className="text-center mb-6">
                {jaCadastrado ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                    <div className="text-4xl mb-2">✅</div>
                    <h2 className="text-xl font-bold text-green-800">Bilhete Cadastrado!</h2>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 mb-4">
                    <div className="text-4xl mb-2">⚠️</div>
                    <h2 className="text-xl font-bold text-yellow-800">Bilhete Não Cadastrado</h2>
                    <p className="text-sm text-yellow-700 mt-1">
                      Faça seu auto-cadastro e garanta sua participação!
                    </p>
                  </div>
                )}
              </div>

              {/* Número da Sorte */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg mb-6 text-center">
                <p className="text-sm opacity-90 mb-1">Número da Sorte</p>
                <p className="text-5xl font-bold mb-4">{numero}</p>

                <button
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `Minha Rifa - ${rifa.titulo}`,
                          text: `Confira meu bilhete da rifa ${rifa.titulo}! Número: ${numero}`,
                          url: window.location.href,
                        });
                      } catch (error) {
                        console.log('Erro ao compartilhar:', error);
                      }
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copiado para a área de transferência!');
                    }
                  }}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 text-base"
                >
                  <span className="text-xl">🔗</span> Compartilhar Bilhete
                </button>
              </div>

              {/* Informações da Rifa */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">🎫 Informações da Rifa</h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Rifa:</span>
                    <p className="font-semibold">{rifa.titulo}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Descrição:</span>
                    <p>{rifa.descricao}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Data do Sorteio:</span>
                      <p className="font-semibold">{formatarData(rifa.data_sorteio)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor:</span>
                      <p className="font-semibold text-green-600">
                        {formatarValor(rifa.valor_bilhete)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prêmios */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">🏆 Prêmios</h3>
                {(premios || []).length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum prêmio cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {premios.map((premio) => (
                      <div key={premio.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        {premio.imagem_url ? (
                          <img
                            src={premio.imagem_url}
                            alt={premio.descricao}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 rounded-md flex items-center justify-center text-3xl border border-gray-200">
                            🎁
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold uppercase text-yellow-600 block mb-1">
                            {premio.posicao}º Prêmio
                          </span>
                          <p className="font-bold text-gray-800 text-lg leading-tight">
                            {premio.descricao}
                          </p>
                          {premio.valor_estimado && (
                            <p className="text-sm text-gray-500 mt-1">
                              Valor est.: {formatarValor(premio.valor_estimado)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informações do Comprador (se já cadastrado) */}
              {jaCadastrado && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">👤 Este bilhete pertence a:</h3>
                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium mr-2">Nome:</span>
                      <span className="font-bold text-lg text-gray-800">{bilhete.comprador_nome}</span>
                    </div>

                    <div>
                      <span className="text-gray-600 font-medium mr-2">Telefone:</span>
                      <span className="font-bold text-gray-800">{bilhete.comprador_telefone}</span>
                    </div>

                    {bilhete.observacao && (
                      <div>
                        <span className="text-gray-600 font-medium mr-2">Observação:</span>
                        <span className="font-medium text-gray-800">{bilhete.observacao}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-gray-600 font-medium mr-2">Data do Cadastro:</span>
                      <span className="font-medium text-gray-800">
                        {bilhete.data_venda
                          ? new Date(bilhete.data_venda).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : '-'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-600 font-medium mr-2">Cadastrado por:</span>
                      <span className="font-bold text-blue-700">
                        {bilhete.auto_cadastro ? '👤 Próprio Comprador' : `🙋 Vendedor: ${vendedor?.nome || '-'}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações do Vendedor */}
              {vendedor && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">🙋 Vendedor Responsável</h3>
                  <div className="bg-purple-50 p-4 rounded-lg space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="font-semibold">{vendedor.nome}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Contato:</span>
                      <p className="font-semibold">{vendedor.telefone}</p>
                    </div>
                    <a
                      href={`https://wa.me/55${vendedor.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success w-full mt-2"
                    >
                      📱 Falar com Vendedor no WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Botão de Auto-cadastro */}
              {!jaCadastrado && (
                <button
                  onClick={() => setEtapa('auto-cadastro')}
                  className="btn btn-primary w-full text-lg"
                >
                  Fazer Meu Auto-cadastro
                </button>
              )}
            </div>
          )}

          {/* Etapa: Auto-cadastro */}
          {etapa === 'auto-cadastro' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👤</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Auto-cadastro
                </h1>
                <p className="text-gray-600">
                  Preencha seus dados para garantir sua participação
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg mb-6 text-center">
                <p className="text-sm opacity-90">Número da Sorte</p>
                <p className="text-4xl font-bold">{numero}</p>
              </div>

              <form onSubmit={handleAutoCadastro} className="space-y-4">
                <div>
                  <label className="label">Seu Nome Completo *</label>
                  <input
                    type="text"
                    value={dadosComprador.nome}
                    onChange={(e) => setDadosComprador({ ...dadosComprador, nome: e.target.value })}
                    className="input"
                    placeholder="Digite seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="label">Seu Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={dadosComprador.telefone}
                    onChange={handleTelefoneChange}
                    className="input"
                    placeholder="67 98888-7777"
                    required
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="label">Observação (opcional)</label>
                  <textarea
                    value={dadosComprador.observacao}
                    onChange={(e) => setDadosComprador({ ...dadosComprador, observacao: e.target.value })}
                    className="input"
                    placeholder="Ex: Pastoral Família, Restaurante Bendito"
                    rows={3}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Importante:</strong> Após o auto-cadastro, o vendedor responsável
                    poderá revisar e confirmar seus dados antes da finalização.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEtapa('visualizacao')}
                    className="btn btn-secondary flex-1"
                  >
                    ← Voltar
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Continuar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Etapa: Confirmação */}
          {etapa === 'confirmacao' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Confirme seus Dados
                </h1>
                <p className="text-gray-600">
                  Revise as informações antes de enviar
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">📋 Informações do Bilhete</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número da Sorte:</span>
                      <span className="font-bold text-blue-600 text-lg">{numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rifa:</span>
                      <span className="font-semibold">{rifa.titulo}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">👤 Seus Dados</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-semibold">{dadosComprador.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-semibold">{dadosComprador.telefone}</span>
                    </div>
                    {dadosComprador.observacao && (
                      <div>
                        <span className="text-gray-600">Observação:</span>
                        <p className="font-semibold mt-1">{dadosComprador.observacao}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtapa('auto-cadastro')}
                  className="btn btn-secondary flex-1"
                  disabled={salvando}
                >
                  ← Corrigir
                </button>
                <button
                  onClick={handleConfirmarAutoCadastro}
                  className="btn btn-primary flex-1"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : '✅ Confirmar'}
                </button>
              </div>
            </div>
          )}

          {/* Etapa: Sucesso */}
          {etapa === 'sucesso' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  Auto-cadastro Realizado!
                </h1>
                <p className="text-gray-600">
                  Seus dados foram salvos com sucesso
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>O que acontece agora?</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Seus dados foram registrados no sistema</li>
                  <li>✓ O vendedor será notificado do seu cadastro</li>
                  <li>✓ O vendedor poderá revisar e confirmar suas informações</li>
                  <li>✓ Você receberá a confirmação após a aprovação</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Atenção:</strong> Entre em contato com o vendedor para confirmar
                  o pagamento e garantir sua participação no sorteio!
                </p>
              </div>

              {vendedor && (
                <a
                  href={`https://wa.me/55${vendedor.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success w-full mb-4"
                >
                  📱 Falar com Vendedor no WhatsApp
                </a>
              )}

              <button
                onClick={() => setEtapa('visualizacao')}
                className="btn btn-secondary w-full"
              >
                Ver Informações do Bilhete
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
