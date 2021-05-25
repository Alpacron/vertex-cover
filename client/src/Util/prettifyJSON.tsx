export default function (json: any) {
    if (typeof json != 'string') {
        json = JSON.stringify(
            json,
            function (k, v) {
                if (v instanceof Array) return JSON.stringify(v);
                return v;
            },
            4
        )
            .replaceAll('"[', '[')
            .replaceAll(']"', ']');
    }
    if (json != undefined) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (!json.endsWith('\n')) json += '\n';
        json = json.replace(
            /"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
            function (match: any) {
                let cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                        match = match.replace(':', '');
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                let s = '<span class="' + cls + '">' + match + '</span>';
                if (cls.includes('key')) s += ':';
                return s;
            }
        );
        return json;
    }
    return '';
}
