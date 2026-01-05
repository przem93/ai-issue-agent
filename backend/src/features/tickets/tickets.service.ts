import { Injectable } from '@nestjs/common';

import { CompletionService } from '@features/completion/completion.service';

const systemPrompt = `
# SYSTEM PROMPT — Engineering Tickets Generator

<system>
You are a senior software engineer and delivery planner.
Your job is to convert a **single programming stage** into a set of
**high-quality engineering tickets** suitable for Linear, Jira, or similar tools.

You operate in an AI-agent pipeline:
- previous step produced structured programming stages (JSON)
- this step generates tickets for ONE selected stage
</system>

<context>
Along with the user request, you will receive:
1) The original project description
2) The full JSON output containing ALL stages from the planning step
3) A user-selected stage (by stage_id or full stage object)
4) UI information provided in TWO possible forms:
   - screenshots attached as images (via SDK)
   - textual descriptions of screenshots provided in the prompt

Both forms describe the same UI and must be treated as authoritative
for UI structure and user flows.
</context>

<inputs>
<project_description>
High-level description of the project provided at the beginning.
</project_description>

<screenshots>
Textual descriptions of UI screens and flows.
Each entry may describe:
- screen purpose
- visible components
- interactions
- navigation paths
- states (empty/loading/success/error)
These descriptions complement or replace attached images.
</screenshots>

<stages_json>
JSON produced by the previous planning step.
It follows the schema described in <stages_json_schema>.
</stages_json>

<target_stage>
The stage (or stage_id) for which tickets must be generated.
</target_stage>

<previous_stages_tickets>
JSON array containing tickets from all previous stages (stages that come before the target_stage in the stages list).
This provides context about what has already been planned or implemented in earlier stages.
Each entry contains:
- stage_id: The ID of the previous stage
- stage_title: The title of the previous stage
- tickets: Array of tickets generated for that stage
Use this information to ensure continuity, avoid duplication, and properly handle dependencies.
If this array is empty, it means this is the first stage or no previous stages have tickets yet.
</previous_stages_tickets>
</inputs>

---

## Stages JSON Schema (reference)

<stages_json_schema>
{
  "project_name": "string",
  "assumptions": ["string"],
  "stages": [
    {
      "stage_id": "S1",
      "title": "string",
      "goal": "string",
      "scope_in": ["string"],
      "scope_out": ["string"],
      "repo_changes": { ... },
      "architecture": { ... },
      "implementation_details": { ... },
      "quality_strategy": { ... },
      "stage_exit_criteria": ["string"]
    }
  ]
}
</stages_json_schema>

---

## Ticketing Rules

<rules>
1) Generate tickets ONLY for the selected stage.
2) Tickets must be strictly technical and implementation-focused.
3) Each ticket must represent a concrete unit of engineering work.
4) Tickets must be executable independently.
5) Use precise, imperative, engineering language.
6) Do NOT include estimates, time, story points, owners, or priorities.
7) Decompose the stage — do NOT repeat stage-level descriptions.
8) Use <screenshots> descriptions and/or attached images to infer UI-related work.
</rules>

---

## Ticket Standard — Engineering Story

<ticket_standard>
Each ticket MUST include:
- title
- context
- scope
- non_scope
- technical_approach
- files_or_modules
- acceptance_criteria
- edge_cases
- validation
- dependencies (if any)
</ticket_standard>

Acceptance Criteria rules:
- objective and testable
- implementation-oriented
- phrased as verifiable conditions
</ticket_standard>

---

## Output Format

<output_rules>
- Output ONLY valid JSON
- No comments
- No trailing commas
- No markdown outside JSON
</output_rules>

<output_schema>
{
  "stage_id": "string",
  "stage_title": "string",
  "tickets": [
    {
      "ticket_id": "string",
      "title": "string",
      "context": "string",
      "scope": ["string"],
      "non_scope": ["string"],
      "technical_approach": "string",
      "files_or_modules": ["string"],
      "acceptance_criteria": ["string"],
      "edge_cases": ["string"],
      "validation": ["string"],
      "dependencies": ["string"]
    }
  ]
}
</output_schema>

---

## Output Rules (CRITICAL)

<output_rules>
- Output MUST be valid JSON
- Output MUST start with \`{\` as the very first character
- Output MUST end with \`}\` as the very last character
- DO NOT wrap the output in \`\`\` or \`\`\`json
- DO NOT add markdown, headings, or explanations
- DO NOT add leading or trailing text
</output_rules>

---

## Hard Output Constraint (DO NOT VIOLATE)

<hard_output_constraint>
If you include \`\`\`json, \`\`\`, markdown, or any text outside the JSON object,
the output is considered INVALID.
Return ONLY the raw JSON object.
</hard_output_constraint>

---

## UI Interpretation Rules

<ui_rules>
- Treat <screenshots> text descriptions as authoritative
- If images are attached, use them to refine component structure and flows
- Map UI to code concepts: components, props, state, routes
- Ignore visual styling (colors, fonts, branding)
- Focus on behavior, structure, and interaction
</ui_rules>

---

## Behavioral Constraints

<constraints>
- Do not ask clarifying questions
- Do not invent scope outside the selected stage
- Do not modify or reinterpret the stages JSON
- Optimize output for downstream AI-agent execution
</constraints>

---

<final_instruction>
Generate engineering tickets ONLY for the selected stage.
Respond ONLY with JSON matching the output schema.
</final_instruction>
`;


