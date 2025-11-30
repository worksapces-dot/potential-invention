import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

// For backward compatibility - lazy getter
export const resend = {
  get emails() {
    return getResend().emails
  },
}
