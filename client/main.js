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
  Show House
  ---------------------------------------------------------------------------------
 */

Template.showHouse.helpers({
  house() {
    return Houses.findOne({ _id: Session.get(SELECTED_HOUSE_ID) });
  }
});


Template.showHouse.events({
  'click button#delete': function (evt) {
    var id = this._id;
    var deleteConfirmation = confirm('Really delete this house?');
    if (deleteConfirmation) {
      Houses.remove(id);
    }
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
    Houses.update({
      _id: Session.get(SELECTED_HOUSE_ID)
    }, {
        $set: {
          lastvisit: lastvisit
        }
      });
  }
});



/*
  House form
  ---------------------------------------------------------------------------------
 */

Template.houseForm.events({
  'click button#saveHouse': function (evt) {
    evt.preventDefault();
    var houseName = $('input[id=house-name]').val();
    var plantColor = $('input[id=plant-color]').val();
    var plantInstructions = $('input[id=plant-instructions]').val();
    Session.set('selectedHouseId', Houses.insert({
      name: houseName,
      plants: [{
        color: plantColor,
        instructions: plantInstructions
      }]
    }));
    // empty the form
    $('input').val('');
  }
});

