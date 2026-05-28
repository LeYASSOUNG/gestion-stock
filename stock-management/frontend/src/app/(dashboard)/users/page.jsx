'use client'
import React, { useState, useEffect } from 'react'
import api from '../../../services/api'
import { toast } from 'react-hot-toast'
import {
    UserIcon,
    UserPlusIcon,
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    KeyIcon,
    EnvelopeIcon,
    ArrowPathIcon,
    UsersIcon,
    UserGroupIcon,
    XCircleIcon,
    CheckBadgeIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline'

/**
 * Page de gestion des utilisateurs (Admin uniquement - Version Premium WOW Factor).
 * Inclut un panneau latéral de modification dédié (slide-over).
 */
export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [savingUser, setSavingUser] = useState(false)

    // Modal/Panel state
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditPanel, setShowEditPanel] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('ALL')
    const [selectedStatus, setSelectedStatus] = useState('ALL')

    // Create form
    const [createForm, setCreateForm] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'OPERATOR',
        active: true
    })

    // Edit form (only editable fields)
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'OPERATOR',
        active: true,
        password: '' // optional
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users')
            setUsers(response.data)
        } catch (error) {
            toast.error('Erreur lors du chargement des utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    // ---- CREATE ----
    const handleCreate = async (e) => {
        e.preventDefault()
        setSavingUser(true)
        try {
            await api.post('/users', createForm)
            toast.success('Utilisateur créé avec succès')
            setShowCreateModal(false)
            resetCreateForm()
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création')
        } finally {
            setSavingUser(false)
        }
    }

    const resetCreateForm = () => {
        setCreateForm({
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'OPERATOR',
            active: true
        })
    }

    // ---- EDIT ----
    const openEditPanel = (user) => {
        setEditingUser(user)
        setEditForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            role: user.role || 'OPERATOR',
            active: user.active ?? true,
            password: ''
        })
        setShowEditPanel(true)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!editingUser) return
        setSavingUser(true)
        try {
            // Strip empty password so backend doesn't encode an empty string
            const payload = { ...editForm }
            if (!payload.password) delete payload.password

            await api.put(`/users/${editingUser.id}`, payload)
            toast.success(`Compte de ${editingUser.username} mis à jour`)
            setShowEditPanel(false)
            setEditingUser(null)
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
        } finally {
            setSavingUser(false)
        }
    }

    // ---- DELETE ----
    const handleDelete = async (id, username) => {
        if (window.confirm(`Supprimer l'utilisateur "${username}" ? Cette action est irréversible.`)) {
            try {
                await api.delete(`/users/${id}`)
                toast.success('Utilisateur supprimé')
                fetchUsers()
            } catch (error) {
                toast.error('Erreur lors de la suppression')
            }
        }
    }

    // Filter logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = selectedRole === 'ALL' || user.role === selectedRole
        let matchesStatus = true
        if (selectedStatus === 'ACTIVE') matchesStatus = user.active === true
        if (selectedStatus === 'INACTIVE') matchesStatus = user.active === false

        return matchesSearch && matchesRole && matchesStatus
    })

    // Stats
    const totalUsers = users.length
    const activeUsersCount = users.filter(u => u.active).length
    const adminCount = users.filter(u => u.role === 'ADMIN').length
    const inactiveUsersCount = totalUsers - activeUsersCount

    // Avatar color from username
    const getAvatarGradient = (username) => {
        if (!username) return 'from-slate-400 to-slate-500'
        const sum = username.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
        const gradients = [
            'from-pink-500 to-rose-500',
            'from-purple-500 to-indigo-500',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
        ]
        return gradients[sum % gradients.length]
    }

    // Role badge styling
    const getRoleBadge = (role) => {
        if (role === 'ADMIN') return 'bg-purple-50 text-purple-600 border border-purple-100'
        if (role === 'MANAGER') return 'bg-blue-50 text-blue-600 border border-blue-100'
        return 'bg-teal-50 text-teal-600 border border-teal-100'
    }

    // Input style shared
    const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-100/60 disabled:text-slate-400"
    const labelCls = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <ArrowPathIcon className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Chargement des utilisateurs...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header & Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-sm text-slate-500 mt-1">Gérez les comptes, les rôles et les accès de vos collaborateurs</p>
                </div>
                <button
                    onClick={() => { resetCreateForm(); setShowCreateModal(true) }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-sm"
                >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Nouvel utilisateur</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Utilisateurs', value: totalUsers, icon: UsersIcon, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Administrateurs', value: adminCount, icon: ShieldCheckIcon, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Membres Actifs', value: activeUsersCount, icon: UserGroupIcon, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Comptes Inactifs', value: inactiveUsersCount, icon: XCircleIcon, color: 'bg-rose-50 text-rose-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/80 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center space-x-4">
                        <div className={`p-3.5 rounded-2xl ${color}`}><Icon className="h-6 w-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-400">{label}</p>
                            <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/80 p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par pseudo, nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="ALL">Tous les rôles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="OPERATOR">OPERATOR</option>
                    </select>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="ALL">Tous les statuts</option>
                        <option value="ACTIVE">Actif</option>
                        <option value="INACTIVE">Inactif</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/70">
                            <tr>
                                {['Utilisateur', 'Nom complet', 'Email', 'Rôle', 'Statut', 'Actions'].map((h, i) => (
                                    <th key={h} scope="col" className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/40 transition-colors duration-150 group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3.5">
                                            <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(user.username)} flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                                                {(user.username || '?').substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="flex items-center space-x-1.5">
                                            <EnvelopeIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span>{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${user.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${user.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            <span>{user.active ? 'Actif' : 'Inactif'}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditPanel(user)}
                                                title="Modifier"
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-100 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 shadow-sm transition-all duration-200"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.username)}
                                                title="Supprimer"
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-600 text-rose-400 shadow-sm transition-all duration-200"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400 font-medium">
                                        Aucun utilisateur trouvé correspondant à vos critères
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== CREATE MODAL ========== */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Créer un utilisateur</h3>
                            <p className="text-sm text-slate-500 mt-1">Ajoutez un nouveau collaborateur au système.</p>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Prénom</label>
                                    <input type="text" required value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} placeholder="Jean" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Nom</label>
                                    <input type="text" required value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} placeholder="Dupont" className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Nom d&apos;utilisateur</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                    <input type="text" required value={createForm.username} onChange={e => setCreateForm({...createForm, username: e.target.value})} placeholder="jean.dupont" className={`${inputCls} pl-11`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Email</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                    <input type="email" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} placeholder="jean.dupont@company.com" className={`${inputCls} pl-11`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Mot de passe</label>
                                <div className="relative">
                                    <KeyIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                    <input type="password" required value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} placeholder="••••••••" className={`${inputCls} pl-11`} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Rôle</label>
                                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className={inputCls}>
                                    <option value="OPERATOR">OPERATOR – Opérateur</option>
                                    <option value="MANAGER">MANAGER – Gestionnaire</option>
                                    <option value="ADMIN">ADMIN – Administrateur</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="block text-sm font-semibold text-slate-800">Compte actif</span>
                                    <span className="block text-xs text-slate-400">Autorise les connexions à l&apos;application</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={createForm.active} onChange={e => setCreateForm({...createForm, active: e.target.checked})} />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={savingUser} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/10 hover:shadow-lg transition-all disabled:opacity-60">
                                    {savingUser ? 'Création...' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== EDIT SLIDE-OVER PANEL ========== */}
            {showEditPanel && editingUser && (
                <div className="fixed inset-0 z-50 flex" aria-modal="true">
                    {/* Overlay */}
                    <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditPanel(false)} />

                    {/* Slide-over panel */}
                    <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(editingUser.username)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                    {editingUser.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Modifier le compte</h3>
                                    <p className="text-xs text-slate-400 font-medium">@{editingUser.username}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditPanel(false)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User info badge */}
                        <div className="mx-6 mt-5 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                            <CheckBadgeIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                            <p className="text-xs text-indigo-700 font-medium">
                                Le nom d&apos;utilisateur <strong className="font-bold">@{editingUser.username}</strong> ne peut pas être modifié (identifiant unique).
                            </p>
                        </div>

                        {/* Edit Form */}
                        <form onSubmit={handleUpdate} className="flex-1 p-6 space-y-5">
                            {/* Identité */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Identité</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Prénom</label>
                                        <input type="text" required value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className={inputCls} placeholder="Jean" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Nom</label>
                                        <input type="text" required value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className={inputCls} placeholder="Dupont" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Contact</p>
                                <div>
                                    <label className={labelCls}>Email</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                        <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className={`${inputCls} pl-11`} placeholder="email@company.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Accès & Rôle */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Accès & Rôle</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelCls}>Rôle</label>
                                        <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className={inputCls}>
                                            <option value="OPERATOR">OPERATOR – Opérateur</option>
                                            <option value="MANAGER">MANAGER – Gestionnaire</option>
                                            <option value="ADMIN">ADMIN – Administrateur</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                            <span className={`block text-sm font-semibold ${editForm.active ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                {editForm.active ? '✓ Compte actif' : '✗ Compte inactif'}
                                            </span>
                                            <span className="block text-xs text-slate-400">
                                                {editForm.active ? 'L\'utilisateur peut se connecter' : 'Connexion bloquée'}
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Sécurité */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">Sécurité</p>
                                <div>
                                    <label className={labelCls}>
                                        Nouveau mot de passe
                                        <span className="ml-2 text-[10px] text-indigo-500 font-medium normal-case tracking-normal">(laisser vide pour ne pas changer)</span>
                                    </label>
                                    <div className="relative">
                                        <LockClosedIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                                            placeholder="••••••••"
                                            className={`${inputCls} pl-11`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                                <button type="button" onClick={() => setShowEditPanel(false)} className="px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={savingUser} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
                                    {savingUser ? (
                                        <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Sauvegarde...</>
                                    ) : (
                                        <><CheckBadgeIcon className="h-4 w-4" /> Enregistrer</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
