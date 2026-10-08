# Portifolio-v2

A segunda versão do meu portfólio, agora com cara de SQL Server Management Studio.

Sou engenheiro de dados e trabalho com SQL Server e T-SQL, então resolvi apresentar a minha trajetória do jeito que conheço melhor: como um banco de dados. Cada seção do site é uma tabela. Um clique no Object Explorer abre o script e o resultado aparece na grade, como numa consulta de verdade, só que nenhum SQL é executado de fato.

A versão atual continua no ar em [mgroschitz.dev](https://mgroschitz.dev) enquanto esta é construída.

## Status

Em construção. A página inicial já mostra a janela do SSMS (menus, toolbar, Object Explorer, editor, resultados e barras de status) com dados fixos. Também existem a paleta de cores (`/palette`) e a versão simples (`/simple`) com o conteúdo do portfólio.

## Stack

- Next.js 16 (App Router) com TypeScript em modo strict, gerando páginas estáticas
- CSS Modules
- Shiki para o destaque de sintaxe do T-SQL
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
  engine/       interpretador dos comandos, em TypeScript puro
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
- Os menus abrem como no SSMS. O que já tem função no site funciona (Exibir > Pesquisador de Objetos, Ferramentas > Idioma, Ajuda > Versão simples) e o resto aparece esmaecido. Tudo funciona pelo teclado.
- No celular, o Object Explorer vira uma gaveta lateral e os menus menos usados se recolhem em um botão; a Ajuda continua à vista.
- O estado da interface usa só recursos do React (Context e `useReducer`), sem biblioteca extra.
- Nada do que o visitante digita é executado como código.
- Ícones próprios em SVG, sem marcas da Microsoft.
- Commits seguem o padrão Conventional Commits.

## Roadmap

- [x] Base do projeto e paleta de cores
- [x] Conteúdo e versão simples
- [x] Janela do SSMS
- [ ] Scripts das seções e Object Explorer
- [ ] Execução das consultas
- [ ] Tela de conexão
- [ ] Nova consulta com autocomplete
- [ ] Guia para quem não conhece SQL
- [ ] SEO e acessibilidade
- [ ] Easter eggs
- [ ] Publicação

## Licença

MIT
