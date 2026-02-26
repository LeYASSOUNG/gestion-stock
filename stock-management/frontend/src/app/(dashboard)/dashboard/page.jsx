'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import {
    CubeIcon,
    BuildingOfficeIcon,
    TruckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
    const [kpis, setKpis] = useState({
        totalProducts: 0,
        totalWarehouses: 0,
        totalSuppliers: 0,
        lowStockProducts: 0,
        totalStockValue: 0
    })
    const [alerts, setAlerts] = useState([])
    const [recentMovements, setRecentMovements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [kpiRes, alertRes, movementRes] = await Promise.all([
                api.get('/dashboard/kpis'),
                api.get('/dashboard/alerts'),
                api.get('/movements')
            ])
            setKpis(kpiRes.data)
            setAlerts(alertRes.data.lowStock || [])
            setRecentMovements(movementRes.data.slice(0, 5)) // Get latest 5
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const cards = [
        {
            name: 'Produits',
            value: kpis.totalProducts,
            icon: CubeIcon,
            textColor: 'text-blue-500'
        },
        {
            name: 'Entrepôts',
            value: kpis.totalWarehouses,
            icon: BuildingOfficeIcon,
            textColor: 'text-green-500'
        },
        {
            name: 'Fournisseurs',
            value: kpis.totalSuppliers,
            icon: TruckIcon,
            textColor: 'text-purple-500'
        },
        {
            name: 'Stock Bas',
            value: kpis.lowStockProducts,
            icon: ExclamationTriangleIcon,
            textColor: 'text-yellow-500'
        }
    ]

    if (loading) {
        return <div className="flex justify-center py-10">Chargement...</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tableau de bord</h1>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-full bg-gray-50 ${card.textColor}`}>
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                                            <dd className="text-lg font-bold text-gray-900">{card.value}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Activités Récentes */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Mouvements récents</h2>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {recentMovements.length > 0 ? recentMovements.map((movement) => (
                                <li key={movement.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {movement.product?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {movement.type} - {movement.quantity} {movement.product?.unit}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {new Date(movement.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )) : (
                                <p className="py-4 text-sm text-gray-500">Aucun mouvement récent.</p>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Alertes de Stock Bas */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Alertes de stock bas</h2>
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {alerts.length > 0 ? alerts.map((product) => (
                                <li key={product.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-yellow-100 rounded-full">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                SKU: {product.sku} - Seuil: {product.minStockAlert}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-red-600">
                                                Action requise
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            )) : (
                                <p className="py-4 text-sm text-gray-500">Tous les stocks sont normaux.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
