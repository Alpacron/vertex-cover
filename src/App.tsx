import React, {useState, useEffect} from 'react';
import {Button, Card, Elevation, FormGroup, NumericInput} from "@blueprintjs/core";
import {Graph, GraphData} from "react-d3-graph";
import CircularProgress from '@material-ui/core/CircularProgress';

export default function App() {
    const port = 'http://localhost:8000';
    const [vertices, setVertices] = useState(2);
    const [probability, setProbability] = useState(1);
    const [responseGraph, setResponseGraph] = useState({graph: {}});
    const [responseVertices, setResponseVertices] = useState({vertices: []});
    const [data, setData] = useState<GraphData<any, any>>({nodes: [], links: []});
    const [vertexCover, setVertexCover] = useState(1);
    const [loading, setLoading] = useState(false);

    /**
     * Do on document load
     */
    useEffect(() => {
        // Setting graph height and width to 0, so flex is set properly.
        let graph = document.getElementById("graph-id-graph-wrapper");
        if (graph != null)
            graph.children[0].setAttribute('style', "");

        // Generating graph.
        generateGraph();
        setProbability(0.5);
    }, [])

    /**
     * Do when graph response is loaded
     */
    useEffect(() => {
        // Set loading to false.
        setLoading(false);

        // Drawing graph.
        if (responseGraph.graph !== undefined)
            setData(graphToD3Graph(responseGraph.graph));
    }, [responseGraph])

    /**
     * Do when vertex cover response is loaded
     */
    useEffect(() => {
        // Set loading to false.
        setLoading(false);

        if (responseVertices.vertices !== undefined)
            console.log(responseVertices.vertices);
    }, [responseVertices])

    /**
     * Connecting two sub graphs
     */
    const connectSubGraphs = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-sub', {
                method: "PUT",
                body: JSON.stringify(responseGraph)
            }).then(res => res.json())
                .then(setResponseGraph);
        }
    }

    /**
     * Connecting two vertices
     */
    const connectVertices = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-random', {
                method: "PUT",
                body: JSON.stringify(responseGraph)
            }).then(res => res.json())
                .then(setResponseGraph);
        }
    }

    /**
     * Generating graph
     */
    const getVertexCover = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/vertex-cover', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({graph: responseGraph.graph, k: vertexCover})
            }).then(res => res.json())
                .then(setResponseVertices);
        }
    }

    /**
     * Generating graph
     */
    const generateGraph = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/generate', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"vertices": vertices, "probability": probability})
            }).then(res => res.json())
                .then(setResponseGraph);
        }
    }

    /**
     * Converting our python graph to react-d3-graph
     */
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
                        onClick={getVertexCover}
                    >Search</Button>
                    <NumericInput
                        min={1}
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
                        onClick={connectSubGraphs}
                    >Connect sub graphs</Button>
                    <Button
                        title="Connect two random disconnected vertices"
                        rightIcon="arrow-right"
                        onClick={connectVertices}
                    >Connect vertices</Button>
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
                <div style={{
                    position: "absolute",
                    pointerEvents: "none",
                    animation: loading ? '' : 'fadeOut 0.5s forwards'
                }}>
                    <CircularProgress/>
                </div>
            </div>
        </div>
    );
}
