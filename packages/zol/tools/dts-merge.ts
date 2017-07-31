import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as ts from "typescript";

interface SourceFileWithText {
    sourceFile: ts.SourceFile;
    text: string;
    basePath: string;
}

function readSourceFile(basePath: string, fileName: string): SourceFileWithText {
    const text = fs.readFileSync(path.join(basePath, fileName), "utf8");
    const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.ES5);
    return {
        sourceFile: sourceFile,
        text: text,
        basePath: path.dirname(path.join(basePath, fileName))
    };
}

type ImportStatement = string;

function getModuleDeclaration(source: SourceFileWithText, name: string): [string, ImportStatement[]] {
    const importStatements: ImportStatement[] = [];

    let result: string = "";

    const nodeText = (node: ts.Node) => {
        return source.text.slice(node.pos, node.end);
    };

    ts.forEachChild(source.sourceFile, node => {
        if (ts.isImportDeclaration(node)) {
            if (!ts.isStringLiteral(node.moduleSpecifier)) {
                throw new Error("The Impossible Happened");
            }
            const moduleName = node.moduleSpecifier.text;
            if (moduleName.charAt(0) !== ".") {
                // Importing from some library
                importStatements.push(nodeText(node));
            }
        }

        if ((<any>node).name !== undefined && (<any>node).name.text === name) {
            result += nodeText(node) + "\n";
        }
    });

    if (result.length === 0) {
        throw new Error(`Name "${name}" not found in ${source.sourceFile}`);
    }

    return [result, importStatements];
}

function allModuleDeclarations(source: SourceFileWithText): [string, ImportStatement[]] {
    let result: string = "";
    let importStatements: ImportStatement[] = [];

    const nodeText = (node: ts.Node) => {
        return source.text.slice(node.pos, node.end);
    };

    ts.forEachChild(source.sourceFile, node => {
        if (ts.isExportDeclaration(node)) {
            if (node.exportClause === undefined) {
                // export *
                // TODO ...
            } else {
                if (node.moduleSpecifier === undefined) {
                    throw new Error("ExportDeclaration does not have moduleSpecifier");
                }
                if (!ts.isStringLiteral(node.moduleSpecifier)) {
                    throw new Error("The Impossible Happened");
                }

                const moduleName = node.moduleSpecifier.text;
                if (moduleName.charAt(0) !== ".") {
                    // Exporting from some library
                    result += nodeText(node) + "\n";
                } else {
                    const moduleFileName = moduleName + ".d.ts";

                    for (const e of node.exportClause.elements) {
                        const source2 = readSourceFile(source.basePath, moduleFileName);
                        const identifier = e.name.text;
                        const [text, imports] = getModuleDeclaration(source2, identifier);
                        result += text;
                        importStatements = importStatements.concat(imports);
                    }
                }
            }
        } else {
            result += nodeText(node) + "\n";
        }
    });

    return [result, importStatements];
}

function mergeImportStatements(importStatements: ImportStatement[]): ImportStatement[] {
    const uniques: ImportStatement[] = [];
    for (const i of importStatements) {
        if (uniques.indexOf(i) < 0) {
            uniques.push(i);
        }
    }
    uniques.sort();
    return uniques;
}

function processRoot(root: SourceFileWithText): string {
    const [text, imports] = allModuleDeclarations(root);
    return mergeImportStatements(imports).join("\n") + "\n\n" + text;
}

function print_usage() {
    console.log("USAGE:");
    console.log(process.argv0 + " " + process.argv[1] + " <index.d.ts> -o <out.d.ts>");
    process.exit(1);
}

function parse_args() {
    if (process.argv.length !== 5) {
        print_usage();
    }

    if (process.argv[3] !== "-o") {
        print_usage();
    }

    return {
        index: process.argv[2],
        outFile: process.argv[4]
    };
}

export function main() {
    const args = parse_args();
    const root = readSourceFile(path.dirname(args.index), path.basename(args.index));
    const output = processRoot(root);
    mkdirp.sync(path.dirname(args.outFile));
    fs.writeFileSync(args.outFile, output, { encoding: "utf8" });
}

main();
