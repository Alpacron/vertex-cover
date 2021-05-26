import json
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

    def __str__(self):
        return json.dumps(self.graph)

    def to_adj_matrix(self):
        keys = sorted(self.graph.keys())
        size = len(keys)

        matrix = [[0] * size for _ in range(size)]

        for a, b in [(keys.index(str(a)), keys.index(str(b))) for a, row in self.graph.items() for b in row]:
            matrix[a][b] = 2 if (a == b) else 1

        return matrix

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

    def remove_vertex(self, u: int):
        """
        Remove vertex from graph.
        """
        if u in self.vertices():
            del self.graph[str(u)]

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

    def remove_all_edges(self, v: int):
        if v in self.vertices():
            edges = list(self.graph[str(v)])
            for e in edges:
                self.remove_edge(e, v)

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

        vertices = [u for u in self.vertices() if
                    len(self.graph[str(u)]) < len(self.vertices()) - 1 and u not in [v] + self.graph[str(v)]]
        if len(vertices) > 0:
            v2 = random.choice(vertices)
            not_connected = [u for u in vertices if len(self.graph[str(u)]) == 0]
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

    def vertex_cover_brute(self, k: int, depth: int = 1, vertices: [int] = None, edges: [(int, int)] = None,
                           best: [int] = None, best_covered: [(int, int)] = None,
                           current: [int] = None, current_covered: [(int, int)] = None):
        """
        Find minimum required vertices that cover all edges.
        """
        # All edges in graph
        if edges is None:
            edges = self.edges()
        # All vertices in graph
        if vertices is None:
            vertices = self.vertices()
        # Best case result [vertex]
        if best is None:
            best = []
        # Edges best vertices cover [(vertex, vertex)]
        if best_covered is None:
            best_covered = []
        # Current result in recursion [vertex]
        if current is None:
            current = []
        # Edges current vertices in recursion cover [(vertex, vertex)]
        if current_covered is None:
            current_covered = []

        # If there are more vertices > k, return all vertices
        if k >= len(vertices):
            return vertices, edges

        # If current has less vertices than result and contains all edges, return
        if k == -1 and len(current_covered) == len(edges) and (best == [] or len(current) < len(best)):
            return current, current_covered

        # If k is equal to current and current covers more edges than best, return
        if k == len(current) and len(current_covered) > len(best_covered):
            return current, current_covered

        # Get all vertices that have not been covered and shuffle them
        ver = [u for u in vertices if len(current) == 0 or u > current[-1]]
        random.shuffle(ver)

        # Recursively do this for all vertices, until a solution is found.
        if (k == -1 or len(current) < k) and (best == [] or len(current) < len(best)):
            for v in ver:
                c = current_covered + [e for e in self.vertex_cover(v, depth) if
                                       not (e in current_covered or (e[1], e[0]) in current_covered)]
                best, best_covered = self.vertex_cover_brute(k, depth, vertices, edges,
                                                             best, best_covered, current + [v], c)

        return best, best_covered

    def vertex_cover(self, v: int, reach: int = 1, current_depth: int = 0, covered: [(int, int)] = None):
        if covered is None:
            covered = []

        if current_depth < reach:
            for u in [e for e in self.graph[str(v)] if not ((v, e) in covered or (e, v) in covered)]:
                covered = self.vertex_cover(u, reach, current_depth + 1, covered + [(v, u)])

        return covered

    def increase_pendant_vertices(self):
        non_pendant_vertices = [u for u in self.vertices() if not self.is_pendant(u)]
        if len(non_pendant_vertices) > 0:
            v = random.choice(non_pendant_vertices)
            while not self.is_pendant(v):
                remaining_non_pendant_vertices = [u for u in self.graph[str(v)] if
                                                  not self.is_pendant(u) and not u == v]
                if len(remaining_non_pendant_vertices) > 0:
                    if self.degree(v) > 1:
                        self.remove_edge(v, random.choice(remaining_non_pendant_vertices))
                    else:
                        self.add_edge(v, random.choice(remaining_non_pendant_vertices))
                else:
                    if self.degree(v) > 1:
                        self.remove_edge(v, random.choice(self.graph[str(v)]))
                    else:
                        self.connect_vertex_to_random(v)

    def decrease_pendant_vertices(self):
        pendant_vertices = [v for v in self.vertices() if self.is_pendant(v)]
        if len(pendant_vertices) > 0:
            vertex = random.choice(pendant_vertices)
            self.remove_edge(vertex, random.choice(self.graph[str(vertex)]))

    def increase_tops_vertices(self, k: int):
        non_tops_vertices = [v for v in self.vertices() if not self.is_tops(v, k)]

        if len(non_tops_vertices) > 0:
            v = random.choice(non_tops_vertices)
            while not self.is_tops(v, k) and self.degree(v) + 1 < len(self.vertices()):
                self.connect_vertex_to_random(v)

    def decrease_tops_vertices(self, k: int):
        tops_vertices = [v for v in self.vertices() if self.is_tops(v, k)]
        if len(tops_vertices) > 0:
            v = random.choice(tops_vertices)
            while self.is_tops(v, k) and self.degree(v) > 0:
                self.remove_random_edge(v)

    def decrease_isolated_vertices(self):
        isolated_vertices = [v for v in self.vertices() if self.is_isolated(v)]
        self.connect_vertex_to_random(random.choice(isolated_vertices))

    def increase_isolated_vertices(self):
        non_isolated_vertices = [v for v in self.vertices() if not self.is_isolated(v)]

        if len(non_isolated_vertices) > 0:
            v = random.choice(non_isolated_vertices)
            self.remove_all_edges(v)

    def degree(self, v: int, depth: int = 1):
        if depth == 1:
            return len(self.graph[str(v)])
        return len(self.vertex_cover(v, depth))

    def is_isolated(self, vertex: int):
        return self.degree(vertex) == 0

    def is_pendant(self, vertex: int):
        return self.degree(vertex) == 1

    def is_tops(self, vertex: int, k: int):
        return self.degree(vertex) > k

    def highest_degree_vertex(self, vertices: [int] = None):
        if vertices is None:
            vertices = self.vertices()
        k = -1
        vertex = random.choice(vertices)
        for v in vertices:
            if len(self.graph[str(v)]) > k:
                vertex = v
        return vertex

    def visualize_kernelization(self, k: int):
        isolated = [v for v in self.vertices() if self.is_isolated(v)]
        pendant = [v for v in self.vertices() if self.is_pendant(v)]
        tops = [v for v in self.vertices() if self.is_tops(v, k)]
        return {"isolated": isolated, "pendant": pendant, "tops": tops}

    def kernelization(self, k: int):
        covered = []
        # 1. If k > 0 and v is a vertex of degree greater than k, remove v from the graph and decrease k by one.
        # Every vertex cover of size k must contain v, since other wise too many of its neighbours would have to
        # be picked to cover the incident edges. Thus, an optimal vertex cover for the original graph may be
        # formed from a cover of the reduced problem by adding v back to the cover.
        while k > 0:
            # Get all tops for k.
            tops = [v for v in self.vertices() if self.is_tops(v, k)]

            # If tops is not empty.
            if len(tops) > 0:
                # Remove random v from tops and decrease k by one.
                v = tops[0]
                self.remove_vertex(v)
                covered.append(v)
                k -= 1
            else:
                break

        # 2. If v is an isolated vertex, remove it. Since, any v cannot cover any edges it is not a part of the
        # minimal vertex cover.
        isolated = [v for v in self.vertices() if self.is_isolated(v)]
        for vertex in isolated:
            self.remove_vertex(vertex)

        # 3. If more than k^2 edges remain in the graph, and neither of the previous two rules can be applied,
        # then the graph cannot contain a vertex cover of size k. For, after eliminating all vertices of degree
        # greater than k, each remaining vertex can only cover at most k edges and a set of k vertices could only
        # cover at most k^2 edges. In this case, the instance may be replaced by an instance with two vertices,
        # one edge, and k = 0, which also has no solution.
        if len(self.edges()) > k ** 2 and k != -1:
            return {}, None

        return self.graph, covered

    def approximation(self):
        # Initialize the empty cover.
        cover = []
        edges = self.edges()

        # Consider a set of all edges in a graph.
        while edges:
            # Pick an arbitrary edges (u, v) from that set and add both u and v to the cover.
            u, v = random.choice(edges)
            cover.append(u)
            cover.append(v)
            # Remove all edges from that set that are incident on u or v.
            edges = [e for e in edges if e[0] is not u and e[0] is not v and e[1] is not u and e[1] is not v]

        # Return the result
        return cover

    def tree_approximation(self):
        # Initialize the empty cover
        cover = []
        leaves = [v for v in self.vertices() if self.is_pendant(v)]
        print("leaves", leaves)
        parents = [node for parents in [self.graph[str(leave)] for leave in leaves] for node in parents]
        print("parents", parents)

        # While there exists leaves in the graph.
        while leaves:
            # Add all parents to the cover.
            for parent in parents:
                cover.append(parent)

            # Remove all leaves and their parents from the graph.
            for node in leaves + parents:
                self.remove_all_edges(node)
                self.remove_vertex(node)

            # Recalculate leaves and parents
            leaves = [node for node in self.vertices() if self.is_pendant(node)]
            parents = [node for parents in [self.graph[str(leave)] for leave in leaves] for node in parents]

        return cover
