'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import {
    HomeIcon,
    CubeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    ArrowPathIcon,
    DocumentChartBarIcon,
    ArrowRightOnRectangleIcon,
    TagIcon,
    UsersIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
    const { user, logout, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [user, loading, router])

    if (loading || (!user && pathname !== '/login')) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    }

    if (!user) return null

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Produits', href: '/products', icon: CubeIcon },
        { name: 'Entrepôts', href: '/warehouses', icon: BuildingOfficeIcon },
        { name: 'Fournisseurs', href: '/suppliers', icon: TruckIcon },
        { name: 'Mouvements', href: '/movements', icon: ArrowPathIcon },
        { name: 'Catégories', href: '/categories', icon: TagIcon },
        { name: 'Rapports', href: '/reports', icon: DocumentChartBarIcon },
    ]

    // Only Admin can see User Management
    if (user?.role === 'ADMIN') {
        navigation.push({ name: 'Utilisateurs', href: '/users', icon: UsersIcon })
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white shadow-lg min-h-screen fixed">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-blue-600">StockManager</h1>
                    </div>
                    <nav className="mt-6">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-6 py-3 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                            Déconnexion
                        </button>
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 ml-64">
                    <header className="bg-white shadow-sm">
                        <div className="px-8 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {navigation.find(item => item.href === pathname)?.name || 'Accueil'}
                            </h2>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-600">
                                    {user?.firstName} {user?.lastName} ({user?.role})
                                </span>
                            </div>
                        </div>
                    </header>
                    <main className="p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
