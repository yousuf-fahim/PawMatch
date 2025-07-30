import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface AnimatedLoaderProps {
  variant?: 'bars' | 'dots' | 'text' | 'paws';
  text?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function AnimatedLoader({ 
  variant = 'text', 
  text = 'Finding your paw-fect match...', 
  color = '#4CAF50',
  size = 'medium'
}: AnimatedLoaderProps) {
  
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  const sizeValue = getSizeValue();

  if (variant === 'bars') {
    return <BarLoader color={color} size={sizeValue} />;
  }

  if (variant === 'dots') {
    return <DotLoader color={color} size={sizeValue} />;
  }

  if (variant === 'paws') {
    return <PawLoader color={color} size={sizeValue} />;
  }

  return <TextLoader text={text} color={color} size={sizeValue} />;
}

function BarLoader({ color, size }: { color: string; size: number }) {
  const bars = Array.from({ length: 5 }, (_, i) => {
    const animatedValue = useSharedValue(0.3);
    
    React.useEffect(() => {
      animatedValue.value = withRepeat(
        withDelay(
          i * 100,
          withTiming(1, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: animatedValue.value,
      transform: [{ scaleY: animatedValue.value }],
    }));

    return (
      <Animated.View
        key={i}
        style={[
          styles.bar,
          {
            backgroundColor: color,
            width: size * 0.3,
            height: size,
            marginHorizontal: size * 0.1,
          },
          animatedStyle,
        ]}
      />
    );
  });

  return <View style={styles.barsContainer}>{bars}</View>;
}

function DotLoader({ color, size }: { color: string; size: number }) {
  const dots = Array.from({ length: 3 }, (_, i) => {
    const animatedValue = useSharedValue(1);
    
    React.useEffect(() => {
      animatedValue.value = withRepeat(
        withDelay(
          i * 200,
          withTiming(0.3, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: animatedValue.value,
      transform: [{ scale: animatedValue.value }],
    }));

    return (
      <Animated.View
        key={i}
        style={[
          styles.dot,
          {
            backgroundColor: color,
            width: size * 0.4,
            height: size * 0.4,
            marginHorizontal: size * 0.2,
          },
          animatedStyle,
        ]}
      />
    );
  });

  return <View style={styles.dotsContainer}>{dots}</View>;
}

function PawLoader({ color, size }: { color: string; size: number }) {
  const paws = ['🐾', '🐾', '🐾'];
  
  const animatedValues = paws.map(() => useSharedValue(0));
  
  React.useEffect(() => {
    animatedValues.forEach((value, i) => {
      value.value = withRepeat(
        withDelay(
          i * 300,
          withTiming(1, {
            duration: 800,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    });
  }, []);

  return (
    <View style={styles.pawsContainer}>
      {paws.map((paw, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: animatedValues[i].value,
          transform: [{ scale: animatedValues[i].value }],
        }));

        return (
          <Animated.Text
            key={i}
            style={[
              styles.pawEmoji,
              { fontSize: size },
              animatedStyle,
            ]}
          >
            {paw}
          </Animated.Text>
        );
      })}
    </View>
  );
}

function TextLoader({ text, color, size }: { text: string; color: string; size: number }) {
  const chars = text.split('');
  const animatedValues = chars.map(() => useSharedValue(1));
  
  React.useEffect(() => {
    const animateChars = () => {
      chars.forEach((_, i) => {
        animatedValues[i].value = withDelay(
          i * 50,
          withTiming(0.3, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          })
        );
      });
      
      setTimeout(() => {
        chars.forEach((_, i) => {
          animatedValues[i].value = withDelay(
            i * 50,
            withTiming(1, {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            })
          );
        });
      }, chars.length * 50 + 300);
    };

    const interval = setInterval(animateChars, 2000);
    animateChars(); // Start immediately
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.textContainer}>
      {chars.map((char, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: animatedValues[i].value,
        }));

        return (
          <Animated.Text
            key={i}
            style={[
              styles.textChar,
              {
                color,
                fontSize: size,
              },
              animatedStyle,
            ]}
          >
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 100,
  },
  pawsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawEmoji: {
    marginHorizontal: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textChar: {
    fontFamily: 'Poppins-Medium',
  },
});
