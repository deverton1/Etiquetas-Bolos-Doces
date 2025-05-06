import React from 'react';
import { Printer, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import TooltipHelper from '@/components/ui/tooltip-helper';

interface ConfigsImpressaoProps {
  onPrint: () => void;
  tamanhoSelecionado: string;
  modoPB: boolean;
  mostrarTabela: boolean;
  onChangeTamanho: (tamanho: string) => void;
  onChangeModoPB: (modo: boolean) => void;
  onChangeMostrarTabela: (mostrar: boolean) => void;
}

export default function ConfigsImpressao({
  onPrint,
  tamanhoSelecionado,
  modoPB,
  mostrarTabela,
  onChangeTamanho,
  onChangeModoPB,
  onChangeMostrarTabela
}: ConfigsImpressaoProps) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-secondary">Configurações de Impressão</h4>
              <p className="text-sm text-muted-foreground">
                Ajuste as configurações para melhor impressão da etiqueta
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label htmlFor="pb-mode">Impressão em Preto e Branco</Label>
                  <TooltipHelper text="Use esta opção para impressoras que não suportam cores" />
                </div>
                <Switch
                  id="pb-mode"
                  checked={modoPB}
                  onCheckedChange={onChangeModoPB}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label htmlFor="mostrar-tabela">Imprimir Tabela Nutricional</Label>
                  <TooltipHelper text="Desative para imprimir etiquetas sem a tabela nutricional" />
                </div>
                <Switch
                  id="mostrar-tabela"
                  checked={mostrarTabela}
                  onCheckedChange={onChangeMostrarTabela}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tamanho da Impressora</Label>
              <RadioGroup 
                value={tamanhoSelecionado} 
                onValueChange={onChangeTamanho}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="80mm" id="r1" />
                  <Label htmlFor="r1">Impressora Padrão (80mm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="58mm" id="r2" />
                  <Label htmlFor="r2">Impressora Térmica Pequena (58mm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="80mm-mini" id="r3" />
                  <Label htmlFor="r3">Formato Compacto (80mm reduzido)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button variant="default" size="sm" onClick={onPrint} className="bg-primary hover:bg-primary/90 text-secondary">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );
}