import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import { formatarValor } from '../../../../lib/formatters';

const MAX_PREMIOS = 5;

// Converte a data vinda da API (Date serializado ou 'AAAA-MM-DD') para o input type="date"
function paraInputData(valor) {
  // Usa só a parte AAAA-MM-DD: converter para Date no navegador (UTC-3) voltaria um dia
  if (!valor) return '';
  const s = String(valor).split('T')[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

function processarImagem(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const MAX = 300;
        let { width, height } = img;
        if (width > height && width > MAX) {
          height *= MAX / width;
          width = MAX;
        } else if (height >= width && height > MAX) {
          width *= MAX / height;
          height = MAX;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

function mensagemDia(data) {
  if (!data) return { ok: false, texto: '' };
  const dia = new Date(`${data}T00:00:00`).getDay();
  if (dia === 3) return { ok: true, texto: '✓ Quarta-feira - Dia de sorteio da Loteria Federal' };
  if (dia === 0) return { ok: true, texto: '✓ Domingo - Dia de sorteio da Loteria Federal' };
  return { ok: false, texto: '⚠️ A Loteria Federal sorteia apenas às quartas e aos domingos.' };
}

export default function EditarRifa() {
  const router = useRouter();
  const { rifaId } = router.query;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [rifa, setRifa] = useState(null);
  const [temVendas, setTemVendas] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', logo_url: '', data_sorteio: '', valor_bilhete: '' });
  const [premios, setPremios] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('usuario');
    if (!u) {
      router.push('/login');
      return;
    }
    if (!rifaId) return;

    (async () => {
      try {
        const resp = await fetch(`/api/rifas/${rifaId}`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Erro ao carregar rifa');
        setRifa(data.rifa);
        setTemVendas((data.bilhetes || []).some(b => b.status_venda !== 'nao_vendido'));
        setForm({
          titulo: data.rifa.titulo || '',
          descricao: data.rifa.descricao || '',
          logo_url: data.rifa.logo_url || '',
          data_sorteio: paraInputData(data.rifa.data_sorteio),
          valor_bilhete: data.rifa.valor_bilhete,
        });
        setPremios((data.premios || []).map(p => ({
          id: p.id,
          descricao: p.descricao || '',
          valor_estimado: p.valor_estimado ?? '',
          imagem: p.imagem_url || '',
        })));
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [rifaId, router]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const alterarPremio = (i, campo, valor) => {
    const novos = [...premios];
    novos[i] = { ...novos[i], [campo]: valor };
    setPremios(novos);
  };

  const imagemPremio = async (i, file) => {
    if (!file) return;
    try {
      alterarPremio(i, 'imagem', await processarImagem(file));
    } catch {
      alert('Erro ao processar a imagem. Tente outra.');
    }
  };

  const moverPremio = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= premios.length) return;
    const novos = [...premios];
    [novos[i], novos[j]] = [novos[j], novos[i]];
    setPremios(novos);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!mensagemDia(form.data_sorteio).ok) {
      setErro('A data do sorteio deve ser uma quarta-feira ou um domingo (Loteria Federal).');
      return;
    }
    setSalvando(true);
    try {
      const resp = await fetch(`/api/rifas/${rifaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, premios }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Erro ao salvar');
      alert('Rifa atualizada com sucesso!');
      router.push(`/rifa/${rifaId}`);
    } catch (e2) {
      setErro(e2.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <Layout title="Editar Rifa">
        <div className="flex items-center justify-center min-h-screen"><div className="spinner"></div></div>
      </Layout>
    );
  }

  if (!rifa) {
    return (
      <Layout title="Editar Rifa">
        <div className="container mx-auto px-4 py-8">
          <div className="card bg-red-50 text-red-800">{erro || 'Rifa não encontrada'}</div>
          <Link href="/gerenciador/dashboard" className="btn btn-secondary mt-4 inline-block">← Voltar</Link>
        </div>
      </Layout>
    );
  }

  const bloqueada = rifa.status === 'concluido';
  const dia = mensagemDia(form.data_sorteio);

  return (
    <Layout title="Editar Rifa">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href={`/rifa/${rifaId}`} className="text-blue-600 hover:text-blue-800">← Voltar para a rifa</Link>
          <h1 className="text-3xl font-bold mt-2">✏️ Editar Rifa</h1>
        </div>

        {erro && <div className="card bg-red-50 text-red-800 mb-6">{erro}</div>}

        {bloqueada ? (
          <div className="card bg-yellow-50 text-yellow-800">Esta rifa já foi sorteada e não pode mais ser editada.</div>
        ) : (
          <form onSubmit={salvar} className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">📋 Informações Básicas</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Título da Rifa *</label>
                  <input type="text" name="titulo" value={form.titulo} onChange={alterar} className="input" required disabled={salvando} />
                  <p className="text-xs text-gray-500 mt-1">O link público da rifa continua o mesmo.</p>
                </div>

                <div>
                  <label className="label">Descrição</label>
                  <textarea name="descricao" value={form.descricao} onChange={alterar} className="input" rows="3" disabled={salvando} />
                </div>

                <div>
                  <label className="label">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input"
                    disabled={salvando}
                    onChange={async (e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      try {
                        setForm({ ...form, logo_url: await processarImagem(f) });
                      } catch {
                        alert('Erro ao processar a imagem. Tente outra.');
                      }
                    }}
                  />
                  {form.logo_url && (
                    <div className="mt-2 flex items-center gap-4">
                      <img src={form.logo_url} alt="Logo" className="h-20 object-contain border rounded" />
                      <button type="button" className="text-red-600 text-sm" onClick={() => setForm({ ...form, logo_url: '' })}>
                        Remover logo
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Data do Sorteio *</label>
                    <input
                      type="date"
                      name="data_sorteio"
                      value={form.data_sorteio}
                      onChange={alterar}
                      className={`input ${form.data_sorteio ? (dia.ok ? 'border-green-500 border-2' : 'border-red-500 border-2') : ''}`}
                      required
                      disabled={salvando}
                    />
                    {dia.texto && (
                      <p className={`text-sm mt-1 ${dia.ok ? 'text-green-700' : 'text-red-700'}`}>{dia.texto}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Valor do Bilhete (R$) *</label>
                    <input
                      type="number"
                      name="valor_bilhete"
                      value={form.valor_bilhete}
                      onChange={alterar}
                      className="input"
                      min="0.01"
                      step="0.01"
                      required
                      disabled={salvando || temVendas}
                    />
                    {temVendas && (
                      <p className="text-xs text-gray-500 mt-1">Não pode mudar: já existem bilhetes vendidos.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">🏆 Prêmios</h2>
              <div className="space-y-4">
                {premios.map((p, i) => (
                  <div key={p.id || `novo-${i}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{i + 1}º Prêmio</span>
                      <div className="flex gap-2 text-sm">
                        <button type="button" onClick={() => moverPremio(i, -1)} disabled={i === 0} className="px-2 disabled:opacity-30">▲</button>
                        <button type="button" onClick={() => moverPremio(i, 1)} disabled={i === premios.length - 1} className="px-2 disabled:opacity-30">▼</button>
                        {premios.length > 1 && (
                          <button type="button" onClick={() => setPremios(premios.filter((_, k) => k !== i))} className="text-red-600">
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={p.descricao}
                      onChange={(e) => alterarPremio(i, 'descricao', e.target.value)}
                      className="input mb-2"
                      placeholder="Descrição do prêmio"
                      required
                      disabled={salvando}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="input"
                      onChange={(e) => imagemPremio(i, e.target.files[0])}
                      disabled={salvando}
                    />
                    {p.imagem && (
                      <div className="mt-2 flex items-center gap-4">
                        <img src={p.imagem} alt="Prêmio" className="h-20 object-contain border rounded" />
                        <button type="button" className="text-red-600 text-sm" onClick={() => alterarPremio(i, 'imagem', '')}>
                          Remover imagem
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {premios.length < MAX_PREMIOS && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPremios([...premios, { descricao: '', valor_estimado: '', imagem: '' }])}
                  >
                    + Adicionar prêmio
                  </button>
                )}
              </div>
            </div>

            <div className="card bg-gray-50 text-sm text-gray-700">
              <p className="font-semibold mb-1">Não editável (os números da sorte já foram gerados):</p>
              <p>
                {rifa.qtde_bilhetes} bilhetes · {rifa.qtde_blocos} blocos de {rifa.bilhetes_por_bloco} ·
                sorteio por {rifa.tipo_sorteio === 'dezena' ? 'dezena' : 'centena'} ·
                valor atual {formatarValor(rifa.valor_bilhete)}
              </p>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1" disabled={salvando}>
                {salvando ? 'Salvando...' : '💾 Salvar alterações'}
              </button>
              <Link href={`/rifa/${rifaId}`} className="btn btn-secondary">Cancelar</Link>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
