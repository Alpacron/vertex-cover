export default function (element: any, caretOffset: number) {
    let count = 0;

    for (let n = 0; n < element.childNodes.length; n++) {
        let len = 0;
        if (element.childNodes[n].innerText != undefined) len = element.childNodes[n].innerText.length;
        else len = element.childNodes[n].length;
        if (count + len >= caretOffset) {
            let range = document.createRange();
            let sel = window.getSelection();
            if (element.childNodes[n].innerText != undefined)
                range.setStart(element.childNodes[n].childNodes[0], caretOffset - count);
            else range.setStart(element.childNodes[n], caretOffset - count);
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
