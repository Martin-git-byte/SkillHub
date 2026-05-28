const STORAGE_KEY = "skills-hub-library";
const SUPABASE_URL_KEY = "skills-hub-supabase-url";
const SUPABASE_ANON_KEY = "skills-hub-supabase-anon-key";
const SUPABASE_TABLE = "skills";
const AGENTS = ["Claude", "Codex", "Hermes", "OpenClaw", "ComfyUI"];

const starterSkills = [
  {
    id: "research-synthesis",
    title: "Research Synthesis",
    agent: "Claude",
    lane: "thinkingCards",
    status: "Active",
    owner: "Claude",
    summary: "Turn scattered notes, sources, and questions into a clear brief with options and tradeoffs.",
    tags: ["briefs", "analysis", "decisions"],
  },
  {
    id: "prompt-architecture",
    title: "Prompt Architecture",
    agent: "Claude",
    lane: "thinkingCards",
    status: "Active",
    owner: "Claude",
    summary: "Design reusable instructions, rubrics, and task frames for consistent agent behavior.",
    tags: ["prompts", "rubrics", "quality"],
  },
  {
    id: "critical-review",
    title: "Critical Review",
    agent: "Claude",
    lane: "thinkingCards",
    status: "Needs review",
    owner: "Shared",
    summary: "Pressure-test plans, documents, and product ideas before they move into execution.",
    tags: ["critique", "risk", "clarity"],
  },
  {
    id: "codebase-navigation",
    title: "Codebase Navigation",
    agent: "Codex",
    lane: "thinkingCards",
    status: "Active",
    owner: "Codex",
    summary: "Map project structure, find ownership boundaries, and identify the safest place to change.",
    tags: ["repos", "context", "orientation"],
  },
  {
    id: "implementation",
    title: "Implementation",
    agent: "Codex",
    lane: "makingCards",
    status: "Active",
    owner: "Codex",
    summary: "Edit code, follow local patterns, wire features together, and keep changes tightly scoped.",
    tags: ["features", "fixes", "refactors"],
  },
  {
    id: "verification",
    title: "Verification",
    agent: "Codex",
    lane: "makingCards",
    status: "Active",
    owner: "Codex",
    summary: "Run tests, inspect UI, check edge cases, and report what is proven versus still uncertain.",
    tags: ["tests", "QA", "confidence"],
  },
  {
    id: "artifact-builder",
    title: "Artifact Builder",
    agent: "Codex",
    lane: "makingCards",
    status: "Draft",
    owner: "Shared",
    summary: "Create usable files such as pages, documents, spreadsheets, decks, images, and local tools.",
    tags: ["files", "assets", "tools"],
  },
  {
    id: "design-polish",
    title: "Design Polish",
    agent: "Codex",
    lane: "makingCards",
    status: "Active",
    owner: "Codex",
    summary: "Improve layout, visual hierarchy, responsiveness, states, and practical interaction details.",
    tags: ["UI", "responsive", "states"],
  },
  {
    id: "task-routing",
    title: "Task Routing",
    agent: "Hermes",
    lane: "orchestratingCards",
    status: "Active",
    owner: "Hermes",
    summary: "Decide which agent should handle a request and carry context cleanly between them.",
    tags: ["handoffs", "triage", "context"],
  },
  {
    id: "automation-watch",
    title: "Automation Watch",
    agent: "Hermes",
    lane: "orchestratingCards",
    status: "Active",
    owner: "Hermes",
    summary: "Track recurring checks, reminders, follow-ups, and background work that should resurface later.",
    tags: ["reminders", "monitoring", "follow-up"],
  },
  {
    id: "workflow-ledger",
    title: "Workflow Ledger",
    agent: "Hermes",
    lane: "orchestratingCards",
    status: "Active",
    owner: "Hermes",
    summary: "Keep a running view of open loops, pending decisions, owners, deadlines, and next actions.",
    tags: ["tasks", "owners", "status"],
  },
  {
    id: "release-handoff",
    title: "Release Handoff",
    agent: "Hermes",
    lane: "orchestratingCards",
    status: "Needs review",
    owner: "Shared",
    summary: "Package outcomes into a concise handoff with changed files, checks, risks, and next steps.",
    tags: ["handoff", "release", "summary"],
  },
  {
    id: "browser-operation",
    title: "Browser Operation",
    agent: "OpenClaw",
    lane: "makingCards",
    status: "Active",
    owner: "OpenClaw",
    summary: "Open pages, inspect visible state, click controls, fill forms, and report grounded outcomes.",
    tags: ["browser", "actions", "inspection"],
  },
  {
    id: "environment-control",
    title: "Environment Control",
    agent: "OpenClaw",
    lane: "orchestratingCards",
    status: "Draft",
    owner: "OpenClaw",
    summary: "Coordinate local tools, app windows, and manual checkpoints for tasks that need direct interaction.",
    tags: ["tools", "handoff", "control"],
  },
  {
    id: "image-workflow",
    title: "Image Workflow",
    agent: "ComfyUI",
    lane: "makingCards",
    status: "Active",
    owner: "ComfyUI",
    summary: "Build repeatable node graphs for image generation, refinement, upscaling, and batch asset creation.",
    tags: ["images", "nodes", "generation"],
  },
  {
    id: "visual-iteration",
    title: "Visual Iteration",
    agent: "ComfyUI",
    lane: "thinkingCards",
    status: "Active",
    owner: "ComfyUI",
    summary: "Turn references, prompts, seeds, and review notes into controlled visual variants.",
    tags: ["prompts", "variants", "assets"],
  },
];

