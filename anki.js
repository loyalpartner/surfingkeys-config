////////////////////////////////////////////////////////////////////////////////
// anki
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
