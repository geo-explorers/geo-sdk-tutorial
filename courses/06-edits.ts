/**
 * ============================================================================
 * COURSE 6: Understanding Operations and Edits
 * ============================================================================
 *
 * OBJECTIVE: Learn how operations are grouped into Edits, understanding
 * the data mutation model that underlies all changes to the knowledge graph.
 *
 * KEY CONCEPTS:
 * - Operations (Ops) as atomic changes
 * - Edits as grouped operations
 * - The Edit lifecycle
 * - Preparing data for submission
 *
 * ============================================================================
 */

import { IdUtils, Graph } from "@geoprotocol/geo-sdk";
import type { Op } from "@geoprotocol/geo-sdk";

/**
 * EXPLANATION:
 *
 * Every Graph.* function you've used returns a result with `ops` - an array
 * of Operations. Operations are atomic, low-level mutations:
 * - Create property
 * - Create type
 * - Create entity
 * - Set property value
 * - Create relation
 * - Delete entity
 * - etc.
 *
 * Operations are grouped into EDITS. An Edit is a collection of
 * operations that:
 * 1. Are logically related
 * 2. Should be applied together atomically
 * 3. Are submitted as a single unit
 *
 * Think of it like a database transaction - all operations in an Edit
 * succeed or fail together.
 */

console.log("=== Course 6: Operations and Edits ===\n");

// =============================================================================
// UNDERSTANDING OPERATIONS
// =============================================================================

console.log("--- Understanding Operations ---\n");

// Each Graph.* call returns { id, ops } where ops is an array of operations
const propertyResult = Graph.createProperty({
  name: "Example Property",
  dataType: "TEXT",
});

console.log("Result from createProperty:");
console.log(`  ID: ${propertyResult.id}`);
console.log(`  Operations: ${propertyResult.ops.length} op(s)`);
console.log(`  Op type: ${typeof propertyResult.ops[0]}`);
console.log("");

// Multiple operations can be collected
const typeResult = Graph.createType({
  name: "Example Type",
  properties: [propertyResult.id],
});

const entityResult = Graph.createEntity({
  name: "Example Entity",
  types: [typeResult.id],
  values: [
    { property: propertyResult.id, type: "text", value: "Hello World" },
  ],
});

console.log("Collected operations from 3 calls:");
console.log(`  1. Create Property: ${propertyResult.ops.length} op(s)`);
console.log(`  2. Create Type: ${typeResult.ops.length} op(s)`);
console.log(`  3. Create Entity: ${entityResult.ops.length} op(s)`);

// Combine all ops
const allOps = [
  ...propertyResult.ops,
  ...typeResult.ops,
  ...entityResult.ops,
];
console.log(`  Total: ${allOps.length} operations`);

// =============================================================================
// UNDERSTANDING EDITS
// =============================================================================

console.log("\n--- Understanding Edits ---\n");

console.log(`
  An EDIT groups operations together:

  ┌─────────────────────────────────────────────────────────────┐
  │                         EDIT                                │
  │  Name: "Add Book to Library"                                │
  │  Author: 0x1234...                                          │
  │  Timestamp: 2024-01-15T10:30:00Z                            │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  Operations (ops):                                          │
  │    ┌─────────────────────────────────┐                      │
  │    │ 1. Create "Title" property      │                      │
  │    └─────────────────────────────────┘                      │
  │    ┌─────────────────────────────────┐                      │
  │    │ 2. Create "Book" type           │                      │
  │    └─────────────────────────────────┘                      │
  │    ┌─────────────────────────────────┐                      │
  │    │ 3. Create book entity           │                      │
  │    └─────────────────────────────────┘                      │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
`);

// =============================================================================
// CHALLENGE: Structured Edit Builder
// =============================================================================
/**
 * CHALLENGE:
 * Create a helper function that organizes operations into a well-structured
 * Edit. The function should accept a name and array of operations, returning
 * a properly formatted Edit object.
 *
 * Try it yourself first, then scroll down for the solution!
 */

