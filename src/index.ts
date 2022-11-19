import ts, { TypeFlags, SymbolFlags, SyntaxKind, ObjectFlags } from "typescript"
import type { RefType } from "./index.d"


export function parseFilesAndTransform(files: string[]) {
  const {
    program,
    typeChecker
  } = parseFiles(files);
  return files.map(fileName => {
    return transform({
      program,
      typeChecker,
      fileName
    })
  })
}
export function parseFiles(files: string[]) {
  refType = {};
  const tsOptions = {};
  const host = ts.createCompilerHost(tsOptions);
  const program = ts.createProgram(files, tsOptions, host);

  const typeChecker = program.getTypeChecker();

  return {
    program,
    typeChecker
  }
}

export function transform({ program, fileName, typeChecker }: {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  fileName: string
}) {

  const tr: ts.TransformerFactory<ts.Node> = context => node => {
    const visitNode: ts.Visitor = function (node) {
      const nnode = ts.visitEachChild(node, visitNode, context);
      if (ts.isCallExpression(node) && node.expression.getText() === "pick") {
        const type = getType({
          node: node.arguments[0],
          typeChecker,
          program
        })
        if (typeof type === "string") {
          return node;
        }
        return context.factory.createCallExpression(
          node.expression,
          [],
          node.arguments.concat([
            context.factory.createIdentifier("refType"),
            context.factory.createStringLiteral("" + type.refId)
          ])
        );
      }
      return nnode
    }
    return ts.visitNode(node, visitNode)
  }

  const sourceFile = program.getSourceFile(fileName);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  if (sourceFile) {
    const resultNodes = ts.transform(sourceFile, [tr])
    let result = resultNodes.transformed[0] as ts.SourceFile;

    // add refType def
    const lastImport = result.statements.filter(v => ts.isImportDeclaration(v)).pop() || {
      pos: 0,
      end: 0
    };
    const addedText = `\nconst refType = ${JSON.stringify(refType, null, 2)};\n`
    const oldText = result.getFullText();
    const newText = oldText.substring(0, lastImport.end) + addedText + oldText.substring(lastImport.end);
    const textChangeRange: ts.TextChangeRange = { newLength: addedText.length, span: { start: lastImport.end, length: 0 } };

    result = ts.updateSourceFile(result, newText, textChangeRange)
    return printer.printNode(ts.EmitHint.Unspecified, result, result)
  }

  return sourceFile?.getFullText() || ''
}

export function getType({ node, program, typeChecker }: {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  node: ts.Node
}) {
  const parseObject = (type: ts.ObjectType) => {
    const typeId = (type as any).id;
    if (refType[typeId]) return;
    const result = refType[typeId] = {};
    if (type.objectFlags & ObjectFlags.Reference) {
      let id = null;
      (type as ts.TypeReference).typeArguments.forEach(v => {
        if (v.flags === TypeFlags.Object) {
          parseObject(v as ts.ObjectType);
          id = (v as any).id;
        }
      });
      Object.assign(result, {
        array: id
      })
      if (type.symbol.getName() !== "Array") {
        type.getProperties().forEach(v => {
          const typeProp = typeChecker.getTypeOfSymbolAtLocation(v, v.valueDeclaration);
          if (typeProp.flags === TypeFlags.Object) {
            parseObject(typeProp as ts.ObjectType)
          }
        });
      }

    } else if (
      type.objectFlags & ObjectFlags.Class
      || type.objectFlags & ObjectFlags.Interface
      || type.objectFlags & ObjectFlags.ObjectLiteral
      || type.objectFlags & ObjectFlags.Anonymous
    ) {

      const properties = type.getProperties();
      const keys = properties.map(v => v.getName());
      const objs = {};
      properties.forEach((v, i) => {
        const typeProp = typeChecker.getTypeOfSymbolAtLocation(v, v.valueDeclaration);
        if (typeProp.flags === TypeFlags.Object) {
          parseObject(typeProp as ts.ObjectType)
          objs[i] = (typeProp as any).id
        }
      })


      Object.assign(result, {
        keys,
        ...objs
      })
    } else if (
      type.objectFlags & ObjectFlags.Mapped
    ) {
      Object.assign(result, {
        map: typeChecker.typeToString(type),
      })
    } else {
      Object.keys(ObjectFlags).forEach(key => {
        if (type.objectFlags & ObjectFlags[key]) {
          console.log(key)
        }
      })
      console.log(type)
      throw "not support"
    }


  }
  const type = typeChecker.getTypeAtLocation(node);
  if (type.flags === TypeFlags.Object) {
    parseObject(type as ts.ObjectType);
    return {
      refType,
      refId: (type as any).id
    }
  } else {
    return typeChecker.typeToString(type)
  }
}

let refType = {} as Record<string, RefType>;


