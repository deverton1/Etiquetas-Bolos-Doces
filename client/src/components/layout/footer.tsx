import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

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
            <div className="mt-2 flex justify-center md:justify-end gap-3">
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
