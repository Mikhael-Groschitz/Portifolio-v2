# Portifolio-v2

A segunda versão do meu portfólio, agora com cara de SQL Server Management Studio.

Sou engenheiro de dados e trabalho com SQL Server e T-SQL, então resolvi apresentar a minha trajetória do jeito que conheço melhor: como um banco de dados. Cada seção do site é uma tabela. Um clique no Object Explorer abre o script e o resultado aparece na grade, como numa consulta de verdade, só que nenhum SQL é executado de fato.

A versão atual continua no ar em [mgroschitz.dev](https://mgroschitz.dev) enquanto esta é construída.

## Status

Em construção. Na primeira visita de cada sessão aparece a tela Conectar ao Servidor: um clique em Conectar (ou um Enter) abre a janela do SSMS com a tabela da página já executada. Lá dentro, cada tabela do Object Explorer abre o próprio script T-SQL numa aba e executa na hora. A grade mostra os dados, a aba de mensagens mostra as linhas afetadas e o horário de conclusão, e a barra amarela acompanha o resultado. Cada seção tem o seu endereço (`/about`, `/tech-stack`, `/career`, `/projects`, `/beyond-the-terminal`, `/contact` e `/resume`), e a procedure `sp_DownloadCV` entrega o currículo em PDF. Para quem quer escrever as próprias consultas, a Nova Consulta (`/query`) tem destaque de sintaxe, autocomplete e o comando `HELP`. Para quem não conhece SQL, a Colinha lista as seções com um clique e traz exemplos prontos, e um tour de três passos mostra onde clicar. Também existem a paleta de cores (`/palette`) e a versão simples (`/simple`) com o conteúdo do portfólio, que volta para a janela com um clique. Cada página tem título, descrição e imagem de compartilhamento próprios, e o site tem `sitemap.xml` e `robots.txt`. Dá para navegar só pelo teclado ou com leitor de tela, e no celular a grade vira cartões.

## Stack

- Next.js 16 (App Router) com TypeScript em modo strict, gerando páginas estáticas
- CSS Modules
- Shiki para o destaque de sintaxe do T-SQL, no build e no navegador
- Vitest, ESLint e Prettier

## Rodando localmente

Precisa do Node.js 20.9 ou mais novo.

```powershell
npm install
npm run dev
```

O site abre em `http://localhost:3000`.

Um dos segredos do site leva à versão anterior do portfólio. O endereço dela vem da variável `NEXT_PUBLIC_V1_URL`: copie o `.env.example` para `.env.local` e preencha. Sem a variável, o segredo responde com uma mensagem amigável e ninguém sai da página. Como toda variável `NEXT_PUBLIC_`, ela entra no build, então depois de mudar é preciso reiniciar o `npm run dev` ou gerar o build de novo.

| Comando             | O que faz                          |
| ------------------- | ---------------------------------- |
| `npm run dev`       | ambiente de desenvolvimento        |
| `npm run build`     | build de produção                  |
| `npm run start`     | serve o build de produção          |
| `npm run lint`      | ESLint e verificação de formatação |
| `npm run format`    | formata o código com o Prettier    |
| `npm run typecheck` | checagem de tipos                  |
| `npm run test`      | testes                             |

## Estrutura

```text
src/
  app/          rotas
  components/   interface: janela, Object Explorer, editor, resultados e versão simples
  content/      todos os textos do site (globals.ts), em português e inglês
  engine/       interpretador dos comandos e mensagens de erro, em TypeScript puro
  game/         um segredo
  theme/        tokens de cor e tema do destaque de sintaxe
```

## Decisões de projeto

- Todas as cores vêm de `src/theme/tokens.css`. Os componentes usam as variáveis CSS e o tema do Shiki aponta para as mesmas variáveis, então mudar uma cor é mexer em um lugar só. Um teste garante que todos os tokens existem e que os pares de texto e fundo passam no contraste AA da WCAG.
- Estilos com CSS Modules; o CSS global fica só em `src/app/globals.css`.
- Fontes do sistema, sem nenhuma fonte embutida.
- Todos os textos do site ficam em `src/content/globals.ts`, um bloco por idioma. Um teste garante que os dois idiomas têm a mesma estrutura e que nomes, datas, links e tecnologias batem entre eles. A mesma fonte alimenta a versão simples e vai alimentar a grade de resultados.
- O site existe em português e inglês. Na primeira visita vale o idioma do sistema (o que não for português abre em inglês); depois, a escolha do visitante fica salva. Um `LanguageProvider` coordena a troca, que acontece no navegador, sem mudar a URL e sem piscar o idioma errado. Sem JavaScript, a página aparece em português.
- A interface do SSMS acompanha o idioma: em português aparecem Arquivo, Pesquisador de Objetos e Pronto; em inglês, File, Object Explorer e Ready.
- Os menus abrem como no SSMS. O que já tem função no site funciona (Arquivo > Nova Consulta, Exibir > Pesquisador de Objetos, Ferramentas > Idioma, Ajuda > Colinha, Fazer o tour e Versão simples) e o resto aparece esmaecido. Tudo funciona pelo teclado.
- No celular, o Object Explorer vira uma gaveta lateral e os menus menos usados se recolhem em um botão; a Ajuda continua à vista.
- O estado da interface usa só recursos do React (Context e `useReducer`), sem biblioteca extra.
- A URL manda na aba ativa: abrir uma tabela muda o endereço, e voltar, avançar ou recarregar a página leva sempre à aba certa. As abas abertas não se repetem e a última nunca fecha.
- A execução é simulada por um motor em TypeScript puro (`src/engine/execute.ts`), sem React e sem DOM. Não há parser de SQL: o motor separa o texto em comandos (por `;`, `GO` ou pelo começo de cada comando), ignora maiúsculas, espaços, comentários e colchetes, e procura cada comando num dicionário montado a partir do catálogo. Cada comando reconhecido devolve uma grade; o primeiro desconhecido devolve um erro no formato do SQL Server, com a linha em que está e uma dica de comando válido. A página de cada seção já sai do servidor com a grade preenchida, então o conteúdo está no HTML mesmo sem JavaScript.
- Os erros vêm de um pool de mensagens com referências a Doctor Who, Super Mario, Portal, Metal Gear Solid e Dark Souls (`src/engine/errors.ts`), em português e em inglês.
- Os segredos ficam num registro à parte (`src/engine/easter-eggs.ts`), consultado só quando o comando não é um dos conhecidos. Nenhum deles aparece no Pesquisador de Objetos, no HELP, na Colinha ou no autocomplete. O motor só descreve o efeito, e a interface cuida da animação e da navegação, sempre respeitando a preferência por menos movimento.
- A data de lançamento desta versão, usada por um dos segredos, fica em `V2_LAUNCH_DATE`, no mesmo arquivo. Por enquanto é provisória e muda para a data do deploy.
- O mini jogo, Symphony of the Database, fica em `src/game`, em TypeScript puro com canvas 2D. As pastas separam o que é lógica pura, testada sem navegador (`core`, `entities` e `levels`, com os mapas escritos em strings), do que desenha e conversa com a página (`render` e `ui`). Sprites, cenário, letreiro e fonte de pixel são arrays de strings desenhados em código, sem arquivos de imagem. Os números de dificuldade ficam todos em `src/game/balance.ts`. Projéteis, partículas e itens usam conjuntos fixos de objetos reaproveitados, então o jogo não cria objetos a cada quadro. O código só é baixado quando alguém abre o jogo e, ao sair, ele desliga o laço e os atalhos de teclado. Em aparelhos só de toque, uma mensagem explica que ele foi feito para teclado.
- A fase tem quatro salas ligadas por portas (`src/game/levels/stage.ts`): a entrada, montada juntando o Hall dos Racks e o Corredor dos Logs lado a lado, a sala do Garbage Collector, a escada e a sala do trono do Legacy System. Cada sala é um mapa próprio; a porta de uma sala com chefe só abre depois da luta, e um Crash recomeça da entrada da sala, com o chefe de volta ao início. Um teste percorre a entrada andando e pulando até a porta, e outro procura, com a física de verdade do personagem, um caminho de porta a porta na escada.
- Os dois chefes são máquinas de estado puras (`entities/collector.ts` e `entities/legacy.ts`), testadas passo a passo e também em lutas inteiras simuladas, para garantir que nenhuma delas trava. O Legacy System faz `ROLLBACK` na primeira derrota e `COMMIT` na segunda.
- Em desenvolvimento (`npm run dev`), a tecla `=` sobe a RAM e `Page Down` leva o Admin até a próxima porta ou derruba o chefe da sala, para testar cada luta sem jogar tudo de novo. Os dois atalhos não existem no build de produção.
- A música e os efeitos são sintetizados com a Web Audio API, sem arquivos de áudio (`src/game/audio`). O órgão soma harmônicos como os registros de um órgão de verdade (flauta, principal, pleno, palheta e pedal), com ataque lento, vibrato leve e um reverb de catedral gerado em código. As faixas ficam em `src/game/audio/music` como dados, com notas e durações, e um sequenciador agenda cada nota com um pouco de antecedência. Testes conferem que as partes de cada faixa fecham juntas em compassos inteiros, ficam em ré menor e cabem na extensão de cada registro.
- O som só começa no Enter da tela de título, que cria o `AudioContext`. `M` liga e desliga o som, e a escolha vale até o fim da sessão. Pausar, esconder a aba ou sair silenciam o jogo, e sair fecha o contexto de áudio.
- Para trocar o órgão por gravações, basta escrever outro `MusicPlayer` (a interface está em `src/game/audio/organ-player.ts`) que toque um arquivo para cada nome de faixa e entregá-lo ao `createGameAudio`.
- O jogo abre como diálogo modal: o foco fica nos botões do próprio jogo (Tab e Shift+Tab dão a volta neles) e volta ao elemento de origem ao sair. Uma região `aria-live` anuncia a abertura, os avisos, a pausa, o Crash e a vitória, e os medidores de RAM e dos chefes têm nome e valor. Nada pisca mais de três vezes por segundo, e os testes conferem isso para as luzes do cenário, o Admin, os inimigos e o brilho de dano dos chefes. Com a preferência por menos movimento, somem o tremor, o parallax, as luzes piscando e as animações que só enfeitam.
- O jogo tem duas exceções combinadas às regras acima. As cores do canvas vivem numa paleta própria (`src/game/palette.ts`), enquanto o HUD e os painéis em HTML continuam nos tokens. Os textos do jogo ficam em `src/game/ui/texts.ts`, nos dois idiomas, para só serem baixados com ele. Testes garantem que as cores de sintaxe da paleta batem com os tokens e que as mensagens de erro do jogo usam a mesma tradução da aba Mensagens.
- Um teste varre o `src/` e garante que o nome da série homenageada pelo jogo e os dos seus personagens não aparecem em lugar nenhum. A palavra do código secreto só aparece nos arquivos que cuidam dele.
- F5 ou Alt+X executam com o foco no editor, como no SSMS; fora dele, o F5 continua recarregando a página. O botão Executar roda o script da aba ativa.
- A Nova Consulta abre pelo botão da barra de ferramentas, pelo menu Arquivo ou com Alt+N, porque o Chrome e o Edge reservam o Ctrl+N para abrir uma janela. O editor é um campo de texto comum com o T-SQL colorido por cima, nas mesmas cores dos scripts, e um autocomplete próprio que sugere palavras-chave, tabelas e procedures conforme o contexto. Funciona com teclado, leitor de tela e celular. Com um trecho selecionado, F5 executa só a seleção, como no SSMS.
- A tela de conexão aparece uma vez por sessão. Um script no `<head>` lê o `sessionStorage` antes da primeira pintura e marca o `<html>`; o CSS só mostra o diálogo para quem ainda não conectou. Quem recarrega a página não vê o diálogo piscar, e sem JavaScript o conteúdo aparece direto, sem diálogo.
- O diálogo é um overlay: o conteúdo continua no HTML, e o resto da janela fica inerte enquanto ele está aberto. Cancelar, Esc ou o X levam à versão simples.
- Os dois perfis de autenticação, visitante e dev, mostram o mesmo conteúdo. O perfil escolhido vira o login da barra amarela e do servidor no Object Explorer. Quem entra como visitante ganha o tour e a Colinha aberta; quem entra como dev começa sem tour e com a Colinha recolhida.
- A Colinha, inspirada no Template Explorer do SSMS, fica à direita em telas largas e vira um painel que sobe de baixo nas menores. As seções são links de verdade, então funcionam até sem JavaScript; os exemplos vão para a Nova Consulta. Aberta ou recolhida, ela lembra a escolha durante a sessão, decidida pelo mesmo script do `<head>`, sem piscar.
- O tour tem três passos e aparece uma vez por sessão, logo depois de conectar. O primeiro passo avança sozinho quando a pessoa abre uma tabela; Pular ou Esc fecham, e o menu Ajuda reinicia. Até a primeira tabela aberta, a pasta Tabelas pulsa de leve (ou fica só destacada, para quem prefere menos movimento).
- Em Opções, "Usar cor personalizada" muda de verdade a cor da barra de conexão durante a sessão, com o texto em preto ou branco conforme o contraste. `Language=en` nos parâmetros adicionais troca o idioma do site ao conectar.
- Título, descrição e endereço canônico de cada página saem de `src/app/site-metadata.ts`, a partir dos mesmos textos do site. `/` e `/about` mostram a mesma tabela, então `/about` aponta para `/` como endereço canônico. O sitemap lista só as páginas que devem aparecer na busca; a Nova Consulta e a paleta ficam de fora.
- Os metadados saem em português, o idioma padrão. O título da aba acompanha o idioma escolhido, inclusive ao navegar e ao recarregar.
- A imagem de compartilhamento é gerada no build com o `ImageResponse` do próprio Next.js. Ela imita a janela do site e usa as cores do `tokens.css`.
- Cada página tem um `h1`, visível só para leitores de tela, e as regiões têm títulos: Pesquisador de Objetos, Resultado da consulta e Colinha. O primeiro Tab mostra o link "Pular para o conteúdo". Depois de executar, a barra amarela anuncia o resultado com o número de linhas.
- No celular, cada linha da grade vira um cartão, com o nome da coluna ao lado do valor e os textos longos logo abaixo. Para leitores de tela, continua sendo uma tabela.
- Animações e transições respeitam a preferência por menos movimento.
- Os scripts são montados a partir do catálogo de objetos (`src/engine/catalog.ts`), o mesmo que alimenta a árvore, e coloridos pelo Shiki com o motor de expressões regulares em JavaScript, sem WASM. Por cima do Shiki há um ajuste: nomes de coluna como `Role` e `Description` voltam à cor de identificador, e `AND`, `OR`, `LIKE` e a pontuação ficam cinza, como no SSMS.
- Nada do que o visitante digita é executado como código.
- Ícones próprios em SVG, sem marcas da Microsoft.
- Commits seguem o padrão Conventional Commits.

## Roadmap

- [x] Base do projeto e paleta de cores
- [x] Conteúdo e versão simples
- [x] Janela do SSMS
- [x] Scripts das seções e Object Explorer
- [x] Execução das consultas
- [x] Tela de conexão
- [x] Nova consulta com autocomplete
- [x] Guia para quem não conhece SQL
- [x] SEO e acessibilidade
- [x] Versionamento e viagem no tempo
- [x] Mini jogo
- [ ] Publicação

## Licença

MIT
