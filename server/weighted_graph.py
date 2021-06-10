from graph import Graph


class WeightedGraph:
    def __init__(self, graph=None) -> None:
        self.graph = Graph()
        if graph is not None:
            self.graph.graph = graph

    def __str__(self):
        return str(self.graph.graph)

    def generate_graph(self, n: int):
        # Add vertices
        for i in range(n):
            self.graph.graph[str(i)] = [[x, 1] for x in range(n) if x != i]

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

    # Calculates a minimum spanning tree using kruskal's algorithm
    def kruskal_mst(self):
        result = []  # This will store the resultant MST

        # An index variable, used for sorted edges
        i = 0

        # An index variable, used for result[]
        e = 0

        # Number of vertices
        n = len(self.graph.graph)

        # Create an array of edges with their weight
        t = [[[int(x), y[0], y[1]] for y in self.graph.graph[x] if y[0] > int(x)] for x in self.graph.graph]
        # Flatten array
        t = [item for sublist in t for item in sublist]
        # Sort all the edges in non-decreasing order of their weight.
        edges = sorted(t, key=lambda item: item[2])

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
        print(result)
        return result

    # Find vertices with odd degree in list of edges
    def get_vertices_with_odd_degree(self, n, edges):
        vertices = [0 for _ in range(n)]
        for edge in edges:
            vertices[edge[0]] += 1
            vertices[edge[1]] += 1
        return [x for x in range(len(vertices)) if vertices[x] % 2 != 0]
