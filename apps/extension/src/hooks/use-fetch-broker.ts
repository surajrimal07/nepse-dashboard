// import { useEffect } from 'react'
// import { toast } from 'sonner'
// import { useShallow } from 'zustand/react/shallow'
// import { getActions } from '@/lib/repository/action-repo'
// import { selectBrokerList, selectSetBrokerList } from '@/selectors/account-selector'
// import { useAccountState } from '@/state/account-state'

// export function useFetchBroker() {
//   const { brokers, setBrokers } = useAccountState(
//     useShallow(state => ({
//       brokers: selectBrokerList(state),
//       setBrokers: selectSetBrokerList(state),
//     })),
//   )
//   useEffect(() => {
//     const fetchBrokersIfNeeded = async () => {
//       if (!brokers || !brokers.brokers || !brokers.dps) {
//         const loadingToast = toast.loading('Downloading brokers list...')
//         try {
//           const result = await getActions().fetchBrokers()
//           if (result.success) {
//             setBrokers(result.data)
//             toast.dismiss(loadingToast)
//             toast.success(result.message || 'Brokers list downloaded successfully')
//           }
//           else {
//             toast.dismiss(loadingToast)
//             toast.error(result.message || 'Failed to download brokers list')
//           }
//         }
//         catch (error) {
//           toast.dismiss(loadingToast)
//           toast.error(error instanceof Error ? error.message : 'An unexpected error occurred while fetching brokers')
//         }
//       }
//     }

//     fetchBrokersIfNeeded()
//   }, [brokers, setBrokers])

//   return { brokers, setBrokers }
// }
