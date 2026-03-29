export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
}

export type Organization = {
  id: string
  user_id: string
  name: string
  is_demo: boolean
  is_active: boolean
  activated_at: string | null
  expires_at: string | null
  created_at: string
}

export type Credit = {
  id: string
  user_id: string
  granted_by: string
  amount: number
  note: string | null
  created_at: string
}

export type OrgRequest = {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  created_at: string
}

// For admin dashboard — joined view
export type UserWithStats = Profile & {
  organizations: Organization[]
  credits: Credit[]
  pending_requests: number
  total_credits_granted: number
}
