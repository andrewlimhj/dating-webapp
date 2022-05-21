import moment from 'moment';
import pool from '../initPool.js';

// todo: edit profile
// todo: delete profile
/* --------------------------------- profile -------------------------------- */
const getProfile = (req, res) => {
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
};

export default getProfile;
