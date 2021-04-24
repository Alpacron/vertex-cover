import getCaretPosition from "./getCaretPosition";
import setCaretPosition from "./setCaretPosition";
import {Dispatch, SetStateAction} from "react";

export default function (element: any, e: any, setPasted: Dispatch<SetStateAction<boolean>>) {
    if (element != null) {
        let pos = getCaretPosition(element);
        if (e.key === "Enter") {
            document.execCommand('insertHTML', false, '\n');
            // Count every unfinished bracket before current position and add whitespaces
            let count = 0;
            for (let i = 0; i < element.innerText.length && i < pos; i++) {
                let c = element.innerText.charAt(i);
                if (/[\[{]/g.test(c))
                    count++;
                else if (/[\]}]/g.test(c))
                    count--;
            }
            if (count > 0)
                document.execCommand('insertHTML', false, '    '.repeat(count));
            e.preventDefault()
        } else if (/^[\[{"]$/g.test(e.key)) {
            let f = '}';
            if (e.key === '[')
                f = ']'
            else if (e.key === '"')
                f = '"'
            document.execCommand('insertHTML', false, e.key + f);
            setCaretPosition(element, pos + 1);
            e.preventDefault();
        } else if (e.key === "Backspace") {
            if (/^\[$/g.test(element.innerText.charAt(pos - 1)) && /^]$/g.test(element.innerText.charAt(pos)))
                document.execCommand('forwardDelete');
            else if (/^{$/g.test(element.innerText.charAt(pos - 1)) && /^}$/g.test(element.innerText.charAt(pos)))
                document.execCommand('forwardDelete')
            else if (/^"$/g.test(element.innerText.charAt(pos - 1)) && /^"$/g.test(element.innerText.charAt(pos)))
                document.execCommand('forwardDelete');
            else if (/^ {1,4}$/g.test(element.innerText.substring(Math.max(0, pos - 4), pos))) {
                setCaretPosition(element, Math.max(0, pos - 4))
                for (let i = 0; i < Math.min(4, 4 + pos - 4); i++) {
                    document.execCommand('forwardDelete');
                }
                console.log(element.innerText)
                document.execCommand('insertHTML', false, '\n');
            }
        } else if (e.key === "Tab") {
            document.execCommand('insertHTML', false, '    ');
            e.preventDefault();
        } else if (e.ctrlKey) {
            if(e.key === "v") {
                setPasted(true);
            }
        }
    }
}