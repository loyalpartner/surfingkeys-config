// https://github.com/brookhong/Surfingkeys/blob/master/content_scripts/normal.js#L639
Hints.characters = 'aoeuidhtns'; 
settings.hintAlign = "left";

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
const updateSettingsFromUrl = ()=>{
    RUNTIME('loadSettingsFromUrl', {
        url: "https://raw.githubusercontent.com/loyalpartner/surfingkeys-config/master/surfingkeys.js?" + Math.random(new Date().getMilliseconds())
    }, function(res) {
    });
}
mapkey("<Space>.","update settings", updateSettings)
mapkey("<Space>,","update settings", updateSettingsFromUrl)
////////////////////////////////////////////////////////////////////////////////
// org settings
// mapkey("<Space>a", "Capture", ()=>{
//     var word = window.getSelection();
//     if (! word) return;

//     var url =  `http://fanyi.youdao.com/openapi.do?keyfrom=YouDaoCV&key=659600698&type=data&doctype=json&version=1.1&q=${word}`
//     request_data = { url: url}

//     httpRequest(request_data,  (res) => {
//         var result = CreateAnkiCard(JSON.parse(res.text), word);
//         if (! result) return;
//         var data =
//             {
//                 "action": "addNote"
//                 , "version": 6
//                 , "params": {
//                     "note":{
//                         "deckName": "word"
//                         , "tags": []
//                         , "modelName": "basic"
//                         , "fields": {"正面": word+"", "背面": result}
//                     }
//                 }
//             };
//         httpRequest({url: "http://localhost:8765", data: JSON.stringify(data)},(res)=>{Front.showPopup(res.text);});
//     });
// });

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

////////////////////////////////////////////////////////////////////////////////
// switch doc language
switch_lang_rules = {
    "docs.microsoft.com": (pathname) => pathname.match(/\/zh-cn\//) ? pathname.replace("/zh-cn","/en-us") : pathname.replace("/en-us","/zh-cn"),
    "docs.python.org":  (pathname)=> pathname.match(/\/zh-cn/) ? pathname.replace("/zh-cn", "") : "/zh-cn" + pathname
}
const python_doc_switch_lang = () => {
    url = switch_lang_rules [location.host](location.pathname)
    location.href = url
}
mapkey('<Space>tt', 'doc switch lang', python_doc_switch_lang)

///////////////////////////////////////////////////////////////////////////////
// baidu-translate
var appid = '20200607000488675';
var key = 'Nb_cT61hFraVEUpkvp33'

var md5_text = localStorage.getItem("md5_js")
if (!md5_text) {
    httpRequest({url:"https://raw.githubusercontent.com/loyalpartner/surfingkeys-config/master/md5.js"},
                (t)=> localStorage.setItem("md5_js", t.text))
        
}else eval(md5_text)

const translate_show_result = (res) =>{
    var json = JSON.parse(res.text)
    Front.showPopup(json.trans_result.map((t)=> `<p>${t.src}</p><p>${t.dst}<p>`).join("\n"))
}

const translate_handle_query = (text)=> text.replace(/\n/g, " ").replace(/\.\s+/g, ".\n")


const translate_text = (text) => {
    text = translate_handle_query(text)
    var salt = '3329757864'
    var str1 = appid + text + salt +key;
    var sign = MD5(str1);
    var url =
        `http://api.fanyi.baidu.com/api/trans/vip/translate?from=auto&to=zh&appid=${appid}&sign=${sign}&q=${encodeURI(text)}&salt=${salt}`
    httpRequest({url: url} , translate_show_result)
}

mapkey('<Space>yy', 'baidu translate', ()=> {Hints.create('h1,h2,h3,h4,h5,h6,p,li', (e)=> translate_text(e.textContent))});
vmapkey('q', 'translate', () => translate_text(getSelection().anchorNode.textContent));
mapkey('q', 'baidu translate', ()=> {Hints.create('h1,h2,h3,h4,h5,h6,p,li', (e)=> translate_text(e.textContent))});


////////////////////////////////////////////////////////////////////////////////
// github

github_user = () => location.href.match(/http[s]:\/\/github.com\/([^\/?]+)\//)?.[1] ?? undefined
github_pname = () => location.href.match(/http[s]:\/\/github.com\/[^\/?]+\/([^\/?]+)/)?.[1] ?? undefined
github_repo = () => github_user() + "/" + github_pname()

user = "loyalpartner"
const github = (target) => goto(`https://github.com/${target}`)
const github_tab = (tab) => github(`${github_user() ?? user}?tab=${tab}`) 
const github_repo_tab = (target) => github(`${github_repo()}/${target}`)
mapkey('<Space>gh', "github",()=>github('loyalpartner'))
mapkey('<Space>g,', "github settings",()=> github("settings"))
mapkey('<Space>go', "github overview",()=> github_tab("overview"))
mapkey('<Space>gs', "github stars",()=> github_tab("stars"))
mapkey('<Space>gi', "github issues",()=> github("issues"))
mapkey('<Space>gn', "github issues",()=> github("notifications"))
mapkey('<Space>gf', "github following",()=> github_tab("following"))
mapkey('<Space>gF', "github followers",()=> github_tab("followers"))
mapkey('<Space>gp', "github packages",()=> github_tab("packages"))
mapkey('<Space>gP', "github projects",()=> github_tab("projects"))
mapkey('<Space>gr', "github repositories",()=> github_tab("repositories"))
mapkey('<Space>gtc', "github repo code",()=> github_repo_tab(""));
mapkey('<Space>gti', "github repo issues",()=> github_repo_tab("issues"));
mapkey('<Space>gtp', "github repo pull requests",()=> github_repo_tab("pulls"));
mapkey('<Space>gta', "github repo actions",()=> github_repo_tab("actions"));
mapkey('<Space>gtw', "github repo wiki",()=> github_repo_tab("wiki"));
mapkey('<Space>gtP', "github repo projects",()=> github_repo_tab("projects"));
mapkey('<Space>gts', "github repo settings",()=> github_repo_tab("settings"));
mapkey('<Space>gg', "github issues",()=> Clipboard.write(github_repo()))
mapkey('<Space>ue', "emacs china",()=>goto("https://emacs-china.org"))
mapkey('<Space>ul', "lazy cat",()=>goto("https://manateelazycat.github.io/"))
mapkey('<Space>ux', "xah",()=>goto("http://ergoemacs.org/emacs/emacs.html"))

// set theme
settings.theme = `
.sk_theme { font-family: Input Sans Condensed, Charcoal, sans-serif; font-size: 10pt; background: #24272e; color: #abb2bf; }
.sk_theme tbody { color: #fff; } .sk_theme input { color: #d0d0d0; }
.sk_theme .url { color: #61afef; }
.sk_theme .annotation { color: #56b6c2; }
.sk_theme .omnibar_highlight { color: #528bff; }
.sk_theme .omnibar_timestamp { color: #e5c07b; }
.sk_theme .omnibar_visitcount { color: #98c379; }
.sk_theme #sk_omnibarSearchResult>ul>li:nth-child(odd) { background: #303030; }
.sk_theme #sk_omnibarSearchResult>ul>li.focused { background: #3e4452; }
#sk_status, #sk_find { font-size: 20pt; }`;
