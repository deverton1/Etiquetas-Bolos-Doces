import { useState, useRef } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FormEtiqueta from "@/components/etiquetas/form-etiqueta";
import PreviewEtiqueta from "@/components/etiquetas/preview-etiqueta";
import ListaEtiquetas from "@/components/etiquetas/lista-etiquetas";
import ConfigsImpressao from "@/components/etiquetas/configs-impressao";
import { Card, CardContent } from "@/components/ui/card";
import Documentacao from "@/components/ui/documentacao";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Etiqueta } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatarDataBR } from "@/lib/utils/dates";
import { calcularVD } from "@/lib/utils/nutritionCalc";

export default function Home() {
  const [showDocs, setShowDocs] = useState(false);
  const [etiquetaAtual, setEtiquetaAtual] = useState<Etiqueta | null>(null);
  const [tamanhoPreview, setTamanhoPreview] = useState<'M' | 'P'>('M');
  const [tamanhoImpressora, setTamanhoImpressora] = useState<string>("80mm");
  const [modoPB, setModoPB] = useState<boolean>(false);
  const [mostrarTabela, setMostrarTabela] = useState<boolean>(true);
  const etiquetaPreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Buscar todas as etiquetas salvas
  const { data: etiquetasData = [], isLoading } = useQuery({
    queryKey: ['/api/etiquetas'],
  });
  
  // Converter para o tipo correto
  const etiquetas = etiquetasData as Etiqueta[];

  // Mutação para salvar uma etiqueta
  const { mutate: salvarEtiqueta, isPending: isSaving } = useMutation({
    mutationFn: async (etiqueta: Etiqueta) => {
      let url = '/api/etiquetas';
      let method = 'POST';
      
      if (etiqueta.id) {
        url = `/api/etiquetas/${etiqueta.id}`;
        method = 'PATCH';
      }
      
      const response = await apiRequest(method, url, etiqueta);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/etiquetas'] });
      toast({
        title: "Sucesso!",
        description: etiquetaAtual?.id 
          ? "Etiqueta atualizada com sucesso." 
          : "Etiqueta salva com sucesso.",
      });
      setEtiquetaAtual(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar etiqueta",
        description: error.message || "Ocorreu um erro ao salvar a etiqueta",
        variant: "destructive"
      });
    }
  });

  // Mutação para excluir uma etiqueta
  const { mutate: excluirEtiqueta } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/etiquetas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/etiquetas'] });
      toast({
        title: "Etiqueta excluída",
        description: "A etiqueta foi excluída com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir etiqueta",
        description: error.message || "Ocorreu um erro ao excluir a etiqueta",
        variant: "destructive"
      });
    }
  });

  const handleEtiquetaSubmit = (etiqueta: Etiqueta) => {
    salvarEtiqueta(etiqueta);
  };

  const handleEtiquetaEdit = (etiqueta: Etiqueta) => {
    setEtiquetaAtual(etiqueta);
  };

  const handleEtiquetaDelete = (id: number) => {
    excluirEtiqueta(id);
  };

  const handlePrint = () => {
    if (!etiquetaAtual) {
      toast({
        title: "Nenhuma etiqueta selecionada",
        description: "Selecione uma etiqueta da lista para imprimir.",
        variant: "destructive"
      });
      return;
    }
    
    // Remover qualquer contêiner de impressão anterior que possa existir
    const oldPrintContainer = document.getElementById('etiquetaPrintContainer');
    if (oldPrintContainer) {
      document.body.removeChild(oldPrintContainer);
    }
    
    // Criar um elemento para impressão
    const printContainer = document.createElement('div');
    printContainer.className = 'etiqueta-print-container';
    printContainer.id = 'etiquetaPrintContainer';
    
    // Criar um componente específico para impressão
    const printEtiqueta = document.createElement('div');
    printEtiqueta.className = `impressao-etiqueta tamanho-${tamanhoImpressora} ${modoPB ? 'impressao-pb' : ''}`;
    printEtiqueta.style.border = 'none';
    printEtiqueta.style.borderRadius = '0';
    printEtiqueta.style.boxShadow = 'none';
    
    // Criar conteúdo totalmente novo para a etiqueta (sem clonar o preview existente)
    const previewContent = document.createElement('div');
    previewContent.innerHTML = `
      <div class="etiqueta-impressao">
        <div class="text-center mb-4 pb-2 border-b border-primary/50">
          <div class="font-serif text-2xl text-secondary">Doces Mara</div>
          <p class="text-sm text-secondary/70">Confeitaria Artesanal</p>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-secondary text-center mb-2">
            ${etiquetaAtual.nome}
          </h3>
          <p class="text-sm text-secondary/80 mb-3 text-center italic">
            ${etiquetaAtual.descricao}
          </p>
          
          <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div>
              <p class="font-semibold text-secondary">Data de Fabricação:</p>
              <p class="text-secondary/80">${formatarDataBR(etiquetaAtual.dataFabricacao)}</p>
            </div>
            <div>
              <p class="font-semibold text-secondary">Validade:</p>
              <p class="text-secondary/80">${formatarDataBR(etiquetaAtual.dataValidade)}</p>
            </div>
          </div>
          
          ${mostrarTabela ? `
          <div class="border border-secondary/30 rounded-md overflow-hidden">
            <div class="bg-primary text-secondary font-bold text-center py-1">
              INFORMAÇÃO NUTRICIONAL
            </div>
            <div class="p-2 text-sm">
              <p class="mb-1 text-xs">
                Porção de ${etiquetaAtual.porcao}${etiquetaAtual.unidadePorcao} (1 fatia)
              </p>
              
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-secondary/30">
                    <th class="text-left py-1 pr-1 text-secondary">Nutrientes</th>
                    <th class="text-right py-1 text-secondary">Quantidade</th>
                    <th class="text-right py-1 pl-1 text-secondary">VD%*</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80">Valor Energético</td>
                    <td class="text-right py-1">${etiquetaAtual.valorEnergetico} ${etiquetaAtual.unidadeEnergetico}</td>
                    <td class="text-right py-1 pl-1">${calcularVD('energetico', etiquetaAtual.valorEnergetico)}%</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80">Carboidratos</td>
                    <td class="text-right py-1">${etiquetaAtual.carboidratos}g</td>
                    <td class="text-right py-1 pl-1">${calcularVD('carboidratos', etiquetaAtual.carboidratos)}%</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80 pl-2">Açúcares</td>
                    <td class="text-right py-1">${etiquetaAtual.acucares}g</td>
                    <td class="text-right py-1 pl-1">-</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80">Proteínas</td>
                    <td class="text-right py-1">${etiquetaAtual.proteinas}g</td>
                    <td class="text-right py-1 pl-1">${calcularVD('proteinas', etiquetaAtual.proteinas)}%</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80">Gorduras Totais</td>
                    <td class="text-right py-1">${etiquetaAtual.gordurasTotais}g</td>
                    <td class="text-right py-1 pl-1">${calcularVD('gorduras', etiquetaAtual.gordurasTotais)}%</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80 pl-2">Gorduras Saturadas</td>
                    <td class="text-right py-1">${etiquetaAtual.gordurasSaturadas}g</td>
                    <td class="text-right py-1 pl-1">${calcularVD('gordurasSaturadas', etiquetaAtual.gordurasSaturadas)}%</td>
                  </tr>
                  <tr class="border-b border-gray-200">
                    <td class="py-1 text-secondary/80">Fibras</td>
                    <td class="text-right py-1">${etiquetaAtual.fibras}g</td>
                    <td class="text-right py-1 pl-1">${calcularVD('fibras', etiquetaAtual.fibras)}%</td>
                  </tr>
                  <tr>
                    <td class="py-1 text-secondary/80">Sódio</td>
                    <td class="text-right py-1">${etiquetaAtual.sodio}mg</td>
                    <td class="text-right py-1 pl-1">${calcularVD('sodio', etiquetaAtual.sodio)}%</td>
                  </tr>
                  ${etiquetaAtual.nutrientesAdicionais && Array.isArray(etiquetaAtual.nutrientesAdicionais) ? 
                    etiquetaAtual.nutrientesAdicionais.map((nutriente: any, index: number) => `
                      <tr key=${index} class="border-b border-gray-200">
                        <td class="py-1 text-secondary/80">
                          ${nutriente?.nome || ''}
                        </td>
                        <td class="text-right py-1">
                          ${nutriente?.valor || 0}${nutriente?.unidade || 'g'}
                        </td>
                        <td class="text-right py-1 pl-1">-</td>
                      </tr>
                    `).join('') : ''
                  }
                </tbody>
              </table>
              
              <p class="mt-2 text-xs text-secondary/80">
                *Valores Diários de referência com base em uma dieta de 2.000 kcal.
              </p>
            </div>
          </div>
          ` : ''}
          
          <div class="mt-3 text-xs text-center text-secondary/80">
            <p>DOCES MARA</p>
            <p>Rua Francisco Marengo 1735 - São Paulo - CEP 03313000</p>
            <p>Tel: (11) 9 7083-6151 / (11) 9 8148-2372 - @docesmaratatuape</p>
          </div>
        </div>
      </div>
    `;
    
    if (previewContent) {
      printEtiqueta.appendChild(previewContent);
      printContainer.appendChild(printEtiqueta);
      document.body.appendChild(printContainer);
    
      // Aplicar estilos para impressão diretamente - Ajuste específico para evitar quadrado branco
      printContainer.style.width = tamanhoImpressora === '58mm' ? '58mm' : '80mm';
      printContainer.style.position = 'fixed';
      printContainer.style.left = '0';
      printContainer.style.top = '0';
      printContainer.style.border = 'none';
      printContainer.style.margin = '0';
      printContainer.style.padding = '0';
      printContainer.style.overflow = 'hidden';
      printContainer.style.zIndex = '999999';
      
      printEtiqueta.style.display = 'block';
      printEtiqueta.style.visibility = 'visible';
      printEtiqueta.style.backgroundColor = 'white';
      printEtiqueta.style.color = 'black';
      printEtiqueta.style.padding = '5mm';
      printEtiqueta.style.margin = '0';
      printEtiqueta.style.border = 'none';
      printEtiqueta.style.pageBreakAfter = 'avoid';
      printEtiqueta.style.pageBreakInside = 'avoid';
      
      // Adicionar evento de impressão para remover o elemento após a impressão
      const afterPrint = () => {
        if (document.body.contains(printContainer)) {
          document.body.removeChild(printContainer);
        }
        window.removeEventListener('afterprint', afterPrint);
      };
      
      window.addEventListener('afterprint', afterPrint);
      
      // Adicionar o elemento ao corpo do documento
      document.body.appendChild(printContainer);
      
      // Forçar um reflow antes de imprimir
      document.body.offsetHeight;
      
      // Imprimir o documento
      setTimeout(() => {
        window.print();
        
        // Backup para navegadores que não suportam o evento afterprint
        setTimeout(() => {
          if (document.body.contains(printContainer)) {
            document.body.removeChild(printContainer);
          }
        }, 1000);
      }, 200);
    }
  };
  
  const handleChangeTamanhoImpressora = (tamanho: string) => {
    setTamanhoImpressora(tamanho);
  };
  
  const handleChangeModoPB = (modo: boolean) => {
    setModoPB(modo);
  };
  
  const handleChangeMostrarTabela = (mostrar: boolean) => {
    setMostrarTabela(mostrar);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header className="no-print" />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <Card className="bg-white rounded-lg shadow-md mb-6">
          <CardContent className="p-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="no-print">
                <FormEtiqueta 
                  etiqueta={etiquetaAtual} 
                  onSubmit={handleEtiquetaSubmit}
                  onPrint={handlePrint}
                  isSaving={isSaving}
                  hideImprimir={true}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-secondary border-b-2 border-primary pb-2 titulo-preview no-print">
                    Visualização da Etiqueta
                  </h2>
                  <div className="flex items-center gap-2 no-print controles-preview">
                    <ConfigsImpressao
                      onPrint={handlePrint}
                      tamanhoSelecionado={tamanhoImpressora}
                      modoPB={modoPB}
                      mostrarTabela={mostrarTabela}
                      onChangeTamanho={handleChangeTamanhoImpressora}
                      onChangeModoPB={handleChangeModoPB}
                      onChangeMostrarTabela={handleChangeMostrarTabela}
                    />
                    <div>
                      <Button 
                        variant={tamanhoPreview === 'P' ? "default" : "outline"} 
                        onClick={() => setTamanhoPreview('P')} 
                        className="rounded-l-md rounded-r-none"
                      >
                        P
                      </Button>
                      <Button 
                        variant={tamanhoPreview === 'M' ? "default" : "outline"} 
                        onClick={() => setTamanhoPreview('M')} 
                        className="rounded-l-none rounded-r-md"
                      >
                        M
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div ref={etiquetaPreviewRef} id="etiquetaPreviewRef" className="no-print-preview">
                  <PreviewEtiqueta 
                    etiqueta={etiquetaAtual} 
                    tamanho={tamanhoPreview}
                    tamanhoImpressora={tamanhoImpressora}
                    modoPB={modoPB}
                    mostrarTabela={mostrarTabela}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-white rounded-lg shadow-md p-4 no-print mt-6">
          <ListaEtiquetas 
            etiquetas={etiquetas} 
            isLoading={isLoading}
            onEdit={handleEtiquetaEdit}
            onDelete={handleEtiquetaDelete}
          />
        </div>
      </main>
      
      <Footer className="no-print" />
      
      <Documentacao isOpen={showDocs} onClose={() => setShowDocs(false)} />
      
      <Button 
        onClick={() => setShowDocs(true)}
        className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 text-secondary w-12 h-12 rounded-full shadow-lg transition-all no-print p-0"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}
