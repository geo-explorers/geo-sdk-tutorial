/**
 * Shared Helper Functions for Geo SDK Tutorial
 *
 * Provides reusable utilities for:
 * - GraphQL API queries (with type-filtered lookups)
 * - Publishing operations (personal and DAO spaces)
 * - Space management
 *
 * Key fix over previous version: queryPropertyByName and queryTypeByName
 * now filter by entity type (Property/Type) to avoid returning wrong entities.
 * See: Hasnat review — search("Creator") returned a Role entity, not a Property.
 */

import { createPublicClient, type Hex, http } from "viem";
import {
  daoSpace,
  getSmartAccountWalletClient,
  getWalletClient,
  Graph,
  personalSpace,
  SystemIds,
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
  spaceId?: string;
}

// ─── GraphQL Helper ──────────────────────────────────────────────────────────

/**
 * Execute a GraphQL query against the Geo API.
 *
 * @example
 * ```typescript
 * const data = await gql(
 *   `query($id: UUID!) { space(id: $id) { id type page { name } } }`,
 *   { id: spaceId }
 * );
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

// ─── Type-Filtered Lookup Helpers ───────────────────────────────────────────

/**
 * Search for an entity by exact name (case-insensitive).
 * Returns the entity's ID if found, null otherwise.
 *
 * This is an UNSCOPED search — it searches across all spaces and all types.
 * Use queryPropertyByName or queryTypeByName for type-specific lookups.
 */
export async function queryEntityByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(query: ${JSON.stringify(name)}, first: 10) {
        id
        name
      }
    }`);
    const entities = data?.search ?? [];
    const exact = entities.find(
      (e: any) => e.name?.toLowerCase() === name.toLowerCase()
    );
    return exact?.id ?? null;
  } catch (err) {
    console.warn(`  Warning: API query failed for "${name}":`, (err as Error).message);
    return null;
  }
}

/**
 * Search for a PROPERTY entity by exact name.
 * Filters results to only Property-typed entities (typeId = SystemIds.PROPERTY).
 *
 * Why this matters: an unscoped search("Creator") returns a Role entity first,
 * not a Property entity. Using values from the wrong entity type as property IDs
 * corrupts the knowledge graph.
 */
export async function queryPropertyByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(
        query: ${JSON.stringify(name)},
        first: 10,
        filter: {
          typeIds: { anyEqualTo: "${SystemIds.PROPERTY}" },
          name: { is: ${JSON.stringify(name)} }
        }
      ) {
        id
        name
      }
    }`);
    const match = (data?.search ?? [])[0];
    return match?.id ?? null;
  } catch (err) {
    console.warn(`  Warning: property lookup failed for "${name}":`, (err as Error).message);
    return null;
  }
}

/**
 * Search for a TYPE entity by exact name.
 * Filters results to only Type-typed entities (typeId = SystemIds.SCHEMA_TYPE).
 *
 * Why this matters: an unscoped search("Topic") could return a Data Block
 * named "Topics" before the actual Type entity "Topic".
 */
export async function queryTypeByName(name: string): Promise<string | null> {
  try {
    const data = await gql(`{
      search(
        query: ${JSON.stringify(name)},
        first: 10,
        filter: {
          typeIds: { anyEqualTo: "${SystemIds.SCHEMA_TYPE}" },
          name: { is: ${JSON.stringify(name)} }
        }
      ) {
        id
        name
      }
    }`);
    const match = (data?.search ?? [])[0];
    return match?.id ?? null;
  } catch (err) {
    console.warn(`  Warning: type lookup failed for "${name}":`, (err as Error).message);
    return null;
  }
}

// ─── Property & Type Prompt Helpers ──────────────────────────────────────────

/**
 * Prompt the user for a property name, checking for duplicates.
 * If the property exists, offers to reuse it.
 */
