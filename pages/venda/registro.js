import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

export default function RegistroVenda() {
  const router = useRouter();
  const { rifaId, bilheteId, numero } = router.query;

  const [etapa, setEtapa] = useState('loading'); // loading, auto-cadastro-vendedor, cadastro-comprador, confirmacao
  const [dados, setDados] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Dados do vendedor (auto-cadastro)
  const [dadosVendedor, setDadosVendedor] = useState({
    nome: '',
    telefone: '',
  });

  // Dados do comprador
  const [dadosComprador, setDadosComprador] = useState({
    nome: '',
    telefone: '',
    observacao: '',
  });

  useEffect(() => {
    if (!rifaId || !bilheteId || !numero) return;
    carregarDados();
  }, [rifaId, bilheteId, numero]);

  const carregarDados = async () => {
    try {
      // Buscar informações do bilhete
      const response = await fetch(`/api/bilhetes/${bilheteId}`);
      const data = await response.json();

      if (!response.ok) {
        alert('Bilhete não encontrado');
        return;
      }

      setDados(data);

      // Verificar se o bilhete já foi vendido
      if (data.bilhete.status_venda !== 'nao_vendido') {
        // Bilhete já foi vendido

        // Se foi auto-cadastrado, preencher o formulário com os dados para o vendedor revisar
        if (data.bilhete.auto_cadastro) {
          setVendedor(data.vendedor || null);
          setDadosComprador({
            nome: data.bilhete.comprador_nome || '',
            telefone: data.bilhete.comprador_telefone || '',
            observacao: data.bilhete.observacao || '',
          });
          setEtapa('revisar-auto-cadastro');
        } else {
          // Cadastrado pelo vendedor, mostrar informações
          setVendedor(data.vendedor || { nome: 'Vendedor', telefone: '-' });
          setEtapa('bilhete-vendido');
        }

        setLoading(false);
        return;
      }

      // Verificar se já tem vendedor cadastrado no bloco
      if (data.bloco.vendedor_id) {
        // Já tem vendedor, vai direto para cadastro do comprador
        setVendedor(data.vendedor);
        setEtapa('cadastro-comprador');
      } else {
        // Não tem vendedor, precisa fazer auto-cadastro
        setEtapa('auto-cadastro-vendedor');
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do bilhete');
      setLoading(false);
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    const numeroLimitado = numeros.slice(0, 11);

    if (numeroLimitado.length <= 2) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 7) {
      return `${numeroLimitado.slice(0, 2)} ${numeroLimitado.slice(2)}`;
    } else if (numeroLimitado.length <= 11) {
      const ddd = numeroLimitado.slice(0, 2);
      const parte1 = numeroLimitado.slice(2, 7);
      const parte2 = numeroLimitado.slice(7);
      return `${ddd} ${parte1}${parte2 ? '-' + parte2 : ''}`;
    }

    return numeroLimitado;
  };

  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length !== 10 && numeros.length !== 11) return false;
    const ddd = parseInt(numeros.slice(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    return true;
  };

  const handleCadastrarVendedor = async (e) => {
    e.preventDefault();

    if (!validarTelefone(dadosVendedor.telefone)) {
      alert('Telefone inválido! Use o formato: DD XXXXX-XXXX');
      return;
    }

    setSalvando(true);

    try {
      // Criar vendedor
      const vendedorResponse = await fetch('/api/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosVendedor),
      });

      const vendedorData = await vendedorResponse.json();

      if (!vendedorResponse.ok) {
        alert(vendedorData.error || 'Erro ao cadastrar vendedor');
        setSalvando(false);
        return;
      }

      // Atribuir vendedor ao bloco
      const blocoResponse = await fetch(`/api/blocos/${dados.bloco.id}/atribuir-vendedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendedor_id: vendedorData.vendedor.id }),
      });

      if (!blocoResponse.ok) {
        alert('Erro ao atribuir vendedor ao bloco');
        setSalvando(false);
        return;
      }

      setVendedor(vendedorData.vendedor);
      setEtapa('cadastro-comprador');
      setSalvando(false);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar vendedor');
      setSalvando(false);
    }
  };

  const handleSubmitComprador = (e) => {
    e.preventDefault();

    if (!validarTelefone(dadosComprador.telefone)) {
      alert('Telefone do comprador inválido! Use o formato: DD XXXXX-XXXX');
      return;
    }

    // Ir para tela de confirmação
    setEtapa('confirmacao');
  };

  const handleConfirmarVenda = async () => {
    setSalvando(true);

    try {
      const response = await fetch(`/api/bilhetes/${bilheteId}/registrar-venda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor_id: vendedor.id,
          comprador_nome: dadosComprador.nome,
          comprador_telefone: dadosComprador.telefone,
          observacao: dadosComprador.observacao || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Venda registrada com sucesso!');
        router.push(`/rifa/${rifaId}`);
      } else {
        alert(data.error || 'Erro ao registrar venda');
        setSalvando(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao registrar venda');
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
          <div className="card bg-red-50 border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
            <p className="text-red-600">Bilhete não encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Registrar Venda">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Auto-cadastro do Vendedor */}
          {etapa === 'auto-cadastro-vendedor' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👤</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Bem-vindo, Vendedor!
                </h1>
                <p className="text-gray-600">
                  Primeiro, precisamos cadastrar seus dados para continuar
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Rifa:</strong> {dados.rifa.titulo}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Bloco:</strong> #{dados.bloco.numero}
                </p>
              </div>

              <form onSubmit={handleCadastrarVendedor} className="space-y-4">
                <div>
                  <label className="label">Seu Nome Completo *</label>
                  <input
                    type="text"
                    value={dadosVendedor.nome}
                    onChange={(e) => setDadosVendedor({ ...dadosVendedor, nome: e.target.value })}
                    className="input"
                    placeholder="Digite seu nome"
                    required
                    disabled={salvando}
                  />
                </div>

                <div>
                  <label className="label">Seu Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={dadosVendedor.telefone}
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setDadosVendedor({ ...dadosVendedor, telefone: valorFormatado });
                    }}
                    className="input"
                    placeholder="67 98129-7591"
                    required
                    disabled={salvando}
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Digite apenas números. Formato: DD XXXXX-XXXX
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={salvando}
                >
                  {salvando ? 'Cadastrando...' : 'Continuar'}
                </button>
              </form>
            </div>
          )}

          {/* Cadastro do Comprador */}
          {etapa === 'cadastro-comprador' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎫</span>
                </div>
                <h1 className="text-xl font-bold text-gray-800">
                  Olá, {vendedor.nome}!
                </h1>
                <p className="text-gray-600 text-lg">
                  Cadastre o comprador do bilhete
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg mb-6 text-center">
                <p className="text-sm opacity-90 mb-1">Número da Sorte</p>
                <p className="text-5xl font-bold">{numero}</p>
                <p className="text-sm opacity-90 mt-2">{dados.rifa.titulo}</p>
              </div>

              <form onSubmit={handleSubmitComprador} className="space-y-4">
                <div>
                  <label className="label">Nome do Comprador *</label>
                  <input
                    type="text"
                    value={dadosComprador.nome}
                    onChange={(e) => setDadosComprador({ ...dadosComprador, nome: e.target.value })}
                    className="input"
                    placeholder="Nome completo do comprador"
                    required
                  />
                </div>

                <div>
                  <label className="label">Telefone/WhatsApp do Comprador *</label>
                  <input
                    type="tel"
                    value={dadosComprador.telefone}
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setDadosComprador({ ...dadosComprador, telefone: valorFormatado });
                    }}
                    className="input"
                    placeholder="67 98888-7777"
                    required
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Telefone com WhatsApp para contato
                  </p>
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

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Enviar
                </button>
              </form>
            </div>
          )}

          {/* Revisar Auto-cadastro */}
          {etapa === 'revisar-auto-cadastro' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👤</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Auto-cadastro do Comprador
                </h1>
                <p className="text-gray-600">
                  Este bilhete foi cadastrado pelo próprio comprador
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg mb-6 text-center">
                <p className="text-sm opacity-90 mb-1">Número da Sorte</p>
                <p className="text-5xl font-bold">{numero}</p>
                <p className="text-sm opacity-90 mt-2">{dados.rifa.titulo}</p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ Atenção, Vendedor!</h3>
                <p className="text-sm text-yellow-800">
                  O comprador fez o auto-cadastro. Revise os dados abaixo e faça as correções necessárias.
                  Você pode <strong>atualizar</strong> as informações ou <strong>confirmar</strong> se estiver tudo certo.
                </p>
              </div>

              <form onSubmit={handleSubmitComprador} className="space-y-4">
                <div>
                  <label className="label">Nome do Comprador *</label>
                  <input
                    type="text"
                    value={dadosComprador.nome}
                    onChange={(e) => setDadosComprador({ ...dadosComprador, nome: e.target.value })}
                    className="input"
                    placeholder="Nome completo do comprador"
                    required
                  />
                </div>

                <div>
                  <label className="label">Telefone/WhatsApp do Comprador *</label>
                  <input
                    type="tel"
                    value={dadosComprador.telefone}
                    onChange={(e) => {
                      const valorFormatado = formatarTelefone(e.target.value);
                      setDadosComprador({ ...dadosComprador, telefone: valorFormatado });
                    }}
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      // Confirmar sem alterações - marca auto_cadastro como false
                      setSalvando(true);
                      try {
                        const response = await fetch(`/api/bilhetes/${bilheteId}/registrar-venda`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            comprador_nome: dadosComprador.nome,
                            comprador_telefone: dadosComprador.telefone,
                            observacao: dadosComprador.observacao,
                            vendedor_id: vendedor?.id || null,
                            confirmar_auto_cadastro: true,
                          }),
                        });

                        const data = await response.json();

                        if (response.ok) {
                          alert('✅ Cadastro confirmado com sucesso!');
                          setEtapa('sucesso');
                        } else {
                          alert(data.error || 'Erro ao confirmar cadastro');
                        }
                      } catch (error) {
                        console.error('Erro:', error);
                        alert('Erro ao confirmar cadastro');
                      } finally {
                        setSalvando(false);
                      }
                    }}
                    className="btn btn-success flex-1"
                    disabled={salvando}
                  >
                    {salvando ? 'Confirmando...' : '✓ Confirmar sem Alterar'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={salvando}
                  >
                    Atualizar e Confirmar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Confirmação */}
          {etapa === 'confirmacao' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Confirme os Dados
                </h1>
                <p className="text-gray-600">
                  Revise as informações antes de finalizar
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">📋 Informações da Venda</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rifa:</span>
                      <span className="font-semibold">{dados.rifa.titulo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número da Sorte:</span>
                      <span className="font-bold text-blue-600 text-lg">{numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-semibold text-green-600">R$ {parseFloat(dados.rifa.valor_bilhete).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-3">👤 Dados do Comprador</h3>
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

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-3">🙋 Vendedor</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-semibold">{vendedor.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-semibold">{vendedor.telefone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtapa('cadastro-comprador')}
                  className="btn btn-secondary flex-1"
                  disabled={salvando}
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleConfirmarVenda}
                  className="btn btn-primary flex-1"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : '✅ Confirmar Venda'}
                </button>
              </div>
            </div>
          )}

          {/* Bilhete Já Vendido */}
          {etapa === 'bilhete-vendido' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Bilhete Já Vendido
                </h1>
                <p className="text-gray-600">
                  Este bilhete já foi registrado anteriormente
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg mb-6 text-center">
                <p className="text-sm opacity-90 mb-1">Número da Sorte</p>
                <p className="text-5xl font-bold">{numero}</p>
                <p className="text-sm opacity-90 mt-2">{dados.rifa.titulo}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h3 className="font-bold text-green-800 mb-3">👤 Comprador</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nome:</span>
                      <span className="font-semibold">{dados.bilhete.comprador_nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-semibold">{dados.bilhete.comprador_telefone}</span>
                    </div>
                    {dados.bilhete.observacao && (
                      <div>
                        <span className="text-gray-600">Observação:</span>
                        <p className="font-semibold mt-1">{dados.bilhete.observacao}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3">📅 Informações da Venda</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data da Venda:</span>
                      <span className="font-semibold">
                        {dados.bilhete.data_venda
                          ? new Date(dados.bilhete.data_venda).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendedor:</span>
                      <span className="font-semibold">{vendedor.nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone Vendedor:</span>
                      <span className="font-semibold">{vendedor.telefone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold">
                        {dados.bilhete.status_venda === 'pendente' && '🟡 Pendente'}
                        {dados.bilhete.status_venda === 'confirmado' && '🟢 Confirmado'}
                        {dados.bilhete.status_venda === 'pago' && '✅ Pago'}
                        {dados.bilhete.status_venda === 'cancelado' && '🔴 Cancelado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/rifa/${rifaId}`)}
                className="btn btn-primary w-full"
              >
                Voltar para a Rifa
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
}
