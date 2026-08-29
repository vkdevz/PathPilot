import { Career, Skill, Question } from '../types';

export const CAREER_CATEGORIES = [
  'All Categories',
  'Data & Analytics',
  'Software Engineering',
  'AI & Emerging Tech',
  'Cloud & Infrastructure',
  'Cybersecurity',
  'Web & Product',
  'Databases & Systems',
  'Mobile & Apps',
  'Specialized Tech'
] as const;

export interface MarketRoleRequirement {
  roleId: string;
  roleName: string;
  category: string;
  icon: string;
  description: string;
  marketDemandScore: number; // e.g. 95%
  avgSalaryRange: string;
  trendingTools: string[];
  skills: Skill[];
}

export const PROTOTYPE_MARKET_ROLES: MarketRoleRequirement[] = [
  // --- Data & Analytics ---
  {
    roleId: 'data_scientist',
    roleName: 'Data Scientist',
    category: 'Data & Analytics',
    icon: '🧙',
    description: 'Extract actionable insights from complex data using statistics, machine learning, and predictive modeling.',
    marketDemandScore: 94,
    avgSalaryRange: '$120,000 - $175,000',
    trendingTools: ['Python', 'SQL', 'Pandas', 'Scikit-Learn', 'PyTorch', 'MLflow'],
    skills: [
      { id: 'ds_py', name: 'Python Fundamentals & Data Structures', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Core Python syntax, list comprehensions, NumPy arrays, and functional programming.', estimated_minutes: 90, market_demand: 'Very High', tools: ['Python 3', 'NumPy'] },
      { id: 'ds_sql', name: 'SQL Querying & Data Extraction', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['ds_py'], description: 'Aggregations, complex JOINs, subqueries, and window functions for analytics.', estimated_minutes: 100, market_demand: 'Very High', tools: ['PostgreSQL', 'Snowflake'] },
      { id: 'ds_stats', name: 'Probability & Inferential Statistics', category: 'Foundation', difficulty: 'Intermediate', level: 3, prerequisites: ['ds_py'], description: 'Descriptive stats, hypothesis testing, p-values, confidence intervals, distributions.', estimated_minutes: 130, market_demand: 'High', tools: ['SciPy', 'Statsmodels'] },
      { id: 'ds_eda', name: 'Pandas & Exploratory Data Analysis', category: 'Core Skills', difficulty: 'Intermediate', level: 4, prerequisites: ['ds_py', 'ds_sql'], description: 'Data wrangling, missing data imputation, feature scaling, and visualization.', estimated_minutes: 110, market_demand: 'Very High', tools: ['Pandas', 'Seaborn'] },
      { id: 'ds_ml', name: 'Machine Learning Algorithms', category: 'Core Skills', difficulty: 'Intermediate', level: 5, prerequisites: ['ds_stats', 'ds_eda'], description: 'Regression, Decision Trees, Random Forests, XGBoost, and model evaluation metrics.', estimated_minutes: 160, market_demand: 'Very High', tools: ['Scikit-Learn', 'XGBoost'] },
      { id: 'ds_dl', name: 'Deep Learning & Neural Networks', category: 'Advanced Skills', difficulty: 'Advanced', level: 6, prerequisites: ['ds_ml'], description: 'Feedforward networks, CNNs, RNNs, and PyTorch model architectures.', estimated_minutes: 180, market_demand: 'High', tools: ['PyTorch', 'TensorFlow'] },
      { id: 'ds_mlops', name: 'MLOps & Model Deployment', category: 'Industry Readiness', difficulty: 'Advanced', level: 7, prerequisites: ['ds_dl'], description: 'Containerizing models with Docker, REST API serving via FastAPI, and MLflow tracking.', estimated_minutes: 150, market_demand: 'Very High', tools: ['Docker', 'FastAPI', 'MLflow'] }
    ]
  },
  {
    roleId: 'data_analyst',
    roleName: 'Data Analyst',
    category: 'Data & Analytics',
    icon: '📊',
    description: 'Transform raw data into business intelligence dashboards, trend reports, and strategic executive insights.',
    marketDemandScore: 91,
    avgSalaryRange: '$80,000 - $115,000',
    trendingTools: ['SQL', 'Excel', 'Power BI', 'Tableau', 'Python'],
    skills: [
      { id: 'da_excel', name: 'Advanced Excel & Financial Modeling', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'XLOOKUP, PivotTables, PowerQuery, and statistical formulas.', estimated_minutes: 80, market_demand: 'Very High', tools: ['Excel', 'PowerQuery'] },
      { id: 'da_sql', name: 'SQL Analytics & Window Functions', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['da_excel'], description: 'Multi-table queries, CTEs, window functions (RANK, LEAD, LAG).', estimated_minutes: 100, market_demand: 'Very High', tools: ['PostgreSQL', 'BigQuery'] },
      { id: 'da_bi', name: 'Power BI & Tableau Dashboarding', category: 'Core Skills', difficulty: 'Intermediate', level: 3, prerequisites: ['da_sql'], description: 'DAX measures, interactive filters, executive data storytelling.', estimated_minutes: 120, market_demand: 'Very High', tools: ['Power BI', 'Tableau'] },
      { id: 'da_py', name: 'Python for Business Intelligence', category: 'Core Skills', difficulty: 'Intermediate', level: 4, prerequisites: ['da_sql'], description: 'Automating reporting scripts using Pandas and Matplotlib.', estimated_minutes: 110, market_demand: 'High', tools: ['Pandas', 'Jupyter'] }
    ]
  },
  {
    roleId: 'data_engineer',
    roleName: 'Data Engineer',
    category: 'Data & Analytics',
    icon: '⚙️',
    description: 'Architect scalable real-time streaming data pipelines, data lakes, and enterprise warehouses.',
    marketDemandScore: 96,
    avgSalaryRange: '$125,000 - $185,000',
    trendingTools: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'Kafka', 'Snowflake'],
    skills: [
      { id: 'de_sql', name: 'Advanced SQL & Database Schema Design', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Dimensional modeling, Star Schema, indexing, query optimization.', estimated_minutes: 110, market_demand: 'Very High', tools: ['PostgreSQL', 'Redshift'] },
      { id: 'de_py', name: 'Python for Data Pipelines', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['de_sql'], description: 'Building resilient ETL scripts, OOP, API rate-limiting.', estimated_minutes: 120, market_demand: 'Very High', tools: ['Python', 'Requests'] },
      { id: 'de_spark', name: 'Apache Spark & Distributed Processing', category: 'Core Skills', difficulty: 'Intermediate', level: 3, prerequisites: ['de_py'], description: 'PySpark DataFrames, partitioning, memory tuning, Delta Lake.', estimated_minutes: 160, market_demand: 'Very High', tools: ['PySpark', 'Databricks'] },
      { id: 'de_airflow', name: 'Orchestration with Apache Airflow', category: 'Advanced Skills', difficulty: 'Advanced', level: 4, prerequisites: ['de_spark'], description: 'DAG design, dynamic task generation, alerting, backfilling.', estimated_minutes: 140, market_demand: 'High', tools: ['Airflow', 'Docker'] }
    ]
  },
  {
    roleId: 'business_analyst',
    roleName: 'Business Analyst',
    category: 'Data & Analytics',
    icon: '📈',
    description: 'Bridge business strategy and technology by translating complex processes into tech requirements.',
    marketDemandScore: 88,
    avgSalaryRange: '$85,000 - $120,000',
    trendingTools: ['Jira', 'SQL', 'Excel', 'BPMN', 'Power BI'],
    skills: [
      { id: 'ba_req', name: 'Requirements Gathering & User Stories', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Stakeholder interviews, functional vs non-functional specs, Jira tickets.', estimated_minutes: 70, market_demand: 'High' },
      { id: 'ba_sql', name: 'Data Querying for Business Specs', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['ba_req'], description: 'Validation queries, KPI calculation, data reconciliation.', estimated_minutes: 90, market_demand: 'High' }
    ]
  },

  // --- AI & Emerging Tech ---
  {
    roleId: 'ai_engineer',
    roleName: 'AI Engineer',
    category: 'AI & Emerging Tech',
    icon: '⚡',
    description: 'Build cutting-edge Generative AI applications, LLM agents, RAG systems, and intelligent web microservices.',
    marketDemandScore: 99,
    avgSalaryRange: '$135,000 - $210,000',
    trendingTools: ['Python', 'OpenAI', 'LangChain', 'ChromaDB', 'FastAPI', 'PyTorch'],
    skills: [
      { id: 'ai_py', name: 'Python & Asynchronous Programming', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Asyncio, concurrent API requests, pydantic data modeling.', estimated_minutes: 100, market_demand: 'Very High', tools: ['Python 3.11', 'Pydantic'] },
      { id: 'ai_fastapi', name: 'FastAPI Microservices & Webhooks', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['ai_py'], description: 'High-throughput async APIs, WebSocket streaming responses.', estimated_minutes: 110, market_demand: 'Very High', tools: ['FastAPI', 'Uvicorn'] },
      { id: 'ai_ml', name: 'Machine Learning & Embeddings Basics', category: 'Core Skills', difficulty: 'Intermediate', level: 3, prerequisites: ['ai_py'], description: 'Vector embeddings, cosine similarity, distance metrics, semantic search.', estimated_minutes: 130, market_demand: 'Very High', tools: ['SentenceTransformers', 'NumPy'] },
      { id: 'ai_llm', name: 'LLM APIs & Prompt Engineering', category: 'Core Skills', difficulty: 'Intermediate', level: 4, prerequisites: ['ai_ml'], description: 'System prompts, structured JSON output, function calling, rate limiting.', estimated_minutes: 120, market_demand: 'Very High', tools: ['OpenAI API', 'Anthropic API'] },
      { id: 'ai_rag', name: 'Vector DBs & RAG Architecture', category: 'Advanced Skills', difficulty: 'Advanced', level: 5, prerequisites: ['ai_llm'], description: 'ChromaDB, Pinecone, chunking strategies, hybrid keyword-vector search.', estimated_minutes: 160, market_demand: 'Very High', tools: ['ChromaDB', 'LangChain', 'LlamaIndex'] },
      { id: 'ai_agents', name: 'Autonomous AI Agents & LangGraph', category: 'Industry Readiness', difficulty: 'Advanced', level: 6, prerequisites: ['ai_rag'], description: 'Tool-calling loops, multi-agent state machines, human-in-the-loop fallback.', estimated_minutes: 180, market_demand: 'Very High', tools: ['LangGraph', 'CrewAI'] }
    ]
  },
  {
    roleId: 'llm_engineer',
    roleName: 'Generative AI / LLM Engineer',
    category: 'AI & Emerging Tech',
    icon: '🧠',
    description: 'Fine-tune open-weights Large Language Models (LLaMA/Mistral), implement QLoRA, and optimize GPU inference.',
    marketDemandScore: 98,
    avgSalaryRange: '$145,000 - $230,000',
    trendingTools: ['PyTorch', 'HuggingFace', 'vLLM', 'PEFT/LoRA', 'DeepSpeed', 'TRL'],
    skills: [
      { id: 'llm_pytorch', name: 'PyTorch Tensors & Autograd Mechanics', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Custom PyTorch modules, CUDA tensor allocation, gradient computation.', estimated_minutes: 120, market_demand: 'Very High', tools: ['PyTorch', 'CUDA'] },
      { id: 'llm_trans', name: 'Transformer Architecture & Self-Attention', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['llm_pytorch'], description: 'Query/Key/Value math, multi-head attention, positional encodings, KV-Cache.', estimated_minutes: 150, market_demand: 'Very High', tools: ['Transformers', 'Attention'] },
      { id: 'llm_qlora', name: 'LoRA & PEFT Fine-Tuning', category: 'Advanced Skills', difficulty: 'Advanced', level: 3, prerequisites: ['llm_trans'], description: 'Quantized LoRA (QLoRA), SFTTrainer, DPO/RLHF alignment, bitsandbytes.', estimated_minutes: 180, market_demand: 'Very High', tools: ['HuggingFace TRL', 'PEFT'] },
      { id: 'llm_vllm', name: 'vLLM & Inference Optimization', category: 'Industry Readiness', difficulty: 'Advanced', level: 4, prerequisites: ['llm_qlora'], description: 'PagedAttention, vLLM continuous batching, GGUF/AWQ quantization.', estimated_minutes: 160, market_demand: 'Very High', tools: ['vLLM', 'TensorRT-LLM'] }
    ]
  },
  {
    roleId: 'mlops_engineer',
    roleName: 'MLOps Engineer',
    category: 'AI & Emerging Tech',
    icon: '🔄',
    description: 'Automate model deployment, continuous evaluation, drift detection, and GPU cluster infrastructure.',
    marketDemandScore: 95,
    avgSalaryRange: '$130,000 - $190,000',
    trendingTools: ['Docker', 'Kubernetes', 'MLflow', 'Kubeflow', 'BentoML', 'Prometheus'],
    skills: [
      { id: 'mlo_dock', name: 'Containerization for ML Models', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Dockerizing PyTorch/Scikit-Learn runtimes, multi-stage builds.', estimated_minutes: 100, market_demand: 'Very High' },
      { id: 'mlo_flow', name: 'Model Registry & Experiment Tracking', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['mlo_dock'], description: 'MLflow artifact logging, model versioning, staging vs prod tags.', estimated_minutes: 120, market_demand: 'Very High' }
    ]
  },
  {
    roleId: 'nlp_engineer',
    roleName: 'NLP Engineer',
    category: 'AI & Emerging Tech',
    icon: '🗣️',
    description: 'Develop text processing systems, sentiment analysis, entity recognition, and translation engines.',
    marketDemandScore: 92,
    avgSalaryRange: '$125,000 - $185,000',
    trendingTools: ['spaCy', 'HuggingFace', 'NLTK', 'BERT', 'Transformers'],
    skills: [
      { id: 'nlp_token', name: 'Text Tokenization & Preprocessing', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Byte-Pair Encoding, WordPiece, lemmatization, spaCy pipelines.', estimated_minutes: 90, market_demand: 'High' },
      { id: 'nlp_bert', name: 'BERT & Named Entity Recognition', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['nlp_token'], description: 'Fine-tuning Encoder models for classification and NER extraction.', estimated_minutes: 140, market_demand: 'High' }
    ]
  },

  // --- Software Engineering ---
  {
    roleId: 'fullstack_developer',
    roleName: 'Full Stack Developer',
    category: 'Software Engineering',
    icon: '⚔️',
    description: 'Master complete web app engineering from reactive frontend UIs to secure backend microservices and DBs.',
    marketDemandScore: 97,
    avgSalaryRange: '$105,000 - $165,000',
    trendingTools: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Docker'],
    skills: [
      { id: 'fs_web', name: 'Modern HTML5, CSS3 & Responsive Design', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Flexbox, CSS Grid, semantic HTML, mobile-first design system.', estimated_minutes: 80, market_demand: 'Very High', tools: ['CSS3', 'Tailwind'] },
      { id: 'fs_js', name: 'Modern JavaScript ES6+ & TypeScript', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['fs_web'], description: 'Async/Await, Promises, TypeScript interfaces, generics, DOM events.', estimated_minutes: 120, market_demand: 'Very High', tools: ['TypeScript', 'ES6'] },
      { id: 'fs_react', name: 'React Framework & State Management', category: 'Core Skills', difficulty: 'Intermediate', level: 3, prerequisites: ['fs_js'], description: 'Custom hooks, Context API, state updates, component lifecycle.', estimated_minutes: 150, market_demand: 'Very High', tools: ['React 18', 'Vite'] },
      { id: 'fs_backend', name: 'Node.js / Express REST APIs', category: 'Core Skills', difficulty: 'Intermediate', level: 4, prerequisites: ['fs_js'], description: 'Routing, middleware, JWT authentication, CORS, rate limiting.', estimated_minutes: 140, market_demand: 'Very High', tools: ['Node.js', 'Express'] },
      { id: 'fs_db', name: 'Databases & ORM Integration', category: 'Advanced Skills', difficulty: 'Advanced', level: 5, prerequisites: ['fs_backend'], description: 'PostgreSQL schema, Prisma/Drizzle ORM, database migrations, indexes.', estimated_minutes: 130, market_demand: 'Very High', tools: ['PostgreSQL', 'Prisma'] },
      { id: 'fs_devops', name: 'CI/CD & Cloud Deployment', category: 'Industry Readiness', difficulty: 'Advanced', level: 6, prerequisites: ['fs_db'], description: 'GitHub Actions, Vercel/AWS deployment, environment configuration.', estimated_minutes: 110, market_demand: 'High', tools: ['Docker', 'Vercel'] }
    ]
  },
  {
    roleId: 'backend_developer',
    roleName: 'Backend Developer',
    category: 'Software Engineering',
    icon: '💻',
    description: 'Design robust server architecture, database schemas, distributed caching, and microservices.',
    marketDemandScore: 94,
    avgSalaryRange: '$110,000 - $170,000',
    trendingTools: ['Node.js', 'Go', 'Python', 'PostgreSQL', 'Redis', 'Docker'],
    skills: [
      { id: 'be_api', name: 'RESTful API Architecture & OpenAPI', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'HTTP verbs, status codes, Swagger documentation, payload design.', estimated_minutes: 90, market_demand: 'Very High' },
      { id: 'be_db', name: 'Relational Database Optimization', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['be_api'], description: 'ACID transactions, B-tree indexes, connection pooling, query tuning.', estimated_minutes: 130, market_demand: 'Very High' },
      { id: 'be_cache', name: 'Redis Caching & Pub/Sub', category: 'Advanced Skills', difficulty: 'Advanced', level: 3, prerequisites: ['be_db'], description: 'In-memory caching patterns, invalidation strategies, message queues.', estimated_minutes: 110, market_demand: 'High' }
    ]
  },
  {
    roleId: 'frontend_developer',
    roleName: 'Frontend Engineer',
    category: 'Software Engineering',
    icon: '🎨',
    description: 'Build performant, accessible, and delightful interactive user interfaces with modern web frameworks.',
    marketDemandScore: 93,
    avgSalaryRange: '$100,000 - $155,000',
    trendingTools: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
    skills: [
      { id: 'fe_ui', name: 'UI Components & Component Architecture', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Atomic design, reusability, props typing, CSS modules.', estimated_minutes: 90, market_demand: 'Very High' },
      { id: 'fe_perf', name: 'Web Vitals & Performance Optimization', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['fe_ui'], description: 'Code splitting, memoization, lazy loading assets, LCP/CLS optimization.', estimated_minutes: 120, market_demand: 'Very High' }
    ]
  },
  {
    roleId: 'devops_engineer',
    roleName: 'DevOps & Platform Engineer',
    category: 'Software Engineering',
    icon: '🚀',
    description: 'Automate build pipelines, infrastructure monitoring, container orchestration, and uptime stability.',
    marketDemandScore: 97,
    avgSalaryRange: '$125,000 - $185,000',
    trendingTools: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Prometheus', 'Grafana'],
    skills: [
      { id: 'dev_ci', name: 'Automated CI/CD Pipelines', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'GitHub Actions, automated testing triggers, release versioning.', estimated_minutes: 100, market_demand: 'Very High' },
      { id: 'dev_k8s', name: 'Kubernetes Container Orchestration', category: 'Advanced Skills', difficulty: 'Advanced', level: 2, prerequisites: ['dev_ci'], description: 'Pods, Deployments, Ingress controllers, Helm deployment charts.', estimated_minutes: 160, market_demand: 'Very High' }
    ]
  },

  // --- Cloud & Infrastructure ---
  {
    roleId: 'cloud_engineer',
    roleName: 'Cloud Engineer (AWS / Azure / GCP)',
    category: 'Cloud & Infrastructure',
    icon: '☁️',
    description: 'Deploy, scale, and maintain secure enterprise cloud infrastructure across public cloud platforms.',
    marketDemandScore: 96,
    avgSalaryRange: '$115,000 - $175,000',
    trendingTools: ['AWS', 'Terraform', 'Docker', 'IAM', 'VPC', 'CloudWatch'],
    skills: [
      { id: 'cloud_net', name: 'Cloud Networking & VPC Architecture', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Subnets, Internet Gateways, NAT, Security Groups, Route Tables.', estimated_minutes: 90, market_demand: 'Very High', tools: ['AWS VPC'] },
      { id: 'cloud_aws', name: 'Core AWS Infrastructure (EC2, S3, IAM)', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['cloud_net'], description: 'Identity Access Management policies, S3 storage buckets, EC2 compute.', estimated_minutes: 120, market_demand: 'Very High', tools: ['AWS EC2', 'AWS S3'] },
      { id: 'cloud_iac', name: 'Terraform Infrastructure as Code', category: 'Core Skills', difficulty: 'Intermediate', level: 3, prerequisites: ['cloud_aws'], description: 'HCL syntax, state management, module creation, plan and apply workflows.', estimated_minutes: 140, market_demand: 'Very High', tools: ['Terraform'] },
      { id: 'cloud_sec', name: 'Cloud Compliance & Security Hardening', category: 'Advanced Skills', difficulty: 'Advanced', level: 4, prerequisites: ['cloud_iac'], description: 'Encryption at rest/in transit, KMS keys, GuardDuty, principle of least privilege.', estimated_minutes: 130, market_demand: 'High', tools: ['AWS KMS', 'IAM'] }
    ]
  },
  {
    roleId: 'cloud_architect',
    roleName: 'Cloud Solutions Architect',
    category: 'Cloud & Infrastructure',
    icon: '🏛️',
    description: 'Design multi-region failover cloud architectures, serverless systems, and cost optimization frameworks.',
    marketDemandScore: 98,
    avgSalaryRange: '$145,000 - $225,000',
    trendingTools: ['AWS Well-Architected', 'Terraform', 'Kubernetes', 'Serverless', 'Cost Explorer'],
    skills: [
      { id: 'arch_ha', name: 'High Availability & Disaster Recovery', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Multi-AZ deployments, active-passive failover, RTO/RPO strategies.', estimated_minutes: 110, market_demand: 'Very High' },
      { id: 'arch_serverless', name: 'Serverless Event-Driven Architectures', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['arch_ha'], description: 'AWS Lambda, EventBridge, DynamoDB, API Gateway routing.', estimated_minutes: 140, market_demand: 'Very High' }
    ]
  },

  // --- Cybersecurity ---
  {
    roleId: 'cybersecurity_analyst',
    roleName: 'Cybersecurity Analyst',
    category: 'Cybersecurity',
    icon: '🛡️',
    description: 'Defend network perimeters, analyze SOC security incidents, monitor threats, and enforce security policies.',
    marketDemandScore: 95,
    avgSalaryRange: '$95,000 - $145,000',
    trendingTools: ['Splunk', 'Wireshark', 'Nmap', 'SIEM', 'CrowdStrike'],
    skills: [
      { id: 'sec_net', name: 'Network Security & OSI Model Deep Dive', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Packet analysis with Wireshark, TCP/IP handshakes, DNS attacks.', estimated_minutes: 100, market_demand: 'Very High', tools: ['Wireshark', 'TCP/IP'] },
      { id: 'sec_siem', name: 'SIEM & Security Incident Response', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['sec_net'], description: 'Splunk query language, log aggregation, correlation rules, triage.', estimated_minutes: 130, market_demand: 'Very High', tools: ['Splunk', 'SIEM'] },
      { id: 'sec_pen', name: 'Vulnerability Scanning & OWASP Top 10', category: 'Advanced Skills', difficulty: 'Advanced', level: 3, prerequisites: ['sec_siem'], description: 'Nmap discovery, Nessus scanning, SQLi, XSS, CSRF vulnerability remediation.', estimated_minutes: 160, market_demand: 'Very High', tools: ['Nmap', 'OWASP'] }
    ]
  },
  {
    roleId: 'penetration_tester',
    roleName: 'Penetration Tester / Ethical Hacker',
    category: 'Cybersecurity',
    icon: '⚔️',
    description: 'Simulate real-world cyberattacks on systems, APIs, and infrastructure to discover security vulnerabilities.',
    marketDemandScore: 94,
    avgSalaryRange: '$110,000 - $175,000',
    trendingTools: ['Burp Suite', 'Metasploit', 'Kali Linux', 'Nmap', 'Python'],
    skills: [
      { id: 'pen_recon', name: 'Reconnaissance & OSINT Information Gathering', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Subdomain enumeration, Shodan searching, Google dorking.', estimated_minutes: 90, market_demand: 'Very High' },
      { id: 'pen_exploit', name: 'Web Application Exploitation (Burp Suite)', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['pen_recon'], description: 'Intercepting proxies, parameter tampering, privilege escalation.', estimated_minutes: 150, market_demand: 'Very High' }
    ]
  },

  // --- Web & Product ---
  {
    roleId: 'web_developer',
    roleName: 'Web Developer',
    category: 'Web & Product',
    icon: '🌐',
    description: 'Build fast, dynamic web applications with state-of-the-art web standards and interactive tools.',
    marketDemandScore: 90,
    avgSalaryRange: '$75,000 - $120,000',
    trendingTools: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Git'],
    skills: [
      { id: 'web_html', name: 'HTML5 & Modern CSS Fundamentals', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Document structure, accessibility (a11y), CSS variables, Flexbox.', estimated_minutes: 80, market_demand: 'Very High' },
      { id: 'web_js', name: 'JavaScript DOM & Async Operations', category: 'Foundation', difficulty: 'Beginner', level: 2, prerequisites: ['web_html'], description: 'Event listeners, fetch API, promises, local storage.', estimated_minutes: 110, market_demand: 'Very High' }
    ]
  },

  // --- Databases & Systems ---
  {
    roleId: 'database_engineer',
    roleName: 'Database Engineer',
    category: 'Databases & Systems',
    icon: '🗄️',
    description: 'Architect mission-critical relational & NoSQL databases, query execution plans, and data sharding.',
    marketDemandScore: 91,
    avgSalaryRange: '$110,000 - $165,000',
    trendingTools: ['PostgreSQL', 'MongoDB', 'Redis', 'CockroachDB', 'SQL'],
    skills: [
      { id: 'db_pg', name: 'PostgreSQL Internals & Query Tuning', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'EXPLAIN ANALYZE, WAL logs, vacuuming, GIN/GiST indexes.', estimated_minutes: 120, market_demand: 'Very High' },
      { id: 'db_shard', name: 'Database Sharding & Replication', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['db_pg'], description: 'Primary-replica failover, horizontal sharding, consensus algorithms.', estimated_minutes: 140, market_demand: 'High' }
    ]
  },

  // --- Mobile & Apps ---
  {
    roleId: 'android_developer',
    roleName: 'Android Engineer (Kotlin)',
    category: 'Mobile & Apps',
    icon: '📱',
    description: 'Build native mobile experiences for Android using Kotlin, Jetpack Compose, and Coroutines.',
    marketDemandScore: 91,
    avgSalaryRange: '$100,000 - $155,000',
    trendingTools: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Retrofit', 'Room'],
    skills: [
      { id: 'and_kt', name: 'Kotlin Syntax & Functional Concepts', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'Null safety, extension functions, sealed classes, lambdas.', estimated_minutes: 90, market_demand: 'Very High' },
      { id: 'and_compose', name: 'Jetpack Compose Modern UI', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['and_kt'], description: 'Declarative UI, State, Recomposition, ViewModel integration.', estimated_minutes: 130, market_demand: 'Very High' }
    ]
  },

  // --- Specialized Tech ---
  {
    roleId: 'blockchain_developer',
    roleName: 'Blockchain & Smart Contract Developer',
    category: 'Specialized Tech',
    icon: '⛓️',
    description: 'Develop decentralized applications (dApps), Solidity smart contracts, and Web3 protocol security.',
    marketDemandScore: 89,
    avgSalaryRange: '$120,000 - $190,000',
    trendingTools: ['Solidity', 'Ethereum', 'Hardhat', 'Ethers.js', 'Web3.js'],
    skills: [
      { id: 'bc_sol', name: 'Solidity Smart Contract Programming', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'EVM architecture, gas optimization, events, mappings, modifiers.', estimated_minutes: 110, market_demand: 'High' },
      { id: 'bc_dapp', name: 'Web3 & Ethers.js Frontend Integration', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['bc_sol'], description: 'Wallet connection (MetaMask), contract interaction, event listening.', estimated_minutes: 130, market_demand: 'High' }
    ]
  },
  {
    roleId: 'game_developer',
    roleName: 'Game Developer (Unity / Unreal)',
    category: 'Specialized Tech',
    icon: '🎮',
    description: 'Create interactive 2D/3D video games, physics simulations, and immersive graphics shaders.',
    marketDemandScore: 87,
    avgSalaryRange: '$90,000 - $145,000',
    trendingTools: ['C#', 'Unity', 'Unreal Engine', 'C++', 'Shader Graph'],
    skills: [
      { id: 'game_cs', name: 'C# Programming for Unity Engine', category: 'Foundation', difficulty: 'Beginner', level: 1, prerequisites: [], description: 'MonoBehaviour lifecycle, rigidbodies, colliders, raycasting.', estimated_minutes: 100, market_demand: 'High' },
      { id: 'game_physics', name: 'Game Physics & Vector Mathematics', category: 'Core Skills', difficulty: 'Intermediate', level: 2, prerequisites: ['game_cs'], description: 'Quaternions, linear interpolation (lerp), state machines.', estimated_minutes: 120, market_demand: 'High' }
    ]
  }
];

// Helper service functions
export class MarketIntelligenceEngine {
  
  static getAllRoles(): MarketRoleRequirement[] {
    return PROTOTYPE_MARKET_ROLES;
  }

  static getRolesByCategory(category: string): MarketRoleRequirement[] {
    if (!category || category === 'All Categories') {
      return PROTOTYPE_MARKET_ROLES;
    }
    return PROTOTYPE_MARKET_ROLES.filter(r => r.category === category);
  }

  static searchRoles(query: string): MarketRoleRequirement[] {
    if (!query.trim()) return PROTOTYPE_MARKET_ROLES;
    const q = query.toLowerCase();
    return PROTOTYPE_MARKET_ROLES.filter(r => 
      r.roleName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.trendingTools.some(t => t.toLowerCase().includes(q))
    );
  }

  static getRoleById(roleId: string): MarketRoleRequirement {
    const found = PROTOTYPE_MARKET_ROLES.find(r => r.roleId === roleId || r.roleId.replace('_', '') === roleId.replace('_', ''));
    if (found) return found;
    // Default fallback to Data Scientist if not matched
    return PROTOTYPE_MARKET_ROLES[0];
  }

  static getCareerObject(roleId: string): Career {
    const role = this.getRoleById(roleId);
    return {
      id: role.roleId,
      name: role.roleName,
      category: role.category,
      description: role.description,
      icon: role.icon,
      skills: role.skills,
      marketDemandScore: role.marketDemandScore,
      avgSalaryRange: role.avgSalaryRange,
      trendingTools: role.trendingTools,
      isPrototypeData: true
    };
  }

  static generateAssessmentQuestions(roleId: string): Question[] {
    const role = this.getRoleById(roleId);
    const questions: Question[] = [];

    role.skills.forEach((skill, index) => {
      // Question 1 for this skill
      questions.push({
        id: `q_${skill.id}_1`,
        career_id: role.roleId,
        skill_id: skill.id,
        skill_name: skill.name,
        difficulty: skill.difficulty,
        question: `In real-world ${role.roleName} practice, which principle is most critical for ${skill.name}?`,
        options: [
          `Prioritizing standard best practices and handling edge-cases in ${skill.tools?.[0] || 'core tools'}`,
          `Skipping documentation and running raw unvalidated scripts`,
          `Ignoring system prerequisites and relying on default fallbacks`,
          `Manually copying data without automated validation`
        ],
        correct_answer: 0,
        explanation: `In ${role.roleName} workflows, ${skill.name} requires structured engineering standards and proper handling of edge cases.`
      });

      // Question 2 for this skill
      questions.push({
        id: `q_${skill.id}_2`,
        career_id: role.roleId,
        skill_id: skill.id,
        skill_name: skill.name,
        difficulty: skill.difficulty,
        question: `When optimizing ${skill.name} for performance, which technology choice is standard in current industry practice?`,
        options: [
          `Using ${skill.tools?.[1] || skill.tools?.[0] || 'recommended industry frameworks'} to handle scale`,
          `Writing custom blocking loops without caching or indexing`,
          `Relying exclusively on client-side state without persistent storage`,
          `Disabling logging and monitoring`
        ],
        correct_answer: 0,
        explanation: `Industry standard workflows leverage ${skill.tools?.join(', ') || 'modern toolsets'} for performance and maintainability.`
      });
    });

    return questions;
  }
}
