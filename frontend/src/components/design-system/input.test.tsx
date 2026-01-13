import { render, screen } from '@testing-library/react'
import { Input } from './input'
import { describe, it, expect } from 'vitest'
import { Search } from 'lucide-react'

describe('Input', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Type here" />)
        expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
    })

    it('renders with icon', () => {
        render(<Input icon={<Search data-testid="search-icon" />} placeholder="Search" />)
        expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
        render(<Input disabled />)
        expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('renders error state', () => {
        // Assuming error prop adds some class or aria attribute
        render(<Input error />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('border-destructive')
    })
})
