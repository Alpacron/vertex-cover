from graph import Graph
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from starlette.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
from typing import Any

app = FastAPI(
    title="Vertex cover",
    description="An implementation of vertex cover visualization with kernelization, pruning, search tree "
                "optimization and brute force.",
    version="1.0.0"
)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['POST', 'PUT'], allow_headers=["*"])


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


@app.put("/connect-sub")
def connect(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_two_sub_graphs()
    return graph


@app.put("/connect-random")
def connect(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_two_random_vertices()
    return graph


class CoverItem(BaseModel):
    graph: Any
    depth: int
    k: int


@app.post("/vertex-cover")
def connect(c: CoverItem):
    graph = Graph(c.graph)
    print(c.k)
    return {"vertices": graph.vertex_cover_brute(c.k, c.depth)[0]}
