import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
export default function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        marginLeft: '220px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Header />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: '#f8f9fa',
          padding: '24px 32px',
          minHeight: 'calc(100vh - 64px)',
          width: '100%'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
