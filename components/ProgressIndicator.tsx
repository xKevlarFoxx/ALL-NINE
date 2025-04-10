import React from 'react';
  import { View, StyleSheet } from 'react-native';
  import { MotiView } from 'moti';

  interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
    completedSteps: number[];
  }

  const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps, completedSteps }) => {
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <MotiView
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                completedSteps.includes(index) && styles.progressDotCompleted
              ]}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                backgroundColor:
                  index === currentStep
                    ? 'rgba(255,255,255,1)'
                    : completedSteps.includes(index)
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(255,255,255,0.3)'
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            />
            {index < totalSteps - 1 && (
              <View style={[styles.progressLine, index < currentStep && styles.progressLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  export default ProgressIndicator;

  const styles = StyleSheet.create({
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32
    },
    progressDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'rgba(255,255,255,0.3)',
      marginHorizontal: 4
    },
    progressDotActive: {
      backgroundColor: 'rgba(255,255,255,1)'
    },
    progressDotCompleted: {
      backgroundColor: 'rgba(255,255,255,0.8)'
    },
    progressLine: {
      width: 20,
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginHorizontal: 4
    },
    progressLineActive: {
      backgroundColor: 'rgba(255,255,255,0.8)'
    }
  });