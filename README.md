# Portifolio-v2

A segunda versão do meu portfólio, agora com cara de SQL Server Management Studio.

Sou engenheiro de dados e trabalho com SQL Server e T-SQL, então resolvi apresentar a minha trajetória do jeito que conheço melhor: como um banco de dados. Cada seção do site é uma tabela. Um clique no Object Explorer abre o script e o resultado aparece na grade, como numa consulta de verdade, só que nenhum SQL é executado de fato.

A versão atual continua no ar em [mgroschitz.dev](https://mgroschitz.dev) enquanto esta é construída.

## Status

Em construção. Na primeira visita de cada sessão aparece a tela Conectar ao Servidor: um clique em Conectar (ou um Enter) abre a janela do SSMS com a tabela da página já executada. Lá dentro, cada tabela do Object Explorer abre o próprio script T-SQL numa aba e executa na hora. A grade mostra os dados, a aba de mensagens mostra as linhas afetadas e o horário de conclusão, e a barra amarela acompanha o resultado. Cada seção tem o seu endereço (`/about`, `/tech-stack`, `/career`, `/projects`, `/beyond-the-terminal`, `/contact` e `/resume`), e a procedure `sp_DownloadCV` entrega o currículo em PDF. Para quem quer escrever as próprias consultas, a Nova Consulta (`/query`) tem destaque de sintaxe, autocomplete e o comando `HELP`. Também existem a paleta de cores (`/palette`) e a versão simples (`/simple`) com o conteúdo do portfólio.

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
- Os menus abrem como no SSMS. O que já tem função no site funciona (Arquivo > Nova Consulta, Exibir > Pesquisador de Objetos, Ferramentas > Idioma, Ajuda > Versão simples) e o resto aparece esmaecido. Tudo funciona pelo teclado.
- No celular, o Object Explorer vira uma gaveta lateral e os menus menos usados se recolhem em um botão; a Ajuda continua à vista.
- O estado da interface usa só recursos do React (Context e `useReducer`), sem biblioteca extra.
- A URL manda na aba ativa: abrir uma tabela muda o endereço, e voltar, avançar ou recarregar a página leva sempre à aba certa. As abas abertas não se repetem e a última nunca fecha.
- A execução é simulada por um motor em TypeScript puro (`src/engine/execute.ts`), sem React e sem DOM. Não há parser de SQL: o motor separa o texto em comandos (por `;`, `GO` ou pelo começo de cada comando), ignora maiúsculas, espaços, comentários e colchetes, e procura cada comando num dicionário montado a partir do catálogo. Cada comando reconhecido devolve uma grade; o primeiro desconhecido devolve um erro no formato do SQL Server, com a linha em que está e uma dica de comando válido. A página de cada seção já sai do servidor com a grade preenchida, então o conteúdo está no HTML mesmo sem JavaScript.
- Os erros vêm de um pool de mensagens com referências a Doctor Who, Super Mario, Portal, Metal Gear Solid e Dark Souls (`src/engine/errors.ts`), em português e em inglês.
- F5 ou Alt+X executam com o foco no editor, como no SSMS; fora dele, o F5 continua recarregando a página. O botão Executar roda o script da aba ativa.
- A Nova Consulta abre pelo botão da barra de ferramentas, pelo menu Arquivo ou com Alt+N, porque o Chrome e o Edge reservam o Ctrl+N para abrir uma janela. O editor é um campo de texto comum com o T-SQL colorido por cima, nas mesmas cores dos scripts, e um autocomplete próprio que sugere palavras-chave, tabelas e procedures conforme o contexto. Funciona com teclado, leitor de tela e celular. Com um trecho selecionado, F5 executa só a seleção, como no SSMS.
- A tela de conexão aparece uma vez por sessão. Um script no `<head>` lê o `sessionStorage` antes da primeira pintura e marca o `<html>`; o CSS só mostra o diálogo para quem ainda não conectou. Quem recarrega a página não vê o diálogo piscar, e sem JavaScript o conteúdo aparece direto, sem diálogo.
- O diálogo é um overlay: o conteúdo continua no HTML, e o resto da janela fica inerte enquanto ele está aberto. Cancelar, Esc ou o X levam à versão simples.
- Os dois perfis de autenticação, visitante e dev, mostram o mesmo conteúdo. O perfil escolhido vira o login da barra amarela e do servidor no Object Explorer.
- Em Opções, "Usar cor personalizada" muda de verdade a cor da barra de conexão durante a sessão, com o texto em preto ou branco conforme o contraste. `Language=en` nos parâmetros adicionais troca o idioma do site ao conectar.
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
- [ ] Guia para quem não conhece SQL
- [ ] SEO e acessibilidade
- [ ] Easter eggs
- [ ] Publicação

## Licença

MIT
