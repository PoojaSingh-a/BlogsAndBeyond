const mongoose = require('mongoose')
mongoose.connect(`mongodb+srv://poojasingh3084a:ps123@blogsandbeyond.pjnu5.mongodb.net/?retryWrites=true&w=majority&appName=BlogsAndBeyond`)

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age: Number
})

module.exports = mongoose.model("user",userSchema)

