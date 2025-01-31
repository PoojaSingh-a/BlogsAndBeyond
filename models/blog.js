const mongoose = require('mongoose')
mongoose.connect(`mongodb://127.0.0.1:27017/blogWebsite`)

const blogSchema = mongoose.Schema({
    email: String,
    btitle: String,
    bcontent: String,
    date: Date
})

module.exports = mongoose.model("blog",blogSchema)

