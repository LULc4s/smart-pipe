import { AlertTriangle, TrendingDown, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Problem = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Vazão Inadequada",
      description: "Vazão muito alta pode indicar vazamentos e desperdícios. Vazão muito baixa prejudica o funcionamento de chuveiros e máquinas de lavar.",
    },
    {
      icon: Droplets,
      title: "Falta de Água",
      description: "A falta de água interrompe atividades diárias e pode fazer com que a medição do registro seja imprecisa, levando a um aumento irreal no valor da conta de água.",
    },
    {
      icon: TrendingDown,
      title: "Abordagem Reativa",
      description: "Sem monitoramento inteligente, você só descobre problemas hidráulicos quando já causaram danos, resultando em reparos caros e inesperados.",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Por que um Sistema Inteligente?
          </h2>
          <p className="text-lg text-muted-foreground">
            O controle de vazão da água é crucial em ambientes residenciais. Sem monitoramento adequado, problemas hidráulicos causam prejuízos financeiros significativos e desperdício de recursos naturais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-background border-border">
              <problem.icon className="h-12 w-12 mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
