import { Button } from '@nepse-dashboard/ui/components/button'
import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react'
import { memo } from 'react'
import { cn } from '@/lib/utils'

export const NewsHeader = memo(
  ({
    isCollapsed,
    toggleCollapsed,
    language,
    toggleLanguage,
    onClose,
  }: {
    isCollapsed: boolean
    toggleCollapsed: () => void
    language: 'en' | 'np'
    toggleLanguage: () => void
    onClose: () => void
  }) => (
    <div
      className={cn(
        'pt-1 px-1 bg-white',
        isCollapsed ? 'rounded-xl' : 'border-b border-gray-200 rounded-t-xl',
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1"
          data-drag-handle
        >
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            📰 News Summary
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="h-7 px-2 text-xs"
            title={`Switch to ${language === 'np' ? 'English' : 'Nepali'}`}
          >
            {language === 'np' ? 'Np' : 'En'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8"
          >
            {isCollapsed
              ? (
                  <ChevronDown className="h-4 w-4" />
                )
              : (
                  <ChevronUp className="h-4 w-4" />
                )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-grab active:cursor-grabbing"
            data-drag-handle
          >
            <GripVertical className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ),
)
