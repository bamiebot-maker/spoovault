# SpooVault Community & GrantFox Contributor Issues

This document lists ready-to-publish GitHub issues for community contributors, GrantFox bounties, and Drips Wave milestone execution.

---

### Issue 1: `[SOROBAN] Implement Batch Access Requests for Multiple Vaults`
- **Labels**: `enhancement`, `soroban`, `good-first-issue`, `grantfox`
- **Estimated Effort**: 4-6 hours
- **Description**: Currently `request_access` processes a single `vault_id`. For beneficiaries inheriting multiple vaults from the same creator, submitting individual transactions incurs extra fee and latency overhead.
- **Scope**:
  - Add `batch_request_access(e: Env, vault_ids: Vec<u64>, beneficiary: Address) -> Vec<bool>` in `contracts-stellar/src/lib.rs`.
  - Add unit tests in `contracts-stellar/src/test.rs`.
  - Integrate with `src/services/stellar.service.ts`.

---

### Issue 2: `[SECURITY] Configurable Dynamic TTL Rent Warning Thresholds in UI`
- **Labels**: `ui/ux`, `security`, `stellar`
- **Estimated Effort**: 3-4 hours
- **Description**: Add an ambient visual indicator on the Dashboard and Vault cards displaying the remaining ledger lifetime before state archival, with a 1-click "Bump Rent" CTA button.
- **Scope**:
  - Fetch contract instance TTL via Soroban RPC `getLedgerEntries`.
  - Display color-coded health badge (Green > 30 days, Yellow 7-30 days, Red < 7 days).
  - Add "Bump TTL" button invoking `extend_ttl()`.

---

### Issue 3: `[INFRA] Automated GitHub Actions Workflow for Stellar Soroban Contract Verification`
- **Labels**: `ci/cd`, `automation`, `testing`
- **Estimated Effort**: 2-3 hours
- **Description**: Add a continuous integration workflow that compiles the Soroban contract with Rust 1.81.0, optimizes WASM bytecode via `binaryen`, and verifies tests automatically on pull requests.
- **Scope**:
  - Create `.github/workflows/soroban-ci.yml`.
  - Cache Cargo dependencies and `wasm32-unknown-unknown` target.
  - Run `cargo test --manifest-path contracts-stellar/Cargo.toml`.

---

### Issue 4: `[CRYPTO] Benchmarking Argon2id vs PBKDF2 Memory Hardness in Mobile WebViews`
- **Labels**: `cryptography`, `performance`, `benchmarks`
- **Estimated Effort**: 4-5 hours
- **Description**: SpooVault uses Argon2id for client-side password derivation. Benchmark memory usage and CPU execution time across iOS Safari and Android Chrome to determine optimal memory and iteration parameters.
