const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reqString = { type: String, required: true };

const linkSchema = new Schema({
    name: reqString,
    backlink: reqString,
    link: reqString,
    date:reqString
})

module.exports = mongoose.model("Link", linkSchema)