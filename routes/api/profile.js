const router = require('express').Router();
const passport = require('passport');
const validateProfile = require('../../validation/profile');
const validateExperience = require('../../validation/experience');
const validateEducation = require('../../validation/education');
const Profile = require('../../models/Profile')
const User = require('../../models/User');



router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.nonprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json(err))
});

// Get all profiles
router.get('/all', (req, res) => {
  const errors = {}

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json({
        result: profiles.length,
        profiles 
      });
    }).catch(err => {
      res.status(404).json({ 
        profile: 'There is no profile for this user' });
    });
})

// Profile handle
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// Create Profile
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfile(req.body);

  // Check Validations
  if (!isValid) {
    return res.status(400).json(errors);
  }
  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;

  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  // Skills - Split into array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',')
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.telegram) profileFields.social.telegram = req.body.telegram;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
  
  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
        // Update
      Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      ).then(profile => res.json(profile));
    } else {
      // Create

      // Check if hadnle exists
      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = 'That handle already exists';
          res.status(400).json(errors);
        }

        // Save profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      })
      }
    })
});

// Create Profile experience
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperience(req.body);

  // Check Validations
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile))
    })
});

// Delete Profile experience
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
        // get removed index
      const removedIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);
      
      // Splice out of array
      profile.experience.splice(removedIndex, 1);

      // save
      profile.save().then(profile => res.json(profile));
    })
});

// Create Profile education
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducation(req.body);

  // Check Validations
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile))
    })
});

// Delete Profile experience
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
        // get removed index
      const removedIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
      
      // Splice out of array
      profile.education.splice(removedIndex, 1);

      // save
      profile.save().then(profile => res.json(profile));
    })
});

// Delte Profile and User
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndRemove({ user: req.user_id })
    .then(() => {
        User.findOneAndRemove({_id: req.user.id}).then(() => res.json({success: true}))
    })
})




module.exports = router;