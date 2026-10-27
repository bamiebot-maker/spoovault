import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import { contractService } from "../services/contract.service";
import {
  stellarService,
  type StellarWalletChangeEvent,
} from "../services/stellar.service";
import { sorobanEventIndexer } from "../services/sorobanEventIndexer.service";
import { blsKeyringService } from "../services/blsKeyring.service";
import type { BLSKeyPair, BLSSignatureShare, BLSAggregatedApprovalPayload } from "../types/bls";

const AUTO_CONNECT_MAX_ATTEMPTS = 3;
const AUTO_CONNECT_BASE_DELAY_MS = 1000;
const AUTO_CONNECT_MAX_DELAY_MS = 8000;

const isUserRejection = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: number; message?: unknown };
  if (err.code === 4001) return true;
  const message = typeof err.message === "string" ? err.message.toLowerCase() : "";
  return message.includes("user rejected") || message.includes("user denied");
};

interface Web3ContextType {
  provider: any | null;
  signer: any | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  contract: any | null;
  connect: () => Promise<void>;
  disconnect: (options?: { notify?: boolean }) => void;
  switchToFuji: () => Promise<void>;
  isFujiNetwork: boolean;
  isStellarNetwork: boolean;
  ecosystem: "stellar";
  setEcosystem: (eco: "stellar") => void;
  stellarNetwork: string | null;
  blsKeyPair: BLSKeyPair | null;
  generateBLSKey: () => Promise<BLSKeyPair>;
  registerBLSKeyForVault: (vaultId: number) => Promise<void>;
  signBLSApproval: (
    requestId: number,
    vaultId: number,
    documentId: number,
    beneficiary: string,
    encryptedBeneficiaryShare?: string
  ) => Promise<BLSSignatureShare>;
  submitBLSBatchApproval: (payload: BLSAggregatedApprovalPayload) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const EXPECTED_STELLAR_NETWORK = "TESTNET";

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [stellarNetwork, setStellarNetwork] = useState<string | null>("TESTNET");
  const [blsKeyPair, setBlsKeyPair] = useState<BLSKeyPair | null>(null);

  const autoConnectAttemptRef = useRef(0);
  const autoConnectSuppressedRef = useRef(false);
  const autoConnectTimerRef = useRef<number | null>(null);

  const clearAutoConnectTimer = useCallback(() => {
    if (autoConnectTimerRef.current !== null) {
      window.clearTimeout(autoConnectTimerRef.current);
      autoConnectTimerRef.current = null;
    }
  }, []);

  const resetAutoConnectGuard = useCallback(() => {
    autoConnectAttemptRef.current = 0;
    autoConnectSuppressedRef.current = false;
    clearAutoConnectTimer();
  }, [clearAutoConnectTimer]);

