import ts from "typescript";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const sourceRoot = resolve(process.argv[2] || "D:/Next/chetahNova");
const targets = [
  ["page", "app/page.tsx"],
  ["hero", "components/static/Home/Herosection.tsx"],
  ["aiSolutions", "components/static/Home/ai-solutions/AISolutions.tsx"],
  ["consultation", "components/forms/LeadsForm.tsx"],
  ["process", "components/static/Home/process-section/ProcessSection.tsx"],
  ["faq", "components/global/FAQSection.tsx"],
  ["contact", "components/static/Home/ContactSection.tsx"],
];
const wanted = new Set(["metadata", "servicesSchema", "myFaqs", "defaultConfig", "defaultSteps", "defaultContactInfo", "defaultSocialLinks", "serviceOptions", "budgetOptions", "industryOptions", "SERVICE_OPTIONS", "BUSINESS_SIZE_OPTIONS"]);
const references = [];
function value(node, file) {
  if (!node) return null;
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return value(node.expression, file);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(item => value(item, file));
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).filter(item => item.name.getText(file) !== "icon").map(item => [item.name.getText(file).replace(/^["']|["']$/g, ""), value(item.initializer, file)]));
  return { reference: node.getText(file) };
}
const components = {};
let sectionOrder = [];
for (const [key, path] of targets) {
  const text = await readFile(join(sourceRoot, path), "utf8");
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const entry = { file: path, sha256: createHash("sha256").update(text).digest("hex"), data: {}, text: [], attributes: [], propDefaults: {} };
  function visit(node) {
    if (ts.isVariableDeclaration(node) && wanted.has(node.name.getText(file))) entry.data[node.name.getText(file)] = value(node.initializer, file);
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && ["headline", "title", "description", "subheadline", "contactText", "contactHref", "label", "placeholder"].includes(node.name.getText(file))) entry.attributes.push({ name: node.name.getText(file), value: node.initializer.text });
    if (ts.isJsxText(node) && node.text.trim()) entry.text.push(node.text.replace(/\s+/g, " ").trim());
    if (ts.isBindingElement(node) && node.initializer && ts.isStringLiteral(node.initializer)) entry.propDefaults[node.name.getText(file)] = node.initializer.text;
    if (key === "page" && (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))) {
      const tag = node.tagName.getText(file);
      if (["HeroSection", "AISolutions", "LeadsForm", "ProcessSection", "FAQSection", "ContactSection"].includes(tag)) sectionOrder.push(tag);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  entry.text = [...new Set(entry.text)];
  components[key] = entry;
  references.push(path);
}
const result = {
  sourceProject: "chetahNova", locale: "en", route: "/", extractedAt: new Date().toISOString(),
  extraction: "Read-only TypeScript AST; no source project code is executed.",
  sectionOrder, components,
  excludedFromHomepage: ["Services (commented out)", "PortfolioSection (commented out)", "TestimonialsSection (commented out)"],
  adaptationRules: ["Use TopLinkSho identity and contact information.", "Localize and shorten copy without ranking guarantees.", "Do not publish unverified numerical claims or delivery/response-time promises.", "Reuse one real consultation form instead of duplicating contact forms."],
};
await mkdir("content/source", { recursive: true });
await writeFile("content/source/cheetahnova-home.en.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ file: "content/source/cheetahnova-home.en.json", sectionOrder, files: references.length }));
