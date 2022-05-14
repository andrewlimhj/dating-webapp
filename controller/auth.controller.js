import axios from "axios";
import { getHashedString, getHashWithSalt } from "../hash.js";
import pool from "../initPool.js";

class AuthController {
  constructor(pool) {
    this.pool = pool;
  }

  getSignUp = async (req, res) => {
    try {
      const { LoggedIn } = req.cookies;

      if (req.isUserLoggedIn === true) {
        console.log("Already logged in");
        res.redirect("/profile");
        return;
      }

      const options = {
        method: "GET",
        url: "https://countriesnow.space/api/v0.1/countries",
      };

      const countryArray = [];
      const result = await axios.request(options);
      const { data } = result.data;

      for (let i = 0; i < data.length; i += 1) {
        const { country } = data[i];
        countryArray.push(country);
      }

      res.render("sign-up", { countryArray, LoggedIn });
    } catch (error) {
      console.error(error.rows);
      res.status(503).send(error);
    }
  };
}

export const getSignUp = (req, res) => {
  const { LoggedIn } = req.cookies;

  if (req.isUserLoggedIn === true) {
    console.log("Already logged in");
    res.redirect("/profile");
    return;
  }

  const options = {
    method: "GET",
    url: "https://countriesnow.space/api/v0.1/countries",
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
      res.render("sign-up", { countryArray, LoggedIn });
    })
    .catch((error) => {
      console.error(error.rows);
      res.status(503).send(error);
    });
};

export const postSignUp = (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log("Already logged in");
    res.redirect("/profile");
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
    req.file.location,
  ];

  // eslint-disable-next-line operator-linebreak
  const sqlQuery =
    "INSERT INTO user_account (first_name, last_name, email, password, profession, gender, country, date_of_birth, photo_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";

  pool
    .query(sqlQuery, values)
    .then((result) => {
      console.log("result", result.rows[0]);
      res.redirect("/login");
    })
    .catch((error) => {
      console.log("Error executing query", error.stack);
      res.status(503).send(error.rows);
    });
};

export const getLogin = (req, res) => {
  const { LoggedIn } = req.cookies;

  if (req.isUserLoggedIn === true) {
    console.log("Already logged in");
    res.redirect("/profile");
    return;
  }
  res.render("login", { LoggedIn });
};

export const postLogin = (req, res) => {
  if (req.isUserLoggedIn === true) {
    console.log("Already logged in");
    res.redirect("/profile");
    return;
  }

  const values = [req.body.email];

  const sqlQuery = "SELECT * FROM user_account WHERE email=$1";

  pool
    .query(sqlQuery, values)
    .then((result) => {
      if (result.rows.length === 0) {
        console.log("No user with this email was found.");
        res.redirect("/login");
      }

      const user = result.rows[0];

      const hashedPasswordInDatabase = user.password;
      const hashedPasswordFromLogin = getHashedString(req.body.password);

      if (hashedPasswordInDatabase === hashedPasswordFromLogin) {
        const hashedCookieString = getHashWithSalt(user.id);

        res.cookie("LoggedIn", true);
        res.cookie("LoggedInHash", hashedCookieString);

        res.cookie("userId", user.id);

        res.redirect("/profile");
      } else {
        console.log("Email and password combination incorrect!");
        res.redirect("/login");
      }
    })
    .catch((error) => {
      console.log("Error executing query", error.stack);
      res.status(503).send(error.rows);
    });
};

export const logout = (req, res) => {
  res.clearCookie("userId");
  res.clearCookie("LoggedInHash");
  res.clearCookie("LoggedIn");
  res.redirect("/login");
};

export default AuthController