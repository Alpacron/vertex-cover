import React, {useEffect, useRef, useState} from 'react';
import {
    Button, ButtonGroup, NumericInput, FormGroup,
    Card, Spinner, H6
} from "@blueprintjs/core";
import {Graph} from "react-d3-graph";
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import './App.css';

export default function App() {
    const port = 'http://localhost:8000';
    const [vertices, setVertices] = useState(2);
    const [probability, setProbability] = useState(1);
    const [data, setData] = useState<{ graph: {} }>({graph: {}});
    const [coverVertices, setCoverVertices] = useState<number[]>([]);
    const [coverK, setCoverK] = useState<number>(-1);
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const {width, height} = useWindowDimensions();
    const graphRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // TODO: Restart simulation (or center graph) upon resizing.
    }, [width, height])

    useEffect(() => {
        generateGraph();
        setProbability(0.5);
    }, [])

    useEffect(() => {
        if (coverVertices.length > 0) {
            setCoverVertices([]);
        }
    }, [coverDepth])

    const connectSubGraphs = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-sub', {
                method: "PUT",
                body: JSON.stringify(data)
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices([]);
                    setData(res)
                });
        }
    }

    const connectVertices = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/connect-random', {
                method: "PUT",
                body: JSON.stringify(data)
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices([]);
                    setData(res)
                });
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
                .then(res => {
                    setLoading(false);
                    setCoverVertices([]);
                    setData(res)
                });
        }
    }

    const getVertexCover = () => {
        if (!loading) {
            setLoading(true);
            fetch(port + '/vertex-cover', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({graph: data.graph, depth: coverDepth, k: coverK})
            }).then(res => res.json())
                .then(res => {
                    setLoading(false);
                    setCoverVertices(res.vertices)
                });
        }
    }

    const onClickNode = function (nodeId: string) {
        let c = Object.assign([], coverVertices);
        if (c.indexOf(+nodeId, 0) > -1)
            c.splice(coverVertices.indexOf(+nodeId, 0), 1);
        else
            c.push(+nodeId);
        setCoverVertices(c);
    };

    return (
        <div
            style={{display: "flex", flexDirection: "column", flex: "auto", overflow: "hidden"}}
        >
            <Card style={{overflowY: "scroll"}}>
                <H6>Directed Graph</H6>
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
                        onValueChange={setProbability}
                    />
                </FormGroup>
                <ButtonGroup style={{marginRight: "1em"}}>
                    <Button
                        onClick={generateGraph}
                    >Generate graph</Button>
                </ButtonGroup>
                <ButtonGroup>
                    <Button
                        title="Connect two random disconnected sub graphs"
                        onClick={connectSubGraphs}
                    >Connect sub graphs</Button>
                    <Button
                        title="Connect two random disconnected vertices"
                        onClick={connectVertices}
                    >Connect vertices</Button>
                </ButtonGroup>

                <H6>Vertex Cover</H6>
                <FormGroup
                    style={{display: "flex", flexDirection: "column"}}
                    label="vertex amount k"
                    labelFor="coverK"
                >
                    <NumericInput
                        min={-1}
                        id="coverK"
                        title="-1 = minimum k required"
                        value={coverK}
                        onValueChange={setCoverK}
                    />
                </FormGroup>
                <FormGroup
                    style={{display: "flex", flexDirection: "column"}}
                    label="vertex cover depth"
                    labelFor="depth"
                >
                    <NumericInput
                        min={1}
                        id="depth"
                        title="amount of edges a single vortex can reach"
                        value={coverDepth}
                        onValueChange={setCoverDepth}
                    />
                </FormGroup>
                <ButtonGroup>
                    <Button
                        onClick={getVertexCover}
                    >Brute force search</Button>
                </ButtonGroup>
            </Card>
            <div className="container__graph-area" ref={graphRef}>
                <Graph
                    id="graph-id"
                    data={convertToD3Graph(data.graph, coverDepth != undefined ? coverDepth : 1, coverVertices)}
                    onClickNode={onClickNode}
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
                    <Spinner/>
                </div>
            </div>
        </div>
    );
}
