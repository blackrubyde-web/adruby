import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SettingsPage } from '../components/SettingsPage'

describe('Smoke', () => {
  it('renders SettingsPage', () => {
    render(<SettingsPage />)
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})
