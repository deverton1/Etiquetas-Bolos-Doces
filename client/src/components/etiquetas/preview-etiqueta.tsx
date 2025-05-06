import { useRef, useEffect, useState } from "react";
import { type Etiqueta, type NutrienteAdicional } from "@shared/schema";
import { formatarDataBR } from "@/lib/utils/dates";
import { calcularVD } from "@/lib/utils/nutritionCalc";

interface PreviewEtiquetaProps {
  etiqueta: Etiqueta | null;
  tamanho: 'P' | 'M';
  tamanhoImpressora?: string;
  modoPB?: boolean;
  isPreviewImpressao?: boolean;
}

export default function PreviewEtiqueta({ 
  etiqueta, 
  tamanho, 
  tamanhoImpressora = "80mm", 
  modoPB = false,
  isPreviewImpressao = false
}: PreviewEtiquetaProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [defaultValues] = useState<Etiqueta>({
    id: 0,
    nome: "Nome do Bolo",
    descricao: "Detalhes do sabor do bolo aparecerão aqui",
    dataFabricacao: new Date().toISOString().split('T')[0],
    dataValidade: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    porcao: "100",
    unidadePorcao: "g",
    valorEnergetico: "250",
    unidadeEnergetico: "kcal",
    carboidratos: "35",
    acucares: "22",
    proteinas: "4",
    gordurasTotais: "12",
    gordurasSaturadas: "6",
    sodio: "120",
    fibras: "1.5",
    dataCriacao: new Date(),
    nutrientesAdicionais: [] as NutrienteAdicional[]
  });
  
  // Aplicar escala com base no tamanho
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.style.transform = tamanho === 'P' ? 'scale(0.85)' : 'scale(1)';
      previewRef.current.style.transformOrigin = 'top left';
    }
  }, [tamanho]);
  
  // Valores a serem exibidos (etiqueta atual ou valores padrão)
  const display = etiqueta || defaultValues;
  
  // Classes para impressão
  const impressaoClasses = isPreviewImpressao 
    ? `etiqueta-print-container tamanho-${tamanhoImpressora} ${modoPB ? 'impressao-pb' : ''}`
    : "";
  
  return (
    <div 
      ref={previewRef}
      id="etiquetaPreview" 
      className={`preview-etiqueta nome-bolo border-2 border-secondary rounded-md p-4 bg-white min-h-[500px] shadow-md transition-transform ${impressaoClasses}`}
    >
      {/* Cabeçalho */}
      <div className="text-center mb-4 pb-2 border-b border-primary/50">
        <div className="font-serif text-2xl text-secondary">Doces Mara</div>
        <p className="text-sm text-secondary/70">Confeitaria Artesanal</p>
      </div>
      
      {/* Conteúdo da Etiqueta */}
      <div>
        <h3 className="text-xl font-bold text-secondary text-center mb-2">
          {display.nome}
        </h3>
        <p className="text-sm text-secondary/80 mb-3 text-center italic">
          {display.descricao}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <p className="font-semibold text-secondary">Data de Fabricação:</p>
            <p className="text-secondary/80">{formatarDataBR(display.dataFabricacao)}</p>
          </div>
          <div>
            <p className="font-semibold text-secondary">Validade:</p>
            <p className="text-secondary/80">{formatarDataBR(display.dataValidade)}</p>
          </div>
        </div>
        
        {/* Tabela Nutricional */}
        <div className="border border-secondary/30 rounded-md overflow-hidden">
          <div className="bg-primary text-secondary font-bold text-center py-1">
            INFORMAÇÃO NUTRICIONAL
          </div>
          <div className="p-2 text-sm">
            <p className="mb-1 text-xs">
              Porção de {display.porcao}{display.unidadePorcao} (1 fatia)
            </p>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-secondary/30">
                  <th className="text-left py-1 pr-1 text-secondary">Nutrientes</th>
                  <th className="text-right py-1 text-secondary">Quantidade</th>
                  <th className="text-right py-1 pl-1 text-secondary">VD%*</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80">Valor Energético</td>
                  <td className="text-right py-1">{display.valorEnergetico} {display.unidadeEnergetico}</td>
                  <td className="text-right py-1 pl-1">{calcularVD('energetico', display.valorEnergetico)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80">Carboidratos</td>
                  <td className="text-right py-1">{display.carboidratos}g</td>
                  <td className="text-right py-1 pl-1">{calcularVD('carboidratos', display.carboidratos)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80 pl-2">Açúcares</td>
                  <td className="text-right py-1">{display.acucares}g</td>
                  <td className="text-right py-1 pl-1">-</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80">Proteínas</td>
                  <td className="text-right py-1">{display.proteinas}g</td>
                  <td className="text-right py-1 pl-1">{calcularVD('proteinas', display.proteinas)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80">Gorduras Totais</td>
                  <td className="text-right py-1">{display.gordurasTotais}g</td>
                  <td className="text-right py-1 pl-1">{calcularVD('gorduras', display.gordurasTotais)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80 pl-2">Gorduras Saturadas</td>
                  <td className="text-right py-1">{display.gordurasSaturadas}g</td>
                  <td className="text-right py-1 pl-1">{calcularVD('gordurasSaturadas', display.gordurasSaturadas)}%</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1 text-secondary/80">Fibras</td>
                  <td className="text-right py-1">{display.fibras}g</td>
                  <td className="text-right py-1 pl-1">{calcularVD('fibras', display.fibras)}%</td>
                </tr>
                <tr>
                  <td className="py-1 text-secondary/80">Sódio</td>
                  <td className="text-right py-1">{display.sodio}mg</td>
                  <td className="text-right py-1 pl-1">{calcularVD('sodio', display.sodio)}%</td>
                </tr>
                {/* Nutrientes Adicionais */}
                {display.nutrientesAdicionais && Array.isArray(display.nutrientesAdicionais) && display.nutrientesAdicionais.map((nutriente: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 text-secondary/80">
                      {nutriente?.nome || ''}
                    </td>
                    <td className="text-right py-1">
                      {nutriente?.valor || 0}{nutriente?.unidade || 'g'}
                    </td>
                    <td className="text-right py-1 pl-1">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <p className="mt-2 text-xs text-secondary/80">
              *Valores Diários de referência com base em uma dieta de 2.000 kcal.
            </p>
          </div>
        </div>
        
        {/* Rodapé da Etiqueta */}
        <div className="mt-3 text-xs text-center text-secondary/80">
          <p>DOCES MARA</p>
          <p>Rua Francisco Marengo 1735 - São Paulo - CEP 03313000</p>
          <p>Tel: (11) 9 7083-6151 / (11) 9 8148-2372 - @docesmaratatuape</p>
        </div>
      </div>
    </div>
  );
}
