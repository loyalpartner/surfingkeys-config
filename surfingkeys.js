// https://github.com/brookhong/Surfingkeys/blob/master/content_scripts/normal.js#L639
Hints.characters = 'aoeuidhtns'; 
settings.hintAlign = "left";
mapkey("<Space>,","#11Edit Settings", ()=> tabOpenLink("/pages/options.html"))
addSearchAliasX('s', 'stackoverflow', 'http://stackoverflow.com/search?q=', 'o');
addSearchAliasX('e', 'Emacs China', 'https://emacs-china.org/search?q=', 'o');
// const letters = "aoeuidhtns";

// unmapAllExcept(['f','x','J','K','u','d'],/http[s]:\/\/github\.com/)

mapkey('-', 'Toggle Blacklist', ()=> Normal.passThrough())

const orgStyle = (link, title) => `[[${link}][${title}]]`
const goto = (url) => window.location = url;

mapkey('<Space>yo', "Copy as Org", ()=> Clipboard.write(orgStyle(location.href, document.title)))
mapkey('<Space>ymo', '保存多个 org link', ()=> {
    var result = undefined
    Hints.create('*[href]'
                 , (element)=> Clipboard.write(result=`${result??""}${orgStyle(element.href, element.text)}\n`)
                 , { multipleHits: true })})

buildOrgProtocol = (action,template) => {
    title = encodeURIComponent(document.title);
    body = encodeURIComponent(window.getSelection())

    url = `org-protocol:/${action}?template=${template}&url=${location.href}&title=${title}&body=${body}`;
    tabOpenLink(url);
    console.log(url)
}
mapkey('<Space>c', "Org Capture：Save Link", ()=> buildOrgProtocol('capture', 'l'))
mapkey('<Space>yd', "copy you-get url", ()=> Clipboard.write(`you-get -s 127.0.0.1 ${location.href}`))

// 前进 后退
mapkey('<Ctrl-o>', '#4Go back in history', ()=> history.go(-1), {repeatIgnore: true})
mapkey('<Ctrl-i>', '#4Go forward in history', ()=> history.go(1), {repeatIgnore: true})


////////////////////////////////////////////////////////////////////////////////
// update settings
const updateSettings = ()=>{
    var reload = undefined
    Clipboard.read(t=>{
        if (t.data.match(/\/\/ https/)){
            reload = true
            RUNTIME('updateSettings', {settings: {snippets: `// cloned ${t.data}`, localPath: ""}});
        }
    })
    if (reload) {
        Clipboard.write(" ")
        Front.showBanner('Settings saved', 300);
    }
}

mapkey("<Space>.","update settings", updateSettings)
////////////////////////////////////////////////////////////////////////////////
// mapkey('gS', '#12Open Chrome Extensions', ()=> tabOpenLink("chrome://extensions/shortcuts"));



// org settings
mapkey("<Space>a", "Capture", ()=>{

    var word = window.getSelection();
    request_data =
        { url: `http://fanyi.youdao.com/openapi.do?keyfrom=YouDaoCV&key=659600698&type=data&doctype=json&version=1.1&q=${word}`}

    httpRequest(request_data,  (res) => {
        if (! word) return;
        var result = CreateAnkiCard(JSON.parse(res.text), word);
        if (! result) return;
        var data =
            {
                "action": "addNote"
                , "version": 6
                , "params": {
                    "note":{
                        "deckName": "word"
                        , "tags": []
                        , "modelName": "basic"
                        , "fields": {"正面": word+"", "背面": result}
                    }
                }
            };
        httpRequest({url: "http://localhost:8765", data: JSON.stringify(data)},(res)=>{Front.showPopup(res.text);});
    });
});

///////////////////////////////////////////////////////////////////////////////
// inline query
const parse_translate_result = (res) => {
    res = JSON.parse(res.text);
    return ` ${res?.translation} [${res?.basic['us-phonetic']}]
            <hr>
            <div> Basic Explains
                <ul> ${res?.basic_explains?.map((d)=>"<li>"+d+"</li>").join("\n")} </ul>
            </div>
            <div> Web Explains
                <ul> ${res?.web?.map((d)=>"<li>"+d.key + " :: " + d.value + "</li>").join("\n")} </ul>
            </div>
            `
}

Front.registerInlineQuery({
    url: "http://fanyi.youdao.com/openapi.do?keyfrom=YouDaoCV&key=659600698&type=data&doctype=json&version=1.1&q=",
    parseResult: parse_translate_result
});
// switch doc language
switch_lang_rules = {
    "docs.microsoft.com": (pathname) => pathname.match(/\/zh-cn\//) ? pathname.replace("/zh-cn","/en-us") : pathname.replace("/en-us","/zh-cn"),
    "docs.python.org":  (pathname)=> pathname.match(/\/zh-cn/) ? pathname.replace("/zh-cn", "") : "/zh-cn" + pathname
}
const python_doc_switch_lang = () => {
    url = switch_lang_rules [location.host](location.pathname)
    location.href = url
}
mapkey('<Space>tt', 'python doc switch lang', python_doc_switch_lang)
////////////////////////////////////////////////////////////////////////////////

// click `Save` button to make above settings to take effect.
// click `Save` button to make above settings to take effect.
