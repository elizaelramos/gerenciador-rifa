import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

export default function ImprimirRifa() {
  const router = useRouter();
  const { rifaId } = router.query;

  const [rifa, setRifa] = useState(null);
  const [blocos, setBlocos] = useState([]);
  const [bilhetes, setBilhetes] = useState([]);
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});

  useEffect(() => {
    if (!rifaId) return;
    carregarDados();
  }, [rifaId]);

  const carregarDados = async () => {
    try {
      // Buscar dados da rifa
      const response = await fetch(`/api/rifas/${rifaId}`);
      const data = await response.json();

      // Ajustar data do sorteio (converter do MySQL)
      if (data.rifa && data.rifa.data_sorteio) {
        // Se vier como objeto Date do MySQL, extrair apenas a parte da data
        const dataSorteio = new Date(data.rifa.data_sorteio);
        data.rifa.data_sorteio = dataSorteio.toISOString().split('T')[0];
      }

      setRifa(data.rifa);
      setBlocos(data.blocos || []);
      setBilhetes(data.bilhetes || []);
      setPremios(data.premios || []);

      // Gerar QR codes para todos os bilhetes
      await gerarQRCodes(data.bilhetes || []);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const gerarQRCodes = async (bilhetes) => {
    const codes = {};

    for (const bilhete of bilhetes) {
      try {
        // QR Code para o vendedor (registro de venda)
        const urlVendedor = `${window.location.origin}/venda/registro?rifaId=${rifaId}&bilheteId=${bilhete.id}&numero=${bilhete.numero_sorte}`;
        codes[`vendedor_${bilhete.id}`] = await QRCode.toDataURL(urlVendedor, { width: 120 });

        // QR Code para o comprador (visualização do bilhete)
        const urlComprador = `${window.location.origin}/bilhete/${bilhete.id}`;
        codes[`comprador_${bilhete.id}`] = await QRCode.toDataURL(urlComprador, { width: 120 });
      } catch (err) {
        console.error('Erro ao gerar QR code:', err);
      }
    }

    setQrCodes(codes);
  };

  const agruparBilhetesPorBloco = () => {
    const grupos = {};

    bilhetes.forEach(bilhete => {
      if (!grupos[bilhete.bloco_id]) {
        grupos[bilhete.bloco_id] = [];
      }
      grupos[bilhete.bloco_id].push(bilhete);
    });

    return grupos;
  };

  const handleImprimir = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando impressão...</p>
        </div>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Rifa não encontrada</p>
        </div>
      </div>
    );
  }

  const bilhetesPorBloco = agruparBilhetesPorBloco();
  const blocosOrdenados = blocos.sort((a, b) => a.numero - b.numero);

  return (
    <>
      {/* Botão de Imprimir (não aparece na impressão) */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={handleImprimir}
          className="btn btn-primary shadow-lg"
        >
          🖨️ Imprimir Tudo
        </button>
        <button
          onClick={() => router.back()}
          className="btn btn-secondary shadow-lg ml-2"
        >
          ← Voltar
        </button>
      </div>

      {/* Renderizar cada bloco */}
      {blocosOrdenados.map(bloco => {
        const bilhetesDoBloco = bilhetesPorBloco[bloco.id] || [];

        return (
          <div key={bloco.id}>
            {/* Página 1: Orientações do Vendedor */}
            <div className="page-break-after a4-page p-8">
              <div className="border-4 border-blue-600 p-6 h-full flex flex-col">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
                  📋 ORIENTAÇÕES PARA O VENDEDOR
                </h1>

                <div className="text-lg space-y-4 flex-1">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="font-bold text-xl mb-2">Rifa: {rifa.titulo}</p>
                    <p className="text-gray-700">Bloco Nº {bloco.numero}</p>
                    <p className="text-gray-700">{bilhetesDoBloco.length} cartões para vender</p>
                  </div>

                  {/* Seção de Prêmios com Imagens - Compacta */}
                  <div className="mt-2 mb-4">
                    <h2 className="font-bold text-lg text-blue-800 border-b-2 border-blue-600 pb-1 mb-2">
                      🏆 PRÊMIOS
                    </h2>
                    <div className={`grid gap-2 ${premios.length > 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {premios.map((premio) => (
                        <div key={premio.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                          {premio.imagem_url ? (
                            <img
                              src={premio.imagem_url}
                              alt={premio.descricao}
                              className="w-12 h-12 object-cover rounded border border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-xl border border-gray-100 flex-shrink-0">
                              🎁
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase text-blue-600 block leading-none mb-0.5">
                              {premio.posicao}º Prêmio
                            </span>
                            <p className="font-bold text-gray-800 text-sm leading-tight truncate" title={premio.descricao}>
                              {premio.descricao}
                            </p>
                            {premio.valor_estimado && (
                              <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                                Est.: {parseFloat(premio.valor_estimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-bold text-lg text-blue-800 border-b-2 border-blue-600 pb-1">
                      ⚠️ REGRAS IMPORTANTES:
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2">
                        <p className="font-bold text-xs">1. CADASTRO</p>
                        <p className="text-xs text-gray-700 leading-tight">Todo cartão vendido DEVE ser cadastrado via QR Code.</p>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2">
                        <p className="font-bold text-xs">2. DADOS</p>
                        <p className="text-xs text-gray-700 leading-tight">Nome completo e telefone com WhatsApp do comprador.</p>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 col-span-2">
                        <p className="font-bold text-xs">3. ACERTO DE CONTAS</p>
                        <div className="flex justify-between text-xs text-gray-700">
                          <span>Prazo: {rifa.data_sorteio ? new Date(new Date(rifa.data_sorteio + 'T00:00:00').getTime() - 86400000).toLocaleDateString('pt-BR') : '__/__/__'}</span>
                          <span>Valor/cartão: R$ {parseFloat(rifa.valor_bilhete).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-2 mt-1">
                      <p className="font-bold text-xs">4. RESPONSABILIDADE</p>
                      <p className="text-xs text-gray-700 leading-tight">Você é responsável pelos cartões deste bloco até o acerto final.</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t-2 border-gray-300 pt-4">
                    <p className="font-bold text-center text-lg">Data do Sorteio:</p>
                    <p className="text-center text-2xl font-bold text-blue-600">
                      {rifa.data_sorteio ? new Date(rifa.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                    </p>
                    <p className="text-center text-gray-600 mt-2">Via Loteria Federal</p>
                  </div>
                </div>

                <div className="mt-6 bg-gray-100 p-4 rounded text-center">
                  <p className="text-sm text-gray-600">
                    Em caso de dúvidas, entre em contato com o organizador
                  </p>
                </div>
              </div>
            </div>

            {/* Página 2: Capa do Bloco */}
            <div className="page-break-after a4-page p-2">
              <div className="cartao-altura border-4 border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
                <div className="flex items-center gap-6 w-full max-w-2xl">
                  {/* Logo da Rifa - Lateral Esquerda */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border-4 border-blue-300 overflow-hidden shadow-lg">
                      {rifa.logo_url ? (
                        <img
                          src={rifa.logo_url}
                          alt="Logo da Rifa"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-blue-600 text-5xl font-bold">🎫</span>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo - Direita */}
                  <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold text-blue-900 mb-4">
                      {rifa.titulo}
                    </h1>

                    <div className="bg-blue-600 text-white py-3 px-8 rounded-lg shadow-lg inline-block">
                      <p className="text-5xl font-bold leading-tight">BLOCO Nº {bloco.numero.toString().padStart(2, '0')}</p>
                    </div>

                    <p className="mt-3 text-gray-700 text-lg font-semibold">
                      {bilhetesDoBloco.length} cartões para vender
                    </p>
                  </div>
                </div>
              </div>

              {/* Espaço vazio (4/5 da página) */}
              <div className="h-[237.6mm]"></div>
            </div>

            {/* Páginas 3+: Cartões (5 por página) */}
            {bilhetesDoBloco.map((bilhete, index) => (
              <div
                key={bilhete.id}
                className={`cartao-altura border-2 border-dashed border-gray-400 flex ${(index + 1) % 5 === 0 ? 'page-break-after' : ''
                  }`}
              >
                {/* Coluna 1: Canhoto (30% da largura) */}
                <div className="w-[30%] border-r-2 border-dashed border-gray-400 p-2 flex flex-col bg-gray-50">
                  <p className="text-[9px] font-bold mb-1 text-center">CANHOTO DO VENDEDOR</p>

                  {/* Número da Sorte + QR Code lado a lado */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="bg-blue-600 text-white p-1 rounded text-center" style={{ width: '45%' }}>
                      <p className="text-[6px] mb-0.5">Nº SORTE</p>
                      <p className="text-lg font-bold leading-tight">
                        {bilhete.numero_sorte}
                      </p>
                    </div>

                    {/* QR Code do Vendedor */}
                    {qrCodes[`vendedor_${bilhete.id}`] && (
                      <div className="text-center flex-1">
                        <img
                          src={qrCodes[`vendedor_${bilhete.id}`]}
                          alt="QR Registro"
                          className="w-16 h-16 mx-auto"
                        />
                        <p className="text-[5px] font-semibold">
                          CADASTRAR
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-[9px]">
                    <div>
                      <p className="font-semibold">Nome:</p>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>

                    <div>
                      <p className="font-semibold">Telefone:</p>
                      <div className="border-b border-gray-400 h-4"></div>
                    </div>

                    <div>
                      <p className="font-semibold">Pago:</p>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1">
                          <input type="checkbox" className="w-3 h-3" />
                          <span className="text-[8px]">Sim</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input type="checkbox" className="w-3 h-3" />
                          <span className="text-[8px]">Não</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Cartão do Comprador (70% da largura) */}
                <div className="w-[70%] p-2 flex flex-col">
                  {/* Cabeçalho com Logo */}
                  <div className="flex items-center gap-2 mb-1">
                    {/* Espaço para Logo do Gerenciador */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center border-2 border-blue-300 flex-shrink-0 overflow-hidden">
                      {rifa.logo_url ? (
                        <img
                          src={rifa.logo_url}
                          alt="Logo"
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        /* Placeholder padrão quando não há logo */
                        <span className="text-blue-600 text-xl font-bold">🎫</span>
                      )}
                    </div>

                    {/* Título e Descrição */}
                    <div className="flex-1 text-left">
                      <h2 className="text-base font-bold text-blue-800 leading-tight">
                        {rifa.titulo}
                      </h2>
                      <p className="text-[8px] text-gray-600">{rifa.descricao}</p>
                    </div>
                  </div>

                  {/* Número da Sorte + QR Code lado a lado */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-blue-600 text-white p-2 rounded">
                      <p className="text-center text-[9px] mb-1">NÚMERO DA SORTE</p>
                      <p className="text-center text-2xl font-bold">
                        {bilhete.numero_sorte}
                      </p>
                    </div>

                    {/* QR Code do Comprador */}
                    {qrCodes[`comprador_${bilhete.id}`] && (
                      <div className="text-center">
                        <img
                          src={qrCodes[`comprador_${bilhete.id}`]}
                          alt="QR Validação"
                          className="w-20 h-20"
                        />
                        <p className="text-[6px] font-semibold mt-0.5">
                          VALIDAR
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs mb-1">
                    <div>
                      <p className="font-semibold text-[9px]">📅 Sorteio:</p>
                      <p className="text-[9px]">{rifa.data_sorteio ? new Date(rifa.data_sorteio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[9px]">💰 Valor:</p>
                      <p className="text-[9px]">R$ {parseFloat(rifa.valor_bilhete).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-300 p-1.5 rounded">
                    <p className="text-[8px] leading-tight">
                      <span className="font-bold text-[9px]">🏆 Prêmios: </span>
                      {premios.slice(0, 3).map((premio, index) => (
                        <span key={premio.id}>
                          {index > 0 ? ' / ' : ''}
                          {premio.posicao}º - {premio.descricao}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .page-break-after {
            page-break-after: always;
          }

          .a4-page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }

          .cartao-altura {
            height: 59.4mm; /* 297mm / 5 = 59.4mm */
          }
        }

        @media screen {
          .a4-page {
            width: 210mm;
            height: 297mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .cartao-altura {
            height: 59.4mm;
            margin: 0 auto;
            max-width: 210mm;
          }
        }

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
    </>
  );
}
