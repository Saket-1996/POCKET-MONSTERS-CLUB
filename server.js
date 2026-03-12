process.on("uncaughtException", (err) => {
    console.error("SERVER CRASH:", err);
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("database.db");


// CREATE TABLE
db.run(`
CREATE TABLE IF NOT EXISTS trainers(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT,
phone TEXT,
instagram TEXT,
starter TEXT
)
`);


// REGISTER
app.post("/register", (req, res) => {

    const { username, password, phone, instagram } = req.body;

    db.run(
        "INSERT INTO trainers(username,password,phone,instagram) VALUES(?,?,?,?)", [username, password, phone, instagram],
        (err) => {

            if (err) {
                res.json({ success: false });
            } else {
                res.json({ success: true });
            }

        });

});


// LOGIN
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM trainers WHERE username=? AND password=?", [username, password],
        (err, row) => {

            if (!row) {
                return res.json({ success: false });
            }

            // send starter info too
            res.json({
                success: true,
                starter: row.starter
            });

        });

});


// GET TAKEN STARTERS
app.get("/starters", (req, res) => {

    db.all(
        "SELECT starter FROM trainers WHERE starter IS NOT NULL",
        (err, rows) => {

            const taken = rows.map(r => r.starter);

            res.json({ taken });

        });

});


// SELECT STARTER
app.post("/selectStarter", (req, res) => {

    const username = req.body.username;
    const starter = req.body.starter;

    console.log("Request:", username, starter);

    if (!username || !starter) {
        return res.json({ success: false });
    }

    db.get(
        "SELECT starter FROM trainers WHERE username=?", [username],
        (err, row) => {

            if (err) {
                console.log("DB error:", err);
                return res.json({ success: false });
            }

            if (!row) {
                return res.json({ success: false });
            }

            // already has starter
            if (row.starter) {
                return res.json({ success: false });
            }

            // check if starter already taken
            db.get(
                "SELECT username FROM trainers WHERE starter=?", [starter],
                (err2, row2) => {

                    if (err2) {
                        console.log("DB error:", err2);
                        return res.json({ success: false });
                    }

                    if (row2) {
                        return res.json({ success: false });
                    }

                    db.run(
                        "UPDATE trainers SET starter=? WHERE username=?", [starter, username],
                        function(err3) {

                            if (err3) {
                                console.log("Update error:", err3);
                                return res.json({ success: false });
                            }

                            res.json({ success: true });

                        }
                    );

                }
            );

        }
    );

});

app.post("/resetAllStarters", (req, res) => {

    db.run("UPDATE trainers SET starter = ?", [null], function(err) {

        if (err) {
            console.log("RESET ERROR:", err);
            return res.json({ success: false });
        }

        console.log("All starters reset");

        res.json({ success: true });

    });

});

app.get("/trainer/:username", (req, res) => {

    const username = req.params.username;

    db.get(
        "SELECT * FROM trainers WHERE username=?", [username],
        (err, row) => {

            res.json(row);

        }

    );

});

app.post("/awardBadge", (req, res) => {

    const { username } = req.body;

    db.run(
        "UPDATE trainers SET badges = badges + 1 WHERE username=?", [username],
        (err) => {

            if (err) {
                return res.json({ success: false });
            }

            res.json({ success: true });

        });

});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});