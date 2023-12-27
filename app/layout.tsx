import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import styles from "./layout.module.css";
import StatusBar from '@/components/status-bar/StatusBar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Robot UI',
  description: 'UI for robot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={styles["body"] + " " + inter.className}>
        <StatusBar/>
        {children}</body>
    </html>
  )
}
