// constants/styles.ts
import { StyleSheet } from 'react-native';
import { palette } from './DesignSystem/colors';
import { spacing } from './DesignSystem/spacing';
import { typography } from './DesignSystem/typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[50], // Light background
    padding: spacing.md,
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  headerText: {
    ...typography.h2,
    color: palette.grey[900], // Dark text
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300], // Light border
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
    color: palette.grey[900], // Dark text
  },
  invalidInput: {
    borderColor: palette.error.main,
  },
  button: {
    backgroundColor: palette.primary.main,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonText: {
    ...typography.button,
    color: palette.primary.contrast,
  },
  linkText: {
    ...typography.body1,
    color: palette.primary.main,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: palette.error.main,
    marginBottom: spacing.xs,
  },
});

export default styles;