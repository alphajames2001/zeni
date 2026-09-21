// src/lib/mockApi.ts

import { authApi as realAuthApi, type AuthUser } from './api/auth';
import { walletApi as realWalletApi, type Transaction, WALLET_LIMITS } from './api/wallet';
import { influencerApi as realInfluencerApi } from './api/influencer';
import { gameApi as realGameApi, type Box } from './api/game';
import { api } from './api/client';

export type { Transaction, Box };
export type Mode = 'demo' | 'real';
export type Phase = 'waiting' | 'running' | 'crashed';

export interface Session {
  token: string;
  user: AuthUser;
}

export interface LiveBet {
  key: string;
  userId: string;
  box: Box;
  amount: number;
  cashedOutAt: number | null;
  payout: number | null;
  self: boolean;
}

export interface GameSnapshot {
  phase: Phase;
  roundId: number;
  multiplier: number;
  countdown: number;
  history: number[];
  liveBets: LiveBet[];
}

interface AppState {
  session: Session | null;
  mode: Mode;
  balances: { demo: number; real: number };
  transactions: Transaction[];
  responsible: { depositLimit: number | null; selfExcluded: boolean; sessionReminder: boolean };
}

const state: AppState = {
  session: null,
  mode: 'demo',
  balances: { demo: 50000, real: 0 },
  transactions: [],
  responsible: { depositLimit: null, selfExcluded: false, sessionReminder: true },
};

// ── Bot Configuration ──
const MAX_BOTS = 100;
const MIN_BOTS = 20;

