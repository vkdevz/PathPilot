"""
High-quality curated seed dataset for PathPilot 2.0 PostgreSQL Database.
Includes Careers, Skills, Prerequisites, Multi-Type Resources, and Question Bank.
"""

CAREERS_SEED = [
    {
        "slug": "data-scientist",
        "name": "Data Scientist",
        "category": "Data & Analytics",
        "icon": "🧙",
        "description": "Extract actionable insights and predictive models from complex enterprise data using statistics and machine learning.",
        "market_demand_score": 95,
        "salary_range": "$120,000 - $175,000",
        "skills": ["python-ds", "sql-ds", "stats-ds", "data-analysis", "visualization", "ml-foundations", "deep-learning", "mlops-ds"]
    },
    {
        "slug": "ai-engineer",
        "name": "AI & GenAI Engineer",
        "category": "AI & Emerging Tech",
        "icon": "⚡",
        "description": "Architect autonomous AI agents, fine-tune LLMs, build RAG pipelines, and deploy production ML systems.",
        "market_demand_score": 98,
        "salary_range": "$135,000 - $195,000",
        "skills": ["python-ai", "api-backend", "ml-basics", "llm-genai", "vector-dbs", "ai-agents"]
    },
    {
        "slug": "fullstack-developer",
        "name": "Full Stack Developer",
        "category": "Software Engineering",
        "icon": "⚔️",
        "description": "Build end-to-end scalable web applications from modern reactive frontends to high-performance async backends.",
        "market_demand_score": 92,
        "salary_range": "$110,000 - $160,000",
        "skills": ["frontend-foundations", "react-ts", "backend-fastapi", "databases-sql-nosql"]
    },
    {
        "slug": "cloud-engineer",
        "name": "Cloud & DevOps Engineer",
        "category": "Cloud & Infrastructure",
        "icon": "☁️",
        "description": "Design resilient cloud architectures, automate infrastructure with Terraform, and manage Kubernetes clusters.",
        "market_demand_score": 94,
        "salary_range": "$125,000 - $170,000",
        "skills": ["networking-basics", "aws-core", "terraform-iac", "kubernetes-cloud"]
    },
    {
        "slug": "cybersecurity-analyst",
        "name": "Cybersecurity Analyst",
        "category": "Cybersecurity",
        "icon": "🛡️",
        "description": "Defend systems against vulnerabilities, analyze threat vectors, conduct penetration tests, and secure cloud environments.",
        "market_demand_score": 93,
        "salary_range": "$105,000 - $155,000",
        "skills": ["network-security", "threat-detection", "ethical-hacking"]
    },
    {
        "slug": "data-analyst",
        "name": "Data Analyst",
        "category": "Data & Analytics",
        "icon": "📊",
        "description": "Translate raw business data into actionable executive dashboard stories, KPIs, and strategic reports.",
        "market_demand_score": 89,
        "salary_range": "$80,000 - $115,000",
        "skills": ["excel-advanced", "sql-analyst", "powerbi-tableau", "python-analytics"]
    }
]

