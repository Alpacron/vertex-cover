import React, {useEffect, useRef, useState} from 'react';
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import './App.css';
import {Graph} from "react-d3-graph";
import {FocusStyleManager, Spinner} from "@blueprintjs/core";
import SideBar from "./Components/SideBar";
import CodeViewer from "./Components/CodeViewer";
import {PromiseWithCancel} from "./Interfaces/PromiseWithCancel";

FocusStyleManager.onlyShowFocusOnTabs();

export default function () {
    const graphBoundingRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph<any, any>>(null);
    const {width, height} = useWindowDimensions();
    const [graph, setGraph] = useState<any>({});
    const [cover, setCover] = useState<{ depth: number, vertices: number[] }>({depth: 1, vertices: []});
    const [kernel, setKernel] = useState<{ isolated: number[], pendant: number[], tops: number[] }>({
        isolated: [],
        pendant: [],
        tops: []
    });
    const server = process.env.REACT_APP_SERVER_URL;
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [query, setQuery] = useState<PromiseWithCancel<any> | undefined>();


    function doFetch(path: string, method: string, body: any, resolve?: (res: any) => void, name?: string) {
        if (!query) {
            setKernel({isolated: [], pendant: [], tops: []});
            setCover({depth: coverDepth, vertices: []});
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

    useEffect(() => {
        centerNodes();
    }, [width, height]);

    useEffect(() => {
        setGraph({"0": [1], "1": [0]});
    }, []);

    const onClickNode = function (nodeId: string) {
        if (kernel.isolated.length == 0 && kernel.pendant.length == 0 && kernel.tops.length == 0) {
            let c = Object.assign([], cover.vertices);
            if (c.indexOf(+nodeId, 0) > -1)
                c.splice(cover.vertices.indexOf(+nodeId, 0), 1);
            else
                c.push(+nodeId);
            setCover({depth: cover.depth, vertices: c});
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

    const getGraph = () => {
        return (
            <Graph
                id="graph-id"
                ref={graphRef}
                data={convertToD3Graph(graph, cover, kernel)}
                onClickNode={onClickNode}
                config={{
                    staticGraph: false,
                    height: graphBoundingRef.current != null ? graphBoundingRef.current.offsetHeight : 0,
                    width: graphBoundingRef.current != null ? graphBoundingRef.current.offsetWidth : 0,
                    minZoom: 0.5,
                    maxZoom: 8
                }}
            />
        );
    }

    return (
        <>
            <div style={{display: "flex", flexDirection: "row-reverse", flex: "auto", overflow: "hidden"}}>
                <SideBar
                    data={graph} setData={setGraph}
                    cover={cover} setCover={setCover}
                    kernel={kernel} setKernel={setKernel}
                    coverDepth={coverDepth} setCoverDepth={setCoverDepth}
                    doFetch={doFetch}
                    query={query}
                />
                <div
                    style={{overflow: "hidden", margin: "1em", display: "flex", flex: "auto", flexDirection: "column"}}>

                    <div style={{
                        position: "absolute",
                        pointerEvents: "none",
                        opacity: query ? 1 : 0,
                        transition: query ? "opacity 0.1s" : "opacity 0.3s",
                        transitionDelay: query ? "0.05s" : "0.2s"
                    }}>
                        <Spinner/>
                    </div>
                    <div className="container__graph-area" ref={graphBoundingRef}>
                        {getGraph()}
                    </div>
                    <CodeViewer
                        data={graph}
                        setData={setGraph}
                        graphElement={getGraph()}
                        graphBoundingRef={graphBoundingRef}
                        query={query}/>
                </div>
            </div>
        </>
    );
}
