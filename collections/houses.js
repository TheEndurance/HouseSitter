import { Mongo } from 'meteor/mongo';

export const Houses = new Mongo.Collection("houses");
export const LocalHouses = new Mongo.Collection(null);