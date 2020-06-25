const router = require('express').Router();
const gravatar = require('gravatar');
const brcypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const passport = require('passport');
const validateRegister = require('../../validation/register');
const validateLogin = require('../../validation/login');


// router.get('/', (req, res) => {
//   res.json({message: 'Users not implemented yer'})
// })

// register user
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegister(req.body)
  
  if (!isValid) {
    return res.status(400).json(errors )
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: 'Email already exists' })
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', //Rating
        d: 'mm' //Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      brcypt.genSalt(12, (err, salt) => {
        brcypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(user => res.json(user)).catch(err => console.log(err))
        })
      })
    }
  })

});

// login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const { errors, isValid } = validateLogin(req.body)
  
  if (!isValid) {
    return res.status(400).json(errors )
  }

  User.findOne({ email })
    .then(user => {
      // check user
      if (!user) {
        errors.email = 'User not found'
        return res.status(404).json(errors);
      }

      // Check password
      brcypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // User Matched

            const payload = { id: user.id, name: user.name, avatar: user.avatar };
            // Sign Token
            jwt.sign(payload, 'helloworld', { expiresIn: 3600 }, (err, token) => {
              res.json({
                status: 'success',
                token: 'Bearer ' + token
              })
            });
          } else {
            errors.password = 'Password incorrect'
            return res.status(400).json(errors)
          }
        })
    })
    .catch(err => console.log(err))
});

// get current
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user)
})

module.exports = router;