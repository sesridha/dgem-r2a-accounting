import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Scale,
  Layers,
  Grid3x3,
  FileText,
  LogOut,
  Loader2,
  ChevronDown,
  Mail,
  Paperclip,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAppStore } from '@/store'

interface SubSubNavItem {
  icon: React.ReactNode
  label: string
  path: string
}

interface SubNavItem {
  icon: React.ReactNode
  label: string
  path?: string
  children?: SubSubNavItem[]
}

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  children?: SubNavItem[]
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    const defaults = ['Journal Entry']
    if (location.pathname.startsWith('/journal-entry/external-jes/')) {
      defaults.push('AD-HOC JEs')
    }
    return defaults
  })

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    )
  }

  const navItems: NavItem[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Journal Entry',
      path: '/journal-entry',
      children: [
        { icon: <BookOpen className="w-4 h-4" />, label: 'Standard JEs', path: '/journal-entry' },
        {
          icon: <Mail className="w-4 h-4" />,
          label: 'AD-HOC JEs',
          children: [
            { icon: <Mail className="w-3.5 h-3.5" />, label: 'JE as Email Content', path: '/journal-entry/external-jes/email-body' },
            { icon: <Paperclip className="w-3.5 h-3.5" />, label: 'JE as Email Attachment', path: '/journal-entry/external-jes/email-attachment' },
          ],
        },
      ],
    },
    { icon: <Scale className="w-5 h-5" />, label: 'Trial Balance', path: '/trial-balance' },
    { icon: <Layers className="w-5 h-5" />, label: 'IC Item Solver', path: '/ic-item-solver' },
    { icon: <Grid3x3 className="w-5 h-5" />, label: 'Balance Sheet Item Solver', path: '/balance-sheet-solver' },
    { icon: <FileText className="w-5 h-5" />, label: 'Report Preparer', path: '/report-preparer' },
  ]

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    logout()
    navigate('/login')
  }

  const displayName = user?.name || 'Account User'
  const initials = displayName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AU'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-white">
          <img src="/cg.png" alt="Capgemini" className="h-7 w-7 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Capgemini</span>
          <span className="text-xs font-medium tracking-wider" style={{ color: 'var(--color-primary)' }}>R2A AGENTIC AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => {
            const hasChildren = !!(item.children && item.children.length > 0)
            const isExpanded = expandedMenus.includes(item.label)

            if (hasChildren) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      'flex items-center w-full gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      'hover:bg-muted',
                    )}
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')} />
                  </button>
                  {isExpanded && (
                    <ul className="ml-4 mt-1 space-y-1" style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '12px' }}>
                      {item.children!.map((child) => {
                        const hasSubChildren = !!(child.children && child.children.length > 0)
                        const isSubExpanded = expandedMenus.includes(child.label)

                        if (hasSubChildren) {
                          return (
                            <li key={child.label}>
                              <button
                                type="button"
                                onClick={() => toggleMenu(child.label)}
                                className="flex items-center w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                style={{ color: 'var(--color-muted-foreground)' }}
                              >
                                {child.icon}
                                <span className="flex-1 text-left">{child.label}</span>
                                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isSubExpanded && 'rotate-180')} />
                              </button>
                              {isSubExpanded && (
                                <ul className="ml-4 mt-0.5 space-y-0.5" style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '12px' }}>
                                  {child.children!.map((sub) => (
                                    <li key={sub.path}>
                                      <NavLink
                                        to={sub.path}
                                        className={({ isActive }) =>
                                          cn(
                                            'dgem-sidebar-link rounded-lg text-xs',
                                            isActive && 'dgem-sidebar-link-active',
                                          )
                                        }
                                      >
                                        {sub.icon}
                                        <span>{sub.label}</span>
                                      </NavLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          )
                        }

                        return (
                          <li key={child.path}>
                            <NavLink
                              to={child.path!}
                              end
                              className={({ isActive }) =>
                                cn('dgem-sidebar-link rounded-lg text-sm', isActive && 'dgem-sidebar-link-active')
                              }
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    cn('dgem-sidebar-link rounded-lg text-sm font-medium', isActive && 'dgem-sidebar-link-active')
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer – user avatar + logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--dgem-blue)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>{displayName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>Senior Accountant</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="dgem-btn dgem-btn--icon dgem-btn--ghost dgem-btn-sm"
            aria-label="Logout"
          >
            {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}