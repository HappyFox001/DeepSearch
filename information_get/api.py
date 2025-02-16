from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import Chatbot
from typing import Dict

app = FastAPI(title="Information Search API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chatbot = Chatbot()


class Query(BaseModel):
    user_input: str


@app.post("/query")
async def query(query: Query) -> Dict:
    try:
        result = await chatbot.process_query(query.user_input)
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """
    健康检查端点
    """
    return {"status": "ok", "message": "Information Search API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
