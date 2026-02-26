'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'

/**
 * Page de gestion des mouvements de stock Next.js.
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
            'ENTRY': 'text-green-600 bg-green-100',
            'EXIT': 'text-red-600 bg-red-100',
            'TRANSFER': 'text-blue-600 bg-blue-100',
            'ADJUSTMENT': 'text-yellow-600 bg-yellow-100'
        }
        return colors[type] || 'text-gray-600 bg-gray-100'
    }

    if (loading) {
        return <div className="flex justify-center">Chargement...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Mouvements de stock</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Nouveau mouvement
                </button>
            </div>

            <div className="mb-4">
                <div className="flex space-x-2">
                    {['ENTRY', 'EXIT', 'TRANSFER', 'ADJUSTMENT'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMovementType(type)}
                            className={`px-4 py-2 rounded-lg ${movementType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {getTypeLabel(type)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                De
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vers
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Référence
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map((movement) => (
                            <tr key={movement.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(movement.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(movement.type)}`}>
                                        {getTypeLabel(movement.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {movement.product?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.fromWarehouse?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.toWarehouse?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {movement.reference || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                            Nouveau mouvement ({getTypeLabel(movementType)})
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Produit
                                </label>
                                <select
                                    required
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(movementType === 'EXIT' || movementType === 'TRANSFER') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Entrepôt source
                                    </label>
                                    <select
                                        required
                                        value={formData.fromWarehouseId}
                                        onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Sélectionner un entrepôt</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(movementType === 'ENTRY' || movementType === 'TRANSFER' || movementType === 'ADJUSTMENT') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Entrepôt destination
                                    </label>
                                    <select
                                        required
                                        value={formData.toWarehouseId}
                                        onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">Sélectionner un entrepôt</option>
                                        {warehouses.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantité
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Référence (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.reference}
                                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="N° commande, facture..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (optionnel)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows="2"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
