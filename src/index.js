import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

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
        return <Square value={props.squares[i]} enable={props.enable}
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
            history: [{
                squares: Array(9).fill(null),

            }],
            xIsNext: true,
            name: "",
        };

        this.updateName = this.updateName.bind(this);

    }

    handleClick(i) {
        const history = this.state.history;
        const current = history[history.length - 1];

        // Immutability
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            xIsNext: !this.state.xIsNext
        });

        fetch(`https://localhost:7138/TicTacToe/game?player=${this.state.name}&number=${i}`,
            {method: 'PATCH'});

    }

    updateName(event) {
        this.setState({
            name: this.inputRef.current.value
        });

        fetch('https://localhost:7138/TicTacToe/game', {method: 'POST'});

        fetch('https://localhost:7138/TicTacToe/game?player='+this.inputRef.current.value,
            {method:'GET'}).then((resp) =>{
                return resp.json()
        }).then(data =>{
            this.setState(data);
        })

    }

    render() {
        const history = this.state.history;
        const current = history[history.length - 1];
        const winner = calculateWinner(current.squares);


        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.props.xIsNext ? 'X' : 'O');
        }


        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares} enable={this.state.name !== ""}
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

function calculateWinner(squares) {
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
        if (squares[line[0]] === squares[line[1]] &&
            squares[line[1]] === squares[line[2]] &&
            squares[line[0]]) {
            return squares[line[0]];
        }
    }
    return null;
}