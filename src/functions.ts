/**
 * Shared Helper Functions for Geo SDK
 *
 * This module provides reusable utilities for:
 * - GraphQL API queries
 * - Publishing operations (personal and DAO spaces)
 * - Space management
 *
 * Based on patterns from: https://github.com/geobrowser/geo_tech_demo
 */

import { createPublicClient, type Hex, http } from "viem";
import {
  daoSpace,
  getSmartAccountWalletClient,
  getWalletClient,
  Graph,
  personalSpace,
  TESTNET_RPC_URL,
  type Id,
  type Op,
} from "@geoprotocol/geo-sdk";
import { SpaceRegistryAbi } from "@geoprotocol/geo-sdk/abis";
import { TESTNET } from "@geoprotocol/geo-sdk/contracts";
import { createInterface } from "readline";
import { API_URL } from "./constants.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PublishResult {
  success: boolean;
  editId?: string;
  cid?: string;
  transactionHash?: string;
  spaceId?: string;
  error?: string;
}

export interface PublishConfig {
  ops: Op[];
  editName: string;
  privateKey: `0x${string}`;
  useSmartAccount?: boolean;
  network?: "TESTNET" | "MAINNET";
  spaceId?: string; // Optional: if not provided, uses personal space
}

// ─── GraphQL Helper ──────────────────────────────────────────────────────────

/**
 * Execute a GraphQL query against the Geo API.
 *
 * @example
 * ```typescript
 * const data = await gql(`{
 *   space(id: "${spaceId}") {
 *     id
 *     type
 *     page { name description }
 *   }
 * }`);
 * ```
 */
export async function gql(
  query: string,
  variables?: Record<string, unknown>
): Promise<any> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors, null, 2));
    throw new Error(`GraphQL: ${json.errors[0].message}`);
  }
  return json.data;
}

// ─── CLI Prompt Helper ───────────────────────────────────────────────────────

/**
 * Prompt the user for input via stdin.
 */
export function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Duplicate-Check Query Helpers ───────────────────────────────────────────

/**
 * Check if an entity with the given name already exists in the knowledge graph.
 * Returns the entity's ID if found, null otherwise.
 */
export async function queryEntityByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(query: ${JSON.stringify(name)}, first: 5) {
        id
        name
      }
    }`);
    const entities = data?.search ?? [];
    const exact = entities.find(
      (e: any) => e.name?.toLowerCase() === name.toLowerCase()
    );
    if (exact) return exact.id;
    return null;
  } catch (err) {
    console.warn(`  ⚠ API query failed for "${name}":`, (err as Error).message);
    return null;
  }
}

/**
 * Check if a property with the given name already exists in the knowledge graph.
 * Returns the property's ID if found, null otherwise.
 */
export async function queryPropertyByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(query: ${JSON.stringify(name)}, first: 5) {
        id
        name
      }
    }`);
    const entities = data?.search ?? [];
    const exact = entities.find(
      (e: any) => e.name?.toLowerCase() === name.toLowerCase()
    );
    if (exact) return exact.id;
    return null;
  } catch (err) {
    console.warn(`  ⚠ API query failed for "${name}":`, (err as Error).message);
    return null;
  }
}

/**
 * Check if a type with the given name already exists in the knowledge graph.
 * Returns the type's ID if found, null otherwise.
 */
