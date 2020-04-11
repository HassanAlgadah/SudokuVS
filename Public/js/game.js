async function setupCon() {
    // const data = await fetch('/player')
    // const respond = await data.json()
    // socket local connection
    // let socket = io.connect('https://sudokuvss.herokuapp.com/');
    let socket = io.connect('http://localhost:4000');
    // the id of the other player
    let opid;
    //connecting the two players
    socket.on('opid', (data)=> {
        if (opid == null) {
            opid = data.opid
            socket.emit('sendid', {
                opid: opid,
            });
            socket.emit('info', {
                opid: opid,
                name:document.getElementById('name').innerText,
                level:document.getElementById('level').innerText,
                points:document.getElementById('points').innerText,
            })
        }
    })
    socket.on('info',(data)=> {
        console.log(data.level)
        document.getElementById('ename').innerText = data.name
        document.getElementById('elevel').innerText = data.level
        document.getElementById('epoints').innerText = data.points
        document.getElementById("waiting").hidden = true;
        document.getElementById("eplayer").style.visibility = 'visible';
        start(opid , socket);
    })

}
function start(opid , socket) {
    let gamebord = document.getElementById("gamebord");
    let gamebord2 = document.getElementById("gamebord2");
    let boxes = [81];
    let wincount = 81;
    let rightcount = 0;
    let sudoku = [6, 8, 0, 0, 0, 0, 0, 0, 0,
        4, 0, 3, 0, 0, 5, 6, 0, 0,
        9, 7, 0, 6, 0, 3, 0, 5, 0,
        0, 0, 0, 0, 0, 0, 3, 0, 0,
        0, 1, 0, 3, 0, 9, 7, 0, 6,
        0, 3, 4, 0, 5, 0, 0, 9, 0,
        0, 0, 0, 7, 0, 0, 5, 0, 8,
        0, 4, 7, 0, 0, 0, 1, 0, 2,
        0, 0, 0, 0, 0, 0, 0, 0, 0];
    let solv = [6, 8, 5, 4, 2, 7, 9, 1, 3,
        4, 2, 3, 9, 1, 5, 6, 8, 7,
        9, 7, 1, 6, 8, 3, 2, 5, 4,
        2, 6, 9, 8, 7, 1, 3, 4, 5,
        5, 1, 8, 3, 4, 9, 7, 2, 6,
        7, 3, 4, 2, 5, 6, 8, 9, 1,
        1, 9, 2, 7, 6, 4, 5, 3, 8,
        3, 4, 7, 5, 9, 8, 1, 6, 2,
        8, 5, 6, 1, 3, 2, 4, 7, 9];

    //setting up the game
    for (let i = 0; i < 81; i++) {
        let bo = document.createElement('div');
        let enbo = document.createElement('div');
        let input = document.createElement('input');
        setupGrid(bo, enbo, i+1);
        if (sudoku[i] != 0) {
            //counter
            wincount--
            bo.innerHTML = '<span style="font-size:2.5em">' + sudoku[i] + "</span>";
            enbo.innerHTML = '<span style="font-size:2.5em">' + sudoku[i] + "</span>";
        } else {
            bo.append(input);
        }
        gamebord.append(bo);
        gamebord2.append(enbo);

        //sending data to the server
        input.addEventListener("blur",()=> {
            if (input.value == solv[i]) {
                rightcount++
                if(rightcount === (wincount+1)){
                    socket.emit('win', {
                        opid: opid
                    })
                     win(true)
                }
                socket.emit('box', {
                    boxnum: i,
                    opid: opid
                })
            }
        });
        boxes[i] = enbo;
    }
    //receiving data form the server
    socket.on('box',(data)=> boxes[data.boxnum].style.background = 'red')
    socket.on('win',(data)=> win(false))
}
//setting up the griding
function setupGrid(box1, box2, count) {
    box1.className = 'box';
    box2.className = 'box';
    if (count % 3 === 0) {
        box1.style.borderWidth = "1px 1px 1px 4px";
        box2.style.borderWidth = "1px 1px 1px 4px";
    }
    if (count % 9 === 0) {
        box1.style.borderWidth = "1px 1px 1px 1px";
        box2.style.borderWidth = "1px 1px 1px 1px";
    }
    if (count > 27 && count < 37) {
        box1.style.borderTopWidth = "4px";
        box2.style.borderTopWidth = "4px";
    } else if (count > 45 && count < 55) {
        box1.style.borderBottomWidth = "4px";
        box2.style.borderBottomWidth = "4px";
    }
}

async function win (res) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: {
            user: ""
        }
    }
    if (res) {
        document.getElementById("win").style.visibility = "visible"
        await fetch('/win', options)
    } else {
        document.getElementById("lost").style.visibility = "visible"
        await fetch('/lost', options)
    }
}
window.addEventListener('load', setupCon, false);