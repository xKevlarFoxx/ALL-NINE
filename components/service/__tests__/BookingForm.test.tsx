import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { BookingForm } from '../BookingForm';
import { ThemeProvider } from '../../ThemeProvider';
import { View } from 'react-native';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = ({ testID, value, onChange }: any) => {
    return (
      <View
        testID={testID}
        onTouchEnd={(e: any) => {
          const mockDate = new Date(value);
          mockDate.setHours(mockDate.getHours() + 1);
          onChange(e, mockDate);
        }}
      />
    );
  };
  return MockDateTimePicker;
});

describe('BookingForm', () => {
  const mockOnSubmit = jest.fn();
  const mockProps = {
    onSubmit: mockOnSubmit,
    loading: false,
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

  it('renders all form fields correctly', () => {
    const { getByLabelText } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    expect(getByLabelText('Selected date')).toBeTruthy();
    expect(getByLabelText('Selected time')).toBeTruthy();
    expect(getByLabelText('Additional notes')).toBeTruthy();
  });

  it('handles date selection', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    const dateInput = getByLabelText('Selected date');
    fireEvent(dateInput, 'focus');

    const datePicker = getByTestId('dateTimePicker');
    const newDate = new Date('2025-05-01');
    
    await act(async () => {
      fireEvent(datePicker, 'onChange', { nativeEvent: { timestamp: newDate.getTime() } }, newDate);
    });

    expect(dateInput.props.value).toContain('May 01, 2025');
  });

  it('handles time selection', async () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    const timeInput = getByLabelText('Selected time');
    fireEvent(timeInput, 'focus');

    const timePicker = getByTestId('dateTimePicker');
    const newTime = new Date();
    newTime.setHours(14, 30, 0, 0);
    
    await act(async () => {
      fireEvent(timePicker, 'onChange', { nativeEvent: { timestamp: newTime.getTime() } }, newTime);
    });

    expect(timeInput.props.value).toContain('02:30 PM');
  });

  it('validates future dates', async () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    const dateInput = getByLabelText('Selected date');
    fireEvent(dateInput, 'focus');

    const datePicker = getByTestId('dateTimePicker');
    const pastDate = new Date('2024-01-01');
    
    await act(async () => {
      fireEvent(datePicker, 'onChange', { nativeEvent: { timestamp: pastDate.getTime() } }, pastDate);
    });

    const confirmButton = getByText('Confirm Booking');
    fireEvent.press(confirmButton);

    expect(getByText('Please select a future date')).toBeTruthy();
  });

  it('validates time slots', async () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    // Set valid future date first
    const dateInput = getByLabelText('Selected date');
    fireEvent(dateInput, 'focus');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    await act(async () => {
      fireEvent(getByTestId('dateTimePicker'), 'onChange', 
        { nativeEvent: { timestamp: futureDate.getTime() } }, 
        futureDate
      );
    });

    // Try to set an invalid time
    const timeInput = getByLabelText('Selected time');
    fireEvent(timeInput, 'focus');
    const invalidTime = new Date();
    invalidTime.setHours(1, 0, 0, 0); // 1 AM - outside business hours
    
    await act(async () => {
      fireEvent(getByTestId('dateTimePicker'), 'onChange',
        { nativeEvent: { timestamp: invalidTime.getTime() } },
        invalidTime
      );
    });

    const confirmButton = getByText('Confirm Booking');
    fireEvent.press(confirmButton);

    expect(getByText('Please select a valid time')).toBeTruthy();
  });

  it('handles form submission with valid data', async () => {
    const { getByLabelText, getByTestId, getByText } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    // Set valid date
    const dateInput = getByLabelText('Selected date');
    fireEvent(dateInput, 'focus');
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 1);
    
    await act(async () => {
      fireEvent(getByTestId('dateTimePicker'), 'onChange',
        { nativeEvent: { timestamp: validDate.getTime() } },
        validDate
      );
    });

    // Set valid time
    const timeInput = getByLabelText('Selected time');
    fireEvent(timeInput, 'focus');
    const validTime = new Date();
    validTime.setHours(14, 30, 0, 0); // 2:30 PM
    
    await act(async () => {
      fireEvent(getByTestId('dateTimePicker'), 'onChange',
        { nativeEvent: { timestamp: validTime.getTime() } },
        validTime
      );
    });

    // Add notes
    const notesInput = getByLabelText('Additional notes');
    fireEvent.changeText(notesInput, 'Test booking notes');

    // Submit form
    const confirmButton = getByText('Confirm Booking');
    fireEvent.press(confirmButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      notes: 'Test booking notes',
    }));
  });

  it('handles loading state', () => {
    const { getByText } = renderWithTheme(
      <BookingForm {...mockProps} loading={true} />
    );

    const confirmButton = getByText('Confirm Booking');
    expect(confirmButton.props.disabled).toBe(true);
  });

  it('is accessible', () => {
    const { getByLabelText, getAllByRole } = renderWithTheme(
      <BookingForm {...mockProps} />
    );

    expect(getByLabelText('Selected date')).toBeTruthy();
    expect(getByLabelText('Selected time')).toBeTruthy();
    expect(getByLabelText('Additional notes')).toBeTruthy();

    const buttons = getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button.props.accessibilityLabel).toBeTruthy();
      expect(button.props.accessibilityHint).toBeTruthy();
    });
  });
});