import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";

let genai: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getApiKey(): string | undefined {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (envKey && envKey !== "your_gemini_api_key_here") return envKey;
  try {
    const localKey = localStorage.getItem("gemini_api_key")?.trim();
    if (localKey) return localKey;
  } catch {
    // ignore
  }
  return undefined;
}

function getClient(): GoogleGenAI | null {
  const API_KEY = getApiKey();
  if (!API_KEY) {
    return null;
  }
  if (!genai || cachedKey !== API_KEY) {
    genai = new GoogleGenAI({ apiKey: API_KEY });
    cachedKey = API_KEY;
  }
  return genai;
}

export type ToolCallName =
  | "createTable" | "insertClinicalTable" | "addTableData" | "modifyTableStructure" | "deleteTable"
  | "deletePage" | "insertSectionBreak" | "addBookmark" | "findText"
  | "applyStyle" | "changeCase" | "applyFormat" | "alignText"
  | "changeFont" | "changeFontSize" | "insertSymbol"
  | "changeOrientation" | "setMargins" | "insertCitation"
  | "insertFigureTemplate" | "insertInternalRef" | "insertCrossRef" | "insertAppendix" | "loadTemplate"
  | "saveDocument" | "saveDocumentAs" | "exportPDF" | "exportDOCX" | "toggleTrackChanges"
  | "addText" | "insertImage" | "resizeImage" | "removeImage" | "addLink" | "createList" | "insertPageBreak"
  | "rewriteText" | "improveWriting" | "generateHeading" | "generateTable"
  | "captionFigure" | "summarizeSection" | "complianceFix" | "regulatoryTone";

export interface ToolCall {
  name: ToolCallName;
  args: Record<string, unknown>;
}

