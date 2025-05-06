import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogDescription, 
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Printer, Save, Cpu, Database, FileText } from "lucide-react";

interface DocumentacaoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Documentacao({ isOpen, onClose }: DocumentacaoProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-semibold text-secondary">
              Documentação e Ajuda
            </DialogTitle>
            <DialogClose className="text-secondary hover:text-secondary/80">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          <DialogDescription>
            Guia completo para usar o Gerador de Etiquetas da Doces Mara
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="como-usar" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-6">
            <TabsTrigger value="como-usar">Como Usar</TabsTrigger>
            <TabsTrigger value="dicas">Dicas</TabsTrigger>
            <TabsTrigger value="tecnico">Informações Técnicas</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh]">
            <TabsContent value="como-usar" className="p-6 pt-4">
              <h3 className="text-lg font-medium text-secondary mb-3">Como usar o Gerador de Etiquetas</h3>
              <ol className="list-decimal pl-6 space-y-3 text-secondary">
                <li>Preencha o <strong>Nome do Bolo</strong> e os <strong>Detalhes do Sabor</strong> nos campos correspondentes.</li>
                <li>Defina a <strong>Data de Fabricação</strong> - a data de validade será calculada automaticamente, mas pode ser ajustada.</li>
                <li>Preencha os valores da <strong>Tabela Nutricional</strong>. Você pode adicionar nutrientes personalizados se necessário.</li>
                <li>A etiqueta será atualizada em tempo real no painel de visualização à direita.</li>
                <li>Use os botões <strong>P</strong> e <strong>M</strong> para alternar entre tamanhos de etiqueta.</li>
                <li>Clique em <strong>Imprimir</strong> para imprimir a etiqueta ou salvá-la como PDF.</li>
                <li>Use o botão <strong>Salvar</strong> para guardar o modelo de etiqueta para uso futuro.</li>
                <li>Na seção "Etiquetas Salvas", você pode visualizar, editar ou excluir etiquetas anteriores.</li>
              </ol>

              <div className="flex justify-end mt-6">
                <Link href="/ajuda">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ver documentação completa
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="dicas" className="p-6 pt-4">
              <h3 className="text-lg font-medium text-secondary mb-3">Dicas</h3>
              <ul className="list-disc pl-6 space-y-3 text-secondary">
                <li>A <strong>Validade</strong> padrão é de 5 dias após a fabricação.</li>
                <li>Os <strong>Valores Diários (VD%)</strong> são calculados automaticamente com base nos valores recomendados.</li>
                <li>Você pode reutilizar etiquetas salvas clicando nelas na seção "Etiquetas Salvas".</li>
                <li>Para adicionar um nutriente personalizado, clique no botão "Adicionar Nutriente".</li>
                <li>Use a opção de impressão para salvar em PDF se desejar enviar a etiqueta digitalmente.</li>
                <li>Certifique-se de que todos os campos obrigatórios estejam preenchidos antes de salvar.</li>
                <li>Para uma melhor visualização na impressão, use o tamanho que melhor se adeque ao seu papel.</li>
                <li>Navegadores modernos como Chrome, Firefox e Edge oferecem opções de impressão para salvar como PDF.</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="tecnico" className="p-6 pt-4">
              <h3 className="text-lg font-medium text-secondary mb-3">Informações Técnicas</h3>
              <p className="text-secondary mb-3">Este sistema foi desenvolvido usando:</p>
              <ul className="list-disc pl-6 space-y-2 text-secondary">
                <li className="flex items-start gap-2">
                  <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Frontend:</strong> React com TypeScript, Tailwind CSS e Shadcn UI para uma interface moderna e responsiva
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Database className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Backend:</strong> Node.js, Express e PostgreSQL para armazenamento seguro de etiquetas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Printer className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Impressão:</strong> Funcionalidades otimizadas para impressão com CSS específico
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Save className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Armazenamento:</strong> Sistema de persistência completo para salvar e recuperar etiquetas
                  </span>
                </li>
              </ul>
              
              <h4 className="text-md font-medium text-secondary mt-4 mb-2">Requisitos e compatibilidade:</h4>
              <ul className="list-disc pl-6 space-y-1 text-secondary">
                <li>Compatível com navegadores modernos (Chrome, Firefox, Safari, Edge)</li>
                <li>Funciona em dispositivos móveis e desktops</li>
                <li>Conexão com internet para salvar e recuperar dados</li>
                <li>Não requer instalação ou plugins adicionais</li>
              </ul>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
