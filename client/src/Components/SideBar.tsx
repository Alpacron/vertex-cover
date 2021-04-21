import Popup from "./Popup";
import {Button, ButtonGroup, Card, Collapse, FormGroup, H6, NumericInput, Spinner} from "@blueprintjs/core";
import Clock from "./Clock";
import React, {Dispatch, RefObject, SetStateAction, useEffect, useRef, useState} from "react";
import useWindowDimensions from "../Util/useWindowDimensions";

function getCaretPosition(element: HTMLPreElement) {
    let caretOffset = 0;
    let doc = element.ownerDocument;
    let win = doc.defaultView;
    let sel;
    if (win != null && typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel != null && sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    }
    return caretOffset;
}

function setCaretPosition(element: any, caretOffset: number) {
    let count = 0;

    for (let n = 0; n < element.childNodes.length; n++) {
        let len = 0;
        if (element.childNodes[n].innerText != undefined)
            len = element.childNodes[n].innerText.length;
        else
            len = element.childNodes[n].length;
        if (count + len >= caretOffset) {
            let range = document.createRange();
            let sel = window.getSelection();
            if (element.childNodes[n].innerText != undefined)
                range.setStart(element.childNodes[n].childNodes[0], caretOffset - count);
            else
                range.setStart(element.childNodes[n], caretOffset - count);
            range.collapse(true);
            if (sel != null) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
            element.focus();
            break;
        }
        count += len;
    }
}

function prettifyJson(json: any) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, function (k, v) {
            if (v instanceof Array)
                return JSON.stringify(v);
            return v;
        }, 4).replaceAll("\"[", "[").replaceAll("]\"", "]");
    }
    if (json != undefined) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let reg = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|(((?!("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?))(.|\n))+)/g;
        json = json.replace(reg, function (match: any) {
            let cls = '';if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = ' class="key"';
                    match = match.replace(":", "")
                } else {
                    cls = ' class="string"';
                }
            } else if (/true|false/.test(match)) {
                cls = ' class="boolean"';
            } else if (/null/.test(match)) {
                cls = ' class="null"';
            } else if (/^\d+(\.\d*)?$/.test(match)) {
                cls = ' class="number"'
            }
            let s = '<span' + cls + '>' + match + '</span>';
            if(cls.includes("key"))
                s += ":"
            return s;
        });
        return json;
    }
    return ""
}

export default function (props: {
    data: {}, setData: Dispatch<SetStateAction<{}>>,
    cover: { depth: number, vertices: number[] }, setCover: Dispatch<SetStateAction<{ depth: number; vertices: number[]; }>>,
    kernel: { isolated: number[], pendant: number[], tops: number[] }, setKernel: Dispatch<SetStateAction<{ isolated: number[]; pendant: number[]; tops: number[]; }>>,
    graphElement: JSX.Element, graphBoundingRef: RefObject<HTMLDivElement>
}) {
    const server = process.env.REACT_APP_SERVER_URL;
    const {width} = useWindowDimensions();
    const [query, setQuery] = useState<PromiseWithCancel<any> | undefined>();
    const [vertexCoverTime, setVertexCoverTime] = useState<number>(0);
    const [vertexCoverKernelizedTime, setVertexCoverKernelizedTime] = useState<number>(0);
    const [generateOpen, setGenerateOpen] = useState(true);
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [vertexCoverOpen, setVertexCoverOpen] = useState(false);
    const [kernelizationOpen, setKernelizationOpen] = useState(false);
    const [coverK, setCoverK] = useState<number>(-1);
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [vertexDegree, setVertexDegree] = useState<number>(1);
    const [vertices, setVertices] = useState<number>(2);
    const [probability, setProbability] = useState<number>(0.5);
    const graphDiv = useRef<HTMLPreElement>(null);

    useEffect(() => {
        props.setData({"0": [1], "1": [0]});
    }, []);

    useEffect(() => {
        setGraphText(props.data);
    }, [props.data]);


    const setGraphText = (json: {} | string) => {
        if (graphDiv.current != null) {
            graphDiv.current.innerHTML = prettifyJson(json);
        }
    }

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

    const getVertexCover = (path: string) => {
        doFetch(path, "POST", {
            graph: props.data,
            depth: coverDepth,
            k: coverK
        }, res => {
            props.setCover({depth: coverDepth, vertices: res.data})
            if (path.includes("kernelized")) {
                setVertexCoverKernelizedTime((new Date().getTime() - res.query.dateTime.getTime()) / 1000)
            } else {
                setVertexCoverTime((new Date().getTime() - res.query.dateTime.getTime()) / 1000);
            }
        }, "vertex cover search");
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
            <Card style={{
                display: "flex",
                flexDirection: "column",
                overflowY: "scroll",
                maxWidth: "300px",
                width: "300px",
                minWidth: "264px"
            }}>
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
                                onClick={() => {
                                    getVertexCover('/vertex-cover')
                                }}
                            >Brute force search</Button>
                        </ButtonGroup>
                        <p style={{marginTop: "10px"}}>{vertexCoverTime > 0 ? "Vertex cover took: " + vertexCoverTime + " seconds" : "Brute force has not been run yet."}</p>
                        <H6 style={{color: "#137CBD"}}>Brute force vertex cover with kernelization</H6>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    getVertexCover('/vertex-cover-kernelized')
                                }}
                            >Brute force search with kernelization</Button>
                        </ButtonGroup>
                        <p style={{marginTop: "10px"}}>{vertexCoverKernelizedTime > 0 ? "Vertex cover took: " + vertexCoverKernelizedTime + " seconds" : "Brute force with kernelization has not been run yet."}</p>
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
            <div style={{overflow: "hidden", margin: "1em", display: "flex", flex: "auto", flexDirection: "column"}}>
                <div style={{
                    position: "absolute",
                    pointerEvents: "none",
                    opacity: query ? 1 : 0,
                    transition: query ? "opacity 0.1s" : "opacity 0.3s",
                    transitionDelay: query ? "0.05s" : "0.2s"
                }}>
                    <Spinner/>
                </div>
                <div className="container__graph-area" ref={props.graphBoundingRef}>
                    {props.graphElement}
                </div>
                <Card style={{maxHeight: "25%", margin: "1px", marginTop: "1em", padding: 0}}>
                    <pre style={{maxHeight: "100%", overflowY: "auto", whiteSpace: "pre-wrap", margin: 0, padding: "1em"}} ref={graphDiv} contentEditable onKeyDown={e => {
                        if (e.key === "Enter") {
                            document.execCommand('insertHTML', false, '\n');
                            e.preventDefault()
                        }
                    }} onInput={() => {
                        if (graphDiv.current != null) {
                            let pos = getCaretPosition(graphDiv.current);
                            setGraphText(graphDiv.current.innerText);
                            setCaretPosition(graphDiv.current, pos);
                        }
                    }}/>
                </Card>
            </div>
        </>
    )
}