SKILLS_SEED = [
    # Data Science & Analytics
    {
        "slug": "python-ds",
        "name": "Python for Data Science",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Master core syntax, data structures, NumPy arrays, and functional programming.",
        "estimated_minutes": 120,
        "prerequisites": []
    },
    {
        "slug": "sql-ds",
        "name": "SQL & Relational DBs",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 2,
        "description": "Querying, multi-table JOINs, aggregations, window functions, and schema design.",
        "estimated_minutes": 90,
        "prerequisites": ["python-ds"]
    },
    {
        "slug": "stats-ds",
        "name": "Statistics & Applied Probability",
        "category": "Foundation",
        "difficulty": "Intermediate",
        "level": 3,
        "description": "Descriptive statistics, hypothesis testing, distributions, p-values, and inference.",
        "estimated_minutes": 150,
        "prerequisites": ["python-ds"]
    },
    {
        "slug": "data-analysis",
        "name": "Pandas & Exploratory Data Cleaning",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 4,
        "description": "Exploratory Data Analysis (EDA), missing value imputation, feature engineering.",
        "estimated_minutes": 110,
        "prerequisites": ["python-ds", "sql-ds"]
    },
    {
        "slug": "visualization",
        "name": "Interactive Data Visualization",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 5,
        "description": "Crafting visual analytics dashboards with Matplotlib, Seaborn, and Plotly.",
        "estimated_minutes": 80,
        "prerequisites": ["data-analysis"]
    },
    {
        "slug": "ml-foundations",
        "name": "Machine Learning Fundamentals",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 6,
        "description": "Regression, Decision Trees, Random Forests, cross-validation, and ROC-AUC.",
        "estimated_minutes": 180,
        "prerequisites": ["stats-ds", "data-analysis"]
    },
    {
        "slug": "deep-learning",
        "name": "Deep Learning & Neural Networks",
        "category": "Advanced Skills",
        "difficulty": "Advanced",
        "level": 7,
        "description": "PyTorch tensors, autograd, CNNs, Transformers, and gradient descent optimization.",
        "estimated_minutes": 210,
        "prerequisites": ["ml-foundations"]
    },
    {
        "slug": "mlops-ds",
        "name": "MLOps & Model Serving",
        "category": "Industry Readiness",
        "difficulty": "Advanced",
        "level": 8,
        "description": "Docker containerization, MLflow tracking, FastAPI model deployment, CI/CD.",
        "estimated_minutes": 160,
        "prerequisites": ["deep-learning"]
    },

    # AI & Emerging Tech
    {
        "slug": "python-ai",
        "name": "Python Async Systems & OOP",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Asyncio concurrency, Pydantic data validation, and modular class architecture.",
        "estimated_minutes": 100,
        "prerequisites": []
    },
    {
        "slug": "api-backend",
        "name": "FastAPI & Microservices Architecture",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 2,
        "description": "Async REST endpoints, OpenAPI docs, middleware, and dependency injection.",
        "estimated_minutes": 110,
        "prerequisites": ["python-ai"]
    },
    {
        "slug": "ml-basics",
        "name": "ML & Deep Learning Basics",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 3,
        "description": "Linear algebra, embeddings, neural networks, PyTorch fundamentals.",
        "estimated_minutes": 140,
        "prerequisites": ["python-ai"]
    },
    {
        "slug": "llm-genai",
        "name": "LLMs & Prompt Engineering",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 4,
        "description": "Structured JSON outputs, prompt chains, token optimization, OpenAI/Claude APIs.",
        "estimated_minutes": 120,
        "prerequisites": ["ml-basics"]
    },
    {
        "slug": "vector-dbs",
        "name": "Vector Databases & RAG Architecture",
        "category": "Advanced Skills",
        "difficulty": "Advanced",
        "level": 5,
        "description": "pgvector, cosine similarity retrieval, chunking strategies, hybrid search.",
        "estimated_minutes": 160,
        "prerequisites": ["llm-genai"]
    },
    {
        "slug": "ai-agents",
        "name": "Autonomous AI Agents & Tool Calling",
        "category": "Advanced Skills",
        "difficulty": "Advanced",
        "level": 6,
        "description": "Multi-step tool calling, memory management, evaluation benchmarks.",
        "estimated_minutes": 180,
        "prerequisites": ["vector-dbs"]
    },

    # Software Engineering
    {
        "slug": "frontend-foundations",
        "name": "Web Foundations (HTML, CSS, Modern JS)",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "DOM manipulation, ES6+ async/await, responsive CSS, browser rendering.",
        "estimated_minutes": 90,
        "prerequisites": []
    },
    {
        "slug": "react-ts",
        "name": "React 18 & TypeScript",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 2,
        "description": "Typed props, custom hooks, React Server Components, state management.",
        "estimated_minutes": 140,
        "prerequisites": ["frontend-foundations"]
    },
    {
        "slug": "backend-fastapi",
        "name": "Async Backend APIs & Auth",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 3,
        "description": "FastAPI REST API design, JWT auth, middleware, error handling.",
        "estimated_minutes": 150,
        "prerequisites": ["react-ts"]
    },
    {
        "slug": "databases-sql-nosql",
        "name": "Relational Databases & ORMs",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 4,
        "description": "PostgreSQL schema normalization, indexing, SQLAlchemy 2.0 async queries.",
        "estimated_minutes": 130,
        "prerequisites": ["backend-fastapi"]
    },

    # Cloud & DevOps
    {
        "slug": "networking-basics",
        "name": "Cloud Networking & VPCs",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "TCP/IP, Subnets, Security Groups, Routing tables, DNS, and TLS certificates.",
        "estimated_minutes": 90,
        "prerequisites": []
    },
    {
        "slug": "aws-core",
        "name": "AWS Core Infrastructure (EC2, S3, IAM)",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 2,
        "description": "Role-based IAM, secure S3 buckets, EC2 auto-scaling groups.",
        "estimated_minutes": 120,
        "prerequisites": ["networking-basics"]
    },
    {
        "slug": "terraform-iac",
        "name": "Infrastructure as Code (Terraform)",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 3,
        "description": "HCL syntax, state management, modular infrastructure provisioning.",
        "estimated_minutes": 140,
        "prerequisites": ["aws-core"]
    },
    {
        "slug": "kubernetes-cloud",
        "name": "Docker Containers & Kubernetes",
        "category": "Advanced Skills",
        "difficulty": "Advanced",
        "level": 4,
        "description": "Multi-stage Docker builds, Pods, Services, Ingress, Helm charts.",
        "estimated_minutes": 170,
        "prerequisites": ["terraform-iac"]
    },

    # Cybersecurity
    {
        "slug": "network-security",
        "name": "Network Protocols & Defense",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "Wireshark packet capture, OSI model, firewalls, and encryption protocols.",
        "estimated_minutes": 100,
        "prerequisites": []
    },
    {
        "slug": "threat-detection",
        "name": "SIEM & Incident Analysis",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 2,
        "description": "SOC log monitoring, anomaly detection, incident response playbooks.",
        "estimated_minutes": 130,
        "prerequisites": ["network-security"]
    },
    {
        "slug": "ethical-hacking",
        "name": "Penetration Testing & OWASP Top 10",
        "category": "Advanced Skills",
        "difficulty": "Advanced",
        "level": 3,
        "description": "Vulnerability scanning, SQL injection, XSS, and security audits.",
        "estimated_minutes": 160,
        "prerequisites": ["threat-detection"]
    },

    # Data Analyst
    {
        "slug": "excel-advanced",
        "name": "Advanced Excel & Financial Modeling",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 1,
        "description": "XLOOKUP, PivotTables, PowerQuery, and statistical formulas.",
        "estimated_minutes": 80,
        "prerequisites": []
    },
    {
        "slug": "sql-analyst",
        "name": "SQL Analytics & Aggregations",
        "category": "Foundation",
        "difficulty": "Beginner",
        "level": 2,
        "description": "GROUP BY, CTEs, window functions (RANK, LEAD, LAG).",
        "estimated_minutes": 100,
        "prerequisites": ["excel-advanced"]
    },
    {
        "slug": "powerbi-tableau",
        "name": "Power BI & Tableau Dashboards",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 3,
        "description": "DAX measures, interactive filters, executive data storytelling.",
        "estimated_minutes": 120,
        "prerequisites": ["sql-analyst"]
    },
    {
        "slug": "python-analytics",
        "name": "Python for Business Reporting",
        "category": "Core Skills",
        "difficulty": "Intermediate",
        "level": 4,
        "description": "Automating reporting scripts using Pandas and Matplotlib.",
        "estimated_minutes": 110,
        "prerequisites": ["sql-analyst"]
    }
]

