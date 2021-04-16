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
        return [int(i) for i in list(self.graph.keys())]

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
        Find two disconnected sub graphs, select a random vertex in each of them and add an edge between
        those two vertices.
        """
        items = [int(i[0]) for i in list(self.graph.items())]
        random.shuffle(items)
        sub = self.find_sub_graph(items[0], [items[0]])
        for i in items:
            if i not in sub:
                self.add_edge(random.choice(sub), i)
                break

    def vertex_cover_brute(self, k, depth=1, result=None, current=None, covered=None, highest_covered=0, edges=None,
                           vertices=None):
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

    def vertex_edges(self, vertex, depth=1, current_depth=0, covered=None):
        if covered is None:
            covered = []

        if current_depth < depth:
            for v in [e for e in self.graph[str(vertex)] if not ((vertex, e) in covered or (e, vertex) in covered)]:
                covered = self.vertex_edges(v, depth, current_depth + 1, covered + [(vertex, v)])

        return covered

    def random_pendant_vertex(self, is_pendant):
        vertices = self.vertices()
        random.shuffle(vertices)
        for v in vertices:
            if (is_pendant and len(self.vertex_edges(v)) == 1) or (not is_pendant and len(self.vertex_edges(v)) != 1):
                return v

        return None

    def random_tops_vertex(self, is_tops):
        vertices = self.vertices()
        random.shuffle(vertices)
        k = -1
        vertex = None
        for v in vertices:
            if (is_tops and len(self.vertex_edges(v)) > k) or (
                    not is_tops and (k == -1 or len(self.vertex_edges(v)) < k)):
                k = len(self.vertex_edges(v))
                vertex = v
        return vertex
