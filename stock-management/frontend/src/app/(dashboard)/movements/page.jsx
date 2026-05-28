'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { 
    ArrowPathIcon,
    CalendarDaysIcon,
    ArrowRightIcon,
    DocumentTextIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * Page de gestion des mouvements de stock Next.js (Version Premium WOW Factor).
 */
export default function MovementsPage() {
    const [movements, setMovements] = useState([])
    const [products, setProducts] = useState([])
    const [warehouses, setWarehouses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [movementType, setMovementType] = useState('ENTRY')
    const [formData, setFormData] = useState({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: '',
        reference: '',
        notes: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [movementsRes, productsRes, warehousesRes] = await Promise.all([
                api.get('/movements'),
                api.get('/products'),
                api.get('/warehouses')
            ])
            setMovements(movementsRes.data)
            setProducts(productsRes.data)
            setWarehouses(warehousesRes.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des données')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const movementData = {
            product: { id: parseInt(formData.productId) },
            quantity: parseInt(formData.quantity),
            reference: formData.reference,
            notes: formData.notes,
            type: movementType
        }

        if (movementType === 'ENTRY') {
            movementData.toWarehouse = { id: parseInt(formData.toWarehouseId) }
        } else if (movementType === 'EXIT') {
            movementData.fromWarehouse = { id: parseInt(formData.fromWarehouseId) }
        } else if (movementType === 'TRANSFER') {
            movementData.fromWarehouse = { id: parseInt(formData.fromWarehouseId) }
            movementData.toWarehouse = { id: parseInt(formData.toWarehouseId) }
        } else if (movementType === 'ADJUSTMENT') {
            movementData.toWarehouse = { id: parseInt(formData.toWarehouseId) }
        }

        try {
            let endpoint = '/movements/'
            switch (movementType) {
                case 'ENTRY':
                    endpoint += 'entry'
                    break
                case 'EXIT':
                    endpoint += 'exit'
                    break
                case 'TRANSFER':
                    endpoint += 'transfer'
                    break
                case 'ADJUSTMENT':
                    endpoint += 'adjustment'
                    break
            }

            await api.post(endpoint, movementData)
            toast.success('Mouvement enregistré avec succès')
            setShowModal(false)
            resetForm()
            fetchData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
        }
    }

    const resetForm = () => {
        setFormData({
            productId: '',
            fromWarehouseId: '',
            toWarehouseId: '',
            quantity: '',
            reference: '',
            notes: ''
        })
    }

    const getTypeLabel = (type) => {
        const labels = {
            'ENTRY': 'Entrée',
            'EXIT': 'Sortie',
            'TRANSFER': 'Transfert',
            'ADJUSTMENT': 'Ajustement'
        }
        return labels[type] || type
    }

    const getTypeColor = (type) => {
        const colors = {
            'ENTRY': 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
            'EXIT': 'text-rose-600 bg-rose-500/10 border-rose-500/20',
            'TRANSFER': 'text-blue-600 bg-blue-500/10 border-blue-500/20',
            'ADJUSTMENT': 'text-amber-600 bg-amber-500/10 border-amber-500/20'
        }
        return colors[type] || 'text-slate-600 bg-slate-100 border-slate-200'
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-slate-500">Chargement des mouvements...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mouvements de Stock</h1>
                    <p className="text-sm text-slate-500 mt-1">Consultez l&apos;historique complet et effectuez de nouvelles opérations d&apos;inventaire</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 text-sm font-semibold flex items-center space-x-2"
                >
                    <PlusIcon className="h-4.5 w-4.5 text-white" />
                    <span>Nouveau mouvement</span>
                </button>
            </div>

            {/* Premium Filter Tab Bar */}
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 shadow-sm inline-flex flex-wrap gap-1.5">
                <button
                    onClick={() => setMovementType('ENTRY')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        movementType === 'ENTRY' 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    Entrées
                </button>
                <button
                    onClick={() => setMovementType('EXIT')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        movementType === 'EXIT' 
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    Sorties
                </button>
                <button
                    onClick={() => setMovementType('TRANSFER')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        movementType === 'TRANSFER' 
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    Transferts
                </button>
                <button
                    onClick={() => setMovementType('ADJUSTMENT')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        movementType === 'ADJUSTMENT' 
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                            : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    Ajustements
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm overflow-hidden rounded-2xl border border-slate-100/80 animate-fadeIn">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/60">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Produit
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Source (De)
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Destination (Vers)
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Quantité
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Référence
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {movements.length > 0 ? (
                            movements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                                        <div className="flex items-center space-x-1.5">
                                            <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                                            <span>{new Date(movement.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTypeColor(movement.type)}`}>
                                            {getTypeLabel(movement.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                        {movement.product?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        {movement.fromWarehouse?.name || <span className="text-slate-300 italic">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        {movement.toWarehouse?.name || <span className="text-slate-300 italic">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-800">
                                        {movement.quantity} {movement.product?.unit || 'pcs'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">
                                        {movement.reference || <span className="text-slate-300 italic">-</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucun mouvement de stock enregistré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Dialog */}
            {showModal && (
                <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
                        onClick={() => {
                            setShowModal(false)
                            resetForm()
                        }}
                    />
                    
                    {/* Content Card */}
                    <div className="relative mx-auto p-6 border border-white/20 w-full max-w-md shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl animate-fadeIn">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900">
                                Nouveau mouvement ({getTypeLabel(movementType)})
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    resetForm()
                                }}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Produit concerné
                                </label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dynamically Styled Fields based on movementType */}
                            <div className="grid grid-cols-2 gap-4">
                                {(movementType === 'EXIT' || movementType === 'TRANSFER') && (
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            Entrepôt source (De)
                                        </label>
                                        <select
                                            required
                                            value={formData.fromWarehouseId}
                                            onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {warehouses.map((warehouse) => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {(movementType === 'ENTRY' || movementType === 'TRANSFER' || movementType === 'ADJUSTMENT') && (
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                            Entrepôt cible (Vers)
                                        </label>
                                        <select
                                            required
                                            value={formData.toWarehouseId}
                                            onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {warehouses.map((warehouse) => (
                                                <option key={warehouse.id} value={warehouse.id}>
                                                    {warehouse.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className={movementType === 'TRANSFER' ? 'col-span-2' : 'col-span-2'}>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Quantité à déplacer
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="Ex: 50"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Référence externe (optionnelle)
                                </label>
                                <div className="relative">
                                    <DocumentTextIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ex: Facture #F-10293, Bon..."
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Notes / Observations (optionnelles)
                                </label>
                                <textarea
                                    placeholder="Motifs de l'ajustement ou détails..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    rows={2}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        resetForm()
                                    }}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/10"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
