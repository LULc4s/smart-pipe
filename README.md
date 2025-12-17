
# Smart-Pipe

O smart-pipe é um sistema de Internet das Coisas (IoT) voltado para o monitoramento de tubulações, integrando hardware, inteligência artificial e uma interface web.
O sistema é composto por três partes principais que trabalham juntas:
1. Hardware (Sensores): Utilizando um microcontrolador da família esp-32, um sensor de vazão YS-103 e um móduto RTC  (Real Time Clocking).
2. Inteligência Artificial: O sistema utilza uma rede neuaral para prever o estágio da vazão da água na tubulação.
3. Interface e Controle: O projeto apresenta uma interface para alertar e interarigr com o usuário

## Como o projeto pode ser executado?

Para executar o esp-32, instale o platform.io no VSCode e rode o Build e depois veja o serial do sistema.  

Para executar o frontend: 
``` 
cd frontend
npm run dev  
```
Para executar o backend: 
``` 
cd backend
npm run dev:ws  
``` 
