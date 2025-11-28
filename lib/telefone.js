/**
 * Utilitários para formatação e validação de telefones brasileiros
 */

/**
 * Formata um telefone no padrão brasileiro: DD XXXXX-XXXX ou DD XXXX-XXXX
 * @param {string} valor - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export function formatarTelefone(valor) {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const numeroLimitado = numeros.slice(0, 11);

  // Formata: DD XXXXX-XXXX ou DD XXXX-XXXX
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
}

/**
 * Valida se um telefone brasileiro é válido
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export function validarTelefone(telefone) {
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
}

/**
 * Remove a formatação do telefone, deixando apenas números
 * @param {string} telefone - Telefone formatado
 * @returns {string} - Apenas os números do telefone
 */
export function limparTelefone(telefone) {
  return telefone.replace(/\D/g, '');
}
