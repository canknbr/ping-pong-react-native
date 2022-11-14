import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  View,
  Text,
  Button,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';

const normalizeVector = vector => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return { x: vector.x / length, y: vector.y / length };
};
const BALL_SIZE = 25;
const FPS = 60;
const DELTA = 1000 / FPS;
const SPEED = 10;

const islandDimensions = { x: 150, y: 11, w: 127, h: 37 };

const Game = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { width, height } = useWindowDimensions();
  const PlayerDimensions = {
    w: width / 2,
    h: 37,
  };
  const targetPositionX = useSharedValue(100);
  const targetPositionY = useSharedValue(100);
  const direction = useSharedValue(
    normalizeVector({ x: Math.random(), y: Math.random() })
  );
  const playerPosition = useSharedValue({ x: width / 4, y: height - 100 });
  useEffect(() => {
    setInterval(() => {
      if (!gameOver) {
        updatePosition();
      }
    }, DELTA);
    return () => clearInterval(updatePosition);
  }, [gameOver]);
  const updatePosition = () => {
    let nextPos = getPosition(direction.value);
    let newValue = direction.value;
    if (nextPos.x > width - BALL_SIZE) {
      setGameOver(true);
    }
    // ball
    if (nextPos.y < 0) {
      newValue = { x: -direction.value.x, y: direction.value.y };
    }
    if (nextPos.y < 0 || nextPos.y > height - BALL_SIZE) {
      newValue = { x: direction.value.x, y: -direction.value.y };
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
        newValue = { x: -direction.value.x, y: direction.value.y };
      } else {
        newValue = { x: direction.value.x, y: -direction.value.y };
      }
      setScore(prevScore => prevScore + 1);
    }
    // player

    if (
      nextPos.x < playerPosition.value.x + PlayerDimensions.w &&
      nextPos.x + BALL_SIZE > playerPosition.value.x &&
      nextPos.y < playerPosition.value.y + PlayerDimensions.h &&
      nextPos.y + BALL_SIZE > playerPosition.value.y
    ) {
      if (
        targetPositionX.value < playerPosition.value.x ||
        targetPositionX.value > playerPosition.value.x + PlayerDimensions.w
      ) {
        newValue = { x: -direction.value.x, y: direction.value.y };
      } else {
        newValue = { x: direction.value.x, y: -direction.value.y };
      }
    }

    direction.value = newValue;
    nextPos = getPosition(newValue);
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
  const gestureHandler = useAnimatedGestureHandler({
    onStart: event => {},
    onActive: event => {
      playerPosition.value = {
        ...playerPosition.value,
        x: event.absoluteX - PlayerDimensions.w / 2,
      };
    },
  });
  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(playerPosition.value.x, {
        duration: DELTA,
        easing: Easing.linear,
      }),
    };
  });
  const restartGame = () => {
    targetPositionX.value = width / 2;
    targetPositionY.value = height / 2;
    setScore(0);
    setGameOver(false);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.score}>{score}</Text>
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOver}>Game Over</Text>
          <View
            style={{
              padding: 10,
              backgroundColor: 'white',
              borderRadius: 10,
            }}
          >
            <Button title="Restart" onPress={restartGame} />
          </View>
        </View>
      )}
      {!gameOver && <Animated.View style={[styles.ball, animatedStyle]} />}
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

      <Animated.View
        style={[
          {
            width: PlayerDimensions.w,
            height: PlayerDimensions.h,
            backgroundColor: 'black',
            borderRadius: 20,
            position: 'absolute',
            top: playerPosition.value.y,
          },
          playerAnimatedStyle,
        ]}
      ></Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={{
            width: '100%',
            height: 200,
            position: 'absolute',
            bottom: 0,
          }}
        ></Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',

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
  score: {
    position: 'absolute',
    top: 150,
    fontSize: 150,
    fontWeight: 'bold',
    color: 'lightblue',
  },
  gameOver: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'red',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 350,
  },
});
export default Game;
