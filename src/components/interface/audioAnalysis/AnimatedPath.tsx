import { useSpring, animated } from 'react-spring';

export function AnimatedPath({ d } : {d: string}) {
  const styles = useSpring({
    d,
  });

  return <animated.path {...styles} stroke="cornflowerblue" fill="none" strokeWidth={1} opacity={1} />;
}
