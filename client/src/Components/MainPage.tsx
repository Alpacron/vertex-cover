import React, { Dispatch, RefObject, SetStateAction, useState } from 'react';
import { PromiseWithCancel } from '../Interfaces/PromiseWithCancel';
import { SideBar } from './SideBar';
import { Spinner } from '@blueprintjs/core';
import { CodeViewer } from './CodeViewer';
import { NavBar } from './NavBar';

export function MainPage(props: {
    children: any;
    graphBoundingRef: RefObject<HTMLDivElement>;
    graphRef: RefObject<any>;
    data: Record<string, unknown>;
    setData: Dispatch<SetStateAction<Record<string, unknown>>>;
    cover: { depth: number; vertices: number[] };
    setCover: Dispatch<SetStateAction<{ depth: number; vertices: number[] }>>;
    kernel: { isolated: number[]; pendant: number[]; tops: number[] };
    setKernel: Dispatch<SetStateAction<{ isolated: number[]; pendant: number[]; tops: number[] }>>;
    maxChildren: number;
    setMaxChildren: Dispatch<SetStateAction<number>>;
    isTree: boolean;
    setIsTree: Dispatch<SetStateAction<boolean>>;
    setEdges: Dispatch<SetStateAction<number[][]>>;
    setTour: Dispatch<SetStateAction<number[]>>;
}): JSX.Element {
    const server = process.env.REACT_APP_SERVER_URL;
    const [coverDepth, setCoverDepth] = useState<number>(1);
    const [query, setQuery] = useState<PromiseWithCancel<any> | undefined>();

    function doFetch(path: string, method: string, body: any, resolve?: (res: any) => void, name?: string) {
        if (!query) {
            const controller = new AbortController();
            const signal = controller.signal;
            // eslint-disable-next-line no-async-promise-executor
            const promise = new Promise(async () => {
                try {
                    const response = await fetch(server + path, {
                        method: method,
                        body: JSON.stringify(body),
                        signal
                    });
                    const data = await response.json();
                    setQuery(undefined);
                    props.setKernel({ isolated: [], pendant: [], tops: [] });
                    props.setCover({ depth: coverDepth, vertices: [] });
                    if (resolve) resolve({ data: data, query: promise as PromiseWithCancel<any> });
                } catch (ex: any) {
                    setQuery(undefined);
                }
            });
            (promise as PromiseWithCancel<any>).cancel = () => controller.abort();
            (promise as PromiseWithCancel<any>).dateTime = new Date();
            if (name) (promise as PromiseWithCancel<any>).name = name;
            setQuery(promise as PromiseWithCancel<any>);
            return promise as PromiseWithCancel<any>;
        }
    }

    return (
        <>
            <NavBar data={props.data} doFetch={doFetch} />
            <div style={{ display: 'flex', flexDirection: 'row', flex: 'auto', overflow: 'hidden' }}>
                <div
                    style={{
                        overflow: 'hidden',
                        margin: '1em',
                        display: 'flex',
                        flex: 'auto',
                        flexDirection: 'column'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            pointerEvents: 'none',
                            opacity: query ? 1 : 0,
                            transition: query ? 'opacity 0.1s' : 'opacity 0.3s',
                            transitionDelay: query ? '0.05s' : '0.2s'
                        }}
                    >
                        <Spinner />
                    </div>
                    {props.children}
                    <CodeViewer
                        data={props.data}
                        setData={props.setData}
                        graphElement={props.graphRef}
                        graphBoundingRef={props.graphBoundingRef}
                        query={query}
                        setCover={props.setCover}
                        setKernel={props.setKernel}
                        coverDepth={coverDepth}
                    />
                </div>
                <SideBar
                    data={props.data}
                    setData={props.setData}
                    cover={props.cover}
                    setCover={props.setCover}
                    kernel={props.kernel}
                    setKernel={props.setKernel}
                    setEdges={props.setEdges}
                    setTour={props.setTour}
                    coverDepth={coverDepth}
                    setCoverDepth={setCoverDepth}
                    doFetch={doFetch}
                    query={query}
                    maxChildren={props.maxChildren}
                    setMaxChildren={props.setMaxChildren}
                    isTree={props.isTree}
                    setIsTree={props.setIsTree}
                />
            </div>
        </>
    );
}
