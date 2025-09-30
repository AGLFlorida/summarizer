"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type RefOption = { label: string; value: string; kind: "tag" | "branch" };

export default function EditorPage() {
  const [baseRef, setBaseRef] = React.useState<string>("");
  const [headRef, setHeadRef] = React.useState<string>("");
  const [refs, setRefs] = React.useState<RefOption[]>([]);
  const [loadingRefs, setLoadingRefs] = React.useState(false);

  const [content, setContent] = React.useState("This is stubbed release note text.");
  const [summary, setSummary] = React.useState<string | null>(null);
  const [press, setPress] = React.useState<string | null>(null);

  const [fetchingCompare, setFetchingCompare] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<string | null>(null);

  // Load tags and branches for dropdowns
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingRefs(true);
      try {
        const res = await fetch("/api/github/refs", { cache: "no-store" });
        const json = await res.json();
        if (mounted) {
          const list: RefOption[] = [
            ...(json.tags ?? []).map((t: string) => ({ label: t, value: t, kind: "tag" as const })),
            ...(json.branches ?? []).map((b: string) => ({ label: b, value: b, kind: "branch" as const })),
          ];
          setRefs(list);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load references");
      } finally {
        if (mounted) setLoadingRefs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // When both base and head are present, pull commit messages and diff in the background
  React.useEffect(() => {
    if (!baseRef || !headRef) return;
    let ignore = false;
    (async () => {
      setFetchingCompare(true);
      try {
        const res = await fetch(`/api/github/compare`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ base: baseRef, head: headRef }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Compare failed");
        if (!ignore && json?.commitsText) setContent(json.commitsText);
      } catch (e: any) {
        if (!ignore) setError(e.message || "Background compare failed");
      } finally {
        if (!ignore) setFetchingCompare(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [baseRef, headRef]);

  async function generatePress() {
    setError(null);
    setSummary(null);
    setPress(null);
    try {
      const res = await fetch("/api/press-release", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ base: baseRef, head: headRef, textOverride: content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Unexpected error");
      setSummary(json.summary);
      setPress(json.pressRelease);
      setSnack("Generated");
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function copyPress() {
    try {
      await navigator.clipboard.writeText(press ?? content ?? "");
      setSnack("Copied to clipboard");
    } catch {
      setError("Copy failed");
    }
  }

  async function publish() {
    try {
      const res = await fetch("/api/publish/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary: summary ?? "",
          pressRelease: press ?? content ?? "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Publish failed");
      setSnack(json?.message ?? "Publish script executed");
    } catch (e: any) {
      setError(e.message || "Publish failed");
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Editor</Typography>

      {/* Menu bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto auto",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Base dropdown */}
        <Autocomplete
          freeSolo
          options={refs}
          loading={loadingRefs}
          getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
          onInputChange={(_, v) => setBaseRef(v.trim())}
          onChange={(_, v) => setBaseRef((typeof v === "string" ? v : v?.value) ?? "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Base (tag, branch, or ≥7-char hex)"
              placeholder="v1.2.3, main, or 1a2b3c4"
              inputProps={{
                ...params.inputProps,
                // allow anything the user wants, but you can hint with a simple pattern:
                pattern: "([0-9a-fA-F]{7,}|.+)",
              }}
            />
          )}
        />

        {/* Head dropdown */}
        <Autocomplete
          freeSolo
          options={refs}
          loading={loadingRefs}
          getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
          onInputChange={(_, v) => setHeadRef(v.trim())}
          onChange={(_, v) => setHeadRef((typeof v === "string" ? v : v?.value) ?? "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Head (tag, branch, or ≥7-char hex)"
              placeholder="v1.3.0, feature/x, or d4e5f6a"
              inputProps={{
                ...params.inputProps,
                pattern: "([0-9a-fA-F]{7,}|.+)",
              }}
            />
          )}
        />

        {/* Publish */}
        <Tooltip title="Run publish script">
          <span>
            <IconButton onClick={publish} disabled={!press && !summary && !content}>
              <PublishIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Copy */}
        <Tooltip title="Copy press release text">
          <span>
            <IconButton onClick={copyPress} disabled={!press && !content}>
              <ContentCopyIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      {/* Generate button */}
      <Box>
        <Tooltip title={!baseRef || !headRef ? "Select base and head first" : ""}>
          <span>
            <IconButton
              onClick={generatePress}
              disabled={!baseRef || !headRef || fetchingCompare}
              sx={{ mr: 1 }}
            >
              {fetchingCompare ? <CircularProgress size={24} /> : <Typography>Generate</Typography>}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* WYSIWYG */}
      <Box
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setContent((e.target as HTMLElement).innerText)}
        sx={{ border: "1px solid #ccc", p: 2, borderRadius: 1, minHeight: 160 }}
      >
        {content}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Release Notes</Typography>
        <Divider sx={{ my: 1 }} />
        <pre style={{ whiteSpace: "pre-wrap" }}>{summary ?? "—"}</pre>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Press Release</Typography>
        <Divider sx={{ my: 1 }} />
        <pre style={{ whiteSpace: "pre-wrap" }}>{press ?? "—"}</pre>
      </Paper>

      <Snackbar
        open={Boolean(snack)}
        onClose={() => setSnack(null)}
        autoHideDuration={2500}
        message={snack ?? ""}
      />
    </Stack>
  );
}
