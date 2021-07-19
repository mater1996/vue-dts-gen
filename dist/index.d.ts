import ts from 'typescript';

export declare function build(): void;

export declare function createProgram(fileNames: string[], options: ts.CompilerOptions): ts.Program;

export declare function transfromFactory(context: ts.TransformationContext): (sourceFile: ts.SourceFile | ts.Bundle) => ts.SourceFile | ts.Bundle;

export { }
