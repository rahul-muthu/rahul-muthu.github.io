// Typing animation for terminal
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Animate stats on scroll
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
                
                let current = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        target.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        target.textContent = Math.floor(current) + finalValue.replace(/[0-9]/g, '');
                    }
                }, 20);
                
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add active state to navigation based on scroll position
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Get only the main portfolio sections, not the game sections
    const portfolioSections = Array.from(sections).filter(section => {
        const id = section.getAttribute('id');
        return !['blackjack-game', 'coinflip-game', 'montyhall-game', 'coupon-game', 'segtree-game'].includes(id);
    });
    
    let current = '';
    const scrollPos = window.scrollY + 150; // Offset for header height
    
    // Find the section that's currently most visible
    portfolioSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            current = section.getAttribute('id');
        }
    });
    
    // If we're at the very top, default to 'about'
    if (scrollPos < 200) {
        current = 'about';
    }
    
    // Update navigation links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Terminal typing effect
function initTerminalAnimation() {
    const commands = document.querySelectorAll('.command');
    const outputs = document.querySelectorAll('.output');
    
    // Animate commands one by one
    commands.forEach((command, index) => {
        setTimeout(() => {
            const text = command.textContent;
            typeWriter(command, text, 30);
            
            // Animate corresponding output after command
            setTimeout(() => {
                if (outputs[index]) {
                    outputs[index].style.opacity = '0';
                    outputs[index].style.transform = 'translateY(10px)';
                    outputs[index].style.transition = 'all 0.5s ease';
                    
                    setTimeout(() => {
                        outputs[index].style.opacity = '1';
                        outputs[index].style.transform = 'translateY(0)';
                    }, 100);
                }
            }, text.length * 30 + 500);
        }, index * 1000);
    });
}

// Parallax effect for terminal
function initParallax() {
    const terminal = document.querySelector('.terminal');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        terminal.style.transform = `translateY(${rate}px)`;
    });
}

