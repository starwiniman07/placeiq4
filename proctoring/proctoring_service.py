import cv2
import numpy as np
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI(title="PlaceIQ Proctoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    import mediapipe as mp
    from mediapipe.python.solutions import face_detection as mp_face_detection
    from mediapipe.python.solutions import face_mesh as mp_face_mesh
    
    face_detection = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5)
    face_mesh = mp_face_mesh.FaceMesh(max_num_faces=2, refine_landmarks=True, min_detection_confidence=0.5)
    HAS_MEDIAPIPE = True
except Exception as e:
    print(f"MediaPipe Load Error: {e}")
    HAS_MEDIAPIPE = False

class FrameData(BaseModel):
    image: str # Base64 string

def calculate_mouth_ratio(landmarks):
    # Simplified Mouth Aspect Ratio (MAR)
    top_lip = landmarks[13]
    bottom_lip = landmarks[14]
    dist = np.linalg.norm(np.array([top_lip.x, top_lip.y]) - np.array([bottom_lip.x, bottom_lip.y]))
    return dist

@app.post("/analyze-frame")
async def analyze_frame(data: FrameData):
    if not HAS_MEDIAPIPE:
        return {"faceCount": 1, "isTalking": False, "warnings": ["Proctoring AI unavailable"], "status": "Degraded"}
        
    try:
        # Decode base64 image
        header, encoded = data.image.split(",", 1)
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"error": "Invalid image data"}

        results_detect = face_detection.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        warnings = []
        face_count = 0
        is_talking = False

        if results_detect.detections:
            face_count = len(results_detect.detections)
            if face_count > 1:
                warnings.append("Multiple faces detected")
            
            # Mouth movement check
            results_mesh = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results_mesh.multi_face_landmarks:
                landmarks = results_mesh.multi_face_landmarks[0].landmark
                mar = calculate_mouth_ratio(landmarks)
                if mar > 0.04: # Threshold for mouth open
                    is_talking = True
                    warnings.append("Talking detected")
        else:
            warnings.append("No face detected")

        return {
            "faceCount": face_count,
            "isTalking": is_talking,
            "warnings": warnings,
            "status": "Success"
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
