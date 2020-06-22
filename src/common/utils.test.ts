import { updateObject } from './utils'

describe('testing updateObject', () => {
  const contactInfo = {
    name: 'Ironman',
    status: 'alive'
  }

  const updateStatus = {
    status: 'dead'
  }

  test('it should merge the arrays correctly', () => {
    const updatedValues = updateObject(contactInfo, updateStatus);
    expect(updatedValues.status).toBe('dead');
  });
});