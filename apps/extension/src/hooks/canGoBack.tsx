import { useRouteContext, useRouter } from '@tanstack/react-router'

export function canGoBack(): boolean {
  const routeContext = useRouteContext({ strict: false })
  const router = useRouter()

  const isFullScreen = routeContext.fullscreen

  const canGoBack = router.history.canGoBack()
  const env = routeContext.environment

  const isSidepanel = env === 'sidepanel'

  // Return false if we can't go back
  if (!canGoBack) {
    return false
  }

  // Return false only if we're in sidepanel and not in fullscreen mode
  if (isSidepanel && !isFullScreen) {
    return true
  }

  // Return true for all other cases (fullscreen sidepanel, popup, etc.)
  return true
}
