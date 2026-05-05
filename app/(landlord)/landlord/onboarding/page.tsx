'use client'

import { useState, useActionState, useEffect } from 'react'
import { onboardingProfileAction, onboardingBuildingAction, onboardingUnitAction, skipOnboardingAction } from '@/app/actions/onboarding'

const STEPS = ['Profile', 'Building', 'Unit']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [profileState, profileAction, profilePending] = useActionState(onboardingProfileAction, null)
  const [buildingState, buildingAction, buildingPending] = useActionState(onboardingBuildingAction, null)
  const [unitState, unitAction, unitPending] = useActionState(onboardingUnitAction, null)
  const [buildingId, setBuildingId] = useState<string | null>(null)

  // Advance from profile step
  useEffect(() => {
    if (profileState?.message === 'saved' && !profileState.errors) {
      setStep(1)
    }
  }, [profileState])

  // Advance from building step
  useEffect(() => {
    if (buildingState?.message === 'saved' && buildingState.buildingId) {
      setBuildingId(buildingState.buildingId)
      setStep(2)
    }
  }, [buildingState])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#0f3460] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 0: Profile */}
        {step === 0 && (
          <form action={profileAction} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your landlord profile</h2>
            <Field name="displayName" label="Your Name" required />
            <Field name="address" label="Address" required />
            <Field name="contact" label="Contact Number" required />
            <Field name="electricityRate" label="Electricity Rate (Rs./unit)" type="number" defaultValue="17" required />
            <Field name="paymentDueDay" label="Payment Due Day (1-31)" type="number" defaultValue="2" required />
            {profileState?.errors && <ErrorList errors={profileState.errors} />}
            <button type="submit" disabled={profilePending} className="w-full bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
              {profilePending ? 'Saving...' : 'Continue'}
            </button>
          </form>
        )}

        {/* Step 1: Building */}
        {step === 1 && (
          <form action={buildingAction} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create your first building</h2>
            <Field name="name" label="Building Name" required />
            <Field name="address" label="Building Address" required />
            <Field name="contact" label="Building Contact" />
            {buildingState?.errors && <ErrorList errors={buildingState.errors} />}
            <div className="flex gap-3">
              <form action={skipOnboardingAction}>
                <button type="submit" className="border border-gray-300 text-gray-600 py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50">
                  Skip all
                </button>
              </form>
              <button type="submit" disabled={buildingPending} className="flex-1 bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
                {buildingPending ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Unit */}
        {step === 2 && (
          <form action={unitAction} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add your first unit</h2>
            {buildingId && <input type="hidden" name="buildingId" value={buildingId} />}
            <Field name="unitNumber" label="Unit Number / Name (e.g., Flat 2B)" required />
            <Field name="floor" label="Floor (optional)" />
            {unitState?.errors && <ErrorList errors={unitState.errors} />}
            <div className="flex gap-3">
              <form action={skipOnboardingAction}>
                <button type="submit" className="border border-gray-300 text-gray-600 py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50">
                  Skip for now
                </button>
              </form>
              <button type="submit" disabled={unitPending} className="flex-1 bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
                {unitPending ? 'Adding...' : 'Finish'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  name, label, type = 'text', required, defaultValue,
}: {
  name: string; label: string; type?: string; required?: boolean; defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
      />
    </div>
  )
}

function ErrorList({ errors }: { errors: Record<string, string[]> }) {
  const msgs = Object.values(errors).flat()
  if (msgs.length === 0) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      {msgs.map((m, i) => <p key={i} className="text-red-700 text-xs">{m}</p>)}
    </div>
  )
}
