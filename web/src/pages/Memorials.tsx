import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import {
  IconPlus,
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { memorialApi, type Memorial } from '../lib/memorial-api'
import { MemorialDialog } from '../components/MemorialDialog'
import { cn } from '../lib/utils'

const TYPE_LABELS: Record<string, string> = {
  birthday: '生日',
  anniversary: '纪念日',
  custom: '自定义',
}

const TYPE_COLORS: Record<string, string> = {
  birthday: 'bg-pink-100 text-pink-700',
  anniversary: 'bg-purple-100 text-purple-700',
  custom: 'bg-blue-100 text-blue-700',
}

export function Memorials() {
  const [items, setItems] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Memorial | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const res = await memorialApi.list(keyword ? { keyword } : undefined)
      setItems(res.data)
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [keyword])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    try {
      await memorialApi.delete(id)
      toast.success('已删除')
      fetchItems()
    } catch {
      toast.error('删除失败')
    }
  }

  const handleSaved = () => {
    setDialogOpen(false)
    setEditingItem(null)
    fetchItems()
  }

  const openEdit = (item: Memorial) => {
    setEditingItem(item)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    setDialogOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">纪念日管理</h1>
          <p className="mt-1 text-sm text-text-secondary">
            共 {items.length} 条记录
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <IconPlus size={18} />
          添加纪念日
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名称、人物..."
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        <div className="flex rounded-lg border border-border bg-surface">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-l-lg p-2.5 transition-colors',
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
            )}
          >
            <IconLayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-r-lg p-2.5 transition-colors',
              viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
            )}
          >
            <IconList size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-text-secondary">
          <p className="text-lg">还没有纪念日</p>
          <p className="mt-1 text-sm">点击上方按钮添加第一个纪念日吧</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {items.map((item) => (
              <MemorialCard
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <MemorialRow
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialog */}
      <MemorialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSaved={handleSaved}
      />
    </div>
  )
}

function MemorialCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Memorial
  onEdit: () => void
  onDelete: () => void
}) {
  const dateDisplay = item.date_mode === 'solar'
    ? item.solar_date
    : `农历${item.lunar_month}月${item.lunar_day}日`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', TYPE_COLORS[item.memorial_type] || TYPE_COLORS.custom)}>
          {TYPE_LABELS[item.memorial_type] || item.memorial_type}
        </span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded p-1 text-text-secondary hover:bg-gray-100">
            <IconEdit size={16} />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-danger hover:bg-red-50">
            <IconTrash size={16} />
          </button>
        </div>
      </div>
      <h3 className="text-base font-semibold text-text">{item.name}</h3>
      {item.person && (
        <p className="mt-1 text-sm text-text-secondary">{item.person}</p>
      )}
      <p className="mt-2 text-sm text-text-secondary">{dateDisplay}</p>
      {item.group_name && (
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-text-secondary">
          {item.group_name}
        </span>
      )}
    </motion.div>
  )
}

function MemorialRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Memorial
  onEdit: () => void
  onDelete: () => void
}) {
  const dateDisplay = item.date_mode === 'solar'
    ? item.solar_date
    : `农历${item.lunar_month}月${item.lunar_day}日`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3 transition-shadow hover:shadow-sm"
    >
      <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', TYPE_COLORS[item.memorial_type] || TYPE_COLORS.custom)}>
        {TYPE_LABELS[item.memorial_type] || item.memorial_type}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-text">{item.name}</span>
        {item.person && <span className="ml-2 text-sm text-text-secondary">· {item.person}</span>}
      </div>
      <span className="shrink-0 text-sm text-text-secondary">{dateDisplay}</span>
      {item.group_name && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-text-secondary">
          {item.group_name}
        </span>
      )}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} className="rounded p-1 text-text-secondary hover:bg-gray-100">
          <IconEdit size={16} />
        </button>
        <button onClick={onDelete} className="rounded p-1 text-danger hover:bg-red-50">
          <IconTrash size={16} />
        </button>
      </div>
    </motion.div>
  )
}
