import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import * as signalR from '@microsoft/signalr';

function Square(props) {
    const [imgUrl, setImgUrl] = useState(' ');

    useEffect(() => {
        const randomParam = Math.random();
        const img = props.value === ' ' ? '' : props.value === 'X' ? `cross.svg??${randomParam}` : `circle.svg?${randomParam}`;
        setImgUrl(img);
    }, [props.value]);

    return (
    <button className="square"
            onClick={props.onClick}>

        {props.value !== ' ' && (
        <img src={imgUrl} width={'100%'} height={'100%'} alt={props.value}/>
         )}

    </button>
    )
}

function Board(props) {

    function renderSquare(i) {
        return <Square value={props.board[i]}
                       index={i}
                       // enable={props.enable}
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

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            board: Array(9).fill(' '),
            xIsNext: true,
            name: '',
        };
        this.startGame = this.startGame.bind(this);
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
        })

        this.connection.on('sayHi', (msg) => {
            console.log(msg)
        })


    }

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


        this.connection.invoke("modifyCell", i).catch(function (err) {
            return console.error(err.toString());
        });

    }

    startGame(event) {

        if(this.connection.state === 'Disconnected'){
            this.connection.start().then(function () {
            console.log(this.connection.state)
            }).catch(function (err) {
                console.log(err.toString());
            });

        }
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
                    <Board board={board}
                           // enable={this.state.name !== ""}
                           onClick={(i) => this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    {/*<input ref={this.inputRef} disabled={this.state.name !== ""}></input>*/}
                    <button disabled={this.state.name !== ""}
                            onClick={this.startGame}>
                        加入遊戲
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