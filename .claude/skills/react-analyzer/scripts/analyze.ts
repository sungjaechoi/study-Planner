#!/usr/bin/env npx tsx

/**
 * React Symbol Usage Analyzer v1.0
 *
 * Supported:
 * - TypeScript/JavaScript
 * - React (hooks, JSX, components, forwardRef, memo)
 * - Next.js 13-16 (App Router, Server Components, Server Actions)
 */

import * as fs from "fs";
import * as path from "path";
import {
  Project,
  Node,
  SyntaxKind,
  SourceFile,
} from "ts-morph";

// ============================================
// Types
// ============================================

export enum UsageType {
  DEFINITION = "definition",
  IMPORT = "import",
  IMPORT_TYPE = "import_type",
  RE_EXPORT = "re_export",
  DIRECT_CALL = "direct_call",
  HOOK_CALL = "hook_call",
  CALLBACK = "callback",
  DESTRUCTURE = "destructure",
  PROPERTY_ACCESS = "property_access",
  TYPE_REFERENCE = "type_reference",
  INHERITANCE = "inheritance",
  IMPLEMENTATION = "implementation",
  JSX_COMPONENT = "jsx_component",
  JSX_PROP = "jsx_prop",
  SPREAD = "spread",
  ASSIGNMENT = "assignment",
  RETURN_VALUE = "return_value",
  ARGUMENT = "argument",
  TEST = "test",
  // Next.js specific
  NEXTJS_SERVER_COMPONENT = "nextjs_server_component",
  NEXTJS_CLIENT_COMPONENT = "nextjs_client_component",
  NEXTJS_SERVER_ACTION = "nextjs_server_action",
  NEXTJS_METADATA = "nextjs_metadata",
  NEXTJS_ROUTE_HANDLER = "nextjs_route_handler",
  NEXTJS_MIDDLEWARE = "nextjs_middleware",
  NEXTJS_LAYOUT = "nextjs_layout",
  NEXTJS_PAGE = "nextjs_page",
  NEXTJS_LOADING = "nextjs_loading",
  NEXTJS_ERROR = "nextjs_error",
  TEMPLATE_REF = "template_reference",
  UNKNOWN = "unknown",
}

export interface Definition {
  file: string;
  line: number;
  column: number;
  text: string;
  kind: string;
  exported: boolean;
  members?: string[];
}

export interface Usage {
  file: string;
  line: number;
  column: number;
  usageType: UsageType;
  context: string;
  parentContext?: string;
  destructuredAs?: string[];
  confidence: number;
  fileType?: "ts" | "tsx" | "js" | "jsx";
  framework?: "nextjs" | "react";
  fileRole?: "page" | "layout" | "server" | "action" | "middleware" | "hook" | "component" | "route" | "loading" | "error" | "template";
  isServerComponent?: boolean;
  isClientComponent?: boolean;
  hasServerAction?: boolean;
}

export interface ImportInfo {
  file: string;
  line: number;
  importPath: string;
  isTypeOnly: boolean;
  isDefault: boolean;
  alias?: string;
}

export interface TransitiveDep {
  file: string;
  symbol: string;
  path: string[];
  depth: number;
}

export interface DestructuredProperty {
  property: string;
  usages: Array<{
    file: string;
    line: number;
    usageType: UsageType;
    context: string;
  }>;
}

export interface UsageReport {
  target: string;
  targetType: string;
  language: string;
  analyzedAt: string;
  analysisTimeMs: number;

  definition: Definition | null;
  directUsages: Usage[];
  imports: ImportInfo[];

  destructuredProperties: DestructuredProperty[];
  transitiveDeps: TransitiveDep[];

  affectedFiles: Array<{
    file: string;
    directUsages: number;
    transitiveUsages: number;
    isTest: boolean;
    fileType: string;
  }>;

