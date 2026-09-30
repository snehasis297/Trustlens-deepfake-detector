package com.trustlens.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    private static final String PORTAL_HTML = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TrustLens Gateway — Spring Boot Core</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <meta http-equiv="refresh" content="2;url=http://localhost:3000">
        </head>
        <body class="bg-[#0b0f17] text-slate-100 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20 text-white font-extrabold text-2xl">
              TL
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">TrustLens Gateway</h1>
              <p class="text-sm text-slate-400 mt-2">Spring Boot Core Backend (:8080) is online.</p>
              <p class="text-xs text-emerald-400 mt-1">Redirecting to Frontend (:3000) in 2 seconds...</p>
            </div>
            <div class="space-y-3 pt-2">
              <a href="http://localhost:3000" class="block w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition shadow-lg shadow-red-600/20">
                Open Frontend UI (:3000)
              </a>
              <a href="http://localhost:8000" class="block w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition border border-slate-700">
                Open AI On-Device Dashboard (:8000)
              </a>
            </div>
            <div class="pt-2 text-xs text-slate-500">
              Qualcomm Snapdragon AI Lab Challenge &bull; On-Device Edge Deepfake Detection
            </div>
          </div>
        </body>
        </html>
        """;

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRoot() {
        return ResponseEntity.ok(PORTAL_HTML);
    }

    @GetMapping(value = "/portal", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPortal() {
        return ResponseEntity.ok(PORTAL_HTML);
    }
}
