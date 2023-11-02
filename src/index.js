import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import * as signalR from '@microsoft/signalr';

function Square(props) {
    return (
        <button className="square" disabled={!props.enable}
                onClick={props.onClick}>
            {props.value}
        </button>
    )
}

function Board(props) {

    function renderSquare(i) {
        return <Square value={props.board[i]} enable={props.enable}
                       onClick={() => props.onClick(i)}/>;
    }

    return (
        <div>
            <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    );

}


// connection.invoke("sendAll", 'user', 'message').catch(function (err) {
//     return console.error(err.toString());
// });

// connection.invoke('sendAll', 'user1', 'Hello world');

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            board: Array(9).fill(' '),
            xIsNext: true,
            name: '',
        };
        this.updateName = this.updateName.bind(this);
        this.timer = null;

        this.connection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Debug)
            .withUrl('https://localhost:7138/Test',
                {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                }
            )
            .build();

        this.connection.on('ReceiveMessage', (gameState) => {
            this.setState({...gameState})
            // console.log(user, message);
        })

        this.connection.on('sayHi', (msg) => {
            console.log(msg)
            // console.log(user, message);
        })



        // setTimeout(()=>{
        //     this.connectionconnection.invoke("SendMessage", 'A', 'message').catch(function (err) {
        //         return console.error(err.toString());
        //     });
        // }, 5000);

    }

    // componentDidMount() {
    //     this.timer = setInterval(()=>{console.log('www')}, 1000);
    // }
    //
    // componentWillUnmount() {
    //     clearInterval(this.timer);
    //     this.timer = null;
    // }

    handleClick(i) {
        const board = this.state.board.slice();

        // Immutability
        if (calculateWinner(board)) {
            if (this.timer !== null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            return;
        }
        if (board[i] !== ' ') {
            return
        }

        // board[i] = this.state.sign;
        // this.setState({
        //     board: board,
        // });


        this.connection.invoke("modifyCell", i).catch(function (err) {
            return console.error(err.toString());
        });

        // fetch(`https://localhost:7138/TicTacToe/game?player=${this.state.name}&number=${i}`,
        //     {method: 'PATCH'}).then(resp => {
        //     this.updateStateFromServer(this.state.name);
        // });

        // if (this.timer === null) {
        //     this.timer = setInterval(() => {
        //         this.updateStateFromServer(this.state.name)
        //     }, 300);
        // }
    }

    updateStateFromServer(player) {
        // fetch('https://localhost:7138/TicTacToe/game?player=' + player,
        //     {method: 'GET'}).then((resp) => {
        //     return resp.json()
        // }).then(data => {
        //     this.setState(data);
        // })
    }

    updateName(event) {
        this.setState({
            name: this.inputRef.current.value
        });

        if(this.connection.state === 'Disconnected'){
            this.connection.start().then(function () {
            console.log(this.connection.state)
            }).catch(function (err) {
                console.log(err.toString());
            });

        }
        console.log(this.connection.state)
        // fetch('https://localhost:7138/TicTacToe/game?player=' + this.inputRef.current.value, {
        //     method: 'POST',
        //     body: {player: this.inputRef.current.value}
        // });
        this.connection.invoke("joinWebsocket", this.inputRef.current.value).catch(function (err) {
            return console.error(err.toString());
        });

        this.updateStateFromServer(this.inputRef.current.value);
    }

    render() {


        const board = this.state.board;
        const winner = this.state.winner;


        let status;
        if (winner !== undefined && winner !== '' && winner !== ' ') {
            status = 'Winner: ' + winner;
        } else {
            status = this.state.sign === undefined || this.state.sign === null ? 'Waiting for game start' : 'You are ' + this.state.sign;
        }


        return (
            <div className="game">
                <div className="game-board">
                    <Board board={board} enable={this.state.name !== ""}
                           onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <input ref={this.inputRef} disabled={this.state.name !== ""}></input>
                    <button disabled={this.state.name !== ""}
                            onClick={this.updateName}>
                        確認名字
                    </button>
                    <div>{status}</div>
                    <ol>{/* TODO */}</ol>


                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game/>);

function calculateWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (board[line[0]] === board[line[1]] &&
            board[line[1]] === board[line[2]] &&
            board[line[0]] !== ' ') {
            return board[line[0]];
        }
    }
    return null;
}