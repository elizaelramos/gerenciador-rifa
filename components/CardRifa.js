import Link from 'next/link';
import { formatarData } from '../lib/formatters';

const STATUS = {
  preparacao: { texto: 'Em preparação', classe: 'bg-amber-100 text-amber-800' },
  distribuido: { texto: 'Vendas abertas', classe: 'bg-emerald-100 text-emerald-800' },
  concluido: { texto: 'Sorteada', classe: 'bg-gray-200 text-gray-700' },
};

// Dias até o sorteio, usando só AAAA-MM-DD (evita erro de fuso)
function diasParaSorteio(data) {
  const s = String(data || '').split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [a, m, d] = s.split('-').map(Number);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((new Date(a, m - 1, d) - hoje) / 86400000);
}

function textoContagem(dias) {
  if (dias === null || dias < 0) return null;
  if (dias === 0) return 'É hoje!';
  if (dias === 1) return 'Amanhã';
  return `Faltam ${dias} dias`;
}

const formatarReal = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CardRifa({ rifa }) {
  const status = STATUS[rifa.status] || { texto: rifa.status, classe: 'bg-blue-100 text-blue-800' };
  const link = `/rifa/${rifa.slug || rifa.id}`;
  const contagem = rifa.status !== 'concluido' ? textoContagem(diasParaSorteio(rifa.data_sorteio)) : null;
  const total = Number(rifa.qtde_bilhetes) || 0;
  const vendidos = Number(rifa.bilhetes_vendidos) || 0;
  const pct = total ? Math.min(100, Math.round((vendidos / total) * 100)) : 0;
  const outrosPremios = Math.max(0, Number(rifa.total_premios || 0) - 1);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Capa com a logo da rifa */}
      <Link href={link} className="relative block h-48 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        {rifa.logo_url && (
          <img
            src={rifa.logo_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-40 blur-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="relative flex h-full items-center justify-center p-6">
          {rifa.logo_url ? (
            <div className="flex h-32 max-w-[80%] items-center justify-center rounded-2xl bg-white p-3 shadow-xl transition duration-300 group-hover:scale-105">
              <img src={rifa.logo_url} alt={`Logo da rifa ${rifa.titulo}`} className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="text-7xl drop-shadow-lg transition duration-300 group-hover:scale-110">🎟️</div>
          )}
        </div>

        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow ${status.classe}`}>
          {status.texto}
        </span>
        {contagem && (
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700 shadow">
            ⏳ {contagem}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-xl font-bold leading-snug text-gray-900">{rifa.titulo}</h3>
        {rifa.descricao && <p className="mb-4 line-clamp-2 text-sm text-gray-600">{rifa.descricao}</p>}

        {rifa.premio_principal && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-3 ring-1 ring-amber-200">
            {rifa.premio_principal_imagem ? (
              <img src={rifa.premio_principal_imagem} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg bg-white object-cover" />
            ) : (
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-2xl">🏆</span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">1º prêmio</p>
              <p className="truncate font-semibold text-gray-900">{rifa.premio_principal}</p>
              {outrosPremios > 0 && (
                <p className="text-xs text-gray-600">+ {outrosPremios} {outrosPremios === 1 ? 'outro prêmio' : 'outros prêmios'}</p>
              )}
            </div>
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-gray-500">📅 Sorteio</p>
            <p className="font-semibold text-gray-900">{formatarData(rifa.data_sorteio)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-gray-500">💵 Bilhete</p>
            <p className="font-semibold text-emerald-600">{formatarReal(rifa.valor_bilhete)}</p>
          </div>
        </div>

        {total > 0 && rifa.status !== 'preparacao' && (
          <div className="mb-5">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>{vendidos} de {total} bilhetes vendidos</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <Link href={link} className="btn btn-primary flex-1 text-center">
            Ver Detalhes
          </Link>
          <Link href={`/validacao?rifaId=${rifa.slug || rifa.id}`} className="btn btn-secondary text-center">
            Validar
          </Link>
        </div>
      </div>
    </article>
  );
}
