/**
 * SpooVault Stellar Soroban Deployment Script
 *
 * Compiles/Reads the Soroban WASM contract and deploys it to Stellar Testnet.
 * Updates .env with the deployed contract address: VITE_STELLAR_CONTRACT_ADDRESS=<C...>
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as StellarSdk from "@stellar/stellar-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const wasmPath = path.resolve(
  root,
  "contracts-stellar/target/wasm32-unknown-unknown/release/spoovault_stellar.wasm"
);
const envPath = path.resolve(root, ".env");

const HORIZON_URL = process.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
const SOROBAN_RPC = process.env.VITE_STELLAR_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

console.log("\n========================================================");
console.log("   SpooVault Stellar Soroban Testnet Deployment");
console.log("========================================================\n");

// 1. Verify WASM
if (!fs.existsSync(wasmPath)) {
  console.error(`❌ WASM binary not found at: ${wasmPath}`);
  process.exit(1);
}

const wasmBuffer = fs.readFileSync(wasmPath);
console.log(`📦 Loaded WASM binary: ${(wasmBuffer.length / 1024).toFixed(1)} KB`);

// 2. Load or generate deployer keypair
let deployerKeypair;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/STELLAR_DEPLOYER_SECRET=(S[A-Z0-9]{55})/);
  if (match) {
    deployerKeypair = StellarSdk.Keypair.fromSecret(match[1]);
    console.log(`🔑 Loaded existing deployer keypair: ${deployerKeypair.publicKey()}`);
  }
}

if (!deployerKeypair) {
  deployerKeypair = StellarSdk.Keypair.random();
  console.log(`✨ Generated new deployer keypair: ${deployerKeypair.publicKey()}`);
  // Persist secret immediately
  let envData = fs.readFileSync(envPath, "utf-8");
  if (!envData.includes("STELLAR_DEPLOYER_SECRET=")) {
    envData += `\nSTELLAR_DEPLOYER_SECRET=${deployerKeypair.secret()}\n`;
    fs.writeFileSync(envPath, envData, "utf-8");
    console.log("💾 Saved deployer secret to .env");
  }
}

const server = new StellarSdk.rpc.Server(SOROBAN_RPC, { allowHttp: false });
const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);

// Direct RPC helper to bypass SDK 12.3.0 XDR bug with Protocol 21+ meta
async function queryRpcTx(hash) {
  const res = await fetch(SOROBAN_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: { hash },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`RPC Error: ${JSON.stringify(data.error)}`);
  return data.result;
}

async function waitForTx(hash) {
  console.log(`⌛ Awaiting confirmation (hash: ${hash})...`);
  let status = "NOT_FOUND";
  let result;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    result = await queryRpcTx(hash);
    status = result.status;
    if (status !== "NOT_FOUND") break;
  }
  if (status === "FAILED") {
    throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
  }
  if (status !== "SUCCESS") {
    throw new Error(`Transaction did not succeed. Status: ${status}`);
  }
  return result;
}

// 3. Fund deployer via Friendbot if needed
async function ensureFunded(publicKey) {
  try {
    const acc = await horizon.loadAccount(publicKey);
    console.log(`💰 Account balance: ${acc.balances[0].balance} XLM`);
    return acc;
  } catch {
    console.log(`💸 Requesting 10,000 testnet XLM from Friendbot...`);
    const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    if (!res.ok) throw new Error(`Friendbot failed with status ${res.status}`);
    console.log(`✅ Friendbot funding successful!`);
    await new Promise((r) => setTimeout(r, 4000));
    return await horizon.loadAccount(publicKey);
  }
}

let deployerAccount = await ensureFunded(deployerKeypair.publicKey());

// 4. Upload Contract WASM
console.log("\n🚀 Uploading contract WASM to Soroban Testnet...");
let wasmHashBuffer;

try {
  const uploadOp = StellarSdk.Operation.uploadContractWasm({
    wasm: wasmBuffer,
  });

  let uploadTx = new StellarSdk.TransactionBuilder(deployerAccount, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(uploadOp)
    .setTimeout(60)
    .build();

  console.log("⏳ Simulating upload transaction with Soroban RPC...");
  uploadTx = await server.prepareTransaction(uploadTx);
  uploadTx.sign(deployerKeypair);

  console.log("📤 Submitting upload transaction...");
  const uploadResp = await server.sendTransaction(uploadTx);
  if (uploadResp.status === "ERROR") {
    throw new Error(`Upload submission failed: ${JSON.stringify(uploadResp)}`);
  }

  const uploadResult = await waitForTx(uploadResp.hash);
  const txRes = StellarSdk.xdr.TransactionResult.fromXDR(uploadResult.resultXdr, "base64");
  const hostFnRes = txRes.result().results()[0].tr().invokeHostFunctionResult();
  wasmHashBuffer = hostFnRes.success();
  console.log(`🎉 WASM Uploaded successfully!`);
} catch (err) {
  console.log("⚠️ Upload returned message:", err.message);
  // Compute sha256 of wasm as fallback if already uploaded
  const crypto = await import("node:crypto");
  wasmHashBuffer = crypto.createHash("sha256").update(wasmBuffer).digest();
  console.log(`ℹ️ Using WASM SHA256: ${wasmHashBuffer.toString("hex")}`);
}

const wasmHashHex = wasmHashBuffer.toString("hex");
console.log(`   WASM Hash: ${wasmHashHex}`);

// 5. Create Contract Instance
console.log("\n🏗️ Creating contract instance on Soroban Testnet...");
deployerAccount = await horizon.loadAccount(deployerKeypair.publicKey());

const createOp = StellarSdk.Operation.createCustomContract({
  address: new StellarSdk.Address(deployerKeypair.publicKey()),
  wasmHash: wasmHashBuffer,
});

let createTx = new StellarSdk.TransactionBuilder(deployerAccount, {
  fee: "1000000",
  networkPassphrase: NETWORK_PASSPHRASE,
})
  .addOperation(createOp)
  .setTimeout(60)
  .build();

console.log("⏳ Simulating instance creation transaction...");
createTx = await server.prepareTransaction(createTx);
createTx.sign(deployerKeypair);

console.log("📤 Submitting instance creation transaction...");
const createResp = await server.sendTransaction(createTx);
if (createResp.status === "ERROR") {
  throw new Error(`Instance creation submission failed: ${JSON.stringify(createResp)}`);
}

const createResult = await waitForTx(createResp.hash);
  const createTxRes = StellarSdk.xdr.TransactionResult.fromXDR(createResult.resultXdr, "base64");
  const hostFnSuccess =
    createTxRes.result?.results?.[0]?.tr?.invokeHostFunctionResult?.success ||
    createTxRes._attributes?.result?._value?.[0]?._value?._value?._value;

  let contractAddress;
  if (hostFnSuccess?.value || Buffer.isBuffer(hostFnSuccess) || hostFnSuccess instanceof Uint8Array) {
    const rawBytes = hostFnSuccess.value || hostFnSuccess;
    contractAddress = StellarSdk.Address.contract(rawBytes).toString();
  } else {
    try {
      contractAddress = StellarSdk.Address.fromScVal(hostFnSuccess).toString();
    } catch {
      contractAddress = StellarSdk.scValToNative(hostFnSuccess);
    }
  }

console.log("\n========================================================");
console.log("   🎉 SPOOVAULT SOROBAN CONTRACT DEPLOYED!");
console.log("========================================================");
console.log(`   Contract ID:      ${contractAddress}`);
console.log(`   Deployer Address: ${deployerKeypair.publicKey()}`);
console.log(`   WASM Hash:        ${wasmHashHex}`);
console.log(`   Stellar Expert:   https://stellar.expert/explorer/testnet/contract/${contractAddress}`);
console.log("========================================================\n");

// 6. Update .env file
if (fs.existsSync(envPath)) {
  let envData = fs.readFileSync(envPath, "utf-8");
  if (envData.includes("VITE_STELLAR_CONTRACT_ADDRESS=")) {
    envData = envData.replace(
      /VITE_STELLAR_CONTRACT_ADDRESS=.*/,
      `VITE_STELLAR_CONTRACT_ADDRESS=${contractAddress}`
    );
  } else {
    envData += `\nVITE_STELLAR_CONTRACT_ADDRESS=${contractAddress}\n`;
  }
  if (envData.includes("VITE_CONTRACT_ADDRESS=")) {
    envData = envData.replace(
      /VITE_CONTRACT_ADDRESS=.*/,
      `VITE_CONTRACT_ADDRESS=${contractAddress}`
    );
  }
  fs.writeFileSync(envPath, envData, "utf-8");
  console.log("✅ Updated .env with VITE_STELLAR_CONTRACT_ADDRESS & VITE_CONTRACT_ADDRESS!");
}

console.log("🚀 SpooVault is now 100% active on Stellar Testnet!\n");
