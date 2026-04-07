import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? ''

  try {
    const url = `https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/ka/json/${date ? `?date=${date}` : ''}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return NextResponse.json({ error: 'NBG error' }, { status: res.status })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }
}
