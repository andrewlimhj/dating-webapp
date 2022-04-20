/* -------------------------------------------------------------------------- */
/*                                 dating app                                 */
/* -------------------------------------------------------------------------- */

import express from 'express';
import Server from 'socket.io';
import { createServer } from 'http';

import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import moment from 'moment';
import authMiddleware from './middlewares/auth.middleware.js';
import { getHashedString, getHashWithSalt } from './hash.js';
import pool from './initPool.js';
import { MessageService } from './services/index.js';

const PORT = process.argv[2];

const messageService = new MessageService();

const envFilePath = '.env';
dotenv.config({ path: path.normalize(envFilePath) });

const multerUpload = multer({ dest: 'uploads/' });
const singleFileUpload = multerUpload.single('photo');

const app = express();
const http = createServer(app);
const io = new Server(http);

// serving the whole folder
const projectDirectory = './';
app.use(express.static(path.normalize(projectDirectory)));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static('uploads'));

/* ------------------------------- /home page ------------------------------- */

app.get('/', authMiddleware, (req, res) => {
  res.render('home');
});

// create header
// before login
// home
// sign-up
// login

// after login
// home
// profile
// discover

// create footer

/* ------------------------------ /sign up page ----------------------------- */
// header

app.get('/sign-up', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log('Already logged in');
    res.redirect('/profile');
    return;
  }

  const options = {
    method: 'GET',
    url: 'https://countriesnow.space/api/v0.1/countries',
  };

  const countryArray = [];

  axios
    .request(options)
    .then((result) => {
      const { data } = result.data;

      for (let i = 0; i < data.length; i += 1) {
        const { country } = data[i];
        countryArray.push(country);
      }

      return countryArray;
    })
    .then(() => {
      res.render('sign-up', { countryArray });
    })
    .catch((error) => {
      console.error(error.rows);
      res.status(503).send(error);
    });
});

app.post('/sign-up', authMiddleware, singleFileUpload, (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log('Already logged in');
    res.redirect('/profile');
    return;
  }
  const hashedPassword = getHashedString(req.body.password);
  console.log(req.file);

  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    hashedPassword,
    req.body.profession,
    req.body.gender,
    req.body.country,
    req.body.date_of_birth,
    req.file.filename,
  ];

  const sqlQuery =
    'INSERT INTO user_account (first_name, last_name, email, password, profession, gender, country, date_of_birth, photo_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';

  pool
    .query(sqlQuery, values)
    .then((result) => {
      console.log('result', result.rows[0]);
      res.redirect('/login');
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
});

// render a sign-up form
// first name
// last name
// gender
// email
// password
// profession
// city
// date of birth
// upload photo

// footer

/* ------------------------------- /login page ------------------------------ */
// header

app.get('/login', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log('Already logged in');
    res.redirect('/profile');
    return;
  }
  res.render('login');
});

// render login form
// email
// password

app.post('/login', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log('Already logged in');
    res.redirect('/profile');
    return;
  }

  const values = [req.body.email];

  const sqlQuery = 'SELECT * FROM user_account WHERE email=$1';

  pool
    .query(sqlQuery, values)
    .then((result) => {
      if (result.rows.length === 0) {
        console.log('No user with this email was found.');
        res.redirect('/login');
      }

      const user = result.rows[0];

      const hashedPasswordInDatabase = user.password;
      const hashedPasswordFromLogin = getHashedString(req.body.password);

      if (hashedPasswordInDatabase === hashedPasswordFromLogin) {
        const hashedCookieString = getHashWithSalt(user.id);

        res.cookie('LoggedIn', true);
        res.cookie('LoggedInHash', hashedCookieString);

        res.cookie('userId', user.id);

        res.redirect('/profile');
      } else {
        console.log('Email and password combination incorrect!');
        res.redirect('/login');
      }
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
});

// logs the user out
app.delete('/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('LoggedInHash');
  res.clearCookie('LoggedIn');
  res.redirect('/login');
});

