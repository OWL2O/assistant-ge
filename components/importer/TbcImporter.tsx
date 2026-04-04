'use client'

import type { Organization } from '@/lib/types'

export default function TbcImporter({ org }: { org: Organization }) {
  const params = new URLSearchParams({
    org_name: org.name,
    is_demo: org.is_demo ? '1' : '0',
  })

  return (
    <iframe
      src={`/importer.html?${params.toString()}`}
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
    />
  )
}