// Extended bot names pool (200+ names for variety)
const BOT_NAMES = [
  // Crypto themed
  "LuckyPlayer7", "CryptoKing", "MpesaMaster", "CrashHunter", "HighRoller99",
  "BetQueen", "ProfitMaker", "RiskTaker", "MoneyMagnet", "JackpotSeeker",
  "ApexGambler", "CasinoPro", "BetSlayer", "WinningEdge", "FortuneChaser",
  "MegaStack", "GoldRush", "DiamondHands", "WolfOfWallSt", "MoonShot",
  "ThunderBets", "LightningCash", "StormChaser", "HurricaneBets", "TornadoWin",
  "AceHigh", "KingOfBets", "QueenOfSpades", "RoyalFlush", "StraightFlush",
  "FullHouse", "FourOfAKind", "ThreeOfAKind", "TwoPair", "OnePair",
  "HighCard", "DealerBot", "RNGesus", "ProvablyFair", "BlockchainBet",
  "CryptoPesa", "BitcoinBoss", "EthereumElite", "SolanaSage", "PolygonPro",
  "CardanoKing", "AvalancheAce", "FantomFlyer", "NearNoble", "CosmosCrusher",
  
  // Kenya themed
  "KenyaKing", "NairobiNoble", "MombasaMaverick", "KisumuKnight", "EldoretEagle",
  "ThikaTiger", "NakuruNinja", "MalindiMystic", "DianiDiamond", "LamuLegend",
  "SafariSam", "MaasaiMara", "Kilimanjaro", "Serengeti", "VictoriaFalls",
  "Zambezi", "Okavango", "Namib", "Kalahari", "SaharaSun",
  "DesertStorm", "OasisFinder", "MirageChaser", "DuneRider", "CamelKing",
  "SavannaSprint", "JungleJump", "RainforestRumble", "CanyonCrusher", "DeltaDash",
  "WaveRider", "TideChaser", "CurrentSurfer", "DeepDiver", "CoralReef",
  
  // Space themed
  "StarGazer", "NebulaNavigator", "GalaxyGambler", "CosmicCrash", "AstroBet",
  "MeteorMania", "CometChaser", "AsteroidAce", "OrbitKing", "SaturnSage",
  "NeptuneNoble", "UranusUniverse", "PlutoPlayer", "MercuryMaster", "VenusVibe",
  "MarsMarauder", "JupiterJoker", "SolarSurfer", "LunarLucky", "StellarStar",
  
  // Animal themed
  "AlphaWolf", "BetaBear", "GammaGorilla", "DeltaDragon", "EpsilonEagle",
  "ZetaZebra", "EtaElephant", "ThetaTiger", "IotaIguana", "KappaKoala",
  "LambdaLion", "MuMoose", "NuNarwhal", "XiXerus", "OmicronOctopus",
  "PiPanther", "RhoRhino", "SigmaShark", "TauTurtle", "UpsilonUnicorn",
  
  // Mythological
  "ZeusBet", "AthenaAce", "ApolloApex", "HermesHigh", "AresRisk",
  "PoseidonProfit", "HadesHighRoller", "HeraHunter", "DemeterDiamond", "DionysusDare",
  "OdinOdds", "ThorThunder", "LokiLucky", "FreyaFortune", "BaldurBet",
  "TyrTitan", "HeimdallHigh", "SkadiSkill", "FreyjaFlush", "NjordNoble",
  
  // African themed
  "KenteKing", "AshantiAce", "ZuluZeal", "XhosaXpert", "YorubaYolo",
  "IgboIcon", "HausaHigh", "BerberBet", "NubianNoble", "MaliMystic",
  "SonghaiStar", "GhanaGold", "BeninBronze", "DahomeyDiamond", "KongoKing",
  "LubaLegend", "LundaLucky", "BembaBold", "ChewaChampion", "ShonaShark",
  
  // Tech themed
  "PixelPro", "ByteBet", "CacheCash", "KernelKing", "DataDare",
  "CloudChaser", "ServerSage", "FirewallFlyer", "RouterRider", "GatewayGambler",
  "AlgorithmAce", "CodeCrusher", "ScriptSurfer", "BinaryBoss", "HexHunter",
  "NodeNoble", "PackagePro", "StreamStar", "BufferBet", "CacheCrusher",
  
  // Random generated names
  "ZigZagZephyr", "QuantumQuest", "NovaNexus", "VortexVibe", "EclipseEdge",
  "PhantomPulse", "RadiantRush", "ShadowStrike", "TitanTact", "VelocityVault",
  "ZenithZest", "ApexAurora", "BlitzBolt", "CrimsonCrown", "DriftDynamo",
  "EchoEmber", "FrostFury", "GlimmerGhost", "HaloHavoc", "InfernoIris",
  "JadeJaguar", "KarmaKnight", "LunarLynx", "MysticMirage", "NebulaNova",
  "ObsidianOmen", "PrismPhantom", "QuakeQuasar", "RavenReign", "SableSage",
  "TempestTide", "UmbraUnity", "ViperVengeance", "WraithWarden", "XenonXplorer",
  "YukiYokai", "ZenithZodiac"
];

// Bot state tracking
interface Bot {
  id: string;
  name: string;
  active: boolean;
  box: Box;
  amount: number;
  cashedOutAt: number | null;
  hasBetThisRound: boolean;
}

let bots: Bot[] = [];
let botInterval: ReturnType<typeof setInterval> | null = null;
let gameInterval: ReturnType<typeof setInterval> | null = null;

// ── Game State ──
let gameState: GameSnapshot = {
  phase: 'waiting',
  roundId: 1,
  multiplier: 1.0,
  countdown: 5,
  history: [1.02, 1.45, 2.10, 1.08, 3.50, 1.15, 1.67, 4.20, 1.03, 1.89],
  liveBets: [],
};

