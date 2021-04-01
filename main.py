from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['POST', 'GET'], allow_headers=["*"])


@app.get("/")
def root():
    return {"Hello": "World"}