export type AIResponse =
  | { kind: "text"; text: string }
  | { kind: "tool"; call: ToolCall; confirmText: string };

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "createTable", description: "Creates EMPTY table on new page.",
    parameters: {
      type: Type.OBJECT, properties: {
        rows: { type: Type.NUMBER }, columns: { type: Type.NUMBER }, newPage: { type: Type.BOOLEAN },
      }, required: ["rows", "columns"]
    }
  },
  {
    name: "insertClinicalTable", description: "Inserts clinical template.",
    parameters: {
      type: Type.OBJECT, properties: {
        preset: { type: Type.STRING }, newPage: { type: Type.BOOLEAN },
      }, required: ["preset"]
    }
  },
  {
    name: "addTableData", description: "Adds data to marked table.",
    parameters: {
      type: Type.OBJECT, properties: {
        data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      }, required: ["data"]
    }
  },
  {
    name: "modifyTableStructure", description: "Add/remove rows/cols.",
    parameters: {
      type: Type.OBJECT, properties: {
        action: { type: Type.STRING }, count: { type: Type.NUMBER }, position: { type: Type.STRING },
      }, required: ["action"]
    }
  },
  {
    name: "deleteTable", description: "Deletes last table.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "deletePage", description: "Deletes pages.",
    parameters: {
      type: Type.OBJECT, properties: {
        pages: { type: Type.STRING },
      }, required: ["pages"]
    }
  },
  {
    name: "insertSectionBreak", description: "Section break.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "insertPageBreak", description: "Page break.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "addBookmark", description: "Adds bookmark.",
    parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING } }, required: ["name"] }
  },
  {
    name: "findText", description: "Find text.",
    parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ["query"] }
  },
  {
    name: "applyStyle", description: "Applies style.",
    parameters: { type: Type.OBJECT, properties: { style: { type: Type.STRING } }, required: ["style"] }
  },
  {
    name: "changeCase", description: "Change case.",
    parameters: { type: Type.OBJECT, properties: { mode: { type: Type.STRING } }, required: ["mode"] }
  },
  {
    name: "applyFormat", description: "Apply bold/italic.",
    parameters: { type: Type.OBJECT, properties: { format: { type: Type.STRING } }, required: ["format"] }
  },
  {
    name: "alignText", description: "Align text.",
    parameters: { type: Type.OBJECT, properties: { align: { type: Type.STRING } }, required: ["align"] }
  },
  {
    name: "changeFont", description: "Change font.",
    parameters: { type: Type.OBJECT, properties: { font: { type: Type.STRING } }, required: ["font"] }
  },
  {
    name: "changeFontSize", description: "Change size.",
    parameters: { type: Type.OBJECT, properties: { size: { type: Type.NUMBER } }, required: ["size"] }
  },
  {
    name: "insertSymbol", description: "Insert symbol.",
    parameters: { type: Type.OBJECT, properties: { symbol: { type: Type.STRING } }, required: ["symbol"] }
  },
  {
    name: "changeOrientation", description: "Orientation.",
    parameters: { type: Type.OBJECT, properties: { orientation: { type: Type.STRING } }, required: ["orientation"] }
  },
  {
    name: "setMargins", description: "Set margins.",
    parameters: { type: Type.OBJECT, properties: { top: { type: Type.NUMBER }, right: { type: Type.NUMBER }, bottom: { type: Type.NUMBER }, left: { type: Type.NUMBER } }, required: [] }
  },
  {
    name: "insertCitation", description: "Insert citation.",
    parameters: { type: Type.OBJECT, properties: { source: { type: Type.STRING } }, required: ["source"] }
  },
  {
    name: "insertFigureTemplate", description: "Insert figure.",
    parameters: { type: Type.OBJECT, properties: { figure: { type: Type.STRING } }, required: ["figure"] }
  },
  {
    name: "insertInternalRef", description: "Internal ref.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "insertCrossRef", description: "Cross-ref.",
    parameters: { type: Type.OBJECT, properties: { target: { type: Type.STRING } }, required: [] }
  },
  {
    name: "insertAppendix", description: "Insert appendix.",
    parameters: { type: Type.OBJECT, properties: { appendix: { type: Type.STRING } }, required: ["appendix"] }
  },
  {
    name: "loadTemplate", description: "Load template.",
    parameters: { type: Type.OBJECT, properties: { template: { type: Type.STRING } }, required: ["template"] }
  },
  {
    name: "saveDocument", description: "Save document.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "saveDocumentAs", description: "Save as.",
    parameters: { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ["title"] }
  },
  {
    name: "exportPDF", description: "Export PDF.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "exportDOCX", description: "Export DOCX.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "toggleTrackChanges", description: "Track changes.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "addText", description: "Add text.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, style: { type: Type.STRING }, newPage: { type: Type.BOOLEAN } }, required: ["text"] }
  },
  {
    name: "insertImage", description: "Insert an image either from a direct URL or by search query. Pass explicit URLs in 'url'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING, description: "Exact user-provided direct image URL if specified." },
        query: { type: Type.STRING, description: "Search query keywords if no direct URL is provided." },
        newPage: { type: Type.BOOLEAN }
      },
      required: []
    }
  },
  {
    name: "resizeImage", description: "Resize last image.",
    parameters: { type: Type.OBJECT, properties: { width: { type: Type.NUMBER }, percent: { type: Type.NUMBER } }, required: [] }
  },
  {
    name: "removeImage", description: "Remove last image.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: "addLink", description: "Insert link.",
    parameters: { type: Type.OBJECT, properties: { url: { type: Type.STRING }, text: { type: Type.STRING } }, required: ["url"] }
  },
  {
    name: "createList", description: "Insert list.",
    parameters: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.STRING } }, type: { type: Type.STRING }, newPage: { type: Type.BOOLEAN } }, required: ["items"] }
  },
  {
    name: "rewriteText", description: "Rewrite text.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, tone: { type: Type.STRING } }, required: [] }
  },
  {
    name: "improveWriting", description: "Improve writing.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: [] }
  },
  {
    name: "generateHeading", description: "Generate heading.",
    parameters: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, level: { type: Type.STRING }, newPage: { type: Type.BOOLEAN } }, required: ["topic"] }
  },
  {
    name: "generateTable", description: "Generate table with data.",
    parameters: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, rows: { type: Type.NUMBER }, columns: { type: Type.NUMBER }, newPage: { type: Type.BOOLEAN } }, required: ["topic"] }
  },
  {
    name: "captionFigure", description: "Caption figure.",
    parameters: { type: Type.OBJECT, properties: { context: { type: Type.STRING } }, required: ["context"] }
  },
  {
    name: "summarizeSection", description: "Summarize.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, maxSentences: { type: Type.NUMBER } }, required: [] }
  },
  {
    name: "complianceFix", description: "Compliance fix.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: [] }
  },
  {
    name: "regulatoryTone", description: "Regulatory tone.",
    parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: [] }
  },
];

