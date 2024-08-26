




function createTableFromArray(array) {
const tableContainer = document.getElementById('board-game');
const table = document.createElement('table');

const mapping = {
0: '',
1: 'A-H1',
2: 'A-H2',
3: 'A-H3',
4: 'A-P1',
5: 'A-P2',
6: 'B-H1',
7: 'B-H2',
8: 'B-H3',
9: 'B-P1',
10: 'B-P2'
};


for (let i = 0; i < 5; i++) {
const row = document.createElement('tr');
for (let j = 0; j < 5; j++) {
    const cell = document.createElement('td');
    const value = array[i][j];
    const mappedValue = mapping[value] || '';
    cell.textContent = mappedValue;
    if (mappedValue) {
        cell.classList.add(mappedValue);
    }
    cell.addEventListener('click', () => handleCellClick(i, j));
    row.appendChild(cell);
}
table.appendChild(row);
}


tableContainer.innerHTML = '';
tableContainer.appendChild(table);
}



var real_username;
const socket = io();
let currentRoomId = null;
let username = null;
let gotA=false
let current_touched=null
let current_available_pos=[]
let noofplayercurrent=0


socket.on('connect', () => {
    console.log('Connected to server');
});


socket.on('room_created',(data) => {
    gotA=true
    console.log('Room created:', data);
    currentRoomId = data.room_id;
    board=data.board;
    console.log(board)
    createTableFromArray(board);
    document.getElementById("board-game").classList.remove('hidden');
    document.getElementById("description-move").classList.remove('hidden');
    document.getElementById('movesnplayers').classList.remove('hidden');
    document.getElementById('chat').classList.remove('hidden');
    document.getElementById('command-messages-button').classList.remove('hidden');
    document.getElementById('command-messages-input').classList.remove('hidden');
    document.getElementById('join-room-form').classList.add('hidden');
    document.getElementById('join-room-button').classList.add('hidden');
    document.getElementById('create-room-button').classList.add('hidden');
    document.getElementById('create-room-form').classList.add('hidden');
    document.getElementById('turn-info').classList.remove('hidden');
    document.getElementById('container').classList.add("hidden");

    document.getElementById('disconnect-button').classList.remove("hidden");
    if(gotA==true){
        document.getElementById("yourtrn").innerHTML+="Your Side: A"
    }
    else{
        document.getElementById("yourtrn").innerHTML+="Your Side: B"
    }
    document.getElementById("roomid").innerHTML+="ROOM ID: "+currentRoomId
    document.getElementById("player").innerHTML+="PLAYER :" + username
    get_no_of_players()
    showNotification("waiting for other player to join",5000)
        
    


    appendMessage('System', `Room ${currentRoomId} created.`,true);
    appendMessage('System', `Move History & messages`,true);
});
function showNotification(message,tm) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');


    notificationMessage.textContent = message;


    notification.classList.remove('hidden');
    notification.classList.add('visible');

  
    setTimeout(() => {
        notification.classList.remove('visible');
        notification.classList.add('hidden');
    }, tm); 
}
function showNotification2(message,tm) {
    const notification = document.getElementById('notification2');
    const notificationMessage = document.getElementById('notification-message2');


    notificationMessage.textContent = message;


    notification.classList.remove('hidden');
    notification.classList.add('visible');

  
    setTimeout(() => {
        notification.classList.remove('visible');
        notification.classList.add('hidden');
    }, tm); 
}
socket.on('room_joined',  (data) => {
    console.log('Joined room:', data);
    currentRoomId = data.room_id;
    board=data.board;
    console.log(board)
    createTableFromArray(board);
    document.getElementById("board-game").classList.remove('hidden');
    document.getElementById("description-move").classList.remove('hidden');
    document.getElementById('movesnplayers').classList.remove('hidden');
    document.getElementById('chat').classList.remove('hidden');
    document.getElementById('command-messages-button').classList.remove('hidden');
    document.getElementById('command-messages-input').classList.remove('hidden');
    document.getElementById('join-room-form').classList.add('hidden');
    document.getElementById('join-room-button').classList.add('hidden');
    document.getElementById('create-room-button').classList.add('hidden');
    document.getElementById('create-room-form').classList.add('hidden');
    document.getElementById('turn-info').classList.remove('hidden');
    document.getElementById('disconnect-button').classList.remove("hidden");
    document.getElementById('container').classList.add("hidden");
    console.log("hel");
    if(gotA==true){
        document.getElementById("yourtrn").innerHTML+="Your Side: A"
    }
    else{
        document.getElementById("yourtrn").innerHTML+="Your Side: B"
    }
    document.getElementById("roomid").innerHTML+="ROOM ID: "+currentRoomId
    document.getElementById("player").innerHTML+="PLAYER :" + username
    get_no_of_players()
    
    appendMessage('System', `Joined room ${currentRoomId}.`,true);
    appendMessage('System', `Move History & messages`,true);

    socket.emit('player_move',{room_id: currentRoomId,username:username})
    showNotification("U Joined ",3000)
    
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

socket.on('room_not_found', (data) => {
    alert(`Room ${data.room_id} not found.`);
});



socket.on('message', (data) => {
    console.log('Received message:', data);
    if (data.room_id === currentRoomId) {
        appendMessage(data.username, data.message,true);
    }
});
socket.on('update_players', (data) => {
if (data.room_id === currentRoomId) {
    updatePlayerList(data.players);
    console.log("players_got updae"+data.board)
    createTableFromArray(data.board);
    


}
});

socket.on('gotnoofplayers', (data) => {
    
    console.log("datat got "+data)
    if (data.room_id === currentRoomId) {
        if(noofplayercurrent==2&&data.count<2){
            showNotification("U won the match other player Left",5000);
            setTimeout(() => {
                location.reload(); // Reloads the current page
            }, 5000); 
        }
        noofplayercurrent=data.count;
        console.log("no fo "+noofplayercurrent)
        
    }
    });
    
function get_no_of_players(){
    socket.emit('getnofoplayer',{room_id: currentRoomId})

}

function updatePlayerList(players) {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = ''; 

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = player;

  
        listItem.style.fontSize = 'small';
        listItem.style.padding = '10px';
        listItem.style.color='white';
         
        listItem.style.borderBottom = '1px solid #ddd'; 

        playerList.appendChild(listItem);
    });
    get_no_of_players()
}

