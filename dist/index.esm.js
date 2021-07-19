import ts from 'typescript';
import fs from 'fs';
import { parse, compileScript } from '@vue/compiler-sfc';
import path from 'path';

/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-08 15:12:57
 * @Description:
 */
function readVueFile(fileName) {
    const fileContent = fs.readFileSync(fileName, 'utf-8');
    const sfc = parse(fileContent);
    const { script, scriptSetup } = sfc.descriptor;
    let content = '';
    if (script?.content != null) {
        const scriptContent = script.content;
        content = `${content}${scriptContent}`;
    }
    if (scriptSetup != null) {
        const compiled = compileScript(sfc.descriptor, {
            id: 'xxx'
        });
        const compiledContent = compiled.content;
        content = `${content}${compiledContent}`;
    }
    return content;
}

/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-14 19:34:34
 * @Description
 */
function isVue(fileName) {
    return path.extname(fileName) === '.vue';
}
function reportDiagnostics(diagnostics) {
    diagnostics.forEach((diagnostic) => {
        let message = 'Error';
        if (diagnostic.file != null && diagnostic.start != null) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }
        message +=
            ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}
/**
 * readConfigFile forked from https://github.com/microsoft/TypeScript/issues/44573
 * @param configFileName - configFileName
 * @returns
 */
function readConfigFile(configFileName) {
    // Read config file
    const configFileText = fs.readFileSync(configFileName).toString();
    // Parse JSON, after removing comments. Just fancier JSON.parse
    const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    const configObject = result.config;
    //
    if (configObject != null && result.error != null) {
        reportDiagnostics([result.error]);
        process.exit(1);
    }
    // Extract config infromation
    const configParseResult = ts.parseJsonConfigFileContent(configObject, {
        ...ts.sys,
        readDirectory(rootDir, extensions, excludes, includes, depth) {
            return ts.sys.readDirectory(rootDir, [...extensions, '.vue'], excludes, includes, depth);
        }
    }, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }
    configParseResult.fileNames = configParseResult.fileNames.map((v) => isVue(v) ? `${v}.ts` : v);
    return configParseResult;
}

/*
 * @author: Mater
 * @Email: bxh8640@gmail.com
 * @Date: 2021-07-09 15:30:39
 * @Description:
 */
const vueTsReg = /\.vue\.ts$/;
const vueDTsReg = /vue\.d\.ts$/;
const vueImportReg = /^'|\.vue'$/;
function overwriteCompilerHost(host) {
    const writeFile = host.writeFile;
    const readFile = host.readFile;
    host.readFile = (fileName) => {
        if (vueTsReg.test(fileName)) {
            return readVueFile(fileName.replace(vueTsReg, '.vue'));
        }
        return readFile(fileName);
    };
    host.writeFile = (fileName, ...args) => {
        return writeFile(fileName.replace(vueDTsReg, 'd.ts'), ...args);
    };
    return host;
}
function transfromFactory(context) {
    return (sourceFile) => {
        const { factory } = context;
        const visitor = (node) => {
            if (ts.isImportDeclaration(node)) {
                const text = node.moduleSpecifier.getText();
                return factory.updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, factory.createStringLiteral(text.replace(vueImportReg, '')));
            }
            return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor);
    };
}
function createProgram(fileNames, options) {
    const host = overwriteCompilerHost(ts.createCompilerHost(options));
    return ts.createProgram(fileNames, options, host);
}
function compile(fileNames, options) {
    const program = createProgram(fileNames, options);
    fileNames.forEach((fileName) => {
        const sourceFile = program.getSourceFile(fileName);
        program.emit(sourceFile, undefined, undefined, undefined, {
            afterDeclarations: [transfromFactory]
        });
    });
}
function build() {
    const tsConfig = readConfigFile('tsconfig.json');
    return compile(tsConfig.fileNames, tsConfig.options);
}

export { build, createProgram, transfromFactory };
