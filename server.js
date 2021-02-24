const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.set('view engine', 'pug');

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret-key',
  resave : true,
  saveUninitialized : true
  }));


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Mahmud---01',
    database: 'exdb'
  });

app.get('/session_ex', (req,res)=>{
  if(req.session.ex_info){
    res.send(req.session.ex_info);
  }
  else{
    res.send('false');
  }
});


app.get("/dbExercises", function(req,res){
    var sql = "select * from exercises";
    con.query(sql, (err,result, fields)=>{
        if(err) throw err;
        res.send({exercises : result})
    });
});

app.post('/new_ex', (req,res)=>{
  var the_name = req.body.name;
  res.send(the_name);
  var sql = `INSERT INTO exercises(ex_type) VALUES ('${the_name}')`;
  con.query(sql, (err, result) =>{
      if(err) throw err;
  });
});


app.post('/reps_ex', (req,res)=>{
  req.session.ex_info = req.body.name;
  res.send(req.session);
});

app.post('/session_completed', (req,res)=>{
  var the_name = req.body.name;
  res.send(the_name);
  var sql = `INSERT INTO extra_tbl(ex1_name, ex2_name,sets_count, sets_done) VALUES ('${Object.keys(req.session.ex_info)[0]} ${req.session.ex_info[Object.keys(req.session.ex_info)[0]]}', '${Object.keys(req.session.ex_info)[1]} ${req.session.ex_info[Object.keys(req.session.ex_info)[1]]}',${the_name[0]},${the_name[1]} )`;
  con.query(sql, (err, result) =>{
      if(err) throw err;
      console.log(Object.keys(req.session.ex_info)[0]);
  });

  // var sql_record = `insert into ex_record(session_id, ex_type, reps_count) values (select id from ex_sessions where sets_count = 5, '${Object.keys(req.session.ex_info)[0]}', ${req.session.ex_info[Object.keys(req.session.ex_info)[0]]}) `
  // con.query(sql_record, (err, result) =>{
  //   if(err) throw err;
  // });
});




app.listen(PORT, () =>{
  console.log('server listening on ' + PORT);
});