'use client'

import { useState, useActionState, useEffect } from 'react'
import { onboardingProfileAction, onboardingBuildingAction, onboardingUnitAction, skipOnboardingAction } from '@/app/actions/onboarding'
import { CheckCircle2 } from 'lucide-react'

const STEPS = ['Profile', 'Building', 'Unit']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [profileState, profileAction, profilePending] = useActionState(onboardingProfileAction, null)
  const [buildingState, buildingAction, buildingPending] = useActionState(onboardingBuildingAction, null)
  const [unitState, unitAction, unitPending] = useActionState(onboardingUnitAction, null)
  const [buildingId, setBuildingId] = useState<string | null>(null)

  useEffect(() => {
    if (profileState?.message === 'saved' && !profileState.errors) setStep(1)
  }, [profileState])

  useEffect(() => {
    if (buildingState?.message === 'saved' && buildingState.buildingId) {
      setBuildingId(buildingState.buildingId)
      setStep(2)
    }
  }, [buildingState])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < step
                  ? 'gradient-bg text-white'
                  : i === step
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="card-modern p-8">
          {/* Step 0: Profile */}
          {step === 0 && (
            <form action={profileAction} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl text-foreground mb-1">Your landlord profile</h2>
                <p className="text-sm text-muted-foreground">Set up your profile to get started</p>
              </div>
              <Field name="displayName" label="Your Name" required />
              <Field name="address" label="Address" required />
              <Field name="contact" label="Contact Number" required />
              <div className="grid grid-cols-2 gap-4">
                <Field name="electricityRate" label="Electricity Rate (Rs./unit)" type="number" defaultValue="17" required />
                <Field name="paymentDueDay" label="Payment Due Day (1-31)" type="number" defaultValue="2" required />
              </div>
              {profileState?.errors && <ErrorList errors={profileState.errors} />}
              <button type="submit" disabled={profilePending} className="btn-primary w-full h-11 mt-2">
                {profilePending ? 'Saving...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 1: Building */}
          {step === 1 && (
            <form action={buildingAction} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl text-foreground mb-1">Create your first building</h2>
                <p className="text-sm text-muted-foreground">Add your first property to manage</p>
              </div>
              <Field name="name" label="Building Name" required />
              <Field name="address" label="Building Address" required />
              <Field name="contact" label="Building Contact" />
              {buildingState?.errors && <ErrorList errors={buildingState.errors} />}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  formAction={skipOnboardingAction}
                  className="btn-ghost py-2.5 px-4 text-sm border border-border"
                >
                  Skip all
                </button>
                <button type="submit" disabled={buildingPending} className="btn-primary flex-1 h-11">
                  {buildingPending ? 'Creating...' : 'Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Unit */}
          {step === 2 && (
            <form action={unitAction} className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl text-foreground mb-1">Add your first unit</h2>
                <p className="text-sm text-muted-foreground">Add a unit to your building</p>
              </div>
              {buildingId && <input type="hidden" name="buildingId" value={buildingId} />}
              <Field name="unitNumber" label="Unit Number / Name (e.g., Flat 2B)" required />
              <Field name="floor" label="Floor (optional)" />
              {unitState?.errors && <ErrorList errors={unitState.errors} />}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  formAction={skipOnboardingAction}
                  className="btn-ghost py-2.5 px-4 text-sm border border-border"
                >
                  Skip for now
                </button>
                <button type="submit" disabled={unitPending} className="btn-primary flex-1 h-11">
                  {unitPending ? 'Adding...' : 'Finish'}
                </button>
              </div>
            </form>
          )}
        </div>
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
      <label className="field-label">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="input-modern"
      />
    </div>
  )
}

function ErrorList({ errors }: { errors: Record<string, string[]> }) {
  const msgs = Object.values(errors).flat()
  if (msgs.length === 0) return null
  return (
    <div className="alert-error">
      <div>
        {msgs.map((m, i) => <p key={i} className="text-sm">{m}</p>)}
      </div>
    </div>
  )
}
