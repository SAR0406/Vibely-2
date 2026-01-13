import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'
import { describe, it, expect } from 'vitest'

describe('Avatar', () => {
    it('renders fallback when no image', () => {
        render(
            <Avatar>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        )
        expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders fallback initially', () => {
        render(
            <Avatar>
                <AvatarImage src="https://example.com/image.jpg" alt="test-avatar" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        )
        // Radix Avatar shows fallback while image is loading
        expect(screen.getByText('JD')).toBeInTheDocument()
    })
})