RESOURCES_SEED = [
    {
        "slug": "res-python-mastery",
        "title": "Python for Data Science & AI Mastery",
        "description": "Complete interactive hands-on course covering NumPy, data manipulation, and modern syntax.",
        "resource_type": "course",
        "difficulty": "Beginner",
        "estimated_minutes": 120,
        "provider": "PathPilot Academy",
        "is_interactive": True,
        "skills": ["python-ds", "python-ai"]
    },
    {
        "slug": "res-sql-interactive-lab",
        "title": "PostgreSQL Querying & Schema Design Lab",
        "description": "Live interactive SQL environment with window functions, joins, and indexing benchmarks.",
        "resource_type": "practice",
        "difficulty": "Beginner",
        "estimated_minutes": 90,
        "provider": "Database Lab",
        "is_interactive": True,
        "skills": ["sql-ds", "sql-analyst", "databases-sql-nosql"]
    },
    {
        "slug": "res-stats-prob-interactive",
        "title": "Applied Statistical Inference & Hypothesis Testing",
        "description": "Deep-dive video lessons and problem sets covering p-values, distributions, and confidence intervals.",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_minutes": 150,
        "provider": "MIT OpenCourseWare",
        "is_interactive": False,
        "skills": ["stats-ds"]
    },
    {
        "slug": "res-pandas-eda-project",
        "title": "Real-World Housing Price Exploratory Data Cleaning",
        "description": "Hands-on data cleaning project handling dirty CSV data, missing values, and outlier treatment.",
        "resource_type": "project",
        "difficulty": "Intermediate",
        "estimated_minutes": 110,
        "provider": "Kaggle Projects",
        "is_interactive": True,
        "skills": ["data-analysis", "visualization"]
    },
    {
        "slug": "res-ml-pipeline-project",
        "title": "Customer Churn Prediction with Scikit-Learn",
        "description": "Train, evaluate, and benchmark Decision Trees and Random Forests on enterprise customer data.",
        "resource_type": "project",
        "difficulty": "Intermediate",
        "estimated_minutes": 180,
        "provider": "DataCamp Projects",
        "is_interactive": True,
        "skills": ["ml-foundations", "ml-basics"]
    },
    {
        "slug": "res-rag-agent-workshop",
        "title": "Building Production RAG Systems with pgvector & LLMs",
        "description": "Complete architecture guide and GitHub repository for semantic search and agentic tool calling.",
        "resource_type": "project",
        "difficulty": "Advanced",
        "estimated_minutes": 180,
        "provider": "AI Engineering Hub",
        "is_interactive": True,
        "skills": ["llm-genai", "vector-dbs", "ai-agents"]
    },
    {
        "slug": "res-react-fastapi-fullstack",
        "title": "Full Stack Next.js & FastAPI Microservice Tutorial",
        "description": "Build modern responsive dashboards connected to async FastAPI REST and WebSocket endpoints.",
        "resource_type": "course",
        "difficulty": "Intermediate",
        "estimated_minutes": 150,
        "provider": "FullStack Open",
        "is_interactive": True,
        "skills": ["react-ts", "backend-fastapi", "frontend-foundations"]
    },
    {
        "slug": "res-terraform-aws-lab",
        "title": "Automated Cloud Provisioning with Terraform & AWS",
        "description": "Deploy secure VPCs, EC2 instances, and RDS databases using modular Terraform scripts.",
        "resource_type": "practice",
        "difficulty": "Intermediate",
        "estimated_minutes": 140,
        "provider": "Cloud Native Lab",
        "is_interactive": True,
        "skills": ["aws-core", "terraform-iac", "networking-basics"]
    },
    {
        "slug": "res-threat-hunting-siem",
        "title": "SOC Threat Detection & Wireshark Analysis",
        "description": "Interactive packet inspection and incident triage against simulated cyberattacks.",
        "resource_type": "practice",
        "difficulty": "Intermediate",
        "estimated_minutes": 130,
        "provider": "TryHackMe Lab",
        "is_interactive": True,
        "skills": ["network-security", "threat-detection"]
    }
]

