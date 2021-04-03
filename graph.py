class Graph:
    """
    Graph data structure G = (V, E). Vertices contain the information about the edges.
    """

    def __init__(self, graph={}):
        self.graph = graph

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

    def add_vertex(self, vertex):
        """
        Add a vertex to the graph.
        """
        if vertex not in self.graph:
            self.graph[vertex] = []

    def add_edge(self, edge):
        """
        Add an edge to the graph.
        """
        edge = set(edge)
        (u, v) = tuple(edge)
        if u in self.graph:
            self.graph[u].append(v)
        else:
            self.graph[u] = [v]
