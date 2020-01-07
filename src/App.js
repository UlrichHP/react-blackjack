import React, { Component } from 'react'
import axios from 'axios'
import './App.css';
import Card from './Card'

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deck_id: '',
            dealer: [],
            player: [],
            playerCount: 0,
            dealerCount: 0,
            gameOver: false,
            message: null
        };
    }

    startNewGame() {
        axios
            .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(response => {
                const deck_id = response.data.deck_id;
                this.setState({deck_id}, this.giveStartCards);
            });
    }

    giveStartCards = () => {
        axios
            .get(`https://deckofcardsapi.com/api/deck/${ this.state.deck_id }/draw/?count=2`)
            .then(response => {      
                const player = response.data.cards;
                this.setState({ player });
                this.getCount("player");
            });
        axios
            .get(`https://deckofcardsapi.com/api/deck/${ this.state.deck_id }/draw/?count=2`)
            .then(response => {      
                const dealer = response.data.cards;
                this.setState({ dealer });
                this.getCount("dealer");
            });
    }

    getCount(type) {
        const count = [];
        let cards = [];
        let totalCount = 0;

        if (type === "player") {
            cards = [...this.state.player];
            totalCount = this.state.playerCount;
        } else {
            cards = [...this.state.dealer];
            totalCount = this.state.dealerCount;
        }
        
        cards.forEach(card => {
            if (card.value === 'ACE' || card.value === 'JACK' || card.value === 'QUEEN' || card.value === 'KING') {
                count.push(card.value);
            } else if (card.value) {
                count.push(parseInt(card.value));
            }
        });

        totalCount = count.reduce((total, card) => {
            if (card === 'JACK' || card === 'QUEEN' || card === 'KING') {
                return total + 10;
            } else if (card === 'ACE') {
                return (total + 11 <= 21) ? total + 11 : total + 1;
            } else {
                return total + card;
            }
        }, 0);
        
        if (type === "player") {
            this.setState({ playerCount: totalCount });
        } else {
            this.setState({ dealerCount: totalCount });
        }
    }

    componentDidMount = () => {
        this.startNewGame()
    };

    render() {
        return (
            <React.Fragment>
                <h1>Blackjack</h1>
                <div id="main">
                    {
                        this.state.message !== null 
                        ?
                            <p className="result">{ this.state.message }</p>
                        : 
                            ''
                    }

                    <div className="buttons">
                        <button onClick={() => {this.startNewGame()}}>Nouvelle Partie</button>
                        <button className="hit" onClick={() => {this.hit()}}>Tirer</button>
                        <button className="stand" onClick={() => {this.stand()}}>Laisser</button>
                    </div>
                
                    <p>Joueur ({ this.state.playerCount })</p>
                    <div className="cards">
                        { this.state.player.map(card => (
                            <Card key={card.code} 
                                image={card.image} 
                                code={card.code} />
                        ))}
                    </div>
                    
                    <p>Banque ({ this.state.dealerCount })</p>
                    <div className="cards">
                        { this.state.dealer.map(card => (
                            <Card key={card.code} 
                                image={card.image} 
                                code={card.code} />
                        ))}
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

export default App
