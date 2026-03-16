process.on("uncaughtException", (err) => {
    console.error("SERVER CRASH:", err);
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE
const db = new sqlite3.Database("database.db");

// CREATE TABLE
db.run(`
CREATE TABLE IF NOT EXISTS trainers(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
password TEXT,
phone TEXT,
instagram TEXT,
starter TEXT,
badges INTEGER DEFAULT 0,
seasonPass INTEGER DEFAULT 0
)
`);


// REGISTER
app.post("/register", (req, res) => {

const {username,password,phone,instagram} = req.body;

if(!username || !password){
return res.json({success:false});
}

db.run(
"INSERT INTO trainers(username,password,phone,instagram) VALUES(?,?,?,?)",
[username,password,phone,instagram],
(err)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({success:true});

});

});


// LOGIN
app.post("/login",(req,res)=>{

const {username,password} = req.body;

if(!username || !password){
return res.json({success:false});
}

db.get(
"SELECT * FROM trainers WHERE username=? AND password=?",
[username,password],
(err,row)=>{

if(err){
console.log(err);
return res.json({success:false});
}

if(!row){
return res.json({success:false});
}

res.json({
success:true,
starter:row.starter,
badges:row.badges,
seasonPass:row.seasonPass
});

});

});


// SELECT STARTER (FREE SELECTION)
app.post("/selectStarter",(req,res)=>{

const {username,starter} = req.body;

if(!username || !starter){
return res.json({success:false});
}

db.run(
"UPDATE trainers SET starter=? WHERE username=?",
[starter,username],
(err)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({success:true});

});

});


// ACTIVATE SEASON PASS
app.post("/activatePass",(req,res)=>{

const {username} = req.body;

if(!username){
return res.json({success:false});
}

db.run(
"UPDATE trainers SET seasonPass=1 WHERE username=?",
[username],
(err)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({success:true});

});

});


// CHECK SEASON PASS
app.get("/checkPass/:username",(req,res)=>{

const username=req.params.username;

db.get(
"SELECT seasonPass FROM trainers WHERE username=?",
[username],
(err,row)=>{

if(err || !row){
return res.json({allowed:false});
}

if(row.seasonPass==1){
return res.json({allowed:true});
}

res.json({allowed:false});

});

});


// AWARD BADGE
app.post("/awardBadge",(req,res)=>{

const {username} = req.body;

db.run(
"UPDATE trainers SET badges = badges + 1 WHERE username=?",
[username],
(err)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({success:true});

});

});


// GET TRAINER PROFILE
app.get("/trainer/:username",(req,res)=>{

const username=req.params.username;

db.get(
"SELECT username,starter,badges,seasonPass FROM trainers WHERE username=?",
[username],
(err,row)=>{

if(err || !row){
return res.json({success:false});
}

res.json(row);

});

});


// RESET STARTERS
app.post("/resetAllStarters",(req,res)=>{

db.run(
"UPDATE trainers SET starter = NULL",
(err)=>{

if(err){
console.log(err);
return res.json({success:false});
}

res.json({success:true});

});

});


// HOMEPAGE
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});


// SERVER PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Server running on port " + PORT);
});
