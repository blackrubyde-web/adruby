import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SettingsPage } from '../components/SettingsPage'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../components/ThemeProvider'

describe('Smoke', () => {
  it('renders SettingsPage', () => {
    render(
      <ThemeProvider>
        <AuthProvider>
          <SettingsPage />
        </AuthProvider>
      </ThemeProvider>
    )
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})
