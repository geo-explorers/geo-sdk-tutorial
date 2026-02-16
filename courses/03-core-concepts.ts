/**
 * ============================================================================
 * COURSE 3: Core Concepts - IDs, Properties, Types, Entities, Relations
 * ============================================================================
 *
 * OBJECTIVE: Understand the five fundamental building blocks of the
 * knowledge graph and how they work together.
 *
 * KEY CONCEPTS:
 * - IDs: Globally unique identifiers (dashless UUIDs)
 * - Properties: Data field definitions with types
 * - Types: Schemas that group properties (REUSE from root space!)
 * - Entities: Actual data instances
 * - Relations: Connections between entities
 *
 * IMPORTANT: The ROOT SPACE contains common types (Person, Project, Topic)
 * and properties (Name, Description, etc.) that you should REUSE rather
 * than creating new ones. This ensures interoperability across the graph.
 *
 * ============================================================================
 */

import { IdUtils, Graph } from "@geoprotocol/geo-sdk";
import { TYPES, PROPERTIES } from "../src/constants.js";

console.log("=== Course 3: Core Concepts ===\n");

// =============================================================================
// CONCEPT 1: IDs (Identifiers)
// =============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                         CONCEPT 1: IDs                                     ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Every piece of data in the knowledge graph needs a globally unique ID.   ║
║                                                                           ║
║  The Geo SDK uses DASHLESS UUIDs (32 hex characters):                     ║
║    ✓ 7ed45f2bc48b419e8e4664d5ff680b0d                                     ║
║    ✗ 7ed45f2b-c48b-419e-8e46-64d5ff680b0d  (NOT this format)              ║
║                                                                           ║
║  IDs are used for:                                                        ║
║    • Properties (field definitions)                                       ║
║    • Types (schemas)                                                      ║
║    • Entities (data instances)                                            ║
║    • Relations (connections)                                              ║
║    • Spaces (data containers)                                             ║
║                                                                           ║
║  You can generate IDs with IdUtils.generate() or let the SDK auto-        ║
║  generate them when you create properties, types, etc.                    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Generating IDs ---\n");

// Generate some IDs
const id1 = IdUtils.generate();
const id2 = IdUtils.generate();
const id3 = IdUtils.generate();

console.log(`  Generated IDs:`);
console.log(`    ${id1}`);
console.log(`    ${id2}`);
console.log(`    ${id3}`);
console.log(`\n  Format: ${id1.length} hex characters, no dashes`);

// =============================================================================
// CONCEPT 2: Properties
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                       CONCEPT 2: PROPERTIES                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Properties define WHAT DATA an entity can hold.                          ║
║                                                                           ║
║  Think of them as column definitions in a database:                       ║
║                                                                           ║
║    Property: "Name"         → stores TEXT                                 ║
║    Property: "Birth Date"   → stores DATE                                 ║
║    Property: "Web URL"      → stores TEXT                                 ║
║    Property: "Description"  → stores TEXT                                 ║
║                                                                           ║
║  ╔════════════════════════════════════════════════════════════════════╗   ║
║  ║  IMPORTANT: REUSE PROPERTIES FROM THE ROOT SPACE!                  ║   ║
║  ║                                                                    ║   ║
║  ║  Common properties already exist:                                  ║   ║
║  ║    • PROPERTIES.name        - Entity name                          ║   ║
║  ║    • PROPERTIES.description - Entity description                   ║   ║
║  ║    • PROPERTIES.web_url     - Website URL                          ║   ║
║  ║    • PROPERTIES.birth_date  - Birth date for people                ║   ║
║  ║    • PROPERTIES.topics      - Relation to topics                   ║   ║
║  ║                                                                    ║   ║
║  ║  Only create NEW properties for domain-specific fields!            ║   ║
║  ╚════════════════════════════════════════════════════════════════════╝   ║
║                                                                           ║
║  Available data types:                                                    ║
║  ┌───────────┬───────────────────────────────────────────┐                ║
║  │ TEXT      │ String values                             │                ║
║  │ INT64     │ 64-bit integers                           │                ║
║  │ FLOAT64   │ 64-bit floating point numbers             │                ║
║  │ DATE      │ Calendar dates (YYYY-MM-DD)               │                ║
║  │ RELATION  │ Links to other entities                   │                ║
║  └───────────┴───────────────────────────────────────────┘                ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Reusing Properties from Root Space ---\n");

