let stats;
update();

function update(){
    stats;
    fetch('http://localhost:3000/getUser')
    .then(res => res.json())
    .then(data => obj = data)
    .then(() => stats=obj)
    .catch(function(error) {
    console.log('Looks like there was a problem: \n', error);
    })
}







function $(id) {
    return document.getElementById(id);

    
}

var taskButtonPressed = function(id) {
    return function buttonPressed(e) {
        var result = stats["feladatok"].filter(obj => {
            return obj["id"] === id;     
        })

        var img=$("check");
            img.style.display = 'none';




        if(stats["feladatAllapot"].filter(obj =>{
            return obj["feladat_id"] == id})[0]["allapot"]==1
        ){
            var img=$("check");
            img.style.display = 'block';
        }
        console.log(result)
        $("quests").innerHTML=result[0]["szoveg"];
        $("complete").addEventListener("click", taskCompleted)

        function taskCompleted(){
            var img=$("check");
            img.style.display = 'block';

            
            

            let maxPont=0;
            for(feladat of stats["feladatok"]){
                maxPont+=feladat["pont"];
            }
            let currentPont=0;
            for(feladat of stats["feladatok"]){
                if(stats["feladatAllapot"].filter(obj =>{
                return obj["feladat_id"] == feladat["id"]})[0]["allapot"]==1){
                    currentPont+=feladat["pont"];
                }   
            }
            

            var percent=Math.floor(currentPont/maxPont*100);
            $("progress").innerHTML=percent+"%";
            $("progress").style.width=percent+"%";
            fetch(`http://localhost:3000/updateUser/${id}`)
            update();
        }
    }
}


function newTask(){
    var szoveg = prompt("Feladat leírása ","")
    var pont = prompt("Hány pontot ér ez a feladat?","")
    
    fetch(`http://localhost:3000/newTask/${szoveg}`)
    update();
}

async function init() {
    update();
    let stats;
await fetch('http://localhost:3000/getUser')
.then(res => res.json())
.then(data => obj = data)
.then(() => stats=obj)
.catch(function(error) {
console.log('Looks like there was a problem: \n', error);
})  

for(feladat of stats["feladatok"]){
    console.log("list")
    $(`feladatokButton${feladat["id"]}`).addEventListener("click", taskButtonPressed(feladat["id"]));
}

    $('newTask').addEventListener("click", newTask);

    
    
    
    
    
    
};

window.addEventListener("load", init);
