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


////////////////////////////////////////////////////////////////////////////////
// github

github_user = () => location.href.match(/http[s]:\/\/github.com\/([^\/?]+)\//)?.[1] ?? undefined
github_pname = () => location.href.match(/http[s]:\/\/github.com\/[^\/?]+\/([^\/?]+)/)?.[1] ?? undefined
github_repo = () => github_user() + "/" + github_pname()

const init_github = () => {
    user = "loyalpartner"
    const github = (target) => goto(`https://github.com/${target}`)
    const github_tab = (tab) => github(`${github_user() ?? user}?tab=${tab}`) 
    const github_repo_tab = (target) => github(`${github_repo()}/${target}`)
    mapkey('<Space>gh', "github",()=>github('loyalpartner'))
    mapkey('<Space>g,', "github settings",()=> github("settings"))
    mapkey('<Space>go', "github overview",()=> github_tab("overview"))
    mapkey('<Space>gs', "github stars",()=> github_tab("stars"))
    mapkey('<Space>gi', "github issues",()=> github("issues"))
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
}

init_github()
////////////////////////////////////////////////////////////////////////////////


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
// baidu-translate
var appid = '20200607000488675';
var key = 'Nb_cT61hFraVEUpkvp33'

const translate_show_result = (res) =>{
    var json = JSON.parse(res.text)
    Front.showPopup(json.trans_result.map((t)=> `<p>${t.src}</p><p>${t.dst}<p>`).join("\n"))
}

const translate_handle_query = (text)=> text.replace(/\n/g, " ").replace(/([^.]{3})\.\s+/g, "\1.\n")

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
// click `Save` button to make above settings to take effect.
var MD5 = function (string) {
  
    function RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
  
    function AddUnsigned(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
  
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
  
    function FF(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
  
    function GG(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
  
    function HH(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
  
    function II(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };
  
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };
  
    function WordToHex(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };
  
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
  
        for (var n = 0; n < string.length; n++) {
  
            var c = string.charCodeAt(n);
  
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
  
        }
  
        return utftext;
    };
  
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
  
    string = Utf8Encode(string);
  
    x = ConvertToWordArray(string);
  
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  
    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }
  
    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
  
    return temp.toLowerCase();
}
