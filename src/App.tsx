import React, {useState, useEffect} from 'react';
import {Button, Card, Elevation, FormGroup, NumericInput} from "@blueprintjs/core";
import {Graph, GraphData} from "react-d3-graph";
import CircularProgress from '@material-ui/core/CircularProgress';

export default function App() {
    const port = 'http://localhost:8000';
    const [vertices, setVertices] = useState(2);
    const [probability, setProbability] = useState(1);
    const [response, setResponse] = useState({graph: {}});
    const [data, setData] = useState<GraphData<any, any>>({nodes: [], links: []});
    const [vertexCover, setVertexCover] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let graph = document.getElementById("graph-id-graph-wrapper");
        if (graph != null)
            graph.children[0].setAttribute('style', "");
        generateGraph();
        setProbability(0.5);
    }, [])

    useEffect(() => {
        setLoading(false);
        if (response.graph !== undefined)
            setData(graphToD3Graph(response.graph));
    }, [response])

    const connectGraph = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-sub', {
                method: "PUT",
                body: JSON.stringify(response)
            }).then(res => res.json())
                .then(setResponse);
        }
    }

    const connectRandomGraph = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-random', {
                method: "PUT",
                body: JSON.stringify(response)
            }).then(res => res.json())
                .then(setResponse);
        }
    }

    const generateGraph = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/generate', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"vertices": vertices, "probability": probability})
            }).then(res => res.json())
                .then(setResponse);
        }
    }

    function graphToD3Graph(graph: any): { nodes: { id: number }[], links: { source: number, target: number }[] } {
        let nodes: { id: number }[] = []
        let links: { source: number, target: number }[] = []
        Object.keys(graph).forEach(v => {
            nodes.push({id: +v});

            graph[v].forEach((l: number) => {
                if (links.filter(link => (link.source === +v && link.target === l) || (link.source === l && link.target === +v)).length === 0)
                    links.push({source: +v, target: l});
            });
        });

        return {nodes: nodes, links: links};
    }

    return (
        <div
            style={{display: "flex", flexDirection: "column", flex: "auto"}}
        >
            <Card elevation={Elevation.TWO}>
                <FormGroup
                    label="Number of vertices"
                    labelFor="vertices"
                >
                    <NumericInput
                        min={1}
                        id="vertices"
                        value={vertices}
                        onValueChange={valueAsNumber => setVertices(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup
                    label="Density of edges"
                    labelFor="probability"
                    labelInfo="(probability p)"
                >
                    <NumericInput
                        min={0}
                        max={1}
                        stepSize={0.1}
                        id="probability"
                        value={probability}
                        onValueChange={valueAsNumber => setProbability(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup
                    style={{display: "flex", flexDirection: "column"}}
                    label="Brute force search"
                    labelFor="brute"
                    labelInfo="(vertex cover k)"
                >
                    <Button
                        style={{marginRight: '15px'}}
                        rightIcon="arrow-right"
                        onClick={connectGraph}
                    >Search</Button>
                    <NumericInput
                        min={0}
                        id="brute"
                        value={vertexCover}
                        onValueChange={valueAsNumber => setVertexCover(valueAsNumber)}
                    />
                </FormGroup>
                <FormGroup>
                    <Button
                        style={{marginRight: '15px'}}
                        title="Connect two random disconnected sub graphs"
                        rightIcon="arrow-right"
                        onClick={connectGraph}
                    >Connect sub graphs</Button>
                    <Button
                        title="Connect two valid random vertices"
                        rightIcon="arrow-right"
                        onClick={connectRandomGraph}
                    >Connect random</Button>
                </FormGroup>
                <FormGroup>
                    <Button
                        rightIcon="arrow-right"
                        onClick={generateGraph}
                    >Generate graph</Button>
                </FormGroup>
            </Card>
            <div style={{margin: "1em", overflow: "hidden", flex: "auto", display: "flex", flexDirection: "column"}}>
                <Graph
                    id="graph-id"
                    data={data}
                    config={{staticGraph: false}}
                />
                <div style={{position: "absolute", pointerEvents: "none"}} className={loading? '' : 'fadeout'}>
                    <CircularProgress/>
                </div>
            </div>
        </div>
    );
}
