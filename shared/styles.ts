const breakpoints = [1200, 768];
export const mq = breakpoints.map(
  bp => `@media (max-width: ${bp}px)`
);

export const colors = {
  primary: '#1FB954',
  background: '#121212',
  backgroundLight: '#282828',
  backgroundDark: '#040404',
  primaryText: 'white',
  secondaryText: '#B3B3B3',
};
