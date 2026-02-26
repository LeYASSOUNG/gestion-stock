'use client'
import React, { useState } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

/**
 * Page des rapports et exports Next.js.
 */
export default function ReportsPage() {
    const [loading, setLoading] = useState(false)

    const exportProducts = async () => {
        setLoading(true)
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
        }
    }

    const exportStock = async () => {
        setLoading(true)
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
        }
    }

    const reports = [
        {
            title: 'Liste des produits',
            description: 'Exportez la liste complète des produits avec leurs détails',
            action: exportProducts,
            icon: DocumentArrowDownIcon
        },
        {
            title: 'État des stocks',
            description: 'Exportez l\'état actuel des stocks par entrepôt',
            action: exportStock,
            icon: DocumentArrowDownIcon
        }
    ]

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Rapports</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {reports.map((report, index) => (
                    <div
                        key={index}
                        className="bg-white overflow-hidden shadow rounded-lg"
                    >
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <report.icon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {report.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={report.action}
                                    disabled={loading}
                                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Export en cours...' : 'Exporter'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
