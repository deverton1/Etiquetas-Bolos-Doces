/**
 * Valores diários de referência para cálculos
 * Baseados em uma dieta de 2000 kcal
 */
export const valoresDiariosReferencia = {
  energetico: 2000, // kcal
  carboidratos: 300, // g
  proteinas: 75, // g
  gorduras: 55, // g
  gordurasSaturadas: 22, // g
  fibras: 25, // g
  sodio: 2400 // mg
};

/**
 * Calcula o percentual do valor diário com base no valor nutricional
 * @param nutriente Nome do nutriente
 * @param valor Valor do nutriente
 * @returns Percentual do valor diário
 */
export function calcularVD(nutriente: string, valor: number | string): number | '-' {
  // Converte o valor para número se for string
  const valorNumerico = typeof valor === 'string' ? Number(valor) : valor;
  
  // Verifica se o valor é válido e se o nutriente tem valor diário de referência
  if (
    valorNumerico === undefined || 
    isNaN(valorNumerico) || 
    !valoresDiariosReferencia[nutriente as keyof typeof valoresDiariosReferencia]
  ) {
    return '-';
  }
  
  // Calcula o percentual
  const vdReferencia = valoresDiariosReferencia[nutriente as keyof typeof valoresDiariosReferencia];
  return Math.round((valorNumerico / vdReferencia) * 100);
}
