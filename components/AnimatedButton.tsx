import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Bot, MapPin, LucideIcon } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ai' | 'love';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: 'heart' | 'bot' | 'map-pin' | 'none';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  icon = 'none'
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    pressed.value = withSpring(1);
    shine.value = withTiming(1, { duration: 600 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    pressed.value = withSpring(0);
    shine.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const shineStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shine.value,
      [0, 1],
      [-100, 200]
    );

    return {
      transform: [{ translateX }],
      opacity: shine.value * 0.6,
    };
  });

  const getButtonColors = (): [string, string] => {
    switch (variant) {
      case 'ai':
        return ['#667eea', '#764ba2'];
      case 'love':
        return ['#ff6b6b', '#ff8e8e'];
      case 'secondary':
        return ['#f8f9fa', '#e9ecef'];
      default:
        return ['#4CAF50', '#45a049'];
    }
  };

  const getTextColor = () => {
    return variant === 'secondary' ? '#333' : '#fff';
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16, fontSize: 18 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 };
    }
  };

  const sizeStyle = getSize();

  const renderIcon = () => {
    const iconSize = size === 'large' ? 20 : size === 'small' ? 14 : 16;
    const iconColor = getTextColor();
    
    switch (icon) {
      case 'heart':
        return <Heart size={iconSize} color={iconColor} fill={iconColor} style={{ marginRight: 8 }} />;
      case 'bot':
        return <Bot size={iconSize} color={iconColor} style={{ marginRight: 8 }} />;
      case 'map-pin':
        return <MapPin size={iconSize} color={iconColor} style={{ marginRight: 8 }} />;
      default:
        return null;
    }
  };

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle, { opacity: disabled ? 0.6 : 1 }]}
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <LinearGradient
        colors={getButtonColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, {
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        }]}
      >
        {/* Shine Effect */}
        <Animated.View style={[styles.shine, shineStyle]} />
        
        <Animated.View style={styles.buttonContent}>
          {renderIcon()}
          <Text style={[
            styles.text, 
            { color: getTextColor(), fontSize: sizeStyle.fontSize }
          ]}>
            {title}
          </Text>
        </Animated.View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  text: {
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
