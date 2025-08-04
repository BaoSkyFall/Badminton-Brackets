import { useState } from 'react';
import { RotateCcw, Play, Users, Crown, Medal, Award, BookOpen, X } from 'lucide-react';

const DoubleEliminationBracket = () => {
  const [players, setPlayers] = useState([
    'Bảo', 'Quân', 'Phúc', 'Dũng', 'Hạnh',
    'Hướng Minh', 'Quang Minh', 'Anh Công', 'Hòa', 'Long'
  ]);

  const [winnersBracket, setWinnersBracket] = useState({
    round1: [
      { id: 'W1-1', player1: '', player2: '', winner: '', completed: false },
      { id: 'W1-2', player1: '', player2: '', winner: '', completed: false },
      { id: 'W1-3', player1: '', player2: '', winner: '', completed: false },
      { id: 'W1-4', player1: '', player2: '', winner: '', completed: false },
      { id: 'W1-5', player1: '', player2: '', winner: '', completed: false }
    ],
    semifinals: [
      { id: 'WS-1', player1: '', player2: '', winner: '', completed: false },
      { id: 'WS-2', player1: '', player2: '', winner: '', completed: false }
    ],
    finals: [
      { id: 'WF', player1: '', player2: '', winner: '', completed: false }
    ]
  });

  const [losersBracket, setLosersBracket] = useState({
    round1: [
      { id: 'L1-1', player1: '', player2: '', winner: '', completed: false },
      { id: 'L1-2', player1: '', player2: '', winner: '', completed: false }
    ],
    round2: [
      { id: 'L2-1', player1: '', player2: '', winner: '', completed: false },
      { id: 'L2-2', player1: '', player2: '', winner: '', completed: false }
    ],
    round3: [
      { id: 'L3-1', player1: '', player2: '', winner: '', completed: false }
    ],
    finals: [
      { id: 'LF', player1: '', player2: '', winner: '', completed: false }
    ]
  });

  const [grandFinals, setGrandFinals] = useState([
    { id: 'GF', player1: '', player2: '', winner: '', completed: false }
  ]);

  const [champion, setChampion] = useState<string | null>(null);
  const [runnerUp, setRunnerUp] = useState<string | null>(null);
  const [thirdPlace, setThirdPlace] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Kiểm tra xem có thể tiến vòng không
  const canAdvance = () => {
    // Step 1: Round 1 completed, semifinals empty
    if (winnersBracket.round1.every(m => m.completed) && 
        winnersBracket.semifinals.every(m => !m.player1 && !m.player2)) {
      return true;
    }
    
    // Step 2: Semifinals completed, finals empty
    if (winnersBracket.semifinals.every(m => m.completed) && 
        !winnersBracket.finals[0].player1 && !winnersBracket.finals[0].player2) {
      return true;
    }
    
    // Step 3: LR1 completed, LR2 has empty slots (allow advancement)
    if (losersBracket.round1.every(m => m.completed) && 
        losersBracket.round2.some(m => !m.player1 || !m.player2) &&
        winnersBracket.semifinals.every(m => m.completed)) {
      return true; // Allow advancing losers bracket when winners semifinals are done
    }
    
    // Step 4: LR2 completed, LR3 empty
    if (losersBracket.round2.every(m => m.completed) && 
        !losersBracket.round3[0].player1 && !losersBracket.round3[0].player2) {
      return true;
    }
    
    // Step 5: LR3 completed and Winners Finals completed, Losers Finals empty
    if (losersBracket.round3.every(m => m.completed) && 
        winnersBracket.finals[0].completed &&
        !losersBracket.finals[0].player1 && !losersBracket.finals[0].player2) {
      return true;
    }
    
    // Step 6: Both finals completed, Grand Finals empty
    if (winnersBracket.finals[0].completed && losersBracket.finals[0].completed &&
        !grandFinals[0].player1 && !grandFinals[0].player2) {
      return true;
    }
    
    return false;
  };

  const initializeBracket = () => {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Setup Winners Bracket Round 1 - 5 trận cho 10 người
    const newWinnersBracket = { ...winnersBracket };
    
    for (let i = 0; i < 5; i++) {
      newWinnersBracket.round1[i] = {
        ...newWinnersBracket.round1[i],
        player1: shuffledPlayers[i * 2],
        player2: shuffledPlayers[i * 2 + 1],
        winner: '',
        completed: false
      };
    }

    setWinnersBracket(newWinnersBracket);
  };

  const updateMatch = (bracket: string, round: string, matchId: string, winner: string) => {
    if (bracket === 'winners') {
      setWinnersBracket(prev => ({
        ...prev,
        [round]: (prev as any)[round].map((match: any) => 
          match.id === matchId ? { ...match, winner, completed: true } : match
        )
      }));
    } else if (bracket === 'losers') {
      setLosersBracket(prev => ({
        ...prev,
        [round]: (prev as any)[round].map((match: any) => 
          match.id === matchId ? { ...match, winner, completed: true } : match
        )
      }));
    } else if (bracket === 'grand') {
      setGrandFinals(prev => 
        prev.map(match => 
          match.id === matchId ? { ...match, winner, completed: true } : match
        )
      );
      
      if (winner) {
        setChampion(winner);
        const loser = grandFinals[0].player1 === winner ? grandFinals[0].player2 : grandFinals[0].player1;
        setRunnerUp(loser);
      }
    }
  };

  const advanceWinners = () => {
    const newWinnersBracket = { ...winnersBracket };
    const newLosersBracket = { ...losersBracket };
    const newGrandFinals = [...grandFinals];

    // Step 1: Round 1 -> Semifinals (Winners) và Round 1 (Losers)
    if (winnersBracket.round1.every(m => m.completed) && 
        winnersBracket.semifinals.every(m => !m.player1 && !m.player2)) {
      
      const winners = winnersBracket.round1.filter(m => m.winner).map(m => m.winner);
      const losers = winnersBracket.round1
        .filter(m => m.completed)
        .map(m => m.player1 === m.winner ? m.player2 : m.player1)
        .filter(p => p);

      // Advance winners to semifinals (5 người thắng -> 4 người vào bán kết, 1 bye)
      if (winners.length >= 4) {
        newWinnersBracket.semifinals[0] = {
          ...newWinnersBracket.semifinals[0],
          player1: winners[0],
          player2: winners[1],
        };
        newWinnersBracket.semifinals[1] = {
          ...newWinnersBracket.semifinals[1],
          player1: winners[2],
          player2: winners[3],
        };
      }

      // Setup losers bracket với 5 người thua -> 4 người vào LR1
      if (losers.length >= 4) {
        newLosersBracket.round1[0] = {
          ...newLosersBracket.round1[0],
          player1: losers[0],
          player2: losers[1],
        };
        newLosersBracket.round1[1] = {
          ...newLosersBracket.round1[1],
          player1: losers[2],
          player2: losers[3],
        };
      }
    }
    
    // Step 2: Semifinals -> Finals (Winners) và Round 2 (Losers)
    else if (winnersBracket.semifinals.every(m => m.completed) && 
             !winnersBracket.finals[0].player1 && !winnersBracket.finals[0].player2) {
      
      const semifinalWinners = winnersBracket.semifinals.filter(m => m.winner).map(m => m.winner);
      const semifinalLosers = winnersBracket.semifinals
        .filter(m => m.completed)
        .map(m => m.player1 === m.winner ? m.player2 : m.player1);
      
      // Advance to Winners Finals
      if (semifinalWinners.length >= 2) {
        newWinnersBracket.finals[0] = {
          ...newWinnersBracket.finals[0],
          player1: semifinalWinners[0],
          player2: semifinalWinners[1],
        };
      }

      // Losers from semifinals go to LR2
      const lr1Winners = losersBracket.round1.filter(m => m.winner).map(m => m.winner);
      if (lr1Winners.length >= 2 && semifinalLosers.length >= 1) {
        newLosersBracket.round2[0] = {
          ...newLosersBracket.round2[0],
          player1: lr1Winners[0],
          player2: semifinalLosers[0],
        };
        if (semifinalLosers[1]) {
          newLosersBracket.round2[1] = {
            ...newLosersBracket.round2[1],
            player1: lr1Winners[1],
            player2: semifinalLosers[1],
          };
        }
      }
    }
    
    // Step 3: LR2 -> LR3
    else if (losersBracket.round2.every(m => m.completed) && 
             !losersBracket.round3[0].player1 && !losersBracket.round3[0].player2) {
      
      const lr2Winners = losersBracket.round2.filter(m => m.winner).map(m => m.winner);
      if (lr2Winners.length >= 2) {
        newLosersBracket.round3[0] = {
          ...newLosersBracket.round3[0],
          player1: lr2Winners[0],
          player2: lr2Winners[1],
        };
      }
    }
    
    // Step 4: LR3 -> Losers Finals
    else if (losersBracket.round3.every(m => m.completed) && 
             !losersBracket.finals[0].player1 && !losersBracket.finals[0].player2) {
      
      const lr3Winner = losersBracket.round3[0].winner;
      const winnersFinalsLoser = winnersBracket.finals[0].completed ? 
        (winnersBracket.finals[0].player1 === winnersBracket.finals[0].winner ? 
         winnersBracket.finals[0].player2 : winnersBracket.finals[0].player1) : null;
      
      if (lr3Winner && winnersFinalsLoser) {
        newLosersBracket.finals[0] = {
          ...newLosersBracket.finals[0],
          player1: lr3Winner,
          player2: winnersFinalsLoser,
        };
      }
    }
    
    // Step 5: Setup Grand Finals
    else if (winnersBracket.finals[0].completed && losersBracket.finals[0].completed &&
             !grandFinals[0].player1 && !grandFinals[0].player2) {
      
      const winnersChamp = winnersBracket.finals[0].winner;
      const losersChamp = losersBracket.finals[0].winner;
      
      if (winnersChamp && losersChamp) {
        newGrandFinals[0] = {
          ...newGrandFinals[0],
          player1: winnersChamp,
          player2: losersChamp,
        };
      }
    }

    setWinnersBracket(newWinnersBracket);
    setLosersBracket(newLosersBracket);
    setGrandFinals(newGrandFinals);
  };

  const resetBracket = () => {
    setWinnersBracket({
      round1: [
        { id: 'W1-1', player1: '', player2: '', winner: '', completed: false },
        { id: 'W1-2', player1: '', player2: '', winner: '', completed: false },
        { id: 'W1-3', player1: '', player2: '', winner: '', completed: false },
        { id: 'W1-4', player1: '', player2: '', winner: '', completed: false },
        { id: 'W1-5', player1: '', player2: '', winner: '', completed: false }
      ],
      semifinals: [
        { id: 'WS-1', player1: '', player2: '', winner: '', completed: false },
        { id: 'WS-2', player1: '', player2: '', winner: '', completed: false }
      ],
      finals: [
        { id: 'WF', player1: '', player2: '', winner: '', completed: false }
      ]
    });

    setLosersBracket({
      round1: [
        { id: 'L1-1', player1: '', player2: '', winner: '', completed: false },
        { id: 'L1-2', player1: '', player2: '', winner: '', completed: false }
      ],
      round2: [
        { id: 'L2-1', player1: '', player2: '', winner: '', completed: false },
        { id: 'L2-2', player1: '', player2: '', winner: '', completed: false }
      ],
      round3: [
        { id: 'L3-1', player1: '', player2: '', winner: '', completed: false }
      ],
      finals: [
        { id: 'LF', player1: '', player2: '', winner: '', completed: false }
      ]
    });

    setGrandFinals([
      { id: 'GF', player1: '', player2: '', winner: '', completed: false }
    ]);

    setChampion(null);
    setRunnerUp(null);
    setThirdPlace(null);
  };

  const MatchBox = ({ match, bracket, round, size = 'normal' }: { match: any, bracket: string, round: string, size?: string }) => {
    const boxWidth = size === 'large' ? 'w-64' : size === 'small' ? 'w-48' : 'w-56';
    
    return (
      <div className={`${boxWidth} bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl border-2 border-[#0050fa]/20 overflow-hidden backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
        {match.isBye ? (
          <div className="p-4 text-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              {match.player1}
            </div>
            <div className="text-sm text-[#0050fa] font-bold mt-2 uppercase tracking-wide">BYE</div>
          </div>
        ) : (
          <div className="p-3">
            <div className="space-y-2">
              <button
                onClick={() => match.player1 && match.player2 && !match.completed && updateMatch(bracket, round, match.id, match.player1)}
                disabled={!match.player1 || !match.player2 || match.completed}
                className={`w-full p-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  match.winner === match.player1
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                    : match.completed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : match.player1 && match.player2
                    ? 'bg-gradient-to-r from-[#0050fa]/10 to-blue-100 hover:from-green-100 hover:to-green-200 cursor-pointer border-2 border-[#0050fa]/40 hover:border-green-400 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {match.player1 || 'TBD'}
              </button>
              
              <div className="text-center text-xs font-black text-[#0050fa] bg-gradient-to-r from-transparent via-[#0050fa]/10 to-transparent py-1 rounded-full uppercase tracking-widest">VS</div>
              
              <button
                onClick={() => match.player1 && match.player2 && !match.completed && updateMatch(bracket, round, match.id, match.player2)}
                disabled={!match.player1 || !match.player2 || match.completed}
                className={`w-full p-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  match.winner === match.player2
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                    : match.completed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : match.player1 && match.player2
                    ? 'bg-gradient-to-r from-[#0050fa]/10 to-blue-100 hover:from-green-100 hover:to-green-200 cursor-pointer border-2 border-[#0050fa]/40 hover:border-green-400 hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {match.player2 || 'TBD'}
              </button>
            </div>
            
            <div className="text-center mt-2">
              {match.completed ? (
                <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">✓ HOÀN THÀNH</span>
              ) : match.player1 && match.player2 ? (
                <span className="text-xs text-[#0050fa] font-bold bg-[#0050fa]/10 px-2 py-1 rounded-full animate-pulse">⚡ SẴN SÀNG</span>
              ) : (
                <span className="text-xs text-gray-400 font-medium">⏳ CHỜ</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 relative overflow-hidden">
      {/* Sporty background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-4 border-white animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full border-2 border-blue-300 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/3 w-16 h-16 rounded-full border-2 border-white opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 rounded-full border-3 border-blue-200 animate-pulse"></div>
      </div>
      <div className="relative z-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-xl shadow-2xl p-6 border-2 border-[#0050fa]/20">
          <div className="flex flex-col gap-4 items-center justify-between mb-6">
            <div className="flex flex-col gap-6 items-center space-x-4">
              <img src="/logo.png" alt="Tournament Logo" className="w-48" />
              <div className="flex flex-col items-center space-y-3">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0050fa] to-[#003bb8] uppercase tracking-tight text-center">GIẢI ĐẤU CẦU LÔNG - VP HỒ CHÍ MINH</h1>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-[#0050fa] to-[#003bb8] px-4 py-2 rounded-full shadow-lg">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm uppercase tracking-wide">10 VẬN ĐỘNG VIÊN</span>
                  </div>
                 
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full shadow-lg">
                    <span className="font-black text-sm uppercase tracking-wide">🏆 NGÀY 1: 16/08/2025</span>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full shadow-lg">
                    <span className="font-black text-sm uppercase tracking-wide">🏆 NGÀY 2: 18/08/2025</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={initializeBracket}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#0050fa] to-[#003bb8] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold uppercase tracking-wide border-2 border-white/20"
              >
                <Play className="w-4 h-4" />
                <span>Bắt đầu</span>
              </button>
              <button
                onClick={advanceWinners}
                disabled={!canAdvance()}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 font-bold uppercase tracking-wide border-2 ${
                  canAdvance() 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105 border-white/20' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
                }`}
              >
                <span>Tiến vòng</span>
              </button>
              <button
                onClick={resetBracket}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold uppercase tracking-wide border-2 border-white/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => setShowRulesModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold uppercase tracking-wide border-2 border-white/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>Thể lệ</span>
              </button>
            </div>
          </div>

          {/* Player names editor */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {players.map((player, index) => (
              <input
                key={index}
                type="text"
                value={player}
                onChange={(e) => {
                  const newPlayers = [...players];
                  newPlayers[index] = e.target.value;
                  setPlayers(newPlayers);
                }}
                className="px-4 py-2 border-2 border-[#0050fa]/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0050fa] focus:border-[#0050fa] bg-white/80 backdrop-blur-sm font-medium transition-all duration-200 hover:border-[#0050fa]/50"
                placeholder={`Người chơi ${index + 1}`}
              />
            ))}
          </div>

          {/* Champions display */}
          {champion && (
            <div className="flex justify-center space-x-6 mb-4">
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                  <div className="text-yellow-800 font-bold">🏆 Vô địch</div>
                  <div className="text-yellow-700">{champion}</div>
                </div>
              </div>
              {runnerUp && (
                <div className="text-center">
                  <Medal className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="text-gray-800 font-bold">🥈 Á quân</div>
                    <div className="text-gray-700">{runnerUp}</div>
                  </div>
                </div>
              )}
              {thirdPlace && (
                <div className="text-center">
                  <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="bg-orange-100 px-4 py-2 rounded-lg">
                    <div className="text-orange-800 font-bold">🥉 Hạng 3</div>
                    <div className="text-orange-700">{thirdPlace}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tournament Bracket */}
      <div className="max-w-7xl mx-auto">
        {/* Winners Bracket */}
        <div className="bg-gradient-to-r from-white via-green-50 to-white rounded-xl shadow-2xl p-6 mb-6 border-2 border-green-200">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 mb-6 text-center uppercase tracking-wide">🏆 NHÁNH THẮNG</h2>
          
          <div className="flex justify-between items-center space-x-6 min-h-[600px]">
            {/* Round 1 */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Vòng 1</h3>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {winnersBracket.round1.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="winners" round="round1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Semifinals */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Bán kết</h3>
              <div className="flex-1 flex flex-col justify-center space-y-16">
                {winnersBracket.semifinals.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="winners" round="semifinals" />
                  </div>
                ))}
              </div>
            </div>

            {/* Winners Finals */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Chung kết nhánh thắng</h3>
              <div className="flex-1 flex flex-col justify-center">
                {winnersBracket.finals.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="winners" round="finals" size="large" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Losers Bracket */}
        <div className="bg-gradient-to-r from-white via-red-50 to-white rounded-xl shadow-2xl p-6 mb-6 border-2 border-red-200">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-6 text-center uppercase tracking-wide">💔 NHÁNH THUA</h2>
          
          <div className="flex justify-between items-center space-x-8 min-h-[400px]">
            {/* Losers Round 1 */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">LR1</h3>
              <div className="flex-1 flex flex-col justify-center space-y-12">
                {losersBracket.round1.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="losers" round="round1" size="small" />
                  </div>
                ))}
              </div>
            </div>

            {/* Losers Round 2 */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">LR2</h3>
              <div className="flex-1 flex flex-col justify-center space-y-12">
                {losersBracket.round2.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="losers" round="round2" size="small" />
                  </div>
                ))}
              </div>
            </div>

            {/* Losers Round 3 */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">LR3</h3>
              <div className="flex-1 flex flex-col justify-center">
                {losersBracket.round3.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="losers" round="round3" />
                  </div>
                ))}
              </div>
            </div>

            {/* Losers Finals */}
            <div className="flex-1 flex flex-col h-full">
              <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Chung kết nhánh thua</h3>
              <div className="flex-1 flex flex-col justify-center">
                {losersBracket.finals.map((match) => (
                  <div key={match.id} className="flex justify-center">
                    <MatchBox match={match} bracket="losers" round="finals" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grand Finals */}
        <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 rounded-xl shadow-2xl p-6 border-4 border-yellow-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-pulse"></div>
          <div className="relative z-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 to-yellow-900 mb-6 text-center uppercase tracking-wider animate-pulse">👑 CHUNG KẾT</h2>
          <div className="flex justify-center">
            {grandFinals.map((match) => (
              <MatchBox key={match.id} match={match} bracket="grand" round="finals" size="large" />
            ))}
          </div>
          </div>
        </div>
      </div>
      </div>

      {/* Tournament Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <BookOpen className="w-6 h-6 mr-3" />
                  THỂ LỆ THI ĐẤU CẦU LÔNG
                </h2>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 text-gray-800">
              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  1. QUY ĐỊNH CHUNG
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li>• Giải đấu áp dụng thể thức <strong>Double Elimination</strong> (Loại trực tiếp kép)</li>
                  <li>• Tổng cộng có <strong>10 người chơi</strong> tham gia thi đấu</li>
                  <li>• Mỗi người chơi được phép thua <strong>tối đa 1 trận</strong> trước khi bị loại</li>
                  <li>• Giải đấu được chia thành 2 nhánh: <strong>Nhánh thắng</strong> và <strong>Nhánh thua</strong></li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  2. CẤU TRÚC GIẢI ĐẤU
                </h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">📈 Nhánh Thắng (Winners Bracket):</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Vòng 1:</strong> 10 người → 5 trận → 5 người thắng</li>
                      <li>• <strong>Bán kết:</strong> 5 người → 2 trận → 2 người thắng (1 người bye)</li>
                      <li>• <strong>Chung kết nhánh thắng:</strong> 2 người → 1 người vô địch nhánh</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">📉 Nhánh Thua (Losers Bracket):</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Vòng LR1:</strong> 5 người thua vòng 1 nhánh thắng → 2 trận → 2 người thắng</li>
                      <li>• <strong>Vòng LR2:</strong> 2 người thắng LR1 + 2 người thua bán kết → 2 trận → 2 người thắng</li>
                      <li>• <strong>Vòng LR3:</strong> 2 người thắng LR2 → 1 trận → 1 người thắng</li>
                      <li>• <strong>Chung kết nhánh thua:</strong> 1 người thắng LR3 + 1 người thua chung kết nhánh thắng → 1 người vô địch nhánh</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  3. CHUNG KẾT TỔNG
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li>• Vô địch nhánh thắng gặp vô địch nhánh thua</li>
                  <li>• Nếu vô địch nhánh thắng thắng: <strong>Giải kết thúc</strong></li>
                  <li>• Nếu vô địch nhánh thua thắng: Thi đấu thêm <strong>1 trận nữa</strong> (Reset Bracket)</li>
                  <li>• Người thắng trận cuối cùng là <strong>🏆 Vô địch</strong></li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  4. QUY ĐỊNH TRẬN ĐẤU
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li>• Mỗi trận đấu thi đấu <strong>1 set duy nhất</strong> đến <strong>21 điểm</strong></li>
                  <li>• Phải thắng cách biệt <strong>tối thiểu 2 điểm</strong></li>
                  <li>• Nếu hòa 20-20, thi đấu đến khi có người thắng cách biệt 2 điểm</li>
                  <li>• Nếu hòa 29-29, người đạt 30 điểm trước sẽ thắng</li>
                  <li>• Nghỉ giữa hiệp khi một bên đạt <strong>11 điểm</strong></li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  5. GIẢI THƯỞNG
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                    <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <h4 className="font-bold text-yellow-700">🏆 VÀNG</h4>
                    <p className="text-sm">Vô địch giải đấu</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                    <Medal className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <h4 className="font-bold text-gray-700">🥈 BẠC</h4>
                    <p className="text-sm">Á quân giải đấu</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                    <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-bold text-orange-700">🥉 ĐỒNG</h4>
                    <p className="text-sm">Hạng ba giải đấu</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-blue-700 mb-3 border-b-2 border-blue-200 pb-2">
                  6. QUY ĐỊNH KHÁC
                </h3>
                <ul className="space-y-2 text-sm leading-relaxed">
                  <li>• Người chơi phải có mặt <strong>đúng giờ</strong> khi được gọi thi đấu</li>
                  <li>• Nghỉ tối đa <strong>5 phút</strong> giữa các trận đấu</li>
                  <li>• Mọi tranh chấp sẽ được <strong>trọng tài</strong> quyết định</li>
                  <li>• Người chơi phải thể hiện tinh thần <strong>fair play</strong> và tôn trọng đối thủ</li>
                  <li>• Cấm sử dụng <strong>thuốc kích thích</strong> hoặc chất cấm</li>
                </ul>
              </section>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Ban tổ chức có quyền thay đổi thể lệ nếu cần thiết để đảm bảo tính công bằng và hấp dẫn của giải đấu.
                </p>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-xl border-t">
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubleEliminationBracket;