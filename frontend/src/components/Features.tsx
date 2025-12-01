import { Card } from "@/components/ui/card";
import pressureIcon from "@/assets/pressure-icon.jpg";
import flowIcon from "@/assets/flow-icon.jpg";
import alertIcon from "@/assets/alert-icon.jpg";
import predictionIcon from "@/assets/prediction-icon.jpg";

export const Features = () => {
  const features = [
    {
      image: flowIcon,
      title: "Medição de Vazão em Tempo Real",
      description: "Sistema mede continuamente a vazão da água que está percorrendo a tubulação, fornecendo dados precisos e atualizados instantaneamente.",
      tag: "UC01",
    },
    {
      image: alertIcon,
      title: "Sistema de Alertas Inteligente",
      description: "Envia alertas imediatos quando detecta vazão muito alta ou baixa, e notifica quando falta água na tubulação, permitindo ação rápida antes que problemas se agravem.",
      tag: "UC02 / UC04",
    },
    {
      image: predictionIcon,
      title: "Predição de Consumo com IA",
      description: "Coleta amostras de dados da vazão de água durante uma semana e prevê qual será o valor da vazão na próxima semana, ajudando no planejamento e economia.",
      tag: "UC03",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Funcionalidades
          </h2>
          <p className="text-lg text-muted-foreground">
            Tecnologia avançada para monitoramento e controle inteligente da água
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow bg-card border-border">
              <div className="h-48 overflow-hidden bg-muted">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {feature.tag}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
