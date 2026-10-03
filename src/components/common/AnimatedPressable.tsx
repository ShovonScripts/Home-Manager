import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props extends TouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  enableHaptic?: boolean;
}

export const AnimatedPressable: React.FC<Props> = ({
  children,
  style,
  onPressIn,
  onPressOut,
  scaleValue = 0.97,
  enableHaptic = false,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(scaleValue, { damping: 15, stiffness: 300 });
    if (enableHaptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    // eslint-disable-next-line react-hooks/immutability
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
};
