import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "Algo Vault — 競プロアルゴリズム集",
    description: "競技プログラミングのアルゴリズムを、探す・編集する・すぐ使う。",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "Algo Vault", description: "競プロのコードを、探す・磨く・すぐ使う。", images: [{ url: image, width: 1792, height: 1024 }] },
    twitter: { card: "summary_large_image", title: "Algo Vault", description: "競プロのコードを、探す・磨く・すぐ使う。", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
