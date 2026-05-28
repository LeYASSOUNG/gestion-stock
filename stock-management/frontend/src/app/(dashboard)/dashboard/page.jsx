'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useTenantStore } from '../../../store/tenantStore'
import {
    CubeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1']

export default function DashboardPage() {
    const { companyType } = useTenantStore()
    const [kpis, setKpis] = useState({
        totalProducts: 0,
        totalWarehouses: 0,
        totalSuppliers: 0,
        lowStockProducts: 0,
        totalStockValue: 0
    })
    const [alerts, setAlerts] = useState([])
    const [recentMovements, setRecentMovements] = useState([])
    const [stocks, setStocks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [kpiRes, alertRes, movementRes, stocksRes] = await Promise.all([
                api.get('/dashboard/kpis'),
                api.get('/dashboard/alerts'),
                api.get('/movements'),
                api.get('/stocks')
            ])
            setKpis(kpiRes.data)
            setAlerts(alertRes.data.lowStock || [])
            setRecentMovements(movementRes.data || [])
            setStocks(stocksRes.data || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    // 1. Data mapping for Category Stock Value (Pie Chart)
    const categoryMap = {}
    stocks.forEach(stock => {
        if (stock.product && stock.product.category) {
            const catName = stock.product.category.name
            const price = stock.product.price || 0
            const qty = stock.quantity || 0
            const value = price * qty
            categoryMap[catName] = (categoryMap[catName] || 0) + value
        }
    })
    const categoryChartData = Object.keys(categoryMap).map(name => ({
        name,
        value: parseFloat(categoryMap[name].toFixed(2))
    }))

    // 2. Data mapping for Warehouse stock counts (Bar Chart)
    const warehouseMap = {}
    stocks.forEach(stock => {
        if (stock.warehouse) {
            const whName = stock.warehouse.name
            const qty = stock.quantity || 0
            warehouseMap[whName] = (warehouseMap[whName] || 0) + qty
        }
    })
    const warehouseChartData = Object.keys(warehouseMap).map(name => ({
        name,
        quantity: warehouseMap[name]
    }))

    // 3. Data mapping for entry/exit trend flow (Area Chart)
    const movementsMap = {}
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }).reverse()

    const last7DaysISO = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0]
    }).reverse()

    last7DaysISO.forEach((isoDate, idx) => {
        movementsMap[isoDate] = { label: last7Days[idx], Entrées: 0, Sorties: 0 }
    })

    recentMovements.forEach(movement => {
        const dateStr = movement.createdAt ? movement.createdAt.split('T')[0] : null
        if (dateStr && movementsMap[dateStr]) {
            if (movement.type === 'ENTRY') {
                movementsMap[dateStr].Entrées += movement.quantity || 0
            } else if (movement.type === 'EXIT') {
                movementsMap[dateStr].Sorties += movement.quantity || 0
            }
        }
    })
    const movementTrendData = Object.values(movementsMap)
    const cards = [
        {
            name: 'Produits',
            value: kpis.totalProducts,
            icon: CubeIcon,
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-500/10 shadow-sm shadow-blue-500/5'
        },
        {
            name: 'Entrepôts',
            value: kpis.totalWarehouses,
            icon: BuildingOfficeIcon,
            textColor: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10 shadow-sm shadow-emerald-500/5'
        },
        {
            name: 'Fournisseurs',
            value: kpis.totalSuppliers,
            icon: TruckIcon,
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-500/10 shadow-sm shadow-purple-500/5'
        },
        {
            name: 'Stock Bas',
            value: kpis.lowStockProducts,
            icon: ExclamationTriangleIcon,
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-500/10 shadow-sm shadow-amber-500/5'
        }
    ]

    if (loading) {
        return <div className="flex justify-center py-10">Chargement...</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Tableau de bord</h1>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.name} className="relative bg-white overflow-hidden rounded-2xl border border-slate-100 p-6 flex items-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-slate-100">
                            <div className={`p-3.5 rounded-xl ${card.bgColor} ${card.textColor}`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-5 flex-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{card.name}</p>
                                <p className="text-3xl font-extrabold text-slate-900 mt-1.5 leading-none">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Area Chart: Entries vs Exits */}
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100 lg:col-span-2">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Flux de stock récents (7 derniers jours)</h2>
                    <div className="h-80">
                        {movementTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={movementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                                    <Legend iconType="circle" />
                                    <Area type="monotone" dataKey="Entrées" stroke="#10B981" fillOpacity={1} fill="url(#colorEntries)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="Sorties" stroke="#EF4444" fillOpacity={1} fill="url(#colorExits)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucune donnée récente</div>
                        )}
                    </div>
                </div>

                {/* Donut Chart: Value by Category */}
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Valeur par catégorie (€)</h2>
                    <div className="h-80 flex flex-col justify-center">
                        {categoryChartData.length > 0 ? (
                            <>
                                <div className="h-3/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {categoryChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()} €`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-2/5 overflow-y-auto mt-2 text-xs space-y-1 px-2 divide-y divide-gray-50">
                                    {categoryChartData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center pt-1">
                                            <span className="h-2 w-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="text-gray-500 truncate mr-2">{entry.name}</span>
                                            <span className="font-semibold text-gray-800 ml-auto">{entry.value.toLocaleString()} €</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucun stock disponible</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Bar Chart: Quantities by Warehouse */}
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Niveau de stock par entrepôt</h2>
                    <div className="h-80">
                        {warehouseChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={warehouseChartData} barSize={16} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(243,244,246,0.5)' }} />
                                    <Bar dataKey="quantity" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Quantité" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucun entrepôt disponible</div>
                        )}
                    </div>
                </div>

                {/* Activités Récentes & Alertes (2 cols wide) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Activités Récentes */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Mouvements récents</h2>
                        <div className="flow-root flex-1 overflow-y-auto max-h-80">
                            <ul className="-my-4 divide-y divide-gray-100">
                                {recentMovements.length > 0 ? recentMovements.slice(0, 5).map((movement) => (
                                    <li key={movement.id} className="py-3 flex justify-between items-center">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-gray-900 truncate">
                                                {movement.product?.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                                {movement.type === 'ENTRY' ? 'Entrée' : movement.type === 'EXIT' ? 'Sortie' : movement.type === 'TRANSFER' ? 'Transfert' : 'Ajustement'} - {movement.quantity} {movement.product?.unit}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gray-50 text-gray-600 border border-gray-100 ml-4">
                                            {new Date(movement.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </li>
                                )) : (
                                    <li className="py-4 text-xs text-gray-400 text-center">Aucun mouvement récent.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Alertes de Stock Bas */}
                    <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6 flex flex-col">
                        <h2 className="text-base font-semibold text-gray-800 mb-4">Alertes de stock bas</h2>
                        <div className="flow-root flex-1 overflow-y-auto max-h-80">
                            <ul className="-my-4 divide-y divide-gray-100">
                                {alerts.length > 0 ? alerts.map((product) => {
                                    const isOutOfStock = product.currentQuantity === 0;
                                    return (
                                        <li key={product.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                <div className={`p-1.5 rounded-lg flex-shrink-0 ${isOutOfStock ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                                                        Stock : <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : 'text-yellow-600'}`}>{product.currentQuantity}</span> {product.unit} (Seuil: {product.minStockAlert})
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ml-4 ${
                                                isOutOfStock ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                            }`}>
                                                {isOutOfStock ? 'Rupture' : 'Critique'}
                                            </span>
                                        </li>
                                    );
                                }) : (
                                    <li className="py-4 text-xs text-gray-400 text-center">Tous les stocks sont normaux.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Spécifiques */}
            {companyType === 'IT_STORE' && (
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Aperçu Support Informatique</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 text-center">
                            <p className="text-xs font-bold text-indigo-400 uppercase">Tickets Ouverts</p>
                            <p className="text-2xl font-bold text-indigo-700 mt-1">12</p>
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-center">
                            <p className="text-xs font-bold text-blue-400 uppercase">Équipements Assignés</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">84</p>
                        </div>
                        <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100 text-center">
                            <p className="text-xs font-bold text-orange-400 uppercase">En Maintenance</p>
                            <p className="text-2xl font-bold text-orange-700 mt-1">3</p>
                        </div>
                    </div>
                </div>
            )}
            
            {companyType === 'PHARMACY' && (
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Aperçu Pharmacie</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-100 text-center">
                            <p className="text-xs font-bold text-rose-400 uppercase">Lots expirant à 30 jours</p>
                            <p className="text-2xl font-bold text-rose-700 mt-1">5</p>
                        </div>
                        <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100 text-center">
                            <p className="text-xs font-bold text-teal-400 uppercase">Ordonnances du jour</p>
                            <p className="text-2xl font-bold text-teal-700 mt-1">42</p>
                        </div>
                    </div>
                </div>
            )}

            {companyType === 'RESTAURANT' && (
                <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">Aperçu Restaurant</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
                            <p className="text-xs font-bold text-amber-400 uppercase">Tables Occupées</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">8 / 24</p>
                        </div>
                        <div className="p-4 bg-red-50/50 rounded-lg border border-red-100 text-center">
                            <p className="text-xs font-bold text-red-400 uppercase">Commandes en cuisine</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">14</p>
                        </div>
                        <div className="p-4 bg-green-50/50 rounded-lg border border-green-100 text-center">
                            <p className="text-xs font-bold text-green-400 uppercase">CA du jour</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">1 240 €</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
