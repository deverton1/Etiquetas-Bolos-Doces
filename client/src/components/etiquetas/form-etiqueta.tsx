import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Printer, 
  Save, 
  Trash2,
  Plus,
} from "lucide-react";
import { type Etiqueta, type NutrienteAdicional } from "@shared/schema";
import { getDataAtual, calcularDataValidade } from "@/lib/utils/dates";
import NutrienteInput from "./nutriente-input";
import TooltipHelper from "../ui/tooltip-helper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormEtiquetaProps {
  etiqueta: Etiqueta | null;
  onSubmit: (data: Etiqueta) => void;
  onPrint: () => void;
  isSaving: boolean;
  hideImprimir?: boolean;
}

// Schema de validação do formulário
const formSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  dataFabricacao: z.string().min(1, "Selecione a data de fabricação"),
  dataValidade: z.string().min(1, "Selecione a data de validade"),
  porcao: z.coerce.number().positive("Deve ser maior que zero"),
  unidadePorcao: z.string(),
  valorEnergetico: z.coerce.number().positive("Deve ser maior que zero"),
  unidadeEnergetico: z.string(),
  carboidratos: z.coerce.number().min(0, "Não pode ser negativo"),
  acucares: z.coerce.number().min(0, "Não pode ser negativo"),
  proteinas: z.coerce.number().min(0, "Não pode ser negativo"),
  gordurasTotais: z.coerce.number().min(0, "Não pode ser negativo"),
  gordurasSaturadas: z.coerce.number().min(0, "Não pode ser negativo"),
  sodio: z.coerce.number().min(0, "Não pode ser negativo"),
  fibras: z.coerce.number().min(0, "Não pode ser negativo"),
  nutrientesAdicionais: z.array(z.object({
    id: z.number().optional(),
    nome: z.string().min(1, "Digite o nome do nutriente"),
    valor: z.coerce.number().min(0, "Não pode ser negativo"),
    unidade: z.string()
  })).optional()
});

