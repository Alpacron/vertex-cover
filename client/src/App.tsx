import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    ButtonGroup,
    Card, Collapse,
    FormGroup,
    H6,
    NumericInput,
    Spinner
} from "@blueprintjs/core";
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import Popup from "./Components/Popup";
import './App.css';
import Clock from "./Components/Clock";
import {Graph} from "react-d3-graph";
import {FocusStyleManager} from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();

export default function () {
    const server = process.env.REACT_APP_SERVER_URL;
    const graphBoundingRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph<any, any>>(null);
    const {width, height} = useWindowDimensions();
    const [query, setQuery] = React.useState<PromiseWithCancel<any> | undefined>();
    const [data, setData] = useState<{ graph: {} }>({graph: {}});
    const [coverVertices, setCoverVertices] = useState<number[]>([]);
    const [kernelVertices, setKernelVertices] = useState<{isolated: number[], pendant: number[], tops: number[]}>({isolated: [], pendant: [], tops: []});

    const [generateOpen, setGenerateOpen] = useState(true);
    const [vertices, setVertices] = useState<number>(2);
    const [probability, setProbability] = useState<number>(0.5);

    const [connectionOpen, setConnectionOpen] = useState(false);

    const [vertexCoverOpen, setVertexCoverOpen] = useState(false);
    const [coverK, setCoverK] = useState<number>(-1);
    const [coverDepth, setCoverDepth] = useState<number>(1);

    const [kernelizationOpen, setKernelizationOpen] = useState(false);
    const [vertexDegree, setVertexDegree] = useState<number>(1);

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

    function doFetch(path: string, method: string, body: any, resolve?: (res: any) => void, name?: string) {
        if (!query) {
            setCoverVertices([]);
            setKernelVertices({isolated: [], pendant: [], tops: []});
            const controller = new AbortController();
            const signal = controller.signal;
            const promise = new Promise(async () => {
                try {
                    const response = await fetch(server + path, {
                        method: method,
                        body: JSON.stringify(body),
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

    const generateGraph = () => {
        doFetch('/generate', "POST", {
            "vertices": vertices,
            "probability": probability
        }, res => {
            setData(res);
        }, "generate graph");
    }

    const getVertexCover = () => {
        doFetch('/vertex-cover', "POST", {
            graph: data.graph,
            depth: coverDepth,
            k: coverK
        }, setCoverVertices, "Vertex cover search");
    }

    const getKernelization = () => {
        doFetch('/kernelization', "POST", {
            graph: data.graph,
            k: vertexDegree
        }, setKernelVertices, "Kernelization");
    }

    const updateTops = (path: string) => {
        doFetch(path, "PUT", {
            graph: data.graph,
            k: vertexDegree
        }, setData, path.substring(1).replace("-", " "));
    }

    const putGraphResponse = (path: string) => {
        doFetch(path, "PUT", data, setData, path.substring(1).replace("-", " "));
    }

    const onClickNode = function (nodeId: string) {
        if(kernelVertices.isolated.length == 0 && kernelVertices.pendant.length == 0 && kernelVertices.tops.length == 0) {
            let c = Object.assign([], coverVertices);
            if (c.indexOf(+nodeId, 0) > -1)
                c.splice(coverVertices.indexOf(+nodeId, 0), 1);
            else
                c.push(+nodeId);
            setCoverVertices(c);
        }
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
        <div style={{display: "flex", flexDirection: "row-reverse", flex: "auto", overflow: "hidden"}}>
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
            <Card style={{display: "flex", flexDirection: "column", overflowY: "scroll", minWidth: "264px"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <H6>Undirected graph
                        <Button minimal small icon={generateOpen ? "chevron-up" : "chevron-down"}
                                onClick={() => setGenerateOpen(!generateOpen)}/>
                    </H6>
                    <Collapse isOpen={generateOpen} keepChildrenMounted>
                        <FormGroup
                            label="Number of vertices"
                            labelFor="vertices"
                        >
                            <NumericInput
                                min={1}
                                width={5}
                                id="vertices"
                                value={vertices}
                                onValueChange={setVertices}
                            />
                        </FormGroup>
                        <FormGroup
                            label="Density of edges"
                            labelFor="probability"
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
                        <ButtonGroup style={{marginRight: "1em", marginBottom: "15px"}}>
                            <Button
                                onClick={generateGraph}
                            >Generate graph</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <H6>Connection
                        <Button minimal small icon={connectionOpen ? "chevron-up" : "chevron-down"}
                                onClick={() => setConnectionOpen(!connectionOpen)}/>
                    </H6>
                    <Collapse isOpen={connectionOpen} keepChildrenMounted>
                        <FormGroup>
                            <Button
                                title="Connect two random disconnected vertices"
                                onClick={() => putGraphResponse('/connect-random')}
                            >Connect random vertices</Button>
                        </FormGroup>
                        <FormGroup>
                            <Button
                                title="Connect two random disconnected sub graphs"
                                onClick={() => putGraphResponse('/connect-sub')}
                            >Connect two sub graphs</Button>
                        </FormGroup>
                        <FormGroup style={{marginBottom: "15px"}}>
                            <Button
                                title="Connect all disconnected sub graphs"
                                onClick={() => putGraphResponse('/connect-all-sub')}
                            >Connect all sub graphs</Button>
                        </FormGroup>
                    </Collapse>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <H6>Vertex Cover
                        <Button minimal small icon={vertexCoverOpen ? "chevron-up" : "chevron-down"}
                                onClick={() => setVertexCoverOpen(!vertexCoverOpen)}/>
                    </H6>
                    <Collapse isOpen={vertexCoverOpen} keepChildrenMounted>
                        <FormGroup
                            style={{display: "flex", flexDirection: "column"}}
                            label="Number of vertices"
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
                        <ButtonGroup style={{marginBottom: "15px"}}>
                            <Button
                                onClick={getVertexCover}
                            >Brute force search</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <H6>Kernelization
                        <Button minimal small icon={kernelizationOpen ? "chevron-up" : "chevron-down"}
                                onClick={() => setKernelizationOpen(!kernelizationOpen)}/>
                    </H6>
                    <Collapse isOpen={kernelizationOpen} keepChildrenMounted>
                        <H6 style={{color: "#137CBD"}}>Pendants</H6>
                        <FormGroup
                            style={{display: "flex", flexDirection: "row", alignItems: "center"}}
                            label="Number of pendants"
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
                        <H6 style={{color: "#137CBD"}}>Tops</H6>
                        <FormGroup
                            label="Vertex degree"
                            labelFor="tops"
                            labelInfo="(k)"
                        >
                            <NumericInput
                                min={0}
                                id="tops"
                                value={vertexDegree}
                                onValueChange={setVertexDegree}
                            />
                        </FormGroup>
                        <FormGroup
                            style={{display: "flex", flexDirection: "row", alignItems: "center"}}
                            label="Number of tops"
                        >
                            <ButtonGroup style={{marginLeft: "1em"}}>
                                <Button
                                    onClick={() => updateTops('/decrease-tops')}
                                >-</Button>
                                <Button
                                    onClick={() => updateTops('/increase-tops')}
                                >+</Button>
                            </ButtonGroup>
                        </FormGroup>
                        <H6 style={{color: "#137CBD"}}>Kernelization</H6>
                        <ButtonGroup style={{marginBottom: "15px"}}>
                            <Button
                                onClick={getKernelization}
                            >Perform kernelization</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
            </Card>
            <div className="container__graph-area" ref={graphBoundingRef}>
                <Graph
                    id="graph-id"
                    ref={graphRef}
                    data={convertToD3Graph(data.graph, coverDepth !== undefined ? coverDepth : 1, coverVertices, kernelVertices)}
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
