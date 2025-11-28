import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';

// Configurações pré-definidas de rifas
const CONFIGURACOES_RIFAS = {
  100: {
    label: '100 Cartões',
    descricao: 'Cada cartão tem 1 número (00 a 99)',
    tipo_sorteio: 'dezena',
    numeros_por_cartao: 1,
  },
  200: {
    label: '200 Cartões',
    descricao: 'Cada cartão tem 5 números (000 a 999)',
    tipo_sorteio: 'centena',
    numeros_por_cartao: 5,
  },
  250: {
    label: '250 Cartões',
    descricao: 'Cada cartão tem 4 números (000 a 999)',
    tipo_sorteio: 'centena',
    numeros_por_cartao: 4,
  },
  500: {
    label: '500 Cartões',
    descricao: 'Cada cartão tem 2 números (000 a 999)',
    tipo_sorteio: 'centena',
    numeros_por_cartao: 2,
  },
  1000: {
    label: '1000 Cartões',
    descricao: 'Cada cartão tem 1 número (000 a 999)',
    tipo_sorteio: 'centena',
    numeros_por_cartao: 1,
  },
};

// Função para calcular todos os divisores de um número
function calcularDivisores(numero) {
  if (!numero || numero <= 0) return [1];

  const divisores = [];
  for (let i = 1; i <= numero; i++) {
    if (numero % i === 0) {
      divisores.push(i);
    }
  }
  return divisores;
}

