import { Button, ButtonGroup, Card } from '@blueprintjs/core';
import { getCaretPosition } from '../Util/getCaretPosition';
import React, { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { prettifyJSON } from '../Util/prettifyJSON';
import { betterKeyDownActions } from '../Util/betterKeyDownActions';
import { setCaretPosition } from '../Util/setCaretPosition';
import { PromiseWithCancel } from '../Interfaces/PromiseWithCancel';

export function CodeViewer(props: {
    data: Record<string, unknown>;
    setData: Dispatch<SetStateAction<Record<string, unknown>>>;
    graphElement: RefObject<any>;
    graphBoundingRef: RefObject<HTMLDivElement>;
    setCover: Dispatch<SetStateAction<{ depth: number; vertices: number[] }>>;
    setKernel: Dispatch<SetStateAction<{ isolated: number[]; pendant: number[]; tops: number[] }>>;
    coverDepth: number;
    query: PromiseWithCancel<any> | undefined;
}): JSX.Element {
    const [pasted, setPasted] = useState<boolean>(false);
    const graphDiv = useRef<HTMLPreElement>(null);

    const setGraphText = (json: Record<string, unknown> | string) => {
        if (graphDiv.current != null) {
            graphDiv.current.innerHTML = prettifyJSON(json);
        }
    };

    useEffect(() => {
        setGraphText(props.data);
    }, [props.data]);

    return (
        <Card
            style={{
                maxHeight: '40%',
                margin: '1px',
                marginTop: '1em',
                padding: 0,
                display: 'flex',
                flexDirection: 'row-reverse'
            }}
        >
            <ButtonGroup style={{ margin: '1em', position: 'absolute' }}>
                <Button
                    icon="clipboard"
                    onClick={() => {
                        navigator.clipboard.writeText(graphDiv.current!.innerText);
                    }}
                >
                    Copy to clipboard
                </Button>
                <Button
                    icon="chevron-right"
                    small
                    onClick={() => {
                        if (graphDiv.current != null) {
                            // Checking if graph is a valid json graph
                            if (
                                /^[\s\n]*{([\s\n]*"\d+"[\s\n]*:[\s\n]*\[((\d+([\s\n]*,[\s\n]*\d+)*)|(\[\d+([\s\n]*,[\s\n]*\d+])*([\s\n]*,[\s\n]*(\[\d+([\s\n]*,[\s\n]*\d+])*))*)*)*][\s\n]*)(,([\s\n]*"\d+"[\s\n]*:[\s\n]*\[((\d+([\s\n]*,[\s\n]*\d+)*)|(\[\d+([\s\n]*,[\s\n]*\d+])*([\s\n]*,[\s\n]*(\[\d+([\s\n]*,[\s\n]*\d+])*))*)*)*][\s\n]*))*}[\s\n]*$/g.test(
                                    graphDiv.current.innerText
                                )
                            ) {
                                const json = JSON.parse(graphDiv.current.innerText);
                                // Checking if every connection goes both ways, else add connection
                                Object.keys(json).forEach((key: string) => {
                                    // Sort and fix duplicates
                                    if (typeof json[key][0] == "number") {
                                        json[key] = json[key].sort().filter(function (item: any, pos: any, ary: any) {
                                            return !pos || item != ary[pos - 1];
                                        });
                                        json[key].forEach((con: string) => {
                                            if (key == con || json[con] == undefined) {
                                                json[key].splice(json[key].indexOf(con));
                                            } else if (!json[con].includes(parseInt(key))) {
                                                json[con].push(parseInt(key));
                                            }
                                        });
                                    }
                                });
                                // set data to json
                                props.setKernel({ isolated: [], pendant: [], tops: [] });
                                props.setCover({ depth: props.coverDepth, vertices: [] });
                                props.setData(json);
                            } else {
                                alert('Invalid graph!');
                            }
                        }
                    }}
                >
                    Generate
                </Button>
            </ButtonGroup>
            <pre
                spellCheck="false"
                style={{
                    minHeight: '52px',
                    maxHeight: '100%',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    padding: '1em',
                    width: '100%',
                    outline: 'none'
                }}
                ref={graphDiv}
                contentEditable
                onKeyDown={(e) => betterKeyDownActions(graphDiv.current, e, setPasted)}
                onInput={() => {
                    if (graphDiv.current != null) {
                        const pos = getCaretPosition(graphDiv.current);
                        if (pasted) {
                            console.log('a');
                            setPasted(false);
                        }
                        setGraphText(graphDiv.current.innerText);
                        setCaretPosition(graphDiv.current, pos);
                    }
                }}
            />
        </Card>
    );
}
