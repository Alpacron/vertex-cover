import random


class Graph:
    """
    Graph data structure G = (V, E). Vertices contain the information about the edges.
    """

    def __init__(self, graph=None):
        if graph is None:
            graph = {}
        self.graph = graph

    def generate_graph(self, n: int, p: float):
        """
        Initialize from n vertices.
        """

        for i in range(n):
            self.add_vertex(i)

        e = [False, True]
        probability = [1 - p, p]

        visited = []

        for v in self.graph:
            for u in self.graph:
                if v is not u and not self.is_connected(u, v):
                    if (v, u) not in visited and (u, v) not in visited:
                        visited.append((v, u))

                        if random.choices(e, probability)[0]:
                            self.add_edge(u, v)

    def vertices(self):
        """
        Returns a list of all vertices in the graph.
        """
        return list(self.graph.keys())

    def edges(self):
        """
        Returns a list of all edges in the graph.
        """
        return self.generate_edges()

    def generate_edges(self):
        """
        For each edge generate its edges and add that to a list.
        """
        edges = []
        for vertex in self.graph:
            for neighbour in self.graph[vertex]:
                if (neighbour, vertex) not in edges:
                    edges.append({vertex, neighbour})
        return edges

    def add_vertex(self, u):
        """
        Add a vertex to the graph.
        """
        if u not in self.graph:
            self.graph[u] = []

    def add_edge(self, u, v):
        """
        Add an edge to the graph.
        """
        if u not in self.graph:
            self.add_vertex(u)

        if v not in self.graph:
            self.add_vertex(v)

        self.graph[u].append(v)
        self.graph[v].append(u)

    def is_connected(self, u, v):
        """
        Check if two vertices are connected.
        """
        if u not in self.graph or v not in self.graph:
            return False

        if v not in self.graph[u]:
            return False

        return True

    def connect_two_random_vertices(self):
        """
        Randomly connect two vertices.
        """
        v, e = random.choice(list(self.graph.items()))

        for vertex in self.graph:
            if vertex is not v:
                if not self.is_connected(vertex, v):
                    print("added", vertex, v)
                    self.add_edge(vertex, v)
                    break
