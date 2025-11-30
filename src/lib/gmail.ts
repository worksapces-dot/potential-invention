import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
)

// Scopes needed for sending emails
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
]

export function getAuthUrl(state: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  })
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials
}

export async function sendEmail({
  accessToken,
  refreshToken,
  to,
  subject,
  body,
  senderName,
  senderEmail,
}: {
  accessToken: string
  refreshToken: string
  to: string
  subject: string
  body: string
  senderName: string
  senderEmail: string
}) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // Convert body to HTML
  const htmlBody = body
    .split('\n')
    .map((line: string) => {
      if (line.trim() === '') return '<br>'
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const lineWithLinks = line.replace(
        urlRegex,
        '<a href="$1" style="color: #667eea;">$1</a>'
      )
      return `<p style="margin: 0 0 12px 0;">${lineWithLinks}</p>`
    })
    .join('')

  // Create email
  const email = [
    `From: ${senderName} <${senderEmail}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    `<html><body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">${htmlBody}</body></html>`,
  ].join('\r\n')

  // Encode to base64url
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
    },
  })

  return result.data
}

export async function getUserEmail(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken })
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  return data.email
}