// Add hover effects to project cards
function initHoverEffects() {
    const cards = document.querySelectorAll('.project-card, .publication, .blog-post, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Add cursor blink effect to terminal
function initCursorBlink() {
    const cursor = document.querySelector('.command:last-child');
    if (cursor) {
        setInterval(() => {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }
}

// === UI Blackjack Game ===
(function() {
    // Card values and suits
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = [
        {name: 'A', value: 11},
        {name: '2', value: 2},
        {name: '3', value: 3},
        {name: '4', value: 4},
        {name: '5', value: 5},
        {name: '6', value: 6},
        {name: '7', value: 7},
        {name: '8', value: 8},
        {name: '9', value: 9},
        {name: '10', value: 10},
        {name: 'J', value: 10},
        {name: 'Q', value: 10},
        {name: 'K', value: 10}
    ];
    function getCountValue(rank) {
        if ([2,3,4,5,6].includes(rank.value)) return 1;
        if ([7,8,9].includes(rank.value)) return 0;
        return -1;
    }
    let runningCount = 0;
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let inProgress = false;
    // DOM
    const bjSection = document.getElementById('blackjack-game');
    if (!bjSection) return;
    const bjDealer = document.getElementById('bj-dealer-hand');
    const bjPlayer = document.getElementById('bj-player-hand');
    const bjMsg = document.getElementById('bj-message');
    const bjHit = document.getElementById('bj-hit');
    const bjStand = document.getElementById('bj-stand');
    const bjNew = document.getElementById('bj-newgame');
    const bjCount = document.getElementById('bj-count');
    // Show the UI section
    bjSection.style.display = '';
    // Hide text-based version
    window.playBlackjack = function() {
        alert('UI version is active! Use the on-page controls.');
    };
    function createDeck() {
        const d = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                d.push({
                    name: rank.name + suit,
                    value: rank.value,
                    rank: rank,
                    suit: suit
                });
            }
        }
        return d;
    }
    function shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    function handValue(hand) {
        let value = 0;
        let aces = 0;
        for (const card of hand) {
            value += card.value;
            if (card.rank.name === 'A') aces++;
        }
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        return value;
    }
    function updateCount(cards) {
        for (const card of cards) {
            runningCount += getCountValue(card.rank);
        }
    }
    function renderHand(hand, el, hideFirst) {
        el.innerHTML = '';
        hand.forEach((card, i) => {
            const div = document.createElement('div');
            div.className = 'bj-card' + ((card.suit === '♥' || card.suit === '♦') ? ' red' : '');
            if (hideFirst && i === 0) {
                div.innerHTML = '<span class="bj-rank">?</span><span class="bj-suit">?</span>';
            } else {
                div.innerHTML = `<span class="bj-rank">${card.rank.name}</span><span class="bj-suit">${card.suit}</span>`;
            }
            el.appendChild(div);
        });
    }
    function setMessage(msg) {
        bjMsg.textContent = msg;
    }
    function setCount() {
        bjCount.textContent = 'Running count: ' + runningCount;
    }
    function setControls(active) {
        bjHit.disabled = !active;
        bjStand.disabled = !active;
    }
    function endGame(msg) {
        inProgress = false;
        setMessage(msg);
        setControls(false);
        // Reveal dealer hand
        renderHand(dealerHand, bjDealer, false);
        setCount();
    }
    function startGame() {
        deck = shuffle(createDeck());
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];
        runningCount = 0;
        updateCount([...playerHand, ...dealerHand]);
        inProgress = true;
        setControls(true);
        setMessage('Your move!');
        renderHand(playerHand, bjPlayer, false);
        renderHand(dealerHand, bjDealer, true);
        setCount();
    }
    function playerHit() {
        if (!inProgress) return;
        const card = deck.pop();
        playerHand.push(card);
        updateCount([card]);
        renderHand(playerHand, bjPlayer, false);
        setCount();
        const val = handValue(playerHand);
        if (val > 21) {
            endGame('BUST! Dealer wins.');
        }
    }
    function playerStand() {
        if (!inProgress) return;
        setControls(false);
        // Dealer's turn
        renderHand(dealerHand, bjDealer, false);
        let dealerVal = handValue(dealerHand);
        while (dealerVal < 17) {
            const card = deck.pop();
            dealerHand.push(card);
            updateCount([card]);
            dealerVal = handValue(dealerHand);
        }
        renderHand(dealerHand, bjDealer, false);
        setCount();
        const playerVal = handValue(playerHand);
        let msg = '';
        if (dealerVal > 21) {
            msg = 'Dealer busts! You win!';
        } else if (playerVal > dealerVal) {
            msg = 'You win!';
        } else if (playerVal < dealerVal) {
            msg = 'Dealer wins!';
        } else {
            msg = "It's a tie!";
        }
        endGame(msg);
    }
    bjHit.addEventListener('click', playerHit);
    bjStand.addEventListener('click', playerStand);
    bjNew.addEventListener('click', function() {
        startGame();
    });
    // Start a game on load
    startGame();
})();

// === Coin Flip Betting Simulator ===
(function() {
    // Game state
    let bankroll = 1000;
    let coinBias = 0.5; // 0.5 = fair coin, > 0.5 = heads favored
    let wins = 0;
    let losses = 0;
    let totalBetAmount = 0;
    let lastBet = 10;
    let consecutiveLosses = 0;
    let isFlipping = false;
    
    // DOM elements
    const cfSection = document.getElementById('coinflip-game');
    if (!cfSection) return;
    
    const cfBankroll = document.getElementById('cf-bankroll');
    const cfBias = document.getElementById('cf-bias');
    const cfCoin = document.getElementById('cf-coin');
    const cfMessage = document.getElementById('cf-message');
    const cfBetAmount = document.getElementById('cf-bet-amount');
    const cfStrategy = document.getElementById('cf-strategy');
    const cfHeads = document.getElementById('cf-heads');
    const cfTails = document.getElementById('cf-tails');
    const cfReset = document.getElementById('cf-reset');
    const cfBiasBtn = document.getElementById('cf-bias-btn');
    const cfWins = document.getElementById('cf-wins');
    const cfLosses = document.getElementById('cf-losses');
    const cfWinRate = document.getElementById('cf-winrate');
    const cfTotalBet = document.getElementById('cf-total-bet');
    
    // Initialize display
    updateDisplay();
    updateStats();
    
    function updateDisplay() {
        cfBankroll.textContent = `$${bankroll.toFixed(2)}`;
        cfBias.textContent = `${Math.round(coinBias * 100)}% Heads`;
        
        // Update bet amount based on strategy
        const strategy = cfStrategy.value;
        if (strategy === 'fixed-fraction') {
            const suggestedBet = Math.max(1, Math.floor(bankroll * 0.05));
            cfBetAmount.value = suggestedBet;
        } else if (strategy === 'martingale' && consecutiveLosses > 0) {
            const martingaleBet = lastBet * Math.pow(2, consecutiveLosses);
            cfBetAmount.value = Math.min(martingaleBet, bankroll);
        }
        
        // Disable betting if bankrupt or bet exceeds bankroll
        const betAmount = parseInt(cfBetAmount.value) || 0;
        const canBet = bankroll >= betAmount && betAmount > 0 && !isFlipping;
        cfHeads.disabled = !canBet;
        cfTails.disabled = !canBet;
    }
    
    function updateStats() {
        cfWins.textContent = wins;
        cfLosses.textContent = losses;
        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        cfWinRate.textContent = `${winRate}%`;
        cfTotalBet.textContent = `$${totalBetAmount}`;
    }
    
    function flipCoin(prediction) {
        if (isFlipping) return;
        
        const betAmount = parseInt(cfBetAmount.value) || 0;
        if (betAmount <= 0 || betAmount > bankroll) {
            cfMessage.textContent = 'Invalid bet amount!';
            return;
        }
        
        isFlipping = true;
        cfMessage.textContent = 'Coin is flipping...';
        updateDisplay();
        
        // Animate coin flip
        cfCoin.classList.add('flipping');
        
        setTimeout(() => {
            // Determine result based on bias
            const result = Math.random() < coinBias ? 'heads' : 'tails';
            const won = prediction === result;
            
            // Update coin display
            cfCoin.style.transform = result === 'heads' ? 'rotateY(0deg)' : 'rotateY(180deg)';
            cfCoin.classList.remove('flipping');
            
            // Update game state
            bankroll -= betAmount;
            totalBetAmount += betAmount;
            
            if (won) {
                bankroll += betAmount * 2; // Win doubles your bet
                wins++;
                consecutiveLosses = 0;
                cfMessage.textContent = `🎉 You won! Coin landed on ${result}. +$${betAmount}`;
                cfMessage.style.color = '#00ff88';
            } else {
                losses++;
                consecutiveLosses++;
                cfMessage.textContent = `💸 You lost! Coin landed on ${result}. -$${betAmount}`;
                cfMessage.style.color = '#ff4444';
            }
            
            lastBet = betAmount;
            
            // Check for bankruptcy
            if (bankroll <= 0) {
                cfMessage.textContent += ' 💀 BANKRUPT! Game Over!';
                bankroll = 0;
            }
            
            setTimeout(() => {
                cfMessage.style.color = '#ffe082';
                if (bankroll <= 0) {
                    cfMessage.textContent = 'Game Over! Reset to play again.';
                } else {
                    cfMessage.textContent = 'Choose your next prediction and bet amount';
                }
                isFlipping = false;
                updateDisplay();
                updateStats();
            }, 3000);
            
        }, 1000);
    }
    
    function resetGame() {
        bankroll = 1000;
        wins = 0;
        losses = 0;
        totalBetAmount = 0;
        lastBet = 10;
        consecutiveLosses = 0;
        isFlipping = false;
        cfBetAmount.value = 10;
        cfMessage.textContent = 'Game reset! Choose your prediction and bet amount';
        cfMessage.style.color = '#ffe082';
        cfCoin.style.transform = 'rotateY(0deg)';
        cfCoin.classList.remove('flipping');
        updateDisplay();
        updateStats();
    }
    
    function changeBias() {
        const biases = [
            { value: 0.3, label: '30% Heads (Tails Favored)' },
            { value: 0.4, label: '40% Heads' },
            { value: 0.5, label: '50% Heads (Fair Coin)' },
            { value: 0.6, label: '60% Heads' },
            { value: 0.7, label: '70% Heads (Heads Favored)' }
        ];
        
        const currentIndex = biases.findIndex(b => Math.abs(b.value - coinBias) < 0.01);
        const nextIndex = (currentIndex + 1) % biases.length;
        
        coinBias = biases[nextIndex].value;
        cfMessage.textContent = `Coin bias changed to ${biases[nextIndex].label}`;
        updateDisplay();
        
        setTimeout(() => {
            cfMessage.textContent = 'Choose your prediction and bet amount';
        }, 2000);
    }
    
    // Event listeners
    cfHeads.addEventListener('click', () => flipCoin('heads'));
    cfTails.addEventListener('click', () => flipCoin('tails'));
    cfReset.addEventListener('click', resetGame);
    cfBiasBtn.addEventListener('click', changeBias);
    
    cfBetAmount.addEventListener('input', updateDisplay);
    cfStrategy.addEventListener('change', updateDisplay);
    
    // Strategy explanations on hover
    cfStrategy.addEventListener('change', function() {
        const strategy = this.value;
        let explanation = '';
        
        switch(strategy) {
            case 'martingale':
                explanation = 'Martingale: Double bet after each loss, reset after win';
                break;
            case 'fixed-fraction':
                explanation = 'Fixed Fraction: Always bet 5% of current bankroll';
                break;
            default:
                explanation = 'Manual: Set your own bet amounts';
        }
        
        cfMessage.textContent = explanation;
        setTimeout(() => {
            if (!isFlipping) {
                cfMessage.textContent = 'Choose your prediction and bet amount';
            }
        }, 3000);
    });
    
    // Allow Enter key to flip heads
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isFlipping && !cfHeads.disabled) {
            flipCoin('heads');
        }
    });
    
})();