export async function promptProperty(
  hint: string
): Promise<{ id: Id; ops: Op[] }> {
  let name = await prompt(`Enter property name (e.g. ${hint}): `);
  while (true) {
    const existingId = await queryPropertyByName(name);
    if (!existingId) break;
    console.warn(`  "${name}" already exists as a property in the knowledge graph.`);
    const choice = await prompt("  Reuse it? (y/n): ");
    if (choice.toLowerCase().startsWith("y")) {
      console.log(`  Reusing existing property "${name}"`);
      return { id: existingId as Id, ops: [] };
    }
    name = await prompt("Enter a different name: ");
  }
  const dataType = await prompt(
    "Enter data type (TEXT/INTEGER/FLOAT/BOOLEAN/DATE/DATETIME/POINT/RELATION/...): "
  );
  return Graph.createProperty({ name, dataType: dataType as any });
}

/**
 * Prompt the user for a type name, checking for duplicates.
 * If the type exists, offers to reuse it.
 */
export async function promptType(
  hint: string,
  propertyIds: Id[]
): Promise<{ id: Id; ops: Op[] }> {
  let name = await prompt(`Enter type name (e.g. ${hint}): `);
  while (true) {
    const existingId = await queryTypeByName(name);
    if (!existingId) break;
    console.warn(`  "${name}" already exists as a type in the knowledge graph.`);
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
 * Returns the space ID (32-char hex UUID without dashes).
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
    console.log("  Personal space created");
  }

  const spaceIdHex = (await publicClient.readContract({
    address: TESTNET.SPACE_REGISTRY_ADDRESS,
    abi: SpaceRegistryAbi,
    functionName: "addressToSpaceId",
    args: [address as `0x${string}`],
  })) as Hex;

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
 * Detects whether the target is a personal or DAO space and uses the
 * correct publish flow. For DAO spaces, submits a proposal.
 *
 * Note on `author` parameter:
 *   The SDK expects `author` to be the personal space ID (UUID),
 *   NOT the wallet address. This was a common source of confusion
 *   across curator codebases.
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
    const walletClient = useSmartAccount
      ? await getSmartAccountWalletClient({ privateKey })
      : await getWalletClient({ privateKey });

    const address = walletClient.account!.address;

    // Get caller's personal space ID (used as author for both flows)
    const callerSpaceId = config.spaceId
      ? await getCallerPersonalSpaceId(address)
      : await ensurePersonalSpace(address, walletClient as any);

    const spaceId = config.spaceId ?? callerSpaceId;

    // Query space to determine publish method
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

    if (spaceType === "PERSONAL") {
      // Personal space: author = personal space ID (not wallet address)
      const result = await personalSpace.publishEdit({
        name: editName,
        spaceId,
        ops,
        author: spaceId,
        network: network as "TESTNET",
      });
      cid = result.cid;
      editId = result.editId;
      to = result.to;
      calldata = result.calldata;
    } else {
      // DAO space: need caller's personal space for membership check + author
      const personalSpaceId = await getCallerPersonalSpaceId(address);

      // Verify caller is member/editor
      const members = spaceData.space.membersList ?? [];
      const editors = spaceData.space.editorsList ?? [];
      const allCandidates = [...members, ...editors];
      const isMemberOrEditor = allCandidates.some(
        (m: any) => m.memberSpaceId === personalSpaceId
      );

      if (!isMemberOrEditor) {
        throw new Error(
          `Your personal space (${personalSpaceId}) is not a member or editor of DAO space ${spaceId}`
        );
      }

      const result = await daoSpace.proposeEdit({
        name: editName,
        ops,
        author: personalSpaceId,
        network: network as "TESTNET",
        callerSpaceId: `0x${personalSpaceId}` as `0x${string}`,
        daoSpaceId: `0x${spaceId}` as `0x${string}`,
        daoSpaceAddress: daoAddress as `0x${string}`,
      });
      cid = result.cid;
      editId = result.editId;
      to = result.to;
      calldata = result.calldata;
    }

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

/**
 * Look up the caller's personal space ID from their wallet address.
 */
async function getCallerPersonalSpaceId(address: string): Promise<string> {
  const data = await gql(`{
    spaces(filter: { address: { is: "${address}" } }) { id type }
  }`);
  const personal = data.spaces?.find((s: any) => s.type === "PERSONAL");
  if (!personal) {
    throw new Error(`No personal space found for wallet ${address}`);
  }
  return personal.id;
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
