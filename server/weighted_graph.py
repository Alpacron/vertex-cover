from graph import Graph


class WeightedGraph:
    def __init__(self, graph=None) -> None:
        self.graph = Graph()
        if graph is not None:
            self.graph.graph = graph

    def __str__(self) -> str:
        return str(self.graph.graph)

    def generate_graph(self, n: int) -> dict[str, list[list[int]]]:
        self.graph.graph = {}
        # Add vertices
        for i in range(n):
            self.graph.graph[str(i)] = [[x, 1] for x in range(n) if x != i]
        return self.graph.graph

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

    def graph_to_edges(self, graph: dict[str, list[list[int, int]]]):
        # Create an array of edges with their weight
        t = [[[int(x), y[0], y[1]] for y in graph[x] if y[0] > int(x)] for x in graph]
        # Flatten array
        return [item for sublist in t for item in sublist]

    # Calculates a minimum spanning tree using kruskal's algorithm
    def kruskal_mst(self) -> list[list[int]]:
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
            # Else discard the edge

        # Remove weights from edges in result
        result = [[x[0], x[1]] for x in result]
        return result

    # Find vertices with odd degree in list of edges
    def get_vertices_with_odd_degree(self, n: int, edges: list[list[int]]) -> list[int]:
        vertices = [0 for _ in range(n)]
        for edge in edges:
            vertices[edge[0]] += 1
            vertices[edge[1]] += 1
        return [x for x in range(len(vertices)) if vertices[x] % 2 != 0]

    # Form the subgraph of a graph using only a set of vertices
    def subgraph_from_vertices(self, vertices: list[int]) -> dict[str, list[list[int]]]:
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
    def combine_edges(self, sub1: list[list[int]], sub2: list[list[int]]) -> list[list[int]]:
        result = sub1
        # Remove doubles
        for edge in sub2:
            if edge not in result:
                result.append(edge)
        return result

    # Find a minimum-weight perfect matching in a set of edges using a brute force algorithm
    def perfect_matching(self, vertices: list[int], edges: list[list[int, int, int]],
                         covered: list[list[int, int, int]] = None,
                         best: list[list[int, int, int]] = None) -> list[list[int, int]]:
        if covered is None:
            covered = []
        if best is None:
            best = []

        for edge in [x for x in edges if x not in covered]:
            # Set current to cover
            current = covered + [edge]
            # Get all vertices in covered edges
            li = list(set([item for sublist in [[x[0], x[1]] for x in current] for item in sublist]))
            # Check all vertices are covered, if so return current
            weight = sum([x[2] for x in current])
            # If all vertices are covered in current and weight is less then best weight, then best = current
            if len(vertices) == len(li) and (len(best) == 0 or weight < sum([x[2] for x in best])):
                best = current
            # Else, if still below best weight
            elif len(best) == 0 or weight + 1 < sum([x[2] for x in best]):
                current = self.perfect_matching(vertices, edges, current, best)
                # If weight of result is less then best weight, best = current
                if len(best) == 0 or sum([x[2] for x in current]) < sum([x[2] for x in best]):
                    best = current

        # Return only edges if at the end of loop
        if len(covered) == 0 and len(best) > 0:
            return [[x[0], x[1]] for x in best]
        return best

    # Find euler tour with brute force algorithm
    def calculate_euler_tour(self, edges: list[list[int, int]], covered: list[list[int, int]] = None) -> list[int]:
        if covered is None:
            covered = [edges[0]]

        if len(edges) != len(covered):
            # Loop through edges that haven't been covered
            for edge in [x for x in edges if x not in covered]:
                if edge[0] in covered[-1] or edge[1] in covered[-1]:
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
            return result + [result[0]]

        return []
