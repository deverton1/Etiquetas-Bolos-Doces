import { useEffect, useState } from "react"; // ADICIONADO useEffect
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Schema de validação do formulário
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Tipo para o formulário
type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading, error, isAuthenticated } = useAuth(); // ADICIONADO isAuthenticated
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Configuração do formulário com validação
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Efeito para redirecionar após autenticação bem-sucedida
  useEffect(() => {
    if (isAuthenticated) {
      // Atraso para garantir que a toast apareça e que React conclua o ciclo de renderização
      const timer = setTimeout(() => {
        setLocation("/");
      }, 500); // 500ms de atraso, ajuste se necessário

      return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
    }
  }, [isAuthenticated, setLocation]); // Dependências: isAuthenticated e setLocation

  // Submissão do formulário
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // A toast será exibida aqui
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      // REMOVIDO setLocation("/"); daqui, agora é no useEffect
    } catch (err) {
      // O erro já é tratado pelo hook useAuth e exibido via {error && <Alert ...>}
      // Console.log aqui apenas para depuração adicional se necessário
      console.error("Erro na submissão do login:", err);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">DOCES MARA</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu.email@exemplo.com"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua senha"
                        {...field}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Sistema de Etiquetas DOCES MARA
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}