// === Monty Hall Simulator ===
(function() {
    // Game state
    let prizeDoor = 0;
    let chosenDoor = null;
    let openedDoor = null;
    let gamePhase = 'initial'; // 'initial', 'decision', 'revealed'
    
    // Statistics
    let stayStats = { wins: 0, total: 0 };
    let switchStats = { wins: 0, total: 0 };
    
    // DOM elements
    const mhSection = document.getElementById('montyhall-game');
    if (!mhSection) return;
    
    const mhMessage = document.getElementById('mh-message');
    const mhDoors = document.querySelectorAll('.mh-door');
    const mhDecision = document.querySelector('.mh-decision');
    const mhOpenedDoor = document.getElementById('mh-opened-door');
    const mhChosenDoor = document.getElementById('mh-chosen-door');
    const mhRemainingDoor = document.getElementById('mh-remaining-door');
    const mhStay = document.getElementById('mh-stay');
    const mhSwitch = document.getElementById('mh-switch');
    const mhNewGame = document.getElementById('mh-newgame');
    
    // Stats elements
    const mhStayWins = document.getElementById('mh-stay-wins');
    const mhStayTotal = document.getElementById('mh-stay-total');
    const mhStayRate = document.getElementById('mh-stay-rate');
    const mhSwitchWins = document.getElementById('mh-switch-wins');
    const mhSwitchTotal = document.getElementById('mh-switch-total');
    const mhSwitchRate = document.getElementById('mh-switch-rate');
    
    // Initialize game
    newGame();
    updateStats();
    
    function newGame() {
        gamePhase = 'initial';
        chosenDoor = null;
        openedDoor = null;
        prizeDoor = Math.floor(Math.random() * 3);
        
        // Reset door states
        mhDoors.forEach((door, index) => {
            door.classList.remove('selected', 'opened', 'has-prize', 'revealed');
            if (index === prizeDoor) {
                door.classList.add('has-prize');
            }
        });
        
        // Reset UI
        mhMessage.textContent = 'Choose your initial door';
        mhMessage.style.color = '#ffe082';
        mhDecision.style.display = 'none';
        mhStay.style.display = 'none';
        mhSwitch.style.display = 'none';
        
        // Add click listeners to doors
        mhDoors.forEach((door, index) => {
            door.onclick = () => chooseInitialDoor(index);
        });
    }
    
    function chooseInitialDoor(doorIndex) {
        if (gamePhase !== 'initial') return;
        
        chosenDoor = doorIndex;
        gamePhase = 'decision';
        
        // Visual feedback
        mhDoors[doorIndex].classList.add('selected');
        
        // Remove click listeners
        mhDoors.forEach(door => door.onclick = null);
        
        // Host opens a door with a goat
        setTimeout(() => {
            openHostDoor();
        }, 1000);
    }
    
    function openHostDoor() {
        // Find a door that is not chosen and doesn't have the prize
        const availableDoors = [];
        for (let i = 0; i < 3; i++) {
            if (i !== chosenDoor && i !== prizeDoor) {
                availableDoors.push(i);
            }
        }
        
        // If chosen door has the prize, pick any other door
        if (availableDoors.length === 0) {
            for (let i = 0; i < 3; i++) {
                if (i !== chosenDoor) {
                    availableDoors.push(i);
                    break;
                }
            }
        }
        
        openedDoor = availableDoors[Math.floor(Math.random() * availableDoors.length)];
        
        // Animate door opening
        mhDoors[openedDoor].classList.add('opened');
        
        // Update UI for decision phase
        setTimeout(() => {
            const remainingDoor = [0, 1, 2].find(i => i !== chosenDoor && i !== openedDoor);
            
            mhOpenedDoor.textContent = openedDoor + 1;
            mhChosenDoor.textContent = chosenDoor + 1;
            mhRemainingDoor.textContent = remainingDoor + 1;
            
            mhDecision.style.display = 'flex';
            mhStay.style.display = 'inline-block';
            mhSwitch.style.display = 'inline-block';
            
            mhMessage.textContent = 'Make your final choice: Stay or Switch?';
        }, 800);
    }
    
    function makeDecision(shouldSwitch) {
        if (gamePhase !== 'decision') return;
        
        gamePhase = 'revealed';
        
        let finalChoice;
        if (shouldSwitch) {
            finalChoice = [0, 1, 2].find(i => i !== chosenDoor && i !== openedDoor);
        } else {
            finalChoice = chosenDoor;
        }
        
        const won = finalChoice === prizeDoor;
        
        // Update statistics
        if (shouldSwitch) {
            switchStats.total++;
            if (won) switchStats.wins++;
        } else {
            stayStats.total++;
            if (won) stayStats.wins++;
        }
        
        // Reveal all doors
        mhDoors.forEach((door, index) => {
            if (index !== openedDoor) {
                door.classList.add('revealed');
            }
        });
        
        // Show result
        setTimeout(() => {
            const strategy = shouldSwitch ? 'switched' : 'stayed';
            const result = won ? 'WON' : 'LOST';
            const emoji = won ? '🎉' : '😞';
            
            mhMessage.innerHTML = `
                ${emoji} You ${strategy} and ${result}!<br>
                The prize was behind Door ${prizeDoor + 1}
            `;
            mhMessage.style.color = won ? '#00ff88' : '#ff4444';
            
            // Hide decision UI
            mhDecision.style.display = 'none';
            mhStay.style.display = 'none';
            mhSwitch.style.display = 'none';
            
            updateStats();
            
            // Auto-start new game after delay
            setTimeout(() => {
                mhMessage.textContent = 'Click "New Game" to play again';
                mhMessage.style.color = '#ffe082';
            }, 3000);
            
        }, 1000);
    }
    
    function updateStats() {
        // Stay statistics
        mhStayWins.textContent = stayStats.wins;
        mhStayTotal.textContent = stayStats.total;
        const stayRate = stayStats.total > 0 ? Math.round((stayStats.wins / stayStats.total) * 100) : 0;
        mhStayRate.textContent = `${stayRate}%`;
        
        // Switch statistics
        mhSwitchWins.textContent = switchStats.wins;
        mhSwitchTotal.textContent = switchStats.total;
        const switchRate = switchStats.total > 0 ? Math.round((switchStats.wins / switchStats.total) * 100) : 0;
        mhSwitchRate.textContent = `${switchRate}%`;
    }
    
    function resetStats() {
        stayStats = { wins: 0, total: 0 };
        switchStats = { wins: 0, total: 0 };
        updateStats();
    }
    
    // Event listeners
    mhStay.addEventListener('click', () => makeDecision(false));
    mhSwitch.addEventListener('click', () => makeDecision(true));
    mhNewGame.addEventListener('click', newGame);
    
    // Double-click new game button to reset stats
    let clickCount = 0;
    mhNewGame.addEventListener('click', function() {
        clickCount++;
        setTimeout(() => {
            if (clickCount === 1) {
                // Single click - just new game
            } else if (clickCount === 2) {
                // Double click - reset stats
                resetStats();
                mhMessage.textContent = 'Statistics reset! Choose your initial door';
                setTimeout(() => {
                    if (gamePhase === 'initial') {
                        mhMessage.textContent = 'Choose your initial door';
                    }
                }, 2000);
            }
            clickCount = 0;
        }, 300);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (gamePhase === 'initial') {
            if (e.key === '1') chooseInitialDoor(0);
            if (e.key === '2') chooseInitialDoor(1);
            if (e.key === '3') chooseInitialDoor(2);
        } else if (gamePhase === 'decision') {
            if (e.key === 's' || e.key === 'S') makeDecision(false); // Stay
            if (e.key === 'w' || e.key === 'W') makeDecision(true);  // Switch (W for sWitch)
        }
        if (e.key === 'n' || e.key === 'N') newGame(); // New game
    });
    
})();

