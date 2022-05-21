/* -------------------------------- home page ------------------------------- */

const getHome = (req, res) => {
  const { LoggedIn } = req.cookies;

  res.render('home', { LoggedIn });
};

export default getHome;
