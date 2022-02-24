const router = require("express").Router();
const User = require("../models/user");
const isAuth = require('../routes/middleware');

const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');


router.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    oldInput: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});

router.get('/dashboard', isAuth,(req, res) => {
  res.render('dashboard');
})
router.post(
  "/register",
  [
    body("email").isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, {req}) => {
        return User.findOne({email: value})
        .then(user => {
            if(user){
                return Promise.reject('E-Mail already exists, Please pick a different one.')
            }
        })
    })
    .normalizeEmail(),
    body(
        "password",
        "Enter a password with only numbers and characters and at leaset 5 characters"
    )
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('password2')
    .trim()
    .custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords have to match!');
        }
        return true;
    })
  ],
   async (req, res) => {
    const { name, email, password, password2 } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("register", {
        title: "Register",
        oldInput: {
          name: name,
          email: email,
          password: password,
          confirmPassword: password2,
        },
      });
    }
    const hashPassword = await bcrypt.hash(password,12);
    const user = new User({name, email, password:hashPassword});
    await user.save();
    res.redirect('/login');
  }
);

router.post('/login',async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({email:email});
    if(!user){
        return res.redirect('/login');
    }
    const matchedPass = await bcrypt.compare(password,user.password);
    if(!matchedPass){
        return res.redirect('/login');
    }

    req.session.isAuth = true;
    res.redirect('/dashboard');

})

router.post('/logout',(req, res) => {
  req.session.destroy(err => {
    if(err) throw err;
    res.redirect('/')
  })
})
module.exports = router;