// === Monty Hall Simulator ===
(function() {
    // Game state
    let prizeDoor = 0;
    let chosenDoor = null;
    let openedDoor = null;
    let gamePhase = 'initial'; // 'initial', 'decision', 'revealed'
    
    // Statistics
    let stayStats = { wins: 0, total: 0 };
    let switchStats = { wins: 0, total: 0 };
    
    // DOM elements
    const mhSection = document.getElementById('montyhall-game');
    if (!mhSection) return;
    
    const mhMessage = document.getElementById('mh-message');
    const mhDoors = document.querySelectorAll('.mh-door');
    const mhDecision = document.querySelector('.mh-decision');
    const mhOpenedDoor = document.getElementById('mh-opened-door');
    const mhChosenDoor = document.getElementById('mh-chosen-door');
    const mhRemainingDoor = document.getElementById('mh-remaining-door');
    const mhStay = document.getElementById('mh-stay');
    const mhSwitch = document.getElementById('mh-switch');
    const mhNewGame = document.getElementById('mh-newgame');
    
    // Stats elements
    const mhStayWins = document.getElementById('mh-stay-wins');
    const mhStayTotal = document.getElementById('mh-stay-total');
    const mhStayRate = document.getElementById('mh-stay-rate');
    const mhSwitchWins = document.getElementById('mh-switch-wins');
    const mhSwitchTotal = document.getElementById('mh-switch-total');
    const mhSwitchRate = document.getElementById('mh-switch-rate');
    
    // Initialize game
    newGame();
    updateStats();
    
    function newGame() {
        gamePhase = 'initial';
        chosenDoor = null;
        openedDoor = null;
        prizeDoor = Math.floor(Math.random() * 3);
        
        // Reset door states
        mhDoors.forEach((door, index) => {
            door.classList.remove('selected', 'opened', 'has-prize', 'revealed');
            if (index === prizeDoor) {
                door.classList.add('has-prize');
            }
        });
        
        // Reset UI
        mhMessage.textContent = 'Choose your initial door';
        mhMessage.style.color = '#ffe082';
        mhDecision.style.display = 'none';
        mhStay.style.display = 'none';
        mhSwitch.style.display = 'none';
        
        // Add click listeners to doors
        mhDoors.forEach((door, index) => {
            door.onclick = () => chooseInitialDoor(index);
        });
    }
    
    function chooseInitialDoor(doorIndex) {
        if (gamePhase !== 'initial') return;
        
        chosenDoor = doorIndex;
        gamePhase = 'decision';
        
        // Visual feedback
        mhDoors[doorIndex].classList.add('selected');
        
        // Remove click listeners
        mhDoors.forEach(door => door.onclick = null);
        
        // Host opens a door with a goat
        setTimeout(() => {
            openHostDoor();
        }, 1000);
    }
    
    function openHostDoor() {
        // Find a door that is not chosen and doesn't have the prize
        const availableDoors = [];
        for (let i = 0; i < 3; i++) {
            if (i !== chosenDoor && i !== prizeDoor) {
                availableDoors.push(i);
            }
        }
        
        // If chosen door has the prize, pick any other door
        if (availableDoors.length === 0) {
            for (let i = 0; i < 3; i++) {
                if (i !== chosenDoor) {
                    availableDoors.push(i);
                    break;
                }
            }
        }
        
        openedDoor = availableDoors[Math.floor(Math.random() * availableDoors.length)];
        
        // Animate door opening
        mhDoors[openedDoor].classList.add('opened');
        
        // Update UI for decision phase
        setTimeout(() => {
            const remainingDoor = [0, 1, 2].find(i => i !== chosenDoor && i !== openedDoor);
            
            mhOpenedDoor.textContent = openedDoor + 1;
            mhChosenDoor.textContent = chosenDoor + 1;
            mhRemainingDoor.textContent = remainingDoor + 1;
            
            mhDecision.style.display = 'flex';
            mhStay.style.display = 'inline-block';
            mhSwitch.style.display = 'inline-block';
            
            mhMessage.textContent = 'Make your final choice: Stay or Switch?';
        }, 800);
    }
    
    function makeDecision(shouldSwitch) {
        if (gamePhase !== 'decision') return;
        
        gamePhase = 'revealed';
        
        let finalChoice;
        if (shouldSwitch) {
            finalChoice = [0, 1, 2].find(i => i !== chosenDoor && i !== openedDoor);
        } else {
            finalChoice = chosenDoor;
        }
        
        const won = finalChoice === prizeDoor;
        
        // Update statistics
        if (shouldSwitch) {
            switchStats.total++;
            if (won) switchStats.wins++;
        } else {
            stayStats.total++;
            if (won) stayStats.wins++;
        }
        
        // Reveal all doors
        mhDoors.forEach((door, index) => {
            if (index !== openedDoor) {
                door.classList.add('revealed');
            }
        });
        
        // Show result
        setTimeout(() => {
            const strategy = shouldSwitch ? 'switched' : 'stayed';
            const result = won ? 'WON' : 'LOST';
            const emoji = won ? '🎉' : '😞';
            
            mhMessage.innerHTML = `
                ${emoji} You ${strategy} and ${result}!<br>
                The prize was behind Door ${prizeDoor + 1}
            `;
            mhMessage.style.color = won ? '#00ff88' : '#ff4444';
            
            // Hide decision UI
            mhDecision.style.display = 'none';
            mhStay.style.display = 'none';
            mhSwitch.style.display = 'none';
            
            updateStats();
            
            // Auto-start new game after delay
            setTimeout(() => {
                mhMessage.textContent = 'Click "New Game" to play again';
                mhMessage.style.color = '#ffe082';
            }, 3000);
            
        }, 1000);
    }
    
    function updateStats() {
        // Stay statistics
        mhStayWins.textContent = stayStats.wins;
        mhStayTotal.textContent = stayStats.total;
        const stayRate = stayStats.total > 0 ? Math.round((stayStats.wins / stayStats.total) * 100) : 0;
        mhStayRate.textContent = `${stayRate}%`;
        
        // Switch statistics
        mhSwitchWins.textContent = switchStats.wins;
        mhSwitchTotal.textContent = switchStats.total;
        const switchRate = switchStats.total > 0 ? Math.round((switchStats.wins / switchStats.total) * 100) : 0;
        mhSwitchRate.textContent = `${switchRate}%`;
    }
    
    function resetStats() {
        stayStats = { wins: 0, total: 0 };
        switchStats = { wins: 0, total: 0 };
        updateStats();
    }
    
    // Event listeners
    mhStay.addEventListener('click', () => makeDecision(false));
    mhSwitch.addEventListener('click', () => makeDecision(true));
    mhNewGame.addEventListener('click', newGame);
    
    // Double-click new game button to reset stats
    let clickCount = 0;
    mhNewGame.addEventListener('click', function() {
        clickCount++;
        setTimeout(() => {
            if (clickCount === 1) {
                // Single click - just new game
            } else if (clickCount === 2) {
                // Double click - reset stats
                resetStats();
                mhMessage.textContent = 'Statistics reset! Choose your initial door';
                setTimeout(() => {
                    if (gamePhase === 'initial') {
                        mhMessage.textContent = 'Choose your initial door';
                    }
                }, 2000);
            }
            clickCount = 0;
        }, 300);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (gamePhase === 'initial') {
            if (e.key === '1') chooseInitialDoor(0);
            if (e.key === '2') chooseInitialDoor(1);
            if (e.key === '3') chooseInitialDoor(2);
        } else if (gamePhase === 'decision') {
            if (e.key === 's' || e.key === 'S') makeDecision(false); // Stay
            if (e.key === 'w' || e.key === 'W') makeDecision(true);  // Switch (W for sWitch)
        }
        if (e.key === 'n' || e.key === 'N') newGame(); // New game
    });
    
})();

