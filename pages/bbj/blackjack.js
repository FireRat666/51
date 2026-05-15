(function () {
    let scene;
    let currentScript = document.currentScript;

    const MAX_PLAYERS = 7;
    const MIN_PLAYERS = 1;
    const TURN_DURATION = 60 * 1000;
    const DISCONNECT_TIMEOUT_MS = 45000;
    const DOMAIN = "https://blackjack.firer.at/";

    class BlackjackGame {
        constructor() {
            this.gameState = null;
            this.ui = {
                slices: [],
                centralPanel: null,
            };
            this.isConfirmationDialogOpen = false;
            this.confirmCallback = null;
            this.isMuted = false;
            this.playersInitiallyLoaded = {}; // Track initial connected state for sound suppression
            this.joinTime = Date.now();

            const urlParams = new URLSearchParams(window.location.search);
            const getParam = (attr, defaultValue) => {
                return urlParams.get(attr) ||
                       (currentScript && currentScript.getAttribute(attr)) ||
                       (currentScript && currentScript.dataset?.[attr]) ||
                       defaultValue;
            };

            this.params = {
                position: getParam("position", "0 0 2"),
                rotation: getParam("rotation", "0 0 0"),
                instance: getParam("instance", "blackjack_game"),
                debug: getParam("debug", "false") === "true"
            };
            this.stateKey = this.params.instance;
        }

        log(...args) {
            if (this.params.debug) console.log("[Blackjack]", ...args);
        }

        playLocalSound(soundFile) {
            if (this.isMuted || !soundFile) return;
            const audio = new Audio(`${DOMAIN}Assets/${soundFile}`);
            audio.crossOrigin = "anonymous";
            audio.volume = 0.3;
            audio.play().catch(e => this.log("Audio play error:", e));
        }

        parseVector3(str) {
            const parts = str.split(" ").map(parseFloat);
            return new BS.Vector3(parts[0] || 0, parts[1] || 0, parts[2] || 0);
        }

        // Returns the outline suit symbol — BMP characters, confirmed to render in Banter SDK
        getSuitSymbol(suit) {
            switch (suit) {
                case 'hearts':   return '\u2661'; // ♡
                case 'diamonds': return '\u2662'; // ♢
                case 'clubs':    return '\u2667'; // ♧
                case 'spades':   return '\u2664'; // ♤
                default: return '?';
            }
        }

        // Returns the rank display string — chess glyphs for K and Q
        getRankDisplay(rank) {
            if (rank === 'K') return '\u2654'; // ♔
            if (rank === 'Q') return '\u2655'; // ♕
            return rank;
        }

        async init() {
            if (scene) return;
            scene = BS.BanterScene.GetInstance();

            if (!scene.unityLoaded) {
                await new Promise(resolve => {
                    scene.On("unity-loaded", resolve);
                    window.addEventListener("unity-loaded", resolve, { once: true });
                });
            }

            this.log("Initializing Blackjack Game...");
            await this.buildEnvironment();

            scene.On("space-state-changed", this.onSpaceStateChanged.bind(this));
            scene.On("user-left", this.onSpaceUserLeft.bind(this));
            
            this.sync();

            setInterval(() => this.tick(), 1000);
        }

        async buildEnvironment() {
            const rootPos = this.parseVector3(this.params.position);
            const rootRot = this.parseVector3(this.params.rotation);
            this.root = await new BS.GameObject({ name: "Blackjack_Root", localPosition: rootPos, localEulerAngles: rootRot }).Async();

            // Table Base
            const tableObj = await new BS.GameObject({ name: "Blackjack_Table", parent: this.root, localPosition: new BS.Vector3(0, 1, 0), localEulerAngles: new BS.Vector3(90, 0, 0) }).Async();
            await tableObj.AddComponent(new BS.BanterCircle({ radius: 1.8, segments: 32 }));
            await tableObj.AddComponent(new BS.BanterMaterial({ shaderName: "Standard", color: new BS.Vector4(0.05, 0.2, 0.1, 1) })); // Dark Green felt

            // Player Slices (Seats)
            this.ui.slices = [];
            for (let i = 0; i < MAX_PLAYERS; i++) {
                this.ui.slices.push(await this.buildPlayerSlice(i));
            }

            // Central Hub UI
            await this.buildCentralUI();

            this.log("Environment built.");
        }

        async buildPlayerSlice(index) {
            // Full circle arrangement for 7 players
            const angleDeg = (360 / MAX_PLAYERS) * index;
            
            const sliceRoot = await new BS.GameObject({
                name: `Blackjack_PlayerSeat_${index}`,
                parent: this.root,
                localEulerAngles: new BS.Vector3(0, angleDeg, 0)
            }).Async();

            // Geometric Wedge for the placemat
            const wedgeObj = await new BS.GameObject({ name: "Blackjack_Placemat", parent: sliceRoot, localPosition: new BS.Vector3(0, 1.01, 0), localEulerAngles: new BS.Vector3(90, 0, 0) }).Async();
            const sliceAngleRad = (Math.PI * 2) / MAX_PLAYERS; // Full circle divided by players
            await wedgeObj.AddComponent(new BS.BanterCircle({
                radius: 1.6,
                segments: 8,
                thetaStart: (Math.PI / 2) - (sliceAngleRad * 0.95) / 2,
                thetaLength: sliceAngleRad * 0.95
            }));
            const wedgeMat = await wedgeObj.AddComponent(new BS.BanterMaterial(
                "Unlit/Color",
                null,
                new BS.Vector4(0.15, 0.15, 0.15, 1),
                0,
                false,
                "Blackjack_Wedge_" + index
            ));

            // Status Bar UI
            const statusObj = await new BS.GameObject({
                name: "Blackjack_StatusUI",
                parent: sliceRoot,
                localPosition: new BS.Vector3(0, 1.15, 1.75),
                localEulerAngles: new BS.Vector3(35, 180, 0),
                localScale: new BS.Vector3(0.1, 0.1, 0.1)
            }).Async();

            const sPanel = await statusObj.AddComponent(new BS.BanterUI(new BS.Vector2(750, 100), false));
            const sRoot = sPanel.CreateVisualElement();
            await sRoot.Async();
            sRoot.SetStyles({
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'none',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                paddingTop: '25px',
                paddingBottom: '25px',
                paddingLeft: '30px',
                paddingRight: '30px',
                borderRadius: '40px',
                borderWidth: '4px',
                borderColor: 'rgba(102, 102, 102, 1)'
            });
            if (sRoot.parent && sRoot.parent.SetStyles) {
                sRoot.parent.SetStyles({ backgroundColor: 'rgba(0, 0, 0, 0)' });
            }

            const nameText = sPanel.CreateLabel(undefined, sRoot);
            await nameText.Async();
            nameText.text = "Empty Seat";
            nameText.SetStyles({ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'white', fontSize: '27px', fontWeight: 'bold', marginRight: '40px', marginLeft: '15px' });

            const timerText = sPanel.CreateLabel(undefined, sRoot);
            await timerText.Async();
            timerText.text = "";
            timerText.SetStyles({ backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgba(255, 51, 51, 1)', fontSize: '20px', fontWeight: 'bold' });

            // Hand UI (Player specific)
            const handObj = await new BS.GameObject({
                name: "Blackjack_HandUI",
                parent: sliceRoot,
                localPosition: new BS.Vector3(0, 1.25, 1.55),
                localEulerAngles: new BS.Vector3(60, 180, 0),
                localScale: new BS.Vector3(0.08, 0.08, 0.08)
            }).Async();

            const hPanel = await handObj.AddComponent(new BS.BanterUI(new BS.Vector2(1000, 370), false)); // Fits 5 cards horizontally
            const hRoot = hPanel.CreateVisualElement();
            await hRoot.Async();
            hRoot.SetStyles({
                backgroundColor: 'rgba(25, 25, 25, 0.93)',
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                paddingTop: '20px',
                paddingRight: '20px',
                paddingBottom: '20px',
                paddingLeft: '20px',
                borderRadius: '25px',
                borderWidth: '3px',
                borderColor: 'rgba(102, 102, 102, 1)'
            });
            if (hRoot.parent && hRoot.parent.SetStyles) {
                hRoot.parent.SetStyles({ backgroundColor: 'rgba(0, 0, 0, 0)' });
            }

            const cardsContainer = hPanel.CreateVisualElement(hRoot);
            await cardsContainer.Async();
            cardsContainer.panel = hPanel;
            cardsContainer.SetStyles({
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0)'
            });

            const controlsRow = hPanel.CreateVisualElement(hRoot);
            await controlsRow.Async();
            controlsRow.SetStyles({
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                marginTop: '15px',
                marginBottom: '15px',
                backgroundColor: 'rgba(0,0,0,0)'
            });

            const createBtn = async (pnl, parent, text, color, handler) => {
                const btn = pnl.CreateButton(parent);
                await btn.Async();
                btn.text = text;
                btn.SetStyles({
                    backgroundColor: color,
                    color: 'white',
                    fontSize: '30px',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingLeft: '30px',
                    paddingRight: '30px',
                    borderRadius: '15px',
                    marginRight: '15px'
                });
                btn.OnClick(handler);
                return btn;
            };

            const hitBtn = await createBtn(hPanel, controlsRow, "HIT", "#d32f2f", () => this.sendAction("hit"));
            const standBtn = await createBtn(hPanel, controlsRow, "STAND", "#1976d2", () => this.sendAction("stand"));
            const doubleBtn = await createBtn(hPanel, controlsRow, "DOUBLE", "#fbc02d", () => this.sendAction("double-down"));
            const splitBtn = await createBtn(hPanel, controlsRow, "SPLIT", "#7b1fa2", () => this.sendAction("split"));

            const bettingRow = hPanel.CreateVisualElement(hRoot);
            await bettingRow.Async();
            bettingRow.SetStyles({
                display: 'none',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '15px',
                marginBottom: '15px',
                backgroundColor: 'rgba(0,0,0,0)'
            });

            const createBetBtn = async (parent, text, color, handler) => {
                const btn = hPanel.CreateButton(parent);
                await btn.Async();
                btn.text = text;
                btn.SetStyles({
                    backgroundColor: color, color: 'white', fontSize: '24px', fontWeight: 'bold',
                    paddingTop: '10px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px',
                    borderRadius: '10px', marginRight: '10px'
                });
                btn.OnClick(handler);
                return btn;
            };

            await createBetBtn(bettingRow, "-50", "#c62828", () => this.sendAction("adjust-bet", { amount: -50 }));
            await createBetBtn(bettingRow, "-10", "#d32f2f", () => this.sendAction("adjust-bet", { amount: -10 }));
            
            const betLabel = hPanel.CreateLabel(undefined, bettingRow);
            await betLabel.Async();
            betLabel.text = "Bet: 10";
            betLabel.SetStyles({ color: '#ffcc00', fontSize: '32px', fontWeight: 'bold', marginRight: '10px', backgroundColor: 'rgba(0,0,0,0)' });
            
            await createBetBtn(bettingRow, "+10", "#2e7d32", () => this.sendAction("adjust-bet", { amount: 10 }));
            await createBetBtn(bettingRow, "+50", "#1b5e20", () => this.sendAction("adjust-bet", { amount: 50 }));

            return {
                root: sliceRoot, wedgeMat,
                statusObj, sRoot, nameText, timerText,
                handObj, hRoot, cardsContainer, hitBtn, standBtn, doubleBtn, splitBtn, hPanel,
                controlsRow, bettingRow, betLabel
            };
        }


        async buildCentralUI() {
            const centralObj = await new BS.GameObject({
                name: "Blackjack_CentralUI",
                parent: this.root,
                localPosition: new BS.Vector3(0, 2.2, 0),
                localScale: new BS.Vector3(0.15, 0.15, 0.15)
            }).Async();
            let centralBillboardObj = await centralObj.AddComponent(new BS.BanterBillboard({ smoothing: 1, enableXAxis: false, enableYAxis: true }));
            centralBillboardObj.enableXAxis = false;

            const panel = await centralObj.AddComponent(new BS.BanterUI(new BS.Vector2(1050, 820), false));
            const rootEl = panel.CreateVisualElement();
            await rootEl.Async();
            rootEl.SetStyles({
                backgroundColor: 'rgba(10, 10, 10, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '20px',
                paddingBottom: '20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderRadius: '25px',
                borderWidth: '4px',
                borderColor: 'rgba(74, 78, 105, 1)',
                width: '100%',
                height: '100%'
            });
            if (rootEl.parent && rootEl.parent.SetStyles) {
                rootEl.parent.SetStyles({ backgroundColor: 'rgba(0, 0, 0, 0)' });
            }

            const title = panel.CreateLabel(undefined, rootEl);
            await title.Async();
            title.text = "BLACKJACK";
            title.SetStyles({ color: 'white', fontSize: '64px', fontWeight: 'bold', marginBottom: '30px', backgroundColor: 'rgba(0,0,0,0)' });

            const settingsRow = panel.CreateVisualElement(rootEl);
            await settingsRow.Async();
            settingsRow.SetStyles({ flexDirection: 'row', marginBottom: '30px', backgroundColor: 'rgba(0,0,0,0)' });
            this.ui.settingsRow = settingsRow;

            const createToggle = async (parent, text, initialValue, key) => {
                const row = panel.CreateVisualElement(parent);
                await row.Async();
                row.SetStyles({ flexDirection: 'row', alignItems: 'center', marginRight: '40px', backgroundColor: 'rgba(0,0,0,0)' });
                
                const lbl = panel.CreateLabel(undefined, row);
                await lbl.Async();
                lbl.text = text;
                lbl.SetStyles({ color: '#ccc', fontSize: '28px', marginRight: '10px', backgroundColor: 'rgba(0,0,0,0)' });

                const toggle = panel.CreateToggle(row);
                await toggle.Async();
                await scene.WaitForEndOfFrame();
                toggle.SetProperty('value', initialValue ? 'true' : 'false');
                toggle.On('change', async (e) => {
                    if (this.isHost()) {
                        let val = e.detail?.value;
                        if (val === undefined) val = await toggle.GetProperty('value');
                        if (this.gameState && this.gameState.advancedSettings) {
                            const patch = { advancedSettings: { ...this.gameState.advancedSettings, [key]: val === 'true' } };
                            this.updateState(patch);
                        }
                    }
                });
                return toggle;
            };

            this.ui.doubleToggle = await createToggle(settingsRow, "Double Down", true, "doubleDown");
            this.ui.splitToggle = await createToggle(settingsRow, "Split Pairs", true, "split");

            const dLabel = panel.CreateLabel(undefined, rootEl);
            await dLabel.Async();
            dLabel.text = "DEALER";
            dLabel.SetStyles({ color: '#fff', fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', backgroundColor: 'rgba(0,0,0,0)' });
            this.ui.dealerLabel = dLabel;

            const dealerCards = panel.CreateVisualElement(rootEl);
            await dealerCards.Async();
            dealerCards.panel = panel;
            dealerCards.SetStyles({
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                height: '200px',
                marginBottom: '20px',
                backgroundColor: 'rgba(0,0,0,0)'
            });
            this.ui.dealerCards = dealerCards;

            const winnerLabel = panel.CreateLabel(undefined, rootEl);
            await winnerLabel.Async();
            winnerLabel.text = "";
            winnerLabel.SetStyles({ color: '#ffcc00', fontSize: '28px', fontWeight: 'bold', marginTop: '15px', marginBottom: '15px', backgroundColor: 'rgba(0,0,0,0)', display: 'none', textAlign: 'center' });
            this.ui.winnerLabel = winnerLabel;

            const statusLabel = panel.CreateLabel(undefined, rootEl);
            await statusLabel.Async();
            statusLabel.text = "";
            statusLabel.SetStyles({ color: '#ffcc00', fontSize: '28px', marginBottom: '15px', backgroundColor: 'rgba(0,0,0,0)', display: 'none' });
            this.ui.statusLabel = statusLabel;

            const buttonsRow = panel.CreateVisualElement(rootEl);
            await buttonsRow.Async();
            buttonsRow.SetStyles({ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0)' });

            const createBtn = async (parent, text, color, handler) => {
                const btn = panel.CreateButton(parent);
                await btn.Async();

                if (btn.parent && btn.parent.SetStyles) {
                    btn.parent.SetStyles({ backgroundColor: 'rgba(0,0,0,0)', backgroundImage: 'none' });
                }

                btn.text = text;
                btn.SetStyles({
                    backgroundColor: color,
                    color: 'white',
                    fontSize: '24px',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingLeft: '30px',
                    paddingRight: '30px',
                    borderRadius: '8px',
                    margin: '8px',
                    borderWidth: '0px',
                    backgroundImage: 'none'
                });
                btn.OnClick(handler);
                return btn;
            };

            this.ui.joinBtn = await createBtn(buttonsRow, "JOIN", "#2e7d32", () => this.sendAction("join"));
            this.ui.startBtn = await createBtn(buttonsRow, "START", "#1565c0", () => this.sendAction("start"));
            this.ui.leaveBtn = await createBtn(buttonsRow, "LEAVE", "#c62828", () => this.sendAction("leave"));
            this.ui.muteBtn = await createBtn(buttonsRow, "🔊", "#607D8B", () => {
                this.isMuted = !this.isMuted;
                this.ui.muteBtn.text = this.isMuted ? "🔇" : "🔊";
            });
            this.ui.claimBtn = await createBtn(buttonsRow, "CLAIM HOST", "#e69900", () => {
                if (!this.isHost()) this.updateState({ currentHostUid: scene.localUser.uid });
            });

            const creditLabel = panel.CreateLabel(undefined, rootEl);
            await creditLabel.Async();
            creditLabel.text = "This game is based on previous works:\nOriginal \"Holograms Against Humanity\"\nDerogatory, falkrons, schmidtec, Shane\nPorted to the Modern Banter SDK by FireRat\nBeta 0.2.1";
            creditLabel.SetStyles({ color: '#aaaaaa', fontSize: '24px', marginTop: '30px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0)' });
            this.ui.creditLabel = creditLabel;

            this.ui.centralPanel = { obj: centralObj, panel, rootEl };
        }

        // --- State Management ---

        isHost() {
            if (!scene || !scene.localUser) return false;
            if (!this.gameState || !this.gameState.currentHostUid) {
                const uids = Object.keys(scene.users || {}).sort();
                return uids.length > 0 && uids[0] === scene.localUser.uid;
            }
            return this.gameState.currentHostUid === scene.localUser.uid;
        }

        sync() {
            if (!scene || !scene.spaceState) return;
            const raw = scene.spaceState.public[this.stateKey];
            try {
                const newState = raw ? JSON.parse(raw) : this.getDefaultState();
                if (JSON.stringify(this.gameState) !== JSON.stringify(newState)) {
                    const oldSound = this.gameState ? this.gameState.lastSound : null;
                    this.gameState = newState;
                    
                    if (this.gameState.lastSound && (!oldSound || this.gameState.lastSound.ts !== oldSound.ts)) {
                        if (this.gameState.lastSound.ts > this.joinTime) {
                            this.playLocalSound(this.gameState.lastSound.file);
                        }
                    }

                    // Populate playersInitiallyLoaded only once upon first valid state sync
                    if (Object.keys(this.playersInitiallyLoaded).length === 0) {
                        for (const playerId in this.gameState.players) {
                            this.playersInitiallyLoaded[playerId] = this.gameState.players[playerId].connected;
                        }
                    }

                    this.updateUI();
                }
            } catch (e) {
                this.log("Sync error:", e, "Raw value:", raw);
                // If it fails to parse, initialize with default to recover
                if (!this.gameState) {
                    this.gameState = this.getDefaultState();
                    this.playersInitiallyLoaded = {}; // Clear if state is reset
                    this.updateUI();
                }
            }
        }

        getDefaultState() {
            return {
                players: {},
                dealerHand: [],
                deck: [],
                gameStarted: false,
                currentPlayerId: null,
                turnStartTime: null,
                currentHostUid: null,
                winnerSummary: "",
                advancedSettings: { doubleDown: true, split: true },
                lastSound: null,
                history: []
            };
        }

        updateState(patch) {
            if (!this.gameState) return;
            Object.assign(this.gameState, patch);

            // If a sound was triggered during logic, sync it
            if (this.gameState._triggerSound) {
                this.gameState.lastSound = { file: this.gameState._triggerSound, ts: Date.now() };
                delete this.gameState._triggerSound;
            }

            scene.SetPublicSpaceProps({ [this.stateKey]: JSON.stringify(this.gameState) });
            this.updateUI();
        }

        onSpaceStateChanged(e) {
            if (e.detail.changes.some(c => c.property === this.stateKey)) {
                this.sync();
            }
        }

        onSpaceUserLeft(e) {
            const uid = e.detail.uid;
            if (this.gameState && this.gameState.players[uid]) {
                this.log(`User ${uid} left the space. Grace period started.`);
                // Handled by host in tick
            }
        }

        // --- Game Logic ---

        createDeck() {
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            const deck = [];
            for (const suit of suits) {
                for (const rank of ranks) {
                    let val = parseInt(rank);
                    if (['J', 'Q', 'K'].includes(rank)) val = 10;
                    if (rank === 'A') val = [1, 11];
                    deck.push({ suit, rank, val, id: Math.random().toString(36).substr(2, 9) });
                }
            }
            return this.shuffle(deck);
        }

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        calculateHandValue(hand) {
            let total = 0;
            let aces = 0;
            for (const card of hand) {
                if (card.rank === 'A') {
                    aces++;
                } else {
                    total += card.val;
                }
            }
            for (let i = 0; i < aces; i++) {
                if (total + 11 <= 21) {
                    total += 11;
                } else {
                    total += 1;
                }
            }
            return total;
        }

        // --- Actions ---

        async sendAction(type, data = {}, senderUid = null) {
            if (!scene || !scene.spaceState) return;
            const uid = senderUid || scene.localUser.uid;
            
            const raw = scene.spaceState.public[this.stateKey];
            let state;
            try {
                state = raw ? JSON.parse(raw) : this.getDefaultState();
            } catch (e) {
                state = this.getDefaultState();
            }

            const newState = this.handleAction(state, uid, type, data);
            if (newState) {
                // If the host triggered a sound, sync it
                if (newState._triggerSound) {
                    newState.lastSound = { file: newState._triggerSound, ts: Date.now() };
                    delete newState._triggerSound;
                }
                
                await scene.SetPublicSpaceProps({ [this.stateKey]: JSON.stringify(newState) });
                this.sync();
            }
        }

        handleAction(state, senderUid, type, data) {
            this.log(`Handling action: ${type} from ${senderUid}`);
            const player = state.players[senderUid];

            if (type === "join") {
                if (Object.keys(state.players).length < MAX_PLAYERS && !player) {
                    const pos = [0, 1, 2, 3, 4, 5, 6].find(p => !Object.values(state.players).some(pl => pl.position === p));
                    state.players[senderUid] = { uid: senderUid, position: pos, hand: [], status: 'waiting', trophies: 0, connected: true, disconnectTime: 0, chips: 1000, bet: 10 };
                    this.playSound(state, "playerJoin.ogg");
                }
            } else if (type === "adjust-bet" && player) {
                if (!state.gameStarted) {
                    player.bet += data.amount;
                    if (player.bet < 10) player.bet = 10;
                    if (player.bet > player.chips) player.bet = player.chips;
                    this.playSound(state, "card_flick.ogg");
                }
            } else if (type === "start") {
                if (Object.keys(state.players).length >= MIN_PLAYERS) {
                    state.winnerSummary = "";
                    state.deck = this.createDeck();
                    state.dealerHand = [state.deck.pop(), state.deck.pop()];
                    for (const pid in state.players) {
                        const p = state.players[pid];
                        if (p.chips <= 0) p.chips = 1000;
                        if (p.bet > p.chips) p.bet = p.chips;
                        
                        p.chips -= p.bet;
                        
                        p.hand = [state.deck.pop(), state.deck.pop()];
                        p.splitHand = null;
                        p.activeHandIndex = 1;
                        p.status = 'playing';
                        delete p.result;
                        delete p.splitResult;
                        delete p.doubled;
                        delete p.splitDoubled;
                    }
                    state.gameStarted = true;
                    state.currentPlayerId = Object.keys(state.players)[0];
                    state.turnStartTime = Date.now();
                    this.playSound(state, "gameStart.ogg");
                }
            } else if (type === "leave") {
                delete state.players[senderUid];
                if (data.playSound !== false) { // Only play sound if explicitly not false
                    this.playSound(state, "playerKick.ogg");
                }
                if (state.currentPlayerId === senderUid) {
                    this.nextTurn(state);
                }
            } else if (player && type === "hit") {
                if (state.currentPlayerId === senderUid) {
                    const activeHand = player.activeHandIndex === 2 ? player.splitHand : player.hand;
                    activeHand.push(state.deck.pop());
                    this.playSound(state, "card_flick.ogg");
                    if (this.calculateHandValue(activeHand) > 21) {
                        if (player.activeHandIndex === 1 && player.splitHand) {
                            player.activeHandIndex = 2;
                            state.turnStartTime = Date.now();
                        } else {
                            player.status = player.splitHand ? 'stand' : 'bust'; // If busted on second hand, overall state is 'stand' for resolution
                            this.nextTurn(state);
                        }
                    } else {
                        state.turnStartTime = Date.now();
                    }
                }
            } else if (player && type === "stand") {
                if (state.currentPlayerId === senderUid) {
                    this.playSound(state, "card_flick.ogg");
                    if (player.activeHandIndex === 1 && player.splitHand) {
                        player.activeHandIndex = 2;
                        state.turnStartTime = Date.now();
                    } else {
                        player.status = 'stand';
                        this.nextTurn(state);
                    }
                }
            } else if (player && type === "double-down") {
                if (state.advancedSettings.doubleDown && state.currentPlayerId === senderUid) {
                    const activeHand = player.activeHandIndex === 2 ? player.splitHand : player.hand;
                    if (activeHand.length === 2 && player.chips >= player.bet) {
                        player.chips -= player.bet;
                        activeHand.push(state.deck.pop());
                        this.playSound(state, "card_flick.ogg");
                        
                        if (player.activeHandIndex === 2) {
                            player.splitDoubled = true;
                        } else {
                            player.doubled = true;
                        }

                        if (player.activeHandIndex === 1 && player.splitHand) {
                            player.activeHandIndex = 2;
                            state.turnStartTime = Date.now();
                        } else {
                            player.status = 'stand';
                            this.nextTurn(state);
                        }
                    }
                }
            } else if (player && type === "split") {
                if (state.advancedSettings.split && state.currentPlayerId === senderUid) {
                    if (player.hand.length === 2 && player.hand[0].rank === player.hand[1].rank && !player.splitHand && player.chips >= player.bet) {
                        player.chips -= player.bet;
                        player.splitHand = [player.hand.pop()];
                        player.hand.push(state.deck.pop());
                        player.splitHand.push(state.deck.pop());
                        player.activeHandIndex = 1;
                        state.turnStartTime = Date.now();
                        this.playSound(state, "card_flick.ogg");
                    }
                }
            } else if (!player && type === "stand" && state.currentPlayerId === senderUid) {
                // Defensive turn advancement if player is missing
                this.nextTurn(state);
            }

            return state;
        }

        nextTurn(state) {
            const uids = Object.keys(state.players);
            const currentIndex = uids.indexOf(state.currentPlayerId);
            if (currentIndex < uids.length - 1) {
                state.currentPlayerId = uids[currentIndex + 1];
                state.turnStartTime = Date.now();
            } else {
                state.currentPlayerId = "dealer";
                this.resolveDealer(state);
            }
        }

        resolveDealer(state) {
            while (this.calculateHandValue(state.dealerHand) < 17) {
                state.dealerHand.push(state.deck.pop());
            }
            state.gameStarted = false;
            state.currentPlayerId = null;
            const dealerVal = this.calculateHandValue(state.dealerHand);
            const winners = [];

            const evaluateHand = (handVal, dealerV, isBlackjack) => {
                if (handVal > 21) return 'BUST';
                if (isBlackjack && dealerV !== 21) return 'BLACKJACK';
                if (dealerV > 21 || handVal > dealerV) return 'WIN';
                if (handVal === dealerV) return 'PUSH';
                return 'LOSE';
            };

            for (const pid in state.players) {
                const p = state.players[pid];
                
                // Evaluate Main Hand
                const playerVal = this.calculateHandValue(p.hand);
                const isBj = p.hand.length === 2 && playerVal === 21 && !p.splitHand;
                p.result = evaluateHand(playerVal, dealerVal, isBj);
                
                let totalWins = 0;
                let totalChipsWon = 0;
                
                const processPayout = (res, doubled) => {
                    const betAmount = doubled ? p.bet * 2 : p.bet;
                    if (res === 'BLACKJACK') {
                        totalWins++;
                        totalChipsWon += betAmount + (betAmount * 1.5); // 3:2
                    } else if (res === 'WIN') {
                        totalWins += doubled ? 2 : 1;
                        totalChipsWon += betAmount * 2; // 1:1
                    } else if (res === 'PUSH') {
                        totalChipsWon += betAmount; // Return bet
                    }
                };
                
                processPayout(p.result, p.doubled);

                // Evaluate Split Hand
                if (p.splitHand) {
                    const splitVal = this.calculateHandValue(p.splitHand);
                    p.splitResult = evaluateHand(splitVal, dealerVal, false);
                    processPayout(p.splitResult, p.splitDoubled);
                }

                if (totalChipsWon > 0) {
                    p.chips += totalChipsWon;
                }

                if (totalWins > 0) {
                    p.trophies = (p.trophies || 0) + totalWins;
                    const name = scene.users[pid]?.name || "Player";
                    winners.push(`${name} (+${totalChipsWon} 🪙)`);
                }
            }
            if (winners.length > 0) {
                state.winnerSummary = "WINNERS: " + winners.join(", ");
                this.playSound(state, "fanfare with pop.ogg");
            } else if (dealerVal <= 21) {
                state.winnerSummary = `DEALER WINS (${dealerVal})`;
            } else {
                state.winnerSummary = "EVERYONE WINS! (Dealer Bust)";
                this.playSound(state, "fanfare with pop.ogg");
            }
        }

        tick() {
            // Auto-claim host if none assigned and I'm the first in the list
            if (scene.localUser && this.gameState && !this.gameState.currentHostUid) {
                const uids = Object.keys(scene.users || {}).sort();
                if (uids.length > 0 && uids[0] === scene.localUser.uid) {
                    this.updateState({ currentHostUid: scene.localUser.uid });
                }
            }

            if (this.isHost() && this.gameState) {
                let changed = false;
                const now = Date.now();
                
                // Disconnect logic
                if (this.gameState.players) {
                    const playerUids = Object.keys(this.gameState.players);
                    for (const uid of playerUids) {
                        const p = this.gameState.players[uid];
                        if (!p) continue;
                        const isConnected = !!scene.users[uid];
                        
                        if (p.connected !== isConnected) {
                            p.connected = isConnected;
                            p.disconnectTime = isConnected ? 0 : now;
                            changed = true;
                        }
                        
                        if (!isConnected && p.disconnectTime > 0 && (now - p.disconnectTime > DISCONNECT_TIMEOUT_MS)) {
                            this.log(`Kicking ${uid} for disconnect.`);
                            // Determine if sound should be played:
                            // Play sound if the player was NOT disconnected when the state was initially loaded.
                            const wasInitiallyConnected = this.playersInitiallyLoaded.hasOwnProperty(uid) && this.playersInitiallyLoaded[uid];
                            const playSound = wasInitiallyConnected; // If they were connected initially, and now disconnected, play sound
                            this.handleAction(this.gameState, uid, "leave", { playSound: playSound });
                            changed = true;
                        }
                    }
                }

                if (this.gameState.gameStarted && this.gameState.currentPlayerId && this.gameState.currentPlayerId !== "dealer") {
                    if (now - this.gameState.turnStartTime > TURN_DURATION) {
                        this.handleAction(this.gameState, this.gameState.currentPlayerId, "stand", {});
                        changed = true;
                    }
                }
                
                if (changed) {
                    this.updateState({});
                }
            }

            this.updateTimerDisplay();
        }

        updateTimerDisplay() {
            if (!this.gameState || !this.gameState.players) return;

            for (let i = 0; i < MAX_PLAYERS; i++) {
                const slice = this.ui.slices[i];
                const player = Object.values(this.gameState.players).find(p => p.position === i);
                if (!slice || !player) {
                    if (slice) slice.timerText.text = "";
                    continue;
                }

                const pid = player.uid;
                const isMyTurn = this.gameState.currentPlayerId === pid;

                if (isMyTurn && this.gameState.turnStartTime && this.gameState.gameStarted) {
                    const timeLeft = Math.max(0, Math.ceil((this.gameState.turnStartTime + TURN_DURATION - Date.now()) / 1000));
                    slice.timerText.text = `(${timeLeft}s)`;
                } else {
                    slice.timerText.text = "";
                }
            }
        }

        // --- UI Updates ---

        updateUI() {
            if (!this.gameState) return;

            // Update Central Hub
            const isPlayer = !!this.gameState.players[scene.localUser.uid];
            const numPlayers = Object.keys(this.gameState.players).length;

            if (!this.gameState.gameStarted) {
                if (this.ui.settingsRow) this.ui.settingsRow.SetStyles({ display: 'flex' });
                if (this.ui.creditLabel) this.ui.creditLabel.SetStyles({ display: isPlayer ? 'none' : 'flex' });
                if (this.gameState.winnerSummary) {
                    this.ui.winnerLabel.text = this.gameState.winnerSummary;
                    this.ui.winnerLabel.SetStyles({ display: 'flex' });
                } else {
                    this.ui.winnerLabel.SetStyles({ display: 'none' });
                }

                this.ui.statusLabel.text = `Players: ${numPlayers}/${MAX_PLAYERS}`;
                this.ui.statusLabel.SetStyles({ display: 'flex', color: numPlayers >= MIN_PLAYERS ? '#4CAF50' : '#ffcc00' });
                this.ui.startBtn.SetStyles({ display: (this.isHost() && numPlayers >= MIN_PLAYERS) ? 'flex' : 'none' });
            } else {
                if (this.ui.settingsRow) this.ui.settingsRow.SetStyles({ display: 'none' });
                if (this.ui.creditLabel) this.ui.creditLabel.SetStyles({ display: 'none' });
                this.ui.winnerLabel.SetStyles({ display: 'none' });
                this.ui.statusLabel.SetStyles({ display: 'none' });
                this.ui.startBtn.SetStyles({ display: 'none' });
            }

            // Update Dealer UI (Now in Central Hub)
            if (!this.gameState.gameStarted && !isPlayer) {
                if (this.ui.dealerLabel) this.ui.dealerLabel.SetStyles({ display: 'none' });
                if (this.ui.dealerCards) this.ui.dealerCards.SetStyles({ display: 'none' });
            } else {
                if (this.ui.dealerLabel) this.ui.dealerLabel.SetStyles({ display: 'flex' });
                if (this.ui.dealerCards) this.ui.dealerCards.SetStyles({ display: 'flex' });
                const dealerVal = this.calculateHandValue(this.gameState.dealerHand);
                this.renderHand(this.ui.dealerCards, this.gameState.dealerHand, !this.gameState.gameStarted && this.gameState.dealerHand.length > 0);
            }

            this.ui.joinBtn.SetStyles({ display: (!isPlayer && !this.gameState.gameStarted) ? 'flex' : 'none' });
            this.ui.leaveBtn.SetStyles({ display: isPlayer ? 'flex' : 'none' });
            this.ui.claimBtn.SetStyles({ display: (!this.isHost() && !this.gameState.gameStarted) ? 'flex' : 'none' });

            // Update Slices
            for (let i = 0; i < MAX_PLAYERS; i++) {
                const slice = this.ui.slices[i];
                const player = Object.values(this.gameState.players).find(p => p.position === i);
                const pid = player ? player.uid : null;

                if (!player) {
                    slice.sRoot.SetStyles({ display: 'none' });
                    slice.hRoot.SetStyles({ display: 'none' });
                    if (slice.wedgeMat) slice.wedgeMat.color = new BS.Vector4(0.15, 0.15, 0.15, 1);
                    continue;
                }

                const isMyTurn = this.gameState.currentPlayerId === pid;
                if (slice.wedgeMat) {
                    if (isMyTurn) {
                        slice.wedgeMat.color = new BS.Vector4(0.4, 1.0, 0.4, 1); // Vibrant Green
                    } else if (pid === scene.localUser.uid) {
                        slice.wedgeMat.color = new BS.Vector4(0.2, 0.6, 1.0, 1); // Vibrant Blue
                    } else {
                        slice.wedgeMat.color = new BS.Vector4(0.3, 0.3, 0.3, 1); // Lighter Grey
                    }
                }

                slice.sRoot.SetStyles({ display: 'flex' });
                const trophies = player.trophies || 0;
                const chips = player.chips || 0;
                
                let valStr = "";
                if (this.gameState.gameStarted || (player.hand && player.hand.length > 0)) {
                    valStr = `[${this.calculateHandValue(player.hand)}]`;
                    if (player.splitHand) {
                        valStr = `[${this.calculateHandValue(player.hand)} | ${this.calculateHandValue(player.splitHand)}]`;
                    }
                }
                slice.nameText.text = (scene.users[pid]?.name || "Player") + ` (🪙${chips} | 🏆${trophies}) ${valStr}`;
                
                if (player.result) {
                    slice.nameText.text += ` - ${player.result}`;
                    if (player.splitResult) slice.nameText.text += ` | ${player.splitResult}`;
                }

                
                // Update Timer Display
                this.updateTimerDisplay();

                if (pid === scene.localUser.uid) {
                    slice.hRoot.SetStyles({ display: 'flex' });
                    
                    if (this.gameState.gameStarted) {
                        if (slice.bettingRow) slice.bettingRow.SetStyles({ display: 'none' });
                        if (slice.controlsRow) slice.controlsRow.SetStyles({ display: 'flex' });
                        
                        const activeHand = player.activeHandIndex === 2 ? (player.splitHand || []) : player.hand;
                        
                        slice.hitBtn.SetStyles({ display: isMyTurn ? 'flex' : 'none' });
                        slice.standBtn.SetStyles({ display: isMyTurn ? 'flex' : 'none' });
                        slice.doubleBtn.SetStyles({ display: (isMyTurn && activeHand.length === 2 && this.gameState.advancedSettings.doubleDown && player.chips >= player.bet) ? 'flex' : 'none' });
                        slice.splitBtn.SetStyles({ display: (isMyTurn && activeHand.length === 2 && activeHand[0].rank === activeHand[1].rank && this.gameState.advancedSettings.split && !player.splitHand && player.chips >= player.bet) ? 'flex' : 'none' });
                    } else {
                        if (slice.controlsRow) slice.controlsRow.SetStyles({ display: 'none' });
                        if (slice.bettingRow) {
                            slice.bettingRow.SetStyles({ display: 'flex' });
                            if (slice.betLabel) slice.betLabel.text = `Bet: ${player.bet || 10}`;
                        }
                    }

                    const handToRender = player.activeHandIndex === 2 ? (player.splitHand || player.hand) : player.hand;
                    this.renderHand(slice.cardsContainer, handToRender, true);
                } else {
                    slice.hRoot.SetStyles({ display: 'none' });
                    const handToRender = player.activeHandIndex === 2 ? (player.splitHand || player.hand) : player.hand;
                    this.renderHand(slice.cardsContainer, handToRender, true);
                }

                // Turn highlight
                if (isMyTurn) {
                    slice.sRoot.SetStyles({ borderColor: '#4CAF50', borderWidth: '4px' });
                } else {
                    slice.sRoot.SetStyles({ borderColor: 'rgba(255, 255, 255, 0.3)', borderWidth: '2px' });
                }
            }
        }



        playSound(state, soundFile) {
            state._triggerSound = soundFile;
        }

        renderHand(container, hand, showAll) {
            if (container.children) {
                while (container.children.length > 0) {
                    container.RemoveChild(container.children[0]);
                }
            }
            hand.forEach((card, idx) => {
                const isHidden = !showAll && idx === 1;
                const isRed = ['hearts', 'diamonds'].includes(card.suit);
                const cardEl = container.panel.CreateLabel(undefined, container);
                cardEl.Async().then(() => {
                    if (isHidden) {
                        // Card back — filled suit grid pattern on navy
                        cardEl.text = '\u2660\u2666\n\u2663\u2665'; // ♠♦ / ♣♥
                        cardEl.SetStyles({
                            width: '130px',
                            height: '175px',
                            backgroundColor: '#0b1156ff',
                            color: 'rgba(252, 202, 38, 0.91)',
                            fontSize: '44px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            borderRadius: '12px',
                            marginRight: '10px',
                            paddingTop: '14px',
                            borderWidth: '3px',
                            borderColor: 'rgba(255, 220, 100, 0.4)'
                        });
                    } else {
                        // Card face — rank on top line, outline suit symbol on bottom
                        const rank = this.getRankDisplay(card.rank);
                        const suit = this.getSuitSymbol(card.suit);
                        cardEl.text = rank + '\n' + suit;
                        cardEl.SetStyles({
                            width: '130px',
                            height: '175px',
                            backgroundColor: '#ffffff',
                            color: isRed ? '#c62828' : '#1a1a2e',
                            fontSize: '52px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            borderRadius: '12px',
                            marginRight: '10px',
                            paddingTop: '18px',
                            borderWidth: '3px',
                            borderColor: isRed ? 'rgba(198, 40, 40, 0.3)' : 'rgba(26, 26, 46, 0.25)'
                        });
                    }
                });
            });
        }
    }

    const game = new BlackjackGame();
    if (window.BS) {
        game.init();
    } else {
        window.addEventListener("bs-loaded", () => game.init());
    }
})();
