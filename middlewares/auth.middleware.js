import { getHashWithSalt } from '../hash.js';

const authMiddleware = (request, response, next) => {
  console.log('Starting Auth');
  // set the default value
  request.isUserLoggedIn = false;
  console.log('isUserLoggedIn', request.isUserLoggedIn);

  const { userId } = request.cookies;
  const { LoggedInHash } = request.cookies;

  if (LoggedInHash && userId) {
    // console.log('userId', userId);
    // get the hased value that should be inside the cookie
    const hashedString = getHashWithSalt(userId);

    // use the user id to query the user table AND the company table

    // test the value of the cookie
    if (LoggedInHash === hashedString) {
      console.log('User is logged in');
      request.isUserLoggedIn = true;
      request.userId = userId;
      next();
    }
  } else {
    console.log('User is not logged in');
    next();
  }
};

export default authMiddleware;