// ── Auth ──
export const authApi = {
  async login(email: string, password: string) {
    const result = await realAuthApi.login({ email, password });
    if (result.success && result.data) {
      state.session = { token: result.data.token, user: result.data.user };
      state.mode = 'demo';
      await refreshBalances();
      startBalancePolling();
      notifyListeners();
      return { ok: true as const, session: state.session };
    }
    return { ok: false as const, error: result.error || 'Login failed' };
  },

  async signup(data: { username: string; email: string; phone: string; password: string }) {
    const result = await realAuthApi.signup(data);
    if (result.success && result.data) {
      state.session = { token: result.data.token, user: result.data.user };
      state.mode = 'demo';
      await refreshBalances();
      startBalancePolling();
      notifyListeners();
      return { ok: true as const, session: state.session };
    }
    return { ok: false as const, error: result.error || 'Signup failed' };
  },

  async adminLogin(email: string, password: string) {
    const result = await realAuthApi.adminLogin({ email, password });
    if (result.success && result.data) {
      state.session = { token: result.data.token, user: result.data.user };
      state.mode = 'real';
      await refreshBalances();
      startBalancePolling();
      notifyListeners();
      return { ok: true as const, session: state.session };
    }
    return { ok: false as const, error: result.error || 'Login failed' };
  },

  logout() {
    realAuthApi.logout();
    state.session = null;
    state.balances = { demo: 50000, real: 0 };
    state.mode = 'demo';
    notifyListeners();
    return { ok: true as const };
  },

  me() {
    return state.session;
  },

  async updatePhone(phone: string) {
    const result = await realAuthApi.updatePhone(phone);
    if (result.success) {
      if (state.session) {
        state.session = { ...state.session, user: { ...state.session.user, phone } };
        notifyListeners();
      }
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error || 'Failed to update phone number' };
  },

  async forgotPassword(email: string) {
    const result = await realAuthApi.requestPasswordReset(email);
    return result.success
      ? { ok: true as const }
      : { ok: false as const, error: result.error || 'Failed to send reset email' };
  },

  async verifyOtp(_code: string) {
    return { ok: false as const, error: 'OTP verification not available — password reset uses an email link' };
  },
  async resetPassword(_password: string) {
    return { ok: false as const, error: 'Password reset not available here — follow the link in the reset email' };
  },
};

// ── Wallet ──
export const walletApi = {
  async depositInitiate(phone: string, amount: number) {
    const result = await realWalletApi.depositInitiate({ phone, amount });
    if (result.success && result.data) {
      return { ok: true as const, transactionId: result.data.transactionId };
    }
    return { ok: false as const, error: result.error || 'Deposit failed' };
  },

  async depositStatus(transactionId: string): Promise<{ status: 'pending' | 'success' | 'failed' }> {
    const result = await realWalletApi.getTransactions();
    if (result.success && result.data) {
      const tx = result.data.find((t) => t.ID === transactionId);
      if (tx?.Status === 'completed') return { status: 'success' };
      if (tx?.Status === 'rejected') return { status: 'failed' };
    }
    return { status: 'pending' };
  },

  async withdraw(amount: number, phone: string) {
    if (state.session?.user.role === 'influencer') {
      const result = await realInfluencerApi.withdrawToMockMpesa(amount);
      if (result.success && result.data) {
        applyBalanceDelta('real', -amount);
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error || 'Withdrawal failed' };
    }

    const result = await realWalletApi.withdraw({ amount, phone });
    if (result.success) {
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error || 'Withdrawal failed' };
  },

  transactions() {
    return realWalletApi.getTransactions();
  },

  setMode(mode: Mode) {
    state.mode = mode;
    if (typeof window !== 'undefined') localStorage.setItem('zenipesa_mode', mode);
    notifyListeners();
  },

  mode() {
    return state.mode;
  },

  limits: () => ({
    minDeposit: WALLET_LIMITS.minDepositKES,
    maxWithdraw: WALLET_LIMITS.maxWithdrawalKES,
    minStake: WALLET_LIMITS.minBetKES,
    maxSinglePayout: WALLET_LIMITS.maxCashoutKES,
  }),
};

