from graph import Graph
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
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
    return graph.graph


class UpdateItem(BaseModel):
    graph: Any


@app.put("/connect-sub")
def connect_sub(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_two_sub_graphs()
    return graph.graph


@app.put("/connect-all-sub")
def connect_all_sub(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_all_sub_graphs()
    return graph.graph


@app.put("/connect-random")
def connect_random(g: UpdateItem):
    graph = Graph(g.graph)
    graph.connect_two_random_vertices()
    return graph.graph


class CoverItem(BaseModel):
    graph: Any
    depth: int
    k: int


@app.post("/vertex-cover")
def vertex_cover(c: CoverItem):
    graph = Graph(c.graph)
    return graph.vertex_cover_brute(c.k, c.depth)[0]


@app.put("/increase-pendants")
def increase_pendants(g: UpdateItem):
    graph = Graph(g.graph)
    graph.increase_pendant_vertices()
    return graph.graph


@app.put("/decrease-pendants")
def decrease_pendants(g: UpdateItem):
    graph = Graph(g.graph)
    graph.decrease_pendant_vertices()
    return graph.graph


class TopsItem(BaseModel):
    graph: Any
    k: int


@app.put("/increase-tops")
def increase_tops(g: TopsItem):
    graph = Graph(g.graph)
    graph.increase_tops_vertices(g.k)
    return graph.graph


@app.put("/decrease-tops")
def decrease_tops(g: TopsItem):
    graph = Graph(g.graph)
    graph.decrease_tops_vertices(g.k)
    return graph.graph


@app.post("/kernelization")
def kernelization(g: TopsItem):
    graph = Graph(g.graph)
    return graph.perform_kernelization(g.k)