export default function NovaRifa() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    logo_url: '',
    qtde_bilhetes: 100,
    qtde_blocos: 10,
    valor_bilhete: 5.00,
    data_sorteio: '',
  });

  const [inputCartoes, setInputCartoes] = useState('100'); // Campo de input do usuário
  const [sugestao, setSugestao] = useState(null); // Sugestão do sistema

  const [premios, setPremios] = useState([
    { posicao: 1, descricao: '', imagem: null },
  ]);

  const [dataValida, setDataValida] = useState(true);
  const [mensagemData, setMensagemData] = useState('');

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
  }, [router]);

  const configuracaoAtual = CONFIGURACOES_RIFAS[formData.qtde_bilhetes];
  const blocosPossiveis = calcularDivisores(formData.qtde_bilhetes);
  const bilhetesPorBloco = formData.qtde_bilhetes / formData.qtde_blocos;

  // Função para calcular a melhor sugestão
  const calcularSugestao = (valor) => {
    const num = parseInt(valor);

    if (isNaN(num) || num <= 0) {
      return null;
    }

    // Opções válidas
    const opcoesValidas = [100, 200, 250, 500, 1000];

    // Se for exatamente uma opção válida, está perfeito
    if (opcoesValidas.includes(num)) {
      const config = CONFIGURACOES_RIFAS[num];
      return {
        valor: num,
        tipo: 'perfeito',
        config: config,
        mensagem: `✓ Perfeito! ${num} cartões é uma configuração válida.`,
      };
    }

    // Calcular distância para todas as opções e encontrar a mais próxima
    let menorDistancia = Infinity;
    let sugerido = 100;

    opcoesValidas.forEach(opcao => {
      const distancia = Math.abs(num - opcao);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        sugerido = opcao;
      }
    });

    const config = CONFIGURACOES_RIFAS[sugerido];

    return {
      valor: sugerido,
      tipo: 'sugestao',
      config: config,
      digitado: num,
      mensagem: `Você digitou ${num} cartões. Sugerimos ${sugerido} cartões (${config.descricao}).`,
      explicacao: `Com ${sugerido} cartões, cada um terá ${config.numeros_por_cartao} número${config.numeros_por_cartao > 1 ? 's' : ''} da sorte. Sistema usa ${config.tipo_sorteio === 'dezena' ? 'dezenas (00-99)' : 'centenas (000-999)'} da Loteria Federal.`,
    };
  };

  // Atualizar sugestão quando o input mudar
  useEffect(() => {
    const novaSugestao = calcularSugestao(inputCartoes);
    setSugestao(novaSugestao);
  }, [inputCartoes]);

  // Função para validar se a data é quarta ou sábado (dias da Loteria Federal)
  const validarDataSorteio = (data) => {
    if (!data) {
      setDataValida(true);
      setMensagemData('');
      return true;
    }

    const dataSelecionada = new Date(data + 'T00:00:00');
    const diaSemana = dataSelecionada.getDay(); // 0 = Domingo, 3 = Quarta, 6 = Sábado

    if (diaSemana === 3 || diaSemana === 6) {
      setDataValida(true);
      setMensagemData(diaSemana === 3
        ? '✓ Quarta-feira - Dia de sorteio da Loteria Federal'
        : '✓ Sábado - Dia de sorteio da Loteria Federal'
      );
      return true;
    } else {
      setDataValida(false);
      const diasParaProximaQuarta = (3 - diaSemana + 7) % 7;
      const diasParaProximoSabado = (6 - diaSemana + 7) % 7;
      const proximaData = diasParaProximaQuarta < diasParaProximoSabado
        ? diasParaProximaQuarta
        : diasParaProximoSabado;

      const diaNome = proximaData === diasParaProximaQuarta ? 'quarta-feira' : 'sábado';
      setMensagemData(`⚠️ A Loteria Federal sorteia apenas às quartas e sábados. Escolha uma ${diaNome}.`);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = type === 'number' ? parseFloat(value) : value;

    // Validar data do sorteio
    if (name === 'data_sorteio') {
      validarDataSorteio(value);
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleInputCartoesChange = (e) => {
    const valor = e.target.value;
    setInputCartoes(valor);

    // Se for um valor válido (100, 200, 250, 500, 1000), atualizar formData imediatamente
    const num = parseInt(valor);
    const opcoesValidas = [100, 200, 250, 500, 1000];

    if (opcoesValidas.includes(num)) {
      const divisores = calcularDivisores(num);
      const blocosPadrao = divisores[Math.floor(divisores.length / 2)] || 10;
      setFormData({
        ...formData,
        qtde_bilhetes: num,
        qtde_blocos: blocosPadrao,
      });
    }
  };

  const aplicarSugestao = () => {
    if (sugestao && sugestao.valor) {
      const divisores = calcularDivisores(sugestao.valor);
      const blocosPadrao = divisores[Math.floor(divisores.length / 2)] || 10; // Opção do meio
      setFormData({
        ...formData,
        qtde_bilhetes: sugestao.valor,
        qtde_blocos: blocosPadrao,
      });
      setInputCartoes(sugestao.valor.toString());
    }
  };

  const handlePremioChange = (index, field, value) => {
    const novosPremios = [...premios];
    novosPremios[index][field] = value;
    setPremios(novosPremios);
  };

  const processarImagem = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir para JPEG com qualidade 0.7
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImagemChange = async (index, file) => {
    if (!file) return;

    try {
      const resizedImage = await processarImagem(file);
      const novosPremios = [...premios];
      novosPremios[index].imagem = resizedImage; // Agora salva a string Base64
      setPremios(novosPremios);
    } catch (error) {
      console.error('Erro ao processar imagem do prêmio', error);
      alert('Erro ao processar a imagem. Tente outra.');
    }
  };

  const adicionarPremio = () => {
    setPremios([
      ...premios,
      { posicao: premios.length + 1, descricao: '', imagem: null },
    ]);
  };

  const removerPremio = (index) => {
    if (premios.length > 1) {
      const novosPremios = premios.filter((_, i) => i !== index);
      // Reajustar posições
      novosPremios.forEach((p, i) => p.posicao = i + 1);
      setPremios(novosPremios);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar data do sorteio
      if (!dataValida) {
        throw new Error('A data do sorteio deve ser uma quarta-feira ou sábado (dias de sorteio da Loteria Federal)');
      }

      // Validar bilhetes por bloco
      if (bilhetesPorBloco !== Math.floor(bilhetesPorBloco)) {
        throw new Error('Número de blocos deve ser divisível pela quantidade de cartões');
      }

      // Filtrar prêmios preenchidos
      const premiosFiltrados = premios.filter(p => p.descricao.trim() !== '');

      if (premiosFiltrados.length === 0) {
        throw new Error('Adicione pelo menos um prêmio');
      }

      // Preparar dados com a configuração automática
      const dados = {
        ...formData,
        tipo_sorteio: configuracaoAtual.tipo_sorteio,
        numeros_por_cartao: configuracaoAtual.numeros_por_cartao,
        premios: premiosFiltrados,
        gerenciador_id: usuario.id,
      };

      // TODO: Se houver imagens, fazer upload primeiro
      // Por enquanto, vamos apenas enviar os dados sem imagens

      const response = await fetch('/api/rifas/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar rifa');
      }

      alert('Rifa criada com sucesso!');
      router.push('/gerenciador/dashboard');
    } catch (err) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
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
    <Layout title="Nova Rifa">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gerenciador/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Criar Nova Rifa</h1>
          <p className="text-gray-600">Configure sua rifa de forma inteligente</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📋 Informações Básicas</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Título da Rifa *</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: Rifa Beneficente de Natal 2024"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="input"
                  rows="3"
                  placeholder="Descreva o objetivo da rifa..."
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Logo da Rifa</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        // Função para redimensionar imagem
                        const processarImagem = (file) => {
                          return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = (event) => {
                              const img = new Image();
                              img.src = event.target.result;
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 300;
                                const MAX_HEIGHT = 300;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);

                                // Comprimir para JPEG com qualidade 0.7
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                resolve(dataUrl);
                              };
                              img.onerror = (err) => reject(err);
                            };
                            reader.onerror = (err) => reject(err);
                          });
                        };

                        const resizedImage = await processarImagem(file);
                        setFormData({ ...formData, logo_url: resizedImage });
                      } catch (error) {
                        console.error('Erro ao processar imagem', error);
                        alert('Erro ao processar a imagem. Tente outra.');
                      }
                    }
                  }}
                  className="input"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma imagem do seu computador. Ela será redimensionada automaticamente para economizar espaço.
                </p>
                {formData.logo_url && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-600 mb-1">Pré-visualização:</p>
                    <img
                      src={formData.logo_url}
                      alt="Logo Preview"
                      className="w-16 h-16 object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="text-xs text-red-600 mt-1 hover:underline"
                    >
                      Remover logo
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Data do Sorteio *</label>
                <p className="text-xs text-gray-600 mb-2">
                  A Loteria Federal sorteia apenas às <strong>quartas-feiras</strong> e <strong>sábados</strong>
                </p>
                <input
                  type="date"
                  name="data_sorteio"
                  value={formData.data_sorteio}
                  onChange={handleChange}
                  className={`input ${!dataValida && formData.data_sorteio ? 'border-red-500 border-2' : ''} ${dataValida && formData.data_sorteio ? 'border-green-500 border-2' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={loading}
                />
                {mensagemData && (
                  <div className={`mt-2 p-2 rounded text-sm ${dataValida
                    ? 'bg-green-50 text-green-800 border border-green-300'
                    : 'bg-red-50 text-red-800 border border-red-300'
                    }`}>
                    {mensagemData}
                  </div>
                )}
              </div>

              <div>
                <label className="label">Valor do Bilhete (R$) *</label>
                <input
                  type="number"
                  name="valor_bilhete"
                  value={formData.valor_bilhete}
                  onChange={handleChange}
                  className="input"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Configuração Inteligente */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🎯 Configuração Inteligente</h2>

            <div className="space-y-6">
              {/* Escolha de Quantidade */}
              <div>
                <label className="label">Quantidade de Cartões *</label>
                <p className="text-sm text-gray-600 mb-3">
                  Digite a quantidade que você tem em mente. O sistema vai sugerir a configuração ideal.
                </p>

                <input
                  type="number"
                  value={inputCartoes}
                  onChange={handleInputCartoesChange}
                  className="input mb-3"
                  placeholder="Ex: 100, 200, 250, 500, 1000..."
                  min="1"
                  max="1000"
                  disabled={loading}
                />

                {/* Sugestão do Sistema */}
                {sugestao && (
                  <div className={`p-4 rounded-lg border-2 ${sugestao.tipo === 'perfeito'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-yellow-50 border-yellow-500'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">
                        {sugestao.tipo === 'perfeito' ? '✅' : '💡'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-lg mb-1">
                          {sugestao.tipo === 'perfeito'
                            ? 'Configuração Perfeita!'
                            : `Sugestão: ${sugestao.valor} Cartões`}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {sugestao.mensagem}
                        </p>
                        <div className="text-xs text-gray-600 bg-white bg-opacity-50 p-2 rounded">
                          <strong>Tipo:</strong> {sugestao.config.tipo_sorteio === 'dezena' ? 'Dezena (00-99)' : 'Centena (000-999)'} •
                          <strong> Números por cartão:</strong> {sugestao.config.numeros_por_cartao}
                        </div>

                        {sugestao.tipo !== 'perfeito' && (
                          <button
                            type="button"
                            onClick={aplicarSugestao}
                            className="btn btn-primary mt-3 text-sm"
                            disabled={loading}
                          >
                            ✓ Aplicar Sugestão de {sugestao.valor} Cartões
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuração Atual */}
                {formData.qtde_bilhetes > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                    <div className="text-sm">
                      <strong>📋 Configuração Selecionada:</strong> {formData.qtde_bilhetes} cartões
                      ({CONFIGURACOES_RIFAS[formData.qtde_bilhetes]?.tipo_sorteio === 'dezena' ? 'Dezena' : 'Centena'})
                    </div>
                  </div>
                )}
              </div>

              {/* Escolha de Blocos */}
              <div>
                <label className="label">Quantidade de Blocos *</label>
                <p className="text-sm text-gray-600 mb-2">
                  Escolha quantos blocos físicos você quer distribuir para os vendedores.
                  <br />
                  <span className="text-blue-600 font-medium">
                    {blocosPossiveis.length} opções válidas para {formData.qtde_bilhetes} cartões
                  </span>
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-80 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                  {blocosPossiveis.map((qtde) => (
                    <button
                      key={qtde}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'qtde_blocos', value: qtde } })}
                      className={`p-3 border-2 rounded-lg font-semibold transition-all ${formData.qtde_blocos === qtde
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      disabled={loading}
                    >
                      {qtde}
                    </button>
                  ))}
                </div>

                {formData.qtde_blocos && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">
                      ✓ Cada bloco terá exatamente {bilhetesPorBloco} {bilhetesPorBloco === 1 ? 'cartão' : 'cartões'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-4 text-lg">📊 Resumo da Configuração</h3>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Total de Cartões</p>
                  <p className="font-bold text-2xl text-blue-700">{formData.qtde_bilhetes}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Tipo: {configuracaoAtual?.tipo_sorteio === 'dezena' ? 'Dezena (00-99)' : 'Centena (000-999)'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Números por Cartão</p>
                  <p className="font-bold text-2xl text-purple-700">
                    {configuracaoAtual?.numeros_por_cartao || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {configuracaoAtual?.numeros_por_cartao === 1 ? 'número' : 'números'} da sorte
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Valor do Bilhete</p>
                  <p className="font-bold text-2xl text-green-700">
                    R$ {formData.valor_bilhete.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">por cartão</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Divisão em Blocos</p>
                  <p className="font-bold text-xl text-indigo-700">{formData.qtde_blocos} blocos</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {bilhetesPorBloco} {bilhetesPorBloco === 1 ? 'cartão' : 'cartões'} por bloco
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Data do Sorteio</p>
                  <p className="font-bold text-xl text-orange-700">
                    {formData.data_sorteio ? new Date(formData.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">via Loteria Federal</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-lg text-white shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">💰 Arrecadação Total Estimada</p>
                    <p className="text-3xl font-bold">
                      R$ {(formData.qtde_bilhetes * formData.valor_bilhete).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right text-sm opacity-90">
                    <p>{formData.qtde_bilhetes} × R$ {formData.valor_bilhete.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prêmios */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🏆 Prêmios</h2>
              <button
                type="button"
                onClick={adicionarPremio}
                className="btn btn-secondary text-sm"
                disabled={loading || premios.length >= 5}
              >
                + Adicionar Prêmio
              </button>
            </div>

            <div className="space-y-4">
              {premios.map((premio, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">{premio.posicao}º Prêmio</h3>
                    {premios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerPremio(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={loading}
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Descrição do Prêmio *</label>
                      <input
                        type="text"
                        value={premio.descricao}
                        onChange={(e) => handlePremioChange(index, 'descricao', e.target.value)}
                        className="input"
                        placeholder="Ex: 1 Moto Honda 0km, 1 TV 50 polegadas, R$ 5.000 em dinheiro"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="label">Foto do Prêmio (Opcional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImagemChange(index, e.target.files[0])}
                        className="input"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: JPG, PNG. Máximo 5MB
                      </p>
                    </div>

                    {premio.imagem && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600 mb-1">✓ Imagem selecionada:</p>
                        <img
                          src={premio.imagem}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Criando Rifa...' : '✓ Criar Rifa'}
            </button>

            <Link href="/gerenciador/dashboard" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>

        {/* Informações de Ajuda */}
        <div className="mt-8 card bg-yellow-50 border border-yellow-200">
          <h3 className="font-bold mb-3">💡 Como funciona?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>100 Cartões:</strong> Usa dezenas (00-99). Cada cartão tem 1 número da sorte.</p>
            <p><strong>200 Cartões:</strong> Usa centenas (000-999). Cada cartão tem 5 números da sorte diferentes.</p>
            <p><strong>Blocos:</strong> São os conjuntos físicos de cartões que você vai distribuir aos vendedores.</p>
            <p><strong>Divisão perfeita:</strong> O sistema só permite escolher blocos que dividem perfeitamente os cartões.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
