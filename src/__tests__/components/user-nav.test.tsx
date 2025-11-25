import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserNav } from '@/components/user-nav'

// Mock authClient
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: jest.fn(),
  },
}))

import { authClient } from '@/lib/auth-client'

describe('UserNav', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders welcome message with user name', () => {
    render(<UserNav name="John Doe" />)
    
    expect(screen.getByText(/welcome, john doe/i)).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<UserNav name="Test User" />)
    
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls signOut when button is clicked', async () => {
    ;(authClient.signOut as jest.Mock).mockResolvedValueOnce({})
    
    render(<UserNav name="Test User" />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutButton)
    
    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalled()
    })
  })

  it('handles empty user name', () => {
    render(<UserNav name="" />)
    
    expect(screen.getByText(/welcome,/i)).toBeInTheDocument()
  })
})
