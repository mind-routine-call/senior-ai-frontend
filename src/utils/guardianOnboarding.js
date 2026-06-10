const GUARDIAN_ONBOARDING_STORAGE_KEY = 'guardianOnboardingDone'

export const isGuardianOnboardingComplete = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(GUARDIAN_ONBOARDING_STORAGE_KEY) === 'true'
}

export const completeGuardianOnboarding = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUARDIAN_ONBOARDING_STORAGE_KEY, 'true')
}
