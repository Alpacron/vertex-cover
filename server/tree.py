import random
from typing import Optional

from node import Node


class Tree:
    def __init__(self, root: Optional[Node] = None) -> None:
        self.root: Optional[Node] = root

    def is_empty(self) -> bool:
        return self.root is None

    def create_tree(self, nodes: int):
        if self.is_empty():
            self.root = Node(0)

        for node in range(1, nodes):
            self.insert(self.root, node)

    def insert(self, root: Node, data: int) -> None:
        if root.left is None:
            root.left = Node(data, parent=root)
        elif root.right is None:
            root.right = Node(data, parent=root)
        else:
            if bool(random.getrandbits(1)):
                self.insert(root.left, data)
            else:
                self.insert(root.right, data)
