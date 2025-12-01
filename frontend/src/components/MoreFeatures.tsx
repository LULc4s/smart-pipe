import { Shield, Activity, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const MoreFeatures = () => {
  const additionalFeatures = [
    {
      icon: Activity,
      title: "Verificação de Medidor",
      description: "Sistema compara a medição do medidor da residência com a vazão de água real da tubulação para verificar se o medidor está realizando a medição condizente com a realidade.",
      tag: "UC05",
    },
    {
      icon: CheckCircle,
      title: "Sistema de Monitoramento",
      description: "Sistema embarcado conectado a um aplicativo web para mostrar dados em tempo real e emitir alertas ao usuário de forma imediata.",
      tag: "RFN03",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-background border-border">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                {feature.tag}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
