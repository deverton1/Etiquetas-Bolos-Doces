import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { type Etiqueta } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface ListaEtiquetasProps {
  etiquetas: Etiqueta[];
  isLoading: boolean;
  onEdit: (etiqueta: Etiqueta) => void;
  onDelete: (id: number) => void;
}

export default function ListaEtiquetas({ etiquetas, isLoading, onEdit, onDelete }: ListaEtiquetasProps) {
  const [etiquetaParaExcluir, setEtiquetaParaExcluir] = useState<number | null>(null);
  const [termoPesquisa, setTermoPesquisa] = useState<string>('');
  
  // Filtra as etiquetas com base no termo de pesquisa
  const etiquetasFiltradas = useMemo(() => {
    if (!termoPesquisa.trim()) return etiquetas;
    
    const termoLowerCase = termoPesquisa.toLowerCase();
    return etiquetas.filter(etiqueta => 
      etiqueta.nome.toLowerCase().includes(termoLowerCase) || 
      etiqueta.descricao.toLowerCase().includes(termoLowerCase)
    );
  }, [etiquetas, termoPesquisa]);
  
  const handleEdit = (etiqueta: Etiqueta) => {
    onEdit(etiqueta);
    
    // Rolar para o topo da página para visualizar o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const confirmarExclusao = (id: number) => {
    setEtiquetaParaExcluir(id);
  };
  
  const cancelarExclusao = () => {
    setEtiquetaParaExcluir(null);
  };
  
  const confirmarEExcluir = () => {
    if (etiquetaParaExcluir !== null) {
      onDelete(etiquetaParaExcluir);
      setEtiquetaParaExcluir(null);
    }
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold text-secondary border-b-2 border-primary pb-2">
          Etiquetas Salvas
        </h2>
        
        <div className="relative mt-2 sm:mt-0 w-full sm:w-64">
          <Input
            type="text"
            placeholder="Pesquisar etiquetas..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="pr-8 pl-3 py-1 border-primary/30 focus:border-primary"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary/50" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Esqueletos de carregamento
          Array.from({ length: 3 }).map((_, index) => (
            <Card 
              key={`skeleton-${index}`} 
              className="border border-gray-200 rounded-md p-3"
            >
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-end mt-2">
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))
        ) : etiquetasFiltradas.length === 0 && termoPesquisa.trim() !== '' ? (
          // Mensagem quando não encontrar resultados na pesquisa
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
            <p className="text-secondary/70 text-lg mb-2">Nenhuma etiqueta encontrada</p>
            <p className="text-secondary/50">
              Não encontramos nenhuma etiqueta com o termo <strong>"{termoPesquisa}"</strong>
            </p>
          </div>
        ) : (
          // Lista de etiquetas
          <>
            {etiquetasFiltradas.map((etiqueta) => (
              <Card 
                key={etiqueta.id} 
                className="border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer transition-all"
                onClick={() => handleEdit(etiqueta)}
              >
                <h3 className="font-medium text-secondary">{etiqueta.nome}</h3>
                <p className="text-sm text-gray-600 truncate">{etiqueta.descricao}</p>
                <div className="flex justify-end mt-2 text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-secondary hover:text-secondary/90 mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(etiqueta);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmarExclusao(etiqueta.id!);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            {/* Card para nova etiqueta */}
            <Card 
              className="border border-dashed border-gray-300 rounded-md p-3 flex items-center justify-center cursor-pointer hover:border-primary transition-all"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="text-center">
                <Plus className="text-secondary/50 mx-auto mb-1 h-6 w-6" />
                <p className="text-secondary">Nova Etiqueta</p>
              </div>
            </Card>
          </>
        )}
      </div>
      
      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={etiquetaParaExcluir !== null} onOpenChange={cancelarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta etiqueta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={confirmarEExcluir}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