QUESTIONS_SEED = [
    # Data Science Questions
    {
        "career_slug": "data-scientist",
        "skill_slug": "python-ds",
        "difficulty": "Beginner",
        "question_text": "Which Python data structure preserves insertion order while guaranteeing unique elements in Python 3.7+?",
        "options": ["List", "Set", "Dictionary Keys", "Tuple"],
        "correct_answer_index": 2,
        "explanation": "Starting in Python 3.7+, dictionaries maintain insertion order while guaranteeing distinct keys."
    },
    {
        "career_slug": "data-scientist",
        "skill_slug": "sql-ds",
        "difficulty": "Beginner",
        "question_text": "Which SQL clause is used to filter aggregated group results rather than individual table rows?",
        "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
        "correct_answer_index": 1,
        "explanation": "HAVING filters groups produced by GROUP BY and aggregations, whereas WHERE filters individual rows prior to grouping."
    },
    {
        "career_slug": "data-scientist",
        "skill_slug": "stats-ds",
        "difficulty": "Intermediate",
        "question_text": "What does a p-value of 0.03 indicate when evaluating a statistical hypothesis at a 5% (0.05) alpha significance level?",
        "options": [
            "The null hypothesis has a 97% probability of being true.",
            "There is insufficient evidence to reject the null hypothesis.",
            "The observed data is improbable under the null hypothesis, providing statistical evidence to reject it.",
            "The predictive model achieved 97% classification accuracy."
        ],
        "correct_answer_index": 2,
        "explanation": "A p-value (0.03) lower than the significance threshold (0.05) provides statistically significant evidence to reject the null hypothesis."
    },
    {
        "career_slug": "data-scientist",
        "skill_slug": "data-analysis",
        "difficulty": "Intermediate",
        "question_text": "In Pandas, which method allows filling missing NaN values using forward-fill propagation?",
        "options": ["df.dropna()", "df.fillna(method='ffill')", "df.replace_na()", "df.impute()"],
        "correct_answer_index": 1,
        "explanation": "df.fillna(method='ffill') or df.ffill() propagates the last valid observation forward to fill missing values."
    },
    {
        "career_slug": "data-scientist",
        "skill_slug": "ml-foundations",
        "difficulty": "Intermediate",
        "question_text": "How does Random Forest reduce the high variance and overfitting typical of individual Decision Trees?",
        "options": [
            "By pruning all tree branches to a maximum depth of 2.",
            "By bagging (bootstrap aggregating) multiple trees and selecting random feature subsets at each split.",
            "By running standard gradient descent on linear regression weights.",
            "By increasing training dataset size using synthetic noise."
        ],
        "correct_answer_index": 1,
        "explanation": "Random Forest builds diverse de-correlated decision trees trained on bootstrap samples and aggregates their predictions to reduce variance."
    },

    # AI Engineer Questions
    {
        "career_slug": "ai-engineer",
        "skill_slug": "llm-genai",
        "difficulty": "Intermediate",
        "question_text": "Which mechanism guarantees that an LLM returns output strictly complying with a target JSON schema?",
        "options": [
            "Adding 'Please reply in JSON' to the system prompt.",
            "Using Structured Outputs / JSON schema mode with constrained token sampling.",
            "Increasing temperature parameter to 1.8.",
            "Decreasing max_tokens to 10."
        ],
        "correct_answer_index": 1,
        "explanation": "Structured Outputs API uses grammar-constrained token sampling to strictly enforce valid JSON schema adhering paths."
    },
    {
        "career_slug": "ai-engineer",
        "skill_slug": "vector-dbs",
        "difficulty": "Advanced",
        "question_text": "In PostgreSQL with pgvector, which index type provides fast approximate nearest neighbor (ANN) vector search for cosine distance?",
        "options": ["B-Tree", "HNSW / IVFFlat with vector_cosine_ops", "GIN index", "BRIN index"],
        "correct_answer_index": 1,
        "explanation": "HNSW and IVFFlat indexes in pgvector index embeddings for sub-millisecond approximate cosine distance queries."
    },
    {
        "career_slug": "ai-engineer",
        "skill_slug": "ai-agents",
        "difficulty": "Advanced",
        "question_text": "In autonomous agent workflows, what is the primary purpose of tool-calling schemas?",
        "options": [
            "To execute arbitrary code on the client browser.",
            "To provide the model with typed function definitions so it can output structured invocation parameters.",
            "To speed up token generation latency by 50%.",
            "To bypass rate limits on external APIs."
        ],
        "correct_answer_index": 1,
        "explanation": "Tool-calling schemas give the model clear function signatures and parameter schemas so it can choose when and how to call external tools."
    },

    # Cloud Engineer Questions
    {
        "career_slug": "cloud-engineer",
        "skill_slug": "terraform-iac",
        "difficulty": "Intermediate",
        "question_text": "In Terraform, what file stores the current state mapping of code declarations to real-world cloud infrastructure?",
        "options": ["terraform.tfvars", "terraform.tfstate", "main.tf", "provider.tf"],
        "correct_answer_index": 1,
        "explanation": "terraform.tfstate tracks the state of deployed resources to determine necessary creation, update, or deletion actions."
    },
    {
        "career_slug": "cloud-engineer",
        "skill_slug": "kubernetes-cloud",
        "difficulty": "Advanced",
        "question_text": "In Kubernetes, which controller ensures a specified number of Pod replicas are running across worker nodes at all times?",
        "options": ["Deployment / ReplicaSet", "ConfigMap", "Ingress", "PersistentVolumeClaim"],
        "correct_answer_index": 0,
        "explanation": "A ReplicaSet / Deployment maintains a stable set of replica Pods running at any given time."
    },

    # Full Stack Questions
    {
        "career_slug": "fullstack-developer",
        "skill_slug": "react-ts",
        "difficulty": "Intermediate",
        "question_text": "In React 18, what is the primary benefit of React Server Components (RSC)?",
        "options": [
            "They run exclusively in local storage.",
            "They execute on the server, keeping large dependencies out of client JS bundles and reducing hydration overhead.",
            "They replace CSS with JavaScript variables automatically.",
            "They enable direct write access to client file systems."
        ],
        "correct_answer_index": 1,
        "explanation": "React Server Components execute only on the server, sending zero JavaScript bundle weight for rendered content to the client."
    },

    # Cybersecurity Questions
    {
        "career_slug": "cybersecurity-analyst",
        "skill_slug": "threat-detection",
        "difficulty": "Intermediate",
        "question_text": "In cybersecurity defense, what does a SIEM (Security Information and Event Management) system primarily do?",
        "options": [
            "Encrypts hard drives on end-user laptops.",
            "Aggregates, correlates, and analyzes security logs from multiple network devices in real-time to detect threats.",
            "Automatically pays ransomware demands.",
            "Replaces network routers with cloud firewalls."
        ],
        "correct_answer_index": 1,
        "explanation": "SIEM systems aggregate and correlate log data from network devices, servers, and firewalls to detect anomalies and security incidents."
    }
]
