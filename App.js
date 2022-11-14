import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Game from './Game';

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Game />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default App;
