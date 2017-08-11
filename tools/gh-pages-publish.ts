const { cd, exec, echo, touch, set } = require("shelljs")
const { readFileSync } = require("fs")
const url = require("url")

let repoUrl
let pkg = JSON.parse(readFileSync("package.json") as any)
if (typeof pkg.repository === "object") {
    if (!pkg.repository.hasOwnProperty("url")) {
        throw new Error("URL does not exist in repository section")
    }
    repoUrl = pkg.repository.url
} else {
    repoUrl = pkg.repository
}

let parsedUrl = url.parse(repoUrl)
let repository = (parsedUrl.host || "") + (parsedUrl.path || "")
let ghToken = process.env.GH_TOKEN

set('-e')
echo("Deploying docs!!!")
exec("rm -rf dist")
exec("mkdir -p dist/docs")
cd("dist")
touch(".nojekyll")
exec("mkdir docs/zol")
exec("mkdir docs/zol-json")
exec("mkdir docs/zol-math")
exec("mkdir docs/zol-string")
exec("mkdir docs/zol-time")
exec("cp -r ../packages/zol/dist/docs/* docs/zol/")
exec("cp -r ../packages/zol-json/dist/docs/* docs/zol-json")
exec("cp -r ../packages/zol-math/dist/docs/* docs/zol-math/")
exec("cp -r ../packages/zol-string/dist/docs/* docs/zol-string/")
exec("cp -r ../packages/zol-time/dist/docs/* docs/zol-time/")
exec("git init")
exec("git add .")
exec('git config user.name "deploy"')
exec('git config user.email "<>"')
exec('git commit -m "docs(docs): update gh-pages"')
exec(
    `git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`
)
echo("Docs deployed!!")
