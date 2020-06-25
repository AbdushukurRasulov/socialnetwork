const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();



// DB config
const db = require('./config/keys').mongoURI;
// connect to MongoDB
mongoose.connect(db, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

// ROUTES
app.use(passport.initialize());

// passport Config
require('./config/passport')(passport)

app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running port ${port}`))