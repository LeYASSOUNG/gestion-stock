import axios from 'axios'

// Configuration de base d'Axios pour les appels API vers le backend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 Unauthorized: Session expirée ou invalide
      // On ne redirige pas brutalement ici pour laisser le AuthContext gérer l'état
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // On peut éventuellement émettre un événement ou laisser les composants réagir à l'absence de token
    } else if (error.response?.status === 403) {
      // 403 Forbidden: L'utilisateur est connecté mais n'a pas les droits pour cette action
      // On ne déconnecte PAS l'utilisateur
      console.warn('Accès interdit (403)')
    }
    return Promise.reject(error)
  }
)

export default api
