from typing import Optional, List


class Node:

    def __init__(self, data: int, parent: Optional["Node"] = None, children=None) -> None:
        if children is None:
            children = []
        self.data: int = data
        self.parent: Optional[Node] = parent
        self.children: Optional[List[Node]] = children
