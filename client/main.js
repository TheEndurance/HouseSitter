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
    return LocalHouses.findOne({ _id: Session.get(SELECTED_HOUSE_ID) });
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
  'keyup #house-name'(evt) {
    evt.preventDefault();
    const modifier = { $set: { name: evt.target.value } };
    updateLocalHouse(Session.get(SELECTED_HOUSE_ID), modifier);
  },
  'click button.addPlant'(evt) {
    evt.preventDefault();
    const newPlant = { color: '', instructions: '' };
    const modifier = { $push: { plants: newPlant } };
    updateLocalHouse(Session.get(SELECTED_HOUSE_ID), modifier);
  },
  'click button#save-house'(evt) {
    evt.preventDefault();
    const id = Session.get(SELECTED_HOUSE_ID);
    const modifier = { $set: { 'lastsave': new Date() } };
    updateLocalHouse(id, modifier);
    Houses.upsert({ _id: id }, LocalHouses.findOne(id));
  }
});

Template.plantFieldset.events({
  'keyup input.color, keyup input.instructions'(evt) {
    evt.preventDefault();
    const index = evt.target.getAttribute('data-index');
    const field = evt.target.getAttribute('class');
    const plants = `plants.${index}.${field}`;
    const modifier = { $set: {} };
    modifier['$set'][plants] = evt.target.value;
    updateLocalHouse(Session.get(SELECTED_HOUSE_ID), modifier);
  },
  'click button.removePlant'(evt) {
    evt.preventDefault();
    const id = Session.get(SELECTED_HOUSE_ID);
    const index = evt.target.getAttribute('data-index');
    const plants = LocalHouses.findOne(id).plants;
    plants.splice(index, 1);
    const modifier = { $set: { 'plants': plants } };
    updateLocalHouse(id, modifier);
  }
});


updateLocalHouse = function (id, modifier) {
  LocalHouses.update({ _id: id }, modifier);
}