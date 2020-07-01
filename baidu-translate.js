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
