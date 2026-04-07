from datetime import datetime
import io

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from firebase_config import db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_value(value):
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            return value

    if isinstance(value, datetime):
        return value

    return value


def normalize_record(record):
    return {str(key).strip(): normalize_value(value) for key, value in record.items()}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")

        assets = df.to_dict(orient="records")

        if not assets:
            raise HTTPException(status_code=400, detail="The uploaded file does not contain any asset rows.")

        batch = db.batch()
        assets_ref = db.collection("assets")

        for asset in assets:
            normalized_asset = normalize_record(asset)
            normalized_asset["userId"] = user_id

            doc_ref = assets_ref.document()
            batch.set(doc_ref, normalized_asset)

        batch.commit()

        return {
            "message": f"Successfully imported {len(assets)} assets for user {user_id}.",
            "importedCount": len(assets),
        }
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Error: {exc}")
        raise HTTPException(status_code=500, detail=f"Import failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
