import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Printer, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ConfigsImpressaoProps {
  onPrint: () => void;
  tamanhoSelecionado: string;
  modoPB: boolean;
  onChangeTamanho: (tamanho: string) => void;
  onChangeModoPB: (modo: boolean) => void;
}

export default function ConfigsImpressao({
  onPrint,
  tamanhoSelecionado,
  modoPB,
  onChangeTamanho,
  onChangeModoPB,
}: ConfigsImpressaoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Settings2 className="h-4 w-4" />
            <span>Config. Impressão</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium text-secondary">Configurações de Impressão</h4>
            
            <div className="space-y-2">
              <Label className="text-secondary">Tamanho da Impressora Térmica</Label>
              <RadioGroup
                defaultValue="80mm"
                value={tamanhoSelecionado}
                onValueChange={onChangeTamanho}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="80mm" id="r1" />
                  <Label htmlFor="r1">80mm (Padrão)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="76mm" id="r2" />
                  <Label htmlFor="r2">76mm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="58mm" id="r3" />
                  <Label htmlFor="r3">58mm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="57mm" id="r4" />
                  <Label htmlFor="r4">57mm</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="modo-pb" className="text-secondary">
                Impressão em Preto e Branco
              </Label>
              <Switch
                id="modo-pb"
                checked={modoPB}
                onCheckedChange={onChangeModoPB}
              />
            </div>
            
            <Button
              variant="default"
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-secondary"
              onClick={() => {
                setOpen(false);
                onPrint();
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Etiqueta
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        onClick={onPrint}
        variant="outline"
        size="sm"
        className="gap-1"
      >
        <Printer className="h-4 w-4" />
        <span>Imprimir</span>
      </Button>
    </div>
  );
}