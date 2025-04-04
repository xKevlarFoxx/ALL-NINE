// animations.ts
import { Easing } from 'react-native-reanimated';

export const animations = {
 easing: {
   default: Easing.bezier(0.4, 0, 0.2, 1),
   linear: Easing.linear,
   easeIn: Easing.bezier(0.4, 0, 1, 1),
   easeOut: Easing.bezier(0, 0, 0.2, 1),
   easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
 },
 duration: {
   shortest: 150,
   shorter: 200,
   short: 250,
   standard: 300,
   complex: 375,
   enteringScreen: 225,
   leavingScreen: 195,
 },
};