function updateTurnInfo(playerName) {
const turnInfo = document.getElementById('turn-info');
const currentTurnPlayer = document.getElementById('current-turn-player');
turnInfo.classList.remove('hidden');
currentTurnPlayer.textContent = playerName || 'None';
}


socket.on('turn_update', (data) => {
if (data.room_id === currentRoomId) {
updateTurnInfo(data.current_turn_player);
}
});
socket.on('command-message', (data) => {
    console.log('Received command:', data);
    const table = document.querySelector('#board-game table');
    
    if (data.room_id === currentRoomId) {
        board=data.board;
        console.log(board)
        createTableFromArray(board);
        winnerfound=data.winnerfound
        kills=data.killed
        for (var i=0;i<kills.length ;i++){
            var messag=table.rows[kills[i][0]]?.cells[kills[i][1]].innerText;
            appendMessage(data.username,"killed "+messag,false)

        }
        
        appendMessage(data.username, data.message,false);
        if(winnerfound==true){
            appendMessage("Winner: ", " We have found a winner "+data.username,false);
            showNotification(data.username+" is the winner ",3000)
        }
    }
    socket.emit('player_move',{room_id: currentRoomId,username:username})
});


function handleCellClick(row, col) {
    

    console.log("cell touched")
    

const moveOffsets = {
'P1': {
    'L': [[0, -1]],
    'R': [[0, 1]],
    'F': [[-1, 0]],
    'B': [[1, 0]]
},
'P2': {
    'L': [[0, -1]],
    'R': [[0, 1]],
    'F': [[-1, 0]],
    'B': [[1, 0]]
},
'H1': {
    'L': [[0, -2], [0, -1]],
    'R': [[0, 2], [0, 1]],
    'F': [[-2, 0], [-1, 0]],
    'B': [[2, 0], [1, 0]]
},
'H2': {
    'FL': [[-2, -2], [-1, -1]],
    'FR': [[-2, 2], [-1, 1]],
    'BL': [[2, -2], [1, -1]],
    'BR': [[2, 2], [1, 1]]
},
'H3': {
    'FL': [[-2, -1]],
    'FR': [[-2, 1]],
    'BL': [[2, -1]],
    'BR': [[2, 1]],
    'RF': [[-1, 2]],
    'RB': [[1, 2]],
    'LF': [[-1, -2]],
    'LB': [[1, -2]]
}
};
const table = document.querySelector('#board-game table');
if(current_available_pos.some(pos => pos[0] === row && pos[1] === col)){
    console.log("found one grren")
    console.log(current_touched[0])
    console.log(current_touched[1])
        var messag=table.rows[current_touched[0]]?.cells[current_touched[1]].innerText+":";
        console.log("msg "+messag)
        var srch=messag.substring(2,4)
        var srch_move=moveOffsets[srch]
        console.log(srch_move)
        for (let [move, offsetsArray] of Object.entries(srch_move)) {
            console.log(offsetsArray)
            let [dx, dy] = offsetsArray[0];
                const newRow = current_touched[0] + dx;
                const newCol = current_touched[1] + dy;
                if(newRow==row&&newCol==col){
                    console.log("found")
                    console.log(move)
                    messag+=move
                    console.log(messag)

                    sendcommandMessagebyclick(messag)
                    current_touched=null
                    current_available_pos=[]
                    resetBoardColors();
                    break


                }

            
    
        }


        


        
        return
        
}
if(gotA==true && table.rows[row]?.cells[col].innerText.substring(0,1)=='B'){
    
    return 
    
}
if(gotA==false && table.rows[row]?.cells[col].innerText.substring(0,1)=='A'){
    return
}



console.log(table)
if (!table) return;



function applyHighlight(row, col, color) {
    
    
    
    
    get_no_of_players();
    console.log("no of pplaey "+noofplayercurrent)
    if(noofplayercurrent!=2){
        showNotification("Only u are there in the Game ",3000);
        return
    }
const cell = table.rows[row]?.cells[col];
if (cell) {
    cell.style.backgroundColor = color;
}
}


function resetBoardColors() {
const cells = table.getElementsByTagName('td');
for (let cell of cells) {
    cell.style.backgroundColor = '';
}
}


resetBoardColors();


const characterCell = table.rows[row]?.cells[col];
console.log(characterCell)
if (!characterCell) return;

const characterType = characterCell.textContent; 
console.log(characterType)

characterTypeoff=characterType.substring(2,4);
console.log(characterTypeoff)
const offsets = moveOffsets[characterTypeoff];
if (!offsets) return;
console.log(offsets)



applyHighlight(row, col, 'lightgrey');


document.getElementById("description-move").innerHTML=""
current_touched=[row,col]
current_available_pos=[]
for (let [move, offsetsArray] of Object.entries(offsets)) {
var cnt=0
for (let [dx, dy] of offsetsArray){
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5){
        const newCharacter = table.rows[newRow]?.cells[newCol].textContent;
        const newCharacterType = newCharacter.substring(0, 1);
        const currentCharacterType = characterType.substring(0, 1);

        if (newCharacter.length === 0) {
            cnt++
        } else if (newCharacterType !== currentCharacterType) {
            cnt++
        }
    }
}
if(cnt!=offsetsArray.length){
    continue
}
current_available_pos.push([offsetsArray[0][0]+row,offsetsArray[0][1]+col])
for (let [dx, dy] of offsetsArray) {
    const newRow = row + dx;
    const newCol = col + dy;


    if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
        const newCharacter = table.rows[newRow]?.cells[newCol].textContent;
        const newCharacterType = newCharacter.substring(0, 1);
        const currentCharacterType = characterType.substring(0, 1);

        if (newCharacter.length === 0) {
            applyHighlight(newRow, newCol, 'lightgreen');
            document.getElementById("description-move").innerHTML += `<div>${move}</div>`;
        } else if (newCharacterType !== currentCharacterType) {
            applyHighlight(newRow, newCol, 'red');
            document.getElementById("description-move").innerHTML += `<div>${move}</div>`;
        }

       
        
    }
}
}
console.log("here")
console.log(current_touched)
console.log(current_available_pos)
}






