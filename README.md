# Stacks Message Signing Test

A simple Next.js application for testing message signing with Stacks wallets.

## Features

- Connect to Stacks wallets (Leather, Xverse, etc.)
- Sign arbitrary messages
- Display signature, public key, and address
- Backend verification of signatures

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. Click "Connect Wallet" to connect your Stacks wallet
2. Enter a message to sign
3. Click "Sign Message" to request a signature from your wallet
4. View the signature result (address, message, public key, signature)
5. Click "Verify in Backend" to validate the signature server-side

## Signature Validation

For a reference implementation of Stacks signature validation, see:
https://github.com/0xleal/stacks-signing-validator
