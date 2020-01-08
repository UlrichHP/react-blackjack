import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Card from './Card'

const App = () => {
    const [deck_id, setDeckId] = useState('');
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [playerCount, setPlayerCount] = useState(0);
    const [dealerCount, setDealerCount] = useState(0);
    const [dealerTurn, setDealerTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState(null);

    const startNewGame = () => {
        axios
            .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
            .then(response => {
                setDeckId(response.data.deck_id);
            });

        setDealerTurn(false);
        setGameOver(false);
        setMessage(null);
    };

    const giveStartCards = () => {
        axios
            .get(`https://deckofcardsapi.com/api/deck/${ deck_id }/draw/?count=2`)
            .then(response => {
                setPlayer(response.data.cards);
            });
        axios
            .get(`https://deckofcardsapi.com/api/deck/${ deck_id }/draw/?count=1`)
            .then(response => {
                setDealer(response.data.cards);
            });
    };

    const getCount = (type) => {
        const count = [];
        let cards = [];
        let totalCount = 0;

        if (type === 'player') {
            cards = [...player];
            totalCount = playerCount;
        } else {
            cards = [...dealer];
            totalCount = dealerCount;
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
        
        if (type === 'player') {
            setPlayerCount(totalCount);
        } else {
            setDealerCount(totalCount);
        }
        cards = [];
        totalCount = 0;
    };

    const hit = () => {
        if (!gameOver) {
            const updatedPlayer = [...player];

            axios
                .get(`https://deckofcardsapi.com/api/deck/${ deck_id }/draw/?count=1`)
                .then(response => {      
                    updatedPlayer.push(response.data.cards[0]);
                    setPlayer(updatedPlayer);
                });
        } else {
            setMessage('Partie terminée !');
        }
    };

    const stand = () => {
        if (!gameOver) {
            setDealerTurn(false);
            const updatedDealer = [...dealer];

            axios
                .get(`https://deckofcardsapi.com/api/deck/${ deck_id }/draw/?count=1`)
                .then(response => {      
                    updatedDealer.push(response.data.cards[0]);
                    setDealer(updatedDealer);
                    setDealerTurn(true);
                });
        } else {
            setMessage('Partie terminée !');
        }
    };

    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (deck_id.length > 1)
            giveStartCards();
    }, [deck_id]);

    useEffect(() => {
        getCount('player');
        getCount('dealer');
    });

    useEffect(() => {
        if (playerCount > 21) {
            setGameOver(true);
            setMessage('Perdu...');
        } else if (dealerCount > 21) {
            setDealerTurn(false);
            setGameOver(true);
            setMessage('La banque a perdu ! Bravo !');
        } else if (dealerCount >= playerCount && dealerTurn) {
            setDealerTurn(false);
            setGameOver(true);
            setMessage('La banque gagne...');
        } else if (dealerTurn) {
            stand(); // Draw another card
        }
    }, [dealerTurn, dealerCount, playerCount]);

    return (
        <React.Fragment>
            <h1>Blackjack</h1>
            <div id="main">
                {
                    message !== null 
                    ?
                        <p className="result">{ message }</p>
                    : 
                        ''
                }

                <div className="buttons">
                    <button onClick={startNewGame}>Nouvelle Partie</button>
                    <button className="hit" onClick={hit}>Tirer</button>
                    <button className="stand" onClick={stand}>Laisser</button>
                </div>
            
                <p>Joueur ({ playerCount })</p>
                <div className="cards player">
                    { player.map(card => (
                        <Card key={card.code} 
                            image={card.image} 
                            code={card.code} />
                    ))}
                </div>
                
                <p>Banque ({ dealerCount })</p>
                <div className="cards dealer">
                    { dealer.map(card => (
                        <Card key={card.code} 
                            image={card.image} 
                            code={card.code} />
                    ))}
                    {
                        dealer.length === 1 ? <div className="card"></div> : ''
                    }
                </div>
            </div>
        </React.Fragment>
    );
};

export default App
