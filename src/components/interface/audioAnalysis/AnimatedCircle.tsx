/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSpring, animated } from 'react-spring';

export function AnimatedCircle({
  cx, cy, r, color,
} : {cx: number, cy: number, r: number, color: string}) {
  const styles = useSpring({
    cx,
    cy,
    r,
  });

  return <animated.circle {...styles} fill={color} />;
}