const template = document.querySelector("#skillTemplate");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter");
const skillCount = document.querySelector("#skillCount");
const skillForm = document.querySelector("#skillForm");
const skillId = document.querySelector("#skillId");
const formTitle = document.querySelector("#formTitle");
const cancelEdit = document.querySelector("#cancelEdit");
const titleInput = document.querySelector("#titleInput");
const agentInput = document.querySelector("#agentInput");
const laneInput = document.querySelector("#laneInput");
const statusInput = document.querySelector("#statusInput");
const tagsInput = document.querySelector("#tagsInput");
const summaryInput = document.querySelector("#summaryInput");
const importInput = document.querySelector("#importInput");
const resetButton = document.querySelector("#resetButton");
const cloudPanel = document.querySelector(".cloud-panel");
const emailInput = document.querySelector("#emailInput");
const syncStatus = document.querySelector("#syncStatus");
const exportJsonButton = document.querySelector("#exportJsonButton");
const exportMarkdownButton = document.querySelector("#exportMarkdownButton");

let skills = loadSkills();
skills = mergeStarterSkills(skills);
let currentFilter = "all";
let supabaseClient = null;
let supabaseChannel = null;
let cloudReady = false;
let currentUser = null;

function loadSkills() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) {
      return saved.map(normalizeSkill);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return starterSkills.map(normalizeSkill);
}

function mergeStarterSkills(currentSkills) {
  const existingIds = new Set(currentSkills.map((skill) => skill.id));
  const missingStarterSkills = starterSkills
    .map(normalizeSkill)
    .filter((skill) => !existingIds.has(skill.id));
  const mergedSkills = [...currentSkills, ...missingStarterSkills];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSkills));
  return mergedSkills;
}

function normalizeSkill(skill) {
  const title = String(skill.title || "Untitled skill").trim();
  return {
    id: String(skill.id || createId(title)),
    title,
    agent: AGENTS.includes(skill.agent) ? skill.agent : "Claude",
    lane: ["thinkingCards", "makingCards", "orchestratingCards"].includes(skill.lane)
      ? skill.lane
      : "thinkingCards",
    status: ["Draft", "Active", "Needs review"].includes(skill.status) ? skill.status : "Draft",
    owner: String(skill.owner || skill.agent || "Shared").trim(),
    summary: String(skill.summary || "").trim(),
    tags: Array.isArray(skill.tags) ? skill.tags.map(String).filter(Boolean) : [],
  };
}

