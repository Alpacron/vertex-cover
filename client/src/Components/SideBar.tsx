import Popup from "./Popup";
import {Button, ButtonGroup, Card, Collapse, FormGroup, H6, NumericInput, Spinner} from "@blueprintjs/core";
import Clock from "./Clock";
import React, {Dispatch, RefObject, SetStateAction, useEffect, useState} from "react";
import useWindowDimensions from "../Util/useWindowDimensions";

export default function (props: {
    data: {}, setData: Dispatch<SetStateAction<{}>>,
    cover: {depth: number, vertices: number[]}, setCover: Dispatch<SetStateAction<{ depth: number; vertices: number[]; }>>,
    kernel: { isolated: number[], pendant: number[], tops: number[] }, setKernel: Dispatch<SetStateAction<{ isolated: number[]; pendant: number[]; tops: number[]; }>>,
    graphElement: JSX.Element, graphBoundingRef: RefObject<HTMLDivElement>
}) {
    const server = process.env.REACT_APP_SERVER_URL;
    const {width} = useWindowDimensions();
    const [query, setQuery] = useState<PromiseWithCancel<any> | undefined>();
    const [vertexCoverTime, setVertexCoverTime] = useState<number>(0);
    const [vertexCoverTimeKernelized, setVertexCoverTimeKernelized] = useState<number>(0)
    const [generateOpen, setGenerateOpen] = useState(true);
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [vertexCoverOpen, setVertexCoverOpen] = useState(false);
    const [kernelizationOpen, setKernelizationOpen] = useState(false);
    const [coverK, setCoverK] = useState<number>(-1);
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [vertexDegree, setVertexDegree] = useState<number>(1);
    const [vertices, setVertices] = useState<number>(2);
    const [probability, setProbability] = useState<number>(0.5);

    useEffect(() => {
        props.setData({"0": [1], "1": [0]});
    }, []);

    useEffect(() => {
        props.setKernel({isolated: [], pendant: [], tops: []});
        props.setCover({depth: coverDepth, vertices: []});
    }, [coverK, coverDepth, vertexDegree])

    interface PromiseWithCancel<T> extends Promise<T> {
        cancel: () => void;
        dateTime: Date;
        name: string
    }

    function doFetch(path: string, method: string, body: any, resolve?: (res: any) => void, name?: string) {
        if (!query) {
            props.setKernel({isolated: [], pendant: [], tops: []});
            props.setCover({depth: coverDepth, vertices: []});
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
                        resolve({data: data, query: (promise as PromiseWithCancel<any>)});
                } catch (ex: any) {
                    setQuery(undefined);
                }
            });
            (promise as PromiseWithCancel<any>).cancel = () => controller.abort();
            (promise as PromiseWithCancel<any>).dateTime = new Date();
            if (name)
                (promise as PromiseWithCancel<any>).name = name;
            setQuery((promise as PromiseWithCancel<any>));
            return (promise as PromiseWithCancel<any>);
        }
    }

    const generateGraph = () => {
        doFetch('/generate', "POST", {
            "vertices": vertices,
            "probability": probability
        }, res => {
            props.setData(res.data);
        }, "generate graph");
    }

    const getVertexCover = () => {
        doFetch('/vertex-cover', "POST", {
            graph: props.data,
            depth: coverDepth,
            k: coverK
        }, res => {
            props.setCover({depth: coverDepth, vertices: res.data})
            setVertexCoverTime((new Date().getTime() - res.query.dateTime.getTime()) / 1000);
        }, "vertex cover search");
    }

    const getKernelizedBruteForce = () => {
        alert("Has not been implemented yet.")
        // doFetch('/vertex-cover-kernelized', "POST", {
        //     graph: props.data,
        //     depth: coverDepth,
        //     k: coverK
        // }, res => {
        //     props.setCover({depth: coverDepth, vertices: res.data})
        //     setVertexCoverTimeKernelized((new Date().getTime() - res.query.dateTime.getTime()) / 1000);
        // }, "vertex cover search kernelized");
    }

    const getKernelization = (graph?: {}) => {
        doFetch('/kernelization', "POST", {
            graph: graph != undefined ? graph : props.data,
            k: vertexDegree
        }, res => {
            props.setKernel(res.data);
        }, "kernelization");
    }

    const putGraphResponse = (path: string) => {
        doFetch(path, "PUT", {
            graph: props.data,
            k: vertexDegree
        }, res => {
            props.setData(res.data);
        }, path.substring(1).replace("-", " "));
    }

    return (
        <>
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
            <Card style={{display: "flex", flexDirection: "column", overflowY: "scroll", maxWidth: "300px", width: "300px", minWidth: "264px"}}>
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
                        <H6 style={{color: "#137CBD"}}>Brute force vertex cover</H6>
                        <ButtonGroup>
                            <Button
                                onClick={getVertexCover}
                            >Brute force search</Button>
                        </ButtonGroup>
                        <p style={{marginTop: "10px"}}>{vertexCoverTime > 0 && props.cover.vertices.length > 0? "Vertex cover took: " + vertexCoverTime + " seconds" : "Brute force has not been run yet."}</p>
                        <H6 style={{color: "#137CBD"}}>Brute force vertex cover with kernelization</H6>
                        <ButtonGroup>
                            <Button
                                onClick={getKernelizedBruteForce}
                            >Brute force search with kernelization</Button>
                        </ButtonGroup>
                        <p style={{marginTop: "10px"}}>{vertexCoverTimeKernelized > 0 && props.cover.vertices.length > 0? "Vertex cover took: " + vertexCoverTimeKernelized + " seconds" : "Brute force with kernelization has not been run yet."}</p>
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
                                    onClick={() => putGraphResponse('/decrease-tops')}
                                >-</Button>
                                <Button
                                    onClick={() => putGraphResponse('/increase-tops')}
                                >+</Button>
                            </ButtonGroup>
                        </FormGroup>
                        <H6 style={{color: "#137CBD"}}>Kernelization</H6>
                        <ButtonGroup style={{marginBottom: "15px"}}>
                            <Button
                                onClick={() => getKernelization()}
                            >Perform kernelization</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
            </Card>
            <div className="container__graph-area" ref={props.graphBoundingRef}>
                {props.graphElement}
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
        </>
    )
}
