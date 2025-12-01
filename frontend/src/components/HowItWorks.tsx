import { Card } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Monitoramento Contínuo",
      description: "Sensores coletam dados em tempo real sobre vazão da água, identificando qualquer variação anormal na tubulação.",
    },
    {
      number: "02",
      title: "Detecção Inteligente",
      description: "O ESP32 processa os dados instantaneamente, detectando vazão inadequada e falta de água no sistema.",
    },
    {
      number: "03",
      title: "Alertas em Tempo Real",
      description: "Sistema web envia notificações imediatas sobre anomalias, permitindo ação rápida antes que problemas se agravem.",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground">
            Monitoramento inteligente: da detecção aos alertas em tempo real
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 relative hover:shadow-lg transition-shadow bg-background border-border">
              <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
