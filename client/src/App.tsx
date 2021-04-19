import React, {useEffect, useRef, useState} from 'react';
import {Button, ButtonGroup, Card, FormGroup, H6, NumericInput, Spinner} from "@blueprintjs/core";
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import Popup from "./Components/Popup";
import './App.css';
import Clock from "./Components/Clock";
import {Graph} from "react-d3-graph";

export default function () {
    const server = process.env.REACT_APP_SERVER_URL;
    const [vertices, setVertices] = useState<number>(2);
    const [probability, setProbability] = useState<number>(0.5);
    const [data, setData] = useState<{ graph: {} }>({graph: {}});
    const [coverVertices, setCoverVertices] = useState<number[]>([]);
    const [coverK, setCoverK] = useState<number>(-1);
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [query, setQuery] = React.useState<PromiseWithCancel<any> | undefined>();
    const {width, height} = useWindowDimensions();
    const graphBoundingRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph<any, any>>(null);

    useEffect(() => {
        centerNodes();
    }, [width, height]);

    useEffect(() => {
        setData({graph: {"0": [1], "1": [0]}});
    }, []);

    useEffect(() => {
        if (coverVertices.length > 0) {
            setCoverVertices([]);
        }
    }, [coverDepth]);

    interface PromiseWithCancel<T> extends Promise<T> {
        cancel: () => void;
        dateTime: Date;
        name: string
    }

    function doFetch(url: string, method: string, body: string, resolve?: (res: any) => void, name?: string) {
        if (!query) {
            const controller = new AbortController();
            const signal = controller.signal;
            const promise = new Promise(async () => {
                try {
                    const response = await fetch(url, {
                        method: method,
                        body: body,
                        signal
                    });
                    const data = await response.json();
                    setQuery(undefined);
                    if (resolve)
                        resolve(data);
                } catch (ex: any) {
                    if (ex && ex.name === "AbortError") {
                        setQuery(undefined);
                    }
                }
            });
            (promise as PromiseWithCancel<any>).cancel = () => controller.abort();
            (promise as PromiseWithCancel<any>).dateTime = new Date();
            if (name)
                (promise as PromiseWithCancel<any>).name = name;
            setQuery((promise as PromiseWithCancel<any>));
        }
    }
    // }

    const generateGraph = () => {
        doFetch(server + '/generate', "POST", JSON.stringify({
            "vertices": vertices,
            "probability": probability
        }), res => {
            setCoverVertices([]);
            setData(res);
        }, "generate graph");

    }

    const getVertexCover = () => {
        doFetch(server + '/vertex-cover', "POST", JSON.stringify({
            graph: data.graph,
            depth: coverDepth,
            k: coverK
        }), res => setCoverVertices(res.vertices), "Vertex cover search");
    }

    const putGraphResponse = (url: string) => {
        doFetch(server + url, "PUT", JSON.stringify(data), res => {
            setCoverVertices([]);
            setData(res);
        }, url.substring(1).replace("-", " "));
    }

    const onClickNode = function (nodeId: string) {
        let c = Object.assign([], coverVertices);
        if (c.indexOf(+nodeId, 0) > -1)
            c.splice(coverVertices.indexOf(+nodeId, 0), 1);
        else
            c.push(+nodeId);
        setCoverVertices(c);
    };

    function centerNodes() {
        if (graphRef.current != null && graphRef.current.state.nodes[0] !== undefined && graphBoundingRef.current != null) {
            let nodeCount = Object.keys(graphRef.current.state.nodes).length;
            let sumX = 0;
            let sumY = 0;
            let boundingBox = graphBoundingRef.current.getBoundingClientRect();
            Object.keys(graphRef.current.state.nodes).forEach(node => {
                if (graphRef.current != null) {
                    sumX += graphRef.current.state.nodes[node].x;
                    sumY += graphRef.current.state.nodes[node].y;
                }
            });
            Object.keys(graphRef.current.state.nodes).forEach((node: any) => {
                if (graphRef.current != null && graphBoundingRef.current != null) {
                    graphRef.current.state.nodes[node].x += ((boundingBox.width / 2)) - (sumX / nodeCount);
                    graphRef.current.state.nodes[node].y += ((boundingBox.height / 2)) - (sumY / nodeCount);
                }
            });
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "column", flex: "auto", overflow: "hidden"}}>
            <Popup open={query !== undefined} x={width / 2} y={20} transitionFade="0.5s" centerX
                   style={{transitionDelay: query ? "0.5s" : "0s"}}>
                <Card elevation={2}>
                    <p>
                        <Clock minus={query ? query.dateTime.getTime() : 0} divider={1000}/>
                        <p style={{display: "contents"}}>{query ? " seconds on task: " + query.name : ""}</p>
                    </p>
                    <Button intent="danger" onClick={() => query?.cancel()}>Cancel</Button>
                </Card>
            </Popup>
            <Card style={{display: "flex", flexDirection: "row", overflowY: "scroll"}}>
                <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
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
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "2em"
                }}>
                    <H6>Connection</H6>
                    <FormGroup>
                        <Button
                            title="Connect two random disconnected vertices"
                            onClick={() => putGraphResponse('/connect-random')}
                        >Random vertices</Button>
                    </FormGroup>
                    <FormGroup>
                        <Button
                            title="Connect two random disconnected sub graphs"
                            onClick={() => putGraphResponse('/connect-sub')}
                        >Two sub graphs</Button>
                    </FormGroup>
                    <FormGroup>
                        <Button
                            title="Connect all sub graphs"
                            onClick={() => putGraphResponse('/connect-all-sub')}
                        >All sub graphs</Button>
                    </FormGroup>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "2em"
                }}>
                    <H6>Vertex Cover</H6>
                    <FormGroup
                        style={{display: "flex", flexDirection: "column"}}
                        label="Number of vertices"
                        labelFor="coverK"
                        labelInfo="(size k)"
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
                        label="Vertex reach"
                        labelFor="depth"
                    >
                        <NumericInput
                            min={1}
                            id="depth"
                            title="Amount of edges a single vortex can reach"
                            value={coverDepth}
                            onValueChange={setCoverDepth}
                        />
                    </FormGroup>
                    <ButtonGroup>
                        <Button
                            onClick={getVertexCover}
                        >Brute force search</Button>
                    </ButtonGroup>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: "2em"
                }}>
                    <H6>Pendants and Tops</H6>
                    <FormGroup
                        style={{display: "flex", flexDirection: "row", alignItems: "center"}}
                        label="Pendants"
                    >
                        <ButtonGroup style={{marginLeft: "1em"}}>
                            <Button
                                onClick={() => putGraphResponse('/decrease-pendants')}
                            >-</Button>
                            <Button
                                onClick={() => putGraphResponse('/increase-pendants')}
                            >+</Button>
                        </ButtonGroup>
                    </FormGroup>
                    <FormGroup
                        style={{display: "flex", flexDirection: "row", alignItems: "center"}}
                        label="Tops"
                    >
                        <ButtonGroup style={{marginLeft: "1em"}}>
                            <Button
                                onClick={() => putGraphResponse('/decrease-tops')}
                            >-</Button>
                            <Button
                                onClick={() => putGraphResponse('/increase-tops')}
                            >+</Button>
                        </ButtonGroup>
                    </FormGroup>
                </div>
            </Card>

            <div className="container__graph-area" ref={graphBoundingRef}>
                <Graph
                    id="graph-id"
                    ref={graphRef}
                    data={convertToD3Graph(data.graph, coverDepth !== undefined ? coverDepth : 1, coverVertices)}
                    onClickNode={onClickNode}
                    config={{
                        staticGraph: false,
                        height: graphBoundingRef.current != null ? graphBoundingRef.current.offsetHeight : 0,
                        width: graphBoundingRef.current != null ? graphBoundingRef.current.offsetWidth : 0,
                        minZoom: 1,
                        maxZoom: 8
                    }}
                />
                <div style={{
                    position: "absolute",
                    pointerEvents: "none",
                    opacity: query ? 1 : 0,
                    transition: query ? "opacity 0.1s" : "opacity 0.3s",
                    transitionDelay: query ? "0.05s" : "0.2s"
                }}>
                    <Spinner/>
                </div>
            </div>
        </div>
    );
}
