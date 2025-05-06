/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 */
export function formatarDataBR(data: Date | string | null | undefined): string {
  if (!data) return '';
  
  try {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj instanceof Date && !isNaN(dataObj.getTime())
      ? dataObj.toLocaleDateString('pt-BR')
      : '';
  } catch {
    return '';
  }
}

/**
 * Retorna a data atual no formato YYYY-MM-DD para inputs date
 */
export function getDataAtual(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calcula a data de validade baseada na data de fabricação
 * @param dataFabricacao Data de fabricação
 * @param diasValidade Quantidade de dias para validade (padrão: 5)
 * @returns Data de validade no formato YYYY-MM-DD
 */
export function calcularDataValidade(dataFabricacao: string, diasValidade: number = 5): string {
  try {
    const dataFab = new Date(dataFabricacao);
    if (isNaN(dataFab.getTime())) {
      return '';
    }
    
    const dataValidade = new Date(dataFab);
    dataValidade.setDate(dataFab.getDate() + diasValidade);
    return dataValidade.toISOString().split('T')[0];
  } catch {
    return '';
  }
}