  summary: {
    totalReferences: number;
    totalFiles: number;
    totalTestFiles: number;
    byUsageType: Record<string, number>;
    byFile: Record<string, number>;
    byFileType: Record<string, number>;
    destructuredPropsUsed: string[];
    riskScore: number;
    riskLevel: "critical" | "high" | "medium" | "low";
  };
}

// ============================================
// Framework Detection
// ============================================

interface FrameworkInfo {
  framework: "nextjs" | "react" | "unknown";
  fileRole?: "page" | "layout" | "server" | "action" | "middleware" | "hook" | "component" | "route" | "loading" | "error" | "template";
  isServerComponent?: boolean;
  isClientComponent?: boolean;
  hasServerAction?: boolean;
}

function detectFrameworkInfo(filePath: string, content?: string): FrameworkInfo {
  const fileName = path.basename(filePath);
  const fileContent = content || (fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "");

  // Next.js App Router detection
  const isNextAppRouter = filePath.includes("/app/") || filePath.includes("\\app\\");

  if (isNextAppRouter && /\.(tsx?|jsx?)$/.test(filePath)) {
    const hasUseClient = fileContent.includes("'use client'") || fileContent.includes('"use client"');
    const hasUseServer = fileContent.includes("'use server'") || fileContent.includes('"use server"');

    let fileRole: FrameworkInfo["fileRole"] = "component";

    if (fileName === "page.tsx" || fileName === "page.jsx" || fileName === "page.ts" || fileName === "page.js") {
      fileRole = "page";
    } else if (fileName === "layout.tsx" || fileName === "layout.jsx" || fileName === "layout.ts" || fileName === "layout.js") {
      fileRole = "layout";
    } else if (fileName === "loading.tsx" || fileName === "loading.jsx") {
      fileRole = "loading";
    } else if (fileName === "error.tsx" || fileName === "error.jsx") {
      fileRole = "error";
    } else if (fileName === "template.tsx" || fileName === "template.jsx") {
      fileRole = "template";
    } else if (fileName === "route.ts" || fileName === "route.js") {
      fileRole = "route";
    } else if (fileName === "middleware.ts" || fileName === "middleware.js") {
      fileRole = "middleware";
    } else if (fileName.includes("action") || hasUseServer) {
      fileRole = "action";
    }

    return {
      framework: "nextjs",
      fileRole,
      isClientComponent: hasUseClient,
      isServerComponent: !hasUseClient && (fileRole === "page" || fileRole === "layout"),
      hasServerAction: hasUseServer,
    };
  }

  // Next.js middleware (root level)
  if (fileName === "middleware.ts" || fileName === "middleware.js") {
    return { framework: "nextjs", fileRole: "middleware" };
  }

  // React detection (TSX/JSX with React imports or hooks)
  if (/\.(tsx|jsx)$/.test(filePath)) {
    if (fileContent.includes("from 'react'") ||
        fileContent.includes('from "react"') ||
        fileContent.includes("useState") ||
        fileContent.includes("useEffect")) {
      return { framework: "react", fileRole: "component" };
    }
  }

  return { framework: "unknown" };
}

// ============================================
// Utilities
// ============================================

function isTestFile(filePath: string): boolean {
  return (
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath) ||
    filePath.includes("__tests__") ||
    filePath.includes("__mocks__") ||
    /\/tests?\//.test(filePath)
  );
}

function getFileType(filePath: string): "ts" | "tsx" | "js" | "jsx" | "other" {
  if (filePath.endsWith(".tsx")) return "tsx";
  if (filePath.endsWith(".ts")) return "ts";
  if (filePath.endsWith(".jsx")) return "jsx";
  if (filePath.endsWith(".js")) return "js";
  return "other";
}

