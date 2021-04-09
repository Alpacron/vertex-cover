import {useEffect, useState} from "react";


export default function (props: {enabled: boolean}) {
    const [dateTime, setDateTime] = useState<Date>(new Date());

    useEffect(() => {
        if(props.enabled) {
            const id = setInterval(() => setDateTime(new Date()), 1000);
            return () => {
                clearInterval(id);
            }
        }
    }, [props.enabled]);

    return dateTime;
}