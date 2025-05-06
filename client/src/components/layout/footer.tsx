import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Facebook, Heart, Instagram, MessageCircle } from "lucide-react";

interface FooterProps extends HTMLAttributes<HTMLElement> {}

export default function Footer({ className, ...props }: FooterProps) {
  return (
    <footer className={cn("bg-secondary text-white py-4 mt-8", className)} {...props}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-serif">Doces Mara</h2>
            <p className="text-sm">Confeitaria Artesanal</p>
          </div>
          
          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} Doces Mara - Todos os direitos reservados</p>
            <p className="flex items-center justify-center md:justify-end gap-1 mt-1">
              Feito com <Heart className="w-4 h-4 text-red-500 fill-red-500" /> por Francisco Everton Rabelo
            </p>
            <div className="mt-2 flex justify-center md:justify-end gap-3">
              <a href="https://www.instagram.com/docesmaratatuape" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/5511970836151" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
