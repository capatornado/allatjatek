const mysql=require("mysql")

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "capatornado"
});

con.connect(err => {
    if(err) throw err;
    console.log("connected to database!");
});

function query(sql, message){
    return new Promise( (resolve) =>{ //no rejection!
        con.query(sql, (err, rows) =>{        
            if(err){     
                console.log(err);     
            }
            else resolve(rows);                               
        });
    });

};

module.exports= {
    query
};