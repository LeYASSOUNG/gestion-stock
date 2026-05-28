'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { 
    BuildingOfficeIcon, 
    MapPinIcon, 
    UserIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    XMarkIcon 
} from '@heroicons/react/24/outline'

/**
 * Page de gestion des entrepôts Next.js (Version Premium WOW Factor).
 */
export default function WarehousesPage() {
    const [warehouses, setWarehouses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingWarehouse, setEditingWarehouse] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        location: '',
        address: '',
        manager: ''
    })

    useEffect(() => {
        fetchWarehouses()
    }, [])

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/warehouses')
            setWarehouses(response.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des entrepôts')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingWarehouse) {
                await api.put(`/warehouses/${editingWarehouse.id}`, formData)
                toast.success('Entrepôt modifié avec succès')
            } else {
                await api.post('/warehouses', formData)
                toast.success('Entrepôt créé avec succès')
            }
            setShowModal(false)
            resetForm()
            fetchWarehouses()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
            try {
                await api.delete(`/warehouses/${id}`)
                toast.success('Entrepôt supprimé avec succès')
                fetchWarehouses()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            location: '',
            address: '',
            manager: ''
        })
        setEditingWarehouse(null)
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-slate-500">Chargement des entrepôts...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Entrepôts</h1>
                    <p className="text-sm text-slate-500 mt-1">Configurez vos sites de stockage physiques et leurs responsables</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 text-sm font-semibold flex items-center space-x-2"
                >
                    <PlusIcon className="h-4.5 w-4.5 text-white" />
                    <span>Nouvel entrepôt</span>
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm overflow-hidden rounded-2xl border border-slate-100/80">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/60">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Localisation
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Responsable
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {warehouses.length > 0 ? (
                            warehouses.map((warehouse) => (
                                <tr key={warehouse.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-indigo-600">
                                        {warehouse.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <BuildingOfficeIcon className="h-4 w-4" />
                                            </div>
                                            <span>{warehouse.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center space-x-1.5">
                                            <MapPinIcon className="h-4 w-4 text-slate-400" />
                                            <span>{warehouse.location || <span className="text-slate-300 italic">Non spécifié</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <div className="flex items-center space-x-1.5">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase">
                                                {warehouse.manager?.[0] || 'R'}
                                            </div>
                                            <span className="font-semibold">{warehouse.manager || <span className="text-slate-300 italic">Aucun</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingWarehouse(warehouse)
                                                setFormData(warehouse)
                                                setShowModal(true)
                                            }}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 transition-all"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(warehouse.id)}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-all"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucun entrepôt configuré pour le moment.
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
                                {editingWarehouse ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
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
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: ENT1"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Nom de l&apos;entrepôt
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Entrepôt Principal"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Localisation générale
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Paris, France"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Adresse complète
                                </label>
                                <textarea
                                    placeholder="Adresse géographique complète..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Responsable du site
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Nom du manager..."
                                        value={formData.manager}
                                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
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
                                    {editingWarehouse ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
