'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { useTenantStore } from '../../store/tenantStore'
import api from '../../services/api'
import {
    HomeIcon,
    CubeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    ArrowPathIcon,
    DocumentChartBarIcon,
    ArrowRightOnRectangleIcon,
    TagIcon,
    UsersIcon,
    BellIcon,
    ComputerDesktopIcon,
    WrenchScrewdriverIcon,
    BeakerIcon,
    MapIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
    const { user, logout, loading } = useAuth()
    const { companyName, companyType } = useTenantStore()
    const router = useRouter()
    const pathname = usePathname()
    const [alerts, setAlerts] = useState([])
    const [showAlertDropdown, setShowAlertDropdown] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark'
        setDarkMode(isDark)
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleDarkMode = () => {
        const newDark = !darkMode
        setDarkMode(newDark)
        localStorage.setItem('theme', newDark ? 'dark' : 'light')
        if (newDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchAlerts()
        }
    }, [user])

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/dashboard/alerts')
            setAlerts(response.data.lowStock || [])
        } catch (error) {
            console.error('Error fetching alerts in layout:', error)
        }
    }

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
    ]

    // Modules spécifiques selon le type d'entreprise
    if (companyType === 'IT_STORE') {
        navigation.push(
            { name: 'Équipements IT', href: '/it/equipment', icon: ComputerDesktopIcon },
            { name: 'Support Technique', href: '/it/tickets', icon: WrenchScrewdriverIcon }
        )
    } else if (companyType === 'PHARMACY') {
        navigation.push(
            { name: 'Lots & Péremption', href: '/pharmacy/batches', icon: BeakerIcon }
        )
    } else if (companyType === 'RESTAURANT') {
        navigation.push(
            { name: 'Salles & Tables', href: '/restaurant/tables', icon: MapIcon },
            { name: 'Commandes', href: '/restaurant/orders', icon: ClipboardDocumentListIcon }
        )
    }

    navigation.push({ name: 'Rapports', href: '/reports', icon: DocumentChartBarIcon })

    // Only Admin can see User Management
    if (user?.role === 'ADMIN') {
        navigation.push({ name: 'Utilisateurs', href: '/users', icon: UsersIcon })
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="flex">
                {/* Premium Dark Sidebar */}
                <div className="w-64 bg-slate-950 border-r border-slate-900 min-h-screen fixed flex flex-col z-50">
                    {/* Sidebar Brand Logo Header */}
                    <div className="p-6 border-b border-slate-900/60">
                        <Link href="/dashboard" className="flex items-center space-x-2.5">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <CubeIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                                    {companyName || 'StockManager'}
                                </span>
                                {companyType && (
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                        ERP • {companyType.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Items and Logout */}
                    <div className="flex-1 flex flex-col justify-between py-6">
                        <nav className="px-3 space-y-1.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                                            isActive
                                                ? 'bg-slate-900 text-white border-l-4 border-blue-500 shadow-inner'
                                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 hover:translate-x-1'
                                        }`}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Bottom Logout Button */}
                        <div className="px-3 border-t border-slate-900/60 pt-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center px-4 py-3 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-slate-500 group-hover:text-red-400 transition-colors" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 ml-64">
                    {/* Sticky Glassmorphism Header */}
                    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-40 shadow-sm transition-all">
                        <div className="px-8 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                                {navigation.find(item => item.href === pathname)?.name || 'Accueil'}
                            </h2>
                            <div className="flex items-center space-x-5">
                                {/* Theme Toggler */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 focus:outline-none transition-all text-base"
                                    title="Changer de thème"
                                >
                                    {darkMode ? '☀️' : '🌙'}
                                </button>

                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAlertDropdown(!showAlertDropdown)}
                                        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 focus:outline-none transition-all"
                                    >
                                        <BellIcon className="h-5.5 w-5.5" />
                                        {alerts.length > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                                                {alerts.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Glassmorphic Dropdown Menu */}
                                    {showAlertDropdown && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-gray-100/90 rounded-2xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 transition-all animate-fadeIn">
                                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                                <h3 className="font-bold text-gray-900 flex justify-between items-center text-sm">
                                                    <span>Alertes de stock</span>
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                        {alerts.length} critique{alerts.length > 1 ? 's' : ''}
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                                                {alerts.length > 0 ? (
                                                    alerts.map((item) => {
                                                        const isOutOfStock = item.currentQuantity === 0
                                                        return (
                                                            <Link
                                                                key={item.id}
                                                                href="/products"
                                                                onClick={() => setShowAlertDropdown(false)}
                                                                className="flex items-start p-4 hover:bg-gray-50/80 transition-colors"
                                                            >
                                                                <span className={`mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full ${isOutOfStock ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-yellow-500 shadow-sm shadow-yellow-500/50'}`} />
                                                                <div className="ml-3 flex-1">
                                                                    <p className="text-xs font-bold text-gray-900">{item.name}</p>
                                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                                        SKU: {item.sku} • Stock : <span className={`font-extrabold ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>{item.currentQuantity}</span> {item.unit} (Seuil: {item.minStockAlert})
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        )
                                                    })
                                                ) : (
                                                    <div className="p-6 text-center text-xs text-gray-500">
                                                        🎉 Aucun produit en alerte de stock
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2 bg-gray-50/50 border-t border-gray-100 text-center">
                                                <Link
                                                    href="/products"
                                                    onClick={() => setShowAlertDropdown(false)}
                                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Voir tous les produits
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-6 w-px bg-gray-200" />

                                {/* Premium User Info Badge */}
                                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 shadow-sm">
                                    <div className="h-7.5 w-7.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs uppercase shadow-sm">
                                        {user?.firstName?.[0] || 'U'}
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold text-slate-800 leading-tight">
                                            {user?.firstName} {user?.lastName}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
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