// === Coupon Collector Simulator ===
(function() {
    // Game state
    let nCoupons = 5;
    let collectedCoupons = new Set();
    let couponCounts = {};
    let drawCount = 0;
    let distributionType = 'uniform';
    let isAutoCollecting = false;
    let autoCollectInterval = null;
    let recentDraws = [];
    
    // Statistics
    let collections = [];
    
    // DOM elements
    const ccSection = document.getElementById('coupon-game');
    if (!ccSection) return;
    
    const ccNCoupons = document.getElementById('cc-n-coupons');
    const ccDistribution = document.getElementById('cc-distribution');
    const ccMessage = document.getElementById('cc-message');
    const ccCollectedCount = document.getElementById('cc-collected-count');
    const ccTotalTypes = document.getElementById('cc-total-types');
    const ccDrawCount = document.getElementById('cc-draw-count');
    const ccCouponsGrid = document.getElementById('cc-coupons-grid');
    const ccRecentDraws = document.getElementById('cc-recent-draws');
    const ccDraw = document.getElementById('cc-draw');
    const ccAutoCollect = document.getElementById('cc-auto-collect');
    const ccReset = document.getElementById('cc-reset');
    const ccExpected = document.getElementById('cc-expected');
    const ccHarmonic = document.getElementById('cc-harmonic');
    const ccTotalCollections = document.getElementById('cc-total-collections');
    const ccAvgDraws = document.getElementById('cc-avg-draws');
    const ccMinDraws = document.getElementById('cc-min-draws');
    const ccMaxDraws = document.getElementById('cc-max-draws');
    
    // Initialize
    initializeGame();
    
    function calculateHarmonic(n) {
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            sum += 1 / i;
        }
        return sum;
    }
    
    function getCouponProbabilities() {
        const probs = [];
        
        switch (distributionType) {
            case 'uniform':
                for (let i = 0; i < nCoupons; i++) {
                    probs.push(1 / nCoupons);
                }
                break;
                
            case 'geometric':
                // Geometric distribution - rare types become progressively rarer
                let sum = 0;
                for (let i = 0; i < nCoupons; i++) {
                    const p = Math.pow(0.7, i);
                    probs.push(p);
                    sum += p;
                }
                // Normalize
                for (let i = 0; i < nCoupons; i++) {
                    probs[i] /= sum;
                }
                break;
                
            case 'biased':
                // One very common type, others uniform
                probs[0] = 0.5; // 50% chance for first type
                const remaining = 0.5 / (nCoupons - 1);
                for (let i = 1; i < nCoupons; i++) {
                    probs.push(remaining);
                }
                break;
        }
        
        return probs;
    }
    
    function drawCoupon() {
        const probs = getCouponProbabilities();
        const rand = Math.random();
        let cumProb = 0;
        
        for (let i = 0; i < nCoupons; i++) {
            cumProb += probs[i];
            if (rand <= cumProb) {
                return i;
            }
        }
        
        return nCoupons - 1; // fallback
    }
    
    function initializeGame() {
        nCoupons = parseInt(ccNCoupons.value);
        distributionType = ccDistribution.value;
        
        collectedCoupons.clear();
        couponCounts = {};
        drawCount = 0;
        recentDraws = [];
        
        for (let i = 0; i < nCoupons; i++) {
            couponCounts[i] = 0;
        }
        
        updateDisplay();
        updateTheory();
        renderCoupons();
    }
    
    function renderCoupons() {
        ccCouponsGrid.innerHTML = '';
        
        for (let i = 0; i < nCoupons; i++) {
            const slot = document.createElement('div');
            slot.className = 'cc-coupon-slot';
            slot.textContent = String.fromCharCode(65 + i); // A, B, C, etc.
            
            if (collectedCoupons.has(i)) {
                slot.classList.add('collected');
            }
            
            if (couponCounts[i] > 1) {
                const count = document.createElement('div');
                count.className = 'cc-coupon-count';
                count.textContent = couponCounts[i];
                slot.appendChild(count);
            }
            
            ccCouponsGrid.appendChild(slot);
        }
    }
    
    function updateDisplay() {
        ccCollectedCount.textContent = collectedCoupons.size;
        ccTotalTypes.textContent = nCoupons;
        ccDrawCount.textContent = drawCount;
        
        // Update recent draws display
        const recentText = recentDraws.slice(-20).map(draw => {
            const couponLetter = String.fromCharCode(65 + draw.coupon);
            return `<span class="cc-draw-item ${draw.isNew ? 'new' : 'duplicate'}">${couponLetter}</span>`;
        }).join('');
        
        ccRecentDraws.innerHTML = recentText || 'No draws yet...';
        
        // Check if collection is complete
        if (collectedCoupons.size === nCoupons && drawCount > 0) {
            collections.push(drawCount);
            ccMessage.textContent = `🎉 Collection complete in ${drawCount} draws! Expected: ~${Math.round(nCoupons * calculateHarmonic(nCoupons))}`;
            ccMessage.style.color = '#00ff88';
            
            if (isAutoCollecting) {
                stopAutoCollect();
                // Auto-reset after completion
                setTimeout(() => {
                    resetCollection();
                    if (collections.length < 100) { // Limit auto-collections
                        startAutoCollect();
                    }
                }, 1500);
            }
        } else if (drawCount === 0) {
            ccMessage.textContent = 'Configure settings and start collecting!';
            ccMessage.style.color = '#ffe082';
        } else {
            ccMessage.textContent = `Drawing coupons... ${collectedCoupons.size}/${nCoupons} types collected`;
            ccMessage.style.color = '#ffe082';
        }
        
        updateStatistics();
    }
    
    function updateTheory() {
        const harmonic = calculateHarmonic(nCoupons);
        const expected = nCoupons * harmonic;
        
        ccHarmonic.textContent = harmonic.toFixed(2);
        ccExpected.textContent = `~${Math.round(expected)}`;
    }
    
    function updateStatistics() {
        ccTotalCollections.textContent = collections.length;
        
        if (collections.length > 0) {
            const avgDraws = collections.reduce((a, b) => a + b, 0) / collections.length;
            const minDraws = Math.min(...collections);
            const maxDraws = Math.max(...collections);
            
            ccAvgDraws.textContent = avgDraws.toFixed(1);
            ccMinDraws.textContent = minDraws;
            ccMaxDraws.textContent = maxDraws;
        } else {
            ccAvgDraws.textContent = '0';
            ccMinDraws.textContent = '∞';
            ccMaxDraws.textContent = '0';
        }
    }
    
    function performDraw() {
        if (collectedCoupons.size === nCoupons) return;
        
        const coupon = drawCoupon();
        const wasNew = !collectedCoupons.has(coupon);
        
        collectedCoupons.add(coupon);
        couponCounts[coupon] = (couponCounts[coupon] || 0) + 1;
        drawCount++;
        
        recentDraws.push({ coupon, isNew: wasNew });
        if (recentDraws.length > 50) {
            recentDraws.shift();
        }
        
        // Animate the coupon if it's newly collected
        if (wasNew) {
            setTimeout(() => {
                renderCoupons();
                const slots = ccCouponsGrid.children;
                if (slots[coupon]) {
                    slots[coupon].classList.add('just-collected');
                    setTimeout(() => {
                        slots[coupon].classList.remove('just-collected');
                    }, 800);
                }
            }, 50);
        } else {
            renderCoupons();
        }
        
        updateDisplay();
    }
    
    function resetCollection() {
        stopAutoCollect();
        initializeGame();
        ccMessage.textContent = 'Collection reset! Start drawing coupons.';
        ccMessage.style.color = '#ffe082';
    }
    
    function startAutoCollect() {
        isAutoCollecting = true;
        ccAutoCollect.textContent = 'Stop Auto';
        ccDraw.disabled = true;
        
        autoCollectInterval = setInterval(() => {
            if (collectedCoupons.size < nCoupons) {
                performDraw();
            }
        }, 200);
    }
    
    function stopAutoCollect() {
        isAutoCollecting = false;
        ccAutoCollect.textContent = 'Auto Collect';
        ccDraw.disabled = false;
        
        if (autoCollectInterval) {
            clearInterval(autoCollectInterval);
            autoCollectInterval = null;
        }
    }
    
    // Event listeners
    ccDraw.addEventListener('click', performDraw);
    
    ccAutoCollect.addEventListener('click', () => {
        if (isAutoCollecting) {
            stopAutoCollect();
        } else {
            startAutoCollect();
        }
    });
    
    ccReset.addEventListener('click', resetCollection);
    
    ccNCoupons.addEventListener('change', () => {
        if (parseInt(ccNCoupons.value) !== nCoupons) {
            resetCollection();
        }
    });
    
    ccDistribution.addEventListener('change', () => {
        if (ccDistribution.value !== distributionType) {
            distributionType = ccDistribution.value;
            ccMessage.textContent = `Distribution changed to ${distributionType}. Effects will be visible in new collections.`;
            updateTheory();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        if (e.key === 'd' || e.key === 'D') {
            if (!isAutoCollecting && collectedCoupons.size < nCoupons) {
                performDraw();
            }
        } else if (e.key === 'a' || e.key === 'A') {
            if (isAutoCollecting) {
                stopAutoCollect();
            } else {
                startAutoCollect();
            }
        } else if (e.key === 'r' || e.key === 'R') {
            resetCollection();
        }
    });
    
})();

