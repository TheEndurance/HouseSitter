import { Meteor } from 'meteor/meteor';
import { Houses } from '../collections/houses.js';

Meteor.startup(() => {
  if (Houses.find().count() === 0) {
    const houses = [
      {
        name: 'Test',
        plants: [{
          color: 'red',
          instructions: '3 pots/week'
        }, {
          color: 'white',
          instructions: 'keep humid'
        }]
      }
    ]
    while (houses.length > 0) {
      Houses.insert(houses.pop());
    }
    console.log('Adding houses');
  }
});
