// import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
// import { EventName } from '@/types/analytics-types'
// import { getContentService } from '../repository/content-repo'

// /**
//  * A React hook to interact with a WxtStorageItem instance created by `storage.defineItem`.
//  * It uses the methods directly available on the storageItem.
//  *
//  * @template TValue The type of the value stored in the WxtStorageItem.
//  * @param {WxtStorageItem<TValue, any>} storageItem The WxtStorageItem instance (e.g., from your `store.ts`).
//  * This item is expected to have a `key` property (string) and methods like `watch`, `getValue`, `setValue`.
//  * It's also assumed to have a `defaultValue` property or similar if synchronous fallback is needed (see notes).
//  * @returns {[
//  * TValue | null | undefined,
//  * (value: TValue | null | ((prevValue: TValue | null | undefined) => TValue | null)) => Promise<void>,
//  * boolean
//  * ]}
//  * A tuple containing:
//  * - The current value from storage. Can be `TValue`, `null` (if allowed and set), or `undefined` (initially, before loading).
//  * - An async function to set the value in storage.
//  * - A boolean indicating if the initial value is loading.
//  */
// export function useStorage<TValue>(
//   // Ensure your WxtStorageItem instances from `define` have these properties/methods.
//   // `key` is used for logging. `defaultValue` would be used if a synchronous fallback in getSnapshot is complexly needed.
//   // WXT's `defineItem` should return an object that conforms to this.
//   storageItem: WxtStorageItem<TValue, any> & {
//     key: string
//     defaultValue?: TValue
//   },
// ): [
//   TValue | null | undefined, // Value can be TValue, null (if TValue allows or watch provides it), or undefined initially.
//   (
//     value: TValue | null | ((prevValue: TValue | null | undefined) => TValue | null),
//   ) => Promise<void>,
//   boolean,
//   ] {
//   const [isLoading, setIsLoading] = useState(true)
//   const storageItemRef = useRef(storageItem)

//   // valueRef stores the latest known value, potentially null if watch provides it.
//   // Initialize with undefined; useEffect will populate it.
//   // If storageItem.defaultValue is reliably available and TValue is not inherently undefined,
//   // you could initialize with: storageItemRef.current.defaultValue
//   const valueRef = useRef<TValue | null | undefined>(undefined)

//   // Effect to update storageItemRef and reset state if the storageItem prop instance changes.
//   useEffect(() => {
//     if (storageItemRef.current !== storageItem) {
//       storageItemRef.current = storageItem
//       setIsLoading(true)
//       // Initialize with the new item's default value if readily available, otherwise undefined.
//       // This depends on how `defaultValue` is exposed on your `storageItem` instances.
//       valueRef.current
//         = storageItem.defaultValue !== undefined ? storageItem.defaultValue : undefined
//     }
//   }, [storageItem])

//   const subscribe = useCallback((onStoreChange: () => void) => {
//     const currentItem = storageItemRef.current

//     // Based on the TypeScript error, the watch callback receives TValue | null.
//     const handleStorageChange = (newValueFromWatch: TValue | null) => {
//       valueRef.current = newValueFromWatch
//       onStoreChange()
//     }

//     // Assuming `watch` is a method on the storageItem instance.
//     const unwatch = currentItem.watch(handleStorageChange)
//     return unwatch
//   }, []) // Depends on storageItemRef, but the ref itself is stable.

//   const getSnapshot = useCallback((): TValue | null | undefined => {
//     // If valueRef is undefined (e.g. initial load before useEffect)
//     // and we have a synchronous way to get the default, use it.
//     // Otherwise, just return what's in valueRef.
//     if (valueRef.current === undefined) {
//       // This relies on `defaultValue` being a property on your specific `storageItem` instances.
//       // Your `define` function adds `defaultValue` to the options. WXT might expose it as `item.defaultValue`.
//       return storageItemRef.current.defaultValue !== undefined
//         ? storageItemRef.current.defaultValue
//         : undefined
//     }
//     return valueRef.current
//   }, []) // Depends on storageItemRef for defaultValue.

//   const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

//   // Effect for initial data loading using storageItem.getValue()
//   useEffect(() => {
//     let didUnsubscribe = false
//     const currentItem = storageItemRef.current