// Show the existing properties from the root space
console.log(`  Root space properties (from src/constants.ts):`);
console.log(`    PROPERTIES.name:        ${PROPERTIES.name}`);
console.log(`    PROPERTIES.description: ${PROPERTIES.description}`);
console.log(`    PROPERTIES.web_url:     ${PROPERTIES.web_url}`);
console.log(`    PROPERTIES.birth_date:  ${PROPERTIES.birth_date}`);
console.log(`    PROPERTIES.topics:      ${PROPERTIES.topics}`);
console.log(`\n  These IDs reference properties that ALREADY EXIST in the root space.`);
console.log(`  Use them instead of creating duplicates!`);

// =============================================================================
// CONCEPT 3: Types (REUSE from Root Space!)
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                         CONCEPT 3: TYPES                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Types are SCHEMAS that group properties together.                        ║
║                                                                           ║
║  Think of them as classes or table definitions:                           ║
║                                                                           ║
║    ┌─────────────────────────────┐                                        ║
║    │ Type: "Person"              │                                        ║
║    ├─────────────────────────────┤                                        ║
║    │  - Name (TEXT)              │                                        ║
║    │  - Birth Date (DATE)        │                                        ║
║    │  - Web URL (TEXT)           │                                        ║
║    └─────────────────────────────┘                                        ║
║                                                                           ║
║  ╔════════════════════════════════════════════════════════════════════╗   ║
║  ║  IMPORTANT: REUSE TYPES FROM THE ROOT SPACE!                       ║   ║
║  ║                                                                    ║   ║
║  ║  The root space contains common types that you should USE:         ║   ║
║  ║    • TYPES.person  - For people                                    ║   ║
║  ║    • TYPES.project - For projects/organizations                    ║   ║
║  ║    • TYPES.topic   - For topics/tags                               ║   ║
║  ║    • TYPES.image   - For images                                    ║   ║
║  ║                                                                    ║   ║
║  ║  This ensures interoperability across the knowledge graph!         ║   ║
║  ╚════════════════════════════════════════════════════════════════════╝   ║
║                                                                           ║
║  An entity can have MULTIPLE types (like tags or interfaces).             ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Using Existing Types from Root Space ---\n");

// DON'T create new types like Person - use the existing ones!
console.log(`  Root space types (from src/constants.ts):`);
console.log(`    TYPES.person:  ${TYPES.person}`);
console.log(`    TYPES.project: ${TYPES.project}`);
console.log(`    TYPES.topic:   ${TYPES.topic}`);
console.log(`    TYPES.image:   ${TYPES.image}`);
console.log(`\n  These IDs reference types that ALREADY EXIST in the root space.`);
console.log(`  Using them makes your data interoperable with the whole graph!`);

// =============================================================================
// CONCEPT 4: Entities
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                        CONCEPT 4: ENTITIES                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Entities are the ACTUAL DATA in the knowledge graph.                     ║
║                                                                           ║
║  If Types are blueprints, Entities are the houses built from them:        ║
║                                                                           ║
║    ┌─────────────────────────────┐                                        ║
║    │ Entity: "Jane Developer"    │                                        ║
║    ├─────────────────────────────┤                                        ║
║    │  Type: Person               │                                        ║
║    │  Description: "A software   │                                        ║
║    │    engineer learning Geo"   │                                        ║
║    │  Web URL: "example.com"     │                                        ║
║    └─────────────────────────────┘                                        ║
║                                                                           ║
║  Each entity has:                                                         ║
║    • Unique ID - Globally unique identifier                               ║
║    • Name - Human-readable label                                          ║
║    • Types - One or more types it belongs to                              ║
║    • Values - Actual data for each property                               ║
║                                                                           ║
║  Values are stored separately and linked to entities via triples:         ║
║    (Entity) + (Property) + (Value) = Value Triple                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Creating an Entity ---\n");