function createRoom() {
    const usernameInput = document.getElementById('create-username-input');
    real_username=usernameInput.value;
    
    username = usernameInput.value;
    const createroomform=document.getElementById("create-room-form");
    createroomform.classList.remove('hidden');
    document.getElementById("join-room-form").classList.add('hidden');
    document.getElementById("join-room-button").classList.add('hidden');
    const container = document.getElementById('container');
    const blocks = Array.from(container.children);
    const order = blocks.map(block => block.textContent);

    console.log(order)

    if (username) {
        socket.emit('create_room', { username: username,position:order });
    }
}

function showJoinRoomForm() {
    document.getElementById('join-room-form').classList.remove('hidden');
    document.getElementById('create-room-form').classList.add('hidden');
    
}


function joinRoom() {
    const roomId = document.getElementById('room-id-input').value;
    const usernameInput = document.getElementById('username-input');
    const joinroomform=document.getElementById("join-room-form");
    joinroomform.classList.remove('hidden');
    document.getElementById("create-room-form").classList.add('hidden');
    document.getElementById("create-room-button").classList.add('hidden');
    username = usernameInput.value;
    const container = document.getElementById('container');
    const blocks = Array.from(container.children);
    const order = blocks.map(block => block.textContent);

    if (roomId && username) {
        socket.emit('join_room', { room_id: roomId, username: username,position:order });
    }
}

