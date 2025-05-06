import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Printer, Save, List, HelpCircle, Database } from "lucide-react";

export default function Ajuda() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Card className="bg-white rounded-lg shadow-md">
          <CardContent className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-primary">
              <h1 className="text-2xl font-semibold text-secondary">Documentação e Ajuda</h1>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>Voltar para o início</span>
                </Button>
              </Link>
            </div>
            
            <section className="mb-8">
              <h2 className="text-xl font-medium text-secondary mb-4">Como usar o Gerador de Etiquetas</h2>
              <ol className="list-decimal pl-6 space-y-3 text-secondary">
                <li>Preencha o <strong>Nome do Bolo</strong> e os <strong>Detalhes do Sabor</strong> nos campos correspondentes.</li>
                <li>Defina a <strong>Data de Fabricação</strong> - a data de validade será calculada automaticamente, mas pode ser ajustada.</li>
                <li>Preencha os valores da <strong>Tabela Nutricional</strong>. Você pode adicionar nutrientes personalizados se necessário.</li>
                <li>Clique em <strong>Visualizar</strong> para ver como a etiqueta ficará.</li>
                <li>Use os botões <strong>P</strong> e <strong>M</strong> para alternar entre tamanhos de etiqueta.</li>
                <li>Clique em <strong>Imprimir</strong> para imprimir a etiqueta ou salvá-la como PDF.</li>
                <li>Use o botão <strong>Salvar</strong> para guardar o modelo de etiqueta para uso futuro.</li>
              </ol>
            </section>
            
            <Separator className="my-6" />
            
            <section className="mb-8">
              <h2 className="text-xl font-medium text-secondary mb-4">Dicas</h2>
              <ul className="list-disc pl-6 space-y-3 text-secondary">
                <li>A <strong>Validade</strong> padrão é de 5 dias após a fabricação.</li>
                <li>Os <strong>Valores Diários (VD%)</strong> são calculados automaticamente com base nos valores recomendados.</li>
                <li>Você pode reutilizar etiquetas salvas clicando nelas na seção "Etiquetas Salvas".</li>
                <li>Para adicionar um nutriente personalizado, clique no botão "Adicionar Nutriente".</li>
                <li>Use a opção de impressão para salvar em PDF se desejar enviar a etiqueta digitalmente.</li>
              </ul>
            </section>
            
            <Separator className="my-6" />
            
            <section className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-medium text-secondary mb-4">Principais Funcionalidades</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <Printer className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary">Impressão</p>
                      <p className="text-sm text-secondary/80">Imprima etiquetas ou salve em PDF para uso posterior</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Save className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary">Salvar modelos</p>
                      <p className="text-sm text-secondary/80">Armazene suas etiquetas para reutilização</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <List className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary">Tabela nutricional</p>
                      <p className="text-sm text-secondary/80">Personalize informações nutricionais com valores precisos</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-secondary">Documentação detalhada</p>
                      <p className="text-sm text-secondary/80">Acesse a ajuda a qualquer momento para tirar dúvidas</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-medium text-secondary mb-4">Informações Técnicas</h2>
                <p className="text-secondary mb-3">Este sistema foi desenvolvido usando:</p>
                <ul className="list-disc pl-6 space-y-2 text-secondary">
                  <li>React com TypeScript para interface moderna e responsiva</li>
                  <li>Tailwind CSS e Shadcn UI para estilização elegante</li>
                  <li>Banco de dados PostgreSQL para armazenamento seguro</li>
                  <li>Express.js para serviços de backend robustos</li>
                  <li>Funcionalidades de impressão e exportação otimizadas</li>
                  <li>Validação de dados para garantir informações precisas</li>
                </ul>
                
                <div className="mt-6 flex gap-3 items-center p-3 bg-accent/50 rounded-md">
                  <Database className="w-5 h-5 text-secondary flex-shrink-0" />
                  <p className="text-sm text-secondary">
                    Seus dados são armazenados com segurança e podem ser acessados em qualquer dispositivo.
                  </p>
                </div>
              </div>
            </section>
            
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
