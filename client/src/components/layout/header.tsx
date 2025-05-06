import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface HeaderProps extends HTMLAttributes<HTMLElement> {}

export default function Header({ className, ...props }: HeaderProps) {
  return (
    <header className={cn("bg-secondary text-white shadow-md", className)} {...props}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-2">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
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
