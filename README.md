# Geo SDK Learning Curriculum

A progressive 14-course curriculum to master the Geo SDK (`@geoprotocol/geo-sdk`) - from beginner to confident builder.

## Quick Start

```bash
# Install dependencies
npm install

# Run courses in order
npm run course1   # Knowledge Graph Overview
npm run course2   # Reading Data (GraphQL)
npm run course3   # Core Concepts
npm run course4   # Schemas (Properties + Types)
npm run course5   # Entities
npm run course6   # Relations
npm run course7   # Edits
npm run course8   # Publishing
npm run course9   # Smart Accounts
npm run course10  # DAO Governance
npm run course11  # Advanced Blocks
npm run course12  # Updates & Deletes
npm run course13  # Batch Import
npm run capstone  # Capstone Project (Course 14)
```

## Course Overview

### Phase 1: Foundation (Courses 1-3)
**Goal: Understand the Knowledge Graph model**

| # | Course | What You Learn | Key Concepts |
|---|--------|----------------|--------------|
| 1 | **Overview** | Geo Protocol architecture | Spaces, IPFS, Blockchain, API |
| 2 | **Reading Data** | Query the knowledge graph | GraphQL queries, filters |
| 3 | **Core Concepts** | IDs, Properties, Types, Entities, Relations | Data model foundations |

### Phase 2: Creating Data (Courses 4-7)
**Goal: Master entity creation and relationships**

| # | Course | What You Learn | Key API |
|---|--------|----------------|---------|
| 4 | **Schemas** | Define properties and types | `Graph.createProperty()`, `Graph.createType()` |
| 5 | **Entities** | Create data instances | `Graph.createEntity()` |
| 6 | **Relations** | Connect entities | `Graph.createRelation()` |
| 7 | **Edits** | Group operations | Edit object structure |

### Phase 3: Publishing (Courses 8-10)
**Goal: Get data onto the network**

| # | Course | What You Learn | Key API |
|---|--------|----------------|---------|
| 8 | **Publishing** | Publish to personal spaces | `personalSpace.publishEdit()` |
| 9 | **Smart Accounts** | Gas-free transactions | `getSmartAccountWalletClient()` |
| 10 | **DAO Governance** | Community curation | `daoSpace.proposeEdit()` |

### Phase 4: Advanced Patterns (Courses 11-13)
**Goal: Production-ready skills**

| # | Course | What You Learn | Key Concepts |
|---|--------|----------------|--------------|
| 11 | **Advanced Blocks** | Rich content (text, data, images) | Text blocks, data blocks, views |
| 12 | **Updates & Deletes** | Modify and remove data | `Graph.updateEntity()`, `unset`, `deleteRelation` |
| 13 | **Batch Import** | Import from JSON files | Property registry, entity lookup |

### Phase 5: Capstone (Course 14)
**Goal: Apply everything**

| # | Course | What You Learn |
|---|--------|----------------|
| 14 | **Capstone** | Build a complete Recipe Book application |

## Project Structure

```
geo-sdk-api-playground/
├── src/
│   ├── constants.ts      # Well-known ontology IDs (types, properties)
│   └── functions.ts      # Shared helpers (gql, publishOps)
├── docs/
│   └── knowledge-graph-ontology.md  # Reference documentation
├── courses/
│   ├── 01-overview.ts              # Phase 1: Foundation
│   ├── 02-reading-data.ts
│   ├── 03-core-concepts.ts
│   ├── 04-schemas.ts               # Phase 2: Creating Data
│   ├── 05-entities.ts
│   ├── 06-relations.ts
│   ├── 07-edits.ts
│   ├── 08-publishing.ts            # Phase 3: Publishing
│   ├── 09-smart-accounts.ts
│   ├── 10-dao-governance.ts
│   ├── 11-advanced-blocks.ts       # Phase 4: Advanced Patterns
│   ├── 12-updates-and-deletes.ts
│   ├── 13-batch-import.ts
│   └── 14-capstone.ts              # Phase 5: Capstone
├── data_to_publish/
│   ├── topics.json       # Sample data for batch import
│   ├── people.json
│   └── projects.json
├── quick-publish.ts      # Quick publish utility
└── quick-query.ts        # Quick query utility
```

## Shared Utilities

The `src/` folder contains shared utilities used across courses:

### `src/constants.ts`

Well-known ontology IDs from the root space:

```typescript
import { TYPES, PROPERTIES, VIEWS, ROOT_SPACE_ID } from "./src/constants.js";

// Use well-known types
const person = Graph.createEntity({
  name: "John Doe",
  types: [TYPES.person],
});

// Use well-known properties
Graph.createEntity({
  name: "My Project",
  types: [TYPES.project],
  values: [
    { property: PROPERTIES.description, type: "text", value: "..." },
  ],
});
```

### `src/functions.ts`

Shared helper functions:

```typescript
import { gql, publishOps } from "./src/functions.js";

// Query the GraphQL API
const data = await gql(`{
  space(id: "${spaceId}") {
    id
    page { name }
  }
}`);

// Publish operations (auto-detects personal vs DAO space)
const result = await publishOps({
  ops: allOps,
  editName: "My Edit",
  privateKey: PRIVATE_KEY,
  useSmartAccount: true,  // Gas-sponsored (default)
});
```

## Utility Scripts

### Quick Publish

Publish operations quickly:

```bash
npm run publish
# or
npx tsx quick-publish.ts
```

### Quick Query

Query spaces interactively:

```bash
npm run query              # Query default/DEMO_SPACE_ID
npm run query -- --root    # Query root space
npm run query -- abc123    # Query specific space
```

## Prerequisites

- Basic TypeScript/JavaScript knowledge
- Understanding of async/await patterns
- Node.js 18+ installed

## For Real Publishing

Courses 8-10+ require a wallet for publishing. To set up:

1. Export your wallet from https://www.geobrowser.io/export-wallet
2. Set your private key: `export PRIVATE_KEY=0x...`
3. Optionally get testnet ETH from: https://faucet.conduit.xyz/geo-test-zc16z3tcvf

For DAO proposals, you also need:
```bash
export DAO_SPACE_ID="..."  # 32-char hex (no dashes)
```

## Course Structure

Each course file contains:

1. **Learning Objective** - What you'll learn
2. **Key Concepts** - Core ideas explained
3. **Example Code** - Working demonstrations
4. **Challenge** - Practice exercise
5. **Solution** - Complete answer with comments
6. **What's Next** - Preview of the next course

## API Endpoints

| Network | GraphQL Endpoint |
|---------|------------------|
| TESTNET | `https://testnet-api.geobrowser.io/graphql` |
| MAINNET | `https://api.geobrowser.io/graphql` |

## Resources

- [Geo SDK Repository](https://github.com/geobrowser/geo-sdk)
- [Official Tech Demo](https://github.com/geobrowser/geo_tech_demo)
- [Geo Browser](https://geobrowser.io)
- [The Graph Documentation](https://thegraph.com/docs)

## Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```
