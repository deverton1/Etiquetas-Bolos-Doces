import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface HeaderProps extends HTMLAttributes<HTMLElement> {}

export default function Header({ className, ...props }: HeaderProps) {
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };
  
  return (
    <header className={cn("bg-secondary text-white shadow-md", className)} {...props}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="h-14 bg-primary rounded-lg p-1 mr-2 flex items-center">
                <img 
                  src="/images/logo-doces-mara.png" 
                  alt="Logo Doces Mara" 
                  className="h-12 object-contain"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-serif ml-2">Doces Mara</h1>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/">
              <h2 className="text-lg md:text-xl font-sans cursor-pointer hover:text-primary transition-colors">
                Gerador de Etiquetas
              </h2>
            </Link>
            <Link href="/ajuda">
              <span className="text-sm md:text-base font-sans cursor-pointer hover:text-primary transition-colors">
                Ajuda
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/90">
                  {user?.email}
                </span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-1" />
                      Sair
                    </>
                  )}
                </Button>
              </div>
            )}
          </nav>
        </div>
        <div className="text-xs text-white/80 flex flex-col md:flex-row justify-between">
          <p>Rua Francisco Marengo 1735 - São Paulo - CEP 03313000</p>
          <p>Tel: (11) 9 7083-6151 / (11) 9 8148-2372 - Instagram: @docesmaratatuape</p>
        </div>
      </div>
    </header>
  );
}
