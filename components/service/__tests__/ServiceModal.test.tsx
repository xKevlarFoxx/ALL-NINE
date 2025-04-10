import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ServiceModal } from '../ServiceModal';
import { ThemeProvider } from '../../ThemeProvider';

describe('ServiceModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const mockProps = {
    visible: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  const mockService = {
    id: '123',
    name: 'Test Service',
    description: 'Test Description',
    price: 100,
    duration: 60,
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

  it('renders correctly in create mode', () => {
    const { getByText, getByLabelText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    expect(getByText('Add Service')).toBeTruthy();
    expect(getByLabelText('Service name input')).toBeTruthy();
    expect(getByLabelText('Service description input')).toBeTruthy();
    expect(getByLabelText('Service price input')).toBeTruthy();
    expect(getByLabelText('Service duration input')).toBeTruthy();
  });

  it('renders correctly in edit mode', () => {
    const { getByText, getByDisplayValue } = renderWithTheme(
      <ServiceModal {...mockProps} initialService={mockService} />
    );

    expect(getByText('Edit Service')).toBeTruthy();
    expect(getByDisplayValue('Test Service')).toBeTruthy();
    expect(getByDisplayValue('Test Description')).toBeTruthy();
    expect(getByDisplayValue('100.00')).toBeTruthy();
    expect(getByDisplayValue('60')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText, getByLabelText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    const saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(getByText('Service name is required')).toBeTruthy();
    expect(getByText('Description is required')).toBeTruthy();
    expect(getByText('Price must be greater than 0')).toBeTruthy();
    expect(getByText('Duration must be at least 5 minutes')).toBeTruthy();
  });

  it('validates price format', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    const priceInput = getByLabelText('Service price input');
    fireEvent.changeText(priceInput, 'invalid');

    const saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(getByText('Price must be greater than 0')).toBeTruthy();
  });

  it('validates duration limits', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    const durationInput = getByLabelText('Service duration input');
    
    // Test minimum duration
    fireEvent.changeText(durationInput, '3');
    let saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });
    expect(getByText('Duration must be at least 5 minutes')).toBeTruthy();

    // Test maximum duration
    fireEvent.changeText(durationInput, '500');
    saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });
    expect(getByText('Duration cannot exceed 8 hours')).toBeTruthy();
  });

  it('handles successful form submission', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    // Fill in valid form data
    fireEvent.changeText(getByLabelText('Service name input'), 'New Service');
    fireEvent.changeText(getByLabelText('Service description input'), 'New Description');
    fireEvent.changeText(getByLabelText('Service price input'), '50');
    fireEvent.changeText(getByLabelText('Service duration input'), '30');

    const saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Service',
      description: 'New Description',
      price: 50,
      duration: 30,
    }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles cancel correctly', () => {
    const { getByText } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles loading state', () => {
    const { getByText } = renderWithTheme(
      <ServiceModal {...mockProps} loading={true} />
    );

    const saveButton = getByText('Save');
    const cancelButton = getByText('Cancel');
    expect(saveButton.props.disabled).toBe(true);
    expect(cancelButton.props.disabled).toBe(true);
  });

  it('is accessible', () => {
    const { getByLabelText, getAllByRole } = renderWithTheme(
      <ServiceModal {...mockProps} />
    );

    // Test form field accessibility
    expect(getByLabelText('Service name input')).toBeTruthy();
    expect(getByLabelText('Service description input')).toBeTruthy();
    expect(getByLabelText('Service price input')).toBeTruthy();
    expect(getByLabelText('Service duration input')).toBeTruthy();

    // Test button accessibility
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button.props.accessibilityLabel).toBeTruthy();
      expect(button.props.accessibilityHint).toBeTruthy();
    });

    // Test form accessibility
    const form = getByLabelText(/service form/i);
    expect(form).toBeTruthy();
  });
});