// YOUR CODE HERE:
// interface GeoEdit {
//   id: string;
//   name: string;
//   ops: Op[];
//   createdAt: Date;
// }
//
// function createEdit(name: string, ops: Op[]): GeoEdit {
//   // Build and return the edit
// }

// =============================================================================
// SOLUTION
// =============================================================================

console.log("--- Challenge Solution: Edit Builder ---\n");

// Edit interface
interface Edit {
  id: string;
  name: string;
  ops: Op[];
  createdAt: Date;
}

// Edit builder function
function createEdit(name: string, ops: Op[]): Edit {
  return {
    id: IdUtils.generate(),
    name,
    ops,
    createdAt: new Date(),
  };
}

// ========== DEMONSTRATE THE EDIT BUILDER ==========

// Create some operations
const titleResult = Graph.createProperty({
  name: "Title",
  dataType: "TEXT",
});

const bookTypeResult = Graph.createType({
  name: "Book",
  properties: [titleResult.id],
});

const bookEntityResult = Graph.createEntity({
  name: "The Great Gatsby",
  types: [bookTypeResult.id],
  values: [
    { property: titleResult.id, type: "text", value: "The Great Gatsby" },
  ],
});

// Build Edit 1: Schema Setup
const schemaEdit = createEdit(
  "Library Schema Setup",
  [...titleResult.ops, ...bookTypeResult.ops]
);

console.log("Edit 1: Schema Setup");
console.log(`  ID: ${schemaEdit.id.slice(0, 8)}...`);
console.log(`  Name: ${schemaEdit.name}`);
console.log(`  Operations: ${schemaEdit.ops.length}`);
console.log(`  Created: ${schemaEdit.createdAt.toISOString()}`);

// Build Edit 2: Add Book
const bookEdit = createEdit(
  "Add The Great Gatsby",
  bookEntityResult.ops
);

console.log("\nEdit 2: Add Book");
console.log(`  ID: ${bookEdit.id.slice(0, 8)}...`);
console.log(`  Name: ${bookEdit.name}`);
console.log(`  Operations: ${bookEdit.ops.length}`);

// ========== EDIT LIFECYCLE ==========

console.log(`

  ┌─────────────────────────────────────────────────────────────┐
  │                      EDIT LIFECYCLE                         │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  1. CREATE OPERATIONS                                       │
  │     Graph.createProperty() → { id, ops }                    │
  │     Graph.createEntity() → { id, ops }                      │
  │     Graph.createRelation() → { id, ops }                    │
  │           │                                                 │
  │           ▼                                                 │
  │  2. COLLECT OPS INTO EDIT                                   │
  │     createEdit("name", [...ops1, ...ops2])                  │
  │           │                                                 │
  │           ▼                                                 │
  │  3. PUBLISH TO IPFS  (Course 7)                             │
  │     Ipfs.publishEdit(edit) → CID                            │
  │           │                                                 │
  │           ▼                                                 │
  │  4. SUBMIT ON-CHAIN  (Course 7)                             │
  │     personalSpace.publishEdit(cid)                          │
  │           │                                                 │
  │           ▼                                                 │
  │  5. INDEXED & AVAILABLE                                     │
  │     Data accessible via API                                 │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
`);

// ========== COMBINING EDITS ==========

console.log("--- Combining Edits for Submission ---\n");

const allEdits = [schemaEdit, bookEdit];

console.log("Submission order:");
allEdits.forEach((edit, index) => {
  console.log(`  ${index + 1}. ${edit.name} (${edit.ops.length} ops)`);
});

const totalOps = allEdits.reduce((sum, e) => sum + e.ops.length, 0);
console.log(`\nTotal operations to submit: ${totalOps}`);

// =============================================================================
// WHAT'S NEXT?
// =============================================================================
console.log("\n--- What's Next? ---");
console.log("Edits are ready locally, but to persist them in the decentralized");
console.log("knowledge graph, they need to be PUBLISHED. Course 7 covers");
console.log("IPFS Publishing and Personal Spaces.");
console.log("\nRun: npm run course7");
