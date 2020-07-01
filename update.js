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
        url: "https://loyalpartner.github.io/surfingkeys-config/result.js?" + Math.random(new Date().getMilliseconds())
    }, function(res) {
    });
}
mapkey("<Space>.","update settings", updateSettings)
mapkey("<Space>u","update settings", updateSettingsFromUrl)
