import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
const normalizeVector = vector => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return { x: vector.x / length, y: vector.y / length };
};
const BALL_SIZE = 25;
const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 14;

const islandDimensions = { x: 150, y: 11, w: 127, h: 37 };

const App = () => {
  const { width, height } = useWindowDimensions();
  const targetPositionX = useSharedValue(100);
  const targetPositionY = useSharedValue(100);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );

  useEffect(() => {
    setInterval(updatePosition, DELTA);
    return () => clearInterval(updatePosition);
  }, []);
  const updatePosition = () => {
    let nextPos = getPosition(direction.value);
    if (nextPos.x < 0 || nextPos.x > width - BALL_SIZE) {
      const newValue = { x: -direction.value.x, y: direction.value.y };
      direction.value = newValue;
      nextPos = getPosition(newValue);
    }
    if (nextPos.y < 0 || nextPos.y > height - BALL_SIZE) {
      const newValue = { x: direction.value.x, y: -direction.value.y };
      direction.value = newValue;
      nextPos = getPosition(newValue);
    }
    if (
      nextPos.x < islandDimensions.x + islandDimensions.w &&
      nextPos.x + BALL_SIZE > islandDimensions.x &&
      nextPos.y < islandDimensions.y + islandDimensions.h &&
      nextPos.y + BALL_SIZE > islandDimensions.y
    ) {
      if (
        targetPositionX.value < islandDimensions.x ||
        targetPositionX.value > islandDimensions.x + islandDimensions.w
      ) {
        const newValue = { x: -direction.value.x, y: direction.value.y };
        direction.value = newValue;
        nextPos = getPosition(newValue);
      } else {
        const newValue = { x: direction.value.x, y: -direction.value.y };
        direction.value = newValue;
        nextPos = getPosition(newValue);
      }
    }

    targetPositionX.value = withTiming(nextPos.x, {
      duration: DELTA,
      easing: Easing.linear,
    });
    targetPositionY.value = withTiming(nextPos.y, {
      duration: DELTA,
      easing: Easing.linear,
    });
  };

  const getPosition = direction => {
    return {
      x: targetPositionX.value + direction.x * SPEED,
      y: targetPositionY.value + direction.y * SPEED,
    };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: targetPositionY.value,
      left: targetPositionX.value,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Animated.View style={[styles.ball, animatedStyle]} />
      <View
        style={{
          width: islandDimensions.w,
          height: islandDimensions.h,
          backgroundColor: 'black',
          borderRadius: 20,
          position: 'absolute',
          top: islandDimensions.y,
          left: islandDimensions.x,
        }}
      ></View>
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
    width: BALL_SIZE,
    aspectRatio: 1,
    borderRadius: 25,
    position: 'absolute',
  },
});
export default App;
