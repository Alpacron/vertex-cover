export function setCaretPosition(element: any, caretOffset: number): void {
    let count = 0;

    for (const n of element.childNodes) {
        let len = 0;
        if (n.innerText != undefined) len = n.innerText.length;
        else len = n.length;
        if (count + len >= caretOffset) {
            const range = document.createRange();
            const sel = window.getSelection();
            if (n.innerText != undefined) range.setStart(n.childNodes[0], caretOffset - count);
            else range.setStart(n, caretOffset - count);
            range.collapse(true);
            if (sel != null) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
            element.focus();
            break;
        }
        count += len;
    }
}