// Use TYPES.person from the root space - NOT a newly created type!
// Use a FICTIONAL person name to avoid duplicating real people
const personEntity = Graph.createEntity({
  name: "Jane Developer",  // Fictional name - unique to this space
  types: [TYPES.person],   // Reuse the existing Person type!
  description: "A software engineer learning the Geo SDK",
  values: [
    // Use PROPERTIES from root space for common fields
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/jane" },
  ],
});

console.log(`  Created entity using ROOT SPACE type and properties:`);
console.log(`    Name: Jane Developer`);
console.log(`    ID: ${personEntity.id}`);
console.log(`    Type: TYPES.person (${TYPES.person})`);
console.log(`    Property: PROPERTIES.web_url`);
console.log(`\n  Note: We used a FICTIONAL name to avoid duplicating real people!`);

// =============================================================================
// CONCEPT 5: Relations
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                       CONCEPT 5: RELATIONS                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  Relations CONNECT entities with meaningful semantic edges.               ║
║                                                                           ║
║  This is what makes it a GRAPH, not just a database:                      ║
║                                                                           ║
║    ┌──────────────┐          ┌──────────────┐                             ║
║    │    Person    │──────────│    Topic     │                             ║
║    │              │ topics   │              │                             ║
║    └──────────────┘          └──────────────┘                             ║
║                                                                           ║
║  Each relation has:                                                       ║
║    • fromEntity - Where the relation starts                               ║
║    • toEntity   - Where the relation points                               ║
║    • type       - What kind of relationship (a property ID!)              ║
║                                                                           ║
║  Common relation types from root space:                                   ║
║    • PROPERTIES.topics - Links entities to topics                         ║
║    • PROPERTIES.blocks - Attaches content blocks                          ║
║    • PROPERTIES.avatar - Links to an avatar image                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

console.log("--- Example: Creating Relations ---\n");

// Create a topic entity (using root space type)
const topicEntity = Graph.createEntity({
  name: "Web3 Development",
  types: [TYPES.topic],
  description: "Building decentralized applications",
});

// Create a project entity (using root space type)
const projectEntity = Graph.createEntity({
  name: "Geo SDK Tutorial",
  types: [TYPES.project],
  description: "A learning project for the Geo SDK",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://github.com/example/geo-tutorial" },
  ],
});

// Create relations using root space properties
const topicRelation = Graph.createRelation({
  fromEntity: projectEntity.id,
  toEntity: topicEntity.id,
  type: PROPERTIES.topics,  // Reuse existing relation type!
});

console.log(`  Created entities:`);
console.log(`    Topic: "Web3 Development" (${topicEntity.id.slice(0, 8)}...)`);
console.log(`    Project: "Geo SDK Tutorial" (${projectEntity.id.slice(0, 8)}...)`);
console.log(`\n  Created relation:`);
console.log(`    "Geo SDK Tutorial" --[topics]--> "Web3 Development"`);
console.log(`    Relation type: PROPERTIES.topics (${PROPERTIES.topics})`);

// =============================================================================
// HOW IT ALL FITS TOGETHER
// =============================================================================