function toCloudRow(skill) {
  return {
    id: skill.id,
    title: skill.title,
    agent: skill.agent,
    lane: skill.lane,
    status: skill.status,
    owner: skill.owner,
    summary: skill.summary,
    tags: skill.tags,
    updated_at: new Date().toISOString(),
  };
}

function fromCloudRow(row) {
  return normalizeSkill({
    id: row.id,
    title: row.title,
    agent: row.agent,
    lane: row.lane,
    status: row.status,
    owner: row.owner,
    summary: row.summary,
    tags: row.tags,
  });
}

function createId(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "skill"}-${Date.now().toString(36)}`;
}

function saveSkills() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

function setSyncStatus(message, state = "") {
  syncStatus.textContent = message;
  cloudPanel.classList.toggle("connected", state === "connected");
  cloudPanel.classList.toggle("error", state === "error");
}

function getConfiguredSupabase() {
  const config = window.SKILLS_HUB_SUPABASE || {};
  return {
    url: config.url || localStorage.getItem(SUPABASE_URL_KEY) || "",
    anonKey: config.anonKey || localStorage.getItem(SUPABASE_ANON_KEY) || "",
    requireLogin: Boolean(config.requireLogin),
    isBundled: Boolean(config.url && config.anonKey),
  };
}


function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function matchesSkill(skill, term) {
  const haystack = [
    skill.title,
    skill.agent,
    skill.status,
    skill.owner,
    skill.summary,
    ...skill.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function createCard(skill) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.id = skill.id;
  card.querySelector("h3").textContent = skill.title;
  card.querySelector("p").textContent = skill.summary;

  const agentTag = card.querySelector(".agent-tag");
  agentTag.textContent = skill.agent;
  agentTag.classList.add(skill.agent);

  const collabRow = card.querySelector(".collab-row");
  collabRow.append(createBadge(skill.status, `status-${skill.status.toLowerCase().replace(" ", "-")}`));
  collabRow.append(createBadge(skill.owner || "Shared", "owner-badge"));

  const meta = card.querySelector(".skill-meta");
  skill.tags.forEach((tag) => {
    meta.append(createBadge(tag, ""));
  });

  card.querySelector(".edit-skill").addEventListener("click", () => startEdit(skill.id));
  card.querySelector(".delete-skill").addEventListener("click", () => deleteSkill(skill.id));

  return card;
}

function createBadge(text, className) {
  const badge = document.createElement("span");
  badge.textContent = text;
  if (className) {
    badge.className = className;
  }
  return badge;
}

function render() {
  const term = searchInput.value.trim();
  const lanes = document.querySelectorAll(".cards");
  lanes.forEach((lane) => {
    lane.replaceChildren();
  });

  const visible = skills.filter((skill) => {
    const agentMatch = currentFilter === "all" || skill.agent === currentFilter;
    const searchMatch = term === "" || matchesSkill(skill, term);
    return agentMatch && searchMatch;
  });

  visible.forEach((skill) => {
    document.querySelector(`#${skill.lane}`).append(createCard(skill));
  });

  lanes.forEach((lane) => {
    if (lane.children.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No matching skills";
      lane.append(empty);
    }
  });
  skillCount.textContent = skills.length;
}

async function connectSupabase(url, anonKey) {
  const configured = getConfiguredSupabase();
  const nextUrl = url || configured.url;
  const nextAnonKey = anonKey || configured.anonKey;
  const createClient = await loadSupabaseCreateClient();
  if (!createClient) {
    setSyncStatus("Supabase library did not load. Check your internet connection.", "error");
    return;
  }

  if (!nextUrl || !nextAnonKey) {
    setSyncStatus("Paste your Supabase project URL and anon key to connect.", "error");
    return;
  }

  supabaseClient = createClient(nextUrl, nextAnonKey);
  if (!configured.isBundled) {
    localStorage.setItem(SUPABASE_URL_KEY, nextUrl);
    localStorage.setItem(SUPABASE_ANON_KEY, nextAnonKey);
  }
  await updateAuthState();

  await pullCloudSkills();
  await pushAllSkills();
  subscribeToCloudChanges();
  cloudReady = true;
  setSyncStatus(getConnectedMessage(), "connected");
}

