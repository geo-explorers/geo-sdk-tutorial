/**
 * ============================================================================
 * COURSE 13: Batch Import - Loading Data from JSON Files
 * ============================================================================
 *
 * OBJECTIVE: Learn patterns for importing structured data from JSON files
 * into the knowledge graph, including property registries and relation building.
 *
 * KEY CONCEPTS:
 * - Property registry pattern for consistent value extraction
 * - Reading data from JSON files
 * - Building entities with references to other entities
 * - Creating relations from reference fields
 * - Batch operation handling
 *
 * REQUIREMENTS:
 * - Set PRIVATE_KEY environment variable (export from https://www.geobrowser.io/export-wallet)
 *
 * ============================================================================
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Graph } from "@geoprotocol/geo-sdk";
import type { Op, Id } from "@geoprotocol/geo-sdk";

// Import shared utilities
import { publishOps, printOpsSummary } from "../src/functions.js";
import { TYPES, PROPERTIES } from "../src/constants.js";

// Get current directory for relative imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=== Course 13: Batch Import from JSON Files ===\n");

/**
 * EXPLANATION:
 *
 * When importing data from external sources (JSON, CSV, APIs), you need:
 *
 * 1. PROPERTY REGISTRY
 *    A mapping of field names to property IDs, so you can extract values
 *    consistently across all records.
 *
 * 2. ENTITY LOOKUP
 *    A way to reference previously created entities when building relations.
 *    Often uses a Map<name, entityId> pattern.
 *
 * 3. BATCH OPERATIONS
 *    Collect all operations first, then publish in one transaction.
 *    This is more efficient and ensures atomic commits.
 *
 * 4. RELATION BUILDING
 *    Parse reference fields (like "topics": ["AI", "ML"]) and create
 *    relations to the referenced entities.
 */

// =============================================================================
// STEP 1: Define Schema and Property Registry
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Step 1: Define Schema and Property Registry");
console.log("═══════════════════════════════════════════════════════════════\n");

interface PropertyRegistry {
  // Value properties (map field names to property IDs)
  name: Id;
  description: Id;
  web_url: Id;
  // Relation properties
  topics: Id;
  founders: Id;
}

interface TypeRegistry {
  topic: Id;
  person: Id;
  project: Id;
}

function createSchema(): { props: PropertyRegistry; types: TypeRegistry; ops: Op[] } {
  // IMPORTANT: Reuse types and properties from the root space!
  // Only create properties that don't exist in the root space.
  const ops: Op[] = [];

  // Create ONLY the custom "founders" relation property
  // All other properties exist in the root space!
  const foundersProp = Graph.createProperty({ name: "Founders", dataType: "RELATION" });
  ops.push(...foundersProp.ops);

  console.log(`  Reusing ROOT SPACE properties: name, description, web_url, topics`);
  console.log(`  Created 1 custom property: Founders (relation)`);
  console.log(`  Reusing ROOT SPACE types: Topic, Person, Project`);

  return {
    props: {
      // Reuse from root space (cast to Id for type safety)
      name: PROPERTIES.name as Id,
      description: PROPERTIES.description as Id,
      web_url: PROPERTIES.web_url as Id,
      topics: PROPERTIES.topics as Id,  // Reuse root space relation type!
      founders: foundersProp.id,         // Custom relation
    },
    types: {
      // Reuse from root space - no need to create these!
      topic: TYPES.topic as Id,
      person: TYPES.person as Id,
      project: TYPES.project as Id,
    },
    ops,
  };
}

const schema = createSchema();

// =============================================================================
// STEP 2: Load JSON Data Files
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Step 2: Load JSON Data Files");
console.log("═══════════════════════════════════════════════════════════════\n");

interface TopicData {
  name: string;
  description: string;
}

interface PersonData {
  name: string;
  description: string;
  topics?: string[];
}

interface ProjectData {
  name: string;
  description: string;
  topics?: string[];
  founders?: string[];
}

function loadJsonFile<T>(filename: string): T[] {
  const filepath = join(__dirname, "..", "data_to_publish", filename);
  const content = readFileSync(filepath, "utf-8");
  return JSON.parse(content) as T[];
}

const topicsData = loadJsonFile<TopicData>("topics.json");
const peopleData = loadJsonFile<PersonData>("people.json");
const projectsData = loadJsonFile<ProjectData>("projects.json");

console.log(`  Loaded ${topicsData.length} topics from topics.json`);
console.log(`  Loaded ${peopleData.length} people from people.json`);
console.log(`  Loaded ${projectsData.length} projects from projects.json`);

// =============================================================================
// STEP 3: Import Topics (Base Entities)
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Step 3: Import Topics (Base Entities)");
console.log("═══════════════════════════════════════════════════════════════\n");

// Entity lookup maps - used for building relations later
const topicLookup = new Map<string, Id>();
const personLookup = new Map<string, Id>();