function disconnectFromRoom() {
    if (currentRoomId) {
        document.getElementById("roomid").innerHTML=""
        document.getElementById("yourtrn").innerHTML=""
        document.getElementById("player").innerHTML=""
        
    document.getElementById("board-game").classList.add('hidden');
    document.getElementById("description-move").classList.add('hidden');
  
    document.getElementById('chat').classList.add('hidden');
    document.getElementById('movesnplayers').classList.add('hidden');
    document.getElementById('command-messages-button').classList.add('hidden');
    document.getElementById('command-messages-input').classList.add('hidden');
    document.getElementById('join-room-form').classList.add('hidden');
    document.getElementById('join-room-button').classList.remove('hidden');
    document.getElementById('create-room-button').classList.remove('hidden');
    document.getElementById('create-room-form').classList.add('hidden');
    document.getElementById('turn-info').classList.remove('hidden');
    document.getElementById('disconnect-button').classList.add("hidden");
    document.getElementById('container').classList.remove("hidden");
    document.getElementById('messages').innerHTML=""
    showNotification(username+" left the game  ",5000)
    setTimeout(() => {
        location.reload(); 
    }, 5000); 


    
    appendMessage('System', `Other Disconnected from room `,true);
        
        socket.emit('disconnect_from_room', { room_id: currentRoomId,username:username });

    }
}

function sendMessage() {
    const message = document.getElementById('message-input').value;
    if (message && currentRoomId) {
        socket.emit('message', { room_id: currentRoomId, message: message });
        document.getElementById('message-input').value = '';
    }
}
function sendcommandMessage() {

    const message = document.getElementById('command-messages-input').value;
    if((message[0]=="B"&&!gotA)||(message[0]=="A"&&gotA)){
        
    
        if (message && currentRoomId) {
            socket.emit('command-message', { room_id: currentRoomId, message: message });
        
            document.getElementById('command-messages-input').value = '';
        }
    }
    else{
        showNotification("Invalid command ",3000);
    }
}
function sendcommandMessagebyclick(message) {


if((message[0]=="B"&&!gotA)||(message[0]=="A"&&gotA)){
    

    if (message && currentRoomId) {
        socket.emit('command-message', { room_id: currentRoomId, message: message });
    
        document.getElementById('command-messages-input').value = '';
    }
}
}
function appendMessage(sender, message,commandormssg) {
    
    const messagesElement = document.getElementById('messages');
    const messageElement = document.createElement('div');
    if (commandormssg) {
    messageElement.style.color = 'black';
} else {
    messageElement.style.color = 'green'; 
}
    messageElement.textContent = `${sender}: ${message}`;
    messagesElement.appendChild(messageElement);
    messagesElement.scrollTop = messagesElement.scrollHeight;
}






const labels = ['P1', 'P2', 'H1', 'H2', 'H3'];


function createBlocks() {
    const container = document.getElementById('container');
    labels.forEach(label => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = label;
        block.draggable = true;
        block.addEventListener('dragstart', dragStart);
        block.addEventListener('dragover', dragOver);
        block.addEventListener('drop', drop);
        container.appendChild(block);
    });
}


let draggedElement = null;

function dragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', null);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    if (draggedElement !== event.target) {
        const container = document.getElementById('container');
        const blocks = Array.from(container.children);
        const draggedIndex = blocks.indexOf(draggedElement);
        const targetIndex = blocks.indexOf(event.target);

        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedElement, event.target.nextSibling);
        } else {
            container.insertBefore(draggedElement, event.target);
        }
    }
}



window.onload = function() {
    createBlocks()
    console.log("started")
    // Code to run once the page is fully loaded

    showNotification2(" Arrange the Blocks labeled as P1 | P2 | H1 | H2 | H3  in the order u want on the board after that either join a ROOM by key or create a room and share key to your friends",10000)
};
