const sqlite3 = require("sqlite3").verbose();
const DB_Path = "usersdb.sqlite";

let db = new sqlite3.Database(DB_Path, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else {
      const salt = bcrypt.genSaltSync(10);
  
      db.run(
        `CREATE TABLE Users (
              Id INTEGER PRIMARY KEY AUTOINCREMENT,
              username text, 
              email text, 
              role text,
              password text,             
              salt text,    
              token text,
              dateCreated text,
              UNIQUE(Email)
              )`,
        (err) => {
          if (err) {
            console.log("Table already created");
          } else {
            // Table just created, creating some rows
            var insert =
              "INSERT INTO Users (username, email, password, role, salt, dateCreated) VALUES (?,?,?,?,?,?)";
            db.run(insert, [
              "user1",
              "user1@example.com",
              bcrypt.hashSync("admin", salt),
              "user",
              salt,
              Date("now"),
            ]);
          }
        }
      );
    }
  });
  
  module.exports = db;