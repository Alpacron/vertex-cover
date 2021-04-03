import React, {useState} from 'react';
import {Button, Card, Elevation, FormGroup, NumericInput} from "@blueprintjs/core";
import {Graph, GraphData} from "react-d3-graph";


export default function App() {
    const port = 'http://localhost:8000';
    const [vertices, setVertices] = useState(1);
    const [probability, setProbability] = useState(0);
    const [response, setResponse] = useState(null);
    const [data, setData] = useState<GraphData<any, any>>({nodes: [{id: 0}, {id: 1}], links: [{source: 0, target: 1}]});

    const connectGraph = () => {
        fetch(port + '/connect', {
            method: "PUT",
            body: JSON.stringify(response)
        }).then(res => res.json())
            .then(response => {
                if(response.graph !== undefined) {
                    setResponse(response);
                    setData(graphToD3Graph(response.graph));
                }
            });
    }

    const generateGraph = () => {
        fetch(port + '/generate', {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({"vertices": vertices, "probability": probability})
        }).then(res => res.json())
            .then(response => {
                if(response.graph !== undefined) {
                    setResponse(response);
                    setData(graphToD3Graph(response.graph));
                }
            });
    }

    function graphToD3Graph(graph: any) : {nodes: { id: number }[], links: { source: number, target: number }[]} {
        let nodes: { id: number }[] = []
        let links: { source: number, target: number }[] = []
        Object.keys(graph).forEach(v => {
            nodes.push({id: +v});

            graph[v].forEach((l: number) => {
                if(!(links.includes({source: +v, target: l}) || links.includes({source: l, target: +v})))
                    links.push({source: +v, target: l});
            });
        });

        return {nodes: nodes, links: links};
    }

    return (
        <div>
            <Card elevation={Elevation.TWO}>
                <FormGroup
                    label="Number of vertices"
                    labelFor="vertices"
                    labelInfo="(required)"
                >
                    <NumericInput
                        min={1}
                        id="vertices"
                        placeholder="10"
                        value={vertices}
                        onValueChange={valueAsNumber => setVertices(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup
                    label="Density of edges (Probability p)"
                    labelFor="probability"
                    labelInfo="(required)"
                >
                    <NumericInput
                        min={0}
                        max={1}
                        stepSize={0.1}
                        id="probability"
                        placeholder="10"
                        value={probability}
                        onValueChange={valueAsNumber => setProbability(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup>
                    <Button
                        rightIcon="arrow-right"
                        onClick={connectGraph}
                    >Connect</Button>
                </FormGroup>
                <FormGroup>
                    <Button
                        rightIcon="arrow-right"
                        onClick={generateGraph}
                    >Generate graph</Button>
                </FormGroup>
            </Card>
            <div style={{margin: "1em"}}>
                <Graph
                    id="graph-id"
                    data={data}
                    config={{staticGraph: false}}
                />
            </div>
        </div>
    );
}
