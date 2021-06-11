import {Popup} from './Popup';
import {Button, ButtonGroup, Card, Collapse, FormGroup, H6, NumericInput} from '@blueprintjs/core';
import {Clock} from './Clock';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useWindowDimensions} from '../Util/useWindowDimensions';
import {PromiseWithCancel} from '../Interfaces/PromiseWithCancel';

export function SideBar(props: {
    data: Record<string, unknown>;
    setData: Dispatch<SetStateAction<Record<string, unknown>>>;
    cover: { depth: number; vertices: number[] };
    setCover: Dispatch<SetStateAction<{ depth: number; vertices: number[] }>>;
    kernel: { isolated: number[]; pendant: number[]; tops: number[] };
    setKernel: Dispatch<SetStateAction<{ isolated: number[]; pendant: number[]; tops: number[] }>>;
    setEdges: Dispatch<SetStateAction<number[][]>>;
    setTour: Dispatch<SetStateAction<number[]>>;
    coverDepth: number;
    setCoverDepth: Dispatch<SetStateAction<number>>;
    doFetch: (
        path: string,
        method: string,
        body: any,
        resolve?: ((res: any) => void) | undefined,
        name?: string | undefined
    ) => PromiseWithCancel<any> | undefined;
    query: PromiseWithCancel<any> | undefined;
    maxChildren: number;
    setMaxChildren: Dispatch<SetStateAction<number>>;
    isTree: boolean;
    setIsTree: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
    const {width} = useWindowDimensions();
    const [vertexCoverTime, setVertexCoverTime] = useState<number>(0);
    const [vertexCoverApproximationTime, setVertexCoverApproximationTime] = useState<number>(0);
    const [vertexCoverApproximationTreeTime, setVertexCoverApproximationTreeTime] = useState<number>(0);
    const [vertexCoverKernelizedTime, setVertexCoverKernelizedTime] = useState<number>(0);
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [vertexCoverOpen, setVertexCoverOpen] = useState(false);
    const [kernelizationOpen, setKernelizationOpen] = useState(false);
    const [travelingOpen, setTravelingOpen] = useState(false);
    const [coverK, setCoverK] = useState<number>(-1);
    const [vertexDegree, setVertexDegree] = useState<number>(1);
    const [vertices, setVertices] = useState<number>(10);
    const [weightedVertices, setWeightedVertices] = useState<number>(5);
    const [nodes, setNodes] = useState<number>(3);
    const [probability, setProbability] = useState<number>(0.5);
    const [graphType, setGraphType] = useState<"normal" | "tree" | "weighted">("normal");
    const [graph, setGraph] = useState<any>({});
    const [treeGraph, setTreeGraph] = useState<any>({});
    const [weightedGraph, setWeightedGraph] = useState<any>({});

    const setData = props.setData;
    const setKernel = props.setKernel;
    const setCover = props.setCover;
    const setEdges = props.setEdges;
    const setTour = props.setTour;

    useEffect(() => {
        setData({'0': [1], '1': [0]});
        setGraph({'0': [1], '1': [0]});
    }, [setData]);

    useEffect(() => {
        setKernel({isolated: [], pendant: [], tops: []});
        setCover({depth: props.coverDepth, vertices: []});
        setEdges([]);
        setTour([]);
    }, [props.coverDepth, setCover, setKernel, setEdges, setTour, graph, treeGraph, weightedGraph]);

    const generateGraph = () => {
        props.doFetch(
            '/generate',
            'POST',
            {
                vertices: vertices,
                probability: probability
            },
            (res) => {
                setGraph(res.data);
                props.setData(res.data);
            },
            'Generate graph'
        );
        props.setIsTree(false);
    };

    const generateTree = () => {
        props.doFetch(
            '/generate-tree',
            'POST',
            {
                nodes: nodes,
                max_children: props.maxChildren
            },
            (res) => {
                setTreeGraph(res.data);
                props.setData(res.data);
            }
        );
        props.setIsTree(true);
    };

    const generateWeighted = () => {
        props.doFetch(
            '/generate-weighted',
            'POST',
            {
                vertices: weightedVertices,
                probability: 1
            },
            (res) => {
                setWeightedGraph(res.data);
                props.setData(res.data);
            },
            'Generate weighted graph'
        );
        props.setIsTree(false);
    };

    const getVertexCover = (path: string, name: string) => {
        props.doFetch(
            path,
            'POST',
            {
                graph: props.data,
                depth: props.coverDepth,
                k: coverK
            },
            (res) => {
                props.setCover({depth: props.coverDepth, vertices: res.data});
                const time = (new Date().getTime() - res.query.dateTime.getTime()) / 1000;
                if (path.includes('kernelized')) {
                    setVertexCoverKernelizedTime(time);
                } else if (path.includes('approximation')) {
                    setVertexCoverApproximationTime(time);
                } else if (path.includes('tree')) {
                    setVertexCoverApproximationTreeTime(time);
                } else {
                    setVertexCoverTime(time);
                }
            },
            name
        );
    };

    const getKernelization = (graph?: Record<string, unknown>) => {
        props.doFetch(
            '/kernelization',
            'POST',
            {
                graph: graph != undefined ? graph : props.data,
                k: vertexDegree
            },
            (res) => {
                props.setKernel(res.data);
            },
            'kernelization'
        );
    };

    const getMinimumSpanningTree = (graph?: Record<string, unknown>) => {
        props.doFetch(
            '/minimum-spanning-tree',
            'POST',
            {
                graph: graph != undefined ? graph : props.data
            },
            (res) => {
                props.setEdges(res.data);
            },
            'Minimum Spanning Tree'
        );
    };

    const getEulerianMultigraph = (graph?: Record<string, unknown>) => {
        props.doFetch(
            '/eulerian-multigraph',
            'POST',
            {
                graph: graph != undefined ? graph : props.data
            },
            (res) => {
                props.setEdges(res.data);
            },
            'Eulerian multigraph'
        );
    };

    const getChristofides = (graph?: Record<string, unknown>) => {
        props.doFetch(
            '/christofides-algorithm',
            'POST',
            {
                graph: graph != undefined ? graph : props.data
            },
            (res) => {
                props.setTour(res.data);
            },
            'Eulerian multigraph'
        );
    };

    const putGraphResponse = (path: string) => {
        props.doFetch(
            path,
            'PUT',
            {
                graph: props.data,
                k: vertexDegree
            },
            (res) => {
                props.setData(res.data);
            },
            path.substring(1).replace('-', ' ')
        );
    };

    return (
        <>
            <Popup
                open={props.query !== undefined}
                x={width / 2}
                y={20}
                transitionFade="0.5s"
                centerX
                style={{transitionDelay: props.query ? '0.5s' : '0s'}}
            >
                <Card elevation={2}>
                    <p>
                        <Clock minus={props.query ? props.query.dateTime.getTime() : 0} divider={1000}/>
                        <p style={{display: 'contents'}}>
                            {props.query ? ' seconds on task: ' + props.query.name : ''}
                        </p>
                    </p>
                    <Button intent="danger" onClick={() => props.query?.cancel()}>
                        Cancel
                    </Button>
                </Card>
            </Popup>
            <Card
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                    maxWidth: '300px',
                    width: '300px',
                    minWidth: '264px'
                }}
            >
                <ButtonGroup fill style={{marginBottom: '15px'}}>
                    <Button onClick={() => {
                        setGraphType("normal");
                        setKernel({
                            isolated: [],
                            pendant: [],
                            tops: []
                        });
                        setEdges([]);
                        setTour([]);
                        setCover({depth: 1, vertices: []});
                        setData(graph)
                    }}>Normal</Button>
                    <Button onClick={() => {
                        setGraphType("tree");
                        setKernel({
                            isolated: [],
                            pendant: [],
                            tops: []
                        });
                        setEdges([]);
                        setTour([]);
                        setCover({depth: 1, vertices: []});
                        setData(treeGraph);
                        if (Object.keys(treeGraph).length === 0) {
                            generateTree()
                        }
                    }}>Tree</Button>
                    <Button onClick={() => {
                        setGraphType("weighted");
                        setKernel({
                            isolated: [],
                            pendant: [],
                            tops: []
                        });
                        setEdges([]);
                        setTour([]);
                        setCover({depth: 1, vertices: []});
                        setData(weightedGraph);
                        if (Object.keys(weightedGraph).length === 0) {
                            generateWeighted()
                        }
                    }}>Weighted</Button>
                </ButtonGroup>
                <div style={{display: graphType != "tree" ? 'flex' : 'none', flexDirection: 'column'}}>
                    <FormGroup label="Number of vertices" labelFor="vertices">
                        <NumericInput
                            min={1}
                            width={5}
                            id="vertices"
                            value={graphType == "normal"? vertices : weightedVertices}
                            onValueChange={n => graphType == "normal"? setVertices(n) : setWeightedVertices(n)}
                        />
                    </FormGroup>
                    <FormGroup label="Density of edges" labelFor="probability" style={{display: graphType != "normal"? 'none' : ''}}>
                        <NumericInput
                            min={0}
                            max={1}
                            stepSize={0.1}
                            id="probability"
                            value={probability}
                            onValueChange={setProbability}
                        />
                    </FormGroup>
                    <ButtonGroup style={{marginRight: '1em', marginBottom: '15px'}}>
                        <Button
                            onClick={() => graphType == "normal" ? generateGraph() : generateWeighted()}>Generate {graphType == "weighted" ? "weighted " : ""}graph</Button>
                    </ButtonGroup>
                </div>
                <div style={{display: graphType == "tree" ? 'flex' : 'none', flexDirection: 'column'}}>
                    <FormGroup label="Number of nodes" labelFor="nodes">
                        <NumericInput min={1} width={5} id="nodes" value={nodes} onValueChange={setNodes}/>
                    </FormGroup>
                    <FormGroup label="Number of children (maximum)" labelFor="maxChildren">
                        <NumericInput
                            min={1}
                            width={5}
                            id="maxChildren"
                            value={props.maxChildren}
                            onValueChange={props.setMaxChildren}
                        />
                    </FormGroup>
                    <ButtonGroup style={{marginRight: '1em', marginBottom: '15px'}}>
                        <Button onClick={generateTree}>Generate tree</Button>
                    </ButtonGroup>
                    <H6 style={{color: '#137CBD'}}>Approximation vertex cover for a tree</H6>
                    <ButtonGroup>
                        <Button
                            onClick={() => {
                                getVertexCover('/tree-cover', 'Approximation vertex cover for a tree');
                            }}
                        >
                            Approximation vertex cover for a tree
                        </Button>
                    </ButtonGroup>
                    <p style={{marginTop: '10px'}}>
                        {vertexCoverApproximationTreeTime > 0
                            ? 'Approximation of vertex cover for a tree took: ' +
                            vertexCoverApproximationTreeTime +
                            ' seconds'
                            : 'Approximation has not been run yet.'}
                    </p>
                </div>
                <div
                    style={{
                        display: graphType == "normal" ? 'flex' : 'none',
                        flexDirection: 'column'
                    }}
                >
                    <H6>
                        Connection
                        <Button
                            minimal
                            small
                            icon={connectionOpen ? 'chevron-up' : 'chevron-down'}
                            onClick={() => setConnectionOpen(!connectionOpen)}
                        />
                    </H6>
                    <Collapse isOpen={connectionOpen} keepChildrenMounted>
                        <FormGroup>
                            <Button
                                title="Connect two random disconnected vertices"
                                onClick={() => putGraphResponse('/connect-random')}
                            >
                                Connect random vertices
                            </Button>
                        </FormGroup>
                        <FormGroup>
                            <Button
                                title="Connect two random disconnected sub graphs"
                                onClick={() => putGraphResponse('/connect-sub')}
                            >
                                Connect two sub graphs
                            </Button>
                        </FormGroup>
                        <FormGroup style={{marginBottom: '15px'}}>
                            <Button
                                title="Connect all disconnected sub graphs"
                                onClick={() => putGraphResponse('/connect-all-sub')}
                            >
                                Connect all sub graphs
                            </Button>
                        </FormGroup>
                    </Collapse>
                </div>
                <div
                    style={{
                        display: graphType == "normal"? 'flex' : 'none',
                        flexDirection: 'column'
                    }}
                >
                    <H6>
                        Vertex Cover
                        <Button
                            minimal
                            small
                            icon={vertexCoverOpen ? 'chevron-up' : 'chevron-down'}
                            onClick={() => setVertexCoverOpen(!vertexCoverOpen)}
                        />
                    </H6>
                    <Collapse isOpen={vertexCoverOpen} keepChildrenMounted>
                        <FormGroup
                            style={{display: 'flex', flexDirection: 'column'}}
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
                            style={{display: 'flex', flexDirection: 'column'}}
                            label="Vertex reach"
                            labelFor="depth"
                        >
                            <NumericInput
                                min={1}
                                id="depth"
                                title="Amount of edges a single vortex can reach"
                                value={props.coverDepth}
                                onValueChange={props.setCoverDepth}
                            />
                        </FormGroup>
                        <H6 style={{color: '#137CBD'}}>Brute force vertex cover</H6>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    getVertexCover('/vertex-cover', 'Brute force vertex cover');
                                }}
                            >
                                Brute force search
                            </Button>
                        </ButtonGroup>
                        <p style={{marginTop: '10px'}}>
                            {vertexCoverTime > 0
                                ? 'Vertex cover took: ' + vertexCoverTime + ' seconds'
                                : 'Brute force has not been run yet.'}
                        </p>
                        <H6 style={{color: '#137CBD'}}>Brute force vertex cover with kernelization</H6>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    getVertexCover(
                                        '/vertex-cover-kernelized',
                                        'Brute force vertex cover with kernelization'
                                    );
                                }}
                            >
                                Brute force search with kernelization
                            </Button>
                        </ButtonGroup>
                        <p style={{marginTop: '10px'}}>
                            {vertexCoverKernelizedTime > 0
                                ? 'Vertex cover took: ' + vertexCoverKernelizedTime + ' seconds'
                                : 'Brute force with kernelization has not been run yet.'}
                        </p>
                        <H6 style={{color: '#137CBD'}}>Approximation vertex cover</H6>
                        <ButtonGroup>
                            <Button
                                onClick={() => {
                                    getVertexCover('/vertex-cover-approximation', 'Approximation vertex cover');
                                }}
                            >
                                Approximation vertex cover
                            </Button>
                        </ButtonGroup>
                        <p style={{marginTop: '10px'}}>
                            {vertexCoverApproximationTime > 0
                                ? 'Approximation of vertex cover took: ' + vertexCoverApproximationTime + ' seconds'
                                : 'Approximation has not been run yet.'}
                        </p>
                    </Collapse>
                </div>
                <div
                    style={{
                        display: graphType != "weighted" ? 'flex' : 'none',
                        flexDirection: 'column'
                    }}
                >
                    <H6>
                        Kernelization
                        <Button
                            minimal
                            small
                            icon={kernelizationOpen ? 'chevron-up' : 'chevron-down'}
                            onClick={() => setKernelizationOpen(!kernelizationOpen)}
                        />
                    </H6>
                    <Collapse isOpen={kernelizationOpen} keepChildrenMounted>
                        <H6 style={{color: '#137CBD'}}>Isolated vertices</H6>
                        <FormGroup
                            style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
                            label="Number of isolated vertices"
                        >
                            <ButtonGroup style={{marginLeft: '1em'}}>
                                <Button onClick={() => putGraphResponse('/decrease-isolated')}>-</Button>
                                <Button onClick={() => putGraphResponse('/increase-isolated')}>+</Button>
                            </ButtonGroup>
                        </FormGroup>
                        <H6 style={{color: '#137CBD'}}>Pendants</H6>
                        <FormGroup
                            style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
                            label="Number of pendants"
                        >
                            <ButtonGroup style={{marginLeft: '1em'}}>
                                <Button onClick={() => putGraphResponse('/decrease-pendants')}>-</Button>
                                <Button onClick={() => putGraphResponse('/increase-pendants')}>+</Button>
                            </ButtonGroup>
                        </FormGroup>
                        <H6 style={{color: '#137CBD'}}>Tops</H6>
                        <FormGroup label="Vertex degree" labelFor="tops" labelInfo="(k)">
                            <NumericInput min={0} id="tops" value={vertexDegree} onValueChange={setVertexDegree}/>
                        </FormGroup>
                        <FormGroup
                            style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}
                            label="Number of tops"
                        >
                            <ButtonGroup style={{marginLeft: '1em'}}>
                                <Button onClick={() => putGraphResponse('/decrease-tops')}>-</Button>
                                <Button onClick={() => putGraphResponse('/increase-tops')}>+</Button>
                            </ButtonGroup>
                        </FormGroup>
                        <H6 style={{color: '#137CBD'}}>Kernelization</H6>
                        <ButtonGroup style={{marginBottom: '15px'}}>
                            <Button onClick={() => getKernelization()}>Perform kernelization</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
                <div
                    style={{
                        display: graphType == "weighted" ? 'flex' : 'none',
                        flexDirection: 'column'
                    }}
                >
                    <H6>
                        Traveling salesman problem
                        <Button
                            minimal
                            small
                            icon={travelingOpen ? 'chevron-up' : 'chevron-down'}
                            onClick={() => setTravelingOpen(!travelingOpen)}
                        />
                    </H6>
                    <Collapse isOpen={travelingOpen} keepChildrenMounted>
                        <ButtonGroup style={{marginBottom: '15px'}}>
                            <Button onClick={() => getMinimumSpanningTree()}>Minimum spanning tree</Button>
                        </ButtonGroup>
                        <ButtonGroup style={{marginBottom: '15px'}}>
                            <Button onClick={() => getEulerianMultigraph()}>Eulerian multigraph</Button>
                        </ButtonGroup>
                        <ButtonGroup style={{marginBottom: '15px'}}>
                            <Button onClick={() => getChristofides()}>Christofides Algorithm</Button>
                        </ButtonGroup>
                    </Collapse>
                </div>
            </Card>
        </>
    );
}
