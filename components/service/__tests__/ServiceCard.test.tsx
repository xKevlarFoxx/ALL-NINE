import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../ServiceCard';
import { ThemeProvider } from '../../ThemeProvider';

describe('ServiceCard', () => {
  const mockProps = {
    id: '1',
    providerName: 'John Doe',
    serviceName: 'House Cleaning',
    rating: 4.5,
    reviewCount: 123,
    price: 50,
    currency: 'USD',
    categories: ['Cleaning', 'Home'],
    distance: '2.5 km',
    onPress: jest.fn(),
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all props', () => {
    const { getByText, getByLabelText } = renderWithTheme(
      <ServiceCard {...mockProps} />
    );

    expect(getByText(mockProps.providerName)).toBeTruthy();
    expect(getByText(mockProps.serviceName)).toBeTruthy();
    expect(getByText('$50')).toBeTruthy();
    expect(getByText('2.5 km')).toBeTruthy();
    mockProps.categories.forEach(category => {
      expect(getByText(category)).toBeTruthy();
    });
  });

  it('handles missing avatar gracefully', () => {
    const { getByLabelText } = renderWithTheme(
      <ServiceCard {...mockProps} providerAvatar={undefined} />
    );
    
    const avatar = getByLabelText(`${mockProps.providerName}'s avatar`);
    expect(avatar).toBeTruthy();
  });

  it('handles onPress callback', () => {
    const { getByLabelText } = renderWithTheme(
      <ServiceCard {...mockProps} />
    );

    const card = getByLabelText(
      `${mockProps.providerName}, ${mockProps.serviceName}. Rating: ${mockProps.rating} out of 5. ${mockProps.distance} away`
    );
    fireEvent.press(card);
    expect(mockProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('formats price correctly with different currencies', () => {
    const { getByText, rerender } = renderWithTheme(
      <ServiceCard {...mockProps} currency="EUR" />
    );
    expect(getByText('€50')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ServiceCard {...mockProps} currency="GBP" />
      </ThemeProvider>
    );
    expect(getByText('£50')).toBeTruthy();
  });

  it('displays correct rating and review count', () => {
    const { getByLabelText } = renderWithTheme(
      <ServiceCard {...mockProps} />
    );

    expect(getByLabelText(`Rating: ${mockProps.rating} out of 5, ${mockProps.reviewCount} reviews`)).toBeTruthy();
  });

  it('handles booking button press', () => {
    const { getByText } = renderWithTheme(
      <ServiceCard {...mockProps} />
    );

    const bookButton = getByText('Book Now');
    fireEvent.press(bookButton);
    // Add assertions for booking handler once implemented
  });

  it('is accessible', () => {
    const { getByLabelText } = renderWithTheme(
      <ServiceCard {...mockProps} />
    );

    // Test main card accessibility
    const card = getByLabelText(
      `${mockProps.providerName}, ${mockProps.serviceName}. Rating: ${mockProps.rating} out of 5. ${mockProps.distance} away`
    );
    expect(card).toBeTruthy();

    // Test provider avatar accessibility
    const avatar = getByLabelText(`${mockProps.providerName}'s avatar`);
    expect(avatar).toBeTruthy();

    // Test booking button accessibility
    const bookButton = getByLabelText('Book Now');
    expect(bookButton).toBeTruthy();
  });
});