const SYSTEM_INSTRUCTION = `You are an AI writing assistant inside "Parexel Smart Authoring Suite".

🔴 CRITICAL: When user gives a COMMAND, call the appropriate tool. Do NOT respond conversationally.

TABLE:
- "create a table" / "table banao" / "N rows M columns" → createTable (EMPTY, new page by default)
- "generate a table" / "generate table" → createTable (EMPTY, new page)
- "generate a table WITH DATA" → generateTable (WITH data — only when user says "with data")
- "demographics/adverse events/efficacy/audit/risk/approval table" → insertClinicalTable
- "add data to this table" → addTableData
- "add a row" / "add N rows" → modifyTableStructure action="addRow"
- "add a column" → modifyTableStructure action="addColumn"
- "delete last/first/2nd row" → modifyTableStructure action="deleteRow" position="last|first|2"
- "delete this row" → modifyTableStructure action="deleteRow" position="cursor"
- "delete last/2nd column" → modifyTableStructure action="deleteColumn"
- "delete table" → deleteTable

📌 TABLES go to NEW page by default. Set newPage=false ONLY if user says "here"/"current page".

IMAGE & PICTURE GENERATION:
- "generate picture" / "picture generate madu" / "generate image" / "picture of [topic]" / "image of [topic]" → insertImage query="[topic]"
- "insert/add this [URL]" or direct image URL in prompt → insertImage url="[EXACT_URL]" (CRITICAL: preserve the EXACT URL as provided by the user, do NOT search or replace it)
- "insert image [query]" / "image daalo" / "photo of [topic]" (without explicit URL) → insertImage query="[query]"
- "make image bigger" / "image bada karo" → resizeImage percent=150
- "make image smaller" / "image chota karo" → resizeImage percent=70
- "resize image to 50%" → resizeImage percent=50
- "remove image" / "image hatao" → removeImage

PAGE:
- "delete page 2" → deletePage pages="2"
- "delete pages 2,3,4" → deletePage pages="2,3,4"
- "delete current/last/first page" → deletePage pages="current|last|first"
- "section break" → insertSectionBreak
- "page break" / "new page" → insertPageBreak

BOOKMARK & FIND:
- "add bookmark: intro" → addBookmark name="intro"
- "find patient" → findText query="patient"

STYLE:
- "apply heading 2" → applyStyle style="h2"
- "UPPER CASE" → changeCase mode="upper"
- "lower case" → changeCase mode="lower"
- "title case" → changeCase mode="title"
- "sentence case" → changeCase mode="sentence"
- "make bold" → applyFormat format="bold"
- "italic" → applyFormat format="italic"
- "underline" → applyFormat format="underline"
- "center align" → alignText align="center"
- "left align" → alignText align="left"
- "right align" → alignText align="right"
- "justify" → alignText align="justify"
- "change font to Arial" → changeFont font="Arial"
- "font size 14" → changeFontSize size=14

SYMBOLS & PAGE SETUP:
- "insert degree" → insertSymbol symbol="°"
- "insert ±" → insertSymbol symbol="±"
- "insert ©" → insertSymbol symbol="©"
- "landscape" → changeOrientation orientation="landscape"
- "portrait" → changeOrientation orientation="portrait"
- "set margins 2cm" → setMargins top=2 right=2 bottom=2 left=2

REFERENCES:
- "cite ICH E3" → insertCitation source="ICH E3"
- "cite FDA" → insertCitation source="FDA"

FIGURES & LINKS:
- "insert Kaplan-Meier figure" → insertFigureTemplate figure="Kaplan-Meier Survival Curve"
- "add Forest Plot" → insertFigureTemplate figure="Forest Plot — Subgroup Analysis"
- "insert CONSORT diagram" → insertFigureTemplate figure="Trial Disposition (CONSORT)"
- "study schema" → insertFigureTemplate figure="Study Schema Timeline"
- "PK profile" → insertFigureTemplate figure="Pharmacokinetic Profile"
- "mean change from baseline" → insertFigureTemplate figure="Mean Change from Baseline"
- "insert internal ref" → insertInternalRef
- "cross-ref Table X" → insertCrossRef target="Table 14.1.1"
- "insert Appendix A" → insertAppendix appendix="A — Protocol"
- "add SAP appendix" → insertAppendix appendix="B — SAP"

TEMPLATES:
- "load CSR template" → loadTemplate template="CSR"
- "use Phase III Protocol template" → loadTemplate template="Phase III Protocol"
- "load Investigator Brochure" → loadTemplate template="Investigator Brochure"
- "load Validation Report" → loadTemplate template="Validation Report"
- "load Audit Report" → loadTemplate template="Audit Report"
- "load Risk Assessment" → loadTemplate template="Risk Assessment"

SAVE:
- "save" → saveDocument
- "save as X" → saveDocumentAs title="X"
- "export PDF" → exportPDF
- "export DOCX" → exportDOCX
- "track changes on" → toggleTrackChanges

CONTENT:
- "heading add karo" → addText style="h2"
- "paragraph likho" → addText style="paragraph"
- "link add karo" → addLink
- "list banao" → createList

AI WRITING:
- "rewrite" → rewriteText
- "improve" → improveWriting
- "generate heading" → generateHeading
- "caption figure" → captionFigure
- "summarize" → summarizeSection
- "compliance fix" → complianceFix
- "regulatory tone" → regulatoryTone

If "new page" / "naye page par" → newPage=true.

After a tool call, give ONE short confirmation.`;

