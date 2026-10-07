import type { Locale } from "./locales";
import type { Texts } from "./types";

export const texts: Record<Locale, Texts> = {
  "pt-BR": {
    about: {
      name: "Mikhael Groschitz Costa",
      role: "Engenheiro de dados",
      summary:
        "Atuo com engenharia de dados em SQL Server e Azure: modelagem, pipelines ETL/ELT, otimização de T-SQL e automação de processos em Python. Hoje sou responsável pela estrutura de dados de um CRM jurídico em produção no Grupo Facta — modelo de dados, views, índices e constraints, otimização das consultas críticas do sistema e robôs em Python que sustentam a rotina da operação. Implantações feitas junto ao time de DBA. Antes disso, atuei com dados financeiros e contábeis: extração e tratamento de grandes volumes com SQL e Python (Pandas, NumPy), dashboards em Power BI, detecção de anomalias e análises preditivas para fluxo de caixa e rentabilidade. Fora do trabalho, construo projetos de engenharia de dados de ponta a ponta. O mais recente é um pipeline de CDC nativo do SQL Server alimentando um Data Warehouse dimensional — extração incremental por LSN, SCD Tipo 2 e checks de qualidade em T-SQL e Python. Código aberto no GitHub.",
    },
    techStack: [
      { category: "Linguagens", technology: "SQL" },
      { category: "Linguagens", technology: "Python" },
      { category: "Linguagens", technology: "T-SQL" },
      { category: "Linguagens", technology: "Java" },
      { category: "Dados", technology: "SQL Server" },
      { category: "Dados", technology: "MongoDB" },
      { category: "Dados", technology: "Delta Lake" },
      { category: "Dados", technology: "DuckDB" },
      { category: "Dados", technology: "MinIO" },
      { category: "Processamento", technology: "Pandas" },
      { category: "Processamento", technology: "NumPy" },
      { category: "Processamento", technology: "PySpark" },
      { category: "Processamento", technology: "Spark Streaming" },
      { category: "Orquestração", technology: "Azure Data Factory" },
      { category: "Orquestração", technology: "Airflow" },
      { category: "Orquestração", technology: "Kafka" },
      { category: "Cloud & Plataforma", technology: "Azure" },
      { category: "Cloud & Plataforma", technology: "Docker" },
      { category: "BI & Qualidade", technology: "Power BI" },
      { category: "BI & Qualidade", technology: "pytest" },
      { category: "BI & Qualidade", technology: "Data Quality Gates" },
      { category: "Modelagem", technology: "Dimensional" },
      { category: "Modelagem", technology: "SCD Tipo 2" },
      { category: "Modelagem", technology: "CDC" },
      { category: "Modelagem", technology: "OLTP" },
      { category: "Modelagem", technology: "Lakehouse" },
    ],
    career: [
      {
        company: "Credware Tecnologia (Cliente: Facta Financeira)",
        role: "Engenheiro de dados | Analista Back End",
        startDate: "2026-03",
        endDate: null,
        description:
          "Foco na arquitetura e otimização de alta performance em bancos de dados relacionais (SQL Server) para o setor financeiro. Responsável pelo desenvolvimento e orquestração de pipelines de ETL/ELT com Apache Airflow, além da arquitetura, revisão de código e melhoria contínua de robôs e automações em Python, garantindo escalabilidade, integridade sistêmica e excelência operacional.",
      },
      {
        company: "Escofi Contabilidade",
        role: "Analista de Dados Júnior",
        startDate: "2024-11",
        endDate: "2026-03",
        description:
          "Foco na transformação de dados contábeis em insights de negócio, apoiando a tomada de decisão estratégica e ajudando a impulsionar a evolução da empresa para uma cultura orientada por dados.",
      },
      {
        company: "Payer Serviços de Pagamentos",
        role: "Estagiário de Suporte de TI",
        startDate: "2023-10",
        endDate: "2024-10",
        description:
          "Responsável por diagnosticar e solucionar problemas técnicos, garantindo a satisfação e o sucesso do cliente. Além do suporte direto, foquei em utilizar os dados gerados para otimizar processos e prevenir ocorrências futuras.",
      },
    ],
    projects: [
      {
        name: "Pipeline ELT de Preços de Combustíveis (ANP)",
        categories: ["Engenharia de Dados", "Cloud/Azure"],
        description:
          "Pipeline ELT na Azure que processa mais de 20 anos de preços de combustíveis da ANP (~32 milhões de linhas). Ingestão via web scraping para o Data Lake, padronização para Parquet, modelagem dimensional com SCD2 via Azure Data Factory e T-SQL, e dashboard final em Power BI.",
        stack: ["Python", "Azure Data Factory", "Azure SQL", "Power BI"],
        repoUrl:
          "https://github.com/Mikhael-Groschitz/anp-fuel-prices-elt-azure",
        demoUrl: null,
        image: "/projects/project-anp-fuel.svg",
      },
      {
        name: "CDC de SQL Server para Data Warehouse",
        categories: ["Engenharia de Dados", "Data Warehouse"],
        description:
          "Pipeline que captura mudanças direto do SQL Server via Change Data Capture nativo (rastreamento por LSN) e carrega incrementalmente um data warehouse dimensional com SCD2, sem orquestradores externos. Ambiente Dockerizado, com testes automatizados em pytest.",
        stack: ["SQL Server", "T-SQL", "Python", "Docker"],
        repoUrl: "https://github.com/Mikhael-Groschitz/sqlserver-cdc-to-dw",
        demoUrl: null,
        image: "/projects/project-cdc-dw.svg",
      },
      {
        name: "Data Lakehouse de CNPJs",
        categories: ["Engenharia de Dados", "Big Data"],
        description:
          "Lakehouse local em camadas (bronze, silver, gold) para os dados públicos de CNPJ da Receita Federal, com orquestração via Airflow, processamento distribuído em PySpark e armazenamento em Delta Lake sobre MinIO.",
        stack: ["PySpark", "Airflow", "Delta Lake", "Docker"],
        repoUrl:
          "https://github.com/Mikhael-Groschitz/cnpj-lakehouse-spark-airflow",
        demoUrl: null,
        image: "/projects/project-cnpj-lakehouse.svg",
      },
      {
        name: "MTG TokenForge",
        categories: ["Mobile / Web App", "Full Stack", "Hobby"],
        description:
          'Crie e administre seus tokens customizados. Focado em ajudar jogadores de MTG a ter um controle melhor sobre o "Estado da mesa".',
        stack: ["React", "Java", "Spring Boot", "PostgreSQL"],
        repoUrl: "https://github.com/Mikhael-Groschitz/MTG-Token-Counter-Web",
        demoUrl: "https://www.theforgeoftokens.com",
        image: "/projects/project-token-forge.png",
      },
    ],
    contact: {
      intro:
        "Tem um desafio de dados complexo, uma vaga para Engenharia/Análise de Dados Pleno, ou quer conversar sobre arquitetura e performance?",
      channels: [
        {
          channel: "E-mail",
          value: "mgroschitz@gmail.com",
          url: "mailto:mgroschitz@gmail.com",
        },
        {
          channel: "WhatsApp",
          value: "wa.link/pxm6md",
          url: "https://wa.link/pxm6md",
        },
        {
          channel: "LinkedIn",
          value: "linkedin.com/in/mikhael-groschitz",
          url: "https://www.linkedin.com/in/mikhael-groschitz/",
        },
        {
          channel: "GitHub",
          value: "github.com/Mikhael-Groschitz",
          url: "https://github.com/Mikhael-Groschitz",
        },
        {
          channel: "Dev.to",
          value: "dev.to/arg",
          url: "https://dev.to/arg",
        },
      ],
    },
    resume: {
      fileName: "Mikhael_Groschitz_Curriculo_Engenheiro_de_Dados.pdf",
      url: "/cv/Mikhael_Groschitz_Curriculo_Engenheiro_de_Dados_portugues.pdf",
    },
    simpleVersion: {
      title: "Versão simples",
      intro:
        "Oi! Esta é a versão simples do portfólio: o mesmo conteúdo, sem a brincadeira do banco de dados.",
      sectionsLabel: "Seções",
      sections: {
        about: "Sobre",
        "tech-stack": "Tech stack",
        career: "Carreira",
        projects: "Projetos",
        contact: "Contato",
        resume: "Currículo",
      },
      present: "atual",
      repository: "Repositório",
      demo: "Demo",
      technologies: "Tecnologias",
      downloadResume: "Baixar o currículo em PDF",
      opensInNewTab: "abre em nova aba",
      switchLanguage: "English",
      fullVersion: "Ver a versão completa",
    },
  },
  en: {
    about: {
      name: "Mikhael Groschitz Costa",
      role: "Data Engineer",
      summary:
        "I work in data engineering with SQL Server and Azure: data modeling, ETL/ELT pipelines, T-SQL tuning and process automation in Python. Today I'm responsible for the data structure of a legal CRM running in production at Grupo Facta — data model, views, indexes and constraints, tuning of the system's critical queries, and the Python bots that keep daily operations running. Deployments are done together with the DBA team. Before that, I worked with financial and accounting data: extracting and processing large volumes with SQL and Python (Pandas, NumPy), Power BI dashboards, anomaly detection and predictive analyses for cash flow and profitability. Outside of work, I build end-to-end data engineering projects. The most recent one is a native SQL Server CDC pipeline feeding a dimensional Data Warehouse — incremental extraction by LSN, SCD Type 2 and data quality checks in T-SQL and Python. Open source on GitHub.",
    },
    techStack: [
      { category: "Languages", technology: "SQL" },
      { category: "Languages", technology: "Python" },
      { category: "Languages", technology: "T-SQL" },
      { category: "Languages", technology: "Java" },
      { category: "Data", technology: "SQL Server" },
      { category: "Data", technology: "MongoDB" },
      { category: "Data", technology: "Delta Lake" },
      { category: "Data", technology: "DuckDB" },
      { category: "Data", technology: "MinIO" },
      { category: "Processing", technology: "Pandas" },
      { category: "Processing", technology: "NumPy" },
      { category: "Processing", technology: "PySpark" },
      { category: "Processing", technology: "Spark Streaming" },
      { category: "Orchestration", technology: "Azure Data Factory" },
      { category: "Orchestration", technology: "Airflow" },
      { category: "Orchestration", technology: "Kafka" },
      { category: "Cloud & Platform", technology: "Azure" },
      { category: "Cloud & Platform", technology: "Docker" },
      { category: "BI & Quality", technology: "Power BI" },
      { category: "BI & Quality", technology: "pytest" },
      { category: "BI & Quality", technology: "Data Quality Gates" },
      { category: "Modeling", technology: "Dimensional" },
      { category: "Modeling", technology: "SCD Type 2" },
      { category: "Modeling", technology: "CDC" },
      { category: "Modeling", technology: "OLTP" },
      { category: "Modeling", technology: "Lakehouse" },
    ],
    career: [
      {
        company: "Credware Technology (Client: Facta Financeira)",
        role: "Data Engineer | Back End Analyst",
        startDate: "2026-03",
        endDate: null,
        description:
          "Focused on the architecture and high-performance optimization of relational databases (SQL Server) for the financial sector. Responsible for developing and orchestrating ETL/ELT pipelines with Apache Airflow, as well as the architecture, code review, and continuous improvement of bots and automations in Python, ensuring scalability, system integrity, and operational excellence.",
      },
      {
        company: "Escofi Contabilidade",
        role: "Junior Data Analyst",
        startDate: "2024-11",
        endDate: "2026-03",
        description:
          "Focused on transforming accounting data into business insights, supporting strategic decision-making and helping drive the company's evolution towards a data-driven culture.",
      },
      {
        company: "Payer Serviços de Pagamentos",
        role: "IT Support Intern",
        startDate: "2023-10",
        endDate: "2024-10",
        description:
          "Responsible for diagnosing and solving technical issues, ensuring customer satisfaction and success. In addition to direct support, I focused on using the generated data to optimize processes and prevent future occurrences.",
      },
    ],
    projects: [
      {
        name: "ANP Fuel Prices ELT Pipeline",
        categories: ["Data Engineering", "Cloud/Azure"],
        description:
          "An Azure ELT pipeline processing 20+ years of Brazilian fuel price data (~32 million rows). Web-scraped ingestion into a Data Lake, Parquet standardization, dimensional modeling with SCD2 via Azure Data Factory and T-SQL, and a Power BI dashboard.",
        stack: ["Python", "Azure Data Factory", "Azure SQL", "Power BI"],
        repoUrl:
          "https://github.com/Mikhael-Groschitz/anp-fuel-prices-elt-azure",
        demoUrl: null,
        image: "/projects/project-anp-fuel.svg",
      },
      {
        name: "SQL Server CDC to Data Warehouse",
        categories: ["Data Engineering", "Data Warehouse"],
        description:
          "A pipeline that captures changes straight from SQL Server via native Change Data Capture (LSN-based tracking) and incrementally loads a dimensional warehouse with SCD2, no external orchestrators. Dockerized, with automated pytest coverage.",
        stack: ["SQL Server", "T-SQL", "Python", "Docker"],
        repoUrl: "https://github.com/Mikhael-Groschitz/sqlserver-cdc-to-dw",
        demoUrl: null,
        image: "/projects/project-cdc-dw.svg",
      },
      {
        name: "CNPJ Data Lakehouse",
        categories: ["Data Engineering", "Big Data"],
        description:
          "A local layered lakehouse (bronze, silver, gold) for Brazil's public CNPJ registry data, orchestrated with Airflow, processed with distributed PySpark, and stored as Delta Lake on MinIO.",
        stack: ["PySpark", "Airflow", "Delta Lake", "Docker"],
        repoUrl:
          "https://github.com/Mikhael-Groschitz/cnpj-lakehouse-spark-airflow",
        demoUrl: null,
        image: "/projects/project-cnpj-lakehouse.svg",
      },
      {
        name: "MTG Token Forge",
        categories: ["Mobile / Web App", "Full Stack", "Hobby"],
        description:
          'Create and manage your own custom tokens. Focused on helping MTG players keep better control of their "board state".',
        stack: ["React", "Java", "Spring Boot", "PostgreSQL"],
        repoUrl: "https://github.com/Mikhael-Groschitz/MTG-Token-Counter-Web",
        demoUrl: "https://www.theforgeoftokens.com",
        image: "/projects/project-token-forge.png",
      },
    ],
    contact: {
      intro:
        "Have a complex data challenge, a mid-level Data Engineer/Analyst opening, or want to talk about architecture and performance?",
      channels: [
        {
          channel: "Email",
          value: "mgroschitz@gmail.com",
          url: "mailto:mgroschitz@gmail.com",
        },
        {
          channel: "WhatsApp",
          value: "wa.link/pxm6md",
          url: "https://wa.link/pxm6md",
        },
        {
          channel: "LinkedIn",
          value: "linkedin.com/in/mikhael-groschitz",
          url: "https://www.linkedin.com/in/mikhael-groschitz/",
        },
        {
          channel: "GitHub",
          value: "github.com/Mikhael-Groschitz",
          url: "https://github.com/Mikhael-Groschitz",
        },
        {
          channel: "Dev.to",
          value: "dev.to/arg",
          url: "https://dev.to/arg",
        },
      ],
    },
    resume: {
      fileName: "Mikhael_Groschitz_Resume_Data_Engineer.pdf",
      url: "/cv/Mikhael_Groschitz_Curriculo_Engenheiro_de_Dados_ingles.pdf",
    },
    simpleVersion: {
      title: "Simple version",
      intro:
        "Hi! This is the simple version of the portfolio: the same content, minus the database make-believe.",
      sectionsLabel: "Sections",
      sections: {
        about: "About",
        "tech-stack": "Tech stack",
        career: "Career",
        projects: "Projects",
        contact: "Contact",
        resume: "Resume",
      },
      present: "present",
      repository: "Repository",
      demo: "Demo",
      technologies: "Technologies",
      downloadResume: "Download the resume as a PDF",
      opensInNewTab: "opens in a new tab",
      switchLanguage: "Português",
      fullVersion: "See the full version",
    },
  },
};