console.log(`

╔═══════════════════════════════════════════════════════════════════════════╗
║                    HOW IT ALL FITS TOGETHER                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║                        ┌─────────────┐                                    ║
║                        │ ROOT SPACE  │ ◄── Contains shared types &        ║
║                        │             │     properties to REUSE            ║
║                        └──────┬──────┘                                    ║
║                               │                                           ║
║            ┌──────────────────┼──────────────────┐                        ║
║            │                  │                  │                        ║
║            ▼                  ▼                  ▼                        ║
║     ┌────────────┐     ┌────────────┐     ┌────────────┐                  ║
║     │ PROPERTIES │     │   TYPES    │     │  ENTITIES  │                  ║
║     │ (Reuse!)   │     │ (Reuse!)   │     │ (Create)   │                  ║
║     └────────────┘     └────────────┘     └─────┬──────┘                  ║
║                                                 │                         ║
║                                           RELATIONS                       ║
║                                           (Connect)                       ║
║                                                 │                         ║
║                                                 ▼                         ║
║                                          ┌────────────┐                   ║
║                                          │  ENTITIES  │                   ║
║                                          └────────────┘                   ║
║                                                                           ║
║  Best Practices:                                                          ║
║    1. REUSE properties from PROPERTIES constant                           ║
║    2. REUSE types from TYPES constant                                     ║
║    3. QUERY first to check if an entity already exists before creating    ║
║    4. CONNECT entities with relations using existing properties           ║
║    5. Only CREATE new properties/types for domain-specific needs          ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
`);

// =============================================================================
// CHALLENGE: Create a Knowledge Graph
// =============================================================================

console.log("--- Challenge: Build a Small Knowledge Graph ---\n");

/**
 * CHALLENGE:
 * Create a small knowledge graph with:
 * - 2 Topics (using TYPES.topic)
 * - 1 Project (using TYPES.project)
 * - 1 Person (using TYPES.person)
 * - Relations connecting them
 *
 * Reuse root space types/properties! Only create entities if they don't already exist.
 */

console.log("Creating a knowledge graph using ROOT SPACE types...\n");

// Topics
const topic1 = Graph.createEntity({
  name: "Blockchain",
  types: [TYPES.topic],
  description: "Distributed ledger technology",
});

const topic2 = Graph.createEntity({
  name: "Knowledge Graphs",
  types: [TYPES.topic],
  description: "Structured representation of information",
});

// Person
const person = Graph.createEntity({
  name: "Alex Engineer",
  types: [TYPES.person],
  description: "A blockchain developer exploring knowledge graphs",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/alex" },
  ],
});

// Project
const project = Graph.createEntity({
  name: "Decentralized Wiki",
  types: [TYPES.project],
  description: "A wiki built on the Geo knowledge graph",
  values: [
    { property: PROPERTIES.web_url, type: "text", value: "https://example.com/wiki" },
  ],
});

// Relations
const rel1 = Graph.createRelation({
  fromEntity: project.id,
  toEntity: topic1.id,
  type: PROPERTIES.topics,
});

const rel2 = Graph.createRelation({
  fromEntity: project.id,
  toEntity: topic2.id,
  type: PROPERTIES.topics,
});

// Count all operations
const allOps = [
  ...topic1.ops,
  ...topic2.ops,
  ...person.ops,
  ...project.ops,
  ...rel1.ops,
  ...rel2.ops,
];

console.log(`  Entities created (using root space types):`);
console.log(`    - Topic: "Blockchain" (${topic1.id.slice(0, 8)}...)`);
console.log(`    - Topic: "Knowledge Graphs" (${topic2.id.slice(0, 8)}...)`);
console.log(`    - Person: "Alex Engineer" (${person.id.slice(0, 8)}...)`);
console.log(`    - Project: "Decentralized Wiki" (${project.id.slice(0, 8)}...)`);

console.log(`\n  Relations created:`);
console.log(`    - "Decentralized Wiki" --[topics]--> "Blockchain"`);
console.log(`    - "Decentralized Wiki" --[topics]--> "Knowledge Graphs"`);

console.log(`\n  Total operations: ${allOps.length}`);
console.log(`\n  Key pattern: We REUSED types and properties from the root space!`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Now that you understand the core concepts, Course 4 will show you");
console.log("when to REUSE vs. when to CREATE new properties and types.");
console.log("You'll learn to design schemas for domain-specific data.");
console.log("\nRun: npm run course4");
