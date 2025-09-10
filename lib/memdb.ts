export type Mem = { links: Map<string,string>; levels: Map<string,number>; };
const g = globalThis as any;
if(!g.__MEMDB__) g.__MEMDB__ = { links:new Map(), levels:new Map() } as Mem;
export const memdb: Mem = g.__MEMDB__;