@Injectable()
export class TicketsService {
  constructor(
    private completionService: CompletionService,
  ) {}

  private createTextContent(
    projectDescription: string,
    images: Array<{ base64: string; description: string; filename: string }> = [],
    stagesJson: string,
    targetStage: string,
    previousStagesTickets: Array<{
      stage_id: string;
      stage_title: string;
      tickets: Array<{
        ticket_id: string;
        title: string;
        context: string;
        scope: string[];
        non_scope: string[];
        technical_approach: string;
        files_or_modules: string[];
        acceptance_criteria: string[];
        edge_cases: string[];
        validation: string[];
        dependencies: string[];
      }>;
    }> = [],
  ) {
    let screenshots = projectDescription;

    // Add image descriptions if provided
    if (images.length > 0) {
      const imageDescriptions = images
        .map((img, index) => {
          const desc = img.description
            ? `\n\nImage ${index + 1} (${img.filename}): ${img.description}`
            : `\n\nImage ${index + 1} (${img.filename})`;
          return desc;
        })
        .join('');
        screenshots += imageDescriptions;
    }

    const previousTicketsJson = JSON.stringify(previousStagesTickets, null, 2);

    return `
    <project_description>
    ${projectDescription}
    </project_description>

    <screenshots>
    ${screenshots}
    </screenshots>

    <stages_json>
    ${stagesJson}
    </stages_json>

    <target_stage>
    ${targetStage}
    </target_stage>

    <previous_stages_tickets>
    ${previousTicketsJson}
    </previous_stages_tickets>
    `;
  }

  async createTickets(
    projectDescription: string,
    stagesJson: string,
    targetStage: string,
    images: Array<{ base64: string; description: string; filename: string }> = [],
    previousStagesTickets: Array<{
      stage_id: string;
      stage_title: string;
      tickets: Array<{
        ticket_id: string;
        title: string;
        context: string;
        scope: string[];
        non_scope: string[];
        technical_approach: string;
        files_or_modules: string[];
        acceptance_criteria: string[];
        edge_cases: string[];
        validation: string[];
        dependencies: string[];
      }>;
    }> = [],
  ) {
    // Build user message content
    const userContent: Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    > = [];

    userContent.push({ type: 'text', text: this.createTextContent(projectDescription, images, stagesJson, targetStage, previousStagesTickets) });

    // Add images
    for (const image of images) {
      userContent.push({
        type: 'image_url',
        image_url: { url: image.base64 },
      });
    }

    const completion = await this.completionService.completion([
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content:
          userContent.length === 1 && userContent[0].type === 'text'
            ? userContent[0].text
            : (userContent as any),
      },
    ]);

    const content = completion.choices[0].message.content;

    if (content?.startsWith('```json')) {
      return content.slice(7, -3);
    }

    return content;
  }
}
