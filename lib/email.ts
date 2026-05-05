import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

function from() {
  return process.env.RESEND_FROM ?? 'noreply@aksrental.app'
}

function baseUrl() {
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${baseUrl()}/auth/verify?token=${token}`
  await getResend().emails.send({
    from: from(),
    to: email,
    subject: 'Verify your AKS Rental account',
    html: `<p>Click the link below to verify your email address. This link expires in 24 hours.</p><a href="${url}">${url}</a>`,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${baseUrl()}/auth/reset/${token}`
  await getResend().emails.send({
    from: from(),
    to: email,
    subject: 'Reset your AKS Rental password',
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${url}">${url}</a><p>If you did not request this, you can ignore this email.</p>`,
  })
}

export async function sendInvoiceNotification(email: string, invoiceNumber: string, invoiceId: string) {
  const url = `${baseUrl()}/tenant/invoices/${invoiceId}`
  await getResend().emails.send({
    from: from(),
    to: email,
    subject: `New invoice ${invoiceNumber} from your landlord`,
    html: `<p>Your landlord has generated invoice <strong>${invoiceNumber}</strong>.</p><p><a href="${url}">View and download your invoice</a></p>`,
  })
}

export async function sendJoinRequestNotification(landlordEmail: string, tenantName: string) {
  await getResend().emails.send({
    from: from(),
    to: landlordEmail,
    subject: `New join request from ${tenantName}`,
    html: `<p><strong>${tenantName}</strong> has submitted a request to join your building.</p><p><a href="${baseUrl()}/landlord/join-requests">Review join requests</a></p>`,
  })
}

export async function sendJoinRequestResult(email: string, approved: boolean, buildingName: string) {
  const subject = approved
    ? `Your request to join ${buildingName} was approved`
    : `Your request to join ${buildingName} was not approved`
  const body = approved
    ? `<p>Congratulations! Your request to join <strong>${buildingName}</strong> has been approved.</p><p><a href="${baseUrl()}/tenant">Go to dashboard</a></p>`
    : `<p>Your request to join <strong>${buildingName}</strong> was not approved at this time.</p>`
  await getResend().emails.send({ from: from(), to: email, subject, html: body })
}

export async function sendPaymentProofNotification(landlordEmail: string, tenantName: string, invoiceNumber: string) {
  await getResend().emails.send({
    from: from(),
    to: landlordEmail,
    subject: `Payment proof submitted for ${invoiceNumber}`,
    html: `<p><strong>${tenantName}</strong> has submitted payment proof for invoice <strong>${invoiceNumber}</strong>.</p><p><a href="${baseUrl()}/landlord/invoices">Review payments</a></p>`,
  })
}

export async function sendPaymentVerificationResult(email: string, verified: boolean, invoiceNumber: string) {
  const subject = verified
    ? `Payment verified for invoice ${invoiceNumber}`
    : `Payment for invoice ${invoiceNumber} was not verified`
  const body = verified
    ? `<p>Your payment for invoice <strong>${invoiceNumber}</strong> has been verified. Thank you!</p>`
    : `<p>Your payment for invoice <strong>${invoiceNumber}</strong> could not be verified. Please resubmit or contact your landlord.</p>`
  await getResend().emails.send({ from: from(), to: email, subject, html: body })
}

export async function sendMaintenanceNotification(landlordEmail: string, title: string) {
  await getResend().emails.send({
    from: from(),
    to: landlordEmail,
    subject: `New maintenance request: ${title}`,
    html: `<p>A new maintenance request has been submitted: <strong>${title}</strong></p><p><a href="${baseUrl()}/landlord/maintenance">Review requests</a></p>`,
  })
}

export async function sendMaintenanceStatusUpdate(email: string, title: string, status: string) {
  await getResend().emails.send({
    from: from(),
    to: email,
    subject: `Maintenance request updated: ${title}`,
    html: `<p>Your maintenance request <strong>${title}</strong> has been updated to: <strong>${status}</strong></p><p><a href="${baseUrl()}/tenant/maintenance">View your requests</a></p>`,
  })
}
