async function  setupCon() {
    const data = await fetch('http://localhost:4000/player')
    const respond = await data.json()
    console.log(respond)
    console.log("dasodjkasiopdj")
    // socket local connection
    let socket = io.connect('localhost:4000');
    // the id of the other player
    let opid;
    //connecting the two players
    socket.on('opid', (data)=> {
        if (opid == null) {
            opid = data.opid;
            socket.emit('sendid', {
                opid: opid
            });
            document.getElementById("waiting").hidden = true;
            start(opid , socket);
        }
    });
}
function start(opid , socket) {
    let gamebord = document.getElementById("gamebord");
    let gamebord2 = document.getElementById("gamebord2");
    let boxes = [81];
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

window.addEventListener('load', setupCon, false);