/** RU-only: всегда отдаём переданный fallback (русский). */
export function tr(_ns: string, _key: string, fallback?: string){
  return (fallback ?? _key);
}
