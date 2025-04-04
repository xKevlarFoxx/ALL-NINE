// colors.ts

const colors = {
  primary: {
    main: '#49777B',
    light: '#6B959A',
    dark: '#385B5E',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#D4800C',
    light: '#F67103',
    dark: '#B36A0A', 
    contrastText: '#FFFFFF'
  },
  grey: {
    50: '#F7F4E6',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#FFA726',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000'
  },
  success: {
    main: '#66BB6A',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    gradient: ['#49777B', '#D4800C']
  },
  light: {
    icon: '#757575',
  },
  dark: {
    icon: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
 } as const;
 
 export type Colors = typeof colors;
 export { colors };