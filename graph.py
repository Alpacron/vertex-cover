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
        items = [int(i[0]) for i in list(self.graph.items())]
        if int(u) not in items:
            self.graph[str(u)] = []

    def add_edge(self, u, v):
        """
        Add an edge to the graph.
        """
        if u not in self.graph:
            self.add_vertex(int(u))

        if v not in self.graph:
            self.add_vertex(int(v))

        self.graph[str(u)].append(int(v))
        self.graph[str(v)].append(int(u))

    def is_connected(self, u, v):
        """
        Check if two vertices are connected.
        """
        items = [int(i[0]) for i in list(self.graph.items())]
        if int(u) not in items or int(v) not in items:
            return False

        if int(v) not in self.graph[str(u)]:
            return False

        return True

    def connect_two_random_vertices(self):
        """
        Randomly connect two vertices.
        """
        items = [i[0] for i in list(self.graph.items()) if len(self.graph[str(i[0])]) < len(self.vertices()) - 1]
        if len(items) > 0:
            v1 = random.choice(items)
            items = [i for i in items if int(i) not in [int(v1)] + self.graph[str(v1)]]
            if len(items) > 0:
                v2 = random.choice(items)

                if not self.is_connected(v1, v2):
                    self.add_edge(v1, v2)

    def find_sub_graph(self, v, sub):
        """
        Find subgraph connected to vertex.
        """
        for i in self.graph[str(v)]:
            if i not in sub:
                sub = self.find_sub_graph(i, sub + [i])
        return sub

    def connect_two_sub_graphs(self):
        """
        Find two disconnected vertices, select an arbitrary vertex in each of them and add an edge between those two vertices.
        """
        items = [int(i[0]) for i in list(self.graph.items())]
        random.shuffle(items)
        sub = self.find_sub_graph(items[0], [items[0]])
        for i in items:
            if i not in sub:
                self.add_edge(random.choice(sub), i)
                break