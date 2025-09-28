import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowG - Minimalist AI Workflow Builder",
  description: "Build sophisticated AI workflows using a clean, minimalist interface powered by 0G Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-white text-black">
        {children}
      </body>
    </html>
  );
}
