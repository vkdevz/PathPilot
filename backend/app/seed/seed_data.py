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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "Data & Analytics",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "AI & Emerging Tech",
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
        "domain": "Software Engineering",
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
        "domain": "Software Engineering",
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
        "domain": "Software Engineering",
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
        "domain": "Software Engineering",
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
        "domain": "Cloud & Infrastructure",
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
        "domain": "Cloud & Infrastructure",
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
        "domain": "Cloud & Infrastructure",
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
        "domain": "Cloud & Infrastructure",
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
        "domain": "Cybersecurity",
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
        "domain": "Cybersecurity",
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
        "domain": "Cybersecurity",
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
        "domain": "Data Analytics & BI",
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
        "domain": "Data Analytics & BI",
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
        "domain": "Data Analytics & BI",
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
        "domain": "Data Analytics & BI",
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
        "description": "Complete interactive hands-on course covering NumPy, data manipulation, vectorization, and modern Python 3.12 syntax.",
        "resource_type": "course",
        "url": "https://docs.python.org/3/tutorial/",
        "difficulty": "Beginner",
        "estimated_minutes": 120,
        "provider": "PathPilot Academy",
        "is_interactive": True,
        "skills": ["python-ds", "python-ai"],
        "content": """## Overview

Python is the foundational language for modern Data Science, Machine Learning, and Artificial Intelligence workflows. Mastering idiomatic Python syntax, vectorized operations with NumPy, and memory-efficient data structures is essential for engineering high-performance models.

### Key Learning Objectives

1. **Idiomatic Python 3.12 Features**: Structural pattern matching, type hints (`typing`), and generator expressions.
2. **Vectorization with NumPy**: Replacing slow Python loops with SIMD-accelerated array broadcasting.
3. **Memory Optimization**: In-place operations, slicing vs copying, and generator-based streaming.
4. **Defensive Programming**: Robust exception handling, unit testing, and type validation.

### Vectorized Feature Processing Pattern

The snippet below demonstrates vectorization with NumPy compared against iterative calculation:

```python
import numpy as np

def compute_z_scores(features: np.ndarray) -> np.ndarray:
    \"\"\"
    Vectorized calculation of standard Z-scores across input feature columns.
    Subtracts column means and divides by standard deviations in a single SIMD pass.
    \"\"\"
    mean = np.mean(features, axis=0)
    std = np.std(features, axis=0)
    # Guard against division by zero for constant features
    std_safe = np.where(std == 0, 1.0, std)
    return (features - mean) / std_safe

# Example Demonstration
if __name__ == "__main__":
    sample_data = np.array([
        [10.0, 200.0],
        [12.0, 240.0],
        [11.5, 210.0],
        [14.0, 310.0]
    ])
    normalized = compute_z_scores(sample_data)
    print("Normalized Features (Z-Score):\\n", np.round(normalized, 3))
```

### Practical Assessment Checkpoint
- [ ] Understand array broadcasting rules across differing tensor ranks.
- [ ] Implement custom vectorized transformations without `for` loops.
- [ ] Profile memory usage using Python's `tracemalloc` module.
"""
    },
    {
        "slug": "res-sql-interactive-lab",
        "title": "PostgreSQL Querying & Schema Design Lab",
        "description": "Live interactive SQL environment with window functions, joins, CTEs, and indexing benchmarks.",
        "resource_type": "practice",
        "url": "https://www.postgresql.org/docs/current/tutorial-sql.html",
        "difficulty": "Beginner",
        "estimated_minutes": 90,
        "provider": "Database Lab",
        "is_interactive": True,
        "skills": ["sql-ds", "sql-analyst", "databases-sql-nosql"],
        "content": """## Overview

Relational databases remain the backbone of transactional and analytical data systems. Writing high-throughput SQL queries requires understanding query execution plans (`EXPLAIN ANALYZE`), window aggregation functions, and B-Tree indexing strategies.

### Core Concepts

1. **Common Table Expressions (CTEs)**: Structuring complex multi-stage transformations for clarity and reuse.
2. **Window Functions**: Performing rolling calculations (`ROW_NUMBER()`, `RANK()`, `LEAD()`, `LAG()`) without collapsing rows.
3. **Index Optimization**: Composite indexing, partial indexes, and preventing sequential table scans.
4. **ACID Transaction Isolation**: Understanding dirty reads, non-repeatable reads, and serializable transactions.

### Production Window Analytics Query

```sql
-- Calculate rolling 7-day user engagement and rank cohort top performers
WITH daily_activity AS (
    SELECT 
        user_id,
        DATE(created_at) AS study_date,
        SUM(time_spent_minutes) AS total_minutes,
        COUNT(id) AS completions_count
    FROM progress
    WHERE status = 'completed'
    GROUP BY user_id, DATE(created_at)
)
SELECT 
    user_id,
    study_date,
    total_minutes,
    AVG(total_minutes) OVER (
        PARTITION BY user_id 
        ORDER BY study_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg_minutes,
    DENSE_RANK() OVER (
        PARTITION BY study_date 
        ORDER BY total_minutes DESC
    ) AS daily_rank
FROM daily_activity
ORDER BY study_date DESC, daily_rank ASC;
```

### Lab Verification Steps
1. Execute `EXPLAIN ANALYZE` on filtering queries to verify index scans.
2. Compare window aggregations against subquery self-joins to inspect execution cost.
"""
    },
    {
        "slug": "res-stats-prob-interactive",
        "title": "Applied Statistical Inference & Hypothesis Testing",
        "description": "Deep-dive video lessons and problem sets covering p-values, distributions, and confidence intervals.",
        "resource_type": "course",
        "url": "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/",
        "difficulty": "Intermediate",
        "estimated_minutes": 150,
        "provider": "MIT OpenCourseWare",
        "is_interactive": False,
        "skills": ["stats-ds"],
        "content": """## Overview

Statistical inference bridges raw data observations with scientifically grounded conclusions. This module covers probability distributions, hypothesis testing (Z-tests, T-tests, Chi-Square), p-values, and statistical power in A/B testing.

### Key Topics

1. **Central Limit Theorem**: How sample means converge toward a normal distribution as sample size grows.
2. **Hypothesis Formulations**: Formulating null ($H_0$) and alternative ($H_1$) hypotheses.
3. **Type I and Type II Errors**: Balancing false discovery rate ($\\\\alpha$) against test power ($1 - \\\\beta$).
4. **Bootstrapping & Resampling**: Estimating empirical confidence intervals for non-parametric metrics.

### Two-Sample Hypothesis Testing in Python

```python
import numpy as np
from scipy import stats

def evaluate_ab_experiment(control_metric: list, treatment_metric: list, alpha: float = 0.05) -> dict:
    \"\"\"
    Performs Welch's two-sample t-test (assumes unequal variances).
    \"\"\"
    c_arr = np.array(control_metric)
    t_arr = np.array(treatment_metric)
    
    t_stat, p_val = stats.ttest_ind(t_arr, c_arr, equal_var=False)
    lift = (np.mean(t_arr) - np.mean(c_arr)) / np.mean(c_arr) * 100.0
    
    return {
        "control_mean": round(float(np.mean(c_arr)), 3),
        "treatment_mean": round(float(np.mean(t_arr)), 3),
        "relative_lift_pct": round(lift, 2),
        "p_value": round(float(p_val), 5),
        "is_statistically_significant": bool(p_val < alpha)
    }

# Demonstration
control = [4.2, 5.1, 4.8, 5.0, 4.9, 5.2, 4.7]
treatment = [5.5, 5.8, 5.4, 6.0, 5.7, 5.9, 5.6]
results = evaluate_ab_experiment(control, treatment)
print("Experiment Results:", results)
```
"""
    },
    {
        "slug": "res-pandas-eda-project",
        "title": "Real-World Housing Price Exploratory Data Cleaning",
        "description": "Hands-on data cleaning project handling dirty CSV data, missing values, and outlier treatment.",
        "resource_type": "project",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "difficulty": "Intermediate",
        "estimated_minutes": 110,
        "provider": "Kaggle Projects",
        "is_interactive": True,
        "skills": ["data-analysis", "visualization"],
        "content": """## Overview

Raw enterprise datasets are rarely clean. Real-world machine learning requires robust data wrangling: handling missing values, encoding high-cardinality categorical features, detecting anomalous outliers, and extracting signal from noisy data.

### Project Milestones

1. **Data Ingestion & Type Inference**: Parsing datetime strings, casting categorical types, and inspecting null percentages.
2. **Imputation Strategies**: Median imputation for skewed numerics, mode imputation for categories, and KNN imputation.
3. **Outlier Filtering**: Using Interquartile Range (IQR) and Z-score thresholds to identify contaminated measurements.
4. **Feature Encoding**: One-Hot Encoding vs Target Smoothing for categorical columns.

### Clean Data Pipeline Implementation

```python
import pandas as pd
import numpy as np

def clean_housing_dataset(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    
    # 1. Handle missing continuous values with median
    if 'sqft' in cleaned.columns:
        cleaned['sqft'] = cleaned['sqft'].fillna(cleaned['sqft'].median())
        
    # 2. Filter severe outliers via IQR on price
    if 'price' in cleaned.columns:
        q25 = cleaned['price'].quantile(0.25)
        q75 = cleaned['price'].quantile(0.75)
        iqr = q75 - q25
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        cleaned = cleaned[(cleaned['price'] >= lower_bound) & (cleaned['price'] <= upper_bound)]
        
    # 3. Log-transform skewed target
    cleaned['log_price'] = np.log1p(cleaned['price'])
    return cleaned
```
"""
    },
    {
        "slug": "res-ml-pipeline-project",
        "title": "Customer Churn Prediction with Scikit-Learn",
        "description": "Train, evaluate, and benchmark Decision Trees and Random Forests on enterprise customer data.",
        "resource_type": "project",
        "url": "https://scikit-learn.org/stable/tutorial/",
        "difficulty": "Intermediate",
        "estimated_minutes": 180,
        "provider": "DataCamp Projects",
        "is_interactive": True,
        "skills": ["ml-foundations", "ml-basics"],
        "content": """## Overview

Customer churn prediction is a quintessential supervised classification task. In this project, you will build an end-to-end Scikit-Learn training pipeline incorporating feature scaling, stratified k-fold cross-validation, hyperparameter tuning, and ROC-AUC benchmarking.

### Architecture Workflow

```
Raw Telemetry Data ➔ Preprocessor (Scaling + OneHot) ➔ RandomForest Classifier ➔ Threshold Calibration ➔ Deployable Artifact
```

### Complete Machine Learning Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

def build_churn_pipeline(numeric_features: list[str], categorical_features: list[str]) -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ]
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42))
    ])
    return pipeline
```
"""
    },
    {
        "slug": "res-rag-agent-workshop",
        "title": "Building Production RAG Systems with pgvector & LLMs",
        "description": "Complete architecture guide and GitHub repository for semantic search and agentic tool calling.",
        "resource_type": "project",
        "url": "https://github.com/pgvector/pgvector",
        "difficulty": "Advanced",
        "estimated_minutes": 180,
        "provider": "AI Engineering Hub",
        "is_interactive": True,
        "skills": ["llm-genai", "vector-dbs", "ai-agents"],
        "content": """## Overview

Retrieval-Augmented Generation (RAG) grounds Large Language Models on proprietary knowledge bases, eliminating hallucinations and ensuring factual accuracy. This workshop covers dense vector embeddings, HNSW index optimization in PostgreSQL with pgvector, and tool-augmented reasoning.

### Key Architecture Components

1. **Chunking & Vectorization**: Semantic chunking with recursive boundary preservation and dense embedding generation.
2. **Cosine Similarity in pgvector**: Accelerated vector search using Hierarchical Navigable Small World (HNSW) graphs.
3. **Context Injection & Prompt Engineering**: Injecting retrieved ground-truth documents with provenance into system prompts.
4. **Safety & Guardrails**: Validating LLM outputs against source documents to prevent unauthorized data leakage.

### Production RAG Search Query

```python
import numpy as np

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    \"\"\"Calculates cosine similarity between two vector representations.\"\"\"
    dot = np.dot(v1, v2)
    norm = np.linalg.norm(v1) * np.linalg.norm(v2)
    return float(dot / norm) if norm > 0 else 0.0
```
"""
    },
    {
        "slug": "res-react-fastapi-fullstack",
        "title": "Full Stack Next.js & FastAPI Microservice Tutorial",
        "description": "Build modern responsive dashboards connected to async FastAPI REST and WebSocket endpoints.",
        "resource_type": "course",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "difficulty": "Intermediate",
        "estimated_minutes": 150,
        "provider": "FullStack Open",
        "is_interactive": True,
        "skills": ["react-ts", "backend-fastapi", "frontend-foundations"],
        "content": """## Overview

Modern web applications combine reactive TypeScript interfaces with asynchronous backend microservices. Learn how to architect a production Next.js 14 frontend with Server Components, TailwindCSS, and async FastAPI backend services powered by SQLAlchemy 2.0.

### Curriculum Highlights

- **Next.js 14 App Router**: Server Components, streaming SSR, and Edge runtime API routes.
- **FastAPI Asynchronous Endpoints**: Using `async def` and non-blocking I/O for high-concurrency requests.
- **JWT Authentication & Middleware**: Role-based access control, header validation, and token revocation.
- **Type-Safe API Contracts**: Sharing TypeScript interfaces derived from OpenAPI schemas.
"""
    },
    {
        "slug": "res-terraform-aws-lab",
        "title": "Automated Cloud Provisioning with Terraform & AWS",
        "description": "Deploy secure VPCs, EC2 instances, and RDS databases using modular Terraform scripts.",
        "resource_type": "practice",
        "url": "https://developer.hashicorp.com/terraform/tutorials",
        "difficulty": "Intermediate",
        "estimated_minutes": 140,
        "provider": "Cloud Native Lab",
        "is_interactive": True,
        "skills": ["aws-core", "terraform-iac", "networking-basics"],
        "content": """## Overview

Infrastructure as Code (IaC) enables reproducible, version-controlled cloud infrastructure. This lab walks through provisioning isolated Virtual Private Clouds (VPCs), public/private subnet architectures, Internet Gateways, and security groups using HashiCorp Terraform.

### Core Terraform Specification

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "pathpilot-production-vpc"
    Environment = "production"
  }
}
```
"""
    },
    {
        "slug": "res-threat-hunting-siem",
        "title": "SOC Threat Detection & Wireshark Analysis",
        "description": "Interactive packet inspection and incident triage against simulated cyberattacks.",
        "resource_type": "practice",
        "url": "https://www.wireshark.org/docs/",
        "difficulty": "Intermediate",
        "estimated_minutes": 130,
        "provider": "TryHackMe Lab",
        "is_interactive": True,
        "skills": ["network-security", "threat-detection"],
        "content": """## Overview

Security Operations Center (SOC) analysts monitor network traffic to detect unauthorized intrusions, privilege escalation, and data exfiltration. Learn how to analyze PCAP packet captures, identify anomalous TCP handshakes, and isolate SQL injection attacks.

### Wireshark Filter Queries

- **HTTP POST Requests**: `http.request.method == "POST"`
- **Detecting SYN Floods**: `tcp.flags.syn == 1 and tcp.flags.ack == 0`
- **Suspicious DNS Queries**: `dns.qry.name contains "malicious"`
"""
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
