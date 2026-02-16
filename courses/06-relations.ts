/**
 * ============================================================================
 * COURSE 6: Connecting Entities with Relations
 * ============================================================================
 *
 * OBJECTIVE: Learn to create semantic relations between entities,
 * transforming isolated data into an interconnected knowledge graph.
 *
 * KEY CONCEPTS:
 * - Relations as connections between entities
 * - Graph.createRelation() function
 * - REUSING relation types from root space (PROPERTIES.topics, etc.)
 * - Building a connected graph
 *
 * IMPORTANT: Relation types are just property IDs! Use existing ones
 * from the root space (like PROPERTIES.topics) when possible.
 *
 * ============================================================================
 */

import { Graph } from "@geoprotocol/geo-sdk";
import type { Id } from "@geoprotocol/geo-sdk";
import { TYPES, PROPERTIES } from "../src/constants.js";

/**
 * EXPLANATION:
 *
 * Relations are what make a knowledge graph a GRAPH.
 * They connect entities with meaningful semantic relationships.
 *
 * Examples:
 * - Project "has topics" Topic
 * - Person "works on" Project
 * - Entity "has blocks" TextBlock
 *
 * Each relation has:
 * 1. A relation type - A property ID that defines the relationship
 * 2. A source entity (fromEntity) - Where the relation starts
 * 3. A target entity (toEntity) - Where the relation points
 *
 * IMPORTANT: Use existing relation types from root space:
 * - PROPERTIES.topics - Links to topics
 * - PROPERTIES.blocks - Attaches content blocks
 * - PROPERTIES.avatar - Links to avatar image
 *
 * Relations are directional but can be traversed both ways in queries.
 */

console.log("=== Course 6: Connecting Entities with Relations ===\n");

// =============================================================================
// CONCEPT: Relations ARE Properties
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                      RELATIONS ARE PROPERTIES                              ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  In Geo SDK, relations are properties with dataType: "RELATION"           ║
║  The 'type' parameter in createRelation() is a property ID.               ║
║                                                                           ║
║  The root space defines common relation properties:                       ║
║    • PROPERTIES.topics   - Links entities to topics                       ║
║    • PROPERTIES.blocks   - Attaches content blocks                        ║
║    • PROPERTIES.avatar   - Links to an avatar image                       ║
║    • PROPERTIES.cover    - Links to a cover image                         ║
║                                                                           ║
║  When you need a custom relation, create a property with:                 ║
║    dataType: "RELATION"                                                   ║
║                                                                           ║
║  Graph.createRelation() connects:                                         ║
║    fromEntity --[type]--> toEntity                                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Root Space Relation Properties ---\n");

console.log(`  Available relation properties from PROPERTIES:`);
console.log(`    PROPERTIES.topics:  ${PROPERTIES.topics}`);
console.log(`    PROPERTIES.blocks:  ${PROPERTIES.blocks}`);
console.log(`    PROPERTIES.avatar:  ${PROPERTIES.avatar}`);
console.log(`    PROPERTIES.cover:   ${PROPERTIES.cover}`);

// =============================================================================
// EXAMPLE: Connecting Projects to Topics
// =============================================================================

console.log("\n--- Example: Connecting a Project to Topics ---\n");

// Create topics using TYPES.topic
const topic1 = Graph.createEntity({
  name: "Decentralization",
  types: [TYPES.topic],
  description: "Distributed systems without central authority",
});

const topic2 = Graph.createEntity({
  name: "Open Source",
  types: [TYPES.topic],
  description: "Software with publicly available source code",
});

console.log(`  Created topics:`);
console.log(`    - "Decentralization" (${topic1.id.slice(0, 8)}...)`);
console.log(`    - "Open Source" (${topic2.id.slice(0, 8)}...)`);

// Create a project using TYPES.project
const project = Graph.createEntity({
  name: "Community Data Platform",
  types: [TYPES.project],
  description: "An open platform for community-driven data curation",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/cdp" },
  ],
});

console.log(`\n  Created project:`);
console.log(`    - "Community Data Platform" (${project.id.slice(0, 8)}...)`);

// Create relations using PROPERTIES.topics
const rel1 = Graph.createRelation({
  fromEntity: project.id,
  toEntity: topic1.id,
  type: PROPERTIES.topics,  // Reuse existing relation type!
});

const rel2 = Graph.createRelation({
  fromEntity: project.id,
  toEntity: topic2.id,
  type: PROPERTIES.topics,
});

console.log(`\n  Created relations using PROPERTIES.topics:`);
console.log(`    - "Community Data Platform" --[topics]--> "Decentralization"`);
console.log(`    - "Community Data Platform" --[topics]--> "Open Source"`);

// =============================================================================
// CHALLENGE: Build a Team Knowledge Graph
// =============================================================================

console.log("\n--- Challenge: Build a Team Knowledge Graph ---\n");

