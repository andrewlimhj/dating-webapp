import pool from '../initPool.js';
import { MessageService } from '../services/index.js';

const messageService = new MessageService();

export const getConversations = (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  // const randomPhoto = getARandomPhoto();
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
          // console.log('likedBackUser', likedBackUser);

          likesArray.forEach((userLikes) => {
            console.log('forEach');

            if (userLikes === likedBackUser) {
              let inMatchedTable = false;

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
            }
          });
        } else {
          const html = `<html>
              <body>
              <h3> Sorry, no matches yet! </h3>
            <a href="/profile">Back to your profile</a>
            </body>
            </html>`;
          // randomPhoto.then((photoResult) => {
          //   const html = `<html>
          //     <body>
          //     <h3> Sorry no matches yet! </h3>
          //   <img src="${photoResult.full}" alt="" width="600" height="600"><br><br>
          //   <a href="/profile">Back to your profile</a>
          //   </body>
          //   </html>`;
          //   console.log(photoResult);
          //   res.send(html);
          // });
          res.send(html);
        }
      });
    })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(error.rows);
    });
};

let roomId;
let id;
let userId;

export const getMessages = (req, res) => {
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
        // console.log('FLAT USER DATA', flatUserData);

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
};

export const socketIo = (io) => {
  io.on('connection', (socket) => {
    // when we connect, we show that someone has joined
    console.log('a user connected to the server');
    // const socketObject = socket.nsp;
    // console.log('SOCKET OBJECT', socketObject.name);
    console.log('SOCKET ID:', socket.id);
    // console.log('IO', io);
    // joining chatrooms
    const chatroom = roomId;
    console.log('chatroom:', chatroom);

    socket.on('subscribe', async () => {
      const userDataA = await messageService.getUserDataA(userId);
      // console.log('USER DATA A', userDataA);
      const userDataB = await messageService.getUserDataB(id);
      // console.log('USER DATA B', userDataB);

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
      console.log('socket id: ', socket.id);
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
};
