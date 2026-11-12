import ts from "typescript";
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, relative, resolve, dirname } from "node:path";
import { createHash } from "node:crypto";
const root=resolve(process.argv[2] || "D:/Next/chetahNova");
const navPath="components/global/navbar/navbar.tsx";
function parse(node,file){
 if(!node)return null;
 if(ts.isAsExpression(node)||ts.isSatisfiesExpression(node)||ts.isParenthesizedExpression(node))return parse(node.expression,file);
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
 if(ts.isNumericLiteral(node))return Number(node.text);
 if(ts.isArrayLiteralExpression(node))return node.elements.map(item=>parse(item,file));
 if(ts.isObjectLiteralExpression(node))return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).filter(item=>item.name.getText(file)!=="icon").map(item=>[item.name.getText(file).replace(/^["']|["']$/g,""),parse(item.initializer,file)]));
 return {reference:node.getText(file)};
}
async function extract(path){
 const text=await readFile(join(root,path),"utf8");const file=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const data={file:path,sha256:createHash("sha256").update(text).digest("hex"),constants:{},headings:[],copy:[],imports:[]};
 function visit(node){
  if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer){
   const val=node.initializer;
   if(ts.isStringLiteral(val)||ts.isArrayLiteralExpression(val)||ts.isObjectLiteralExpression(val))if(!/^(Icons|colors|COLORS|COLOR_MAP)$/.test(node.name.text))data.constants[node.name.text]=parse(val,file);
  }
  if(ts.isJsxText(node)&&node.text.trim())data.copy.push(node.text.replace(/\s+/g," ").trim());
  if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)&&["title","headline","description","subheadline","label"].includes(node.name.getText(file)))data.headings.push({name:node.name.getText(file),text:node.initializer.text});
  if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)){const p=node.moduleSpecifier.text;if(p.startsWith("@/components/")||p.startsWith("@/lib/"))data.imports.push(p);}
  ts.forEachChild(node,visit);
 }
 visit(file);data.copy=[...new Set(data.copy)];return data;
}
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(x=>x.isDirectory()?walk(join(dir,x.name)):[join(dir,x.name)]))).flat();}
const nav=await extract(navPath);const files=await walk(join(root,"app/services"));
const mains=["app/about/page.tsx","app/contact/page.tsx","app/pricing/page.tsx","app/blog/page.tsx","app/live-case-studies/page.tsx","app/live-case-studies/success-van-hire/page.tsx","app/live-case-studies/real-estate/page.tsx"];
const sourceFiles=[...files.filter(p=>p.endsWith("/page.tsx")||p.endsWith("\\page.tsx")).map(p=>relative(root,p).replaceAll("\\","/")),...mains];
const pages=[];const components={};
for(const path of sourceFiles.sort()){
 const data=await extract(path);data.route="/"+dirname(path).replace(/^app\/?/,"");pages.push(data);
 for(const name of data.imports){
  const candidate=name.slice(2);for(const ext of [".tsx",".ts"]){try{const linked=await extract(candidate+ext);if(!components[linked.file])components[linked.file]=linked;break;}catch(error){if(error.code!=="ENOENT")throw error;}}
 }
}
const output={sourceProject:"chetahNova",extractedAt:new Date().toISOString(),mode:"read-only AST, no source code execution",navigation:nav.constants.defaultConfig,pages,components:Object.values(components)};
await mkdir("content/source",{recursive:true});
await writeFile("content/source/cheetahnova-site.en.json",JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify({pages:pages.length,servicePages:pages.filter(page=>page.route.startsWith("/services")).length,sourceComponents:Object.keys(components).length,navigation:output.navigation.items.map(item=>({label:item.label,href:item.href})),json:"content/source/cheetahnova-site.en.json"}));
