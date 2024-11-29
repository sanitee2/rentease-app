import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Poppins } from 'next/font/google';
import "./globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import ClientOnly from "./components/ClientOnly";
import Providers from './providers/Providers';

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <ClientOnly>
          <Providers>
            {children}
          </Providers>
        </ClientOnly>
      </body>
    </html>
  );
}
