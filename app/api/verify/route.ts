import { verifyMessageSignatureRsv } from "@stacks/encryption";
import { publicKeyToAddress } from "@stacks/transactions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const message = searchParams.get("message");
  const signature = searchParams.get("signature");
  const publicKey = searchParams.get("publicKey");
  const network = searchParams.get("network") as "mainnet" | "testnet" | null;

  if (!address || !message || !signature || !publicKey) {
    return NextResponse.json(
      { valid: false, message: "Missing address, message, signature, or publicKey" },
      { status: 400 }
    );
  }

  // Determine the network from the parameter or infer from address prefix
  const effectiveNetwork = network ?? (address.startsWith("ST") || address.startsWith("SN") ? "testnet" : "mainnet");

  try {
    // Verify that the public key matches the claimed address using the correct network
    const derivedAddress = publicKeyToAddress(publicKey, effectiveNetwork);
    if (derivedAddress !== address) {
      return NextResponse.json(
        { valid: false, message: "Public key does not match address" },
        { status: 400 }
      );
    }

    // Verify the signature using the public key
    const valid = verifyMessageSignatureRsv({
      message,
      signature,
      publicKey,
    });

    if (valid) {
      return NextResponse.json({ valid: true, message: "Valid signature" });
    } else {
      return NextResponse.json(
        { valid: false, message: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { valid: false, message: `Verification error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
