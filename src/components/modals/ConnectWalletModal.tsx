import React, { useState, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import {
  FiX,
  FiExternalLink,
  FiCheckCircle,
  FiAlertCircle,
  FiZap,
  FiGlobe,
  FiKey,
  FiSmartphone,
  FiCpu,
} from "react-icons/fi";
import { useWeb3 } from "../../context/Web3Context";
import { stellarService } from "../../services/stellar.service";
import { toast } from "react-hot-toast";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connect, connectDemo, connectAlbedo } = useWeb3();
  const [isMobile, setIsMobile] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [customSecret, setCustomSecret] = useState("");
  const [showSecretInput, setShowSecretInput] = useState(false);

  useEffect(() => {
    setIsMobile(stellarService.isMobileDevice());
    const checkFreighter = async () => {
      try {
        if (typeof window !== "undefined" && ((window as any).freighter || (window as any).freighterApi)) {
          setFreighterInstalled(true);
          return;
        }
        const { isConnected } = await import("@stellar/freighter-api").catch(() => ({ isConnected: async () => false }));
        const installed = await isConnected().catch(() => false);
        setFreighterInstalled(!!installed);
      } catch {
        setFreighterInstalled(false);
      }
    };
    if (isOpen) {
      void checkFreighter();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFreighterConnect = async () => {
    if (!freighterInstalled && isMobile) {
      toast(
        (t) => (
          <div className="text-xs space-y-1">
            <p className="font-semibold text-white">Freighter Mobile Tip</p>
            <p className="text-gray-300">
              Desktop extensions don&apos;t run in mobile browsers. Open SpooVault inside the Freighter Mobile App&apos;s Web3 browser, or use the 1-Tap Demo below!
            </p>
            <div className="pt-1 flex gap-2">
              <a
                href="https://www.freighter.app"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 font-bold underline"
              >
                Get Freighter App
              </a>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 8000 }
      );
      return;
    }

    setLoadingType("freighter");
    try {
      await connect();
      toast.success("Connected via Freighter");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect Freighter");
    } finally {
      setLoadingType(null);
    }
  };

  const handleDemoConnect = async () => {
    setLoadingType("demo");
    try {
      await connectDemo(customSecret.trim() || undefined);
      toast.success("Connected to Stellar Testnet Sandbox (Auto-Funded)");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize demo account");
    } finally {
      setLoadingType(null);
    }
  };

  const handleAlbedoConnect = async () => {
    setLoadingType("albedo");
    try {
      await connectAlbedo();
      toast.success("Connected via Albedo Web Signer");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Albedo connection rejected or cancelled");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-gray-800 bg-gray-950/95 p-6 shadow-2xl text-gray-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Connect Stellar Wallet</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                SOROBAN TESTNET
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Select your preferred authentication method
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl border border-gray-800 bg-gray-900/60 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Mobile Device Banner if on phone */}
        {isMobile && (
          <div className="mt-4 p-3 rounded-2xl border border-purple-500/30 bg-purple-950/30 flex items-start gap-2.5">
            <FiSmartphone className="text-purple-400 text-lg flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-200">
              <span className="font-semibold text-white">Mobile Device Detected: </span>
              Standard browser extensions do not run in mobile Safari/Chrome. We recommend the <strong>1-Tap Demo Account</strong> or <strong>Albedo Web Signer</strong>.
            </div>
          </div>
        )}

        {/* Wallet Options */}
        <div className="mt-5 space-y-3">
          {/* Option 1: 1-Tap Testnet Demo Account */}
          <div
            onClick={handleDemoConnect}
            className="group relative rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-gray-900/40 p-4 hover:border-purple-400 hover:bg-purple-900/20 cursor-pointer transition-all shadow-lg shadow-purple-950/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xl">
                  <FiZap />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      1-Tap Testnet Sandbox Account
                    </p>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Instant on-chain access • Pre-funded with 10k Testnet XLM • No extension required
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                isLoading={loadingType === "demo"}
              >
                Launch
              </Button>
            </div>
          </div>

          {/* Option 2: Freighter Wallet */}
          <div
            onClick={handleFreighterConnect}
            className="group rounded-2xl border border-gray-800 bg-gray-900/40 p-4 hover:border-gray-700 hover:bg-gray-900/70 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl">
                  <FiCpu />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white group-hover:text-orange-300 transition-colors">
                      Freighter Wallet
                    </p>
                    {freighterInstalled ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <FiCheckCircle size={10} /> Extension Detected
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <FiAlertCircle size={10} /> {isMobile ? "Mobile App" : "Not Installed"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Official Stellar browser extension &amp; mobile app
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="bordered"
                className="h-8 px-3 rounded-xl border-gray-700 text-gray-200 text-xs hover:border-orange-500"
                isLoading={loadingType === "freighter"}
              >
                {freighterInstalled ? "Connect" : isMobile ? "Info" : "Install"}
              </Button>
            </div>
          </div>

          {/* Option 3: Albedo Web Signer */}
          <div
            onClick={handleAlbedoConnect}
            className="group rounded-2xl border border-gray-800 bg-gray-900/40 p-4 hover:border-cyan-500/40 hover:bg-gray-900/70 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xl">
                  <FiGlobe />
                </div>
                <div>
                  <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Albedo Web Signer
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Universal web popup bridge • Works seamlessly in mobile Safari &amp; Chrome
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="bordered"
                className="h-8 px-3 rounded-xl border-cyan-800/80 text-cyan-200 text-xs hover:bg-cyan-950/30"
                isLoading={loadingType === "albedo"}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Option 4: Custom Testnet Secret Key */}
          <div className="rounded-2xl border border-gray-800/80 bg-gray-900/30 p-3.5">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowSecretInput((prev) => !prev)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white">
                <FiKey className="text-purple-400" />
                <span>Import Stellar Testnet Secret Key (Advanced)</span>
              </div>
              <span className="text-xs text-gray-500">
                {showSecretInput ? "Hide" : "Show"}
              </span>
            </div>

            {showSecretInput && (
              <div className="mt-3 pt-3 border-t border-gray-800/80 space-y-2">
                <Input
                  type="password"
                  placeholder="S... (Stellar Testnet Secret Key)"
                  value={customSecret}
                  onChange={(e) => setCustomSecret(e.target.value)}
                  className="w-full text-xs"
                />
                <Button
                  size="sm"
                  onClick={handleDemoConnect}
                  className="w-full h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                  isLoading={loadingType === "demo"}
                  isDisabled={!customSecret.trim().startsWith("S")}
                >
                  Import &amp; Connect Key
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
          <span>Stellar Soroban Testnet Contract Live</span>
          <a
            href="https://stellar.expert/explorer/testnet/contract/CCYKK34DEO2BJABJQ7DW5MZ6PYFC7MRJYTZL2QPKBFCXHR4P347EUFZL"
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>Explorer</span>
            <FiExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
