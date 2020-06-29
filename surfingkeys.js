
// https://github.com/brookhong/Surfingkeys/blob/master/content_scripts/normal.js#L639
Hints.characters = 'aoeuidhtns'; 
settings.hintAlign = "left";
// aceVimMap('hh', '<Esc>', 'insert');
mapkey("<Space>,","#11Edit Settings", ()=> tabOpenLink("/pages/options.html"))
addSearchAliasX('s', 'stackoverflow', 'http://stackoverflow.com/search?q=', 'o');
addSearchAliasX('e', 'Emacs China', 'https://emacs-china.org/search?q=', 'o');
const goto = (url) => window.location = url;
aceVimMap('hh', '<Esc>', 'insert');
// const letters = "abcdefghijklmnopqrstuvwxyz";
const letters = "aoeuidhtns";

orgStyle = (link, title) => `[[${link}][${title}]]`

// 加载外部 js
// mapkey('<Space>at', "Copy as Org", function() {
//     //eval("alert('ok')");
//     httpRequest({
//             url: chrome.extension.getURL('/pages/default.js'),
//         }, function(res) {
//             eval(res.text);
//             console.log(res);
//         });
// });

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
mapkey('<Space>yy', "copy you-get url", ()=> Clipboard.write(`you-get -s 127.0.0.1 ${location.href}`))

// 前进 后退
map('<Ctrl-o>', 'S');
map('<Ctrl-i>', 'D');


mapkey('gS', '#12Open Chrome Extensions', function() {
    tabOpenLink("chrome://extensions/shortcuts");
});


github_user = () => location.href.match(/http[s]:\/\/github.com\/([^\/?]+)/)?.[1] ?? undefined
github_pname = () => location.href.match(/http[s]:\/\/github.com\/[^\/?]+\/([^\/?]+)/)?.[1] ?? undefined
github_repo = () => github_user() + "/" + github_pname()

user = "loyalpartner"
const github_tab = (tab) =>  goto(`https://github.com/${github_user() ?? user}?tab=${tab}`)
const github_repo_tab = (target) => goto(`https://github.com/${github_repo()}/${target}`)
mapkey('<Space>gh', "github",()=>github('loyalpartner'))
mapkey('<Space>go', "github overview",()=> github_tab("overview"))
mapkey('<Space>gs', "github stars",()=> github_tab("stars"))
mapkey('<Space>gf', "github following",()=> github_tab("following"))
mapkey('<Space>gF', "github followers",()=> github_tab("followers"))
mapkey('<Space>gp', "github packages",()=> github_tab("packages"))
mapkey('<Space>gP', "github projects",()=> github_tab("projects"))
mapkey('<Space>gr', "github repositories",()=> github_tab("repositories"))
mapkey('<Space>gtc', "github code",()=> github_repo_tab(""));
mapkey('<Space>gti', "github issues",()=> github_repo_tab("issues"));
mapkey('<Space>gtp', "github pull requests",()=> github_repo_tab("pulls"));
mapkey('<Space>gta', "github actions",()=> github_repo_tab("actions"));
mapkey('<Space>gtw', "github wiki",()=> github_repo_tab("wiki"));
mapkey('<Space>gtP', "github projects",()=> github_repo_tab("projects"));
mapkey('<Space>gts', "github settings",()=> github_repo_tab("settings"));
mapkey('<Space>gg', "github issues",()=> Clipboard.write(github_repo()))
mapkey('<Space>ue', "emacs china",()=>goto("https://emacs-china.org"))
mapkey('<Space>ul', "lazy cat",()=>goto("https://manateelazycat.github.io/"))
mapkey('<Space>ux', "xah",()=>goto("http://ergoemacs.org/emacs/emacs.html"))
//map('<Ctrl-2>', '<Ctrl-1>');

function CreateAnkiCard(obj, word){
    var res = obj;
    var exp = "";

    try{
        var basic_explains = res.basic.explains.map((d) => `- ${d}<br>`).join("");
        web_explains = res.web.map((d) => `- ${d.key} :: ${d.value}<br>`).join("");
        exp = `${res.translation} [${res.basic['us-phonetic']}]<br>* Basic Explains`;	
        exp += `${basic_explains}`;
        exp += `* Web ${web_explains}<br>`;
    }catch(e){
    }
    
    return exp;
}

mapkey('ymt', '#7Copy multiple link URLs to the clipboard', function() {
    var linksToYank = [];
    Hints.create('*[href]', function(element) {
        linksToYank.push(element.text);
        Clipboard.write(linksToYank.join('\n'));
    }, {multipleHits: true});
});

// org settings
mapkey("<Space>a", "Capture", ()=>{

    var word = window.getSelection();
    httpRequest({
        url: "http://fanyi.youdao.com/openapi.do?keyfrom=YouDaoCV&key=659600698&type=data&doctype=json&version=1.1&q="+word,
    },  (res) => {
        if (! word) return;
        var result = CreateAnkiCard(JSON.parse(res.text), word);
        
        if (! result) return;

        var data = {
            "action": "addNote",
            "version": 6,
            "params": {
                "note":{
                    "deckName": "word",
                    "tags": [],
                    "modelName": "basic",
                    "fields": {
                        "正面": word+"",
                        "背面": result
                    }}}};
        
        httpRequest({
            url: "http://localhost:8765",
            data: JSON.stringify(data)
        },(res)=>{Front.showPopup(res.text);});
    });
});

//map('<Space>1', '<Ctrl-p>');

Front.registerInlineQuery({
    //url: "",
    url: "http://fanyi.youdao.com/openapi.do?keyfrom=YouDaoCV&key=659600698&type=data&doctype=json&version=1.1&q=",
    parseResult: function (res) {
        try {
            res = JSON.parse(res.text);
            var exp = res.translation;

            exp = `${res.translation} [${res.basic['us-phonetic']}]`;
            var basic_explains = res.basic.explains.map(function (d) {
                return `<li>${d}</li>`;
            }).join("");
            exp += `<hr><div>Basic Explains<ul>${basic_explains}</ul></div>`;

            web_explains = res.web.map(function (d) {
                return `<li>${d.key} :: ${d.value}</li>`;
            }).join("");

            exp += `<div>Web<ul>${web_explains}</ul></div>`;
            return exp;
        } catch (e) {
            return "无效的单词";
        }
    }
});


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
// click `Save` button to make above settings to take effect.

