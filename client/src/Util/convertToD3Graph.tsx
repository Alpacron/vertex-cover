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

export default function (graph: any, depth: number, cover: number[], kernel: { isolated: number[], pendant: number[], tops: number[] }): GraphData<any, any> {
    let nodes: { id: number, color: string }[] = [];
    let links: { source: number, target: number, color: string }[] = [];
    let covered: { source: number, target: number }[] = [];
    if (cover.length > 0) {
        cover.forEach(c => covered = getCover(graph, c, depth, 0, covered));
    } else if (kernel.isolated.length > 0 || kernel.pendant.length > 0) {
        kernel.isolated.forEach(i => covered = getCover(graph, i, 1, 0, covered))
        kernel.pendant.forEach(p => covered = getCover(graph, p, 1, 0, covered))
    }

    Object.keys(graph).forEach(v => {
        nodes.push({
            id: +v,
            color: cover.includes(+v) ? "#3f51b5" :
                (kernel.isolated.includes(+v) ? "#D13913" :
                    (kernel.tops.includes(+v) ? "#137CBD" :
                        (kernel.pendant.includes(+v) ? "#0D8050" :
                                "#d3d3d3"
                        )))
        });

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