const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

/**
 * Intelligent local intent resolution when offline or when no API key is provided.
 */
export function resolveLocalIntent(message: string, selectedDocText?: string): AIResponse | null {
  const text = message.trim();
  const lower = text.toLowerCase();
  const sel = selectedDocText?.trim() || "";

  // 1. Clinical Presets & Tables
  if (/\b(demographics|demographic)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertClinicalTable", args: { preset: "demographics", newPage: false } },
      confirmText: buildConfirmText("insertClinicalTable", { preset: "demographics" }),
    };
  }
  if (/\b(adverse event|adverse events|ae summary)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertClinicalTable", args: { preset: "adverseEvents", newPage: false } },
      confirmText: buildConfirmText("insertClinicalTable", { preset: "adverseEvents" }),
    };
  }
  if (/\b(efficacy table|efficacy)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertClinicalTable", args: { preset: "efficacy", newPage: false } },
      confirmText: buildConfirmText("insertClinicalTable", { preset: "efficacy" }),
    };
  }
  const tableMatch = lower.match(/(?:create|generate|insert)?\s*(\d+)\s*(?:rows?|x)\s*(\d+)\s*(?:cols?|columns?)/i);
  if (tableMatch) {
    const rows = parseInt(tableMatch[1], 10) || 3;
    const columns = parseInt(tableMatch[2], 10) || 3;
    return {
      kind: "tool",
      call: { name: "createTable", args: { rows, columns, newPage: false } },
      confirmText: buildConfirmText("createTable", { rows, columns }),
    };
  }
  if (/\b(create|generate|insert)\s*(?:a\s*)?table\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "createTable", args: { rows: 4, columns: 4, newPage: false } },
      confirmText: buildConfirmText("createTable", { rows: 4, columns: 4 }),
    };
  }
  if (/\b(delete table|remove table)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "deleteTable", args: {} },
      confirmText: buildConfirmText("deleteTable", {}),
    };
  }

  // 2. Citations & References
  if (/\b(ich e3|iche3)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertCitation", args: { source: "ICH E3" } },
      confirmText: buildConfirmText("insertCitation", { source: "ICH E3" }),
    };
  }
  if (/\b(fda)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertCitation", args: { source: "FDA" } },
      confirmText: buildConfirmText("insertCitation", { source: "FDA" }),
    };
  }
  if (/\b(ema)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertCitation", args: { source: "EMA" } },
      confirmText: buildConfirmText("insertCitation", { source: "EMA" }),
    };
  }
  if (/\b(gamp 5|gamp5)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertCitation", args: { source: "GAMP 5" } },
      confirmText: buildConfirmText("insertCitation", { source: "GAMP 5" }),
    };
  }

  // 3. Figures & Diagrams
  if (/\b(kaplan-meier|kaplan meier|survival curve)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertFigureTemplate", args: { figure: "Kaplan-Meier Survival Curve" } },
      confirmText: buildConfirmText("insertFigureTemplate", { figure: "Kaplan-Meier Survival Curve" }),
    };
  }
  if (/\b(forest plot)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertFigureTemplate", args: { figure: "Forest Plot — Subgroup Analysis" } },
      confirmText: buildConfirmText("insertFigureTemplate", { figure: "Forest Plot — Subgroup Analysis" }),
    };
  }
  if (/\b(consort|consort diagram)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertFigureTemplate", args: { figure: "Trial Disposition (CONSORT)" } },
      confirmText: buildConfirmText("insertFigureTemplate", { figure: "Trial Disposition (CONSORT)" }),
    };
  }
  if (/\b(study schema|schema timeline)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertFigureTemplate", args: { figure: "Study Schema Timeline" } },
      confirmText: buildConfirmText("insertFigureTemplate", { figure: "Study Schema Timeline" }),
    };
  }
  if (/\b(generate (picture|image|photo|figure)|picture generate|image generate|picture of|image of|photo of|insert image|add image)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "insertImage", args: { query: text, newPage: false } },
      confirmText: buildConfirmText("insertImage", { newPage: false }),
    };
  }

  // 4. Quick Actions & Writing Transformations
  if (/\b(convert.*table|table.*convert|generate table|create table from text)\b/i.test(lower) && sel) {
    return {
      kind: "tool",
      call: { name: "generateTable", args: { topic: sel, newPage: false } },
      confirmText: buildConfirmText("generateTable", { newPage: false }),
    };
  }
  if (/\b(compliance|regulatory compliance)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "complianceFix", args: { text: sel } },
      confirmText: buildConfirmText("complianceFix", {}),
    };
  }
  if (/\b(improve writing|grammar|clarity|flow)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "improveWriting", args: { text: sel } },
      confirmText: buildConfirmText("improveWriting", {}),
    };
  }
  if (/\b(rewrite|regulatory tone|formal tone)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "regulatoryTone", args: { text: sel } },
      confirmText: buildConfirmText("regulatoryTone", {}),
    };
  }
  if (/\b(heading|generate heading)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "generateHeading", args: { topic: sel || "Clinical Study Evaluation", level: "h2" } },
      confirmText: buildConfirmText("generateHeading", {}),
    };
  }
  if (/\b(caption figure|caption)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "captionFigure", args: { context: sel || "Figure Representation" } },
      confirmText: buildConfirmText("captionFigure", {}),
    };
  }
  if (/\b(summarize|synopsis|summary)\b/i.test(lower)) {
    return {
      kind: "tool",
      call: { name: "summarizeSection", args: { text: sel, maxSentences: 3 } },
      confirmText: buildConfirmText("summarizeSection", {}),
    };
  }

  // 5. Direct Styles & Formatting
  if (/\b(bold|make bold)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "applyFormat", args: { format: "bold" } }, confirmText: "✅ Bold applied." };
  }
  if (/\b(italic)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "applyFormat", args: { format: "italic" } }, confirmText: "✅ Italic applied." };
  }
  if (/\b(underline)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "applyFormat", args: { format: "underline" } }, confirmText: "✅ Underline applied." };
  }
  if (/\b(upper case|uppercase)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "changeCase", args: { mode: "upper" } }, confirmText: "✅ UPPER CASE applied." };
  }
  if (/\b(lower case|lowercase)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "changeCase", args: { mode: "lower" } }, confirmText: "✅ lower case applied." };
  }
  if (/\b(title case)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "changeCase", args: { mode: "title" } }, confirmText: "✅ Title Case applied." };
  }
  if (/\b(page break|new page)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "insertPageBreak", args: {} }, confirmText: "✅ Page break inserted." };
  }
  if (/\b(section break)\b/i.test(lower)) {
    return { kind: "tool", call: { name: "insertSectionBreak", args: {} }, confirmText: "✅ Section break inserted." };
  }

  return null;
}

