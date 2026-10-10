import type { Localized } from "@/content/locales";
import type { BossKind } from "../entities/boss";
import type { Subweapon } from "../entities/hero";

export interface GameTexts {
  description: string;
  opened: string;
  prompt: string;
  tip: string;
  controlsLabel: string;
  controls: readonly { keys: string; action: string }[];
  start: string;
  skip: string;
  resume: string;
  retry: string;
  exit: string;
  paused: string;
  hud: {
    player: string;
    ram: string;
    energy: string;
    cloud: string;
    cloudReady: string;
    cloudCharging: string;
    pause: string;
    exit: string;
    heap: string;
    uptime: string;
    sound: string;
    soundOn: string;
    soundOff: string;
  };
  subweapons: Readonly<Record<Subweapon, string>>;
  bosses: Readonly<Record<BossKind, string>>;
  notices: {
    join: string;
    truncate: string;
    switch: string;
    collector: string;
    freed: string;
    legacy: string;
    rollback: string;
    soundOn: string;
    soundOff: string;
  };
  crash: {
    header: string;
    message: string;
    advice: string;
    completionTime: string;
    status: string;
    announcement: string;
  };
  victory: {
    rows: string;
    message: string;
    completionTime: string;
    status: string;
    announcement: string;
    credit: string;
  };
}

const SUBWEAPON_NAMES: Readonly<Record<Subweapon, string>> = {
  select: "SELECT",
  join: "JOIN",
  truncate: "TRUNCATE",
};

const BOSS_NAMES: Readonly<Record<BossKind, string>> = {
  collector: "GARBAGE COLLECTOR",
  legacy: "THE LEGACY SYSTEM",
};

