import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiBook,
  FiCode,
  FiTerminal,
  FiShield,
  FiCheckCircle,
  FiExternalLink,
  FiCpu,
  FiCopy,
  FiSearch,
  FiKey,
  FiLock,
  FiActivity,
  FiUsers,
  FiArrowRight,
  FiMenu,
  FiX,
  FiAward,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import BrandLogo from "../components/BrandLogo";

const STELLAR_CONTRACT_ID = "CABUBCKYGVLEOBKW5MQ2Q76IOR3NQSYZLPEUP3JDDX5MFHJDAVM7Y26B";
const STELLAR_TESTNET_EXPLORER = `https://stellar.expert/explorer/testnet/contract/${STELLAR_CONTRACT_ID}`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const navGroups = [
    {
      title: "Getting Started",
      items: [
        { id: "overview", label: "Protocol Overview", icon: FiBook },
        { id: "problem", label: "The Dead Man's Switch", icon: FiActivity },
        { id: "architecture", label: "System Architecture", icon: FiCpu },
      ],
    },
    {
      title: "Cryptography & Security",
      items: [
        { id: "cryptography", label: "ECIES & SSS Encryption", icon: FiLock },
        { id: "passkeys", label: "WebAuthn & Passkeys", icon: FiKey },
        { id: "security", label: "Security & Threat Model", icon: FiShield },
      ],
    },
    {
      title: "Soroban Smart Contracts",
      items: [
        { id: "contract-overview", label: "Contract Reference", icon: FiCode },
        { id: "methods", label: "Core Methods & API", icon: FiTerminal },
        { id: "storage-ttl", label: "State & TTL Rent Bumping", icon: FiShield },
      ],
    },
    {
      title: "Development & Testing",
      items: [
        { id: "testing", label: "Test Suites (94 Rust / 918 Vitest)", icon: FiCheckCircle },
        { id: "deployment", label: "Deployment & Verification", icon: FiTerminal },
      ],
    },
    {
      title: "Ecosystem & Governance",
      items: [
        { id: "grants", label: "Drips Wave & SCF Grant", icon: FiAward },
        { id: "maintainers", label: "Maintainers & Community", icon: FiUsers },
      ],
    },
  ];

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups;
    const q = searchQuery.toLowerCase();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#07060B] text-gray-200 font-sans selection:bg-purple-600/30 selection:text-purple-200">
      {/* Top Docs Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090710]/90 border-b border-purple-900/20 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <BrandLogo className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  SpooVault <span className="text-purple-400 font-mono text-sm font-normal">Docs</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
                  Stellar Soroban Native
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Testnet Protocol 22
            </span>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, methods, cryptographic specs..."
                className="w-full bg-[#110D1D]/90 border border-purple-900/30 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/spoo-vault/spoovault"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/30 transition-all"
            >
              <FiCode className="text-sm" />
              <span>GitHub</span>
              <FiExternalLink className="text-[10px] text-gray-500" />
            </a>

            <a
              href={STELLAR_TESTNET_EXPLORER}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/30 transition-all"
            >
              <span>Contract Explorer</span>
              <FiExternalLink className="text-[10px]" />
            </a>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-900/30 transition-all"
            >
              <span>Launch App</span>
              <FiArrowRight className="text-xs" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-purple-950/20 border border-purple-900/30"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex gap-8">
        {/* Left Sticky Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#090710] border-r border-purple-900/20 p-6 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:shrink-0 md:bg-transparent md:border-r-0 md:p-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Search */}
          <div className="sm:hidden mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full bg-[#110D1D] border border-purple-900/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-400/70 px-2">
                  {group.title}
                </div>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                          document
                            .getElementById(item.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                          isActive
                            ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 font-semibold shadow-sm"
                            : "text-gray-400 hover:text-gray-200 hover:bg-purple-950/20"
                        }`}
                      >
                        <Icon className={`text-sm ${isActive ? "text-purple-400" : "text-gray-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Contract ID Quick Card */}
          <div className="mt-8 p-3 rounded-xl bg-purple-950/20 border border-purple-800/20 space-y-2">
            <div className="text-[10px] font-mono text-purple-300 font-semibold uppercase">
              Live Testnet Contract
            </div>
            <div className="font-mono text-[10px] text-gray-400 break-all select-all bg-[#0a0713] p-1.5 rounded border border-purple-900/30">
              {STELLAR_CONTRACT_ID}
            </div>
            <button
              onClick={() => copyToClipboard(STELLAR_CONTRACT_ID, "Contract ID")}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-purple-300 hover:text-purple-200 bg-purple-900/30 hover:bg-purple-900/50 rounded transition-all"
            >
              <FiCopy className="text-xs" />
              <span>Copy Contract ID</span>
            </button>
          </div>
        </aside>

        {/* Right Documentation Content */}
        <main className="flex-1 min-w-0 space-y-16 pb-20">
          {/* Section: Overview */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 via-gray-900/40 to-black border border-purple-800/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <FiBook className="text-xs" /> Protocol Architecture
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  SpooVault Documentation & Engineering Specifications
                </h1>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-3xl">
                  SpooVault is an autonomous, decentralized document custody and inheritance protocol natively engineered on{" "}
                  <strong className="text-purple-300">Stellar Soroban (Rust)</strong>. It provides trustless Dead Man&apos;s Switch mechanisms, Shamir&apos;s Secret Sharing (SSS) Guardian consensus, ECIES client-side payload encryption, and passkey authentication for resilient digital legacy preservation.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#0c0918]/80 border border-purple-900/30">
                    <div className="text-xs font-mono text-gray-400">Ledger Native</div>
                    <div className="text-sm font-semibold text-white mt-1">Stellar Soroban (Rust)</div>
                    <div className="text-[11px] text-purple-300/80 mt-0.5">Zero EVM or Avalanche remnants</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0c0918]/80 border border-purple-900/30">
                    <div className="text-xs font-mono text-gray-400">Autonomous Switch</div>
                    <div className="text-sm font-semibold text-white mt-1">Proof-of-Life Heartbeats</div>
                    <div className="text-[11px] text-purple-300/80 mt-0.5">Authorizable Keeper Relays</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#0c0918]/80 border border-purple-900/30">
                    <div className="text-xs font-mono text-gray-400">Cryptographic Privacy</div>
                    <div className="text-sm font-semibold text-white mt-1">Client-Side ECIES + SSS</div>
                    <div className="text-[11px] text-purple-300/80 mt-0.5">k-of-n Guardian recovery</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Problem & Solution */}
          <section id="problem" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiActivity className="text-purple-400" />
              The Dead Man&apos;s Switch Problem & Soroban Advantage
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Billions of dollars in digital assets, legal credentials, private keys, and critical company documents are permanently lost every year due to sudden incapacitation or demise of single keyholders. Centralized custody solutions reintroduce counterparty failure, custodial seizure, and single-point-of-compromise vulnerabilities.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-950/10 border border-red-900/30 space-y-2">
                <div className="text-xs font-bold font-mono text-red-400 uppercase">
                  Traditional / Centralized Custody Flaws
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>Custodians hold unencrypted plaintext or server-side keys.</li>
                  <li>Subject to arbitrary account freeze, KYC lockouts, or insolvency.</li>
                  <li>Inflexible inheritance requiring prolonged probate court orders.</li>
                  <li>Expensive recurring maintenance fees regardless of usage.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-900/30 space-y-2">
                <div className="text-xs font-bold font-mono text-emerald-400 uppercase">
                  SpooVault on Stellar Soroban
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>Pure smart contract custody executed transparently on Stellar Testnet.</li>
                  <li>Sub-second settlement and fractions of a cent per heartbeat transaction.</li>
                  <li>Authorized Keepers can submit heartbeats on behalf of offline creators without gaining vault access.</li>
                  <li>Shamir&apos;s Secret Sharing distributes key shards across independent Guardians.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Architecture */}
          <section id="architecture" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCpu className="text-purple-400" />
              System Architecture & Lifecycle
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              SpooVault combines on-chain state coordination via Soroban with off-chain cryptographic storage powered by IPFS (Pinata) and WebAuthn authenticators:
            </p>

            <div className="p-4 rounded-xl bg-[#0b0817] border border-purple-900/30 font-mono text-xs text-purple-300 space-y-2 overflow-x-auto">
              <div className="text-gray-400">// High-level lifecycle flow:</div>
              <div>[1. Creator] ==(ECIES Encrypt Document)==&gt; [IPFS CID]</div>
              <div>[2. Creator] ==(register_vault(timeout, guardians, ipfs_cid))==&gt; [Soroban Contract]</div>
              <div>[3. Periodic] ==(prove_life() or authorized keeper relay)==&gt; [Resets Heartbeat Timer]</div>
              <div>[4. Expiration] ==(Time &gt; LastHeartbeat + Timeout)==&gt; [Status: EMERGENCY_RELEASE]</div>
              <div>[5. Beneficiary] ==(request_access() + Guardian SSS Shard Aggregation)==&gt; [Decrypted Assets]</div>
            </div>
          </section>

          {/* Section: Cryptography */}
          <section id="cryptography" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiLock className="text-purple-400" />
              Cryptographic Specification: ECIES & SSS
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              SpooVault enforces zero-knowledge architecture. Neither the Stellar validators, the contract deployer, nor the IPFS gateways ever have access to unencrypted file content or private keys.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0d091a] border border-purple-900/20 space-y-2">
                <div className="text-sm font-bold text-white">1. Client-Side ECIES Payload Encryption</div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Documents are encrypted in the user&apos;s browser using AES-256-GCM with a freshly generated ephemeral 256-bit symmetric key. The symmetric key is then encrypted via Elliptic Curve Integrated Encryption Scheme (ECIES) using the creator&apos;s public key and the designated beneficiaries&apos; public keys.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d091a] border border-purple-900/20 space-y-2">
                <div className="text-sm font-bold text-white">2. Shamir&apos;s Secret Sharing (SSS) Guardian Consensus</div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  For high-value vaults, the master decryption key is split into <code className="text-purple-300 font-mono">n</code> polynomial shards with a threshold requirement of <code className="text-purple-300 font-mono">k</code> shards (<code className="text-purple-300 font-mono">k &lt;= n</code>). Each Guardian receives an individually encrypted shard. When emergency mode triggers, a quorum of <code className="text-purple-300 font-mono">k</code> guardians must approve before the reconstruction key is assembled.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Passkeys */}
          <section id="passkeys" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiKey className="text-purple-400" />
              WebAuthn & Hardware Passkey Integration
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              SpooVault integrates native FIDO2 / WebAuthn hardware biometric signing (Apple TouchID, FaceID, Windows Hello, YubiKey). Passkeys eliminate seed-phrase loss vulnerability for non-technical users while providing hardware-isolated cryptographic keypairs.
            </p>
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-gray-300 space-y-1">
              <div className="font-semibold text-purple-200">Session Lock Gate & Privacy Guard</div>
              <p>
                The frontend implements automatic inactivity session locking (<code className="text-purple-300 font-mono">15m idle</code>). When triggered, volatile cryptographic keys in memory are scrubbed, requiring biometric or wallet authentication to restore the session.
              </p>
            </div>
          </section>

          {/* Section: Contract Reference */}
          <section id="contract-overview" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCode className="text-purple-400" />
              Soroban Smart Contract Reference
            </h2>
            <div className="p-4 rounded-xl bg-[#0a0714] border border-purple-900/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-purple-300 font-bold uppercase">
                  Active Deployment Contract ID
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-mono">
                  Verified on Stellar Testnet
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#050409] p-2.5 rounded-lg border border-purple-900/30">
                <code className="text-xs font-mono text-purple-200 break-all select-all flex-1">
                  {STELLAR_CONTRACT_ID}
                </code>
                <button
                  onClick={() => copyToClipboard(STELLAR_CONTRACT_ID, "Contract ID")}
                  className="px-2.5 py-1 text-xs font-mono font-medium text-purple-300 hover:text-white bg-purple-900/30 hover:bg-purple-800/40 rounded transition-all shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </section>

          {/* Section: Methods */}
          <section id="methods" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiTerminal className="text-purple-400" />
              Core Contract Methods
            </h2>
            <div className="space-y-4">
              {/* Method 1 */}
              <div className="p-4 rounded-xl bg-[#0b0816] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-purple-300">
                    create_vault(e: Env, creator: Address, heartbeat_timeout: u64, name: String) -&gt; u64
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/30">
                    Write
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Initializes a new Dead Man&apos;s Switch vault on the Stellar ledger. Sets initial heartbeat timestamp to current ledger time and returns the newly assigned numeric Vault ID.
                </p>
              </div>

              {/* Method 2 */}
              <div className="p-4 rounded-xl bg-[#0b0816] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-purple-300">
                    prove_life(e: Env, vault_id: u64, caller: Address)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/30">
                    Write
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Resets the heartbeat timer. Can be invoked directly by the vault creator (authenticated via <code className="text-purple-300 font-mono">caller.require_auth()</code>) or by an authorized Keeper relaying a signed heartbeat nonce.
                </p>
              </div>

              {/* Method 3 */}
              <div className="p-4 rounded-xl bg-[#0b0816] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-purple-300">
                    authorize_keeper(e: Env, vault_id: u64, keeper: Address, valid_until: u64)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/30">
                    Write
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Grants an automated background relay agent (Keeper) the permission to submit <code className="text-purple-300 font-mono">prove_life()</code> on behalf of the creator without granting read or transfer privileges over vault documents.
                </p>
              </div>

              {/* Method 4 */}
              <div className="p-4 rounded-xl bg-[#0b0816] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-purple-300">
                    add_document(e: Env, vault_id: u64, ipfs_cid: String, doc_hash: BytesN&lt;32&gt;)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/30">
                    Write
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Binds an encrypted IPFS content identifier (CID) and cryptographic sha256 checksum to the vault custody record.
                </p>
              </div>

              {/* Method 5 */}
              <div className="p-4 rounded-xl bg-[#0b0816] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-purple-300">
                    request_access(e: Env, vault_id: u64, beneficiary: Address) -&gt; bool
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/30">
                    Read/Write
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Verifies if the heartbeat timeout has elapsed. If true, unlocks access for the registered beneficiary address and logs an on-chain release audit event.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Storage & TTL */}
          <section id="storage-ttl" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiShield className="text-purple-400" />
              Soroban State & TTL Rent Bumping
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Soroban uses state archival and Time-To-Live (TTL) rent to maintain high network throughput. SpooVault implements automatic TTL extension logic on every heartbeat to ensure vault records and cryptographic commitments never get archived into cold storage:
            </p>
            <div className="p-4 rounded-xl bg-[#080612] border border-purple-900/30 font-mono text-xs text-purple-300">
              <pre className="whitespace-pre-wrap">
{`// Automatic TTL rent bump in contracts-stellar/src/lib.rs
e.storage().instance().extend_ttl(
    INSTANCE_LIFETIME_THRESHOLD, // 518,400 ledgers (~30 days)
    INSTANCE_BUMP_AMOUNT         // 1,036,800 ledgers (~60 days)
);`}
              </pre>
            </div>
          </section>

          {/* Section: Testing & Verification */}
          <section id="testing" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" />
              Testing & Quality Verification (94 Rust / 918 Vitest)
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              SpooVault maintains 100% test coverage across both smart contracts and frontend cryptographic modules.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#090713] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-purple-300">
                    1. Run Soroban Smart Contract Tests (Rust)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">94 / 94 Passing</span>
                </div>
                <div className="bg-[#040308] p-2.5 rounded border border-purple-900/20 font-mono text-xs text-gray-300 flex items-center justify-between">
                  <code>cargo test --manifest-path contracts-stellar/Cargo.toml</code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "cargo test --manifest-path contracts-stellar/Cargo.toml",
                        "Rust test command"
                      )
                    }
                    className="text-purple-400 hover:text-white"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Tests vault creation, heartbeat timeouts, authorized keeper delegation, cross-chain identity resolution, and emergency unlock consensus.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090713] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-purple-300">
                    2. Run Frontend & ECIES/SSS Vitest Suite
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">70 Suites / 918 Passing</span>
                </div>
                <div className="bg-[#040308] p-2.5 rounded border border-purple-900/20 font-mono text-xs text-gray-300 flex items-center justify-between">
                  <code>npm test -- --run</code>
                  <button
                    onClick={() => copyToClipboard("npm test -- --run", "Vitest test command")}
                    className="text-purple-400 hover:text-white"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Verifies client-side ECIES encryption, Shamir Secret Sharing shard recovery, SessionLockGate privacy guards, and Stellar SDK transactions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#090713] border border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-purple-300">
                    3. Run Live Stellar Testnet Smoke Check
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">On-Chain Verified</span>
                </div>
                <div className="bg-[#040308] p-2.5 rounded border border-purple-900/20 font-mono text-xs text-gray-300 flex items-center justify-between">
                  <code>npm run test:smoke</code>
                  <button
                    onClick={() => copyToClipboard("npm run test:smoke", "Smoke test command")}
                    className="text-purple-400 hover:text-white"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Directly verifies Soroban RPC health, Horizon testnet connectivity, and the active SpooVault contract instance on Stellar Testnet.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Deployment */}
          <section id="deployment" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiTerminal className="text-purple-400" />
              Deployment & Reproduction Guide
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              To deploy your own instance of the SpooVault Soroban contract to Stellar Testnet:
            </p>
            <div className="p-4 rounded-xl bg-[#06040d] border border-purple-900/30 font-mono text-xs text-gray-300 space-y-3">
              <div>
                <span className="text-purple-400"># 1. Compile WASM bytecode:</span>
                <div className="text-gray-200 mt-0.5">cargo build --manifest-path contracts-stellar/Cargo.toml --target wasm32-unknown-unknown --release</div>
              </div>
              <div>
                <span className="text-purple-400"># 2. Optimize & normalize WASM (disables reference-types for Soroban Host VM):</span>
                <div className="text-gray-200 mt-0.5">node scripts/optimize-wasm.mjs</div>
              </div>
              <div>
                <span className="text-purple-400"># 3. Deploy to Stellar Testnet via SDK 17 & Horizon:</span>
                <div className="text-gray-200 mt-0.5">node scripts/deploy-stellar.mjs</div>
              </div>
            </div>
          </section>

          {/* Section: Grants */}
          <section id="grants" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiAward className="text-purple-400" />
              Drips Wave & Stellar Community Fund (SCF)
            </h2>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-800/40 space-y-3">
              <div className="text-sm font-bold text-purple-200">
                Grant Fox & Open Source Sponsorship Compliance
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                SpooVault is built as a public good for the Stellar ecosystem. Contributions, milestone tracking, and contributor bounties are coordinated through Drips Wave and the Stellar Community Fund.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://drips.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-200 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/30 inline-flex items-center gap-1.5"
                >
                  <span>Drips Wave Profile</span>
                  <FiExternalLink className="text-[10px]" />
                </a>
                <a
                  href="https://communityfund.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-200 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/30 inline-flex items-center gap-1.5"
                >
                  <span>Stellar Community Fund</span>
                  <FiExternalLink className="text-[10px]" />
                </a>
              </div>
            </div>
          </section>

          {/* Section: Maintainers */}
          <section id="maintainers" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiUsers className="text-purple-400" />
              Maintainers & Contributors
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#090714] border border-purple-900/30 flex items-center gap-3">
                <img
                  src="https://github.com/bamiebot-maker.png"
                  alt="Ibrahim Sobur Bamidele"
                  className="w-12 h-12 rounded-full border border-purple-500/40 object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-white">Ibrahim Sobur Bamidele</div>
                  <div className="text-xs text-purple-300">Founder, Lead Full-Stack & Smart Contract Developer</div>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href="https://github.com/bamiebot-maker"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <span>@bamiebot-maker</span>
                      <FiExternalLink className="text-[9px]" />
                    </a>
                    <a
                      href="https://x.com/bamietech_dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>@bamietech_dev</span>
                      <FiExternalLink className="text-[9px]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 border border-purple-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-white">Ready to safeguard your legacy?</div>
              <div className="text-xs text-gray-400 mt-1">
                Launch the application and test the Dead Man&apos;s Switch on Stellar Testnet.
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 transition-all shrink-0"
            >
              Open SpooVault App
            </Link>
          </div>
        </main>
      </div>

      {/* Standalone Docs Footer */}
      <footer className="border-t border-purple-900/20 bg-[#050409] py-8 px-4 lg:px-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-5 h-5" />
            <span className="text-gray-400 font-medium">SpooVault Documentation</span>
            <span className="text-gray-600">&bull;</span>
            <span className="text-gray-500">Stellar Soroban Network</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <Link to="/" className="hover:text-purple-300">Home</Link>
            <Link to="/dashboard" className="hover:text-purple-300">App</Link>
            <a href="https://github.com/spoo-vault/spoovault" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300">GitHub</a>
            <a href={STELLAR_TESTNET_EXPLORER} target="_blank" rel="noopener noreferrer" className="hover:text-purple-300">Contract</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
