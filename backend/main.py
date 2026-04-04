from fastapi import FastAPI, UploadFile, File, HTTPException, Form # Added Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from firebase_config import db 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
# We added 'user_id' so the backend knows who owns this data
async def upload_file(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")

        assets = df.to_dict(orient="records")

        # Create a batch or loop to add the userId to every single row
        for asset in assets:
            asset["userId"] = user_id # 👈 This is the "tag" that secures the data
            db.collection("assets").add(asset)

        return {"message": f"Successfully imported {len(assets)} assets for user {user_id}!"}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)