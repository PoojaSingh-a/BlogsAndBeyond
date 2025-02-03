const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://poojasingh3084a:ps123@blogsandbeyond.pjnu5.mongodb.net/?retryWrites=true&w=majority&appName=BlogsAndBeyond`)

const blogSchema = mongoose.Schema({
    email: String,
    btitle: String,
    bcontent: String,
    date: Date
})

module.exports = mongoose.model("blog",blogSchema)

