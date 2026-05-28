import ProtectedRoute from '@/components/shared/ProtectedRoute'
import React from 'react'

export default function page() {
  return (
    <ProtectedRoute>
        <div>My Profile</div>
    </ProtectedRoute>
  )
}
