import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useState, useEffect } from 'react';
const normalizeVector = vector => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return { x: vector.x / length, y: vector.y / length };
};
const FPS = 60;
const DELTA = 1 / FPS;
const SPEED = 30;
const BALL_WIDTH = 25;
const App = () => {
  const { width, height } = useWindowDimensions();

  const targetPositionX = useSharedValue(200);
  const targetPositionY = useSharedValue(200);

  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );

  const updatePosition = () => {
    let nextPos = nextPosition(direction.value);

    if (nextPos.y < 0 || nextPos.y > height - BALL_WIDTH) {
      const newDirection = { x: direction.value.x, y: -direction.value.y };
      direction.value = newDirection;
      nextPos = nextPosition(newDirection);
    }
    if (nextPos.x < 0 || nextPos.x > width - BALL_WIDTH) {
      const newDirection = { x: -direction.value.x, y: direction.value.y };
      direction.value = newDirection;
      nextPos = nextPosition(newDirection);
    }

    targetPositionX.value = withTiming(nextPos.x, {
      duration: DELTA * 1000,
      easing: Easing.linear,
    });
    targetPositionY.value = withTiming(nextPos.y, {
      duration: DELTA * 1000,
      easing: Easing.linear,
    });
  };
  const nextPosition = direction => {
    return {
      x: targetPositionX.value + direction.x * SPEED,
      y: targetPositionY.value + direction.y * SPEED,
    };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: targetPositionX.value,
      top: targetPositionY.value,
    };
  });
  useEffect(() => {
    const interval = setInterval(updatePosition, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Animated.View style={[styles.ball, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    backgroundColor: 'black',
    width: BALL_WIDTH,
    aspectRatio: 1,
    borderRadius: 25,
    position: 'absolute',
  },
});
export default App;
