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
    
    // Criar um elemento para impressão
    const printContainer = document.createElement('div');
    printContainer.className = 'etiqueta-print-container';
    document.body.appendChild(printContainer);
    
    // Criar um componente específico para impressão com a etiqueta selecionada
    const printEtiqueta = document.createElement('div');
    printEtiqueta.className = `preview-etiqueta tamanho-${tamanhoImpressora} ${modoPB ? 'impressao-pb' : ''}`;
    
    // Clonar apenas o conteúdo da etiqueta atual (não o preview)
    const previewContent = etiquetaPreviewRef.current?.querySelector('[data-is-etiqueta="true"]')?.cloneNode(true);
    
    if (previewContent) {
      printEtiqueta.appendChild(previewContent);
      printContainer.appendChild(printEtiqueta);
    
      // Aplicar estilos para impressão diretamente
      printEtiqueta.style.display = 'block';
      printEtiqueta.style.visibility = 'visible';
      printEtiqueta.style.backgroundColor = 'white';
      printEtiqueta.style.color = 'black';
      printEtiqueta.style.padding = '0';
      printEtiqueta.style.margin = '0';
      
      // Imprimir e depois remover o elemento
      setTimeout(() => {
        window.print();
        
        // Remover o elemento após a impressão
        setTimeout(() => {
          document.body.removeChild(printContainer);
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
                  <h2 className="text-xl font-semibold text-secondary border-b-2 border-primary pb-2">
                    Visualização da Etiqueta
                  </h2>
                  <div className="flex items-center gap-2 no-print">
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
