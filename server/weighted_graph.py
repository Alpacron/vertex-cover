import random

from graph import Graph


class WeightedGraph:
    def __init__(self, nodes: int, p: float, max_weight: int) -> None:
        self.graph = self.graph_add_weight(Graph().generate_graph(nodes, p), max_weight)

    def __str__(self):
        return str(self.graph)

    @staticmethod
    def graph_add_weight(graph: any, max_weight: int):
        for vertex in graph:
            for edge in graph[vertex]:
                print(edge)
                if edge > int(vertex):
                    graph[vertex][graph[vertex].index(edge)] = (edge, random.randint(1, max_weight))
                else:
                    graph[vertex][graph[vertex].index(edge)] = (edge, [x[1] for x in graph[str(edge)] if x[0] == int(vertex)][0])

        return graph


g = WeightedGraph(10, 0.5, 8)
print(str(g))
