import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stacks Message Signing Test",
  description: "Test signing messages with Stacks wallets",
  other: {
    "talentapp:project_verification":
      "7f5be48e01368844177648faa1690691c40a0d59e7122b4a83f7acc1501b8e4426317eae2c4ca14b14fe6283053390466088e18628ab1a66ce9f42341f6e9fb6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `globalThis.litIssuedWarnings ??= new Set();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
