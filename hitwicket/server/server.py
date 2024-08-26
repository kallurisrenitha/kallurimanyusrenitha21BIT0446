from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

rooms = {}
boards={}

def generate_room_id():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('create_room')
def handle_create_room(data):

    room_id = generate_room_id()
    username = data.get('username')
    position=data.get('position')
    rooms[room_id] = {'users': [], 'usernames': {},'turn': None}
    join_room(room_id)
   
    mapping = {
        '':0,
        'H1':1,
        'H2':2,
        'H3':3,
        'P1':4,
        'P2':5,
        
        }
    
    array=[[1,2,3,4,5],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
    for i in range(0,len(position)):
        print(position[i])
        array[0][i]=mapping.get(position[i])



    boards[room_id]=array
    rooms[room_id]['users'].append(request.sid)
    rooms[room_id]['usernames'][request.sid] = username
    if len(rooms[room_id]['users']) == 1:
        rooms[room_id]['turn'] = request.sid
    emit('room_created', {'room_id': room_id,"board":array}, room=request.sid)
    emit('update_players', {'room_id': room_id, 'players': list(rooms[room_id]['usernames'].values()),'board':boards[room_id]}, room=room_id)
    print(f"Room created: {room_id} by {username}")

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data.get('room_id')
    username = data.get('username')
    position=data.get('position')
    array =boards[room_id]
    mapping = {
        '':0,
        'H1':6,
        'H2':7,
        'H3':8,
        'P1':9,
        'P2':10,
        
        }
    if room_id in rooms:
        if len(rooms[room_id]['users'])<2:
            rooms[room_id]['users'].append(request.sid)
            join_room(room_id)
            board=boards[room_id]
            for i in range(0,len(position)):
                board[4][i]=mapping.get(position[i])
            boards[room_id]=board

            rooms[room_id]['usernames'][request.sid] = username
            if len(rooms[room_id]['users']) == 1:
                rooms[room_id]['turn'] = request.sid
            emit('room_joined', {'room_id': room_id,"board":array}, room=request.sid)
            emit('update_players', {'room_id': room_id, 'players': list(rooms[room_id]['usernames'].values()),'board':boards[room_id]}, room=room_id)

            print(f"Client {request.sid} with username {username} joined room {room_id}")
    else:
        emit('room_not_found', {'room_id': room_id})

@socketio.on('message')
def handle_message(data):
    room_id = data.get('room_id')
    message = data.get('message')
    username = rooms[room_id]['usernames'].get(request.sid, 'Anonymous') if room_id in rooms else 'Anonymous'
    if room_id in rooms:
        emit('message', {'message': message, 'room_id': room_id, 'username': username}, room=room_id)
    else:
        print(f"Room {room_id} not found")

@socketio.on('getnofoplayer')
def getnoofplayer(data):
    room_id = data.get('room_id')
    if room_id in rooms:
        count=len(rooms[room_id]['users'])
        print("no of players"+str(count))
        emit('gotnoofplayers', {"count":count, "room_id":room_id})

        
    

@socketio.on('command-message')
def handle_command_message(data):
    room_id = data.get('room_id')
    command = data.get('message')
    username = rooms[room_id]['usernames'].get(request.sid, 'Anonymous') if room_id in rooms else 'Anonymous'
    
    if room_id in rooms:
        if request.sid == rooms[room_id]['turn']: 
            board = boards[room_id]
            success, error_message,killed = process_command(board, command, room_id)
            if success:

                current_turn_index = rooms[room_id]['users'].index(request.sid)
                next_turn_index = (current_turn_index + 1) % 2
                rooms[room_id]['turn'] = rooms[room_id]['users'][next_turn_index]
                
                if check_winner(room_id):
                    emit('command-message', {'winnerfound': True, 'message': command, 'username': username, 'room_id': room_id, 'board': board,"killed":killed}, room=room_id)
                else:
                    emit('command-message', {'winnerfound': False, 'message': command, 'username': username, 'room_id': room_id, 'board': board,"killed":killed}, room=room_id)
            else:
                emit('error', {'message': error_message}, room=room_id)
        else:
            emit('error', {'message': 'It is not your turn.'}, room=request.sid)
    else:
        print(f"Room {room_id} not found")




def process_command(board, command,room_id):
    try:
        killed=[]
     
        print(command)
        character, move = command.split(':')
       
        direction = move
        print(direction)

       
        
        mapping = {
        '':0,
        'A-H1':1,
        'A-H2':2,
        'A-H3':3,
        'A-P1':4,
        'A-P2':5,
        'B-H1':6,
        'B-H2':7,
        'B-H3':8,
        'B-P1':9,
        'B-P2':10
        }

   
        for r in range(0,5):
            for c in range(0,5):
                if board[r][c] == mapping.get(character):
                    all_positions = calculate_new_position(direction, character[2:4])
                
                    count=0
                    for new_r,new_c in all_positions:
                        if is_valid_position(r+new_r, c+new_c,character,board) :
                            count+=1

                    
                    
                    if count==len(all_positions):
                        for req_r,req_c in all_positions:
                            board[r][c] = 0 
                            req_c+=c
                            req_r+=r
                            if board[req_r][req_c] !=0:
                                killed.append([req_r,req_c])

                            board[req_r][req_c] =0  
                            print("is valid position")
                            boards[room_id]=board
                            print(board)

                        main_r,main_c=all_positions[0]
                        main_r+=r
                        main_c+=c
                        print("new position")
                        print(main_r)
                        print(main_c)
                        board[main_r][main_c]= mapping.get(character, 0)
                        boards[room_id]=board
                        print(board)
                        
                        return True ,None ,killed
                        
                    
                    else:

                        return False, "Character not found.",killed
    except Exception as e:
        return False, str(e)
def is_valid_position(row, col,character,board):
    print(board)
    if 0 <= row < 5 and 0 <= col < 5:
        
    
        
        mapping = {
        '':0,
        'A-H1':1,
        'A-H2':2,
        'A-H3':3,
        'A-P1':4,
        'A-P2':5,
        'B-H1':6,
        'B-H2':7,
        'B-H3':8,
        'B-P1':9,
        'B-P2':10
        }
        reverse_mapping  = {
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
        }
        if reverse_mapping.get(board[row][col])=="":
            return True
        if character[0] ==reverse_mapping.get(board[row][col])[0]:
            return False
        return True
    return False

    """Check if the position is within the board limits."""
    
def calculate_new_position(direction, char_type):
    """Calculate new position based on direction and character type."""
    move_offsets = {
        'P1': {
            'L': [(0, -1)],
            'R': [(0, 1)],
            'F': [(-1, 0)],
            'B': [(1, 0)]
        },
        'P2': {
            'L': [(0, -1)],
            'R': [(0, 1)],
            'F': [(-1, 0)],
            'B': [(1, 0)]
        },
        'H1': {
            'L': [(0, -2),(0,-1)],
            'R': [(0, 2),(0,1)],
            'F': [(-2, 0),(-1,0)],
            'B': [(2, 0),(1,0)]
        },
        'H2': {
            'FL': [(-2, -2),(-1,-1)],
            'FR': [(-2, 2),(-1,1)],
            'BL': [(2, -2),(1,-1)],
            'BR': [(2, 2),(1,1)]
        },
        'H3': {  
            'FL': [(-2, -1)],
            'FR': [(-2, 1)],
            'BL': [(2, -1)],
            'BR': [(2, 1)],
            'RF': [(-1, 2)],
            'RB': [(1, 2)],
            'LF': [(-1, -2)],
            'LB': [(1, -2)]
        }
        
    }
    offsets = move_offsets.get(char_type, {})
    print(direction)
    offset = offsets.get(direction, [(0, 0)])
    print(offset)
    return offset

@socketio.on('disconnect_from_room')
def handle_disconnect_from_room(data):
    room_id = data.get('room_id')
    if room_id in rooms:
        if request.sid in rooms[room_id]['users']:
            leave_room(room_id)
            rooms[room_id]['users'].remove(request.sid)
            del rooms[room_id]['usernames'][request.sid]
            if len(rooms[room_id]['users']) == 0:
                del rooms[room_id]
                del boards[room_id]
                print(f"Room {room_id} deleted as all players left.")
            else:
                
                emit('update_players', {'room_id': room_id, 'players': list(rooms[room_id]['usernames'].values())}, room=room_id)
            print(f"Client {request.sid} disconnected from room {room_id}")

@socketio.on('player_move')
def handle_player_move(data):
    room_id = data['room_id']
    print(room_id)
    current_turn_user_id = rooms[room_id]['turn']
    print(current_turn_user_id)

    current_turn_username = rooms[room_id]['usernames'].get(current_turn_user_id)
    print(current_turn_username)
    
   
    emit('turn_update', {'room_id': room_id, 'current_turn_player': current_turn_username}, room=room_id)

@socketio.on('disconnect')
def handle_disconnect():
    for room_id, room_data in rooms.items():
        if request.sid in room_data['users']:
            leave_room(room_id)
            room_data['users'].remove(request.sid)
            del room_data['usernames'][request.sid]
            if not room_data['users']:
                del rooms[room_id]
                print(f"Room {room_id} deleted")

def check_winner(room_id):

    board = boards[room_id]
    count1=0
    count2=0
    print("checking winners")
    for i in range(5):
        for j in range(5):
            if 0<=board[i][j]<6:
                count1=count1+1
            if 6<=board[i][j]<11:
                count2=count2+1

    
    if count1==0:
        return True
    elif count2==0:
        return True
    print("no winner")

    return False
if __name__ == '__main__':
    socketio.run(app, debug=True)
