import json
import asyncio



CAREERS_DATA = [
  # Data & Analytics
  {
    "id": "data_scientist",
    "category": "Data & Analytics",
    "name": "Data Scientist",
    "description": "Extract insights from complex data using statistics, machine learning, and predictive modeling.",
    "icon": "🧙",
    "skills": [
      { "id": "python_ds", "name": "Python for Data Science", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Master Python syntax, NumPy, and core data structures.", "estimated_minutes": 120 },
      { "id": "sql_ds", "name": "SQL & Relational DBs", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["python_ds"], "description": "Querying, aggregations, window functions, and schema design.", "estimated_minutes": 90 },
      { "id": "stats_ds", "name": "Statistics & Probability", "category": "Foundation", "difficulty": "Intermediate", "level": 3, "prerequisites": ["python_ds"], "description": "Descriptive statistics, hypothesis testing, distributions, p-values.", "estimated_minutes": 150 },
      { "id": "data_analysis", "name": "Pandas & Data Cleaning", "category": "Core Skills", "difficulty": "Intermediate", "level": 4, "prerequisites": ["python_ds", "sql_ds"], "description": "Exploratory Data Analysis (EDA), missing values, feature scaling.", "estimated_minutes": 110 },
      { "id": "visualization", "name": "Data Visualization", "category": "Core Skills", "difficulty": "Intermediate", "level": 5, "prerequisites": ["data_analysis"], "description": "Matplotlib, Seaborn, interactive dashboards.", "estimated_minutes": 80 },
      { "id": "ml_foundations", "name": "Machine Learning Fundamentals", "category": "Core Skills", "difficulty": "Intermediate", "level": 6, "prerequisites": ["stats_ds", "data_analysis"], "description": "Linear regression, decision trees, random forests, model evaluation.", "estimated_minutes": 180 },
      { "id": "deep_learning", "name": "Deep Learning & Neural Nets", "category": "Advanced Skills", "difficulty": "Advanced", "level": 7, "prerequisites": ["ml_foundations"], "description": "PyTorch, CNNs, Transformers, optimization techniques.", "estimated_minutes": 210 },
      { "id": "mlops_ds", "name": "MLOps & Model Deployment", "category": "Industry Readiness", "difficulty": "Advanced", "level": 8, "prerequisites": ["deep_learning"], "description": "Docker, MLflow, FastAPI model serving, continuous monitoring.", "estimated_minutes": 160 }
    ]
  },
  {
    "id": "data_analyst",
    "category": "Data & Analytics",
    "name": "Data Analyst",
    "description": "Transform raw business data into actionable dashboard stories and strategic reports.",
    "icon": "📊",
    "skills": [
      { "id": "excel_advanced", "name": "Advanced Excel & Data Modeling", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "VLOOKUP, PivotTables, PowerQuery, statistical formulas.", "estimated_minutes": 80 },
      { "id": "sql_analyst", "name": "SQL Querying & Analytics", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["excel_advanced"], "description": "SELECT, JOINs, GROUP BY, aggregations, window functions.", "estimated_minutes": 100 },
      { "id": "powerbi_tableau", "name": "Power BI & Tableau Storytelling", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["sql_analyst"], "description": "DAX expressions, dynamic interactive dashboards, stakeholder reporting.", "estimated_minutes": 120 },
      { "id": "python_analytics", "name": "Python for Business Analytics", "category": "Core Skills", "difficulty": "Intermediate", "level": 4, "prerequisites": ["sql_analyst"], "description": "Pandas data cleaning, automated reporting scripts.", "estimated_minutes": 110 }
    ]
  },
  {
    "id": "data_engineer",
    "category": "Data & Analytics",
    "name": "Data Engineer",
    "description": "Architect scalable data pipelines, data warehouses, and real-time streaming architectures.",
    "icon": "⚙️",
    "skills": [
      { "id": "sql_advanced", "name": "Advanced SQL & Database Systems", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "PostgreSQL indexing, query optimization, data warehousing.", "estimated_minutes": 110 },
      { "id": "python_de", "name": "Python & Data Engineering", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["sql_advanced"], "description": "ETL pipeline development, OOP, API integrations.", "estimated_minutes": 130 },
      { "id": "spark_hadoop", "name": "Apache Spark & Big Data", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["python_de"], "description": "Distributed computing, PySpark DataFrames, streaming.", "estimated_minutes": 160 },
      { "id": "airflow_orchestration", "name": "Apache Airflow & DAGs", "category": "Advanced Skills", "difficulty": "Advanced", "level": 4, "prerequisites": ["spark_hadoop"], "description": "Workflow orchestration, scheduling, dependency pipelines.", "estimated_minutes": 140 }
    ]
  },

  # AI & Emerging Tech
  {
    "id": "ai_engineer",
    "category": "AI & Emerging Tech",
    "name": "AI Engineer",
    "description": "Build cutting-edge Generative AI applications, LLM agents, and autonomous AI microservices.",
    "icon": "⚡",
    "skills": [
      { "id": "python_ai", "name": "Python & Async Systems", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Asyncio, functional concepts, object-oriented design.", "estimated_minutes": 100 },
      { "id": "api_backend", "name": "FastAPI & Microservices", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["python_ai"], "description": "High-performance APIs, Pydantic, async endpoints.", "estimated_minutes": 110 },
      { "id": "ml_basics", "name": "ML & Deep Learning Basics", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["python_ai"], "description": "Neural networks, PyTorch, embeddings.", "estimated_minutes": 140 },
      { "id": "llm_genai", "name": "LLMs & Prompt Engineering", "category": "Core Skills", "difficulty": "Intermediate", "level": 4, "prerequisites": ["ml_basics"], "description": "OpenAI/Claude APIs, HuggingFace transformers, structured JSON output.", "estimated_minutes": 120 },
      { "id": "vector_dbs", "name": "Vector DBs & RAG Architecture", "category": "Advanced Skills", "difficulty": "Advanced", "level": 5, "prerequisites": ["llm_genai"], "description": "ChromaDB, Pinecone, LangChain, semantic search.", "estimated_minutes": 160 },
      { "id": "ai_agents", "name": "Autonomous AI Agents", "category": "Advanced Skills", "difficulty": "Advanced", "level": 6, "prerequisites": ["vector_dbs"], "description": "Tool calling, multi-agent orchestration, LangGraph.", "estimated_minutes": 180 }
    ]
  },
  {
    "id": "llm_engineer",
    "category": "AI & Emerging Tech",
    "name": "LLM & GenAI Engineer",
    "description": "Fine-tune Large Language Models, optimize context windows, and serve open-weights models.",
    "icon": "🧠",
    "skills": [
      { "id": "python_llm", "name": "Python & PyTorch Core", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Tensors, autograd, PyTorch module development.", "estimated_minutes": 120 },
      { "id": "transformer_arch", "name": "Transformer Architecture & Attention", "category": "Core Skills", "difficulty": "Intermediate", "level": 2, "prerequisites": ["python_llm"], "description": "Self-attention math, Positional Encodings, KV-Cache.", "estimated_minutes": 150 },
      { "id": "fine_tuning", "name": "LoRA & PEFT Fine-Tuning", "category": "Advanced Skills", "difficulty": "Advanced", "level": 3, "prerequisites": ["transformer_arch"], "description": "QLoRA, DeepSpeed, HuggingFace TRL, SFT & DPO training.", "estimated_minutes": 180 },
      { "id": "llm_serving", "name": "vLLM & Inference Optimization", "category": "Industry Readiness", "difficulty": "Advanced", "level": 4, "prerequisites": ["fine_tuning"], "description": "vLLM, TensorRT-LLM, GGUF/AWQ quantization, GPU batching.", "estimated_minutes": 160 }
    ]
  },

  # Cloud & Infrastructure
  {
    "id": "cloud_engineer",
    "category": "Cloud & Infrastructure",
    "name": "Cloud Engineer (AWS/Azure)",
    "description": "Deploy, secure, and manage scalable cloud infrastructure and serverless services.",
    "icon": "☁️",
    "skills": [
      { "id": "networking_basics", "name": "Cloud Networking & VPCs", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Subnets, Security Groups, DNS, Routing tables, VPNs.", "estimated_minutes": 90 },
      { "id": "aws_core", "name": "AWS Core Services (EC2, S3, IAM)", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["networking_basics"], "description": "Identity access management, EC2 instances, S3 storage buckets.", "estimated_minutes": 120 },
      { "id": "terraform_iac", "name": "Infrastructure as Code (Terraform)", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["aws_core"], "description": "HCL syntax, state files, Terraform modules.", "estimated_minutes": 140 },
      { "id": "kubernetes_cloud", "name": "Docker & Kubernetes (EKS)", "category": "Advanced Skills", "difficulty": "Advanced", "level": 4, "prerequisites": ["terraform_iac"], "description": "Containerization, Pods, Deployments, Helm charts.", "estimated_minutes": 170 }
    ]
  },

  # Cybersecurity
  {
    "id": "cybersecurity_analyst",
    "category": "Cybersecurity",
    "name": "Cybersecurity Analyst",
    "description": "Protect digital infrastructure, detect threats, and defend networks against cyberattacks.",
    "icon": "🛡️",
    "skills": [
      { "id": "network_security", "name": "Network Security & Protocols", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "TCP/IP, Wireshark, OSI Model, Firewalls.", "estimated_minutes": 100 },
      { "id": "threat_detection", "name": "SIEM & Threat Hunting", "category": "Core Skills", "difficulty": "Intermediate", "level": 2, "prerequisites": ["network_security"], "description": "Splunk, SOC log analysis, intrusion detection.", "estimated_minutes": 130 },
      { "id": "ethical_hacking", "name": "Penetration Testing Fundamentals", "category": "Advanced Skills", "difficulty": "Advanced", "level": 3, "prerequisites": ["threat_detection"], "description": "Metasploit, Nmap, vulnerability assessment, OWASP Top 10.", "estimated_minutes": 160 }
    ]
  },

  # Software Engineering & Web
  {
    "id": "fullstack_developer",
    "category": "Software Engineering",
    "name": "Full Stack Developer",
    "description": "Master end-to-end full stack development from interactive UI frontend to backend APIs and databases.",
    "icon": "⚔️",
    "skills": [
      { "id": "frontend_foundations", "name": "Frontend (HTML, CSS, JS)", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Web architecture, modern JS ES6+, responsive layout.", "estimated_minutes": 90 },
      { "id": "react_ts", "name": "React & TypeScript", "category": "Foundation", "difficulty": "Intermediate", "level": 2, "prerequisites": ["frontend_foundations"], "description": "Typed props, interfaces, hooks, state management.", "estimated_minutes": 140 },
      { "id": "backend_node_py", "name": "Backend APIs (Node/FastAPI)", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["react_ts"], "description": "REST endpoints, middleware, JWT auth tokens.", "estimated_minutes": 150 },
      { "id": "databases_sql_nosql", "name": "Databases (SQL & NoSQL)", "category": "Core Skills", "difficulty": "Intermediate", "level": 4, "prerequisites": ["backend_node_py"], "description": "PostgreSQL, MongoDB, ORMs, indexing.", "estimated_minutes": 130 }
    ]
  },
  {
    "id": "web_developer",
    "category": "Software Engineering",
    "name": "Web Developer",
    "description": "Design modern responsive user interfaces and interactive web applications.",
    "icon": "🌐",
    "skills": [
      { "id": "html_css", "name": "HTML5 & Modern CSS", "category": "Foundation", "difficulty": "Beginner", "level": 1, "prerequisites": [], "description": "Flexbox, Grid, CSS Variables, Responsive Design.", "estimated_minutes": 80 },
      { "id": "js_modern", "name": "Modern JavaScript ES6+", "category": "Foundation", "difficulty": "Beginner", "level": 2, "prerequisites": ["html_css"], "description": "DOM manipulation, Async/Await, Fetch API.", "estimated_minutes": 120 },
      { "id": "react_core", "name": "React Framework", "category": "Core Skills", "difficulty": "Intermediate", "level": 3, "prerequisites": ["js_modern"], "description": "Components, JSX, Hooks, State management.", "estimated_minutes": 150 }
    ]
  }
]

QUESTIONS_DATA = [
  # Data Scientist
  {
    "id": "q_py_1",
    "career_id": "data_scientist",
    "skill_id": "python_ds",
    "skill_name": "Python for Data Science",
    "difficulty": "Beginner",
    "question": "Which Python data structure maintains insertion order and guarantees unique elements?",
    "options": ["List", "Set", "Dictionary (Python 3.7+)", "Tuple"],
    "correct_answer": 2,
    "explanation": "Starting in Python 3.7+, dictionaries preserve insertion order while maintaining unique keys."
  },
  {
    "id": "q_stats_1",
    "career_id": "data_scientist",
    "skill_id": "stats_ds",
    "skill_name": "Statistics & Probability",
    "difficulty": "Intermediate",
    "question": "What does a p-value of 0.03 indicate when testing a hypothesis at a 5% (0.05) significance level?",
    "options": [
      "The probability that the null hypothesis is 100% true",
      "There is insufficient evidence to reject the null hypothesis",
      "The observed data is improbable under the null hypothesis, so we reject the null hypothesis",
      "The model has a 97% accuracy score"
    ],
    "correct_answer": 2,
    "explanation": "A p-value (0.03) lower than alpha (0.05) provides statistically significant evidence to reject the null hypothesis."
  },

  # AI Engineer
  {
    "id": "q_ai_1",
    "career_id": "ai_engineer",
    "skill_id": "llm_genai",
    "skill_name": "LLMs & Prompt Engineering",
    "difficulty": "Intermediate",
    "question": "What techniques ensure an LLM returns responses adhering strictly to a valid JSON schema?",
    "options": [
      "Asking politely in text",
      "Using Structured Outputs / JSON mode with Pydantic JSON Schema enforcement",
      "Increasing temperature parameter to 1.5",
      "Adding dummy characters in system prompts"
    ],
    "correct_answer": 1,
    "explanation": "Structured Outputs API or JSON schema mode constrains output token sampling to valid schema paths."
  },

  # Cloud Engineer
  {
    "id": "q_cloud_1",
    "career_id": "cloud_engineer",
    "skill_id": "terraform_iac",
    "skill_name": "Infrastructure as Code (Terraform)",
    "difficulty": "Intermediate",
    "question": "In Terraform, what file tracks the current state of real-world infrastructure infrastructure deployments?",
    "options": ["terraform.tfvars", "terraform.tfstate", "main.tf", "provider.tf"],
    "correct_answer": 1,
    "explanation": "terraform.tfstate maps resources defined in code to actual cloud resources."
  }
]

def seed():
    from database.seed import seed_database
    asyncio.run(seed_database())


if __name__ == "__main__":
    seed()

