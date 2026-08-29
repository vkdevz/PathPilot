from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class ResourceSearchFilter(BaseModel):
    resource_types: Optional[List[str]] = Field(default=None, description="Filter by types: course, project, article, video, practice")
    difficulties: Optional[List[str]] = Field(default=None, description="Filter by: Beginner, Intermediate, Advanced")
    skill_ids: Optional[List[str]] = Field(default=None, description="Filter by specific skill UUIDs")
    max_minutes: Optional[int] = Field(default=None, description="Maximum estimated minutes duration")
    min_similarity: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum cosine similarity threshold (0.0 - 1.0)")
    provider: Optional[str] = Field(default=None, description="Filter by content provider")
    is_interactive: Optional[bool] = Field(default=None, description="Filter for interactive content")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of results to return")

class ResourceSearchRequest(ResourceSearchFilter):
    query: str = Field(..., min_length=2, description="Natural language search query")

class SkillSearchFilter(BaseModel):
    categories: Optional[List[str]] = None
    difficulties: Optional[List[str]] = None
    min_level: Optional[int] = None
    max_level: Optional[int] = None
    min_similarity: float = 0.0
    limit: int = Field(default=10, ge=1, le=50)

class SkillSearchRequest(SkillSearchFilter):
    query: str = Field(..., min_length=2)

class CareerSearchFilter(BaseModel):
    categories: Optional[List[str]] = None
    min_demand: Optional[int] = None
    min_similarity: float = 0.0
    limit: int = Field(default=10, ge=1, le=50)

class CareerSearchRequest(CareerSearchFilter):
    query: str = Field(..., min_length=2)

class UnifiedSearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    entity_types: List[str] = Field(default=["resource", "skill", "career"], description="Entities to retrieve")
    limit: int = Field(default=5, ge=1, le=20)

class RetrievedResourceItem(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    resource_type: str
    url: Optional[str] = None
    difficulty: str
    estimated_minutes: int
    provider: str
    is_interactive: bool = False
    skills_taught: List[str] = []
    similarity_score: float
    relevance_percentage: float
    match_tier: str
    reasons: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class RetrievedSkillItem(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    difficulty: Optional[str] = None
    level: int
    estimated_minutes: int
    description: str
    similarity_score: float
    relevance_percentage: float

    model_config = ConfigDict(from_attributes=True)

class RetrievedCareerItem(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    icon: Optional[str] = None
    market_demand_score: Optional[int] = None
    salary_range: Optional[str] = None
    description: str
    similarity_score: float
    relevance_percentage: float

    model_config = ConfigDict(from_attributes=True)

class UnifiedSearchResponse(BaseModel):
    query: str
    resources: List[RetrievedResourceItem] = []
    skills: List[RetrievedSkillItem] = []
    careers: List[RetrievedCareerItem] = []

class ReindexRequest(BaseModel):
    force: bool = Field(default=False, description="Force re-embedding of all records ignoring content hashes")

class ReindexResponse(BaseModel):
    status: str
    duration_ms: float
    provider: str
    dimension: int
    resources: Dict[str, int]
    skills: Dict[str, int]
    careers: Dict[str, int]
    total_processed: int
    total_upserted: int
    total_skipped: int

class IndexStatsResponse(BaseModel):
    total_embeddings: int
    entity_breakdown: Dict[str, int]
    model_name: str
    dimensions: int
    pgvector_ready: bool

class RetrievalEvaluationResponse(BaseModel):
    status: str
    k: int
    total_benchmark_queries: int
    metrics: Dict[str, Any]
    total_duration_ms: float
    queries: List[Dict[str, Any]]
