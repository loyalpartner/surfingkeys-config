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
