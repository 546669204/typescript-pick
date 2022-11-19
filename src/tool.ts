import type { RefType } from "./index.d"

export function pick<T>(data: T): T;
export function pick<T>(data: T, refType?: Record<string, RefType>, refId?: string): T;
export function pick<T>(data: T, refType?: Record<string, RefType>, refId?: string): T {
  if (!refId) return data;
  const type = refType[refId];
  if (type?.keys) {
    return type?.keys?.reduce((a, v, i) => ({ ...a, [v]: pick(data[v], refType, type[i]) }), {} as T)
  }
  if (type?.array && typeof data == "object" && Array.isArray(data)) {
    return (data as unknown as any[]).map(v => (pick(v, refType, type.array))) as unknown as T
  }
  return data as T;
}
