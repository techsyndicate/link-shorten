const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = { type: String, required: true };

const ballerSchema = new Schema({
    cause: reqString,
    effect: reqString,
})

module.exports = mongoose.model("Baller", ballerSchema)