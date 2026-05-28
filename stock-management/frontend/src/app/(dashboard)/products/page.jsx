'use client'
import * as React from 'react'
import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import {
    CubeIcon,
    TagIcon,
    TruckIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

/**
 * Page de gestion des produits Next.js (Version Premium WOW Factor).
 */
export default function ProductsPage() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [stocks, setStocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [selectedProductBreakdown, setSelectedProductBreakdown] = useState(null)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedSupplier, setSelectedSupplier] = useState('')
    const [selectedStockStatus, setSelectedStockStatus] = useState('ALL') // 'ALL', 'NORMAL', 'LOW', 'OUT'
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 8

    useEffect(() => {
        setCurrentPage(0)
    }, [searchTerm, selectedCategory, selectedSupplier, selectedStockStatus])

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        price: '',
        unit: 'pièce',
        minStockAlert: 10,
        maxStockAlert: 1000,
        categoryId: '',
        supplierId: ''
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const [productsRes, categoriesRes, suppliersRes, stocksRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories'),
                api.get('/suppliers'),
                api.get('/stocks')
            ])
            setProducts(productsRes.data)
            setCategories(categoriesRes.data)
            setSuppliers(suppliersRes.data)
            setStocks(stocksRes.data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement des données')
        } finally {
            setLoading(false)
        }
    }

    const getProductTotalStock = (productId) => {
        return stocks
            .filter(s => s.product && s.product.id === productId)
            .reduce((sum, s) => sum + (s.quantity || 0), 0)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const productData = {
            ...formData,
            category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
            supplier: formData.supplierId ? { id: parseInt(formData.supplierId) } : null
        }

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, productData)
                toast.success('Produit modifié avec succès')
            } else {
                await api.post('/products', productData)
                toast.success('Produit créé avec succès')
            }
            setShowModal(false)
            resetForm()
            fetchProducts()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            try {
                await api.delete(`/products/${id}`)
                toast.success('Produit supprimé avec succès')
                fetchProducts()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    const resetForm = () => {
        setFormData({
            sku: '',
            name: '',
            description: '',
            price: '',
            unit: 'pièce',
            minStockAlert: 10,
            maxStockAlert: 1000,
            categoryId: '',
            supplierId: ''
        })
        setEditingProduct(null)
    }

    // Apply filters
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              product.sku.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = selectedCategory === '' || 
                                (product.category && product.category.id === parseInt(selectedCategory))

        const matchesSupplier = selectedSupplier === '' || 
                                (product.supplier && product.supplier.id === parseInt(selectedSupplier))

        const totalStock = getProductTotalStock(product.id)
        const isLow = totalStock <= product.minStockAlert && totalStock > 0
        const isOut = totalStock === 0
        
        let matchesStockStatus = true
        if (selectedStockStatus === 'NORMAL') {
            matchesStockStatus = totalStock > product.minStockAlert
        } else if (selectedStockStatus === 'LOW') {
            matchesStockStatus = isLow
        } else if (selectedStockStatus === 'OUT') {
            matchesStockStatus = isOut
        }

        return matchesSearch && matchesCategory && matchesSupplier && matchesStockStatus
    })

    const paginatedProducts = filteredProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    const pageCount = Math.ceil(filteredProducts.length / itemsPerPage)

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="text-sm font-semibold text-slate-500">Chargement du catalogue...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalogue de Produits</h1>
                    <p className="text-sm text-slate-500 mt-1">Supervisez vos articles, niveaux d&apos;alerte et répartitions physiques</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 text-sm font-semibold flex items-center space-x-2 animate-fadeIn"
                >
                    <PlusIcon className="h-4.5 w-4.5 text-white" />
                    <span>Nouveau produit</span>
                </button>
            </div>

            {/* Filter and Search Bar Grid */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Term */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recherche</label>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catégorie</label>
                    <div className="relative">
                        <TagIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Supplier Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fournisseur</label>
                    <div className="relative">
                        <TruckIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                        >
                            <option value="">Tous les fournisseurs</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Inventory Alert Filter */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">État des stocks</label>
                    <div className="relative">
                        <AdjustmentsHorizontalIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <select
                            value={selectedStockStatus}
                            onChange={(e) => setSelectedStockStatus(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                        >
                            <option value="ALL">Tous les niveaux de stock</option>
                            <option value="NORMAL">Stock OK</option>
                            <option value="LOW">Stock Bas (Alerte)</option>
                            <option value="OUT">Rupture Critique</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Catalog List Table */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm overflow-hidden rounded-2xl border border-slate-100/80">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/60">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Actuel</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Seuil Alerte</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
                            const totalQty = getProductTotalStock(product.id)
                            const isOutOfStock = totalQty === 0
                            const isLowStock = totalQty <= product.minStockAlert && totalQty > 0

                            return (
                                <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-indigo-600">{product.sku}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                                <CubeIcon className="h-4 w-4" />
                                            </div>
                                            <span>{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{product.price} €</td>
                                    {/* Stock Actuel clickable indicator */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => setSelectedProductBreakdown(product)}
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border hover:scale-[1.02] active:scale-[0.98] transition-all ${
                                                isOutOfStock ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                isLowStock ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            }`}
                                            title="Cliquez pour voir la répartition"
                                        >
                                            {totalQty} {product.unit}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {product.category?.name ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                                {product.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {product.supplier?.name || <span className="text-slate-300 italic">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-600">
                                        {product.minStockAlert} pcs
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product)
                                                setFormData({
                                                    ...product,
                                                    categoryId: product.category?.id || '',
                                                    supplierId: product.supplier?.id || ''
                                                })
                                                setShowModal(true)
                                            }}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 transition-all"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-all"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                                    Aucun produit ne correspond aux filtres sélectionnés.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {pageCount > 1 && (
                    <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-bold">
                            Affichage de {currentPage * itemsPerPage + 1} à {Math.min((currentPage + 1) * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length} produits
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Précédent
                            </button>
                            {Array.from({ length: pageCount }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === i
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(pageCount - 1, prev + 1))}
                                disabled={currentPage === pageCount - 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-over Detailed Stock Allocation Drawer */}
            {selectedProductBreakdown && (
                <div className="fixed inset-0 overflow-hidden z-50">
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Background Overlay */}
                        <div 
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300"
                            onClick={() => setSelectedProductBreakdown(null)}
                        />
                        <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                            <div className="w-screen max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-100 flex flex-col animate-slideLeft">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">{selectedProductBreakdown.name}</h2>
                                        <p className="text-xs font-semibold text-indigo-600 mt-1">SKU: {selectedProductBreakdown.sku}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedProductBreakdown(null)}
                                        className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                    {/* KPI Card */}
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs font-semibold">
                                        <div>
                                            <span className="text-slate-400 block mb-1">PRIX DE VENTE</span>
                                            <span className="text-sm font-extrabold text-slate-800 block">{selectedProductBreakdown.price} €</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block mb-1">SEUIL ALERTE</span>
                                            <span className="text-sm font-extrabold text-amber-600 block flex items-center space-x-1">
                                                <ExclamationTriangleIcon className="h-4 w-4" />
                                                <span>{selectedProductBreakdown.minStockAlert} {selectedProductBreakdown.unit}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Physical Allocations */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Répartition par entrepôt</h3>
                                        <div className="space-y-3">
                                            {stocks.filter(s => s.product && s.product.id === selectedProductBreakdown.id).length > 0 ? (
                                                stocks
                                                    .filter(s => s.product && s.product.id === selectedProductBreakdown.id)
                                                    .map((allocation) => (
                                                        <div key={allocation.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                                                            <div>
                                                                <span className="text-sm font-extrabold text-slate-800 block">{allocation.warehouse?.name}</span>
                                                                <span className="text-[10px] text-slate-400 mt-1.5 block font-semibold">
                                                                    📍 {allocation.warehouse?.location || 'Sans localisation'} • Emplacement: <span className="text-indigo-600 font-extrabold">{allocation.location || 'Non spécifié'}</span>
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-extrabold text-slate-800 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                                                                {allocation.quantity} {selectedProductBreakdown.unit}
                                                            </span>
                                                        </div>
                                                    ))
                                            ) : (
                                                <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center text-xs text-slate-400 font-semibold">
                                                    📦 Ce produit n&apos;est stocké dans aucun entrepôt pour le moment.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Form */}
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
                    <div className="relative mx-auto p-6 border border-white/20 w-full max-w-lg shadow-2xl rounded-3xl bg-white/95 backdrop-blur-xl animate-fadeIn">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
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
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">SKU</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: PRD-01"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom du produit</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Disque Dur 1To"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    placeholder="Description et caractéristiques du produit..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prix de vente (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unité de mesure</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                    >
                                        <option value="pièce">Pièce</option>
                                        <option value="kg">Kilogramme</option>
                                        <option value="litre">Litre</option>
                                        <option value="mètre">Mètre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alerte Stock Min</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.minStockAlert}
                                        onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seuil Stock Max</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.maxStockAlert}
                                        onChange={(e) => setFormData({ ...formData, maxStockAlert: parseInt(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catégorie</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fournisseur</label>
                                    <select
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white cursor-pointer"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
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
                                    {editingProduct ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
