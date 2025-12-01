import { Button } from "@/components/ui/button";
import { Mail, Github } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Proteja Sua Residência
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Economize água, evite prejuízos e tenha controle total do sistema hidráulico da sua casa
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 py-6 text-lg"
            >
              <Mail className="mr-2 h-5 w-5" />
              Entrar em Contato
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Ver no GitHub
            </Button>
          </div>

          <div className="border-t border-primary-foreground/20 pt-8">
            <p className="text-sm text-primary-foreground/80 mb-2">Projeto Acadêmico</p>
            <p className="text-xs text-primary-foreground/70">
              Instituto Federal de Educação, Ciência e Tecnologia da Paraíba - Campus Campina Grande
            </p>
            <p className="text-xs text-primary-foreground/70 mt-2">
              Curso Superior de Bacharelado em Engenharia de Computação - Técnicas de Prototipagem 2025.2
            </p>
            <p className="text-xs text-primary-foreground/70 mt-3">
              <strong>Docente:</strong> Moacy Pereira da Silva
            </p>
            <p className="text-xs text-primary-foreground/70 mt-1">
              <strong>Discentes:</strong> Emilieny de Souza Silva, Euler Pereira Sobral, José Ruan Serafim de Brito, Lucas Silva Tavares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
