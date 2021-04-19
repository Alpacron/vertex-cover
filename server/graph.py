import random


class Graph:
    """
    Graph data structure G = (V, E). Vertices contain the information about the edges.
    """

    def __init__(self, g=None):
        if g is None:
            g = {}
        g2 = {}
        for vertex in g.keys():
            g2.update({str(vertex): [int(e) for e in g[vertex]]})
        self.graph = g2

    def generate_graph(self, n: int, p: float):
        """
        Initialize from n vertices.
        """
        # Add vertices
        for i in range(n):
            self.add_vertex(i)

        # Add edges according to probability
        e = [False, True]
        probability = [1 - p, p]

        for v in self.vertices():
            for u in self.vertices():
                if u > v and not self.is_connected(u, v) and random.choices(e, probability)[0]:
                    self.add_edge(u, v)

    def vertices(self):
        """
        Returns a list of all vertices in the graph.
        """
        return [int(i) for i in self.graph]

    def edges(self):
        """
        Returns a list of all edges in the graph.
        """
        edges = []
        for vertex in self.graph:
            for neighbour in self.graph[vertex]:
                if not ((int(neighbour), int(vertex)) in edges or (int(vertex), int(neighbour)) in edges):
                    edges += [(int(vertex), int(neighbour))]
        return edges

    def add_vertex(self, u: int):
        """
        Add a vertex to the graph.
        """
        if u not in self.vertices():
            self.graph[str(u)] = []

    def add_edge(self, u: int, v: int):
        """
        Add an edge to the graph.
        """
        assert u in self.vertices() and v in self.vertices()

        self.graph[str(u)].append(v)
        self.graph[str(v)].append(u)

    def remove_edge(self, u: int, v: int):
        """
        Remove an edge from the graph.
        """
        assert u in self.vertices() and v in self.vertices()

        self.graph[str(u)].remove(v)
        self.graph[str(v)].remove(u)

    def is_connected(self, u: int, v: int):
        """
        Check if two vertices are connected.
        """
        assert u in self.vertices() and v in self.vertices()

        if v not in self.graph[str(u)]:
            return False

        return True

    def connect_two_random_vertices(self):
        """
        Randomly connect two vertices.
        """
        vertices = [v for v in self.vertices() if len(self.graph[str(v)]) < len(self.vertices()) - 1]
        if len(vertices) > 0:
            v1 = random.choice(vertices)
            items = [v for v in vertices if v not in [v1] + self.graph[str(v1)]]
            if len(items) > 0:
                v2 = random.choice(items)

                if not self.is_connected(v1, v2):
                    self.add_edge(v1, v2)

    def connect_vertex_to_random(self, v: int):
        assert v in self.vertices()

        items = [u for u in self.vertices() if
                 len(self.graph[str(u)]) < len(self.vertices()) - 1 and u not in [v] + self.graph[str(v)]]
        if len(items) > 0:
            v2 = random.choice(items)
            not_connected = [i for i in items if len(self.graph[i]) == 0]
            if len(not_connected) > 0:
                v2 = random.choice(not_connected)
            if not self.is_connected(v, v2):
                self.add_edge(v, v2)

    def remove_random_edge(self, v: int):
        vertices = [u for u in self.vertices() if u in self.graph[str(v)]]
        if len(vertices) > 0:
            self.remove_edge(v, random.choice(vertices))

    def find_sub_graph(self, vertex: int, sub_graph: [int]):
        """
        Find subgraph connected to vertex.
        """
        for i in self.graph[str(vertex)]:
            if i not in sub_graph:
                sub_graph = self.find_sub_graph(i, sub_graph + [i])
        return sub_graph

    def connect_all_sub_graphs(self):
        """
        Find all disconnected sub graphs, select a random vertex in each of them and add an edge between
        those two vertices.
        """
        vertex = random.choice(self.vertices())
        while True:
            sub = self.find_sub_graph(vertex, [vertex])
            if len(sub) == len(self.vertices()):
                break
            for v in self.vertices():
                if v not in sub:
                    self.add_edge(random.choice(sub), v)
                    break

    def connect_two_sub_graphs(self):
        """
        Find two disconnected sub graphs, select a random vertex in each of them and add an edge between
        those two vertices.
        """
        vertices = self.vertices()
        vertex = random.choice(vertices)
        sub = self.find_sub_graph(vertex, [vertex])
        for v in vertices:
            if v not in sub:
                self.add_edge(random.choice(sub), v)
                break

    def vertex_cover_brute(self, k: int, depth: int = 1, result: [int] = None, current: [int] = None,
                           covered: [int] = None, highest_covered: int = 0, edges: (int, int) = None,
                           vertices: [int] = None):
        """
        Find minimum required vertices that cover all edges.
        """
        if edges is None:
            edges = self.edges()
        if vertices is None:
            vertices = self.vertices()
        if result is None:
            result = []
        if covered is None:
            covered = []
        if current is None:
            current = []

        contains_all_edges = len([e for e in edges if e in covered or (e[1], e[0]) in covered]) == len(edges)

        if k >= len(vertices):
            return vertices, len(edges)

        # If current covered contains all edges, set fewest to current and backtrack
        if k == -1 and contains_all_edges:
            # If current is bigger than fewest, we backtrack.
            if len(current) < len(result) or result == []:
                highest_covered = len(edges)
                result = current

        if k == len(current) and len(covered) > highest_covered:
            highest_covered = len(covered)
            result = current

        # Recursively do this for all vertices (randomly), until a solution is found.
        if (k == -1 and (len(current) < len(result) or result == []) and not contains_all_edges) or len(current) < k:
            ver = [e for e in vertices if e not in current]
            random.shuffle(ver)
            for v in ver:
                c = covered + [e for e in self.vertex_edges(v, depth) if not (e in covered or (e[1], e[0]) in covered)]
                result, highest_covered = self.vertex_cover_brute(k, depth, result, current + [v], c, highest_covered,
                                                                  edges, vertices)

        return result, highest_covered

    def vertex_edges(self, vertex: int, depth: int = 1, current_depth: int = 0, covered: list = None):
        if covered is None:
            covered = []

        if current_depth < depth:
            for v in [e for e in self.graph[str(vertex)] if not ((vertex, e) in covered or (e, vertex) in covered)]:
                covered = self.vertex_edges(v, depth, current_depth + 1, covered + [(vertex, v)])

        return covered

    def increase_pendant_vertices(self):
        non_pendant_vertices = [v for v in self.vertices() if not self.is_pendant(v)]
        if len(non_pendant_vertices) > 0:
            vertex = random.choice(non_pendant_vertices)
            while not self.is_pendant(vertex):
                remaining_non_pendant_vertices = [v for v in self.graph[str(vertex)] if
                                                  not self.is_pendant(v) and not v == vertex]
                if len(remaining_non_pendant_vertices) > 0:
                    if len(self.graph[str(vertex)]) > 1:
                        self.remove_edge(vertex, random.choice(remaining_non_pendant_vertices))
                    else:
                        self.add_edge(vertex, random.choice(remaining_non_pendant_vertices))
                else:
                    if len(self.graph[str(vertex)]) > 1:
                        self.remove_edge(vertex, random.choice(self.graph[str(vertex)]))
                    else:
                        self.connect_vertex_to_random(vertex)

    def decrease_pendant_vertices(self):
        pendant_vertices = [v for v in self.vertices() if self.is_pendant(v)]
        if len(pendant_vertices) > 0:
            vertex = random.choice(pendant_vertices)
            self.remove_edge(vertex, random.choice(self.graph[str(vertex)]))

    def is_pendant(self, vertex: int):
        return len(self.graph[str(vertex)]) == 1

    def increase_tops_vertices(self):
        non_tops_vertices = [v for v in self.vertices() if not self.is_tops(v, self.vertices()) and
                             len(self.graph[str(v)]) < len(self.vertices()) - 1]
        if len(non_tops_vertices) > 0:
            vertex = random.choice(non_tops_vertices)
            while not self.is_tops(vertex, self.vertices()) and len(self.graph[str(vertex)]) < len(self.vertices()) - 1:
                self.connect_vertex_to_random(vertex)

    def decrease_tops_vertices(self):
        tops_vertices = [v for v in self.vertices() if self.is_tops(v, self.vertices())]
        if len(tops_vertices) > 0:
            v = random.choice(tops_vertices)
            while self.is_tops(v, self.vertices()) and len(self.graph[str(v)]) > 0:
                self.remove_random_edge(v)

    def is_tops(self, vertex: int, vertices: [int]):
        for v in vertices:
            if v != vertex and len(self.graph[str(v)]) >= len(self.graph[str(vertex)]):
                return False
        return True
