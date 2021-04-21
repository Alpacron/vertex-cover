import React, {useEffect, useRef, useState} from 'react';
import useWindowDimensions from "./Util/useWindowDimensions";
import convertToD3Graph from "./Util/convertToD3Graph";
import './App.css';
import {Graph} from "react-d3-graph";
import {FocusStyleManager} from "@blueprintjs/core";
import SideBar from "./Components/SideBar";

FocusStyleManager.onlyShowFocusOnTabs();

export default function () {
    const graphBoundingRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph<any, any>>(null);
    const {width, height} = useWindowDimensions();
    const [graph, setGraph] = useState<any>({});
    const [cover, setCover] = useState<{depth: number, vertices: number[]}>({depth: 1, vertices: []});
    const [kernel, setKernel] = useState<{ isolated: number[], pendant: number[], tops: number[] }>({
        isolated: [],
        pendant: [],
        tops: []
    });

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

    return (
        <div style={{display: "flex", flexDirection: "row-reverse", flex: "auto", overflow: "hidden"}}>
            <SideBar
                data={graph} setData={setGraph}
                cover={cover} setCover={setCover}
                kernel={kernel} setKernel={setKernel}
                graphElement={<Graph
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
                />} graphBoundingRef={graphBoundingRef}
            />
        </div>
    );
}
