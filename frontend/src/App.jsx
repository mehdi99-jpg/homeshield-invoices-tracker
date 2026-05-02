import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ClientsList from './pages/clients/ClientsList'
import ClientForm from './pages/clients/ClientForm'
import ClientDetail from './pages/clients/ClientDetail'
import FacturesList from './pages/factures/FacturesList'
import FactureDetail from './pages/factures/FactureDetail'
import FactureForm from './pages/factures/FactureForm'
import BonsList from './pages/bonsLivraison/BonsList'
import BonDetail from './pages/bonsLivraison/BonDetail'
import BonPrint from './pages/bonsLivraison/BonPrint'
import Statistiques from './pages/Statistiques'
import Exports from './pages/Exports'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="text-6xl font-bold text-gray-200 mb-4">404</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page introuvable</h1>
      <p className="text-sm text-gray-500 mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <a href="/" className="bg-[#1B5E3B] hover:bg-[#154d30] text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors">
        Retour au tableau de bord
      </a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/clients" element={<ClientsList />} />
        <Route path="/clients/nouveau" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/clients/:id/modifier" element={<ClientForm />} />

        <Route path="/factures" element={<FacturesList />} />
        <Route path="/factures/nouvelle" element={<FactureForm />} />
        <Route path="/factures/:id" element={<FactureDetail />} />
        <Route path="/factures/:id/modifier" element={<FactureForm />} />

        <Route path="/bons-de-livraison" element={<BonsList />} />
        <Route path="/bons-de-livraison/:id" element={<BonDetail />} />
        <Route path="/bons-de-livraison/:id/imprimer" element={<BonPrint />} />

        <Route path="/statistiques" element={<Statistiques />} />
        <Route path="/exports" element={<Exports />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
