"""
WatchWise AI - FastAPI Backend Application
OTT Audience Segmentation & Personalization Platform API
"""

import sys
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure root models directory is importable
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from models.segmenter import ViewerSegmenter

app = FastAPI(
    title="WatchWise AI API",
    description="OTT Audience Segmentation & Personalization Platform Backend",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend support (GitHub Pages, local dev, preview domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Segmenter instance
segmenter = ViewerSegmenter()

# Mock Content Catalogue
CATALOG = [
    {
        "id": "tt-101",
        "title": "Dark Horizon",
        "type": "Movie",
        "genre": "Thriller",
        "secondary_genre": "Sci-Fi",
        "rating": 9.3,
        "match_score": 92,
        "reason": "Because you frequently watch Thriller and Sci-Fi content.",
        "tags": ["Suspense", "Deep Space", "Mind-Bending"],
        "poster": "assets/images/dark_horizon.jpg"
    },
    {
        "id": "tt-102",
        "title": "Silicon Shadows",
        "type": "Series",
        "genre": "Drama",
        "secondary_genre": "Thriller",
        "rating": 8.9,
        "match_score": 88,
        "reason": "Matches your preference for serialized drama and multi-episode binge viewing.",
        "tags": ["Corporate Espionage", "Cybersecurity", "High Stakes"],
        "poster": "assets/images/silicon_shadows.jpg"
    },
    {
        "id": "tt-103",
        "title": "The Midnight Heist",
        "type": "Movie",
        "genre": "Action",
        "secondary_genre": "Thriller",
        "rating": 8.7,
        "match_score": 85,
        "reason": "Recommended for viewers who enjoy high-intensity action with tight narrative pacing.",
        "tags": ["Heist", "Tactical", "Fast Paced"],
        "poster": "assets/images/midnight_heist.jpg"
    },
    {
        "id": "tt-104",
        "title": "Neon Velocity",
        "type": "Movie",
        "genre": "Action",
        "secondary_genre": "Sci-Fi",
        "rating": 8.6,
        "match_score": 89,
        "reason": "High completion match for viewers with heavy weekend viewing sessions.",
        "tags": ["Cyberpunk", "High Octane", "Street Racing"],
        "poster": "assets/images/dark_horizon.jpg"
    },
    {
        "id": "tt-105",
        "title": "Parallel Echoes",
        "type": "Series",
        "genre": "Sci-Fi",
        "secondary_genre": "Drama",
        "rating": 9.1,
        "match_score": 94,
        "reason": "Ideal for binge enthusiasts with high average session duration (>90 mins).",
        "tags": ["Multiverse", "Philosophical", "Mystery"],
        "poster": "assets/images/silicon_shadows.jpg"
    },
    {
        "id": "tt-106",
        "title": "The Comedy Circuit",
        "type": "Special",
        "genre": "Comedy",
        "secondary_genre": "Drama",
        "rating": 8.4,
        "match_score": 81,
        "reason": "Perfect for quick weekday evening sessions with moderate watch time.",
        "tags": ["Standup", "Satire", "Bite-Sized"],
        "poster": "assets/images/midnight_heist.jpg"
    },
    {
        "id": "tt-107",
        "title": "Amber Shore",
        "type": "Movie",
        "genre": "Romance",
        "secondary_genre": "Drama",
        "rating": 8.3,
        "match_score": 78,
        "reason": "Recommended for viewers who enjoy character-driven emotional journeys.",
        "tags": ["Romance", "Coastal", "Emotional"],
        "poster": "assets/images/silicon_shadows.jpg"
    },
    {
        "id": "tt-108",
        "title": "The Silent Grid",
        "type": "Series",
        "genre": "Thriller",
        "secondary_genre": "Action",
        "rating": 9.0,
        "match_score": 91,
        "reason": "High binge rate: 84% of viewers complete all episodes in 48 hours.",
        "tags": ["Conspiracy", "Espionage", "Cliffhangers"],
        "poster": "assets/images/midnight_heist.jpg"
    }
]

class ViewerFeatures(BaseModel):
    watch_time_hours: float = Field(..., ge=0.0, description="Cumulative watch time in hours")
    avg_session_mins: float = Field(..., ge=0.0, description="Average session length in minutes")
    session_count: float = Field(..., ge=0.0, description="Total sessions logged")
    weekend_ratio: float = Field(..., ge=0.0, le=100.0, description="Weekend viewing percentage (0-100)")
    completion_rate: float = Field(..., ge=0.0, le=100.0, description="Content completion percentage (0-100)")
    top_genre: Optional[str] = Field("Action", description="Top watched genre")

class AnalysisResponse(BaseModel):
    segment: str
    confidence: float
    explanation: Optional[str] = None
    probability_binge: Optional[float] = None

class RecommendationRequest(BaseModel):
    segment: Optional[str] = "Casual & Regular Viewer"
    top_genre: Optional[str] = "All"
    limit: Optional[int] = 8

@app.get("/health")
def get_health() -> Dict[str, Any]:
    """Health check endpoint indicating API availability and model status."""
    return {
        "status": "healthy",
        "service": "WatchWise AI API",
        "version": "1.0.0",
        "model_loaded": True,
        "mode": "production"
    }

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_viewer(features: ViewerFeatures):
    """
    Accepts viewer behavior features and returns predicted audience segment,
    confidence score, and behavioral reasoning.
    """
    try:
        input_dict = features.model_dump()
        result = segmenter.analyze(input_dict)
        return AnalysisResponse(
            segment=result["segment"],
            confidence=result["confidence"],
            explanation=result["explanation"],
            probability_binge=result["probability_binge"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
def get_recommendations(req: RecommendationRequest):
    """
    Returns personalized OTT recommendations tailored to the viewer's predicted
    segment and top genre.
    """
    genre_filter = (req.top_genre or "All").lower()
    items = []
    for item in CATALOG:
        if genre_filter != "all":
            if item["genre"].lower() != genre_filter and item.get("secondary_genre", "").lower() != genre_filter:
                continue
        score = item["match_score"]
        if req.segment == "Binge Enthusiast" and item["type"] == "Series":
            score = min(99, score + 5)
        elif req.segment == "Casual & Regular Viewer" and item["type"] == "Movie":
            score = min(99, score + 3)
        item_copy = dict(item)
        item_copy["match_score"] = score
        items.append(item_copy)

    items.sort(key=lambda x: x["match_score"], reverse=True)
    return {
        "segment": req.segment,
        "genre": req.top_genre,
        "total_results": len(items[:req.limit]),
        "recommendations": items[:req.limit]
    }

@app.get("/segments/summary")
def get_segments_summary():
    """Returns static benchmark summary of segments for platform alignment."""
    return {
        "total_viewers": 1200,
        "segments": [
            {
                "name": "Casual & Regular Viewers",
                "count": 906,
                "percentage": 75.5,
                "characteristics": [
                    "Moderate watch time",
                    "Regular sessions",
                    "Medium completion rate",
                    "Mostly weekday viewing"
                ]
            },
            {
                "name": "Binge Enthusiasts",
                "count": 294,
                "percentage": 24.5,
                "characteristics": [
                    "High watch time",
                    "Long sessions",
                    "High completion rate",
                    "Strong weekend viewing"
                ]
            }
        ]
    }