export async function queryTypeByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(query: ${JSON.stringify(name)}, first: 5) {
        id
        name
      }
    }`);
    const entities = data?.search ?? [];
    const exact = entities.find(
      (e: any) => e.name?.toLowerCase() === name.toLowerCase()
    );
    if (exact) return exact.id;
    return null;
  } catch (err) {
    console.warn(`  ⚠ API query failed for "${name}":`, (err as Error).message);
    return null;
  }
}

// ─── Property & Type Prompt Helpers ──────────────────────────────────────────

/**
 * Prompt the user for a property name, checking for duplicates and offering
 * the option to reuse an existing property instead of creating a new one.
 *
 * - If the name is unique: prompts for data type and creates a new property.
 * - If the name already exists: offers y/n to reuse it (ops will be empty).
 * - If the user declines reuse: re-prompts for a different name.
 */
export async function promptProperty(
  hint: string
): Promise<{ id: Id; ops: Op[] }> {
  let name = await prompt(`Enter property name (e.g. ${hint}): `);
  while (true) {
    const existingId = await queryPropertyByName(name);
    if (!existingId) break;
    console.warn(`  ⚠ "${name}" already exists in the knowledge graph.`);
    const choice = await prompt("  Reuse it? (y/n): ");
    if (choice.toLowerCase().startsWith("y")) {
      console.log(`  Reusing existing property "${name}"`);
      return { id: existingId as Id, ops: [] };
    }
    name = await prompt("Enter a different name: ");
  }
  const dataType = await prompt(
    "Enter data type (TEXT/INT64/FLOAT64/BOOLEAN/DATE/DATETIME/POINT/RELATION/...): "
  );
  return Graph.createProperty({ name, dataType: dataType as any });
}

/**
 * Prompt the user for a type name, checking for duplicates and offering
 * the option to reuse an existing type instead of creating a new one.
 *
 * - If the name is unique: creates a new type with the given property IDs.
 * - If the name already exists: offers y/n to reuse it (ops will be empty).
 * - If the user declines reuse: re-prompts for a different name.
 *
 * @param hint - Example name shown in the prompt (e.g. "Book")
 * @param propertyIds - Property IDs to attach when creating a new type
 */
export async function promptType(
  hint: string,
  propertyIds: Id[]
): Promise<{ id: Id; ops: Op[] }> {
  let name = await prompt(`Enter type name (e.g. ${hint}): `);
  while (true) {
    const existingId = await queryTypeByName(name);
    if (!existingId) break;
    console.warn(`  ⚠ "${name}" already exists in the knowledge graph.`);
    const choice = await prompt("  Reuse it? (y/n): ");
    if (choice.toLowerCase().startsWith("y")) {
      console.log(`  Reusing existing type "${name}"`);
      return { id: existingId as Id, ops: [] };
    }
    name = await prompt("Enter a different name: ");
  }
  return Graph.createType({ name, properties: propertyIds });
}

// ─── Space Helpers ───────────────────────────────────────────────────────────

/**
 * Create a public client for reading contract state.
 */
export function createGeoPublicClient() {
  return createPublicClient({
    transport: http(TESTNET_RPC_URL),
  });
}

/**
 * Check if an address has a personal space, create one if not.
 * Returns the space ID.
 *
 * @param address - The wallet address to check
 * @param walletClient - Wallet client to use for creating space if needed
 */
export async function ensurePersonalSpace(
  address: string,
  walletClient: Awaited<ReturnType<typeof getSmartAccountWalletClient>>
): Promise<string> {
  const publicClient = createGeoPublicClient();

  const hasSpace = await personalSpace.hasSpace({ address: address as `0x${string}` });

  if (!hasSpace) {
    console.log("  Creating personal space...");
    const { to, calldata } = personalSpace.createSpace();
    const txHash = await walletClient.sendTransaction({ to, data: calldata });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`  ✓ Personal space created`);
  }

  // Look up space ID from registry
  const spaceIdHex = (await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [address as `0x${string}`],
  })) as Hex;

  // Convert bytes16 hex to UUID string (without dashes)
  return spaceIdHex.slice(2, 34).toLowerCase();
}

/**
 * Get space ID for an address (assumes space already exists).
 */
export async function getSpaceId(address: string): Promise<string> {
  const publicClient = createGeoPublicClient();

  const spaceIdHex = (await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [address as `0x${string}`],
  })) as Hex;

  return spaceIdHex.slice(2, 34).toLowerCase();
}

// ─── Publishing Helper ───────────────────────────────────────────────────────

/**
 * Publish operations to the knowledge graph.
 *
 * This is a unified helper that:
 * 1. Creates wallet client (smart account or EOA)
 * 2. Ensures personal space exists
 * 3. Queries API to detect if target is personal or DAO space
 * 4. Publishes to IPFS and submits on-chain
 *
 * @example
 * ```typescript
 * const result = await publishOps({
 *   ops: allOps,
 *   editName: "Add new entities",
 *   privateKey: PRIVATE_KEY,
 *   useSmartAccount: true,
 * });
 * ```
 */
export async function publishOps(config: PublishConfig): Promise<PublishResult> {
  const {
    ops,
    editName,
    privateKey,
    useSmartAccount = true,
    network = "TESTNET",
  } = config;

  try {
    // Step 1: Create wallet client
    const walletClient = useSmartAccount
      ? await getSmartAccountWalletClient({ privateKey })
      : await getWalletClient({ privateKey });

    const address = walletClient.account!.address;

    // Step 2: Ensure personal space exists and get space ID
    const spaceId = config.spaceId || (await ensurePersonalSpace(address, walletClient as any));

    // Step 3: Query space type to determine publish method
    const spaceData = await gql(`{
      space(id: "${spaceId}") {
        type
        address
        membersList { memberSpaceId }
        editorsList { memberSpaceId }
      }
    }`);

    if (!spaceData.space) {
      throw new Error(`Space ${spaceId} not found`);
    }

    const { type: spaceType, address: daoAddress } = spaceData.space;
    const publicClient = createGeoPublicClient();

    let to: `0x${string}`;
    let calldata: `0x${string}`;
    let cid: string;
    let editId: string;

    // Step 4: Publish based on space type
    if (spaceType === "PERSONAL") {
      const result = await personalSpace.publishEdit({
        name: editName,
        spaceId,
        ops,
        author: address,
        network: network as "TESTNET",
      });
      cid = result.cid;
      editId = result.editId;
      to = result.to;
      calldata = result.calldata;
    } else {
      // DAO space - need to resolve caller's personal space
      const personalSpaceData = await gql(`{
        spaces(filter: { address: { is: "${address}" } }) { id type }
      }`);

      const callerSpace = personalSpaceData.spaces?.find(
        (s: any) => s.type === "PERSONAL"
      );
      if (!callerSpace) {
        throw new Error(`No personal space found for wallet ${address}`);
      }

      const callerSpaceId: string = callerSpace.id;

      // Verify caller is member/editor
      const members = spaceData.space.membersList || [];
      const editors = spaceData.space.editorsList || [];
      const allCandidates = [...members, ...editors];
      const isMemberOrEditor = allCandidates.some(
        (m: any) => m.memberSpaceId === callerSpaceId
      );

      if (!isMemberOrEditor) {
        throw new Error(
          `Your personal space (${callerSpaceId}) is not a member or editor of DAO space ${spaceId}`
        );
      }

      const result = await daoSpace.proposeEdit({
        name: editName,
        ops,
        author: callerSpaceId as `0x${string}`,
        network: network as "TESTNET",
        callerSpaceId: `0x${callerSpaceId}` as `0x${string}`,
        daoSpaceId: `0x${spaceId}` as `0x${string}`,
        daoSpaceAddress: daoAddress as `0x${string}`,
      });
      cid = result.cid;
      editId = result.editId;
      to = result.to;
      calldata = result.calldata;
    }

    // Step 5: Submit transaction
    const txHash = await (walletClient as any).sendTransaction({ to, data: calldata });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return {
      success: true,
      editId,
      cid,
      transactionHash: txHash,
      spaceId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ─── Ops Utilities ───────────────────────────────────────────────────────────

/**
 * Print a summary of operations by type.
 */
export function printOpsSummary(ops: Op[]): void {
  console.log(`Total operations: ${ops.length}`);

  const opCounts: Record<string, number> = {};
  for (const op of ops) {
    opCounts[op.type] = (opCounts[op.type] || 0) + 1;
  }

  console.log("Operation breakdown:");
  for (const [type, count] of Object.entries(opCounts)) {
    console.log(`  ${type}: ${count}`);
  }
}

/**
 * Extract entity IDs from create operations.
 */
export function getCreatedEntityIds(ops: Op[]): string[] {
  return ops
    .filter((op: any) => op.type === "createEntity")
    .map((op: any) => op.id);
}

/**
 * Extract relation IDs from create operations.
 */
export function getCreatedRelationIds(ops: Op[]): string[] {
  return ops
    .filter((op: any) => op.type === "createRelation")
    .map((op: any) => op.id);
}
