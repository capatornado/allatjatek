var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { registerDecorator } = require('handlebars');
const db=require("./utils/db.js")
var fetch=require("fetch")

//idk where to put them, too tired


//


var app = express();
app.use(session({
	secret: 'titok',
	resave: true,
	saveUninitialized: true
}));

const publicDirectory= __dirname+"/public";
app.use(express.static(publicDirectory))

app.set('view engine', 'hbs');




app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.render("login")
});

app.get('/register', function(req, res) {
	res.render("register")
});

app.post('/auth', async function(req, res) {
	
	var email = req.body.email;
	var om = req.body.om;
	if (email && om && !isNaN(om) && om.length==11 && email.includes("@") && email.includes(".") ){
		rows = await db.query(`SELECT * FROM user WHERE email = "${email}" AND om = "${om}"`).then(rows => {return rows})     
		if (rows.length > 0) {
			req.session.loggedin = true;
			req.session.user = rows[0];
			res.redirect('/home');
		} else {
			res.send('Hibás email/OM azonosító ');
		}		
		res.end();
		
	} else {
		res.send('Adj meg minden adatot rendesen!');
		res.end();
	}
});

app.post('/auth/register', async function(req, res) {
	var vezeteknev = req.body.vezeteknev;
	var keresztnev = req.body.keresztnev;
	var email = req.body.email;
	var om = req.body.om;
	var csoport=req.body.csoport;
	var position = req.body.position;
	if (vezeteknev && keresztnev && email && om && csoport && position && !isNaN(om) && csoport.includes("/") && om.length==11 && email.includes("@") && email.includes(".") ){
		let result= await db.query(`INSERT INTO user (vezeteknev, keresztnev, email, om, csoport, position) VALUES("${vezeteknev}", "${keresztnev}","${email}","${om}","${csoport}","${position}")`).then(result => {return result.insertId});

		var feladatok= await db.query(`SELECT * FROM feladat WHERE csoport = "${csoport}"`).then(rows =>  {return rows})
		for await(feladat of feladatok){
			await db.query(`INSERT INTO feladat_allapot (feladat_id, user_id, allapot) VALUES(${feladat["id"]}, ${result}, 0) `);
		}
		

		res.redirect("/");
		res.end();
	} else {
		res.send('Adj meg minden adatot rendesen!');
		res.end();
	}
});

app.get('/home', async function(req, res) {
	if (req.session.loggedin) {
		var user=req.session.user;
		var feladatAllapot= await db.query(`SELECT * FROM feladat_allapot WHERE user_id = "${user["id"]}"`).then(rows =>  {return rows})
		var feladatok= await db.query(`SELECT * FROM feladat WHERE csoport = "${user["csoport"]}"`).then(rows =>  {return rows})
			
		let stats={"feladatok": feladatok, "feladatAllapot": feladatAllapot};

	
		let maxPont=0;
				for(feladat of stats["feladatok"]){
					maxPont+=feladat["pont"];
				}
				let currentPont=0;
				for(feladat of stats["feladatok"]){
					
					if(stats["feladatAllapot"].filter(obj =>{
					return obj["feladat_id"] == feladat["id"]})[0]["allapot"]==1){
						currentPont+=feladat["pont"]
					}   
				}
				
				var percent=Math.floor(currentPont/maxPont*100);

			let tanar=false;
			if(user.position=="tanar"){
				tanar=true;
			}

			let profilePic=await db.query(`SELECT profile_pic FROM user WHERE id= ${user["id"]}`).then(rows =>{ return rows[0]["profile_pic"]})
			

	
		var feladatok= await db.query(`SELECT * FROM feladat WHERE csoport = "${user["csoport"]}"`).then(rows =>  {return rows});
		var feladatokNev=[];
		for(feladat of feladatok){
			feladatokNev.push(feladat["id"]);
		}
		return res.render("home", {
			user: user,
			feladatok: feladatokNev,
			percent: percent,
			tanar: tanar,
			profilePic: profilePic
		})
	} else {
		res.redirect('/')
	}
	res.end();
});

app.get('/getUser/', async (req, res) =>{
	var user=req.session.user;
	
	var feladatAllapot= await db.query(`SELECT * FROM feladat_allapot WHERE user_id = "${user["id"]}"`).then(rows =>  {return rows})
	var feladatok= await db.query(`SELECT * FROM feladat WHERE csoport = "${user["csoport"]}"`).then(rows =>  {return rows})
		
	res.send({"feladatok": feladatok, "feladatAllapot": feladatAllapot})
	
})

app.get('/updateUser/:taskID', async (req, res) =>{
	var user=req.session.user;
	
	
	db.query(`UPDATE feladat_allapot SET allapot = 1 WHERE user_id =${user["id"]} AND feladat_id = ${req.params.taskID}`)
})

app.get('/newTask/:szoveg', async (req, res) =>{
	var user=req.session.user;
	
	
	let incrementID= await db.query(`INSERT INTO feladat (csoport, szoveg, pont) VALUES("${user.csoport}", "${req.params.szoveg}", 50 ) `).then( result =>{ return result.insertId});
	var students= await db.query(`SELECT * FROM user WHERE csoport = "${user.csoport}"`).then(rows =>{ return rows});
	for await (student of students ){
		db.query(`INSERT INTO feladat_allapot (feladat_id, user_id, allapot) VALUES("${incrementID}",${student["id"]}, "0") `);
	}
})

app.get('/profile', async (req, res) =>{
	res.render("profile")	
})

app.get('/setProfile/:id', async (req, res) =>{
	db.query(`UPDATE user SET profile_pic = ${req.params.id}`)
	res.redirect("/home")
})

app.listen(3000);