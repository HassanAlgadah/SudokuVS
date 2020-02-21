function start() {
    let socket = io.connect('192.168.100.59:400');
    let opid;
    socket.on('opid', function (data) {
        if (opid == null) {
            opid = data.opid;
            socket.emit('sendid',{
                opid: opid
            })
        }
    });

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

    for (let i = 0; i < 81; i++) {
        let bo = document.createElement('div');
        let input = document.createElement('input');
        let enbo = document.createElement('div');
        bo.className = 'box';
        enbo.className = 'box';
        if (sudoku[i] != 0) {
            bo.innerHTML = '<span style="font-size:2.5em">' + sudoku[i] + "</span>";
            enbo.innerHTML = '<span style="font-size:2.5em">' + sudoku[i] + "</span>";
        } else {
            bo.append(input);
        }
        gamebord.append(bo);
        gamebord2.append(enbo);
        input.addEventListener("blur", function () {
            console.log(opid);
            if (input.value == solv[i]) {
                socket.emit('box', {
                    boxnum: i,
                    opid: opid
                })
            }
        });
        boxes[i] = enbo;
    }
    socket.on('box', function (data) {
        boxes[data.boxnum].style.background = 'red';
    })
}

window.addEventListener('load', start, false);