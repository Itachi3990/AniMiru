/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockComponent = ({ children, style, ...rest }: { children?: React.ReactNode; style?: any }) => (
    <View style={style} {...rest}>
      {children}
    </View>
  );

  return {
    __esModule: true,
    default: MockComponent,
    Svg: MockComponent,
    Defs: MockComponent,
    RadialGradient: MockComponent,
    Stop: MockComponent,
    Rect: MockComponent,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
