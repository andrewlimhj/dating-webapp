import moment from 'moment';
import pool from '../initPool.js';

export const getDiscover = (req, res) => {
  if (req.isUserLoggedIn === false) {
    console.log('Not logged in');
    res.redirect('/login');
    return;
  }

  // const randomPhoto = getARandomPhoto();
  const { userId } = req;
  // console.log('userId', userId);

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
            const html = `<html>
              <body>
              <h3> Opps no more potential mates! </h3>
            <a href="/profile">Back to your profile</a>
            </body>
            </html>`;
            // randomPhoto.then((photoResult) => {
            // const html = `<html>
            //   <body>
            //   <h3> Opps no more potential mates! </h3>
            // <img src="${photoResult.full}" alt="" width="600" height="600"><br><br>
            // <a href="/profile">Back to your profile</a>
            // </body>
            // </html>`;
            //   console.log(photoResult);
            res.send(html);
            // });

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
            const html = `<html>
              <body>
              <h3> Opps no more potential mates! </h3>
            <a href="/profile">Back to your profile</a>
            </body>
            </html>`;
            // randomPhoto.then((photoResult) => {
            //   const html = `<html>
            //   <body>
            //   <h3> Opps no more potential mates! </h3>
            // <img src="${photoResult.full}" alt="" width="600" height="600"><br><br>
            // <a href="/profile">Back to your profile</a>
            // </body>
            // </html>`;
            //   console.log(photoResult);
            //   res.send(html);
            // });
            res.send(html);
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
};

export const postDiscover = (req, res) => {
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
};