// ── Game ──
export const gameApi = {
  async placeBet(box: Box, amount: number, mode: Mode) {
    if (!state.session) {
      const currentBalance = state.balances.demo;
      if (currentBalance < amount) {
        return { ok: false as const, error: 'Insufficient demo balance' };
      }
      applyBalanceDelta('demo', -amount);
      return { ok: true as const, betId: `guest_${Date.now()}_${box}` };
    }

    const result = await realGameApi.placeBet({ box, amount, currency: mode });
    if (result.success && result.data) {
      applyBalanceDelta(mode, -amount);
      return { ok: true as const, betId: result.data.betId };
    }
    return { ok: false as const, error: result.error || 'Bet failed' };
  },

  async cashout(box: Box, mode: Mode) {
    if (!state.session) {
      return { ok: true as const, payout: 0, multiplier: 0 };
    }

    const result = await realGameApi.cashout(box);
    if (result.success && result.data) {
      applyBalanceDelta(mode, result.data.payout);
      return { ok: true as const, payout: result.data.payout, multiplier: result.data.multiplier };
    }
    return { ok: false as const, error: result.error || 'Cashout failed' };
  },
};

// ── Profile / responsible-gaming prefs ──
export const profileApi = {
  responsible: () => state.responsible,
  updateResponsible(patch: Partial<AppState['responsible']>) {
    state.responsible = { ...state.responsible, ...patch };
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenipesa_responsible', JSON.stringify(state.responsible));
    }
    notifyListeners();
  },
};

// ── State plumbing ──
const listeners = new Set<() => void>();

export function subscribeState(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function getState() {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('zenipesa_mode') as Mode | null;
    if (savedMode && (savedMode === 'demo' || savedMode === 'real')) {
      state.mode = savedMode;
    }
    const savedResponsible = localStorage.getItem('zenipesa_responsible');
    if (savedResponsible) {
      try {
        state.responsible = JSON.parse(savedResponsible);
      } catch {}
    }
  }
  return state;
}

export function applyBalanceDelta(mode: Mode, delta: number) {
  state.balances[mode] = Math.max(0, Math.round((state.balances[mode] + delta) * 100) / 100);
  notifyListeners();
}

// ── Balance reconciliation ──
async function refreshBalances() {
  if (!state.session) {
    state.balances = { demo: 50000, real: 0 };
    notifyListeners();
    return;
  }
  
  try {
    const [profileRes, walletRes] = await Promise.all([
      realAuthApi.getProfile(),
      realWalletApi.getBalance()
    ]);
    
    let changed = false;

    if (profileRes.success && profileRes.data) {
      const demo = profileRes.data.demoBalance ?? 0;
      if (demo !== state.balances.demo) {
        state.balances.demo = demo;
        changed = true;
      }
    }
    
    if (walletRes.success && walletRes.data) {
      const real = walletRes.data.realBalance ?? 0;
      if (real !== state.balances.real) {
        state.balances.real = real;
        changed = true;
      }
    }
    
    if (changed) {
      notifyListeners();
    }
  } catch (error) {
    console.error('[Balance] Failed to refresh balances:', error);
  }
}

let pollingStarted = false;
function startBalancePolling() {
  if (pollingStarted || typeof window === 'undefined') return;
  pollingStarted = true;
  setInterval(refreshBalances, 30000);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshBalances();
  });
  window.addEventListener('focus', () => refreshBalances());
}

// ── Session rehydration ──
let authInitStarted = false;
export function initAuth() {
  if (authInitStarted || typeof window === 'undefined') return;
  authInitStarted = true;

  const token = api.getToken();
  if (!token) {
    state.session = null;
    state.mode = 'demo';
    state.balances = { demo: 50000, real: 0 };
    notifyListeners();
    initBots();
    return;
  }

  realAuthApi.getProfile().then((result) => {
    if (result.success && result.data) {
      const profile = result.data;
      state.session = {
        token,
        user: {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          phone: profile.phone,
          role: profile.role,
          canDebug: profile.canDebug,
        },
      };
      state.mode = 'demo';
      state.balances.demo = profile.demoBalance ?? 0;
      state.balances.real = profile.realBalance ?? 0;
      
      refreshBalances();
      startBalancePolling();
    } else {
      api.clearToken();
      state.session = null;
      state.mode = 'demo';
      state.balances = { demo: 50000, real: 0 };
    }
    notifyListeners();
    initBots();
  }).catch(() => {
    api.clearToken();
    state.session = null;
    state.mode = 'demo';
    state.balances = { demo: 50000, real: 0 };
    notifyListeners();
    initBots();
  });
}

