# Local LLM Git Commit Summarizer

This project sets up two open-source LLMs locally Mixtral-8x7B-Instruct and Phi-3 Mini. It uses [Ollama](https://ollama.com) to run AI summarization tasks entirely offline.

It includes a Node.js script that:
- Retrieves commit messages from your Git repo
- Sends them to the selected model
- Returns a press-release-style summary for changelogs, tag messages, etc.

---

## System Requirements

- macOS (Apple Silicon preferred)
- [Ollama](https://ollama.com) installed and running locally
- Node.js v18+ (for native `fetch`, `fs/promises` support)

---

## Installation

### 1. Install Ollama

```bash
brew install ollama
```

Then start the Ollama server manually:

```bash
ollama serve &
```

Do not use `brew services start ollama` unless you want it running constantly.

Alternatively, there is a shell script included locally that you can source to add start / stop commands to your environment.

---

### 2. Pull the Models

#### Mixtral

```bash
ollama pull mixtral
```

#### Phi-3 Mini

```bash
ollama pull phi3:mini
```

---

### 3. Install Dependencies

This script uses only built-in Node.js modules, but make sure you have Node 18+ installed:

```bash
node -v
```

If needed:

```bash
brew install node
```

---

## Usage

From inside any Git repo:

```bash
node summarize_commits.js [model]
```

Where `[model]` is one of:

- `mixtral`
- `phi3:mini`

If omitted, it will prompt you to choose interactively.

Alternatively, the included shell script -- assuming you sourced it earlier -- adds a summarize_commits command that can be run from any repo.

---

### Example

```bash
node summarize_commits.js mixtral
```

Produces output like:

```
Introduced support for OAuth and fixed a session timeout bug affecting mobile users. Dependencies were also updated to improve stability.
```

---

## What It Does

- Uses `git describe` and `git log` to get commit messages since the last tag
- Builds a natural-language prompt with that history
- Sends it to Ollama’s local model endpoint
- Streams and sanitizes the response
- Prints a one-paragraph customer-facing summary

---

## Development Notes

- Uses raw `http.request` for low-dependency local calls
- Models are served on `http://localhost:11434` by Ollama
- Responses are newline-delimited JSON chunks
- Any malformed chunks or control characters are stripped before parsing

---

## Uninstall / Cleanup

To remove models:

```bash
ollama rm mixtral
ollama rm phi3:mini
```

To stop Ollama:

```bash
ollama stop all
```
