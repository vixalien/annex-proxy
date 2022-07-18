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
  const path = new URL(req.url).pathname;
  const proxyRes = await fetch(API_URL + path, {
    headers: {
      Origin: API_URL,
    }
  });
  const headers = new Headers();
  copyHeader("content-length", headers, proxyRes.headers);
  copyHeader("content-type", headers, proxyRes.headers);
  copyHeader("content-disposition", headers, proxyRes.headers);
  return new Response(proxyRes.body, {
    status: proxyRes.status,
    headers,
  });
}
serve(reqHandler, { port: 8100 });
