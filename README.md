<p align="center">
  <h1 align="center">Vertex Cover</h1>
  <h4 align="center">
  <strong>Jelle Huibregtse and Aron Hemmes</strong>
  </h4>
</p>

An implementation of vertex cover visualization with kernelization, pruning, search tree optimization and brute force.

## Implementation

We decided to create an interactive web application where we display the vertex cover functionality.

> Deployed website: [here](https://vertex.radiationservers.com/)

So, on the backend we have a main `Graph` class that represents the graph data structure using a dictionary. The key
being the vertex and the value being a list of all edges. The class contains all functionality of the application.
Furthermore, we have the `main.py` that handles the endpoints using FastAPI. There are a lot of helper methods that I
feel do not require any further explanation, but I will describe the main functionality of the important methods now.

First, is the vertex cover brute force method, which like the name suggests tries every single combination until it has
found a vertex cover of size k. Now k can also be -1, in which case it will look for the minimum vertex cover. So the
method takes in the graph (from the class) and that value k. We try every combination recursively using backtracking
until a solution is found.

Second, we have the kernelization method. It reduces the graph into a minimal form given a number k using the following
algorithm.

1. If k > 0 and v is a vertex of degree greater than k, remove v from the graph and decrease k by one. Every vertex
   cover of size k must contain v, since otherwise too many of its neighbours would have to be picked to cover the
   incident edges. Thus, an optimal vertex cover for the original graph may be formed from a cover of the reduced
   problem by adding v back to the cover.

2. If v is an isolated vertex, remove it. Since, any v cannot cover any edges it is not a part of the minimal vertex
   cover.

3. If more than k^2 edges remain in the graph, and neither of the previous two rules can be applied, then the graph
   cannot contain a vertex cover of size k. For, after eliminating all vertices of degree greater than k, each remaining
   vertex can only cover at most k edges, and a set of k vertices could only cover at most k^2 edges. In this case, the
   instance may be replaced by an instance with two vertices, one edge, and k = 0, which also has no solution.

After it has undergone this transformation, we use the resulting graph as input to the brute force algorithm described
above. For most cases this result in a faster execution of the brute force algorithm, since there are fewer vertices.
However, an edge case might be a complete graph, since there are no tops, pendants or isolated vertices.

Third, we have the approximation algorithm. How it works is below:

```
C = ∅

while E ≠ ∅
    pick any {u, v} ∈ E
    C = C ∪ {u, v}
    delete all edges incident to either u or v

return C
```

Finally, we have the functionality to create a tree data structure and run the approximation algorithm for trees on it.
Which is described below:

```
C = ∅

while ∃	leaves in G
    Add all parents to C
    Remove all leaves and their parents from G

return C
```

## Getting started

### Prerequisites

- Python
- Node
- Yarn

### Setup

First, clone the directory.

For backend development, first, install all Python requirements.

```commandline
pip install -r requirements.txt
```

Then start the development server.

```commandline
uvicorn main:app --reload
```

For frontend development, first, get all modules.

```commandline
yarn
```

Then start the development server.

```commandline
yarn start
```

## License

This project is licensed under the [MIT](https://opensource.org/licenses/MIT) license.