async function loadSupabaseCreateClient() {
  if (window.supabase?.createClient) {
    return window.supabase.createClient;
  }

  try {
    const clientModule = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    return clientModule.createClient;
  } catch {
    return null;
  }
}

async function pullCloudSkills() {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLE)
    .select("id,title,agent,lane,status,owner,summary,tags,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    setSyncStatus(`Supabase read failed: ${error.message}`, "error");
    return;
  }

  if (data.length > 0) {
    skills = data.map(fromCloudRow);
    saveSkills();
    render();
  }
}

async function pushAllSkills() {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.from(SUPABASE_TABLE).upsert(skills.map(toCloudRow));
  if (error) {
    setSyncStatus(`Supabase save failed: ${error.message}`, "error");
  }
}

async function pushSkill(skill) {
  if (!cloudReady || !supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.from(SUPABASE_TABLE).upsert(toCloudRow(skill));
  if (error) {
    setSyncStatus(`Supabase save failed: ${error.message}`, "error");
  }
}

async function removeCloudSkill(id) {
  if (!cloudReady || !supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.from(SUPABASE_TABLE).delete().eq("id", id);
  if (error) {
    setSyncStatus(`Supabase delete failed: ${error.message}`, "error");
  }
}

function subscribeToCloudChanges() {
  if (supabaseChannel) {
    supabaseClient.removeChannel(supabaseChannel);
  }

  supabaseChannel = supabaseClient
    .channel("skills-hub-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: SUPABASE_TABLE },
      (payload) => {
        if (payload.eventType === "DELETE") {
          skills = skills.filter((skill) => skill.id !== payload.old.id);
        } else {
          const nextSkill = fromCloudRow(payload.new);
          const index = skills.findIndex((skill) => skill.id === nextSkill.id);
          if (index >= 0) {
            skills[index] = nextSkill;
          } else {
            skills = [nextSkill, ...skills];
          }
        }

        saveSkills();
        render();
        setSyncStatus("Connected. Latest cloud change received.", "connected");
      },
    )
    .subscribe();
}

function disconnectSupabase() {
  if (supabaseClient && supabaseChannel) {
    supabaseClient.removeChannel(supabaseChannel);
  }

  supabaseClient = null;
  supabaseChannel = null;
  cloudReady = false;
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_ANON_KEY);
  currentUser = null;
  setSyncStatus("Local mode. Connect Supabase to share edits with other people.");
}

async function updateAuthState() {
  if (!supabaseClient) {
    currentUser = null;
    return;
  }

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  currentUser = user;
}

function getConnectedMessage() {
  if (currentUser?.email) {
    return `Connected as ${currentUser.email}. Edits are syncing through Supabase.`;
  }

  return "Connected. Edits are syncing through Supabase.";
}

async function unlock() {
  const config = window.SKILLS_HUB_SUPABASE || {};
  const pin = config.pin || "";
  const entered = document.querySelector("#pinInput")?.value?.trim();
  if (!pin) {
    setSyncStatus("No PIN configured. Ask the app owner to set one in config.js.", "error");
    return;
  }
  if (entered !== pin) {
    setSyncStatus("Incorrect PIN.", "error");
    return;
  }
  localStorage.setItem("skills-hub-pin-ok", "1");
  await connectSupabase(config.url, config.anonKey);
}


function fillForm(skill) {
  skillId.value = skill.id;
  titleInput.value = skill.title;
  agentInput.value = skill.agent;
  laneInput.value = skill.lane;
  statusInput.value = skill.status;
  tagsInput.value = skill.tags.join(", ");
  summaryInput.value = skill.summary;
}

function resetForm() {
  skillForm.reset();
  skillId.value = "";
  formTitle.textContent = "Add a skill";
  cancelEdit.hidden = true;
  statusInput.value = "Active";
}

function startEdit(id) {
  const skill = skills.find((item) => item.id === id);
  if (!skill) {
    return;
  }

  fillForm(skill);
  formTitle.textContent = "Edit skill";
  cancelEdit.hidden = false;
  titleInput.focus();
  skillForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteSkill(id) {
  const skill = skills.find((item) => item.id === id);
  if (!skill || !confirm(`Delete "${skill.title}" from the library?`)) {
    return;
  }

  skills = skills.filter((item) => item.id !== id);
  saveSkills();
  removeCloudSkill(id);
  render();
}

function collectFormSkill() {
  return normalizeSkill({
    id: skillId.value || createId(titleInput.value),
    title: titleInput.value,
    agent: agentInput.value,
    lane: laneInput.value,
    status: statusInput.value,
    owner: agentInput.value,
    summary: summaryInput.value,
    tags: parseTags(tagsInput.value),
  });
}

skillForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextSkill = collectFormSkill();
  const existingIndex = skills.findIndex((skill) => skill.id === nextSkill.id);

  if (existingIndex >= 0) {
    skills[existingIndex] = nextSkill;
  } else {
    skills = [nextSkill, ...skills];
  }

  saveSkills();
  pushSkill(nextSkill);
  resetForm();
  render();
});

