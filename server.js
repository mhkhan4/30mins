const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { runInNewContext } = require('vm');

app.set('view engine', 'pug');

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: 'secret-key'}));

app.get('/session_ex', (req,res)=>{
  if(req.session.hasOwnProperty('exercises')){
    res.send(req.session['exercises']);
  }
  else{
    res.send('false');
  }
});


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: 'Mahmud---01',
    database: 'exdb'
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
  req.session['exercises'] = req.body.name;
  res.send(req.session);
});


app.listen(PORT, () =>{
  console.log('server listening on ' + PORT);
});