if (typeof window !== 'undefined') {
  initAuth();
  startGameLoop();
}

// ── Bot Management ──
function initBots() {
  const numBots = Math.floor(Math.random() * (MAX_BOTS - MIN_BOTS + 1)) + MIN_BOTS;
  const shuffledNames = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  
  bots = [];
  for (let i = 0; i < numBots && i < shuffledNames.length; i++) {
    bots.push({
      id: `bot_${Date.now()}_${i}`,
      name: shuffledNames[i],
      active: true,
      box: (Math.random() > 0.5 ? 1 : 2) as Box,
      amount: 0,
      cashedOutAt: null,
      hasBetThisRound: false,
    });
  }
  
  console.log(`[Bots] Initialized ${bots.length} bots`);
}

function getRandomBetAmount(): number {
  // Random bet between 10 and 5000 with weighted distribution
  const weights = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const probabilities = [0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05, 0.03, 0.02];
  let rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += probabilities[i];
    if (rand < cumulative) return weights[i];
  }
  return 100;
}

function getRandomCashoutMultiplier(): number {
  // Random cashout between 1.1x and 10x with weighted distribution
  const weights = [1.05, 1.1, 1.2, 1.5, 2.0, 3.0, 5.0, 10.0];
  const probabilities = [0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05, 0.05];
  let rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += probabilities[i];
    if (rand < cumulative) return weights[i];
  }
  return 1.5;
}

function getRandomBox(): Box {
  return Math.random() > 0.5 ? 1 : 2;
}

function processBotBets() {
  if (gameState.phase === 'waiting') {
    // Reset bot state for new round
    bots.forEach(bot => {
      bot.hasBetThisRound = false;
      bot.cashedOutAt = null;
      bot.amount = 0;
    });
    return;
  }

  if (gameState.phase === 'running') {
    // Place bets for bots that haven't bet this round
    const availableBots = bots.filter(b => !b.hasBetThisRound);
    const numToBet = Math.floor(Math.random() * Math.min(availableBots.length, 30)) + 5;
    
    for (let i = 0; i < numToBet && i < availableBots.length; i++) {
      const bot = availableBots[i];
      const amount = getRandomBetAmount();
      const box = getRandomBox();
      
      bot.hasBetThisRound = true;
      bot.amount = amount;
      bot.box = box;
      bot.cashedOutAt = null;
      
      // Add to live bets
      gameState.liveBets.push({
        key: `bot_${bot.id}_${Date.now()}`,
        userId: bot.name,
        box: box,
        amount: amount,
        cashedOutAt: null,
        payout: null,
        self: false,
      });
    }
    
    // Process cashouts for bots that have bets
    const activeBets = gameState.liveBets.filter(bet => bet.cashedOutAt === null && bet.userId !== 'You');
    const numToCashout = Math.floor(Math.random() * Math.min(activeBets.length, 15)) + 3;
    
    for (let i = 0; i < numToCashout && i < activeBets.length; i++) {
      const bet = activeBets[i];
      const cashoutMultiplier = getRandomCashoutMultiplier();
      
      // Only cashout if current multiplier is high enough
      if (gameState.multiplier >= cashoutMultiplier) {
        const payout = Math.round(bet.amount * cashoutMultiplier * 100) / 100;
        bet.cashedOutAt = cashoutMultiplier;
        bet.payout = payout;
        
        // Update bot state
        const bot = bots.find(b => b.name === bet.userId);
        if (bot) {
          bot.cashedOutAt = cashoutMultiplier;
        }
      }
    }
    
    notifyListeners();
  }
  
  if (gameState.phase === 'crashed') {
    // Any bot bets not cashed out are lost
    gameState.liveBets.forEach(bet => {
      if (bet.cashedOutAt === null && bet.userId !== 'You') {
        bet.cashedOutAt = 0;
        bet.payout = 0;
      }
    });
    notifyListeners();
  }
}

