import { Request } from "express";

export interface PublicRequestContext {
  host: string | null;
  protocol: "http" | "https";
  path: string;
  search: string;
}

export function getPublicRequestContext(request: Request): PublicRequestContext {
  return {
    host: readHeader(request, "x-site-host") ?? readHeader(request, "x-forwarded-host") ?? request.hostname ?? null,
    protocol: resolveProtocol(request),
    path: request.path,
    search: request.url.includes("?") ? `?${request.url.split("?").slice(1).join("?")}` : "",
  };
}

function resolveProtocol(request: Request): "http" | "https" {
  const requested =
    readHeader(request, "x-site-protocol") ??
    readHeader(request, "x-forwarded-proto") ??
    request.protocol;

  return requested === "http" ? "http" : "https";
}

function readHeader(request: Request, key: string) {
  const value = request.headers[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}