// === Segment Tree Explorer ===
(function() {
    // Segment Tree class
    class SegmentTree {
        constructor(arr, operation = 'sum') {
            this.n = arr.length;
            this.operation = operation;
            this.tree = new Array(4 * this.n).fill(this.getIdentity());
            this.lazy = new Array(4 * this.n).fill(0);
            this.original = [...arr];
            this.build(arr, 0, 0, this.n - 1);
        }
        
        getIdentity() {
            switch (this.operation) {
                case 'sum': return 0;
                case 'min': return Infinity;
                case 'max': return -Infinity;
                default: return 0;
            }
        }
        
        combine(a, b) {
            switch (this.operation) {
                case 'sum': return a + b;
                case 'min': return Math.min(a, b);
                case 'max': return Math.max(a, b);
                default: return a + b;
            }
        }
        
        build(arr, node, start, end) {
            if (start === end) {
                this.tree[node] = arr[start];
            } else {
                const mid = Math.floor((start + end) / 2);
                this.build(arr, 2 * node + 1, start, mid);
                this.build(arr, 2 * node + 2, mid + 1, end);
                this.tree[node] = this.combine(this.tree[2 * node + 1], this.tree[2 * node + 2]);
            }
        }
        
        pushDown(node, start, end) {
            if (this.lazy[node] !== 0) {
                if (this.operation === 'sum') {
                    this.tree[node] += this.lazy[node] * (end - start + 1);
                } else {
                    this.tree[node] += this.lazy[node];
                }
                
                if (start !== end) {
                    this.lazy[2 * node + 1] += this.lazy[node];
                    this.lazy[2 * node + 2] += this.lazy[node];
                }
                
                this.lazy[node] = 0;
            }
        }
        
        updateRange(node, start, end, l, r, val) {
            this.pushDown(node, start, end);
            
            if (start > r || end < l) {
                return;
            }
            
            if (start >= l && end <= r) {
                this.lazy[node] += val;
                this.pushDown(node, start, end);
                return;
            }
            
            const mid = Math.floor((start + end) / 2);
            this.updateRange(2 * node + 1, start, mid, l, r, val);
            this.updateRange(2 * node + 2, mid + 1, end, l, r, val);
            
            this.pushDown(2 * node + 1, start, mid);
            this.pushDown(2 * node + 2, mid + 1, end);
            
            this.tree[node] = this.combine(this.tree[2 * node + 1], this.tree[2 * node + 2]);
        }
        
        queryRange(node, start, end, l, r) {
            if (start > r || end < l) {
                return this.getIdentity();
            }
            
            this.pushDown(node, start, end);
            
            if (start >= l && end <= r) {
                return this.tree[node];
            }
            
            const mid = Math.floor((start + end) / 2);
            const leftResult = this.queryRange(2 * node + 1, start, mid, l, r);
            const rightResult = this.queryRange(2 * node + 2, mid + 1, end, l, r);
            
            return this.combine(leftResult, rightResult);
        }
        
        update(l, r, val) {
            this.updateRange(0, 0, this.n - 1, l, r, val);
        }
        
        query(l, r) {
            return this.queryRange(0, 0, this.n - 1, l, r);
        }
        
        getNodeInfo(index) {
            const level = Math.floor(Math.log2(index + 1));
            const posInLevel = index - (Math.pow(2, level) - 1);
            return { level, posInLevel };
        }
        
        getRange(node, start = 0, end = this.n - 1) {
            if (start === end) {
                return [start, end];
            }
            
            const mid = Math.floor((start + end) / 2);
            if (node === 0) return [start, end];
            
            // This is a simplified range calculation for visualization
            const level = Math.floor(Math.log2(node + 1));
            const maxNodes = Math.pow(2, level);
            const posInLevel = node - (maxNodes - 1);
            const rangeSize = Math.ceil(this.n / maxNodes);
            const rangeStart = Math.min(posInLevel * rangeSize, this.n - 1);
            const rangeEnd = Math.min(rangeStart + rangeSize - 1, this.n - 1);
            
            return [rangeStart, rangeEnd];
        }
    }
    
    // Game state
    let segTree = null;
    let currentArray = [1, 3, 5, 7, 9, 11];
    let currentOperation = 'sum';
    let animatingNodes = new Set();
    let stepMode = false;
    
    // DOM elements
    const stSection = document.getElementById('segtree-game');
    if (!stSection) return;
    
    const stArrayInput = document.getElementById('st-array-input');
    const stOperation = document.getElementById('st-operation');
    const stBuild = document.getElementById('st-build');
    const stMessage = document.getElementById('st-message');
    const stTree = document.getElementById('st-tree');
    const stArraySize = document.getElementById('st-array-size');
    const stCurrentOp = document.getElementById('st-current-op');
    const stArray = document.getElementById('st-array');
    const stQueryLeft = document.getElementById('st-query-left');
    const stQueryRight = document.getElementById('st-query-right');
    const stQuery = document.getElementById('st-query');
    const stQueryResult = document.getElementById('st-query-result');
    const stUpdateLeft = document.getElementById('st-update-left');
    const stUpdateRight = document.getElementById('st-update-right');
    const stUpdateValue = document.getElementById('st-update-value');
    const stUpdate = document.getElementById('st-update');
    const stReset = document.getElementById('st-reset');
    const stStep = document.getElementById('st-step');
    const stRandom = document.getElementById('st-random');
    const stNodeCount = document.getElementById('st-node-count');
    const stTreeHeight = document.getElementById('st-tree-height');
    const stLazyCount = document.getElementById('st-lazy-count');
    const stLastOperation = document.getElementById('st-last-operation');
    
    // Initialize
    updateDisplay();
    
    function parseArray(input) {
        try {
            const arr = input.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
            return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
        } catch (e) {
            return [1, 2, 3, 4, 5];
        }
    }
    
    function buildTree() {
        currentArray = parseArray(stArrayInput.value);
        currentOperation = stOperation.value;
        
        try {
            segTree = new SegmentTree(currentArray, currentOperation);
            renderTree();
            renderArray();
            updateStats();
            stMessage.textContent = `Segment tree built successfully! Array size: ${currentArray.length}`;
            stMessage.style.color = '#00ff88';
        } catch (error) {
            stMessage.textContent = 'Error building tree. Please check your array input.';
            stMessage.style.color = '#ff4444';
        }
    }
    
    function renderTree() {
        if (!segTree) return;
        
        stTree.innerHTML = '';
        const maxLevel = Math.floor(Math.log2(segTree.n)) + 2;
        
        for (let level = 0; level <= maxLevel; level++) {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'st-tree-level';
            
            const nodesInLevel = Math.pow(2, level);
            const startIndex = Math.pow(2, level) - 1;
            
            for (let i = 0; i < nodesInLevel && startIndex + i < segTree.tree.length; i++) {
                const nodeIndex = startIndex + i;
                if (segTree.tree[nodeIndex] === segTree.getIdentity() && level > 0) continue;
                
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'st-tree-node';
                nodeDiv.setAttribute('data-node', nodeIndex);
                
                const [rangeStart, rangeEnd] = segTree.getRange(nodeIndex);
                
                nodeDiv.innerHTML = `
                    <div class="st-node-value">${segTree.tree[nodeIndex]}</div>
                    <div class="st-node-range">[${rangeStart},${rangeEnd}]</div>
                    ${segTree.lazy[nodeIndex] !== 0 ? `<div class="st-node-lazy">+${segTree.lazy[nodeIndex]}</div>` : ''}
                `;
                
                if (segTree.lazy[nodeIndex] !== 0) {
                    nodeDiv.classList.add('lazy');
                }
                
                nodeDiv.addEventListener('click', () => highlightNode(nodeIndex));
                
                levelDiv.appendChild(nodeDiv);
            }
            
            if (levelDiv.children.length > 0) {
                stTree.appendChild(levelDiv);
            }
        }
    }
    
    function renderArray() {
        if (!segTree) return;
        
        stArray.innerHTML = '';
        
        currentArray.forEach((value, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'st-array-element';
            elementDiv.setAttribute('data-index', index);
            elementDiv.textContent = value;
            stArray.appendChild(elementDiv);
        });
    }
    
    function updateDisplay() {
        stArraySize.textContent = currentArray.length;
        stCurrentOp.textContent = currentOperation.charAt(0).toUpperCase() + currentOperation.slice(1);
        
        // Update input bounds
        const maxIndex = Math.max(0, currentArray.length - 1);
        [stQueryLeft, stQueryRight, stUpdateLeft, stUpdateRight].forEach(input => {
            input.max = maxIndex;
        });
    }
    
    function updateStats() {
        if (!segTree) {
            stNodeCount.textContent = '0';
            stTreeHeight.textContent = '0';
            stLazyCount.textContent = '0';
            return;
        }
        
        const activeNodes = segTree.tree.filter((_, i) => i < segTree.tree.length && segTree.tree[i] !== segTree.getIdentity()).length;
        const height = Math.floor(Math.log2(segTree.n)) + 1;
        const lazyNodes = segTree.lazy.filter(x => x !== 0).length;
        
        stNodeCount.textContent = activeNodes;
        stTreeHeight.textContent = height;
        stLazyCount.textContent = lazyNodes;
    }
    
    function highlightNode(nodeIndex) {
        const nodeElement = document.querySelector(`[data-node="${nodeIndex}"]`);
        if (nodeElement) {
            nodeElement.classList.add('highlighting');
            setTimeout(() => {
                nodeElement.classList.remove('highlighting');
            }, 600);
        }
    }
    
    function highlightArrayRange(left, right) {
        const arrayElements = stArray.querySelectorAll('.st-array-element');
        
        arrayElements.forEach((el, index) => {
            if (index >= left && index <= right) {
                el.classList.add('highlighted');
            } else {
                el.classList.remove('highlighted');
            }
        });
        
        setTimeout(() => {
            arrayElements.forEach(el => el.classList.remove('highlighted'));
        }, 2000);
    }
    
    function performQuery() {
        if (!segTree) {
            stMessage.textContent = 'Please build the tree first!';
            stMessage.style.color = '#ff4444';
            return;
        }
        
        const left = parseInt(stQueryLeft.value);
        const right = parseInt(stQueryRight.value);
        
        if (left < 0 || right >= currentArray.length || left > right) {
            stMessage.textContent = 'Invalid query range!';
            stMessage.style.color = '#ff4444';
            return;
        }
        
        const result = segTree.query(left, right);
        stQueryResult.textContent = `Result: ${result}`;
        stLastOperation.textContent = `Query [${left},${right}]`;
        
        highlightArrayRange(left, right);
        stMessage.textContent = `Range query [${left},${right}] = ${result}`;
        stMessage.style.color = '#00ff88';
    }
    
    function performUpdate() {
        if (!segTree) {
            stMessage.textContent = 'Please build the tree first!';
            stMessage.style.color = '#ff4444';
            return;
        }
        
        const left = parseInt(stUpdateLeft.value);
        const right = parseInt(stUpdateRight.value);
        const value = parseInt(stUpdateValue.value);
        
        if (left < 0 || right >= currentArray.length || left > right || isNaN(value)) {
            stMessage.textContent = 'Invalid update parameters!';
            stMessage.style.color = '#ff4444';
            return;
        }
        
        segTree.update(left, right, value);
        
        // Update original array for display purposes
        for (let i = left; i <= right; i++) {
            currentArray[i] += value;
        }
        
        renderTree();
        renderArray();
        updateStats();
        
        highlightArrayRange(left, right);
        stLastOperation.textContent = `Update [${left},${right}] +${value}`;
        stMessage.textContent = `Range update [${left},${right}] += ${value} completed`;
        stMessage.style.color = '#00ff88';
    }
    
    function resetTree() {
        segTree = null;
        stTree.innerHTML = '<div style="color: #666; text-align: center; padding: 2rem;">Build a tree to see visualization</div>';
        stArray.innerHTML = '';
        stQueryResult.textContent = 'Result: -';
        stLastOperation.textContent = 'None';
        stMessage.textContent = 'Tree reset. Configure array and build again.';
        stMessage.style.color = '#ffe082';
        updateStats();
    }
    
    function generateRandomArray() {
        const size = 4 + Math.floor(Math.random() * 5); // 4-8 elements
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(Math.floor(Math.random() * 20) + 1);
        }
        stArrayInput.value = arr.join(',');
        stMessage.textContent = 'Random array generated! Click "Build Tree" to visualize.';
        stMessage.style.color = '#ffe082';
    }
    
    function toggleStepMode() {
        stepMode = !stepMode;
        stStep.textContent = stepMode ? 'Exit Step Mode' : 'Step Mode';
        stStep.style.background = stepMode ? '#ff6b6b' : '#333';
        
        if (stepMode) {
            stMessage.textContent = 'Step mode enabled. Operations will be animated step by step.';
        } else {
            stMessage.textContent = 'Step mode disabled. Operations execute immediately.';
        }
    }
    
    // Event listeners
    stBuild.addEventListener('click', buildTree);
    stQuery.addEventListener('click', performQuery);
    stUpdate.addEventListener('click', performUpdate);
    stReset.addEventListener('click', resetTree);
    stStep.addEventListener('click', toggleStepMode);
    stRandom.addEventListener('click', generateRandomArray);
    
    stArrayInput.addEventListener('change', () => {
        currentArray = parseArray(stArrayInput.value);
        updateDisplay();
    });
    
    stOperation.addEventListener('change', () => {
        if (segTree) {
            buildTree(); // Rebuild with new operation
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        
        if (e.key === 'b' || e.key === 'B') {
            buildTree();
        } else if (e.key === 'q' || e.key === 'Q') {
            if (segTree) performQuery();
        } else if (e.key === 'u' || e.key === 'U') {
            if (segTree) performUpdate();
        } else if (e.key === 'r' || e.key === 'R') {
            resetTree();
        } else if (e.key === 's' || e.key === 'S') {
            toggleStepMode();
        } else if (e.key === 't' || e.key === 'T') {
            generateRandomArray();
        }
    });
    
    // Initialize with default tree
    setTimeout(() => {
        buildTree();
    }, 500);
    
})();


// Initialize all functions when DOM is loaded
function initializePortfolio() {
    // Initialize terminal animation after a short delay
    setTimeout(initTerminalAnimation, 500);
    
    // Initialize other features
    initSmoothScrolling();
    animateStats();
    initParallax();
    initHoverEffects();
    initCursorBlink();
    
    // Add scroll event listener for active navigation
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial call to set active nav on page load
    setTimeout(updateActiveNav, 100);
    
    // Add CSS for active nav state
    const style = document.createElement('style');
    style.textContent = `
        .nav-links a.active {
            color: #00ff88 !important;
        }
        .nav-links a.active::after {
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);
}

// Multiple initialization attempts for GitHub Pages compatibility
document.addEventListener('DOMContentLoaded', initializePortfolio);

// Fallback for GitHub Pages
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    // DOM is already loaded
    initializePortfolio();
}

// Additional fallback
window.addEventListener('load', () => {
    setTimeout(updateActiveNav, 200);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Could implement search functionality here
    }
    
    // Escape to clear any active states
    if (e.key === 'Escape') {
        // Clear any active modals or overlays
    }
});

// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(section);
    });
}); 