// footer

/* ------------------------------ /profile page ----------------------------- */
app.get('/profile', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  const { userId } = req;
  console.log({ userId });

  const sqlQuery = `SELECT * FROM user_account WHERE id=${userId}`;

  pool
    .query(sqlQuery)
    .then((result) => {
      if (result.rows.length === 0) {
        console.log('No user was found.');
        res.redirect('/login');
      }

      const user = result.rows[0];
      const dateOfBirth = moment(user.date_of_birth).format('Do MMMM YYYY');

      console.log(user);
      res.render('profile', { user, dateOfBirth });
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
});

// create sidebar
// my profile
// discover
// list of likes
// list of conversations
// logout --> redirect to login

// render user a profile
// todo: edit profile
// todo: delete profile

// footer

/* ----------------------------- /discover page ----------------------------- */
// todo: connect unsplash API
// todo: render random users

app.get('/discover', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  const { userId } = req;
  console.log('userId', userId);

  const queryUser = `SELECT * FROM user_account WHERE id=${userId}`;

  const queryFemaleUsers = `SELECT * FROM user_account WHERE NOT EXISTS (SELECT NULL FROM matching WHERE from_user_account_id=${userId} AND to_user_account_id=user_account.id) AND gender='Female' LIMIT 1`;

  const queryMaleUsers = `SELECT * FROM user_account WHERE NOT EXISTS (SELECT NULL FROM matching WHERE from_user_account_id=${userId} AND to_user_account_id=user_account.id) AND gender='Male' LIMIT 1`;

  pool.query(queryUser).then((result) => {
    if (result.rows.length === 0) {
      console.log('No user was found.');
      res.redirect('/login');
    }

    const user = result.rows[0];
    console.log('user', user);
    const { gender } = user;
    console.log('Gender', gender);

    if (gender === 'Male') {
      pool
        .query(queryFemaleUsers)
        .then((femaleResult) => {
          const mate = femaleResult.rows[0];

          // todo: add unsplash API
          if (!mate) {
            res.send('Opps no more potential mates');
            return;
          }

          const age = moment().diff(mate.date_of_birth, 'years', false);

          console.log('female user:', mate);
          res.render('discover', { mate, age });
        })
        .catch((error) => {
          console.log('Error executing query', error.stack);
          res.status(503).send(error.rows);
        });
    } else {
      pool
        .query(queryMaleUsers)
        .then((maleResult) => {
          const mate = maleResult.rows[0];

          // todo: add unsplash API
          if (!mate) {
            res.send('Opps no more potential mates');
            return;
          }

          const age = moment().diff(mate.date_of_birth, 'years', false);

          console.log('male user:', mate);
          res.render('discover', { mate, age });
        })
        .catch((error) => {
          console.log('Error executing query', error.stack);
          res.status(503).send(error.rows);
        });
    }
  });
});

app.post('/discover', authMiddleware, (req, res) => {
  const { like } = req.body;
  const { skip } = req.body;
  const { mateId } = req.body;
  const { userId } = req;

  console.log('userId', userId);

  const likeQuery = `INSERT INTO matching (from_user_account_id, to_user_account_id, liked) VALUES (${userId}, ${mateId}, true) RETURNING *`;

  const skipQuery = `INSERT INTO matching (from_user_account_id, to_user_account_id, liked) VALUES (${userId}, ${mateId}, false) RETURNING *`;

  if (like) {
    console.log(like);
    console.log('mateId:', mateId);
    pool
      .query(likeQuery)
      .then((result) => {
        console.log('result', result.rows[0]);
        res.redirect('/discover');
      })
      .catch((error) => {
        console.log('Error executing query', error.stack);
        res.status(503).send(error.rows);
      });
  }

  if (skip) {
    console.log(skip);
    console.log('mateId:', mateId);
    pool
      .query(skipQuery)
      .then((result) => {
        console.log('result', result.rows[0]);
        res.redirect('/discover');
      })
      .catch((error) => {
        console.log('Error executing query', error.stack);
        res.status(503).send(error.rows);
      });
  }
});
// side bar
// render user b
// first name
// last name
// age
// profession
// city
// buttons
// like
// skip

