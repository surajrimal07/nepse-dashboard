// import { storage } from '#imports'
// import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

// interface UseStorageOptions<T> {
//   defaultValue?: T
// }

// // Overloads to provide proper typing based on whether defaultValue is provided
// export function useStorage<T>(
//   key: string,
//   options: UseStorageOptions<T> & { defaultValue: T },
// ): readonly [T, (newValue: T) => Promise<void>, boolean, () => Promise<void>]

// export function useStorage<T>(
//   key: string,
//   options?: UseStorageOptions<T>,
// ): readonly [T | null, (newValue: T) => Promise<void>, boolean, () => Promise<void>]

// export function useStorage<T>(key: string, options?: UseStorageOptions<T>) {
//   const prefixedKey = `local:${key}` as const
//   const { defaultValue } = options ?? {}
//   const hasDefaultValue = defaultValue !== undefined

//   // Single source of truth for state
//   const stateRef = useRef<{
//     value: T | null
//     initialized: boolean
//   }>({
//     value: hasDefaultValue ? defaultValue : null,
//     initialized: false,
//   })

//   // Memoize subscribe to prevent unnecessary re-subscriptions
//   const subscribe = useCallback(
//     (onChange: () => void) => {
//       const unwatch = storage.watch<T>(prefixedKey, (newVal) => {
//         // Consistent fallback logic
//         const resolvedValue = newVal ?? (hasDefaultValue ? defaultValue : null)

//         stateRef.current = {
//           value: resolvedValue,
//           initialized: true,
//         }
//         onChange()
//       })
//       return unwatch
//     },
//     [prefixedKey, defaultValue, hasDefaultValue],
//   )

//   const getSnapshot = useCallback((): T | null => {
//     return stateRef.current.value
//   }, [])

//   // Server-side rendering snapshot (same as client for consistency)
//   const getServerSnapshot = getSnapshot

//   useEffect(() => {
//     let isMounted = true

//     const initialize = async () => {
//       try {
//         const stored = await storage.getItem<T>(prefixedKey)

//         if (!isMounted)
//           return

//         let finalValue: T | null

//         if (stored == null) {
//           if (hasDefaultValue) {
//             // Set default value in storage and use it
//             await storage.setItem(prefixedKey, defaultValue)
//             finalValue = defaultValue
//           }
//           else {
//             finalValue = null
//           }
//         }
//         else {
//           finalValue = stored
//         }

//         // Only update if component is still mounted
//         if (isMounted) {
//           stateRef.current = {
//             value: finalValue,
//             initialized: true,
//           }
//         }
//       }
//       catch (error) {
//         console.error('useStorage initialization error:', error)
//         if (isMounted && hasDefaultValue) {
//           stateRef.current = {
//             value: defaultValue,
//             initialized: true,
//           }
//         }
//       }
//     }

//     initialize()

//     return () => {
//       isMounted = false
//     }
//   }, [prefixedKey, defaultValue, hasDefaultValue])

//   const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
//   const loading = !stateRef.current.initialized

//   const setValue = useCallback(
//     async (newValue: T) => {
//       try {
//         await storage.setItem(prefixedKey, newValue)
//         // The storage.watch will handle updating the state
//       }
//       catch (error) {
//         console.error('useStorage setValue error:', error)
//         throw error // Re-throw so caller can handle
//       }
//     },
//     [prefixedKey],
//   )

//   const removeValue = useCallback(async () => {
//     try {
//       await storage.removeItem(prefixedKey)
//       // After removal, fall back to default if available
//       if (hasDefaultValue) {
//         await storage.setItem(prefixedKey, defaultValue)
//       }
//       // The storage.watch will handle updating the state
//     }
//     catch (error) {
//       console.error('useStorage removeValue error:', error)
//       throw error // Re-throw so caller can handle
//     }
//   }, [prefixedKey, defaultValue, hasDefaultValue])

//   return [value, setValue, loading, removeValue] as const
// }
