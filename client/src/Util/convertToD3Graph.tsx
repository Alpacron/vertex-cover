import {GraphData} from "react-d3-graph";

function getCover(graph: any, vertex: number, depth: number, currentDepth: number, covered: { source: number, target: number }[]) {
    if (currentDepth < depth) {
        graph[vertex.toString()].forEach((v: number) => {
            if (covered.filter(c => (c.source === v && c.target === vertex) || (c.source === vertex && c.target === v)).length === 0)
                covered.push({source: vertex, target: v});
            covered = getCover(graph, v, depth, currentDepth + 1, covered);
        })
    }

    return covered
}

export default function (graph: any, cover: {depth: number, vertices: number[]}, kernel: { isolated: number[], pendant: number[], tops: number[] }): GraphData<any, any> {
    let nodes: { id: number, color: string }[] = [];
    let links: { source: number, target: number, color: string }[] = [];
    let covered: { source: number, target: number }[] = [];
    if (cover.vertices.length > 0) {
        cover.vertices.forEach(c => covered = getCover(graph, c, cover.depth, 0, covered));
    } else if (kernel.pendant.length > 0 || kernel.tops.length > 0) {
        kernel.pendant.forEach(p => covered = getCover(graph, p, 1, 0, covered))
        kernel.tops.forEach(t => covered = getCover(graph, t, 1, 0, covered))
    }

    Object.keys(graph).forEach(v => {
        let color = "#d3d3d3";
        if (cover.vertices.includes(+v))
            color = "#3f51b5";
        else if (kernel.pendant.includes(+v))
            color = "#0D8050";
        else if (kernel.tops.includes(+v))
            color = "#137CBD";
        else if (kernel.isolated.includes(+v))
            color = "#D13913";

        nodes.push({id: +v, color: color});

        graph[v].forEach((l: number) => {
            // if link hasn't been added yet
            if (links.filter(link => (link.source === +v && link.target === l) || (link.source === l && link.target === +v)).length === 0) {
                // check if it is covered
                let isCovered = covered.filter(c => (c.source === +v && c.target === l) || (c.source === l && c.target === +v)).length > 0;
                // add link to links
                links.push({source: +v, target: l, color: isCovered ? "#D99E0B" : "#d3d3d3"});
            }
        });
    });

    return {nodes: nodes, links: links};
}