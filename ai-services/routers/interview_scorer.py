from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import json

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy_key"))
model = genai.GenerativeModel('gemini-2.0-flash')

class StartInterviewRequest(BaseModel):
    interview_type: str
    student_name: str
    target_role: str = ""

class NextTurnRequest(BaseModel):
    interview_type: str
    transcript: list # list of dicts: {"role": "interviewer"|"student", "text": "..."}
    round_number: int

class ScoreRequest(BaseModel):
    transcript: list

@router.post("/start")
async def start_interview(req: StartInterviewRequest):
    prompt = f"""
    You are an expert Interviewer conducting a '{req.interview_type}' interview for the candidate named {req.student_name}.
    Target Role: {req.target_role}.
    Begin the interview by warmly welcoming the candidate and asking the very first opening question.
    Keep it concise, professional, and conversational (1-2 sentences).
    """
    
    try:
        response = model.generate_content(prompt)
        return {"question": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/next")
async def next_turn(req: NextTurnRequest):
    # Construct history
    history_text = "\n".join([f"{msg['role'].capitalize()}: {msg['text']}" for msg in req.transcript])
    
    prompt = f"""
    You are an expert professional {req.interview_type} Interviewer.
    Conversation history so far:
    {history_text}
    
    Current Round: {req.round_number} of 5.
    
    Task:
    - Analyze the student's most recent response deeply.
    - If they just said "hello" or gave a one-word answer, ask them to introduce themselves properly and discuss their background related to {req.interview_type}.
    - Ask a highly specific, relevant follow-up question based on the content of their last answer. 
    - Dig into the "how" and "why" of their projects or technical claims.
    - Maintain a professional yet encouraging tone.
    - Do NOT be generic. Do NOT say "Can you elaborate on that further?". Instead, ask "Could you walk me through the specific challenge you faced while [mentioning their last topic]?"
    
    Output: ONLY the next question or statement (1-3 sentences).
    """
    
    try:
        response = model.generate_content(prompt)
        return {"question": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score")
async def score_interview(req: ScoreRequest):
    history_text = "\n".join([f"{msg['role'].capitalize()}: {msg['text']}" for msg in req.transcript])
    
    prompt = f"""
    You are an expert Interview Evaluator. Review the following interview transcript:
    {history_text}
    
    Provide a final evaluation scoring the candidate from 0 to 10 on the following metrics:
    - Confidence
    - Fluency
    - Communication
    - Technical Accuracy
    - Relevance
    
    Also provide:
    - Overall Score (0 to 100)
    - 3 strengths (bullet points)
    - 3 areas of improvement (bullet points)
    - Per-answer feedback: A short review of how they handled key questions.
    
    Return the response EXCLUSIVELY as a valid JSON object matching this structure:
    {{
        "metrics": {{
            "confidence": 0,
            "fluency": 0,
            "communication": 0,
            "technicalAccuracy": 0,
            "relevance": 0,
            "overallScore": 0
        }},
        "strengths": ["", "", ""],
        "improvements": ["", "", ""],
        "overallFeedback": ""
    }}
    Do not use markdown blocks like ```json ... ```, just output raw JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
        
        try:
            score_data = json.loads(result_text)
            return score_data
        except json.JSONDecodeError:
            print("Failed to parse JSON:", result_text)
            # Fallback
            return {
                "metrics": { "confidence": 7, "fluency": 7, "communication": 7, "technicalAccuracy": 7, "relevance": 7, "overallScore": 70 },
                "strengths": ["Good effort", "Clear speaking", "Polite"],
                "improvements": ["More technical depth needed", "Be more concise", "Use STAR method"],
                "overallFeedback": "Good attempt but needs refinement in technical depth."
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
