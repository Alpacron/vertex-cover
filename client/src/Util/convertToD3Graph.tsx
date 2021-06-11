import {GraphData} from 'react-d3-graph';

function getCover(
    graph: any,
    vertex: number,
    depth: number,
    currentDepth: number,
    covered: { source: number; target: number }[]
) {
    if (currentDepth < depth) {
        graph[vertex.toString()].forEach((v: number | [number, number]) => {
            v = Array.isArray(v) ? v[0] : v;
            if (
                covered.filter(
                    (c) => (c.source === v && c.target === vertex) || (c.source === vertex && c.target === v)
                ).length === 0
            )
                covered.push({source: vertex, target: v});
            covered = getCover(graph, v, depth, currentDepth + 1, covered);
        });
    }

    return covered;
}

export function convertToD3Graph(
    graph: any,
    cover: { depth: number; vertices: number[] },
    kernel: { isolated: number[]; pendant: number[]; tops: number[] },
    tour: number[],
    edges: number[][]
): GraphData<any, any> {
    const nodes: { id: number; color: string }[] = [];
    const links: any[] = [];
    let covered: { source: number; target: number }[] = [];
    if (cover.vertices.length > 0) {
        cover.vertices.forEach((c) => (covered = getCover(graph, c, cover.depth, 0, covered)));
    } else if (kernel.pendant.length > 0 || kernel.tops.length > 0) {
        kernel.pendant.forEach((pendant) => (covered = getCover(graph, pendant, 1, 0, covered)));
        kernel.tops.forEach((top) => (covered = getCover(graph, top, 1, 0, covered)));
    } else if (edges.length > 0) {
        edges.forEach((edge) => covered.push({source: edge[0], target: edge[1]}));
    } else if (tour.length > 0) {
        for (let i = 0; i < tour.length; i++) {
            let next;
            if (i + 1 < tour.length)
                next = tour[i + 1]
            else
                next = tour[0]
            covered.push({source: tour[i], target: next})
        }
    }

    Object.keys(graph).forEach((vertex: string) => {
        let color = '#d3d3d3';
        if (cover.vertices.includes(+vertex)) color = '#3f51b5';
        else if (kernel.pendant.includes(+vertex)) color = '#0D8050';
        else if (kernel.tops.includes(+vertex)) color = '#137CBD';
        else if (kernel.isolated.includes(+vertex)) color = '#D13913';

        nodes.push({id: +vertex, color: color});
        graph[vertex].forEach((edge: number | [number, number]) => {
            const e = Array.isArray(edge) ? edge[0] : edge;
            const w = Array.isArray(edge) ? edge[1] : 0;
            // if link hasn't been added yet
            if (e > +vertex) {
                // check if it is covered
                let coveredEdge = covered.findIndex((c) => c.source === +vertex && c.target === e);
                if (coveredEdge == -1)
                    coveredEdge = covered.findIndex((c) => c.target === +vertex && c.source === e);
                let source = +vertex;
                let target = e;
                if (coveredEdge >= 0) {
                    source = covered[coveredEdge].source;
                    target = covered[coveredEdge].target;
                }
                const isCovered = coveredEdge >= 0;
                // add link to link
                links.push({
                    text: w != 0 && (isCovered || tour.length == 0) ? w.toString() : "",
                    source: source,
                    target: target,
                    color: isCovered ? '#D99E0B' : covered.length > 0 ? '#d3d3d365' : '#d3d3d3',
                    strokeWidth: 1.5 + Math.min(1.5, (w - 1 > 0 ? w - 1 : 0) / 15),
                    opacity: tour.length > 0 && !isCovered ? 0.00001 : 1
                });
            }
        });
    });

    return {nodes: nodes, links: links};
}
