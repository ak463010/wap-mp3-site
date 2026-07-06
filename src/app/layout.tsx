import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "MP3WAP - Free MP3 Downloads",
  description: "Your ultimate WAP-style MP3 download site. Download free MP3 songs, create folders, share music.",
  generator: "MP3WAP v2.0",
  authors: [{ name: "MP3WAP Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
