import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../ServiceCard';
import { BookingConfirmation } from '../BookingConfirmation';
import { ThemeProvider } from '../../ThemeProvider';

describe('Booking Workflow', () => {
  const mockService = {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    profession: 'House Cleaning',
    rating: 4.5,
    reviewCount: 123,
    pricing: { basePrice: 50, currency: 'USD' },
    categories: ['Cleaning', 'Home'],
  };

  const mockBooking = {
    id: '1',
    provider: mockService,
    date: new Date('2025-04-15T10:00:00Z'),
    time: new Date('2025-04-15T10:00:00Z'),
    price: 50,
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('completes the booking workflow', () => {
    const onViewDetails = jest.fn();

    const { getByLabelText, getByText } = renderWithTheme(
      <>
        <ServiceCard
          id={mockService.id}
          providerName={mockService.name}
          providerAvatar={mockService.avatar}
          serviceName={mockService.profession}
          rating={mockService.rating}
          reviewCount={mockService.reviewCount}
          price={mockService.pricing.basePrice}
          currency={mockService.pricing.currency}
          categories={mockService.categories}
          distance="2.5 km"
          onPress={() => onViewDetails(mockService.id)}
        />
        <BookingConfirmation booking={mockBooking} onViewDetails={onViewDetails} />
      </>
    );

    // Simulate booking button press
    const bookButton = getByLabelText('Book Now');
    fireEvent.press(bookButton);
    expect(onViewDetails).toHaveBeenCalledWith(mockService.id);

    // Verify booking confirmation details
    expect(getByText('Booking Confirmed!')).toBeTruthy();
    expect(
      getByLabelText(
        `Booking details: ${mockService.name}, ${mockService.profession}, on April 15, 2025 at 10:00 AM`
      )
    ).toBeTruthy();
  });
});