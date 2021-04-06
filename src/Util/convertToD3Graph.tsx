import {GraphData} from "react-d3-graph";

function getCover(graph: any, vertex: number, k: number, depth: number, covered: { source: number, target: number }[]) {
    if (depth < k) {
        graph[vertex.toString()].forEach((v: number) => {
            if (covered.filter(c => (c.source === v && c.target === vertex) || (c.source === vertex && c.target === v)).length === 0) {
                let c = [];
                covered.forEach(val => c.push(Object.assign({}, val)));
                c.push({source: vertex, target: v});
                covered = getCover(graph, v, k, depth + 1, c)
            }
        })
    }

    return covered
}

export default function convertToD3Graph(graph: any, cover: { k: number, cover: number[] }): GraphData<any, any> {
    let nodes: { id: number, color: string }[] = [];
    let links: { source: number, target: number, color: string }[] = [];
    let covered: { source: number, target: number }[] = [];
    if (cover.cover.length > 0)
        cover.cover.forEach(c => covered = getCover(graph, c, cover.k, 0, covered));

    Object.keys(graph).forEach(v => {
        nodes.push({id: +v, color: cover.cover.includes(+v) ? "#3f51b5" : "#d3d3d3"});

        graph[v].forEach((l: number) => {
            // if link hasn't been added yet
            if (links.filter(link => (link.source === +v && link.target === l) || (link.source === l && link.target === +v)).length === 0) {
                // check if it is covered
                let isCovered = covered.filter(c => (c.source == +v && c.target == l) || (c.source == l && c.target == +v)).length > 0;
                // add link to links
                links.push({source: +v, target: l, color: isCovered ? "goldenrod" : "#d3d3d3"});
            }
        });
    });

    return {nodes: nodes, links: links};
}