cancelEdit.addEventListener("click", resetForm);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

searchInput.addEventListener("input", render);

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatMarkdown() {
  const grouped = skills.reduce((groups, skill) => {
    groups[skill.agent] ||= [];
    groups[skill.agent].push(skill);
    return groups;
  }, {});

  const sections = Object.entries(grouped).map(([agent, agentSkills]) => {
    const items = agentSkills
      .map(
        (skill) => [
          `### ${skill.title}`,
          `- Lane: ${skill.lane.replace("Cards", "")}`,
          `- Status: ${skill.status}`,
          `- Owner: ${skill.owner}`,
          `- Tags: ${skill.tags.join(", ") || "none"}`,
          "",
          skill.summary,
        ].join("\n"),
      )
      .join("\n\n");

    return `## ${agent}\n\n${items}`;
  });

  return ["# Skills Hub Library", "", ...sections].join("\n");
}


exportJsonButton.addEventListener("click", () => {
  downloadFile("skills-hub-library.json", JSON.stringify(skills, null, 2), "application/json");
});

exportMarkdownButton.addEventListener("click", () => {
  downloadFile("skills-hub-library.md", formatMarkdown(), "text/markdown");
});


importInput.addEventListener("change", async () => {
  const [file] = importInput.files;
  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported)) {
      throw new Error("Expected an array of skills.");
    }

    skills = imported.map(normalizeSkill);
    saveSkills();
    pushAllSkills();
    resetForm();
    render();
  } catch (error) {
    alert(`Could not import that file. ${error.message}`);
  } finally {
    importInput.value = "";
  }
});

resetButton.addEventListener("click", () => {
  if (!confirm("Reset all skills to the starter library? This cannot be undone.")) {
    return;
  }

  skills = starterSkills.map(normalizeSkill);
  saveSkills();
  pushAllSkills();
  resetForm();
  render();
});






document.querySelector("#loginButton").addEventListener("click", unlock);

render();

const configuredSupabase = getConfiguredSupabase();
if (configuredSupabase.url && configuredSupabase.anonKey) {
  if (localStorage.getItem("skills-hub-pin-ok") === "1") {
    connectSupabase(configuredSupabase.url, configuredSupabase.anonKey);
  } else {
    setSyncStatus("Enter the PIN to sync your library.");
  }
} else {
  setSyncStatus("Supabase not configured. Contact the app owner.");
}
