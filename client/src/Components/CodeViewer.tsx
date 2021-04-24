import {Button, Card} from "@blueprintjs/core";
import getCaretPosition from "../Util/getCaretPosition";
import setCaretPosition from "../Util/setCaretPosition";
import React, {Dispatch, RefObject, SetStateAction, useEffect, useRef, useState} from "react";
import {PromiseWithCancel} from "../Interfaces/PromiseWithCancel";
import prettifyJSON from "../Util/prettifyJSON";
import betterKeyDownActions from "../Util/betterKeyDownActions";

export default function (props: {
    data: {},
    setData: Dispatch<SetStateAction<{}>>,
    graphElement: JSX.Element,
    graphBoundingRef: RefObject<HTMLDivElement>
    query: PromiseWithCancel<any> | undefined
}) {
    const [pasted, setPasted] = useState<boolean>(false);
    const graphDiv = useRef<HTMLPreElement>(null);

    const setGraphText = (json: {} | string) => {
        if (graphDiv.current != null) {
            graphDiv.current.innerHTML = prettifyJSON(json);
        }
    }

    useEffect(() => {
        setGraphText(props.data);
    }, [props.data]);

    return (

        <Card style={{
            maxHeight: "40%",
            margin: "1px",
            marginTop: "1em",
            padding: 0,
            display: "flex",
            flexDirection: "row-reverse"
        }}>
            <Button icon="chevron-right" style={{margin: "1em", position: "absolute"}} small onClick={() => {
                if (graphDiv.current != null) {
                    // Checking if graph is a valid json graph
                    if (/^[\s\n]*{([\s\n]*"\d+"[\s\n]*:[\s\n]*\[(\d+([\s\n]*,[\s\n]*\d+)*)?][\s\n]*)(,([\s\n]*"\d+"[\s\n]*:[\s\n]*\[(\d+([\s\n]*,[\s\n]*\d+)*)?][\s\n]*))*}[\s\n]*$/g.test(graphDiv.current.innerText)) {
                        let json = JSON.parse(graphDiv.current.innerText);
                        // Checking if every connection goes both ways, else add connection
                        Object.keys(json).forEach((key: string) => {
                            // Sort and remove duplicates
                            json[key] = json[key].sort().filter(function (item: any, pos: any, ary: any) {
                                return !pos || item != ary[pos - 1];
                            });
                            json[key].forEach((con: string) => {
                                if (key == con || json[con] == undefined) {
                                    json[key].splice(json[key].indexOf(con));
                                } else if (!json[con].includes(parseInt(key))) {
                                    json[con].push(parseInt(key));
                                }
                            })
                        });
                        // set data to json
                        props.setData(json);
                    } else {
                        alert("Invalid graph!")
                    }
                }
            }}>Generate</Button>
            <pre spellCheck="false" style={{
                minHeight: "52px",
                maxHeight: "100%",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
                padding: "1em",
                width: "100%",
                outline: "none"
            }} ref={graphDiv} contentEditable onKeyDown={e => betterKeyDownActions(graphDiv.current, e, setPasted)} onInput={() => {
                if (graphDiv.current != null) {
                    let pos = getCaretPosition(graphDiv.current);
                    if(pasted) {
                        console.log("a")
                        setPasted(false);
                    }
                    setGraphText(graphDiv.current.innerText);
                    setCaretPosition(graphDiv.current, pos);
                }
            }}/>
        </Card>
    )
}