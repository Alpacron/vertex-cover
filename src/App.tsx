import React, {useState} from 'react';
import {Button, Card, Elevation, FormGroup, H1, NumericInput, Switch} from "@blueprintjs/core";
import {Graph, GraphData} from "react-d3-graph";


export default function App() {
    const [vertices, setVertices] = useState(0);
    const [edges, setEdges] = useState(0);
    const [data, setData] = useState<GraphData<any, any>>({nodes: [{id: 1}], links: []})

    const updateGraph = () => {
        let n: { id: number }[] = [];
        for (let i = 0; i < vertices; i++) {
            n.push({id: i})
        }

        let e: { source: number, target: number }[] = []
        for (let i = 0; i < edges; i++) {
            e.push({
                source: n[Math.floor(Math.random() * n.length)].id,
                target: n[Math.floor(Math.random() * n.length)].id
            })
        }

        setData({nodes: n, links: e})
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
                        id="vertices"
                        placeholder="10"
                        value={vertices}
                        onValueChange={valueAsNumber => setVertices(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup
                    label="Density of edges (Probability p)"
                    labelFor="edges"
                    labelInfo="(required)"
                >
                    <NumericInput
                        id="edges"
                        placeholder="10"
                        value={edges}
                        onValueChange={valueAsNumber => setEdges(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup>
                    <Button
                        rightIcon="arrow-right"
                        onClick={updateGraph}
                    >Connect</Button>
                </FormGroup>
                <FormGroup>
                    <Button
                        rightIcon="arrow-right"
                        onClick={updateGraph}
                    >Generate graph</Button>
                </FormGroup>
            </Card>
            <div style={{margin: "1em"}}>
                <Graph
                    id="graph-id"
                    data={data}
                />
            </div>
        </div>
    );
}
