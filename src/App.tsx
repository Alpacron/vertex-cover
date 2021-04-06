import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Elevation, FormGroup, NumericInput} from "@blueprintjs/core";
import {Graph} from "react-d3-graph";
import CircularProgress from '@material-ui/core/CircularProgress';
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import './App.css';

export default function App() {
    const port = 'http://localhost:8000';
    const [vertices, setVertices] = useState(2);
    const [probability, setProbability] = useState(1);
    const [data, setData] = useState<{ graph: {} }>({graph: {}});
    const [coverVertices, setCoverVertices] = useState<{ k: number, cover: number[] }>({k: 1, cover: []});
    const [vertexCover, setVertexCover] = useState(1);
    const [loading, setLoading] = useState(false);
    const {width, height} = useWindowDimensions();
    const graphRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // TODO: Restart simulation (or center graph) upon resizing.
    }, [width, height])

    /**
     * Do on document load
     */
    useEffect(() => {
        generateGraph();
        setProbability(0.5);
    }, [])

    /**
     * Connecting two sub graphs
     */
    const connectSubGraphs = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-sub', {
                method: "PUT",
                body: JSON.stringify(data)
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices({k: vertexCover, cover: []});
                    setData(res)
                });
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
                body: JSON.stringify(data)
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices({k: vertexCover, cover: []});
                    setData(res)
                });
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
                .then(res => {
                    setLoading(false);
                    setCoverVertices({k: vertexCover, cover: []});
                    setData(res)
                });
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
                body: JSON.stringify({graph: data.graph, k: vertexCover})
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices({k: vertexCover, cover: res.vertices})
                });
        }
    }

    return (
        <div
            style={{display: "flex", flexDirection: "column", flex: "auto"}}
        >
            <Card elevation={Elevation.TWO} style={{overflowY: "scroll", flex: '1 0 0'}}>
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
            <div className="container__graph-area" ref={graphRef}>
                <Graph
                    id="graph-id"
                    data={convertToD3Graph(data.graph, coverVertices)}
                    config={{
                        staticGraph: false,
                        height: graphRef.current != null ? graphRef.current.offsetHeight : 0,
                        width: graphRef.current != null ? graphRef.current.offsetWidth : 0
                    }}
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
