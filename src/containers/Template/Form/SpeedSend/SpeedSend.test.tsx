import React from 'react';
import { SpeedSend } from './SpeedSend';
import { shallow } from "enzyme"

const speedSend = <SpeedSend match={{ params: { id: null } }} />

test('it renders Speedsend Component', () => {
  const wrapper = shallow(speedSend)
  expect(wrapper.exists()).toBe(true)
})

 