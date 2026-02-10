# Geo SDK Learning Curriculum

A progressive 9-course curriculum to master the Geo SDK (`@geoprotocol/geo-sdk`) - from beginner to confident builder.

## Quick Start

```bash
# Install dependencies
npm install

# Run courses in order
npm run course1   # IDs
npm run course2   # Properties
npm run course3   # Types
npm run course4   # Entities
npm run course5   # Relations
npm run course6   # Edits
npm run course7   # Publishing
npm run course8   # Smart Accounts
npm run course9   # DAO Governance
npm run capstone  # Final Project
```

## Course Overview

| # | Course | What You Learn | Key API |
|---|--------|----------------|---------|
| 1 | **IDs** | Generate unique identifiers | `Id.generate()` |
| 2 | **Properties** | Define data types | `Graph.createProperty()` |
| 3 | **Types** | Create entity schemas | `Graph.createType()` |
| 4 | **Entities** | Create data instances | `Graph.createEntity()` |
| 5 | **Relations** | Connect entities | `Graph.createRelation()` |
| 6 | **Edits** | Group operations | Edit object structure |
| 7 | **Publishing** | Publish to network | `Ipfs.publishEdit()` |
| 8 | **Smart Accounts** | Gas-free transactions | `getSmartAccountWalletClient()` |
| 9 | **DAO Governance** | Community curation | `daoSpace.proposeEdit()` |

## Structure

Each course file (`courses/01-ids.ts` through `courses/10-capstone.ts`) contains:

1. **Learning Objective** - What you'll learn
2. **Key Concepts** - Core ideas explained
3. **Example Code** - Working demonstrations
4. **Challenge** - Practice exercise
5. **Solution** - Complete answer with comments
6. **What's Next** - Preview of the next course

## Prerequisites

- Basic TypeScript/JavaScript knowledge
- Understanding of async/await patterns
- Node.js 18+ installed

## For Real Publishing

Courses 7-9 simulate network interactions. For actual publishing:

1. Export your wallet from https://www.geobrowser.io/export-wallet
2. Set your private key: `export PRIVATE_KEY=0x...`
3. Modify the course files to use real SDK functions

## Resources

- [Geo SDK Repository](https://github.com/geobrowser/geo-sdk)
- [Geo Browser](https://geobrowser.io)
- [The Graph Documentation](https://thegraph.com/docs)
