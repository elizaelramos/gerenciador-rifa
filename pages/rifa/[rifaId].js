import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatarValor, formatarData } from '../../lib/formatters';

function BotoesCompartilhar({ titulo }) {
  const [copiado, setCopiado] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copiarLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const texto = encodeURIComponent(`Participe da rifa: ${titulo}\n${url}`);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-sm text-gray-500 font-medium">Compartilhar:</span>

      <a
        href={`https://api.whatsapp.com/send?text=${texto}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L.057 23.882l6.196-1.624A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.853 0-3.601-.5-5.112-1.374l-.366-.217-3.797.996.998-3.68-.239-.378A9.946 9.946 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        WhatsApp
      </a>

      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Participe da rifa: ${titulo}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.92 14.173l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.228.386z"/>
        </svg>
        Telegram
      </a>

      <button
        onClick={copiarLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200"
      >
        {copiado ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            <span className="text-green-600">Copiado!</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
              <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
            </svg>
            Copiar Link
          </>
        )}
      </button>
    </div>
  );
}
import { GraficoBlocosDistribuidos, GraficoBilhetesVendidos } from '../../components/GraficosRelatorio';

export default function DetalhesRifa({ ogData = {} }) {
  const router = useRouter();
  const { rifaId } = router.query;

  const [dados, setDados] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blocoEditando, setBlocoEditando] = useState(null);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('');
  const [mostrarFormNovoVendedor, setMostrarFormNovoVendedor] = useState(false);
  const [novoVendedor, setNovoVendedor] = useState({ nome: '', telefone: '' });
  const [salvandoVendedor, setSalvandoVendedor] = useState(false);

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  useEffect(() => {
    if (!rifaId) return;

    async function carregarDados() {
      try {
        const [rifaResponse, vendedoresResponse] = await Promise.all([
          fetch(`/api/rifas/${rifaId}`),
          fetch('/api/vendedores')
        ]);

        if (!rifaResponse.ok) {
          throw new Error('Rifa não encontrada');
        }

        const rifaData = await rifaResponse.json();
        const vendedoresData = await vendedoresResponse.json();

        setDados(rifaData);
        setVendedores(vendedoresData.vendedores.filter(v => v.ativo));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [rifaId]);

  const handleAtribuirVendedor = async (blocoId) => {
    if (!usuario) {
      alert('Você precisa estar logado para realizar esta ação');
      return;
    }

    if (!vendedorSelecionado) {
      alert('Selecione um vendedor');
      return;
    }

    try {
      const response = await fetch(`/api/blocos/${blocoId}/atribuir-vendedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendedor_id: vendedorSelecionado === 'remover' ? null : parseInt(vendedorSelecionado)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setBlocoEditando(null);
        setVendedorSelecionado('');

        // Recarregar dados
        const rifaResponse = await fetch(`/api/rifas/${rifaId}`);
        const rifaData = await rifaResponse.json();
        setDados(rifaData);
      } else {
        alert(data.error || 'Erro ao atribuir vendedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atribuir vendedor');
    }
  };

  const abrirModalAtribuicao = (bloco) => {
    if (!usuario) return;
    setBlocoEditando(bloco);
    setVendedorSelecionado(bloco.vendedor_id ? bloco.vendedor_id.toString() : '');
    setMostrarFormNovoVendedor(false);
    setNovoVendedor({ nome: '', telefone: '' });
  };

  const formatarTelefone = (valor) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const numeroLimitado = numeros.slice(0, 11);

    // Formata: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
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

    // Deve ter 10 (fixo) ou 11 (celular) dígitos
    if (numeros.length !== 10 && numeros.length !== 11) {
      return false;
    }

    // DDD deve ser válido (11-99)
    const ddd = parseInt(numeros.slice(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    return true;
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setNovoVendedor({ ...novoVendedor, telefone: valorFormatado });
  };

  const handleCadastrarNovoVendedor = async (e) => {
    e.preventDefault();

    if (!usuario) return;

    // Validar telefone
    if (!validarTelefone(novoVendedor.telefone)) {
      alert('Telefone inválido! Use o formato: DD XXXXX-XXXX (ex: 67 98129-7591)');
      return;
    }

    setSalvandoVendedor(true);

    try {
      const response = await fetch('/api/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoVendedor),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        // Adicionar o novo vendedor à lista
        setVendedores([...vendedores, data.vendedor]);

        // Selecionar automaticamente o vendedor recém-criado
        setVendedorSelecionado(data.vendedor.id.toString());

        // Limpar formulário e fechar
        setMostrarFormNovoVendedor(false);
        setNovoVendedor({ nome: '', telefone: '' });
      } else {
        alert(data.error || 'Erro ao cadastrar vendedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar vendedor');
    } finally {
      setSalvandoVendedor(false);
    }
  };

  if (loading) {
    return (
      <Layout title={ogData.titulo || 'Carregando...'}>
        <Head>
          <title>{ogData.titulo || 'Carregando...'}</title>
          {ogData.descricao && <meta name="description" content={ogData.descricao} />}
          <meta property="og:type" content="website" />
          {ogData.url && <meta property="og:url" content={ogData.url} />}
          {ogData.titulo && <meta property="og:title" content={ogData.titulo} />}
          {ogData.descricao && <meta property="og:description" content={ogData.descricao} />}
          {ogData.imagem && <meta property="og:image" content={ogData.imagem} />}
          {ogData.imagem && <meta property="og:image:width" content="1200" />}
          {ogData.imagem && <meta property="og:image:height" content="630" />}
          <meta name="twitter:card" content={ogData.imagem ? 'summary_large_image' : 'summary'} />
          {ogData.titulo && <meta name="twitter:title" content={ogData.titulo} />}
          {ogData.descricao && <meta name="twitter:description" content={ogData.descricao} />}
          {ogData.imagem && <meta name="twitter:image" content={ogData.imagem} />}
        </Head>
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
            <Link href="/" className="btn btn-primary mt-4 inline-block">
              Voltar para Início
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { rifa, premios, blocos } = dados;

  // Calcular estatísticas dos blocos
  const blocosDisponiveis = blocos.filter(b => b.status === 'disponivel').length;
  const blocosDistribuidos = blocos.filter(b => b.status === 'distribuido').length;
  const blocosRecolhidos = blocos.filter(b => b.status === 'recolhido').length;

  return (
    <Layout title={rifa.titulo}>
      <Head>
        <title>{ogData.titulo || rifa.titulo}</title>
        <meta name="description" content={ogData.descricao || rifa.descricao} />

        {/* Open Graph - usado por WhatsApp, Telegram, Facebook etc */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={ogData.url || ''} />
        <meta property="og:title" content={ogData.titulo || rifa.titulo} />
        <meta property="og:description" content={ogData.descricao || rifa.descricao} />
        {ogData.imagem && <meta property="og:image" content={ogData.imagem} />}
        {ogData.imagem && <meta property="og:image:width" content="1200" />}
        {ogData.imagem && <meta property="og:image:height" content="630" />}

        {/* Twitter Card */}
        <meta name="twitter:card" content={ogData.imagem ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={ogData.titulo || rifa.titulo} />
        <meta name="twitter:description" content={ogData.descricao || rifa.descricao} />
        {ogData.imagem && <meta name="twitter:image" content={ogData.imagem} />}
      </Head>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold mb-2">{rifa.titulo}</h1>
          <div className="flex gap-2">
            <span className={`badge ${rifa.status === 'preparacao' ? 'bg-blue-100 text-blue-800' :
              rifa.status === 'distribuido' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {rifa.status === 'preparacao' ? 'Em Preparação' :
                rifa.status === 'distribuido' ? 'Distribuído' :
                  rifa.status === 'concluido' ? 'Concluído' : rifa.status}
            </span>
          </div>
          <BotoesCompartilhar titulo={rifa.titulo} />
        </div>

        {/* Grid de Informações */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card: Informações Gerais */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Informações Gerais</h2>

            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Descrição:</span>
                <p className="font-medium">{rifa.descricao || 'Sem descrição'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Data do Sorteio:</span>
                  <p className="font-semibold text-lg">{formatarData(rifa.data_sorteio)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Valor do Bilhete:</span>
                  <p className="font-semibold text-lg text-green-600">
                    {formatarValor(rifa.valor_bilhete)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Total de Bilhetes:</span>
                  <p className="font-semibold">{rifa.qtde_bilhetes}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Tipo de Sorteio:</span>
                  <p className="font-semibold">
                    {rifa.tipo_sorteio === 'dezena' ? 'Dezena (00-99)' : 'Milhar (0000-9999)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Quantidade de Blocos:</span>
                  <p className="font-semibold">{rifa.qtde_blocos}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Bilhetes por Bloco:</span>
                  <p className="font-semibold">{rifa.bilhetes_por_bloco}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Prêmios */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Prêmios</h2>

            {premios.length === 0 ? (
              <p className="text-gray-500">Nenhum prêmio cadastrado</p>
            ) : (
              <div className="space-y-3">
                {premios.map((premio) => (
                  <div key={premio.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm mb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        {premio.imagem_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={premio.imagem_url}
                              alt={`Prêmio ${premio.posicao}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                            {premio.posicao}º Prêmio
                          </span>
                          <p className="font-bold text-gray-800 text-lg">{premio.descricao}</p>
                        </div>
                      </div>
                      {premio.valor_estimado && (
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {formatarValor(premio.valor_estimado)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Seção de Gráficos de Relatório */}
        {/* Seção de Gráficos de Relatório - Apenas Logado */}
        {usuario && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📈 Relatórios e Estatísticas</h2>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <GraficoBlocosDistribuidos blocos={blocos} />
              <GraficoBilhetesVendidos rifa={rifa} blocos={blocos} bilhetes={dados.bilhetes || []} />
            </div>
          </div>
        )}

        {/* Status dos Blocos */}
        {/* Status dos Blocos - Apenas Logado */}
        {usuario && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Status dos Blocos</h2>
              {(blocosDistribuidos > 0 || blocosRecolhidos > 0) && (
                <Link href={`/gerenciador/rifas/${rifaId}/acerto`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  💰 Acerto de Contas →
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-3xl font-bold text-blue-600">{blocosDisponiveis}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Distribuídos</p>
                <p className="text-3xl font-bold text-green-600">{blocosDistribuidos}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Recolhidos</p>
                <p className="text-3xl font-bold text-gray-600">{blocosRecolhidos}</p>
              </div>
            </div>

            {/* Lista de Blocos */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Bloco</th>
                    <th className="text-left p-3">Quantidade</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Vendedor</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {blocos.map((bloco) => (
                    <tr key={bloco.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-semibold">Bloco #{bloco.numero}</td>
                      <td className="p-3">{bloco.qtde_cartoes} bilhetes</td>
                      <td className="p-3">
                        <span className={`badge ${bloco.status === 'disponivel' ? 'badge-nao-vendido' :
                          bloco.status === 'distribuido' ? 'badge-pendente' :
                            'badge-pago'
                          }`}>
                          {bloco.status === 'disponivel' ? 'Disponível' :
                            bloco.status === 'distribuido' ? 'Distribuído' :
                              'Recolhido'}
                        </span>
                      </td>
                      <td className="p-3">
                        {bloco.vendedor_nome ? (
                          <div>
                            <p className="font-semibold text-gray-800">{bloco.vendedor_nome}</p>
                            <p className="text-xs text-gray-500">{bloco.vendedor_telefone}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sem vendedor</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => abrirModalAtribuicao(bloco)}
                          className="btn btn-secondary text-xs px-3 py-1"
                        >
                          {bloco.vendedor_id ? 'Alterar' : 'Atribuir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista de Vendedores (Público) */}
        {!usuario && vendedores.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">📞 Vendedores Autorizados</h2>
            <p className="text-gray-600 mb-4">Entre em contato com um de nossos vendedores para adquirir seu bilhete:</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendedores.map((vendedor) => (
                <div key={vendedor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {vendedor.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{vendedor.nome}</p>
                      <a
                        href={`https://wa.me/55${vendedor.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                      >
                        📱 {vendedor.telefone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-wrap gap-4">
          {usuario && (rifa.status === 'preparacao' || rifa.status === 'distribuido') && (
            <Link href={`/gerenciador/rifas/${rifaId}/imprimir`} className="btn btn-success">
              🖨️ Gerar Blocos para Impressão
            </Link>
          )}

          {usuario && (blocosDistribuidos > 0 || blocosRecolhidos > 0) && (
            <Link href={`/gerenciador/rifas/${rifaId}/acerto`} className="btn btn-secondary">
              💰 Acerto de Contas
            </Link>
          )}

          {usuario && rifa.status === 'distribuido' && new Date(rifa.data_sorteio) <= new Date() && (
            <Link href={`/gerenciador/rifas/${rifaId}/sortear`} className="btn bg-purple-600 text-white hover:bg-purple-700">
              🎲 Realizar Sorteio
            </Link>
          )}

          {rifa.status === 'concluido' && (
            <Link href={`/rifa/${rifaId}/resultado`} className="btn bg-green-600 text-white hover:bg-green-700">
              🏆 Ver Resultado
            </Link>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 card bg-blue-50">
          <h3 className="font-bold mb-2">ℹ️ Como funciona</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• O sorteio será baseado na Loteria Federal do dia {formatarData(rifa.data_sorteio)}</li>
            <li>• Cada bilhete possui um número da sorte único</li>
            <li>• Os blocos são distribuídos aos vendedores para comercialização</li>
            <li>• Compradores podem validar seus bilhetes via QR Code</li>
            <li>• O ganhador é determinado automaticamente pelo sistema</li>
          </ul>
        </div>

        {/* Modal de Atribuição de Vendedor */}
        {blocoEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Atribuir Vendedor - Bloco #{blocoEditando.numero}
              </h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Quantidade de bilhetes:</strong> {blocoEditando.qtde_cartoes}
                </p>
                {blocoEditando.vendedor_nome && (
                  <p className="text-sm text-gray-600">
                    <strong>Vendedor atual:</strong> {blocoEditando.vendedor_nome}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">Selecione o Vendedor</label>
                  {!mostrarFormNovoVendedor && (
                    <button
                      onClick={() => setMostrarFormNovoVendedor(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      + Novo Vendedor
                    </button>
                  )}
                </div>

                {!mostrarFormNovoVendedor ? (
                  <>
                    <select
                      value={vendedorSelecionado}
                      onChange={(e) => setVendedorSelecionado(e.target.value)}
                      className="input"
                    >
                      <option value="">-- Selecione --</option>
                      {vendedores.map((vendedor) => (
                        <option key={vendedor.id} value={vendedor.id}>
                          {vendedor.nome} - {vendedor.telefone}
                        </option>
                      ))}
                      {blocoEditando.vendedor_id && (
                        <option value="remover" className="text-red-600">
                          ❌ Remover vendedor atual
                        </option>
                      )}
                    </select>

                    {vendedores.length === 0 && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Nenhum vendedor cadastrado ainda
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-800">Cadastrar Novo Vendedor</h3>
                      <button
                        onClick={() => {
                          setMostrarFormNovoVendedor(false);
                          setNovoVendedor({ nome: '', telefone: '' });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCadastrarNovoVendedor} className="space-y-3">
                      <div>
                        <label className="label text-sm">Nome Completo *</label>
                        <input
                          type="text"
                          value={novoVendedor.nome}
                          onChange={(e) => setNovoVendedor({ ...novoVendedor, nome: e.target.value })}
                          className="input text-sm"
                          placeholder="Nome do vendedor"
                          required
                          disabled={salvandoVendedor}
                        />
                      </div>

                      <div>
                        <label className="label text-sm">Telefone/WhatsApp *</label>
                        <input
                          type="tel"
                          value={novoVendedor.telefone}
                          onChange={handleTelefoneChange}
                          className="input text-sm"
                          placeholder="67 98129-7591"
                          required
                          disabled={salvandoVendedor}
                          maxLength={14}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Digite apenas números. Formato: DD XXXXX-XXXX
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-full text-sm"
                        disabled={salvandoVendedor}
                      >
                        {salvandoVendedor ? 'Cadastrando...' : 'Cadastrar Vendedor'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {!mostrarFormNovoVendedor && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAtribuirVendedor(blocoEditando.id)}
                    className="btn btn-primary flex-1"
                    disabled={!vendedorSelecionado}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setBlocoEditando(null);
                      setVendedorSelecionado('');
                      setMostrarFormNovoVendedor(false);
                      setNovoVendedor({ nome: '', telefone: '' });
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
export async function getServerSideProps(context) {
  const { rifaId, req } = context;
  const id = context.params.rifaId;

  // Montar URL base para imagens absolutas
  const protocol = context.req.headers['x-forwarded-proto'] || 'https';
  const host = context.req.headers['x-forwarded-host'] || context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  try {
    const { getRifa, getRifaBySlug } = await import('../../lib/db');
    const isNumericId = /^\d+$/.test(id);
    const rifa = isNumericId
      ? await getRifa(parseInt(id))
      : await getRifaBySlug(id);

    if (!rifa) {
      return { props: { ogData: {} } };
    }

    // Truncar descrição para ~160 caracteres
    const descricao = rifa.descricao
      ? rifa.descricao.length > 160
        ? rifa.descricao.substring(0, 157) + '...'
        : rifa.descricao
      : '';

    // Tornar URL da imagem absoluta
    let imagem = null;
    if (rifa.logo_url) {
      imagem = rifa.logo_url.startsWith('http')
        ? rifa.logo_url
        : `${baseUrl}${rifa.logo_url}`;
    }

    return {
      props: {
        ogData: {
          titulo: rifa.titulo || '',
          descricao,
          imagem,
          url: `${baseUrl}/rifa/${id}`,
        },
      },
    };
  } catch (error) {
    console.error('getServerSideProps erro:', error);
    return { props: { ogData: {} } };
  }
}
