import unittest

from graph import Graph


class GraphTests(unittest.TestCase):
    def test_can_create_graph(self):
        graph = Graph()
        self.assertIsNotNone(graph)


if __name__ == '__main__':
    unittest.main()