export const GAME_TEXTS: Localized<GameTexts> = {
  "pt-BR": {
    description:
      "Um jogo de plataforma num castelo que também é um data center. Você é o Admin: anda, pula, agacha e usa um cabo de rede como chicote, além de subarmas que gastam Query Energy. A RAM sobe quando você leva dano, e em 100% o jogo dá Crash. Tem música de órgão e efeitos sonoros; M liga e desliga o som.",
    opened:
      "Symphony of the Database aberto. Aperte Enter para começar. Esc volta ao SSMS quando você quiser.",
    prompt: "Aperte Enter para começar. Esc volta ao SSMS quando você quiser.",
    tip: "Dica: quebre os disquetes, eles guardam Query Energy.",
    controlsLabel: "Controles",
    controls: [
      { keys: "← → ou A D", action: "andar" },
      { keys: "↑ W ou Espaço", action: "pular" },
      { keys: "Pulo no ar", action: "forma nuvem" },
      { keys: "↓ ou S", action: "agachar" },
      { keys: "↓ + pulo", action: "descer da bandeja" },
      { keys: "Z", action: "chicote" },
      { keys: "X", action: "subarma" },
      { keys: "C", action: "trocar subarma" },
      { keys: "P", action: "pausa" },
      { keys: "Esc", action: "voltar ao SSMS" },
    ],
    start: "Começar",
    skip: "Enter pula a abertura",
    resume: "Continuar",
    retry: "Tentar de novo",
    exit: "Voltar ao SSMS",
    paused: "Pausado",
    hud: {
      player: "ADMIN",
      ram: "RAM",
      energy: "QUERY ENERGY",
      cloud: "NUVEM",
      cloudReady: "Forma nuvem pronta",
      cloudCharging: "Forma nuvem recarregando",
      pause: "Pausa",
      exit: "Voltar ao SSMS",
      heap: "HEAP",
      uptime: "UPTIME",
      sound: "Som",
      soundOn: "ligado",
      soundOff: "desligado",
    },
    subweapons: SUBWEAPON_NAMES,
    bosses: BOSS_NAMES,
    notices: {
      join: "Você encontrou o JOIN: ele vai e volta. C troca de subarma.",
      truncate:
        "Você encontrou o TRUNCATE: limpa a tela, mas custa {cost} de Query Energy.",
      switch: "Subarma ativa: {name}",
      collector:
        "O Garbage Collector veio liberar memória. Pule a foice e saia das faixas marcadas.",
      freed: "Memória liberada! Pegue o item GC e siga pela porta.",
      legacy:
        "The Legacy System roda há décadas e não aceita atualização. Hora do deploy.",
      rollback:
        "ROLLBACK! Ele desfez parte do dano. Hotfix aplicado: agora ele está mais rápido.",
      soundOn: "Som ligado.",
      soundOff: "Som desligado. M liga de novo.",
    },
    crash: {
      header: "Msg 701, Nível 17, Estado 1, Linha 1",
      message:
        "Não há memória suficiente no pool de recursos 'default' para executar esta consulta.",
      advice:
        "A RAM do Admin chegou a 100%. Respire fundo e tente de novo, os dados contam com você.",
      completionTime: "Horário de conclusão",
      status: "Consulta concluída com erros.",
      announcement:
        "Crash: a RAM chegou a 100%. R tenta de novo e Esc volta ao SSMS.",
    },
    victory: {
      rows: "(1 linha afetada)",
      message:
        "Deploy concluído! O Legacy System finalmente aceitou a atualização, e os dados agradecem.",
      completionTime: "Horário de conclusão",
      status: "Consulta executada com êxito.",
      announcement:
        "Vitória! O Legacy System foi atualizado em {time}. Enter ou Esc voltam ao SSMS.",
      credit: "Um tributo carinhoso aos clássicos de ação em castelos góticos.",
    },
  },
  en: {
    description:
      "A platformer in a castle that is also a data center. You are the Admin: walk, jump, crouch and use a network cable as a whip, plus subweapons that spend Query Energy. RAM goes up when you take damage, and at 100% the game crashes. There is organ music and sound effects; M turns the sound on and off.",
    opened:
      "Symphony of the Database is open. Press Enter to start. Esc takes you back to SSMS whenever you like.",
    prompt:
      "Press Enter to start. Esc takes you back to SSMS whenever you like.",
    tip: "Tip: break the floppy disks, they hold Query Energy.",
    controlsLabel: "Controls",
    controls: [
      { keys: "← → or A D", action: "walk" },
      { keys: "↑ W or Space", action: "jump" },
      { keys: "Jump in the air", action: "cloud form" },
      { keys: "↓ or S", action: "crouch" },
      { keys: "↓ + jump", action: "drop from a tray" },
      { keys: "Z", action: "whip" },
      { keys: "X", action: "subweapon" },
      { keys: "C", action: "switch subweapon" },
      { keys: "P", action: "pause" },
      { keys: "Esc", action: "back to SSMS" },
    ],
    start: "Start",
    skip: "Enter skips the opening",
    resume: "Resume",
    retry: "Try again",
    exit: "Back to SSMS",
    paused: "Paused",
    hud: {
      player: "ADMIN",
      ram: "RAM",
      energy: "QUERY ENERGY",
      cloud: "CLOUD",
      cloudReady: "Cloud form ready",
      cloudCharging: "Cloud form recharging",
      pause: "Pause",
      exit: "Back to SSMS",
      heap: "HEAP",
      uptime: "UPTIME",
      sound: "Sound",
      soundOn: "on",
      soundOff: "off",
    },
    subweapons: SUBWEAPON_NAMES,
    bosses: BOSS_NAMES,
    notices: {
      join: "You found JOIN: it flies out and comes back. C switches subweapons.",
      truncate:
        "You found TRUNCATE: it clears the screen, but costs {cost} Query Energy.",
      switch: "Active subweapon: {name}",
      collector:
        "The Garbage Collector came to free some memory. Jump over the scythe and stay out of the marked lanes.",
      freed: "Memory freed! Grab the GC item and head through the door.",
      legacy:
        "The Legacy System has been running for decades and refuses to update. Time to deploy.",
      rollback:
        "ROLLBACK! It undid part of the damage. Hotfix applied: now it is faster.",
      soundOn: "Sound on.",
      soundOff: "Sound off. M turns it back on.",
    },
    crash: {
      header: "Msg 701, Level 17, State 1, Line 1",
      message:
        "There is insufficient system memory in resource pool 'default' to run this query.",
      advice:
        "The Admin's RAM hit 100%. Take a deep breath and try again, the data is counting on you.",
      completionTime: "Completion time",
      status: "Query completed with errors.",
      announcement:
        "Crash: RAM hit 100%. R tries again and Esc takes you back to SSMS.",
    },
    victory: {
      rows: "(1 row affected)",
      message:
        "Deploy complete! The Legacy System finally accepted the update, and the data says thanks.",
      completionTime: "Completion time",
      status: "Query executed successfully.",
      announcement:
        "Victory! The Legacy System was updated in {time}. Enter or Esc takes you back to SSMS.",
      credit: "A loving tribute to the classic gothic castle action games.",
    },
  },
};
