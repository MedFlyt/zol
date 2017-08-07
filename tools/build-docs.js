var childProcess = require("child_process");
var fs = require("fs-extra");
var path = require("path");

function isPlatformWindows() {
    return /^win/.test(process.platform);
}

function node_exe(prog) {
    return isPlatformWindows()
        ? "node_modules\\.bin\\" + prog + ".cmd"
        : "./node_modules/.bin/" + prog;
}

function print_usage() {
    console.log("USAGE:");
    console.log(process.argv0 + " " + process.argv[1] + " <infile.d.ts> -o <outdir>");
    process.exit(1);
}

function parse_args() {
    var fix = false;
    var patterns = [];
    var i;

    if (process.argv.length !== 5) {
        print_usage();
    }
    if (process.argv[3] !== "-o") {
        print_usage();
    }

    return {
        inFile: process.argv[2],
        outDir: process.argv[4]
    }
}

function main() {
    var args = parse_args();
    var dirName = "tmp_docs";

    // Can't use a real tmp dir because we must be somewhere above "node_modules" directory
    fs.mkdirSync(dirName);
    try {
        fs.copySync(args.inFile, path.join(dirName, path.basename(args.inFile)));
        var tsconfig = {
            "compilerOptions": {
                "moduleResolution": "node"
            }
        };
        fs.writeFileSync(path.join(dirName, "tsconfig.json"), JSON.stringify(tsconfig), { encoding: "utf8" });

        var p = childProcess.spawnSync(
            node_exe("typedoc"),
            [
                "--tsconfig", path.join(dirName, "tsconfig.json"),
                "--readme", "none",
                "--mode", "file",
                "--theme", "minimal",
                "--includeDeclarations",
                "--excludePrivate",
                "--excludeExternals",
                "--excludeNotExported",
                "--out", args.outDir
            ],
            { stdio: "" });

        console.log(p.stderr.toString());
        if (p.error) {
            throw p.error;
        }
        console.log(p.stdout.toString());
    } finally {
        fs.removeSync(dirName);
    }
}

main();
