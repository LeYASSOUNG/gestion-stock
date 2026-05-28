'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import { TagIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

/**
 * Page de gestion des catégories Next.js (Version Premium WOW Factor).
 */
export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parentId: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories')
            setCategories(response.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des catégories')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const data = {
            name: formData.name,
            description: formData.description,
            parent: formData.parentId ? { id: parseInt(formData.parentId) } : null
        }

        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, data)
                toast.success('Catégorie modifiée avec succès')
            } else {
                await api.post('/categories', data)
                toast.success('Catégorie créée avec succès')
            }
            setShowModal(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            try {
                await api.delete(`/categories/${id}`)
                toast.success('Catégorie supprimée avec succès')
                fetchCategories()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            parentId: ''
        })
        setEditingCategory(null)
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-slate-500">Chargement des catégories...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catégories de Produits</h1>
                    <p className="text-sm text-slate-500 mt-1">Organisez vos produits par familles et gérez leur hiérarchie</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 text-sm font-semibold flex items-center space-x-2"
                >
                    <PlusIcon className="h-4.5 w-4.5 text-white" />
                    <span>Nouvelle catégorie</span>
                </button>
            </div>

            {/* Table Card Wrapper */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm overflow-hidden rounded-2xl border border-slate-100/80">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/60">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Parent
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <TagIcon className="h-4 w-4" />
                                            </div>
                                            <span>{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                        {category.description || <span className="text-slate-300 italic">Aucune description</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {category.parent?.name ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                                {category.parent.name}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                                Racine
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(category)
                                                setFormData({
                                                    name: category.name,
                                                    description: category.description || '',
                                                    parentId: category.parent?.id || ''
                                                })
                                                setShowModal(true)
                                            }}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 transition-all"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
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
                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucune catégorie enregistrée pour le moment.
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
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                                    Nom de la catégorie
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Électronique, Alimentation..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    placeholder="Description détaillée de la catégorie..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Catégorie parente
                                </label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                >
                                    <option value="">Aucune (Catégorie Racine)</option>
                                    {categories
                                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                </select>
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
                                    {editingCategory ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