//     // Set initial value from defaultValue if not already set by constructor/prop change effect
//     if (valueRef.current === undefined && currentItem.defaultValue !== undefined) {
//       valueRef.current = currentItem.defaultValue
//       // We still want to fetch the actual stored value, so don't set isLoading to false yet.
//       // A manual notify might be needed if this synchronous update isn't picked up before fetch.
//       // However, useSyncExternalStore should re-run getSnapshot on next render.
//     }
//     setIsLoading(true)

//     // storageItem.getValue() is expected to return Promise<TValue>,
//     // respecting any fallback defined in the storage item's definition.
//     currentItem
//       .getValue()
//       .then((valueFromStorage) => {
//         // valueFromStorage should be TValue
//         if (!didUnsubscribe) {
//           valueRef.current = valueFromStorage
//           setIsLoading(false)
//           // Note: useSyncExternalStore should handle re-rendering.
//           // If there's a race or if the initial sync default setting needs to force an update:
//           // You might need to call the `onStoreChange` from `subscribe` if it were accessible here,
//           // or ensure a re-render happens that calls getSnapshot. Setting isLoading does this.
//         }
//       })
//       .catch((error) => {
//         if (!didUnsubscribe) {
//           console.error(`[useWxtStorage] Error loading item "${currentItem.key}":`, error)

//           getContentService().trackEvent({
//             event: EventName.STORAGE_EXCEPTION,
//             data: {
//               error: error instanceof Error ? error.message : String(error),
//               name: 'useWxtStorage.getValue',
//               key: currentItem.key,
//             },
//           })

//           // On error, valueRef might remain undefined or the defaultValue.
//           // Consider if an explicit error state is needed for the hook consumer.
//           setIsLoading(false)
//         }
//       })

//     return () => {
//       didUnsubscribe = true
//     }
//   }, [storageItem]) // Re-run if the storageItem object itself changes.

//   const setValue = useCallback(
//     async (val: TValue | null | ((prevValue: TValue | null | undefined) => TValue | null)) => {
//       const currentItem = storageItemRef.current
//       let newValue: TValue | null

//       if (typeof val === 'function') {
//         // Pass the current snapshot (which could be undefined initially or null)
//         const prevValue = getSnapshot() // Use getSnapshot to respect defaultValue logic
//         newValue = (val as (prevValue: TValue | null | undefined) => TValue | null)(prevValue)
//       }
//       else {
//         newValue = val
//       }

//       try {
//         // storageItem.setValue(value) expects `value: TValue`.
//         // If `newValue` here can be `null` but `TValue` cannot (e.g. `boolean`),
//         // this might be an issue. WXT's `setValue(null)` might be equivalent to `removeValue()`.
//         // If `TValue` itself can be `null` (e.g. `string | null`), this is fine.
//         // Assuming `newValue` (type `TValue | null`) is acceptable by `setValue`.
//         // If `TValue` is strictly non-nullable, and `newValue` is `null`, this needs care.
//         // For items defined with non-null fallbacks, WXT might prevent setting to `null`
//         // or `setValue(null)` might reset to fallback. This depends on WXT's behavior.
//         // Let's assume `setValue` handles `null` appropriately (e.g., removes or sets if TValue allows null).
//         await currentItem.setValue(newValue as TValue) // Cast needed if TValue is non-nullable but newValue can be null.
//         // This cast is risky if TValue is strictly non-nullable.
//         // A safer approach might be to call `currentItem.removeValue()` if newValue is null
//         // and TValue is not supposed to be null.
//         // However, WXT's `setValue(null)` might do this.

//         // `watch` should pick up the change.
//       }
//       catch (error) {
//         console.error(`[useWxtStorage] Error setting item "${currentItem.key}":`, error)

//         getContentService().trackEvent({
//           event: EventName.STORAGE_EXCEPTION,
//           data: {
//             error: error instanceof Error ? error.message : String(error),
//             name: 'useWxtStorage.setValue',
//             key: currentItem.key,
//           },
//         })

//         throw error
//       }
//     },
//     [getSnapshot], // getSnapshot is now a dependency for functional updates
//   )

//   // The returned value's type reflects that it can be TValue, null (if TValue allows or from watch), or undefined (initial loading).
//   return [value, setValue, isLoading]
// }
