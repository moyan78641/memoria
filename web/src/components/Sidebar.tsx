import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconLayoutDashboard,
  IconHeart,
  IconCalendar,
  IconBell,
  IconChartBar,
  IconSettings,
  IconMenu2,
  IconX,
  IconChevronsLeft,
  IconChevronsRight,
} from '@tabler/icons-react'
import { cn } from '../lib/utils'

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: IconLayoutDashboard },
  { path: '/memorials', label: '纪念日管理', icon: IconHeart },
  { path: '/calendar', label: '日历视图', icon: IconCalendar },
  { path: '/notifications', label: '推送通知', icon: IconBell },
  { path: '/statistics', label: '数据统计', icon: IconChartBar },
  { path: '/settings', label: '系统设置', icon: IconSettings },
]

export function Sidebar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const siteName = localStorage.getItem('site_name') || 'MemorialHub'

  const navContent = (
    <>
      <div className={cn('flex items-center gap-2 px-5 py-5', collapsed && 'justify-center px-3')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
          {siteName.charAt(0).toUpperCase()}
        </div>
        {!collapsed && <span className="text-lg font-bold text-text">{siteName}</span>}
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-primary-light/40"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <item.icon size={20} className="relative z-10 shrink-0" />
                  {!collapsed && <span className="relative z-10">{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('border-t border-border px-5 py-4', collapsed && 'px-3')}>
        {!collapsed && <p className="text-xs text-text-secondary">{siteName} Edge v1.0</p>}
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-surface shadow-md md:hidden"
        aria-label="打开菜单"
      >
        <IconMenu2 size={20} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-border bg-surface md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1 text-text-secondary hover:bg-gray-100"
                aria-label="关闭菜单"
              >
                <IconX size={20} />
              </button>
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'hidden h-full flex-col border-r border-border bg-surface transition-all duration-200 md:flex',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {navContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-14 right-0 translate-x-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm hover:bg-gray-100"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <IconChevronsRight size={14} /> : <IconChevronsLeft size={14} />}
        </button>
      </aside>
    </>
  )
}