function importTopics(
  data: TopicData[],
  props: PropertyRegistry,
  types: TypeRegistry
): Op[] {
  const ops: Op[] = [];

  for (const topic of data) {
    const entity = Graph.createEntity({
      name: topic.name,
      types: [types.topic],
      values: [
        { property: props.name, type: "text", value: topic.name },
        { property: props.description, type: "text", value: topic.description },
      ],
    });
    ops.push(...entity.ops);

    // Store in lookup for later reference
    topicLookup.set(topic.name, entity.id);
    console.log(`  Topic: ${topic.name}`);
  }

  return ops;
}

const topicOps = importTopics(topicsData, schema.props, schema.types);

// =============================================================================
// STEP 4: Import People (with Topic Relations)
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Step 4: Import People (with Topic Relations)");
console.log("═══════════════════════════════════════════════════════════════\n");

function importPeople(
  data: PersonData[],
  props: PropertyRegistry,
  types: TypeRegistry
): Op[] {
  const ops: Op[] = [];

  for (const person of data) {
    // Create person entity
    const entity = Graph.createEntity({
      name: person.name,
      types: [types.person],
      values: [
        { property: props.name, type: "text", value: person.name },
        { property: props.description, type: "text", value: person.description },
      ],
    });
    ops.push(...entity.ops);
    personLookup.set(person.name, entity.id);

    // Create relations to topics
    if (person.topics) {
      for (const topicName of person.topics) {
        const topicId = topicLookup.get(topicName);
        if (topicId) {
          const relation = Graph.createRelation({
            fromEntity: entity.id,
            toEntity: topicId,
            type: props.topics,
          });
          ops.push(...relation.ops);
        } else {
          console.log(`    Warning: Topic not found: ${topicName}`);
        }
      }
    }

    const topicCount = person.topics?.length || 0;
    console.log(`  Person: ${person.name} (${topicCount} topics)`);
  }

  return ops;
}

const peopleOps = importPeople(peopleData, schema.props, schema.types);

// =============================================================================
// STEP 5: Import Projects (with Topic and Founder Relations)
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Step 5: Import Projects (with Topic and Founder Relations)");
console.log("═══════════════════════════════════════════════════════════════\n");

function importProjects(
  data: ProjectData[],
  props: PropertyRegistry,
  types: TypeRegistry
): Op[] {
  const ops: Op[] = [];

  for (const project of data) {
    // Create project entity
    const entity = Graph.createEntity({
      name: project.name,
      types: [types.project],
      values: [
        { property: props.name, type: "text", value: project.name },
        { property: props.description, type: "text", value: project.description },
      ],
    });
    ops.push(...entity.ops);

    // Create relations to topics
    if (project.topics) {
      for (const topicName of project.topics) {
        const topicId = topicLookup.get(topicName);
        if (topicId) {
          const relation = Graph.createRelation({
            fromEntity: entity.id,
            toEntity: topicId,
            type: props.topics,
          });
          ops.push(...relation.ops);
        }
      }
    }

    // Create relations to founders
    if (project.founders) {
      for (const founderName of project.founders) {
        const personId = personLookup.get(founderName);
        if (personId) {
          const relation = Graph.createRelation({
            fromEntity: entity.id,
            toEntity: personId,
            type: props.founders,
          });
          ops.push(...relation.ops);
        } else {
          console.log(`    Warning: Person not found: ${founderName}`);
        }
      }
    }

    const topicCount = project.topics?.length || 0;
    const founderCount = project.founders?.length || 0;
    console.log(`  Project: ${project.name} (${topicCount} topics, ${founderCount} founders)`);
  }

  return ops;
}

const projectOps = importProjects(projectsData, schema.props, schema.types);

// =============================================================================
// STEP 6: Visualize the Knowledge Graph
// =============================================================================

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  Step 6: Knowledge Graph Visualization");
console.log("═══════════════════════════════════════════════════════════════\n");

console.log(`
  Imported Knowledge Graph (using data_to_publish/*.json):
  ────────────────────────────────────────────────────────

  Topics (${topicsData.length}):
  ├── (Topics from topics.json)
  └── Connected to people and projects

  People (${peopleData.length}):
  ├── (People from people.json)
  └── Each connected to relevant topics

  Projects (${projectsData.length}):
  ├── (Projects from projects.json)
  ├── Connected to topics
  └── Some have founder relations

  Note: This example loads from JSON files in data_to_publish/
  In production, replace with your own data files!
`);

// =============================================================================
// OPERATION SUMMARY
// =============================================================================

console.log("═══════════════════════════════════════════════════════════════");
console.log("  Operation Summary");
console.log("═══════════════════════════════════════════════════════════════\n");

const allOps = [
  ...schema.ops,
  ...topicOps,
  ...peopleOps,
  ...projectOps,
];

printOpsSummary(allOps);

console.log(`
  Breakdown by Data Source:
  ─────────────────────────
  - Schema (types/properties): ${schema.ops.length} ops
  - Topics: ${topicOps.length} ops (${topicsData.length} entities)
  - People: ${peopleOps.length} ops (${peopleData.length} entities + relations)
  - Projects: ${projectOps.length} ops (${projectsData.length} entities + relations)
  ────────────────────────────
  Total: ${allOps.length} operations
`);

