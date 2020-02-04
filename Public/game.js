function start(){
    let socket = io.connect('http://localhost:400');
    let text = document.getElementById("text");
    let gamebord = document.getElementById("gamebord");
    let boxes = [81];
    for (let i = 0; i < 81; i++) {
        let bo = document.createElement('div');
        bo.className = 'box';
        gamebord.append(bo);
        bo.addEventListener('click',function () {
            socket.emit('box', {
                boxnum: i
            })
        });
        boxes[i] = bo;
        console.log("d")
    }
    text.addEventListener("blur", function () {
        if (text.value != "") {
            socket.emit('box', {
                boxnum: text.value
            })
        }
    });
    socket.on('box',function (data) {
        boxes[data.boxnum].style.background = 'red';

    })
}


window.addEventListener('load', start, false);