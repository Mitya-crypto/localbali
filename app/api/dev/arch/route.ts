import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export const runtime = "nodejs";

const APPDIR = path.resolve("app");
const APIDIR = path.join(APPDIR, "api");

const isRouteGroup = (name: string) => /^\(.*\)$/.test(name);
const isPageFile = (n: string) => /^page\.(tsx|ts|jsx|js)$/.test(n);
const isRouteFile = (n: string) => /^route\.(ts|js)$/.test(n);

function walkPages(dir: string, rel: string[] = [], acc: string[] = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasPage = entries.some(e => e.isFile() && isPageFile(e.name));
  if (hasPage) {
    const segs = rel.filter(s => !isRouteGroup(s));
    let route = "/" + segs.join("/");
    route = route.replace(/\/+/g,'/');
    if (route === "//") route = "/";
    acc.push(route);
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (["api","node_modules",".next"].includes(e.name)) continue;
    walkPages(path.join(dir, e.name), rel.concat(e.name), acc);
  }
  return acc;
}

function walkApis(dir: string, rel: string[] = [], acc: string[] = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasRoute = entries.some(e => e.isFile() && isRouteFile(e.name));
  if (hasRoute) acc.push(("/api/" + rel.join("/")).replace(/\/+/g,'/'));
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    walkApis(path.join(dir, e.name), rel.concat(e.name), acc);
  }
  return acc;
}

function asciiTree(rootDir: string, maxDepth = 3) {
  function rec(dir: string, prefix = "", depth = 0): string[] {
    if (depth > maxDepth) return [];
    let out: string[] = [];
    const names = fs.readdirSync(dir).filter(n => !["node_modules",".next",".git"].includes(n)).sort();
    const last = names.length - 1;
    names.forEach((name, i) => {
      const full = path.join(dir, name);
      const isDir = fs.existsSync(full) && fs.statSync(full).isDirectory();
      const branch = (i === last) ? "└─ " : "├─ ";
      out.push(prefix + branch + name);
      if (isDir) {
        const ext = (i === last) ? "   " : "│  ";
        out = out.concat(rec(full, prefix + ext, depth + 1));
      }
    });
    return out;
  }
  return [path.basename(rootDir)].concat(rec(rootDir)).join("\n");
}

const mId = (s: string) => (s.replace(/[^\w]/g,'_') || "root");

function buildMermaid(routes: string[], apis: string[]) {
  const lines: string[] = [];
  lines.push("flowchart TD");
  const trio = ["/verify","/pin","/home"];
  trio.forEach(r => lines.push(`  ${mId(r)}["${r}"]`));
  lines.push(`  ${mId("/verify")} --> ${mId("/pin")}`);
  lines.push(`  ${mId("/pin")} --> ${mId("/home")}`);
  const children = routes.filter(r => !["/","/verify","/pin","/home"].includes(r));
  Array.from(new Set(children)).sort().forEach(r => {
    lines.push(`  ${mId(r)}["${r}"]`);
    lines.push(`  ${mId("/home")} --> ${mId(r)}`);
  });
  lines.push("  subgraph APIs");
  Array.from(new Set(apis)).sort().forEach(a => lines.push(`    ${mId(a)}["${a}"]`));
  lines.push("  end");
  return "```mermaid\n" + lines.join("\n") + "\n```";
}

export async function GET() {
  const routes = Array.from(new Set(walkPages(APPDIR))).sort();
  const apis   = Array.from(new Set(walkApis(APIDIR))).sort();
  const tree   = asciiTree(path.resolve("."), 3);
  const mermaid = buildMermaid(routes, apis);
  return NextResponse.json({ routes, apis, tree, mermaid });
}
