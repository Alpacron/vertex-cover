export default function (element: HTMLPreElement) {
    let caretOffset = 0;
    let doc = element.ownerDocument;
    let win = doc.defaultView;
    let sel;
    if (win != null && typeof win.getSelection != 'undefined') {
        sel = win.getSelection();
        if (sel != null && sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    }
    return caretOffset;
}
