from typing import Dict, List

from graph import Graph
import random


class WeightedGraph:
    def __init__(self, graph=None) -> None:
        self.graph = Graph()
        if graph is not None:
            self.graph.graph = graph

    def __str__(self) -> str:
        return str(self.graph.graph)

    def generate_graph(self, n: int, p: float) -> Dict[str, List[List[int]]]:
        # Generate default graph
        self.graph.graph = self.graph.generate_graph(n, p)
        for v in self.graph.graph:
            # Add random weight to edges
            self.graph.graph[v] = [[x, random.randint(0, round(len(self.graph.graph) / 5)) + 1] for x in
                                   self.graph.graph[v]]

        # Make sure edge degree is a minimum of 2 for every vertex
        for v in self.graph.graph:
            while len(self.graph.graph[v]) < 2:
                available = [int(x) for x in self.graph.graph if
                             int(x) not in [y[0] for y in self.graph.graph[v]] and x is not v]
                vertex = random.choice(available)
                weight = round(len(self.graph.graph) / 5) + 1
                self.graph.graph[v].append([vertex, weight])
                self.graph.graph[str(vertex)].append([int(v), weight])

        for v in self.graph.graph:
            for e in self.graph.graph[v]:
                for i in self.graph.graph[v]:
                    if i[0] > e[0] > int(v) and len([x for x in self.graph.graph[str(e[0])] if x[0] == i[0]]) != 0:
                        a = e[0]
                        b = i[0]
                        c = int(v)

                        # Make graph weights symmetric
                        self.graph.graph[str(b)][self.get_vertex_index(b, a)][1] = \
                            self.graph.graph[str(a)][self.get_vertex_index(a, b)][1]
                        self.graph.graph[str(c)][self.get_vertex_index(c, a)][1] = \
                            self.graph.graph[str(a)][self.get_vertex_index(a, c)][1]
                        self.graph.graph[str(c)][self.get_vertex_index(c, b)][1] = \
                            self.graph.graph[str(b)][self.get_vertex_index(b, c)][1]

                        # Make sure weights obey triangle inequality
                        weights = self.get_weights(a, b, c)
                        if weights[0] > weights[1] + weights[2]:
                            self.set_edge_weight(a, b, weights[1] + weights[2])
                            weights[0] = weights[1] + weights[2]
                        if weights[1] > weights[0] + weights[2]:
                            self.set_edge_weight(a, c, weights[1] + weights[2])
                            weights[1] = weights[0] + weights[2]
                        weights = self.get_weights(a, b, c)
                        if weights[2] > weights[0] + weights[1]:
                            self.set_edge_weight(b, c, weights[1] + weights[2])

        # Sort graph
        for v in self.graph.graph:
            self.graph.graph[v] = sorted(self.graph.graph[v], key=lambda item: item[0])

        return self.graph.graph

    def set_edge_weight(self, u: int, v: int, w: int):
        index = self.get_vertex_index(u, v)
        self.graph.graph[str(u)][index][1] = w
        index = self.get_vertex_index(v, u)
        self.graph.graph[str(v)][index][1] = w

    def get_vertex_index(self, v: int, u: int) -> int:
        return [x for x in range(len(self.graph.graph[str(v)])) if self.graph.graph[str(v)][x][0] == u][0]

    def get_weights(self, a: int, b: int, c: int) -> List[int]:
        ab = [x for x in self.graph.graph[str(a)] if x[0] == b][0][1]
        ac = [x for x in self.graph.graph[str(a)] if x[0] == c][0][1]
        bc = [x for x in self.graph.graph[str(b)] if x[0] == c][0][1]
        return [ab, ac, bc]

    # A utility function to find set of an element i
    # (uses path compression technique)
    def find(self, parent, i):
        if parent[i] == i:
            return i
        return self.find(parent, parent[i])

    # A function that does union of two sets of x and y
    # (uses union by rank)
    def union(self, parent, rank, x, y):
        xroot = self.find(parent, x)
        yroot = self.find(parent, y)

        # Attach smaller rank tree under root of
        # high rank tree (Union by Rank)
        if rank[xroot] < rank[yroot]:
            parent[xroot] = yroot
        elif rank[xroot] > rank[yroot]:
            parent[yroot] = xroot

        # If ranks are same, then make one as root
        # and increment its rank by one
        else:
            parent[yroot] = xroot
            rank[xroot] += 1

    @staticmethod
    def graph_to_edges(graph: Dict[str, List[List[int]]]) -> List[List[int]]:
        # Create an array of edges with their weight
        t = [[[int(x), y[0], y[1]] for y in graph[x] if y[0] > int(x)] for x in graph]
        # Flatten array
        return [item for sublist in t for item in sublist]

    # Calculates a minimum spanning tree using kruskal's algorithm
    def kruskal_mst(self) -> List[List[int]]:
        result = []  # This will store the resultant MST

        # An index variable, used for sorted edges
        i = 0

        # An index variable, used for result[]
        e = 0

        # Number of vertices
        n = len(self.graph.graph)

        # Sort all the edges in non-decreasing order of their weight.
        edges = sorted(self.graph_to_edges(self.graph.graph), key=lambda item: item[2])

        parent = []
        rank = []

        # Create V subsets with single elements
        for node in range(n):
            parent.append(int(node))
            rank.append(0)

        # Number of edges to be taken is equal to n-1
        while e < n - 1:

            # Pick the smallest edge and increment the index for next iteration
            u, v, w = edges[i]
            i += 1
            x = self.find(parent, u)
            y = self.find(parent, v)

            # If including this edge doesn't cause cycle,
            # include it in result and increment the index of result for next edge
            if x != y:
                e = e + 1
                result.append([u, v, w])
                self.union(parent, rank, x, y)

        # Remove weights from edges in result
        result = [[x[0], x[1]] for x in result]
        return result

    # Find vertices with odd degree in list of edges
    @staticmethod
    def get_vertices_with_odd_degree(n: int, edges: List[List[int]]) -> List[int]:
        vertices = [0 for _ in range(n)]
        for edge in edges:
            vertices[edge[0]] += 1
            vertices[edge[1]] += 1
        return [x for x in range(len(vertices)) if vertices[x] % 2 != 0]

    # Form the subgraph of a graph using only a set of vertices
    def subgraph_from_vertices(self, vertices: List[int]) -> Dict[str, List[List[int]]]:
        g = self.graph.graph.copy()

        # Remove all edges from graph that include vertices not in the vertices argument
        for v in list(g.keys()):
            if int(v) not in vertices:
                for u in g[v]:
                    # Get index of element
                    index = next((i for i, item in enumerate(g[str(u[0])]) if item[0] == int(v)), -1)
                    del g[str(u[0])][index]
                del g[v]
        return g

    # Combine two graph's into one
    @staticmethod
    def combine_edges(sub1: List[List[int]], sub2: List[List[int]]) -> List[List[int]]:
        result = sub1
        # Remove doubles
        for edge in sub2:
            if edge not in result:
                result.append(edge)
        return result

    # Find a minimum-weight perfect matching in a set of edges using a brute force algorithm
    def perfect_matching(self, vertices: List[int], edges: List[List[int]],
                         covered: List[List[int]] = None) -> List[List[int]]:
        if covered is None:
            covered = []
            # Sort edges from lowest to highest weight
            edges = sorted(edges, key=lambda item: item[2])

            vertices = [x for x in vertices if
                        x in [item for sublist in [[y[0], y[1]] for y in edges] for item in sublist]]

        # Get all edges that can be added to matching
        available = [x for x in edges if len([y for y in covered if x[0] in [y[0], y[1]] or x[1] in [y[0], y[1]]]) == 0]
        for edge in available:
            # Set current to covered and edge in loop
            current = covered + [edge]
            # If all vertices are covered in current and weight is less then best weight, then best = current
            if (len(vertices) % 2 == 0 and len(current) == len(vertices) / 2) or \
                    (len(vertices) % 2 == 1 and len(current) == (len(vertices) - 1) / 2):
                return [[x[0], x[1]] for x in current]
            else:
                current = self.perfect_matching(vertices, edges, current)
                if len(current) > 0:
                    return current

        # If no matching perfect is found, return empty list
        return []

    # Find euler tour with brute force algorithm
    def calculate_euler_tour(self, edges: List[List[int]], covered: List[List[int]] = None) -> List[int]:
        if covered is None:
            covered = [edges[0]]

        if len(edges) != len(covered):
            # Loop through edges that haven't been covered
            for edge in [x for x in edges if x not in covered]:
                is_in_route = (len(covered) < 2 or [y for y in [x for x in covered[-1] if x in covered[-2]] if
                                                    y not in edge])
                if (edge[0] in covered[-1] or edge[1] in covered[-1]) and is_in_route:
                    result = self.calculate_euler_tour(edges, covered + [edge])
                    if len(result) > 0:
                        return result
        else:
            # Return path in vertices
            result = []
            for e in range(len(covered)):
                if e + 1 < len(covered):
                    next_in_covered = covered[e + 1]
                else:
                    next_in_covered = covered[0]
                result.append([x for x in covered[e] if x in next_in_covered][0])
            return result

        return []

    def eulerian_multigraph(self) -> List[List[int]]:
        # Number of vertices
        n = len(self.graph.graph)

        # Calculate minimum spanning tree T
        t = self.kruskal_mst()
        # Calculate the set of vertices O with odd degree in T
        o = self.get_vertices_with_odd_degree(n, t)
        # Form the subgraph of G using only the vertices of O
        s = self.subgraph_from_vertices(o)
        # Construct a minimum-weight perfect matching M in this subgraph
        m = self.perfect_matching(o, [x for x in self.graph_to_edges(s) if [x[0], x[1]] not in t])
        # Unite matching and spanning tree T ∪ M to form an Eulerian multigraph
        e = self.combine_edges(t, m)

        return e

    def christofides_algorithm(self) -> List[int]:
        # Create an Eulerian multigraph
        e = self.eulerian_multigraph()
        # Calculate Euler tour
        et = self.calculate_euler_tour(e)
        # Remove repeated vertices, giving the algorithm's output
        c = list(dict.fromkeys(et))

        return c
