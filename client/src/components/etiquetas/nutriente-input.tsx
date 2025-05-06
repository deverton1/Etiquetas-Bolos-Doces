import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { type NutrienteAdicional } from "@shared/schema";

interface NutrienteInputProps {
  index: number;
  nutriente: NutrienteAdicional;
  onUpdate: (index: number, key: keyof NutrienteAdicional, value: any) => void;
  onRemove: (index: number) => void;
}

export default function NutrienteInput({ index, nutriente, onUpdate, onRemove }: NutrienteInputProps) {
  const [nome, setNome] = useState(nutriente.nome || "");
  const [valor, setValor] = useState(nutriente.valor || 0);
  const [unidade, setUnidade] = useState(nutriente.unidade || "mg");
  
  // Atualizar o estado quando as props mudarem
  useEffect(() => {
    setNome(nutriente.nome || "");
    setValor(nutriente.valor || 0);
    setUnidade(nutriente.unidade || "mg");
  }, [nutriente]);
  
  // Atualizar o nutriente quando os campos mudarem
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoNome = e.target.value;
    setNome(novoNome);
    onUpdate(index, "nome", novoNome);
  };
  
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoValor = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setValor(novoValor);
    onUpdate(index, "valor", novoValor);
  };
  
  const handleUnidadeChange = (novaUnidade: string) => {
    setUnidade(novaUnidade);
    onUpdate(index, "unidade", novaUnidade);
  };
  
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
        <label className="block text-sm text-secondary font-medium mb-1">
          Nome do Nutriente
        </label>
        <Input 
          value={nome}
          onChange={handleNomeChange}
          placeholder="Ex: Vitamina C"
          className="focus-visible:ring-primary w-full"
        />
      </div>
      
      <div className="col-span-4">
        <label className="block text-sm text-secondary font-medium mb-1">
          Valor
        </label>
        <div className="flex">
          <Input 
            type="number"
            value={valor}
            onChange={handleValorChange}
            placeholder="0"
            min={0}
            step="0.1"
            className="focus-visible:ring-primary w-2/3 rounded-r-none"
          />
          <Select value={unidade} onValueChange={handleUnidadeChange}>
            <SelectTrigger className="w-1/3 rounded-l-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mg">mg</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="µg">µg</SelectItem>
              <SelectItem value="UI">UI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="col-span-3">
        <label className="block text-sm text-secondary font-medium mb-1">
          Ação
        </label>
        <Button 
          type="button"
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Remover
        </Button>
      </div>
    </div>
  );
}
