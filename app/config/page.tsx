// app/config/page.tsx
"use client";

import { Box, Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { Paper } from "@mui/material";

export default function ConfigPage() {
  const [repo, setRepo] = useState("");
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [script, setScript] = useState<string>("(input) => { console.log('hello world'); }");

  useEffect(() => {
    (async () => {
      const [cfg, gh] = await Promise.all([
        fetch("/api/config", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/github/status", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setRepo(cfg.repo ?? "");
      setConnected(gh.connected ?? false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/publish/script", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json?.script) setScript(json.script);
      }
    })();
  }, []);

  async function saveRepo() {
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ repo }),
    });
    setSaving(false);
  }

  async function saveScript() {
    const res = await fetch("/api/publish/script", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ script }),
    });
    if (!res.ok) alert("Failed to save script");
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      {/* ...your existing configuration UI... */}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Publish Script (JavaScript function)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This function receives an object: <code>{`{ summary: string, pressRelease: string }`}</code>.
          It runs on the server when you click publish. Example:
        </Typography>
        <Box
          component="pre"
          sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1, whiteSpace: "pre-wrap" }}
        >{`(input) => {
  // input.summary and input.pressRelease are available
  console.log('hello world');
}`}</Box>

        <Box
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setScript((e.target as HTMLElement).innerText)}
          sx={{
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 2,
            minHeight: 160,
            mt: 2,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          {script}
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={async () => {
            const res = await fetch("/api/publish/script", { cache: "no-store" });
            const json = await res.json();
            setScript(json?.script ?? "(input) => { console.log('hello world'); }");
          }}>
            Load
          </Button>
          <Button variant="contained" onClick={saveScript}>Save</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
