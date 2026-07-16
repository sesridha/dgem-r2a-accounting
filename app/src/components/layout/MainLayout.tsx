import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

/**
 * Main Layout – wraps all protected pages.
 * Sidebar (fixed, 240 px) + scrollable content area.
 */
export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside className="dgem-sidebar" style={{ width: '240px', flexShrink: 0 }}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}