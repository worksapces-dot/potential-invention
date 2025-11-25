import axios from 'axios'

export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  )

  return refresh_token.data
}

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('sending message')
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
    {
      recipient: {
        id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log('sending message')
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
    {
      recipient: {
        comment_id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}


export const generateTokens = async (code: string) => {
  const insta_form = new FormData()
  insta_form.append('client_id', process.env.INSTAGRAM_CLIENT_ID as string)

  insta_form.append(
    'client_secret',
    process.env.INSTAGRAM_CLIENT_SECRET as string
  )
  insta_form.append('grant_type', 'authorization_code')
  insta_form.append(
    'redirect_uri',
    `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
  )
  insta_form.append('code', code)

  const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string, {
    method: 'POST',
    body: insta_form,
  })

  let token: any
  try {
    token = await shortTokenRes.json()
  } catch (err) {
    console.log('🔴 Failed to parse Instagram token response', err)
    return null
  }

  if (!shortTokenRes.ok) {
    console.log(
      '🔴 Instagram token exchange failed',
      shortTokenRes.status,
      token
    )
    return null
  }

  const permissions = Array.isArray(token?.permissions)
    ? token.permissions
    : []

  if (permissions.length === 0) {
    console.log('🔴 Instagram token response has no permissions', token)
    return null
  }

  if (!token.access_token) {
    console.log('🔴 Instagram token response missing access_token', token)
    return null
  }

  const long_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`
  )

  return long_token.data
}
