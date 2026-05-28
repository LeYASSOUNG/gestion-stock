'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { 
    TruckIcon, 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    XMarkIcon 
} from '@heroicons/react/24/outline'

/**
 * Page de gestion des fournisseurs Next.js (Version Premium WOW Factor).
 */
export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        active: true
    })

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers')
            setSuppliers(response.data)
        } catch (error) {
            console.error('Erreur fetchSuppliers:', error)
            if (!error.response) {
                toast.error('Impossible de joindre le serveur. Vérifiez que le backend est démarré.')
            } else if (error.response.status === 401 || error.response.status === 403) {
                toast.error('Session expirée ou accès refusé. Veuillez vous reconnecter.')
            } else {
                toast.error(`Erreur lors du chargement des fournisseurs (${error.response.status})`)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}`, formData)
                toast.success('Fournisseur modifié avec succès')
            } else {
                await api.post('/suppliers', formData)
                toast.success('Fournisseur créé avec succès')
            }
            setShowModal(false)
            resetForm()
            fetchSuppliers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            try {
                await api.delete(`/suppliers/${id}`)
                toast.success('Fournisseur supprimé avec succès')
                fetchSuppliers()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            taxId: '',
            active: true
        })
        setEditingSupplier(null)
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-slate-500">Chargement des fournisseurs...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fournisseurs de Marchandises</h1>
                    <p className="text-sm text-slate-500 mt-1">Supervisez et gérez vos relations fournisseurs ainsi que leurs coordonnées</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 text-sm font-semibold flex items-center space-x-2"
                >
                    <PlusIcon className="h-4.5 w-4.5 text-white" />
                    <span>Nouveau fournisseur</span>
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm overflow-hidden rounded-2xl border border-slate-100/80">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/60">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Téléphone
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                État
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <TruckIcon className="h-4 w-4" />
                                            </div>
                                            <span>{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        <div className="flex items-center space-x-1.5">
                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                            <span>{supplier.contactPerson || <span className="text-slate-300 italic">Non spécifié</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center space-x-1.5">
                                            <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                                            <span>{supplier.email || <span className="text-slate-300 italic">Non spécifié</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center space-x-1.5">
                                            <PhoneIcon className="h-4 w-4 text-slate-400" />
                                            <span>{supplier.phone || <span className="text-slate-300 italic">Non spécifié</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            supplier.active 
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        }`}>
                                            {supplier.active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingSupplier(supplier)
                                                setFormData(supplier)
                                                setShowModal(true)
                                            }}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 transition-all"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
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
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucun fournisseur enregistré pour le moment.
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
                                {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
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
                                    Nom de l&apos;entreprise
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Fournisseur SARL"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Interlocuteur principal
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Jean Dupont"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        N° SIRET / TVA
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: FR12345678900"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Adresse email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="contact@fournisseur.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="01 02 03 04 05"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Adresse physique
                                </label>
                                <textarea
                                    placeholder="Adresse complète de l'entreprise..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center pt-1">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded-lg cursor-pointer"
                                />
                                <label htmlFor="active" className="ml-2.5 block text-sm font-semibold text-slate-700 select-none cursor-pointer">
                                    Fournisseur actif
                                </label>
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
                                    {editingSupplier ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
