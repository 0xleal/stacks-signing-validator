"use client";

import { useState } from "react";
import { connect, getLocalStorage, openSignatureRequestPopup } from "@stacks/connect";

interface SignatureResult {
  message: string;
  signature: string;
  publicKey: string;
  address: string;
}

interface VerificationResult {
  valid: boolean;
  message: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [error, setError] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  async function connectWallet() {
    try {
      setError("");
      await connect();

      const data = getLocalStorage();
      const stxAddresses = data?.addresses?.stx;

      if (stxAddresses && stxAddresses.length > 0) {
        const addr = stxAddresses[0].address;
        setAddress(addr);
        setIsConnected(true);
      }
    } catch (err) {
      setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function signMessage() {
    if (!message.trim()) {
      setError("Please enter a message to sign");
      return;
    }

    setError("");

    openSignatureRequestPopup({
      message: message,
      onFinish: (data) => {
        setResult({
          message: message,
          signature: data.signature,
          publicKey: data.publicKey,
          address: address,
        });
        setVerificationResult(null);
      },
      onCancel: () => {
        setError("Signature request was cancelled");
      },
    });
  }

  async function verifyInBackend() {
    if (!result) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const params = new URLSearchParams({
        address: result.address,
        message: result.message,
        signature: result.signature,
        publicKey: result.publicKey,
      });

      const response = await fetch(`/api/verify?${params}`);
      const data = await response.json();

      setVerificationResult({
        valid: data.valid,
        message: data.message,
      });
    } catch (err) {
      setVerificationResult({
        valid: false,
        message: `Request failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col gap-8 py-16 px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Stacks Message Signing Test
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connect your Stacks wallet and sign messages
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={connectWallet}
              className="h-10 rounded-lg bg-orange-500 px-4 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              disabled={isConnected}
            >
              {isConnected ? "Connected" : "Connect Wallet"}
            </button>
            {isConnected && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                {address.slice(0, 8)}...{address.slice(-8)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Message to sign
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="h-32 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-black placeholder-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
            />
          </div>

          <button
            onClick={signMessage}
            disabled={!isConnected}
            className="h-10 rounded-lg bg-zinc-900 px-4 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            Sign Message
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Signature Result
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Address
                </span>
                <code className="break-all rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {result.address}
                </code>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Message
                </span>
                <code className="break-all rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {result.message}
                </code>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Public Key
                </span>
                <code className="break-all rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {result.publicKey}
                </code>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Signature
                </span>
                <code className="break-all rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {result.signature}
                </code>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                }}
                className="h-9 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Copy as JSON
              </button>
              <button
                onClick={verifyInBackend}
                disabled={isVerifying}
                className="h-10 rounded-lg bg-zinc-900 px-4 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
              >
                {isVerifying ? "Verifying..." : "Verify in Backend"}
              </button>
            </div>

            {verificationResult && (
              <div
                className={`rounded-lg p-4 text-sm ${
                  verificationResult.valid
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                <span className="font-medium">
                  {verificationResult.valid ? "✓ Valid" : "✗ Invalid"}:
                </span>{" "}
                {verificationResult.message}
              </div>
            )}
          </div>
        )}

        <footer className="mt-auto pt-8 text-center text-sm text-zinc-500">
          <a
            href="https://github.com/0xleal/stacks-signing-validator"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Signature validation reference implementation
          </a>
        </footer>
      </main>
    </div>
  );
}
