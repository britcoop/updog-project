const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//schema is a constructor so you need a new instance of it
const PetSchema = new Schema({
	name: String,
	photo: String,
	description: String,
	score: Number
});

module.exports = mongoose.model('Pet', PetSchema);