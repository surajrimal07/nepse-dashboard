import type { Account } from '@/types/account-types'

export function deleteAccount(
  accounts: Account[],
  accountIndex: number,
): Account[] {
  const accountToDelete = accounts[accountIndex]
  const wasPrimary = accountToDelete.isPrimary

  // Remove account immutably
  let newAccounts = accounts.filter(
    (_: Account, idx: number) => idx !== accountIndex,
  )

  // If deleted account was primary → promote first account of same type
  if (wasPrimary) {
    newAccounts = newAccounts.map((acc: Account) =>
      acc.type === accountToDelete.type && !acc.isPrimary
        ? { ...acc, isPrimary: true }
        : acc,
    )
  }

  return newAccounts
}

export function makePrimary(
  accounts: Account[],
  alias: string,
  targetAccount: Account,
): Account[] {
  const newAccounts = accounts.map((acc: Account) => {
    if (acc.type === targetAccount.type) {
      return { ...acc, isPrimary: acc.alias === alias }
    }
    return acc
  })

  return newAccounts
}