function getParentContext(node: Node): string | undefined {
  let current = node.getParent();
  while (current) {
    if (Node.isFunctionDeclaration(current)) {
      return `function ${current.getName() || "anonymous"}`;
    }
    if (Node.isArrowFunction(current) || Node.isFunctionExpression(current)) {
      const parent = current.getParent();
      if (Node.isVariableDeclaration(parent)) {
        return `const ${parent.getName()}`;
      }
      return "arrow function";
    }
    if (Node.isMethodDeclaration(current)) {
      return `method ${current.getName()}`;
    }
    if (Node.isClassDeclaration(current)) {
      return `class ${current.getName() || "anonymous"}`;
    }
    current = current.getParent();
  }
  return undefined;
}

function classifyReference(node: Node, filePath: string): UsageType {
  const parent = node.getParent();
  if (!parent) return UsageType.UNKNOWN;

  if (Node.isImportSpecifier(node) || Node.isImportClause(node) ||
      node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration)) {
    const importDecl = node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
    if (importDecl?.isTypeOnly()) return UsageType.IMPORT_TYPE;
    if (Node.isImportSpecifier(node) && node.isTypeOnly()) return UsageType.IMPORT_TYPE;
    return UsageType.IMPORT;
  }

  if (Node.isExportSpecifier(node) ||
      node.getFirstAncestorByKind(SyntaxKind.ExportDeclaration)) {
    return UsageType.RE_EXPORT;
  }

  if (Node.isCallExpression(parent)) {
    const expr = parent.getExpression();
    if (expr === node || (Node.isIdentifier(expr) && expr.getText() === node.getText())) {
      if (isTestFile(filePath)) return UsageType.TEST;
      if (node.getText().startsWith("use")) return UsageType.HOOK_CALL;
      return UsageType.DIRECT_CALL;
    }
    return UsageType.ARGUMENT;
  }

  if (Node.isPropertyAccessExpression(parent)) {
    const grandParent = parent.getParent();
    if (Node.isCallExpression(grandParent)) {
      if (grandParent.getExpression() === parent) {
        if (isTestFile(filePath)) return UsageType.TEST;
        return UsageType.DIRECT_CALL;
      }
    }
    return UsageType.PROPERTY_ACCESS;
  }

  if (Node.isBindingElement(node) ||
      node.getFirstAncestorByKind(SyntaxKind.ObjectBindingPattern)) {
    return UsageType.DESTRUCTURE;
  }

  if (Node.isJsxOpeningElement(parent) || Node.isJsxSelfClosingElement(parent)) {
    return UsageType.JSX_COMPONENT;
  }

  if (Node.isTypeReference(parent) || Node.isTypeQuery(parent)) {
    return UsageType.TYPE_REFERENCE;
  }

  if (Node.isExpressionWithTypeArguments(parent)) {
    const heritage = parent.getParent();
    if (Node.isHeritageClause(heritage)) {
      if (heritage.getToken() === SyntaxKind.ExtendsKeyword) return UsageType.INHERITANCE;
      if (heritage.getToken() === SyntaxKind.ImplementsKeyword) return UsageType.IMPLEMENTATION;
    }
  }

  if (Node.isVariableDeclaration(parent)) {
    return UsageType.ASSIGNMENT;
  }

  if (Node.isReturnStatement(parent)) {
    return UsageType.RETURN_VALUE;
  }

  if (isTestFile(filePath)) return UsageType.TEST;

  return UsageType.UNKNOWN;
}

function getRiskScore(usageType: UsageType): number {
  switch (usageType) {
    case UsageType.DIRECT_CALL:
    case UsageType.HOOK_CALL:
    case UsageType.NEXTJS_SERVER_ACTION:
    case UsageType.NEXTJS_ROUTE_HANDLER:
      return 10;
    case UsageType.CALLBACK:
    case UsageType.INHERITANCE:
    case UsageType.IMPLEMENTATION:
    case UsageType.JSX_COMPONENT:
    case UsageType.NEXTJS_SERVER_COMPONENT:
    case UsageType.NEXTJS_CLIENT_COMPONENT:
    case UsageType.NEXTJS_PAGE:
    case UsageType.NEXTJS_LAYOUT:
      return 8;
    case UsageType.DESTRUCTURE:
    case UsageType.PROPERTY_ACCESS:
    case UsageType.TEMPLATE_REF:
    case UsageType.NEXTJS_METADATA:
    case UsageType.NEXTJS_MIDDLEWARE:
      return 6;
    case UsageType.IMPORT:
    case UsageType.RE_EXPORT:
    case UsageType.ASSIGNMENT:
    case UsageType.NEXTJS_LOADING:
    case UsageType.NEXTJS_ERROR:
      return 4;
    case UsageType.IMPORT_TYPE:
    case UsageType.TYPE_REFERENCE:
      return 2;
    case UsageType.TEST:
      return 1;
    default:
      return 3;
  }
}

