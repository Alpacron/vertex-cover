import random
from typing import Optional

from graph import Graph
from node import Node


class Tree:
    def __init__(self, root: Optional[Node] = None) -> None:
        self.root: Optional[Node] = root
        self.graph = Graph()

        if root is not None:
            self.graph.add_vertex(0)

    def __str__(self):
        return str(self.graph)

    def is_empty(self) -> bool:
        return self.root is None

    def create_tree(self, nodes: int, max_children: Optional[int] = None):
        if self.is_empty():
            self.root = Node(0)
            self.graph.add_vertex(0)

        for node in range(1, nodes):
            self.insert(self.root, node, max_children)

    def insert(self, node: Node, data: int, max_children: Optional[int] = None) -> None:
        if len(node.children) < max_children:
            node.children.append(Node(data, parent=node))
            self.graph.add_vertex(data)
            self.graph.add_edge(node.data, data)
        else:
            child = random.choice(node.children)
            self.insert(node=child, data=data, max_children=max_children)