import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Adicionar fonte Playfair Display e Montserrat do Google Fonts
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap";
document.head.appendChild(link);

// Adicionar título
const title = document.createElement("title");
title.textContent = "Gerador de Etiquetas - Doces Mara";
document.head.appendChild(title);

// Adicionar meta description para SEO
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Crie etiquetas personalizadas para os bolos da doceria Doces Mara com informações nutricionais editáveis. Sistema completo para gerenciar suas etiquetas.";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
