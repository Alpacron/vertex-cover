from graph import Graph
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from starlette.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
from typing import Any

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['POST', 'GET'], allow_headers=["*"])

@app.get("/")
def root():
    return {"Hello": "World"}

class GenerateItem(BaseModel):
    vertices: int
    probability: float

@app.post("/generate")
def generate(item: GenerateItem):
    graph = Graph()
    graph.generate_graph(item.vertices, item.probability)
    return graph


class UpdateItem(BaseModel):
    graph: Any

@app.put("/update")
def update(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_two_random_vertices()
    return graph