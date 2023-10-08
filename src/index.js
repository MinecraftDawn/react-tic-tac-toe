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

class Board extends React.Component {

    renderSquare(i) {
        return <Square value={this.props.squares[i]} enable={this.props.enable}
                onClick={()=> this.props.onClick(i) } />;
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            history : [{
                squares: Array(9).fill(null),

            }],
            xIsNext: true,
            name: "",
        };

        this.updateName = this.updateName.bind(this);

    }

    handleClick(i){
        const history = this.state.history;
        const current = history[history.length-1];

        // Immutability
        const squares = current.squares.slice();
        if(calculateWinner(squares) || squares[i]){
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            xIsNext: !this.state.xIsNext});

    }

    updateName(event){
        this.setState({
            name:event.target.value,
        });

    }

    render() {
        const history = this.state.history;
        const current = history[history.length-1];
        const winner = calculateWinner(current.squares);


        let status;
        if (winner){
            status = 'Winner: ' + winner;
        }else{
            status = 'Next player: ' + (this.props.xIsNext ? 'X' : 'O');
        }


        return (
            <div className="game">
                <div className="game-board" >
                    <Board squares = {current.squares} enable={this.state.name!==""}
                    onClick={(i)=>this.handleClick(i)}/>
                </div>
                <div className="game-info">
                    <input ref={this.inputRef} disabled={this.state.name!==""}></input>
                    <button disabled={this.state.name!==""}
                            onClick={(event)=>{this.setState({'name':this.inputRef.current.value})}}>
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
root.render(<Game />);

function calculateWinner(squares){
    const lines = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        console.log("line"+line);
        if(squares[line[0]] === squares[line[1]] &&
            squares[line[1]] === squares[line[2]] &&
            squares[line[0]]){
            return squares[line[0]];
        }
    }
    return null;
}