import { Card } from "@/components/ui/card";
import { Cpu, Gauge, Clock } from "lucide-react";

export const TechSpecs = () => {
  const specs = [
    {
      icon: Cpu,
      name: "Microcontrolador ESP32",
      description: "Processador de alta performance com conectividade WiFi e Bluetooth integrados",
      price: "R$ 48,00",
    },
    {
      icon: Gauge,
      name: "Sensor de Fluxo YF-S201",
      description: "Sensor de vazão de água 1/2\" com tecnologia de efeito Hall para medições precisas",
      price: "R$ 30,00",
    },
    {
      icon: Clock,
      name: "RTC DS3231",
      description: "Real Time Clock de alta precisão para sincronização temporal dos dados",
      price: "R$ 30,00",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Especificações Técnicas
          </h2>
          <p className="text-lg text-muted-foreground">
            Hardware profissional de qualidade para monitoramento confiável
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {specs.map((spec, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
                <spec.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{spec.name}</h3>
              <p className="text-muted-foreground mb-4">{spec.description}</p>
              <div className="text-2xl font-bold text-primary">{spec.price}</div>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 p-8 bg-card rounded-lg border border-border">
          <div className="text-center">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Investimento Total</div>
            <div className="text-4xl font-bold text-primary mb-4">R$ 108,00</div>
            <p className="text-muted-foreground">
              Solução completa e acessível para transformar o monitoramento de água da sua residência
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
