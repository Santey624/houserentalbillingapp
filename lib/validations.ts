import { z } from 'zod'

export const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['LANDLORD', 'TENANT']),
})

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const ResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LandlordProfileSchema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  contact: z.string().min(1, 'Contact is required'),
  electricityRate: z.coerce.number().positive('Rate must be positive'),
  paymentDueDay: z.coerce.number().int().min(1).max(31),
  bankDetails: z.string().optional(),
})

export const BuildingSchema = z.object({
  name: z.string().min(2, 'Building name is required'),
  address: z.string().min(5, 'Address is required'),
  contact: z.string().optional().default(''),
  isOpen: z.coerce.boolean().optional().default(true),
})

export const UnitSchema = z.object({
  buildingId: z.string().min(1, 'Building is required'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  floor: z.string().optional(),
  notes: z.string().optional(),
})

export const JoinRequestSchema = z.object({
  buildingId: z.string().min(1),
  unitId: z.string().optional(),
  note: z.string().max(500).optional(),
})

export const InvoiceSchema = z.object({
  tenancyId: z.string().min(1),
  unitId: z.string().min(1),
  tenantName: z.string().min(1),
  nepaliMonth: z.string().min(1),
  nepaliYear: z.string().min(4),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  rentCost: z.coerce.number().min(0),
  serviceCharge: z.coerce.number().min(0).default(0),
})

export const PaymentSchema = z.object({
  invoiceId: z.string().min(1),
  method: z.enum(['ESEWA', 'KHALTI', 'BANK_TRANSFER', 'CASH']),
  referenceNum: z.string().optional(),
  amount: z.coerce.number().positive(),
})

export const MaintenanceSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export const TenantProfileSchema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  contact: z.string().optional().default(''),
})
