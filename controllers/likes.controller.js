import moment from 'moment';
import pool from '../initPool.js';

// todo: unlike someone
const getLikes = (req, res) => {
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
};

export default getLikes;