/**
 * CHALLENGE:
 * Create a knowledge graph representing a team:
 * - 3 Topics (using TYPES.topic)
 * - 2 People (using TYPES.person)
 * - 1 Project (using TYPES.project)
 * - Connect the project to its topics
 *
 * Use TYPES and PROPERTIES from the root space!
 */

console.log("Building a team knowledge graph...\n");

// Topics
const topicAI = Graph.createEntity({
  name: "Artificial Intelligence",
  types: [TYPES.topic],
  description: "Machine learning and AI systems",
});

const topicWeb = Graph.createEntity({
  name: "Web Development",
  types: [TYPES.topic],
  description: "Building web applications",
});

const topicData = Graph.createEntity({
  name: "Data Science",
  types: [TYPES.topic],
  description: "Analyzing and interpreting data",
});

console.log("Step 1: Created topics");
console.log(`  - AI: ${topicAI.id.slice(0, 8)}...`);
console.log(`  - Web: ${topicWeb.id.slice(0, 8)}...`);
console.log(`  - Data: ${topicData.id.slice(0, 8)}...`);

// People
const person1 = Graph.createEntity({
  name: "Sam Architect",
  types: [TYPES.person],
  description: "A senior software architect",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/sam" },
  ],
});

const person2 = Graph.createEntity({
  name: "Jordan Analyst",
  types: [TYPES.person],
  description: "A data analyst and ML specialist",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/jordan" },
  ],
});

console.log("\nStep 2: Created people");
console.log(`  - Sam Architect: ${person1.id.slice(0, 8)}...`);
console.log(`  - Jordan Analyst: ${person2.id.slice(0, 8)}...`);

// Project
const teamProject = Graph.createEntity({
  name: "Smart Dashboard",
  types: [TYPES.project],
  description: "An AI-powered analytics dashboard",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/dashboard" },
  ],
});

console.log("\nStep 3: Created project");
console.log(`  - Smart Dashboard: ${teamProject.id.slice(0, 8)}...`);

// Relations
const projectRelations: Id[] = [];

const relAI = Graph.createRelation({
  fromEntity: teamProject.id,
  toEntity: topicAI.id,
  type: PROPERTIES.topics,
});
projectRelations.push(relAI.id);

const relWeb = Graph.createRelation({
  fromEntity: teamProject.id,
  toEntity: topicWeb.id,
  type: PROPERTIES.topics,
});
projectRelations.push(relWeb.id);

const relData = Graph.createRelation({
  fromEntity: teamProject.id,
  toEntity: topicData.id,
  type: PROPERTIES.topics,
});
projectRelations.push(relData.id);

console.log("\nStep 4: Created relations");
console.log("  Project topics:");
console.log(`    - "Smart Dashboard" --[topics]--> "Artificial Intelligence"`);
console.log(`    - "Smart Dashboard" --[topics]--> "Web Development"`);
console.log(`    - "Smart Dashboard" --[topics]--> "Data Science"`);

// Visualize
console.log(`

┌─────────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE GRAPH                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                   ┌───────────────────────┐                     │
│                   │    Smart Dashboard    │                     │
│                   │      (Project)        │                     │
│                   └───────────┬───────────┘                     │
│                              │││                                │
│              ┌───────────────┘│└───────────────┐                │
│              │                │                │                │
│           topics           topics           topics              │
│              │                │                │                │
│              ▼                ▼                ▼                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Artificial  │  │     Web      │  │    Data      │         │
│   │ Intelligence │  │ Development  │  │   Science    │         │
│   │   (Topic)    │  │   (Topic)    │  │   (Topic)    │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐                           │
│   │     Sam      │  │    Jordan    │                           │
│   │  Architect   │  │   Analyst    │                           │
│   │   (Person)   │  │   (Person)   │                           │
│   └──────────────┘  └──────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

`);

// Summary
console.log("--- Graph Summary ---");
console.log(`  Entities: 6`);
console.log(`    - 3 Topics (using TYPES.topic)`);
console.log(`    - 2 People (using TYPES.person)`);
console.log(`    - 1 Project (using TYPES.project)`);
console.log(`  Relations: ${projectRelations.length} (using PROPERTIES.topics)`);

console.log("\n--- Key Pattern: REUSE relation types! ---");
console.log(`  We used PROPERTIES.topics (${PROPERTIES.topics})`);
console.log(`  instead of creating a custom "Topics" relation type.`);
console.log(`  This makes our data interoperable with other spaces!`);

// Show traversal potential
console.log("\n--- Query Potential ---");
console.log("From this graph, you could query:");
console.log("  - 'What topics does Smart Dashboard cover?'");
console.log("  - 'What projects are about Artificial Intelligence?'");
console.log("  - 'List all people and projects in this space'");

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("You've built a complete local knowledge graph structure.");
console.log("In Course 7, you'll learn about OPERATIONS and EDITS -");
console.log("how to package your changes for submission to the network.");
console.log("\nRun: npm run course7");
