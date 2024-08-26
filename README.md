# kallurimanyusrenitha21BIT0446
# Turn-Based Chess-Like Game with WebSocket Communication

## Overview

This project is a turn-based chess-like game where two players compete on a 5x5 grid using various characters. The game uses WebSocket for real-time communication between clients and the server. The web client is built with HTML, CSS, and JavaScript, while the server-side logic is implemented in Python.

### Key Components

1. **Server (Python)**
   - Implements game logic and WebSocket server.
   - Processes game moves and maintains the game state.

2. **WebSocket Layer**
   - Manages real-time communication between the server and clients.
   - Handles events such as game initialization, moves, and state updates.

3. **Web Client (HTML, CSS, JavaScript)**
   - Provides a web-based interface for interacting with the game.
   - Uses WebSocket to communicate with the server.
   - Renders the game board, handles user inputs, and displays game state.

### Project Structure

- `server.py` - Python script that contains the server-side logic and WebSocket server implementation.
- `static/`
  - `css/`
    - `bootstrap.min.css` - Bootstrap CSS framework.
    - `bootstrap-icons.css` - Bootstrap Icons.
    - `templatemo-festava-live.css` - Custom CSS for the template.
    - `main.css` - Additional custom styles.
  - `js/`
    - `jquery.min.js` - jQuery library.
    - `bootstrap.min.js` - Bootstrap JavaScript library.
    - `jquery.sticky.js` - Sticky elements functionality.
    - `click-scroll.js` - Smooth scrolling behavior.
    - `custom.js` - Custom JavaScript functions.
    - `main.js` - Main JavaScript file for WebSocket communication and game logic.
  - `video/`
    - `pexels-2022395.mp4` - Background video for the hero section.
- `index.html` - Main HTML file for the web client interface.

### Game Rules

#### Setup

- **Grid**: 5x5 board.
- **Characters**:
  - **Pawn**: Moves one block in any direction (Left, Right, Forward, Backward).
  - **Hero1**: Moves two blocks straight.
  - **Hero2**: Moves two blocks diagonally.

#### Game Flow

- **Initial Setup**: Players arrange characters on their starting row.
- **Turns**: Alternating turns with one move per turn.
- **Combat**: Characters capture opponents by moving into or through their position.
- **Invalid Moves**: Moves that exceed bounds or target friendly pieces are invalid.

#### Winning

- The game ends when one player eliminates all of their opponent’s characters.

### Setup Instructions

#### Prerequisites

- Python 3.x
- Web browser (for the client-side)

#### Server Setup

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-folder>
