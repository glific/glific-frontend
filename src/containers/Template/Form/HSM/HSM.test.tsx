import React from 'react';
import {HSM} from './HSM'
import { shallow } from "enzyme"


const hsm = <HSM match={{ params: { id: null } }} />
test('it renders HSM Component', () => {
  const wrapper = shallow(hsm)
  expect(wrapper.exists()).toBe(true)
})