// https://medium.com/deno-the-complete-reference/deno-by-example-proxy-file-server-41ea7ae00ce6

import { serve } from "https://deno.land/std@0.148.0/http/mod.ts";

const API_URL = "https://extensions.gnome.org/";

function copyHeader(headerName: string, to: Headers, from: Headers) {
  const hdrVal = from.get(headerName);
  if (hdrVal) {
    to.set(headerName, hdrVal);
  }
}

async function reqHandler(req: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Methods", "GET");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // checking for cors (to limit my billing)
  const origin = req.headers.get("Origin");
  if (origin && (origin.includes("annex.deno.dev") || origin.includes("annex.vixalien.com"))) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  const url = new URL(req.url);
  const path = url.pathname + url.search;
  const normalized = new URL(path, API_URL).href;

  const proxyRes = await fetch(normalized, {
    headers: {
      Origin: API_URL,
    }
  });

  copyHeader("content-length", headers, proxyRes.headers);
  copyHeader("content-type", headers, proxyRes.headers);
  copyHeader("content-disposition", headers, proxyRes.headers);

  //

  return new Response(proxyRes.body, {
    status: proxyRes.status,
    headers,
  });
}
serve(reqHandler, { port: 8100 });