// footer

/* --------------------------- /list of likes page -------------------------- */
// side bar

app.get('/likes', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  const { userId } = req;
  console.log('userId', userId);

  const sqlQuery = `SELECT * FROM user_account INNER JOIN matching ON user_account.id = to_user_account_id WHERE from_user_account_id=${userId} AND liked=true`;

  pool.query(sqlQuery).then((result) => {
    const likes = result.rows;
    const ageArray = [];

    for (let i = 0; i < likes.length; i += 1) {
      const age = moment().diff(likes[i].date_of_birth, 'years', false);
      ageArray.push(age);
    }

    res.render('likes', { likes, ageArray });
  });
});

// todo: unlike someone
// render list of liked profiles
// first name
// last name
// age
// profession
// city

// footer

/* ------------------------- /list of conversations ------------------------- */
app.get('/conversations', authMiddleware, (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  const { userId } = req;
  console.log('userId', userId);

  const fromUserQuery = `SELECT * FROM matching WHERE from_user_account_id=${userId} AND liked=true`;

  const toUserQuery = `SELECT * FROM matching WHERE to_user_account_id=${userId} AND liked=true`;

  const likesArray = [];

  pool
    .query(fromUserQuery)
    .then((result) => {
      const likes = result.rows;
      // console.log(likes);

      for (let i = 0; i < likes.length; i += 1) {
        // console.log(likes[i].to_user_account_id);
        likesArray.push(likes[i].to_user_account_id);
        // console.log(likesArray);
      }
    })
    .then(() => {
      pool.query(toUserQuery).then((result) => {
        const likedBack = result.rows;
        // console.log('likedBack', likedBack);

        for (let i = 0; i < likedBack.length; i += 1) {
          const likedBackUser = likedBack[i].from_user_account_id;
          // likedBackArray.push(likedBackUser);
          console.log('likedBackUser', likedBackUser);

          likesArray.forEach((userLikes) => {
            console.log('forEach');

            if (userLikes === likedBackUser) {
              let inMatchedTable = false;

              console.log('in the if statement');

              const checkMatchedQuery = `SELECT * FROM matched WHERE (a_user_account_id=${userId} AND b_user_account_id=${likedBackUser}) OR (a_user_account_id=${likedBackUser} AND b_user_account_id=${userId})`;

              pool
                .query(checkMatchedQuery)
                .then((checkResult) => {
                  const check = checkResult.rows[0];
                  console.log('inMatchedTable', inMatchedTable);

                  if (check) {
                    console.log('Check', check);
                    inMatchedTable = true;
                    console.log('Check Match Table One', inMatchedTable);
                  }
                })
                .then(() => {
                  if (inMatchedTable === false) {
                    const matchedQuery = `INSERT INTO matched (a_user_account_id, b_user_account_id) VALUES (${userId}, ${likedBackUser}) RETURNING *`;
                    pool.query(matchedQuery).then((matchedResult) => {
                      console.log('matched');
                      console.log(matchedResult.rows);
                    });
                  }
                });
            }
          });
        }
      });
    })
    .then(() => {
      const sqlQuery = `SELECT * from matched WHERE a_user_account_id=${userId} OR b_user_account_id=${userId}`;

      pool.query(sqlQuery).then((result) => {
        const matched = result.rows;
        const users = [];

        console.log('final result', matched);

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < matched.length; i++) {
          const element = matched[i];
          console.log('userId', userId);
          console.log('A', element.a_user_account_id);
          console.log('B', element.b_user_account_id);

          if (Number(userId) === element.a_user_account_id) {
            users.push(element.b_user_account_id);
            console.log('Success');
          } else {
            users.push(element.a_user_account_id);
          }
        }
        console.log(users);

        if (users[0]) {
          const userQuery = `SELECT * FROM user_account WHERE user_account.id IN (${users})`;
          console.log(userQuery);

          pool.query(userQuery).then((matchedResult) => {
            const matchedObject = matchedResult.rows;
            console.log(matchedObject);

            if (matched[0]) {
              res.render('conversations', { matchedObject });
            } else {
              res.send('Sorry, no matches.');
            }
          });
        } else {
          res.send('Sorry, no matches.');
        }
      });
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
});

// side bar
// render list of conversations
// profile photo
// first name
// last name
// snippet of last message

// footer

/* ------------------------------ /message page ----------------------------- */
let roomId;
let id;
let userId;

app.get('/message/:id', authMiddleware, (req, res) => {
  const userData = [];
  id = req.params.id;
  userId = req.userId;

  const getChatUserQuery = `SELECT * FROM user_account WHERE user_account.id=${userId}`;

  const getOtherUserQuery = `SELECT * FROM user_account WHERE user_account.id=${id}`;

  const getRoomId = `SELECT id FROM matched WHERE (a_user_account_id=${userId} OR b_user_account_id=${userId}) AND (a_user_account_id=${id} OR b_user_account_id=${id})`;

  pool.query(getRoomId).then((roomResult) => {
    const roomIdResult = roomResult.rows[0].id;
    roomId = roomIdResult;
    console.log('ROOM ID:', roomId);
  });

  pool
    .query(getChatUserQuery)
    .then((userResult) => {
      const chatUserResult = userResult.rows;
      userData.push(chatUserResult);
    })
    .then(() => {
      pool.query(getOtherUserQuery).then((otherUserResult) => {
        let chatUserFirstName;
        let chatUserLastName;
        let chatUserPhoto;

        const otherChatUserResult = otherUserResult.rows;
        userData.push(otherChatUserResult);
        const flatUserData = userData.flat();
        console.log('FLAT USER DATA', flatUserData);

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < flatUserData.length; i++) {
          const chatUserId = flatUserData[i].id;

          if (Number(id) === chatUserId) {
            chatUserFirstName = flatUserData[i].first_name;
            chatUserLastName = flatUserData[i].last_name;
            chatUserPhoto = flatUserData[i].photo_link;
          }
        }

        res.render('chat', {
          roomId,
          userId,
          chatUserFirstName,
          chatUserLastName,
          chatUserPhoto,
        });
      });
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
});

// socket is listening to the word "connection"
io.on('connection', (socket) => {
  // when we connect, we show that someone has joined
  console.log('a user connected to the server');

  console.log('socket id: ', socket.id);

  // joining chatrooms
  const chatroom = roomId;
  console.log('chatroom:', chatroom);

  socket.on('subscribe', async () => {
    const userDataA = await messageService.getUserDataA(userId);
    console.log('USER DATA A', userDataA);
    const userDataB = await messageService.getUserDataA(id);
    console.log('USER DATA B', userDataB);

    const messages = await messageService.listMessagesByRoom(chatroom);

    socket.join(chatroom);
    console.log('ROOM Name', chatroom);
    console.log(`a user has joined our room: ${chatroom}`);

    io.to(chatroom).emit('joinRoom', {
      chatroom,
      messages,
      userId,
      id,
      userDataA,
      userDataB,
    });
  });

  socket.on('disconnect', () => {
    console.log('a user has abandoned us ...');
  });

  socket.on('chatMessage', async (data) => {
    const userDataA = await messageService.getUserDataA(userId);
    // console.log('USER DATA A', userDataA);
    const userDataB = await messageService.getUserDataA(id);
    // console.log('USER DATA B', userDataB);

    const sender = data[1];
    const message = data[0];

    console.log(data);

    console.log(`${sender} says: ${message}`);
    await messageService.createMessage(chatroom, sender, message);

    io.to(chatroom).emit('chatMessage', { data, userDataA, userDataB });
  });
});

http.listen(PORT, () => {
  console.log(`application running at ${PORT}`);
});
