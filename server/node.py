from typing import Optional


class Node:

    def __init__(self, data: int, parent: Optional["Node"]) -> None:
        self.data: int = data
        self.parent: Optional[Node] = parent
        self.left: Optional[Node] = None
        self.right: Optional[Node] = None
