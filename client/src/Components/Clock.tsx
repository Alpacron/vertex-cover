import getTimeNow from "../Util/getTimeNow";
import React, {useEffect, useState} from "react";


export default function (props: any) {
    const time = getTimeNow({enabled: true});
    const [display, setDisplay] = useState<number>(-1);

    useEffect(() => setDisplay(Math.round((time.getTime() - props.minus) / props.divider)), [time])

    return (
        <p style={{display: "contents"}}>
            {display >= 0 && props.minus != 0 ? display : ""}
        </p>)
}