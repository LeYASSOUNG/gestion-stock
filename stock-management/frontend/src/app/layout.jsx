import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Stock Management System',
    description: 'Efficient stock management for your business',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <AuthProvider>
                    <Toaster position="top-right" />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