export default function FormEtiqueta({ etiqueta, onSubmit, onPrint, isSaving, hideImprimir = false }: FormEtiquetaProps) {
  const [nutrientesAdicionais, setNutrientesAdicionais] = useState<NutrienteAdicional[]>([]);
  
  // Configuração do formulário com valores padrão
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      dataFabricacao: getDataAtual(),
      dataValidade: calcularDataValidade(getDataAtual()),
      porcao: 100,
      unidadePorcao: "g",
      valorEnergetico: 250,
      unidadeEnergetico: "kcal",
      carboidratos: 35,
      acucares: 22,
      proteinas: 4,
      gordurasTotais: 12,
      gordurasSaturadas: 6,
      sodio: 120,
      fibras: 1.5,
      nutrientesAdicionais: []
    }
  });
  
  // Preencher o formulário quando uma etiqueta é selecionada para edição
  useEffect(() => {
    if (etiqueta) {
      form.reset({
        id: etiqueta.id,
        nome: etiqueta.nome,
        descricao: etiqueta.descricao,
        dataFabricacao: etiqueta.dataFabricacao,
        dataValidade: etiqueta.dataValidade,
        porcao: etiqueta.porcao,
        unidadePorcao: etiqueta.unidadePorcao,
        valorEnergetico: etiqueta.valorEnergetico,
        unidadeEnergetico: etiqueta.unidadeEnergetico,
        carboidratos: etiqueta.carboidratos,
        acucares: etiqueta.acucares,
        proteinas: etiqueta.proteinas,
        gordurasTotais: etiqueta.gordurasTotais,
        gordurasSaturadas: etiqueta.gordurasSaturadas,
        sodio: etiqueta.sodio,
        fibras: etiqueta.fibras,
        nutrientesAdicionais: etiqueta.nutrientesAdicionais || []
      });
      
      if (etiqueta.nutrientesAdicionais) {
        setNutrientesAdicionais(etiqueta.nutrientesAdicionais);
      } else {
        setNutrientesAdicionais([]);
      }
    } else {
      form.reset({
        nome: "",
        descricao: "",
        dataFabricacao: getDataAtual(),
        dataValidade: calcularDataValidade(getDataAtual()),
        porcao: 100,
        unidadePorcao: "g",
        valorEnergetico: 250,
        unidadeEnergetico: "kcal",
        carboidratos: 35,
        acucares: 22,
        proteinas: 4,
        gordurasTotais: 12,
        gordurasSaturadas: 6,
        sodio: 120,
        fibras: 1.5,
        nutrientesAdicionais: []
      });
      setNutrientesAdicionais([]);
    }
  }, [etiqueta, form]);
  
  // Atualizar data de validade quando a data de fabricação mudar
  const handleDataFabricacaoChange = (value: string) => {
    if (value) {
      const novaDataValidade = calcularDataValidade(value);
      form.setValue("dataValidade", novaDataValidade);
    }
  };
  
  // Adicionar um novo nutriente personalizado
  const adicionarNutriente = () => {
    const novoNutriente = {
      nome: "",
      valor: 0,
      unidade: "mg"
    };
    
    setNutrientesAdicionais([...nutrientesAdicionais, novoNutriente]);
  };
  
  // Atualizar um nutriente adicional específico
  const atualizarNutriente = (index: number, key: keyof NutrienteAdicional, value: any) => {
    const novosNutrientes = [...nutrientesAdicionais];
    novosNutrientes[index] = {
      ...novosNutrientes[index],
      [key]: value
    };
    
    setNutrientesAdicionais(novosNutrientes);
    form.setValue("nutrientesAdicionais", novosNutrientes);
  };
  
  // Remover um nutriente adicional
  const removerNutriente = (index: number) => {
    const novosNutrientes = nutrientesAdicionais.filter((_, i) => i !== index);
    setNutrientesAdicionais(novosNutrientes);
    form.setValue("nutrientesAdicionais", novosNutrientes);
  };
  
  // Verificar erros no formulário
  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Erros de validação:", form.formState.errors);
    }
  }, [form.formState.errors]);
  
  // Processar envio do formulário
  const onFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Garantir que os nutrientes adicionais sejam incluídos
    data.nutrientesAdicionais = nutrientesAdicionais;
    onSubmit(data as Etiqueta);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary mb-4 border-b-2 border-primary pb-2">
        Informações do Produto
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Informações Básicas */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary font-medium">Nome do Bolo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Bolo de Chocolate com Morango" 
                    {...field} 
                    className="focus-visible:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary font-medium">Detalhes do Sabor</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ex: Delicioso bolo de chocolate com recheio de morango e cobertura de ganache." 
                    rows={2}
                    {...field} 
                    className="focus-visible:ring-primary resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dataFabricacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary font-medium">Data de Fabricação</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="focus-visible:ring-primary"
                      onChange={(e) => {
                        field.onChange(e);
                        handleDataFabricacaoChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dataValidade"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                    <FormLabel className="text-secondary font-medium">Data de Validade</FormLabel>
                    <TooltipHelper 
                      text="A validade padrão é de 5 dias após a fabricação, mas você pode ajustar conforme necessário."
                    />
                  </div>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Tabela Nutricional */}
          <div className="mt-4">
            <div className="flex items-center gap-1 mb-4 border-b border-primary-light pb-2">
              <h3 className="text-lg font-semibold text-secondary">Tabela Nutricional</h3>
              <TooltipHelper 
                text="Adicione os valores nutricionais para uma porção do seu bolo."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="porcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary font-medium">Tamanho da porção</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="w-2/3 rounded-r-none focus-visible:ring-primary"
                            min={0}
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="unidadePorcao"
                          render={({ field }) => (
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-1/3 rounded-l-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="valorEnergetico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-secondary font-medium">Valor Energético</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="w-2/3 rounded-r-none focus-visible:ring-primary"
                            min={0}
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="unidadeEnergetico"
                          render={({ field }) => (
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-1/3 rounded-l-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kcal">kcal</SelectItem>
                                <SelectItem value="kJ">kJ</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carboidratos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Carboidratos (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="acucares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Açúcares (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="proteinas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Proteínas (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gordurasTotais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Gorduras Totais (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gordurasSaturadas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Gorduras Saturadas (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sodio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Sódio (mg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fibras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary font-medium">Fibras (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        className="focus-visible:ring-primary"
                        min={0}
                        step="0.1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mb-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="mt-7 flex items-center w-full bg-primary hover:bg-primary/90 text-secondary"
                  onClick={adicionarNutriente}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Nutriente
                </Button>
              </div>
            </div>
            
            {/* Nutrientes Adicionais */}
            {nutrientesAdicionais.length > 0 && (
              <div className="mt-4 space-y-4">
                <h4 className="font-medium text-secondary">Nutrientes Adicionais</h4>
                {nutrientesAdicionais.map((nutriente, index) => (
                  <NutrienteInput
                    key={index}
                    index={index}
                    nutriente={nutriente}
                    onUpdate={atualizarNutriente}
                    onRemove={removerNutriente}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-wrap justify-between gap-3 mt-6">
            {/* Botão de visualizar omitido, pois a visualização é em tempo real */}
            {!hideImprimir && (
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1 bg-primary hover:bg-primary/90 text-secondary" 
                onClick={onPrint}
              >
                <Printer className="mr-2 h-4 w-4" /> Imprimir
              </Button>
            )}
            
            <Button 
              type="submit" 
              className={`flex-1 bg-secondary hover:bg-secondary/90 text-white ${hideImprimir ? 'w-full' : ''}`}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Salvando...' : (etiqueta?.id ? 'Atualizar' : 'Salvar')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 text-secondary" 
              onClick={() => form.reset()}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Limpar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