// =============================================================================
// CHALLENGE: Add a Property Value Extractor
// =============================================================================
/**
 * CHALLENGE:
 * Create a generic function that extracts values from a JSON object
 * based on a property registry mapping.
 *
 * This pattern is useful when you have many properties and want to
 * automatically generate the values array for createEntity.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// type ValueType = "text" | "int64" | "float64" | "bool" | "date";
//
// interface PropertyMapping {
//   field: string;
//   propertyId: string;
//   type: ValueType;
// }
//
// function extractValues(
//   data: Record<string, unknown>,
//   mappings: PropertyMapping[]
// ): Array<{ property: string; type: ValueType; value: unknown }> {
//   // Extract values based on mappings
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: Property Value Extractor ---\n");

type ValueType = "text" | "int64" | "float64" | "bool" | "date";

interface PropertyMapping {
  field: string;
  propertyId: string;
  type: ValueType;
}

function extractValues(
  data: Record<string, unknown>,
  mappings: PropertyMapping[]
): Array<{ property: string; type: ValueType; value: unknown }> {
  const values: Array<{ property: string; type: ValueType; value: unknown }> = [];

  for (const mapping of mappings) {
    const value = data[mapping.field];
    if (value !== undefined && value !== null) {
      values.push({
        property: mapping.propertyId,
        type: mapping.type,
        value,
      });
    }
  }

  return values;
}

// Demo the extractor
const sampleMappings: PropertyMapping[] = [
  { field: "name", propertyId: schema.props.name, type: "text" },
  { field: "description", propertyId: schema.props.description, type: "text" },
];

const sampleData = { name: "Test Entity", description: "A test description" };
const extractedValues = extractValues(sampleData, sampleMappings);

console.log("  Sample extraction:");
console.log(`  Input: ${JSON.stringify(sampleData)}`);
console.log(`  Mappings: name -> ${schema.props.name.slice(0, 8)}..., description -> ${schema.props.description.slice(0, 8)}...`);
console.log(`  Output: ${extractedValues.length} values extracted`);

// =============================================================================
// RUN THE EXAMPLE
// =============================================================================

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

if (!PRIVATE_KEY) {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                    CONFIGURATION NEEDED                     │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  To publish this batch import, set PRIVATE_KEY env variable:│
  │                                                             │
  │  export PRIVATE_KEY="0x..."                                 │
  │                                                             │
  │  Get your private key from:                                 │
  │  https://www.geobrowser.io/export-wallet                    │
  │                                                             │
  │  Created ${allOps.length} operations (not published)                  │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
  `);
} else {
  console.log("\n--- Publishing Batch Import ---\n");

  const result = await publishOps({
    ops: allOps,
    editName: "Batch Import: Tech Leaders & Projects",
    privateKey: PRIVATE_KEY,
    useSmartAccount: true,
    network: "TESTNET",
  });

  if (result.success) {
    console.log(`  Published successfully!`);
    console.log(`  Space ID: ${result.spaceId}`);
    console.log(`  Edit ID: ${result.editId}`);
    console.log(`  CID: ${result.cid}`);
    console.log(`  Transaction: ${result.transactionHash}`);
  } else {
    console.error(`  Publishing failed: ${result.error}`);
  }
}

// =============================================================================
// CODE SUMMARY
// =============================================================================

console.log("\n--- Code Summary ---\n");
console.log(`
  // ─────────────────────────────────────────────────────────────
  // 1. Property Registry Pattern
  // ─────────────────────────────────────────────────────────────
  interface PropertyRegistry {
    name: string;          // Property ID for "name" field
    description: string;   // Property ID for "description" field
    topics: string;        // Relation property ID
  }

  const props: PropertyRegistry = {
    name: Graph.createProperty({ name: "Name", dataType: "TEXT" }).id,
    description: Graph.createProperty({ name: "Description", dataType: "TEXT" }).id,
    topics: Graph.createProperty({ name: "Topics", dataType: "RELATION" }).id,
  };

  // ─────────────────────────────────────────────────────────────
  // 2. Entity Lookup Pattern
  // ─────────────────────────────────────────────────────────────
  const entityLookup = new Map<string, string>();

  // Store entity IDs by name for later reference
  for (const item of data) {
    const entity = Graph.createEntity({ name: item.name, ... });
    entityLookup.set(item.name, entity.id);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Relation Building from References
  // ─────────────────────────────────────────────────────────────
  if (item.topics) {
    for (const topicName of item.topics) {
      const topicId = entityLookup.get(topicName);
      if (topicId) {
        Graph.createRelation({
          fromEntity: entity.id,
          toEntity: topicId,
          type: props.topics,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Batch Collection
  // ─────────────────────────────────────────────────────────────
  const allOps = [
    ...schemaOps,
    ...topicOps,
    ...peopleOps,
    ...projectOps,
  ];

  await publishOps({
    ops: allOps,
    editName: "Batch Import",
    privateKey,
  });
`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("--- What's Next? ---");
console.log("Course 14 is the CAPSTONE PROJECT where you'll build a");
console.log("complete Recipe Book application using ALL the concepts");
console.log("from the entire curriculum.\n");
console.log("Run: npm run capstone");
