const getUsers = async (req, res, next) => {
  const sql = "SELECT id, Username, email, role, dateCreated FROM Users";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ status: "error", error: err.message });
      return;
    }
    res.json({
      status: "ok",
      data: rows,
    });
  });
};

const getUserById = async (req, res, next) => {
  const sql =
    "SELECT Id, username, email, role, dateCreated FROM Users WHERE Id = ?";
  const params = [req.params.id];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ status: "error", error: err.message });
      return;
    }
    res.json({
      status: "ok",
      data: rows,
    });
  });
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // Make sure there is an Email and Password in the request
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    var sql = "SELECT * FROM Users WHERE email = ?";
    db.all(sql, email, function (err, rows) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (rows.length > 0) {
        return res.status(400).send("User already exists");
      }

      const salt = bcrypt.genSaltSync(10);
      const PHash = bcrypt.hashSync(password, salt);

      var insert =
        "INSERT INTO Users (username, email, password, role, salt, dateCreated) VALUES (?,?,?,?,?,?)";
      db.run(
        insert,
        [username, email, PHash, "user", salt, Date("now")],
        function (err) {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }

          const token = jwt.sign(
            {
              user_id: this.lastID,
              role: "user",
              username: username,
              Email: email,
            },
            process.env.TOKEN_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.status(200).send({
            Id: this.lastID,
            Username: username,
            Email: email,
            Role: "user",
            Token: token,
            DateCreated: Date("now"),
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    var sql = "SELECT * FROM Users WHERE Email = ?";
    db.all(sql, email, function (err, rows) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (rows.length === 0) {
        return res.status(400).send("User does not exist");
      }

      const user = rows[0];

      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(400).send("Invalid Password");
      }

      const token = jwt.sign(
        { user_id: user.Id, username: user.username, email, role: user.role },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).send({
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
          token,
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const tokenIsValid = (req, res) => {
  res.status(200).send(req.user);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  signIn,
  tokenIsValid,
};
