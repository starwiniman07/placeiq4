from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

from routers import interview_scorer

app = FastAPI(title="PlaceIQ AI Services")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_scorer.router, prefix="/api/ai-interview", tags=["AI Interview"])

@app.get("/")
def read_root():
    return {"status": "AI Services Running"}