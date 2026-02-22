let topmost = 0;

const extLookup = {
    "abap": "abap",
    "aes": "aes",
    "cls": "apex",
    "azcli": "azcli",
    "bat": "bat",
    "cmd": "bat",
    "bicep": "bicep",
    "mligo": "cameligo",
    "clj": "clojure",
    "cljs": "clojure",
    "coffee": "coffeescript",
    "c": "c",
    "h": "c",
    "cpp": "cpp",
    "hpp": "cpp",
    "cc": "cpp",
    "cs": "csharp",
    "csp": "csp",
    "css": "css",
    "cypher": "cypher",
    "dart": "dart",
    "dockerfile": "dockerfile",
    "ecl": "ecl",
    "ex": "elixir",
    "exs": "elixir",
    "flow": "flow9",
    "fs": "fsharp",
    "fsi": "fsharp",
    "ftl": "freemarker2",
    "go": "go",
    "graphql": "graphql",
    "gql": "graphql",
    "hbs": "handlebars",
    "tf": "hcl",
    "hcl": "hcl",
    "html": "html",
    "htm": "html",
    "ini": "ini",
    "java": "java",
    "js": "javascript",
    "jsx": "javascript",
    "mjs": "javascript",
    "json": "json",
    "jl": "julia",
    "kt": "kotlin",
    "kts": "kotlin",
    "less": "less",
    "lex": "lexon",
    "lua": "lua",
    "liquid": "liquid",
    "m3": "m3",
    "md": "markdown",
    "markdown": "markdown",
    "mdx": "mdx",
    "s": "mips",
    "dax": "msdax",
    "m": "objective-c",
    "pas": "pascal",
    "ligo": "pascaligo",
    "pl": "perl",
    "pm": "perl",
    "php": "php",
    "pla": "pla",
    "dats": "postiats",
    "pq": "powerquery",
    "ps1": "powershell",
    "proto": "proto",
    "pug": "pug",
    "py": "python",
    "pyw": "python",
    "qs": "qsharp",
    "r": "r",
    "cshtml": "razor",
    "redis": "redis",
    "rst": "restructuredtext",
    "rb": "ruby",
    "rs": "rust",
    "sb": "sb",
    "scala": "scala",
    "scm": "scheme",
    "scss": "scss",
    "sh": "shell",
    "bash": "shell",
    "sol": "sol",
    "rq": "sparql",
    "sql": "sql",
    "st": "st",
    "swift": "swift",
    "sv": "systemverilog",
    "svh": "systemverilog",
    "tcl": "tcl",
    "twig": "twig",
    "ts": "typescript",
    "tsx": "typescript",
    "tsp": "typespec",
    "vb": "vb",
    "v": "verilog",
    "wgsl": "wgsl",
    "xml": "xml",
    "xaml": "xml",
    "yaml": "yaml",
    "yml": "yaml"
};
const reverseExtLookup = Object.fromEntries(
    Object.entries(extLookup).map(([key, value]) => [value, key])
);

const runnable = [
    "javascript",
    "html",
    "python"
];

function registerDrag(el){
    var pos1 = 0, post2 = 0, pos3 = 0, pos4 = 0;

    function closeDragElement(){
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function dragMouseDown(e){
        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;
        topmost++;
        el.style.zIndex = topmost;
        if(topmost > 255){
            topmost = 0;
        }

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    if(el.querySelector("tabstrip")){
        el.querySelector("tabstrip").onmousedown = dragMouseDown;
    }else{
        el.onmousedown = dragMouseDown;
    }
}

async function registerEditor(id="editor", lang="xml", value=""){
    return new Promise((resolve) => {
        require.config({ paths: { 'vs': 'vs' }});
        require(['vs/editor/editor.main'], function(){
            let editor = monaco.editor.create(document.querySelector(id), {
                value: value,
                language: lang,
                theme: 'vs-dark',
                automaticLayout: true
            });

            resolve(editor);
        });
    });
}

async function registerWindow(editorContent="<!DOCTYPE html>\n<html lang='en'>\n\n</html>", editorLang="html", fsave=";:\\"){
    let save = fsave;
    let ed;
    let clid = Math.random().toString(36).replace(/[^a-z]/gi, '');
    let win = document.createElement("div");
    win.classList.add("window");

    let strip = document.createElement("tabstrip");
    win.append(strip);

    if(runnable.includes(editorLang)){
        let runIcon = document.createElement("button");
        runIcon.classList.add("run");
        runIcon.onclick = function(){
            if(save === ";:\\"){
                alert("Please save your file before running.");
            }else{
                if(editorLang === "html" || editorLang === "python"){
                    fetch("api/infer", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            path: save,
                            lang: editorLang
                        })
                    });
                }else if(editorLang === "javascript"){

                }
            }
        }
        strip.append(runIcon);
    }

    let saveIcon = document.createElement("button");
    saveIcon.classList.add("save");
    saveIcon.onclick = function(){
        const blob = new Blob([ed.getValue()], {type: "text/plain"});
        const url = window.URL.createObjectURL(blob);
        const l = document.createElement("a");
        l.href = url;
        l.download = prompt("Enter file name to save (without file extension):")+"."+reverseExtLookup[editorLang];
        document.body.append(l);
        save = l.download;
        l.click();
        l.remove();
        window.URL.revokeObjectUrl(url);
    }
    strip.append(saveIcon);

    let trashIcon = document.createElement("button");
    trashIcon.classList.add("trash");
    trashIcon.onclick = function(){
        if(confirm("Are you sure you want to delete this window? Unsaved progress will be lost!")){
            win.remove();
        }
    }
    strip.append(trashIcon);

    document.body.append(win);

    let editor = document.createElement("editor");
    editor.classList.add(clid);
    win.append(editor);
    ed = await registerEditor("editor."+clid, editorLang);
    ed.setValue(editorContent);

    registerDrag(win);
}

function getExt(name=".txt"){
    return extLookup[name.split(".").at(-1).toLowerCase()];
}

async function newWindow(){
    await registerWindow("", prompt("Enter the language to use:").toLowerCase()).setValue("");
}

function openFile(){
    let inp = document.createElement("input");
    let info = [];

    inp.type = "file";
    inp.addEventListener("change", (e) => {
        const file = e.target.files[0];
        info.push(file.name);
        try{
            const reader = new FileReader();
            reader.onload = (ev) => {
                const buffer = ev.target.result;
                const uint8 = new Uint8Array(buffer);
                let encoding = 'utf-8';
                if(uint8[0] === 0xFF && uint8[1] === 0xFE){
                    encoding = 'utf-16le';
                }else if(uint8[0] === 0xFE && uint8[1] === 0xFF){
                    encoding = 'utf-16be';
                }else if(uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF){
                    encoding = 'utf-8';
                }else{
                    try{
                        const utf8Decoder = new TextDecoder('utf-8', {fatal: true});
                        utf8Decoder.decode(uint8);
                        encoding = 'utf-8';
                    }catch(e){
                        encoding = 'iso-8859-1';
                    }
                }
                const finalDecoder = new TextDecoder(encoding);
                const text = finalDecoder.decode(uint8);
                info.push(text);
                registerWindow(info[1], getExt(info[0]));
            }
            reader.readAsArrayBuffer(file);
        }catch(err){}
    });
    inp.click();
    inp.remove();
}

registerWindow();