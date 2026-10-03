import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const AmbientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeMode, colors } = useTheme();
  const isDark = themeMode === 'dark';

  const orb1Colors = isDark
    ? (['rgba(120, 90, 255, 0.18)', 'rgba(120, 90, 255, 0.02)', 'transparent'] as const)
    : (['rgba(98, 14, 234, 0.12)', 'rgba(98, 14, 234, 0.02)', 'transparent'] as const);

  const orb2Colors = isDark
    ? (['rgba(3, 218, 198, 0.15)', 'rgba(3, 218, 198, 0.01)', 'transparent'] as const)
    : (['rgba(3, 218, 198, 0.10)', 'rgba(3, 218, 198, 0.01)', 'transparent'] as const);

  const orb3Colors = isDark
    ? (['rgba(255, 112, 67, 0.12)', 'rgba(255, 112, 67, 0.01)', 'transparent'] as const)
    : (['rgba(255, 112, 67, 0.08)', 'rgba(255, 112, 67, 0.01)', 'transparent'] as const);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Ambient Color Orbs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top Right Orb */}
        <LinearGradient
          colors={orb1Colors}
          style={styles.orbTopRight}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Mid Left Orb */}
        <LinearGradient
          colors={orb2Colors}
          style={styles.orbMidLeft}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Bottom Right Orb */}
        <LinearGradient
          colors={orb3Colors}
          style={styles.orbBottomRight}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
  },
  orbMidLeft: {
    position: 'absolute',
    top: height * 0.35,
    left: -100,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
  },
});
