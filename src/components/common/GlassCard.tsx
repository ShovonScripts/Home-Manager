import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

interface GlassCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  enableShine?: boolean;
  enableAnimation?: boolean;
  delay?: number;
  enableHaptic?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  containerStyle,
  onPress,
  enableShine = true,
  enableAnimation = true,
  delay = 0,
  enableHaptic = true,
  ...props
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const glassBackground = isDark
    ? 'rgba(28, 32, 38, 0.72)'
    : 'rgba(255, 255, 255, 0.88)';

  const glassBorderColor = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(255, 255, 255, 0.80)';

  const shineGradientColors = isDark
    ? (['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.01)', 'transparent'] as const)
    : (['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.10)', 'transparent'] as const);

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: glassBackground,
          borderColor: glassBorderColor,
        },
        style,
      ]}
    >
      {enableShine && (
        <LinearGradient
          colors={shineGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );

  const innerElement = onPress ? (
    <AnimatedPressable
      onPress={onPress}
      enableHaptic={enableHaptic}
      style={{ flex: 1 }}
      {...props}
    >
      {cardContent}
    </AnimatedPressable>
  ) : (
    cardContent
  );

  if (enableAnimation) {
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(delay).springify()}
        style={containerStyle}
      >
        {innerElement}
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{innerElement}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
});
