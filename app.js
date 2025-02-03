const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const userModel = require('./models/user');
const blogModel = require('./models/blog');
const path = require('path');
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const user = require('./models/user');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(cookieParser())

// Configure session and flash
app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
    })
);
app.use(flash());

app.get('/', (req, res) => {
    const successMessage = req.flash('success');
    const successMessagelogin = req.flash('success-login');
    const error = req.flash('error');

    const isLoggedIn = req.user ? true : false;

    res.render("index", { 
        successMessage, 
        successMessagelogin, 
        error,
        isLoggedIn
    });
});

app.post('/login', async (req, res) => {
    let user = await userModel.findOne({email: req.body.email});
    if (!user){
        req.flash('error', 'something went wrong');
        return res.redirect('/')
    }

    bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (result) {
            let token = jwt.sign({email: req.body.email}, "secret key");
            res.cookie("token", token);
            res.cookie("user",req.body.email)
            req.flash('success-login', 'Succesfully logged in!');
            res.redirect('/'); 
        } else {
            req.flash('error','something went wrong')
            res.redirect('/');
        }
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie("token"); 
    res.clearCookie("user"); 
    res.redirect("/"); 
});


app.get('/createUser', (req, res) => {
    res.render("createUser");
});

app.post('/createUserr', (req, res) => {
    let { username, email, password, age } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return res.status(500).send("Error generating salt");
        }
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                return res.status(500).send("Error hashing password");
            }
            try {
                await userModel.create({
                    username,
                    email,
                    password: hash,
                    age,
                });
                let token = jwt.sign({ email: email }, "secret key");
                res.cookie("token", token); // Set the token cookie
                req.flash('success', 'User registered successfully'); // Flash message
                res.redirect('/'); 
            } catch (err) {
                console.log(err);
                res.status(500).send("Error registering user");
            }
        });
    });
});


app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/createBlog', (req, res) => {
    const loggedIn = req.cookies.token
    if(loggedIn)
        res.render('write', { successBlogWrite: null }); 
    else {
        req.flash('error', 'User not signed in!');
        res.redirect("/"); 
    }
});

app.post('/createBlog', async (req, res) => {
    const { btitle, bcontent } = req.body
    const email = req.cookies.user
    const date = new Date()
    
    let createdBlog = await blogModel.create({
        btitle,
        bcontent,
        email,
        date
    })
    res.render('write', { successBlogWrite: "Blog successfully added!" });
});

app.get("/read", async(req,res) =>{
    const loggedIn = req.cookies.token
    const updateBlog = null
    if(loggedIn){ 
        let allBlogs = await blogModel.find()
        res.render("read",{blogs:allBlogs,user:req.cookies.user,updateBlog})
    }
    else {
        req.flash('error', 'User not signed in!');
        res.redirect("/"); 
    }
})

app.get("/editBlog/:id",async(req,res)=>{
    let Blog = await blogModel.findOne({_id:req.params.id})
    res.render("edit",{Blog,updateBlog:null})
})

app.post("/editBlog/:id",async(req,res)=>{
    const { btitle, bcontent } = req.body
    const { id } = req.params
    const date = new Date()
    let Blog = await blogModel.findByIdAndUpdate(id,{btitle,bcontent,date})
    let allBlogs = await blogModel.find()
    res.render("read",{blogs:allBlogs,user:req.cookies.user,updateBlog:"Blog Updated!"})
})

app.get("/deleteBlog/:id",async(req,res)=>{
        await blogModel.findOneAndDelete({_id:req.params.id})
        res.redirect("/read")
})

app.get("/readmore/:id",async(req,res)=>{
    let Blog = await blogModel.findOne({_id:req.params.id})
    res.render("readmore",{Blog})
})


app.get('/contact', (req, res) => {
    res.render("contact");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
