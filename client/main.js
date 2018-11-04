import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { LocalHouses, Houses } from '../collections/houses.js';

import './main.html';

const newHouse = {
  name: '',
  plants: [],
  lastsave: 'never',
  status: 'unsaved'
}
const SELECTED_HOUSE_ID = 'selectedHouseId';
Session.setDefault(SELECTED_HOUSE_ID, '');

Template.registerHelper('selectedHouse', function () {
  return LocalHouses.findOne(Session.get(SELECTED_HOUSE_ID));
});

/*
  Select house
  ---------------------------------------------------------------------------------
 */
Template.selectHouse.helpers({
  housesNameId() {
    return Houses.find({}, { _id: 1, name: 1 });
  },
  isSelected() {
    return Session.equals(SELECTED_HOUSE_ID, this._id) ? 'selected' : '';
  }
});

Template.selectHouse.events({
  'change #selectHouse'(evt) {
    const selectedId = evt.currentTarget.value;
    let newId = LocalHouses.upsert(selectedId, Houses.findOne(selectedId) || newHouse).insertedId;
    if (!newId) newId = selectedId;
    Session.set(SELECTED_HOUSE_ID, newId);
  }
});


/*
  Plant details
  ---------------------------------------------------------------------------------
 */
Template.plantDetails.onCreated(function () {
  this.watered = new ReactiveVar();
  this.watered.set(false);
});


Template.plantDetails.helpers({
  isWatered: function () {
    var plantId = Session.get("selectedHouseId") + '-' + this.color;
    return Session.get(plantId) ? 'disabled' : '';
  }
});

Template.plantDetails.events({
  'click button.water': function (evt) {
    var plantId = $(evt.currentTarget).attr('data-id');
    Session.set(plantId, true);
    var lastvisit = new Date();
    HousesCollection.update({
      _id: Session.get("selectedHouseId")
    }, {
        $set: {
          lastvisit: lastvisit
        }
      });
  }
});