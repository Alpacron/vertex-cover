import { GetTimeNow } from '../Util/getTimeNow';
import React, { useEffect, useState } from 'react';

export function Clock(props: { minus: number; divider: number }): JSX.Element {
    const time = GetTimeNow();
    const [display, setDisplay] = useState<number>(-1);

    useEffect(
        () => setDisplay(Math.round((time.getTime() - props.minus) / props.divider)),
        [props.divider, props.minus, time]
    );

    return <p style={{ display: 'contents' }}>{display >= 0 && props.minus != 0 ? display : ''}</p>;
}
