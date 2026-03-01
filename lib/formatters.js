/**
 * Funções de Formatação (Cliente-Safe)
 *
 * Este arquivo contém apenas funções de formatação que podem ser
 * usadas tanto no servidor quanto no cliente (navegador)
 */

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

/**
 * Gera slug de URL amigável a partir de um texto
 * @param {string} texto - Texto para converter
 * @returns {string} Slug (ex: "rifa-beneficente-natal-2024")
 */
export function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default {
  formatarTelefone,
  formatarValor,
  formatarData,
  calcularEstatisticas,
  gerarSlug,
};
