const OPENING_DISABLED_STORAGE_KEY = 'mindRoutineOpeningDisabled'

export const isOpeningDisabled = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(OPENING_DISABLED_STORAGE_KEY) === 'true'
}

export const setOpeningDisabled = (disabled) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(OPENING_DISABLED_STORAGE_KEY, String(Boolean(disabled)))
}