// ── Game Loop ──
function startGameLoop() {
  if (gameInterval) return;
  
  gameInterval = setInterval(() => {
    switch (gameState.phase) {
      case 'waiting':
        gameState.countdown -= 0.1;
        if (gameState.countdown <= 0) {
          gameState.phase = 'running';
          gameState.multiplier = 1.0;
          gameState.countdown = 0;
          gameState.liveBets = []; // Clear previous round bets
          
          // Add some initial bot bets when round starts
          setTimeout(() => processBotBets(), 100);
        }
        break;
        
      case 'running':
        // Increase multiplier with slight randomness
        const increment = 0.02 + (Math.random() * 0.03);
        gameState.multiplier = Math.round((gameState.multiplier + increment) * 100) / 100;
        
        // Process bot cashouts every few ticks
        if (Math.random() < 0.3) {
          processBotBets();
        }
        
        // Random crash between 1.5x and 20x
        const crashPoint = 1.5 + (Math.random() * 18.5);
        if (gameState.multiplier >= crashPoint) {
          gameState.phase = 'crashed';
          gameState.history.unshift(gameState.multiplier);
          if (gameState.history.length > 50) gameState.history.pop();
          
          // Final bot processing
          processBotBets();
          
          // Start new round after delay
          setTimeout(() => {
            gameState.phase = 'waiting';
            gameState.countdown = 5 + (Math.random() * 3);
            gameState.roundId++;
            gameState.liveBets = [];
            
            // Reset bots for next round
            bots.forEach(bot => {
              bot.hasBetThisRound = false;
              bot.cashedOutAt = null;
              bot.amount = 0;
            });
            
            notifyListeners();
          }, 3000);
        }
        break;
        
      case 'crashed':
        // Wait for timeout to reset
        break;
    }
    
    notifyListeners();
  }, 100); // Update every 100ms for smooth animation
}

// Bot processing interval (separate from game loop for more responsive betting)
if (typeof window !== 'undefined') {
  botInterval = setInterval(() => {
    if (gameState.phase === 'running' && bots.length > 0) {
      // Randomly add new bot bets during the round
      const activeBots = bots.filter(b => !b.hasBetThisRound);
      if (activeBots.length > 0 && Math.random() < 0.2) {
        const numNew = Math.floor(Math.random() * Math.min(activeBots.length, 5)) + 1;
        for (let i = 0; i < numNew && i < activeBots.length; i++) {
          const bot = activeBots[i];
          const amount = getRandomBetAmount();
          const box = getRandomBox();
          
          bot.hasBetThisRound = true;
          bot.amount = amount;
          bot.box = box;
          
          gameState.liveBets.push({
            key: `bot_${bot.id}_${Date.now()}`,
            userId: bot.name,
            box: box,
            amount: amount,
            cashedOutAt: null,
            payout: null,
            self: false,
          });
          
          notifyListeners();
        }
      }
    }
  }, 2000); // Check every 2 seconds
}

// ── Formatting helpers ──
export function formatKES(n: number) {
  return new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function multiplierTier(m: number): 'low' | 'mid' | 'high' {
  if (m < 2) return 'low';
  if (m <= 10) return 'mid';
  return 'high';
}

export function maskPhone(phone: string) {
  if (!phone) return '';
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

export const LIMITS = {
  minStake: WALLET_LIMITS.minBetKES,
  minDeposit: WALLET_LIMITS.minDepositKES,
  maxWithdraw: WALLET_LIMITS.maxWithdrawalKES,
  maxSinglePayout: WALLET_LIMITS.maxCashoutKES,
};