// ============================================
// Main Analyzer
// ============================================

class ReactAnalyzer {
  private project: Project;
  private maxTransitiveDepth: number;

  constructor(codebasePath: string, options: { maxDepth?: number; tsconfig?: string; singleFile?: boolean } = {}) {
    this.maxTransitiveDepth = options.maxDepth ?? 3;

    const isSingleFile = options.singleFile || (fs.existsSync(codebasePath) && fs.statSync(codebasePath).isFile());
    const basePath = isSingleFile ? path.dirname(codebasePath) : codebasePath;

    const tsConfigPath = options.tsconfig || this.findTsConfig(basePath);

    this.project = new Project({
      tsConfigFilePath: tsConfigPath,
      skipAddingFilesFromTsConfig: true,
    });

    if (isSingleFile) {
      if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(codebasePath)) {
        this.project.addSourceFileAtPath(codebasePath);
      }
    } else {
      this.project.addSourceFilesAtPaths([
        path.join(codebasePath, "**/*.ts"),
        path.join(codebasePath, "**/*.tsx"),
        path.join(codebasePath, "**/*.js"),
        path.join(codebasePath, "**/*.jsx"),
        "!" + path.join(codebasePath, "**/node_modules/**"),
      ]);
    }
  }

  private findTsConfig(codebasePath: string): string | undefined {
    const candidates = [
      path.join(codebasePath, "tsconfig.json"),
      path.join(path.dirname(codebasePath), "tsconfig.json"),
      path.join(process.cwd(), "tsconfig.json"),
    ];
    return candidates.find(p => fs.existsSync(p));
  }

  analyze(targetName: string): UsageReport {
    const startTime = Date.now();

    const definition = this.findDefinition(targetName);
    const { usages, imports } = this.findAllReferences(targetName, definition);
    const destructuredProperties = this.trackDestructuredProperties(targetName, usages);
    const transitiveDeps = this.findTransitiveDependencies(targetName, usages);
    const affectedFiles = this.compileAffectedFiles(usages, transitiveDeps);
    const summary = this.calculateSummary(usages, destructuredProperties, affectedFiles);

    return {
      target: targetName,
      targetType: definition?.kind || "unknown",
      language: "typescript",
      analyzedAt: new Date().toISOString(),
      analysisTimeMs: Date.now() - startTime,
      definition,
      directUsages: usages,
      imports,
      destructuredProperties,
      transitiveDeps,
      affectedFiles,
      summary,
    };
  }

  private findDefinition(targetName: string): Definition | null {
    for (const sourceFile of this.project.getSourceFiles()) {
      const filePath = sourceFile.getFilePath();
      if (filePath.includes("node_modules")) continue;

      const candidates = [
        ...sourceFile.getFunctions().filter(f => f.getName() === targetName),
        ...sourceFile.getClasses().filter(c => c.getName() === targetName),
        ...sourceFile.getInterfaces().filter(i => i.getName() === targetName),
        ...sourceFile.getTypeAliases().filter(t => t.getName() === targetName),
        ...sourceFile.getEnums().filter(e => e.getName() === targetName),
        ...sourceFile.getVariableDeclarations().filter(v => v.getName() === targetName),
      ];

      if (candidates.length > 0) {
        const decl = candidates[0]!;

        let kind = "unknown";

        if (Node.isFunctionDeclaration(decl)) kind = "function";
        else if (Node.isClassDeclaration(decl)) kind = "class";
        else if (Node.isInterfaceDeclaration(decl)) kind = "interface";
        else if (Node.isTypeAliasDeclaration(decl)) kind = "type";
        else if (Node.isEnumDeclaration(decl)) kind = "enum";
        else if (Node.isVariableDeclaration(decl)) {
          const init = decl.getInitializer();
          if (init) {
            if (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) {
              kind = /^[A-Z]/.test(targetName) ? "component" : "function";
            } else if (Node.isCallExpression(init)) {
              const callText = init.getExpression().getText();
              if (callText.includes("create")) {
                kind = "store";
              } else if (callText.includes("forwardRef") || callText.includes("memo")) {
                kind = "component";
              } else {
                kind = "variable";
              }
            } else {
              kind = "variable";
            }
          }
        }

        const exported = Node.isExportable(decl) ? decl.isExported() : false;

        return {
          file: filePath,
          line: decl.getStartLineNumber(),
          column: decl.getStart() - decl.getStartLinePos(),
          text: decl.getText().split("\n")[0]?.slice(0, 100) || "",
          kind,
          exported,
        };
      }
    }
    return null;
  }

  private findAllReferences(
    targetName: string,
    definition: Definition | null
  ): { usages: Usage[]; imports: ImportInfo[] } {
    const usages: Usage[] = [];
    const imports: ImportInfo[] = [];
    const seen = new Set<string>();

    for (const sourceFile of this.project.getSourceFiles()) {
      const filePath = sourceFile.getFilePath();
      if (filePath.includes("node_modules")) continue;

      sourceFile.forEachDescendant((node) => {
        if (!Node.isIdentifier(node)) return;
        if (node.getText() !== targetName) return;

        const line = node.getStartLineNumber();
        const col = node.getStart() - node.getStartLinePos();
        const key = `${filePath}:${line}:${col}`;

        if (seen.has(key)) return;
        seen.add(key);

        if (definition && filePath === definition.file && line === definition.line) {
          return;
        }

        const usageType = classifyReference(node, filePath);
        const lineText = sourceFile.getFullText().split("\n")[node.getStartLineNumber() - 1] || "";

        let destructuredAs: string[] | undefined;
        const varDecl = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
        if (varDecl) {
          const nameNode = varDecl.getNameNode();
          if (Node.isObjectBindingPattern(nameNode)) {
            destructuredAs = nameNode.getElements().map(e => {
              if (Node.isBindingElement(e)) {
                const name = e.getNameNode();
                if (Node.isIdentifier(name)) return name.getText();
              }
              return "";
            }).filter(Boolean);
          }
        }

        if (usageType === UsageType.IMPORT || usageType === UsageType.IMPORT_TYPE) {
          const importDecl = node.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
          if (importDecl) {
            imports.push({
              file: filePath,
              line,
              importPath: importDecl.getModuleSpecifierValue(),
              isTypeOnly: usageType === UsageType.IMPORT_TYPE,
              isDefault: !!importDecl.getDefaultImport(),
            });
          }
        }

        const frameworkInfo = detectFrameworkInfo(filePath, sourceFile.getFullText());
        const ft = getFileType(filePath);

        const usage: Usage = {
          file: filePath,
          line,
          column: col,
          usageType,
          context: lineText.trim(),
          parentContext: getParentContext(node),
          destructuredAs,
          confidence: usageType === UsageType.UNKNOWN ? 0.5 : 0.95,
          fileType: ft !== "other" ? ft : undefined,
          framework: frameworkInfo.framework !== "unknown" ? frameworkInfo.framework : undefined,
          fileRole: frameworkInfo.fileRole,
        };

        if (frameworkInfo.framework === "nextjs") {
          if (frameworkInfo.isServerComponent) usage.isServerComponent = true;
          if (frameworkInfo.isClientComponent) usage.isClientComponent = true;
          if (frameworkInfo.hasServerAction) usage.hasServerAction = true;
        }

        usages.push(usage);
      });
    }

    return { usages, imports };
  }

  private trackDestructuredProperties(
    targetName: string,
    usages: Usage[]
  ): DestructuredProperty[] {
    const propMap = new Map<string, DestructuredProperty["usages"]>();

    for (const usage of usages) {
      if (usage.destructuredAs) {
        for (const prop of usage.destructuredAs) {
          if (!propMap.has(prop)) {
            propMap.set(prop, []);
          }
        }
      }
    }

    return Array.from(propMap.entries()).map(([property, usages]) => ({
      property,
      usages: usages.slice(0, 20),
    }));
  }

  private findTransitiveDependencies(
    targetName: string,
    directUsages: Usage[]
  ): TransitiveDep[] {
    const transitives: TransitiveDep[] = [];
    const directFiles = new Set(directUsages.map(u => u.file));
    const visited = new Set<string>();

    const findExportsFromFile = (filePath: string): string[] => {
      const sourceFile = this.project.getSourceFile(filePath);
      if (!sourceFile) return [];

      const exports: string[] = [];

      for (const fn of sourceFile.getFunctions()) {
        if (fn.isExported()) {
          const name = fn.getName();
          if (name) exports.push(name);
        }
      }

      for (const stmt of sourceFile.getVariableStatements()) {
        if (stmt.isExported()) {
          for (const decl of stmt.getDeclarations()) {
            exports.push(decl.getName());
          }
        }
      }

      return exports;
    };

    for (const file of directFiles) {
      if (visited.has(file)) continue;
      visited.add(file);

      const exports = findExportsFromFile(file);

      for (const exp of exports) {
        for (const sourceFile of this.project.getSourceFiles()) {
          if (sourceFile.getFilePath().includes("node_modules")) continue;

          const sfPath = sourceFile.getFilePath();
          if (directFiles.has(sfPath)) continue;

          sourceFile.forEachDescendant((node) => {
            if (!Node.isIdentifier(node)) return;
            if (node.getText() !== exp) return;

            const usageType = classifyReference(node, sfPath);
            if (usageType === UsageType.DIRECT_CALL ||
                usageType === UsageType.HOOK_CALL ||
                usageType === UsageType.JSX_COMPONENT) {

              transitives.push({
                file: sfPath,
                symbol: exp,
                path: [targetName, file, `[${exp}]`],
                depth: 2,
              });
            }
          });
        }
      }
    }

    const seen = new Set<string>();
    return transitives.filter(t => {
      const key = `${t.file}:${t.symbol}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private compileAffectedFiles(
    usages: Usage[],
    transitives: TransitiveDep[]
  ): UsageReport["affectedFiles"] {
    const fileMap = new Map<string, { direct: number; transitive: number; fileType: string }>();

    for (const usage of usages) {
      if (!fileMap.has(usage.file)) {
        fileMap.set(usage.file, { direct: 0, transitive: 0, fileType: usage.fileType || "ts" });
      }
      fileMap.get(usage.file)!.direct++;
    }

    for (const trans of transitives) {
      if (!fileMap.has(trans.file)) {
        const ft = getFileType(trans.file);
        fileMap.set(trans.file, { direct: 0, transitive: 0, fileType: ft !== "other" ? ft : "ts" });
      }
      fileMap.get(trans.file)!.transitive++;
    }

    return Array.from(fileMap.entries())
      .map(([file, counts]) => ({
        file,
        directUsages: counts.direct,
        transitiveUsages: counts.transitive,
        isTest: isTestFile(file),
        fileType: counts.fileType,
      }))
      .sort((a, b) => (b.directUsages + b.transitiveUsages) - (a.directUsages + a.transitiveUsages));
  }

  private calculateSummary(
    usages: Usage[],
    destructured: DestructuredProperty[],
    affectedFiles: UsageReport["affectedFiles"]
  ): UsageReport["summary"] {
    const byUsageType: Record<string, number> = {};
    const byFile: Record<string, number> = {};
    const byFileType: Record<string, number> = {};
    let totalRisk = 0;

    for (const usage of usages) {
      byUsageType[usage.usageType] = (byUsageType[usage.usageType] || 0) + 1;
      byFile[usage.file] = (byFile[usage.file] || 0) + 1;
      byFileType[usage.fileType || "ts"] = (byFileType[usage.fileType || "ts"] || 0) + 1;
      totalRisk += getRiskScore(usage.usageType);
    }

    const totalFiles = affectedFiles.length;
    const testFiles = affectedFiles.filter(f => f.isTest).length;
    const nonTestFiles = totalFiles - testFiles;

    const avgRisk = usages.length > 0 ? totalRisk / usages.length : 0;
    const riskScore = Math.min(100, Math.round(
      (avgRisk * 5) + (nonTestFiles * 2) + (usages.length * 0.5)
    ));

    let riskLevel: "critical" | "high" | "medium" | "low";
    if (riskScore >= 70 || nonTestFiles >= 20) riskLevel = "critical";
    else if (riskScore >= 50 || nonTestFiles >= 10) riskLevel = "high";
    else if (riskScore >= 25 || nonTestFiles >= 5) riskLevel = "medium";
    else riskLevel = "low";

    return {
      totalReferences: usages.length,
      totalFiles,
      totalTestFiles: testFiles,
      byUsageType,
      byFile,
      byFileType,
      destructuredPropsUsed: destructured.map(d => d.property),
      riskScore,
      riskLevel,
    };
  }
}

// ============================================
// CLI
// ============================================

function printHelp() {
  console.log(`
React Symbol Usage Analyzer v1.0

Usage: npx tsx analyze.ts <target> <path> [options]

Arguments:
  target      Symbol name to analyze
  path        Path to codebase directory OR single file

Options:
  --depth     Max transitive dependency depth (default: 3)
  --tsconfig  Path to tsconfig.json (auto-detected)
  --output    Output file path (default: stdout)
  --pretty    Pretty print JSON
  --help      Show help

Supported:
  - TypeScript/JavaScript (.ts, .tsx, .js, .jsx)
  - React (hooks, JSX, forwardRef, memo)
  - Next.js 13-16 (App Router, RSC, Server Actions, Middleware)

Next.js App Router:
  - Server/Client Components detection
  - Server Actions ('use server')
  - Route handlers (GET, POST, etc.)
  - generateMetadata, generateStaticParams

Examples:
  npx tsx analyze.ts useAuth ./src --pretty
  npx tsx analyze.ts fetchData ./app --pretty
  npx tsx analyze.ts Button ./src/components/Button.tsx --pretty
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length < 2) {
    printHelp();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const target = args[0]!;
  const codebase = args[1]!;

  let maxDepth = 3;
  let tsconfig: string | undefined;
  let outputPath: string | null = null;
  let pretty = false;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--depth" && args[i + 1]) {
      maxDepth = parseInt(args[++i]!, 10) || 3;
    } else if (args[i] === "--tsconfig" && args[i + 1]) {
      tsconfig = args[++i];
    } else if (args[i] === "--output" && args[i + 1]) {
      outputPath = args[++i] ?? null;
    } else if (args[i] === "--pretty") {
      pretty = true;
    }
  }

  try {
    const analyzer = new ReactAnalyzer(path.resolve(codebase), { maxDepth, tsconfig });
    const report = analyzer.analyze(target);

    const output = pretty ? JSON.stringify(report, null, 2) : JSON.stringify(report);

    if (outputPath) {
      fs.writeFileSync(outputPath, output);
      console.error(`Report written to: ${outputPath}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    process.exit(1);
  }
}

main();