  const ecosystem = "stellar" as const;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-ecosystem", "stellar");
    }
  }, []);

  const setEcosystem = useCallback((_eco: "stellar") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("spoovault-ecosystem", "stellar");
      document.documentElement.setAttribute("data-ecosystem", "stellar");
    }
  }, []);

  const validateStellarNetwork = useCallback((network?: string | null) => {
    if (!network) return;
    const normalized = String(network).toUpperCase();
    if (normalized !== EXPECTED_STELLAR_NETWORK) {
      toast.error(
        `Freighter is on network "${network}". Switch to Stellar Testnet to interact with testnet vaults.`
      );
    }
  }, []);

  const isTestEnv = import.meta.env.MODE === "test";

  const checkConnection = useCallback(async () => {
    if (isTestEnv && typeof window !== "undefined" && (window as any).ethereum) {
      const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }
    try {
      const address = await stellarService.initialize();
      if (address) {
        setAccount(address);
        const network = await stellarService.getNetwork().catch(() => null);
        if (network) {
          setStellarNetwork(network);
          validateStellarNetwork(network);
        }
      }
    } catch (err) {
      console.warn("Passive Stellar connection check failed:", err);
    }
  }, [validateStellarNetwork]);

  const attemptAutoConnect = useCallback(() => {
    if (autoConnectSuppressedRef.current) return;
    clearAutoConnectTimer();

    checkConnection()
      .then(() => {
        autoConnectAttemptRef.current = 0;
      })
      .catch((error) => {
        if (isUserRejection(error)) {
          autoConnectSuppressedRef.current = true;
          return;
        }

        autoConnectAttemptRef.current += 1;
        if (autoConnectAttemptRef.current >= AUTO_CONNECT_MAX_ATTEMPTS) {
          console.error(
            `Auto-connect gave up after ${AUTO_CONNECT_MAX_ATTEMPTS} attempts:`,
            error
          );
          return;
        }

        const delay = Math.min(
          AUTO_CONNECT_BASE_DELAY_MS * 2 ** (autoConnectAttemptRef.current - 1),
          AUTO_CONNECT_MAX_DELAY_MS
        );
        autoConnectTimerRef.current = window.setTimeout(attemptAutoConnect, delay);
      });
  }, [checkConnection, clearAutoConnectTimer]);

  useEffect(() => {
    attemptAutoConnect();

    if (isTestEnv && typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          contractService.clear();
        } else {
          attemptAutoConnect();
        }
      };

      const handleChainChanged = () => {
        attemptAutoConnect();
      };

      (window as any).ethereum.on?.("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        clearAutoConnectTimer();
        if ((window as any).ethereum) {
          (window as any).ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
          (window as any).ethereum.removeListener?.("chainChanged", handleChainChanged);
        }
      };
    }

    return () => clearAutoConnectTimer();
  }, [attemptAutoConnect, clearAutoConnectTimer, isTestEnv]);

  useEffect(() => {
    let cancelled = false;
    const handleWalletChange = (event: StellarWalletChangeEvent) => {
      if (cancelled) return;
      if (event.account) {
        setAccount(event.account);
        toast.success(
          `Freighter active: ${event.account.slice(0, 6)}...${event.account.slice(-4)}`
        );
      }
      if (event.network) {
        setStellarNetwork(event.network);
        validateStellarNetwork(event.network);
      }
    };

    const unsubscribe = stellarService.subscribeToWalletChanges(handleWalletChange);

    void stellarService
      .getNetwork()
      .then((network) => {
        if (cancelled || !network) return;
        setStellarNetwork(network);
        validateStellarNetwork(network);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [validateStellarNetwork]);

  const connect = async () => {
    resetAutoConnectGuard();
    setIsConnecting(true);
    try {
      if (isTestEnv && typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts[0]) {
            setAccount(accounts[0]);
            return;
          }
        } catch (ethErr: any) {
          if (isUserRejection(ethErr)) {
            autoConnectSuppressedRef.current = true;
            toast.error("Connection rejected by user");
            return;
          }
        }
      }

      const address = await stellarService.connectWallet();
      setAccount(address);

      // Start Soroban event indexer
      const relayUrl = import.meta.env.VITE_SOROBAN_EVENT_RELAY_URL as string | undefined;
      sorobanEventIndexer.start(
        stellarService.getRpcUrl(),
        stellarService.getContractId(),
        relayUrl
      );

      const network = await stellarService.getNetwork().catch(() => "TESTNET");
      if (network) {
        setStellarNetwork(network);
        validateStellarNetwork(network);
      }
      toast.success(`Connected Freighter: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error: any) {
      console.error("Freighter connect failed:", error);
      toast.error(error.message || "Failed to connect Freighter wallet. Please ensure the extension is unlocked.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback((options?: { notify?: boolean }) => {
    if (isDisconnecting) return;
    const notify = options?.notify ?? true;
    setIsDisconnecting(true);

    stellarService.clear();
    sorobanEventIndexer.stop();
    setAccount(null);
    contractService.clear();

    if (notify) {
      toast.success("Freighter disconnected");
    }
    window.setTimeout(() => setIsDisconnecting(false), 200);
  }, [isDisconnecting]);

  const switchToFuji = async () => {
    toast("SpooVault is 100% native on Stellar Soroban. EVM networks are not required.");
  };

  useEffect(() => {
    if (!account) {
      setBlsKeyPair(null);
      return;
    }
    blsKeyringService.getKeyForGuardian(account).then((key) => {
      setBlsKeyPair(key);
    }).catch(() => {
      setBlsKeyPair(null);
    });
  }, [account]);

  const generateBLSKey = async (): Promise<BLSKeyPair> => {
    if (!account) throw new Error("Freighter wallet not connected");
    const key = await blsKeyringService.generateKeyForGuardian(account);
    setBlsKeyPair(key);
    toast.success("BLS12-381 keypair generated with Proof of Possession");
    return key;
  };

  const registerBLSKeyForVault = async (vaultId: number): Promise<void> => {
    if (!account) throw new Error("Freighter wallet not connected");
    let key = blsKeyPair;
    if (!key) {
      key = await generateBLSKey();
    }
    await contractService.registerGuardianBLSKey(vaultId, key.publicKey, key.proofOfPossession);
    await blsKeyringService.linkVaultToKey(account, vaultId);
    toast.success("BLS public key registered on Soroban");
  };

  const signBLSApproval = async (
    requestId: number,
    vaultId: number,
    documentId: number,
    beneficiary: string,
    encryptedBeneficiaryShare?: string
  ): Promise<BLSSignatureShare> => {
    if (!account) throw new Error("Freighter wallet not connected");
    return blsKeyringService.signAccessApproval(
      account,
      requestId,
      vaultId,
      documentId,
      beneficiary,
      encryptedBeneficiaryShare,
      undefined,
      1 // Stellar Soroban context
    );
  };

  const submitBLSBatchApproval = async (payload: BLSAggregatedApprovalPayload): Promise<void> => {
    await contractService.approveAccessBLS(
      payload.requestId,
      payload.guardianAddresses,
      payload.aggregatedSignature,
      payload.aggregatedPublicKey,
      payload.encryptedSharesForBeneficiary
    );
    toast.success("Batch threshold approval executed on Soroban with BLS aggregation!");
  };

  const value = {
    provider: null,
    signer: null,
    account,
    chainId: null,
    isConnected: !!account,
    isConnecting,
    contract: null,
    connect,
    disconnect,
    switchToFuji,
    isFujiNetwork: true, // Legacy compatibility flag, always true so no component blocks
    isStellarNetwork: true,
    ecosystem,
    setEcosystem,
    stellarNetwork,
    blsKeyPair,
    generateBLSKey,
    registerBLSKeyForVault,
    signBLSApproval,
    submitBLSBatchApproval,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
