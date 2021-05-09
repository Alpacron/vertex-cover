import {useEffect, useState} from "react";


export default function () {
    const [dateTime, setDateTime] = useState<Date>(new Date());

    useEffect(() => {
        const id = setInterval(() => setDateTime(new Date()), 1000);
        return () => {
            clearInterval(id);
        }
    }, []);

    return dateTime;
}