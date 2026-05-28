'use client'
import React, { useState } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import {
    DocumentArrowDownIcon,
    CubeIcon,
    BuildingOfficeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'

/**
 * Page des rapports et exports Next.js (Version Premium WOW Factor).
 */
export default function ReportsPage() {
    const [loading, setLoading] = useState(false)
    const [activeExport, setActiveExport] = useState(null)

    const exportProducts = async () => {
        setLoading(true)
        setActiveExport('products')
        try {
            const response = await api.get('/reports/export/products', {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'products.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast.success('Export réussi')
        } catch (error) {
            toast.error('Erreur lors de l\'export')
        } finally {
            setLoading(false)
            setActiveExport(null)
        }
    }

    const exportStock = async () => {
        setLoading(true)
        setActiveExport('stock')
        try {
            const response = await api.get('/reports/export/stock', {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'stock.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast.success('Export réussi')
        } catch (error) {
            toast.error('Erreur lors de l\'export')
        } finally {
            setLoading(false)
            setActiveExport(null)
        }
    }

    const reports = [
        {
            id: 'products',
            title: 'Liste des produits',
            description: 'Exportez la liste complète des produits avec leurs détails (SKU, prix, catégorie, fournisseur, seuils d\'alerte).',
            action: exportProducts,
            icon: CubeIcon,
            gradient: 'from-blue-500 to-indigo-600',
            shadowColor: 'shadow-blue-500/20',
            bgLight: 'bg-blue-500/10',
            textColor: 'text-blue-600'
        },
        {
            id: 'stock',
            title: 'État des stocks',
            description: 'Exportez l\'état actuel des stocks par entrepôt, incluant les quantités et les emplacements physiques.',
            action: exportStock,
            icon: BuildingOfficeIcon,
            gradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-500/20',
            bgLight: 'bg-emerald-500/10',
            textColor: 'text-emerald-600'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="pb-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rapports &amp; Exports</h1>
                <p className="text-sm text-slate-500 mt-1">Générez et téléchargez des rapports Excel détaillés pour vos analyses</p>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white/90 backdrop-blur-md overflow-hidden rounded-3xl border border-slate-100/80 shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className="p-7">
                            {/* Icon + Title */}
                            <div className="flex items-start space-x-4 mb-4">
                                <div className={`h-12 w-12 rounded-2xl ${report.bgLight} flex items-center justify-center ${report.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {report.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                                        {report.description}
                                    </p>
                                </div>
                            </div>

                            {/* Export Button */}
                            <div className="mt-6">
                                <button
                                    onClick={report.action}
                                    disabled={loading}
                                    className={`w-full flex justify-center items-center space-x-2 px-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r ${report.gradient} shadow-md ${report.shadowColor} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                >
                                    {activeExport === report.id ? (
                                        <>
                                            <ArrowPathIcon className="h-4.5 w-4.5 animate-spin" />
                                            <span>Export en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <DocumentArrowDownIcon className="h-4.5 w-4.5" />
                                            <span>Télécharger le rapport (.xlsx)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
