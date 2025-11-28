/**
 * Lógica de Negócio do Sistema de Rifas
 *
 * Contém as funções principais:
 * - Geração aleatória de números da sorte
 * - Distribuição em blocos
 * - Lógica de sorteio (número mais próximo)
 */

import { getBilheteByNumero } from './db';

// ============================================
// GERAÇÃO DE NÚMEROS ALEATÓRIOS
// ============================================

/**
 * Algoritmo Fisher-Yates para embaralhar array
 * @param {Array} array - Array para embaralhar
 * @returns {Array} Array embaralhado
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Gera números da sorte aleatórios distribuídos em blocos
 *
 * @param {number} totalBilhetes - Total de bilhetes (ex: 100, 200, 10000)
 * @param {number} totalBlocos - Quantidade de blocos físicos
 * @param {string} tipoSorteio - 'dezena' ou 'milhar'
 * @returns {Array} Array de objetos com { blocoNumero, numeroSorte }
 */
export function gerarNumerosAleatorios(totalBilhetes, totalBlocos, tipoSorteio = 'dezena') {
  // Gerar sequência de números
  const numeros = [];
  const padding = tipoSorteio === 'milhar' ? 4 : 2;

  for (let i = 0; i < totalBilhetes; i++) {
    numeros.push(String(i).padStart(padding, '0'));
  }

  // Embaralhar números
  const numerosEmbaralhados = shuffle(numeros);

  // Distribuir em blocos
  const bilhetesPorBloco = Math.ceil(totalBilhetes / totalBlocos);
  const resultado = [];

  for (let blocoIdx = 0; blocoIdx < totalBlocos; blocoIdx++) {
    const blocoNumero = blocoIdx + 1;
    const inicio = blocoIdx * bilhetesPorBloco;
    const fim = Math.min(inicio + bilhetesPorBloco, totalBilhetes);

    for (let i = inicio; i < fim; i++) {
      resultado.push({
        blocoNumero,
        numeroSorte: numerosEmbaralhados[i],
      });
    }
  }

  return resultado;
}

// ============================================
// LÓGICA DE SORTEIO
// ============================================

/**
 * Extrai a dezena ou milhar do número sorteado da Loteria Federal
 *
 * @param {string} numeroLoteria - Número completo da loteria (ex: "87452")
 * @param {string} tipoSorteio - 'dezena' (2 dígitos) ou 'milhar' (4 dígitos)
 * @returns {string} Número extraído formatado (ex: "52" ou "7452")
 */
export function extrairNumeroSorte(numeroLoteria, tipoSorteio) {
  const numStr = String(numeroLoteria);

  if (tipoSorteio === 'dezena') {
    // Pega os 2 últimos dígitos
    return numStr.slice(-2).padStart(2, '0');
  } else if (tipoSorteio === 'milhar') {
    // Pega os 4 últimos dígitos
    return numStr.slice(-4).padStart(4, '0');
  }

  return numStr;
}

/**
 * Encontra o ganhador pelo critério de proximidade
 *
 * Regra: Se o número sorteado não foi vendido/pago, busca:
 * 1. O número POSTERIOR mais próximo que foi PAGO
 * 2. Se não houver, busca o número ANTERIOR mais próximo que foi PAGO
 *
 * @param {number} rifaId - ID da rifa
 * @param {string} numeroSorteado - Número extraído da loteria (ex: "52")
 * @param {number} maxNum - Número máximo possível (ex: 99 para dezena, 9999 para milhar)
 * @returns {Object|null} Dados do ganhador ou null
 */
export async function encontrarGanhadorPorProximidade(rifaId, numeroSorteado, maxNum) {
  const num = parseInt(numeroSorteado, 10);
  const totalNumeros = maxNum + 1; // Ex: 100 números (00-99) ou 10000 (0000-9999)

  let offset = 0;

  while (offset <= maxNum) {
    // 1. Verificar número POSTERIOR
    const posterior = (num + offset) % totalNumeros;
    const bilhetePosterior = await getBilheteByNumero(rifaId, formatNumber(posterior, maxNum));

    if (bilhetePosterior && bilhetePosterior.status_venda === 'pago') {
      return {
        numeroSorteadoOriginal: formatNumber(num, maxNum),
        numeroGanhador: formatNumber(posterior, maxNum),
        bilheteId: bilhetePosterior.id,
        compradorNome: bilhetePosterior.comprador_nome,
        compradorTelefone: bilhetePosterior.comprador_telefone,
        motivo: offset === 0 ? 'Número exato' : 'Posterior mais próximo',
        distancia: offset,
      };
    }

    // 2. Verificar número ANTERIOR (se offset > 0)
    if (offset > 0) {
      const anterior = (num - offset + totalNumeros) % totalNumeros;
      const bilheteAnterior = await getBilheteByNumero(rifaId, formatNumber(anterior, maxNum));

      if (bilheteAnterior && bilheteAnterior.status_venda === 'pago') {
        return {
          numeroSorteadoOriginal: formatNumber(num, maxNum),
          numeroGanhador: formatNumber(anterior, maxNum),
          bilheteId: bilheteAnterior.id,
          compradorNome: bilheteAnterior.comprador_nome,
          compradorTelefone: bilheteAnterior.comprador_telefone,
          motivo: 'Anterior mais próximo',
          distancia: offset,
        };
      }
    }

    offset++;
  }

  // Caso improvável: nenhum bilhete foi pago
  return null;
}

