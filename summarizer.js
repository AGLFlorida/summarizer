#!/usr/bin/env node

import { execSync, spawnSync } from "child_process";
import { createInterface } from "readline";
import { request } from "http";

const selectedModel = process.argv[2];
const selectedPersona = process.argv[3];

let marketerPrompt = "You are a senior product marketer and technical writer.";
marketerPrompt += "Write a customer-facing press release style paragraph summarizing the following Git commits.";
marketerPrompt += "Don't include merge commits or version numbers:";

let developerPrompt = "You are a staff software developer and senior technical writer."
developerPrompt += "Write a description suitable for a github PR description to describe what changed."
developerPrompt += "You should not include merge commits or version numbers."

const MODEL_MAP = {
  "1": "mixtral",
  "2": "phi3:mini",
};

const PERSONA_MAP = {
  "1": "marketer",
  "2": "developer"
}

async function promptModel() {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Please select a model:");
    console.log("  [1] mixtral");
    console.log("  [2] phi3:mini");
    rl.question("Enter number (default: 1): ", (answer) => {
      rl.close();
      resolve(MODEL_MAP[answer.trim()] || "mixtral");
    });
  });
}

async function promptPersona() {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Please select a persona:");
    console.log("  [1] maketer");
    console.log("  [2] developer");
    rl.question("Enter number (default: 2): ", (answer) => {
      rl.close();
      resolve(PERSONA_MAP[answer.trim()] || "developer");
    });
  });
}

function getGitOutput(cmd) {
  try {
    return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
  } catch {
    return false;
  }
}

function getCommitsSinceLastTag() {
  const insideRepo = spawnSync("git", ["rev-parse", "--is-inside-work-tree"]);
  if (insideRepo.status !== 0) {
    console.error("Not inside a Git repository.");
    process.exit(1);
  }

  let latestTag =
    getGitOutput("git describe --tags --abbrev=0") ||
    getGitOutput("git rev-list --max-parents=0 HEAD");

  let commitLog = "";
  const tagExists = getGitOutput("git tag --list").includes(latestTag);
  if (tagExists) {
    commitLog = getGitOutput(`git log ${latestTag}..HEAD --pretty=format:%s`);
  } else {
    commitLog = getGitOutput("git log --pretty=format:%s");
  }

  return commitLog.split("\n").filter(line => line && !/^Merge|v?\d+\.\d+/.test(line));
}

function buildPrompt(model, persona, commits) {
  const joined = commits.map(msg => `| ${msg} `).join("");

  let basePrompt = developerPrompt;
  let options = { "temperature": 0.4, "num_ctx": 4096 }
  //console.log("persona", persona);
  if (persona == "marketer") {
    basePrompt = marketerPrompt;
    options = { "temperature": 0.85, "num_ctx": 4096 }
  }

  return JSON.stringify({
    model,
    prompt: `${basePrompt} ${joined}`,
    stream: false,
    options: options
  });
}

function callOllama(payload) {
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: "localhost",
      port: 11434,
      path: "/api/generate", // TODO - replace with /api/chat
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (res) => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => resolve(raw));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function sanitizeAndExtractResponse(raw) {
  const lines = raw.split("\n").filter(line => line.startsWith("{"));
  const cleanLines = lines.map(line =>
    line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
  );
  const joined = `[${cleanLines.join(",")}]`;

  try {
    const parsed = JSON.parse(joined);
    return parsed.map(chunk => chunk.response).join("");
  } catch (err) {
    console.error("Failed to parse Ollama response:", err.message);
    return "";
  }
}

(async function main() {
  const model = selectedModel || await promptModel();
  const persona = selectedPersona || await promptPersona();
  const commits = getCommitsSinceLastTag();
  const payload = buildPrompt(model, persona, commits);
  //console.log(payload)
  const rawResponse = await callOllama(payload);
  const output = sanitizeAndExtractResponse(rawResponse);

  console.log();
  console.log(output);
})();