export async function sendMessage(message: string): Promise<string> {
  const client = getClient();
  if (!client) {
    const local = resolveLocalIntent(message);
    if (local && local.kind === "text") return local.text;
    return `AI Assistant received: "${message}". To enable full live generative responses, please add your Gemini API key in the .env file as VITE_GEMINI_API_KEY.`;
  }

  let lastError: unknown = null;

  for (const modelName of MODELS) {
    try {
      const response = await client.models.generateContent({ model: modelName, contents: message });
      const text = response.text ?? "";
      if (text) return text;
    } catch (err: unknown) {
      lastError = err;
    }
  }

  const local = resolveLocalIntent(message);
  if (local && local.kind === "text") return local.text;

  if (lastError instanceof Error) {
    let cleanMsg = lastError.message;
    try {
      const jsonStart = cleanMsg.indexOf('{');
      if (jsonStart !== -1) {
        const parsed = JSON.parse(cleanMsg.slice(jsonStart));
        if (parsed.error?.message) {
          cleanMsg = parsed.error.message;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(cleanMsg);
  }

  throw new Error("All Gemini models failed.");
}

export async function sendMessageWithTools(message: string, selectedDocText?: string): Promise<AIResponse> {
  const client = getClient();

  // If client is unavailable, use the offline intelligent clinical intent resolution
  if (!client) {
    const localResult = resolveLocalIntent(message, selectedDocText);
    if (localResult) {
      return localResult;
    }
    return {
      kind: "text",
      text: `I understand your request regarding "${message}".\n\n💡 Tip: Add your Google Gemini API key to your \`.env\` file (\`VITE_GEMINI_API_KEY=your_key\`) for open-ended generative chat and AI authoring. All built-in Quick Actions, Clinical Tables, Regulatory Citations, and Formatting commands are fully active.`,
    };
  }

  const effectiveMessage = selectedDocText && selectedDocText.trim().length > 0
    ? `[Selected Document Text]: "${selectedDocText.trim()}"\n\n[User Request]: ${message}`
    : message;

  let lastError: unknown = null;

  for (const modelName of MODELS) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: effectiveMessage,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];

      for (const part of parts) {
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          const confirmText = buildConfirmText(name as ToolCallName, (args as Record<string, unknown>) || {});
          return {
            kind: "tool",
            call: { name: name as ToolCallName, args: (args as Record<string, unknown>) || {} },
            confirmText,
          };
        }
      }

      const textParts = parts.filter(p => p.text).map(p => p.text).join('\n').trim();
      const text = textParts || response.text || "";
      if (text) {
        return { kind: "text", text };
      }
    } catch (err: unknown) {
      lastError = err;
    }
  }

  // Fallback to local intent if Gemini API call failed or busy
  const localResult = resolveLocalIntent(message, selectedDocText);
  if (localResult) return localResult;

  if (lastError instanceof Error) {
    let cleanMsg = lastError.message;
    try {
      const jsonStart = cleanMsg.indexOf('{');
      if (jsonStart !== -1) {
        const parsed = JSON.parse(cleanMsg.slice(jsonStart));
        if (parsed.error?.message) {
          cleanMsg = parsed.error.message;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(cleanMsg);
  }

  throw new Error("Unable to complete AI request. Please try again.");
}

export function buildConfirmText(name: ToolCallName, args: Record<string, unknown>): string {
  const onNewPage = args.newPage ? " on a new page" : "";
  switch (name) {
    case "createTable": return `✅ Table inserted${onNewPage}: ${args.rows}×${args.columns}.`;
    case "insertClinicalTable": return `✅ Clinical table: ${args.preset}.`;
    case "addTableData": { const d = args.data as string[][] | undefined; const n = d?.length || 0; return `✅ Added ${n} rows.`; }
    case "modifyTableStructure": return `✅ Table modified.`;
    case "deleteTable": return `✅ Table deleted.`;
    case "deletePage": return `✅ Deleted page(s): ${args.pages}.`;
    case "insertSectionBreak": return `✅ Section break inserted.`;
    case "insertPageBreak": return `✅ Page break inserted.`;
    case "addBookmark": return `✅ Bookmark "${args.name}" added.`;
    case "findText": return `✅ Highlighted "${args.query}".`;
    case "applyStyle": return `✅ Style: ${args.style}.`;
    case "changeCase": return `✅ Case: ${args.mode}.`;
    case "applyFormat": return `✅ ${args.format} applied.`;
    case "alignText": return `✅ Aligned: ${args.align}.`;
    case "changeFont": return `✅ Font: ${args.font}.`;
    case "changeFontSize": return `✅ Size: ${args.size}pt.`;
    case "insertSymbol": return `✅ Symbol: ${args.symbol}.`;
    case "changeOrientation": return `✅ Orientation: ${args.orientation}.`;
    case "setMargins": return `✅ Margins updated.`;
    case "insertCitation": return `✅ Citation: ${args.source}.`;
    case "insertFigureTemplate": return `✅ Figure: ${args.figure}.`;
    case "insertInternalRef": return `✅ Internal reference inserted.`;
    case "insertCrossRef": return `✅ Cross-reference inserted.`;
    case "insertAppendix": return `✅ Appendix: ${args.appendix}.`;
    case "loadTemplate": return `✅ Template loaded: ${args.template}.`;
    case "saveDocument": return `✅ Document saved.`;
    case "saveDocumentAs": return `✅ Saved as "${args.title}".`;
    case "exportPDF": return `✅ Exported as PDF.`;
    case "exportDOCX": return `✅ Exported as DOCX.`;
    case "toggleTrackChanges": return `✅ Track changes toggled.`;
    case "addText": return `✅ Text added${onNewPage}.`;
    case "insertImage": return `✅ Image inserted${onNewPage}.`;
    case "resizeImage": return `✅ Image resized.`;
    case "removeImage": return `✅ Image removed.`;
    case "addLink": return `✅ Link inserted.`;
    case "createList": return `✅ List inserted${onNewPage}.`;
    case "rewriteText": return `✅ Text rewritten.`;
    case "improveWriting": return `✅ Writing improved.`;
    case "generateHeading": return `✅ Heading generated${onNewPage}.`;
    case "generateTable": return `✅ Table generated${onNewPage}.`;
    case "captionFigure": return `✅ Caption generated.`;
    case "summarizeSection": return `✅ Section summarized.`;
    case "complianceFix": return `✅ Compliance fixed.`;
    case "regulatoryTone": return `✅ Regulatory tone applied.`;
    default: return "✅ Done.";
  }
}

export const aiApi = {
  getApiKey,
  sendMessage,
  sendMessageWithTools,
  buildConfirmText,
  resolveLocalIntent,
};