/**
 * Formata número com zeros à esquerda
 * @param {number} n - Número a formatar
 * @param {number} max - Número máximo (define o padding)
 * @returns {string} Número formatado
 */
function formatNumber(n, max) {
  const padding = String(max).length;
  return String(n).padStart(padding, '0');
}

// ============================================
// VALIDAÇÕES
// ============================================

/**
 * Valida se os dados de criação de rifa estão corretos
 * @param {Object} dados - Dados da rifa
 * @returns {Object} { valido: boolean, erros: Array }
 */
export function validarDadosRifa(dados) {
  const erros = [];

  if (!dados.titulo || dados.titulo.trim().length < 3) {
    erros.push('Título deve ter no mínimo 3 caracteres');
  }

  if (!dados.qtde_bilhetes || dados.qtde_bilhetes < 10) {
    erros.push('Quantidade de bilhetes deve ser no mínimo 10');
  }

  if (!dados.qtde_blocos || dados.qtde_blocos < 1) {
    erros.push('Quantidade de blocos deve ser no mínimo 1');
  }

  if (dados.qtde_blocos > dados.qtde_bilhetes) {
    erros.push('Quantidade de blocos não pode ser maior que quantidade de bilhetes');
  }

  if (!dados.valor_bilhete || dados.valor_bilhete <= 0) {
    erros.push('Valor do bilhete deve ser maior que zero');
  }

  if (!dados.data_sorteio) {
    erros.push('Data do sorteio é obrigatória');
  }

  if (!['dezena', 'milhar'].includes(dados.tipo_sorteio)) {
    erros.push('Tipo de sorteio deve ser "dezena" ou "milhar"');
  }

  // Validar compatibilidade entre qtde_bilhetes e tipo_sorteio
  if (dados.tipo_sorteio === 'dezena' && dados.qtde_bilhetes > 100) {
    erros.push('Para tipo "dezena", máximo de 100 bilhetes (00-99)');
  }

  if (dados.tipo_sorteio === 'milhar' && dados.qtde_bilhetes > 10000) {
    erros.push('Para tipo "milhar", máximo de 10.000 bilhetes (0000-9999)');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Valida dados de registro de venda
 * @param {Object} dados - Dados da venda
 * @returns {Object} { valido: boolean, erros: Array }
 */
export function validarDadosVenda(dados) {
  const erros = [];

  if (!dados.comprador_nome || dados.comprador_nome.trim().length < 2) {
    erros.push('Nome do comprador deve ter no mínimo 2 caracteres');
  }

  if (!dados.comprador_telefone || dados.comprador_telefone.length < 10) {
    erros.push('Telefone inválido');
  }

  if (!['pago', 'pendente'].includes(dados.status_venda)) {
    erros.push('Status de venda deve ser "pago" ou "pendente"');
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Formata telefone para exibição
 * @param {string} telefone - Telefone completo
 * @param {boolean} ocultarInicio - Se true, mostra apenas final
 * @returns {string} Telefone formatado
 */
export function formatarTelefone(telefone, ocultarInicio = false) {
  if (!telefone) return '';

  const apenasNumeros = telefone.replace(/\D/g, '');

  if (ocultarInicio) {
    return `****-${apenasNumeros.slice(-4)}`;
  }

  // Formato: (11) 98765-4321
  if (apenasNumeros.length === 11) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  }

  // Formato: (11) 8765-4321
  if (apenasNumeros.length === 10) {
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
  }

  return telefone;
}

/**
 * Formata valor em Reais
 * @param {number} valor - Valor numérico
 * @returns {string} Valor formatado (ex: "R$ 5,00")
 */
export function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata data para exibição
 * @param {string|Date} data - Data
 * @returns {string} Data formatada (ex: "24/12/2024")
 */
export function formatarData(data) {
  if (!data) return '';

  const d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Calcula estatísticas de vendas
 * @param {Array} bilhetes - Lista de bilhetes
 * @returns {Object} Estatísticas
 */
export function calcularEstatisticas(bilhetes) {
  const total = bilhetes.length;
  const pagos = bilhetes.filter(b => b.status_venda === 'pago').length;
  const pendentes = bilhetes.filter(b => b.status_venda === 'pendente').length;
  const naoVendidos = bilhetes.filter(b => b.status_venda === 'nao_vendido').length;

  return {
    total,
    pagos,
    pendentes,
    naoVendidos,
    percentualPago: total > 0 ? ((pagos / total) * 100).toFixed(2) : 0,
    percentualVendido: total > 0 ? (((pagos + pendentes) / total) * 100).toFixed(2) : 0,
  };
}

export default {
  gerarNumerosAleatorios,
  extrairNumeroSorte,
  encontrarGanhadorPorProximidade,
  validarDadosRifa,
  validarDadosVenda,
  formatarTelefone,
  formatarValor,
  formatarData,
  calcularEstatisticas,
};
