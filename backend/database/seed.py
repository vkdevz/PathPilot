import asyncio
import os
import sys
from typing import List, Dict, Any

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.mongodb import connect_to_mongo, close_mongo_connection
from database.indexes import create_indexes
from seed_data import CAREERS_DATA

# Courses seed dataset matching prompt specifications
COURSES_DATA: List[Dict[str, Any]] = [
    {
        "course_id": "course-python-foundations",
        "title": "Python for Data Science & Engineering",
        "description": "Master core Python syntax, data structures, NumPy, and OOP for analytics and AI.",
        "skills_taught": ["python_ds", "python_analytics", "python_de", "python_ai", "python_llm"],
        "prerequisites": [],
        "difficulty": "beginner",
        "type": "course",
        "estimated_hours": 10
    },
    {
        "course_id": "course-sql-mastery",
        "title": "SQL & Relational Database Mastery",
        "description": "Comprehensive querying, JOINs, aggregations, window functions, and schema design.",
        "skills_taught": ["sql_ds", "sql_analyst", "sql_advanced"],
        "prerequisites": ["python_ds"],
        "difficulty": "beginner",
        "type": "course",
        "estimated_hours": 8
    },
    {
        "course_id": "course-stats-prob",
        "title": "Statistics & Applied Probability",
        "description": "Descriptive statistics, hypothesis testing, distributions, and statistical inference.",
        "skills_taught": ["stats_ds"],
        "prerequisites": ["python_ds"],
        "difficulty": "intermediate",
        "type": "course",
        "estimated_hours": 12
    },
    {
        "course_id": "course-pandas-eda",
        "title": "Pandas & Exploratory Data Cleaning",
        "description": "Handling missing data, feature engineering, and exploratory data analysis with Pandas.",
        "skills_taught": ["data_analysis"],
        "prerequisites": ["python_ds", "sql_ds"],
        "difficulty": "intermediate",
        "type": "course",
        "estimated_hours": 9
    },
    {
        "course_id": "course-data-viz",
        "title": "Interactive Data Visualization",
        "description": "Creating impactful charts and visual stories using Matplotlib, Seaborn, and Plotly.",
        "skills_taught": ["visualization"],
        "prerequisites": ["data_analysis"],
        "difficulty": "intermediate",
        "type": "course",
        "estimated_hours": 6
    },
    {
        "course_id": "course-ml-foundations",
        "title": "Machine Learning Fundamentals",
        "description": "Supervised and unsupervised learning, regression, classification, and model evaluation.",
        "skills_taught": ["ml_foundations", "ml_basics"],
        "prerequisites": ["stats_ds", "data_analysis"],
        "difficulty": "intermediate",
        "type": "course",
        "estimated_hours": 15
    },
    {
        "course_id": "course-deep-learning",
        "title": "Deep Learning & Neural Networks",
        "description": "PyTorch fundamentals, CNNs, Transformers, and optimization algorithms.",
        "skills_taught": ["deep_learning"],
        "prerequisites": ["ml_foundations"],
        "difficulty": "advanced",
        "type": "course",
        "estimated_hours": 18
    },
    {
        "course_id": "course-excel-powerbi",
        "title": "Advanced Excel & PowerBI Analytics",
        "description": "VLOOKUP, PivotTables, DAX expressions, and interactive executive reporting.",
        "skills_taught": ["excel_advanced", "powerbi_tableau"],
        "prerequisites": [],
        "difficulty": "beginner",
        "type": "course",
        "estimated_hours": 10
    },
    {
        "course_id": "course-bigdata-spark",
        "title": "Apache Spark & Big Data Engineering",
        "description": "Distributed data processing, PySpark DataFrames, and ETL orchestration.",
        "skills_taught": ["spark_hadoop", "airflow_orchestration"],
        "prerequisites": ["python_de", "sql_advanced"],
        "difficulty": "advanced",
        "type": "course",
        "estimated_hours": 16
    },
    {
        "course_id": "course-genai-llm",
        "title": "Generative AI, LLMs & Vector Databases",
        "description": "Building RAG systems, prompt engineering, fine-tuning, and multi-agent orchestration.",
        "skills_taught": ["llm_genai", "vector_dbs", "ai_agents", "transformer_arch", "fine_tuning", "llm_serving"],
        "prerequisites": ["ml_basics"],
        "difficulty": "advanced",
        "type": "course",
        "estimated_hours": 20
    },
    {
        "course_id": "course-cloud-devops",
        "title": "AWS Cloud Architecture & Terraform IaC",
        "description": "Networking VPCs, EC2, S3, IAM, containerization, and Terraform deployment.",
        "skills_taught": ["networking_basics", "aws_core", "terraform_iac", "kubernetes_cloud"],
        "prerequisites": [],
        "difficulty": "intermediate",
        "type": "course",
        "estimated_hours": 14
    },
    {
        "course_id": "course-fullstack-web",
        "title": "Full Stack Web Development (React & FastAPI)",
        "description": "Building modern reactive frontends with React & TypeScript, connected to async FastAPI backends.",
        "skills_taught": ["frontend_foundations", "react_ts", "backend_node_py", "databases_sql_nosql", "html_css", "js_modern", "react_core"],
        "prerequisites": [],
        "difficulty": "beginner",
        "type": "course",
        "estimated_hours": 16
    }
]

async def seed_database(close_connection: bool = False):
    """
    Idempotent database seed operation populating careers and courses.
    """
    db = await connect_to_mongo()
    print("Connected to MongoDB")

    # 1. Verify indexes
    await create_indexes(db)
    print("Indexes verified")

    # 2. Seed Careers
    careers_count = 0
    for raw_c in CAREERS_DATA:
        # Standardize ID as career_id while retaining original fields
        career_id = raw_c["id"].replace("_", "-") # handle standard format (e.g., data-analyst & data_analyst)
        skill_names = [s["name"] for s in raw_c.get("skills", [])]
        num_skills = len(skill_names) or 1
        
        # Build skill_weights dictionary normalized to 1.0 sum
        weights = {s["id"]: round(1.0 / num_skills, 2) for s in raw_c.get("skills", [])}
        
        career_doc = {
            "career_id": raw_c["id"],
            "career_id_alt": career_id,
            "name": raw_c["name"],
            "category": raw_c.get("category", "Technology"),
            "description": raw_c["description"],
            "icon": raw_c.get("icon", "🎯"),
            "required_skills": skill_names,
            "skill_weights": weights,
            "recommended_skill_order": [s["id"] for s in raw_c.get("skills", [])],
            "skills": raw_c.get("skills", [])
        }
        
        result = await db["careers"].update_one(
            {"career_id": raw_c["id"]},
            {"$set": career_doc},
            upsert=True
        )
        careers_count += 1

    # 3. Seed Courses
    courses_count = 0
    for course_doc in COURSES_DATA:
        await db["courses"].update_one(
            {"course_id": course_doc["course_id"]},
            {"$set": course_doc},
            upsert=True
        )
        courses_count += 1

    print(f"Careers seeded: {careers_count}")
    print(f"Courses seeded: {courses_count}")
    print("Database initialization complete")

    if close_connection:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_database(close_connection=True))

