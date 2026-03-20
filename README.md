# catalogo-cac
Catálogo completo com todos os vídeos do Cadê a Chave. Dá pra maratonar, salvar o progresso, ganhar medalhas e reviver vídeos antigos na Cápsula do Tempo. 

Criei esse projeto porque queria um jeito mais legal e organizado de rever os mais de 10 anos de vídeos do Leon e da Nilce no Cadê a Chave. O YouTube é ótimo, mas aqui a ideia é ter um acervo focado, onde a gente consegue acompanhar o que já viu, ganhar umas medalhas e achar quadros específicos rapidinho, sem se perder no algoritmo.

## O que tem de legal aqui?

* **Tudo organizado:** Os vídeos estão separados por ano e pelos quadros clássicos (Estou com Sorte, Cadecast, CACA, Nem te conto, etc.).
* **Seu Progresso:** O site salva direto no seu navegador (via `localStorage`, sem precisar criar conta) os vídeos que você já marcou como visto. Tem até uma barrinha de progresso pra ver quanto falta pra "zerar" o canal.
* **Conquistas:** Assista aos vídeos e vá desbloqueando medalhas de fã.
* **Modo Maratona:** Clicou no botão, o site sorteia um vídeo aleatório que você ainda não assistiu.
* **Cápsula do Tempo:** Mostra exatamente quais vídeos foram postados no dia de hoje, só que em anos anteriores.

## Como foi feito

Fiz tudo usando **HTML, CSS e JavaScript puro (Vanilla)**. A ideia era não depender de frameworks pesados e manter o código limpo e rápido. 

O visual foi todo pensado pra lembrar um aplicativo nativo no celular, usando efeitos de vidro (glassmorphism). Todos os dados dos vídeos vêm de um arquivo `videos.json` e o progresso do usuário não precisa de banco de dados, fica tudo no `localStorage`.

## Como rodar na sua máquina

Como o JavaScript faz um `fetch` para ler o arquivo `videos.json`, você não pode simplesmente dar dois cliques no `index.html` (o navegador vai bloquear por causa das regras de CORS). 

Pra rodar direitinho:
1. Faça o clone deste repositório.
2. Abra a pasta no seu editor (tipo o VS Code).
3. Use a extensão **Live Server** (ou qualquer outro servidor local simples) pra rodar o projeto.

## Disclaimer

Esse é um projeto não-oficial, feito 100% de fã pra fã como forma de praticar programação e homenagear o canal. Todos os direitos dos vídeos, imagens e marcas pertencem ao Leon Martins e à Nilce Moretto.
