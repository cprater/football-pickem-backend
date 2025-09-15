import { useState } from 'react';
import { 
  useAuth, 
  usePicks, 
  useGames, 
  useLeagues,
  useCreatePick,
  useUpdatePick,
  useDeletePick 
} from '../hooks';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);

  const { user } = useAuth();
  
  // Fetch user's leagues
  const { data: leaguesData } = useLeagues({ page: 1, limit: 50 });
  
  // Fetch games for the selected week
  const { data: gamesData, isLoading: gamesLoading } = useGames({ 
    week: selectedWeek, 
    seasonYear: new Date().getFullYear() 
  });
  
  // Fetch user's picks for the selected week and league
  const { data: picksData, isLoading: picksLoading } = usePicks({ 
    week: selectedWeek, 
    leagueId: selectedLeague || undefined 
  });

  const createPickMutation = useCreatePick();
  const updatePickMutation = useUpdatePick();
  const deletePickMutation = useDeletePick();

  // Get user's leagues
  const userLeagues = leaguesData?.leagues || [];

  const handleCreatePick = async (gameId: number, pickedTeamId: number) => {
    if (!selectedLeague) return;
    
    try {
      await createPickMutation.mutateAsync({
        gameId,
        pickedTeamId,
        leagueId: selectedLeague,
        pickType: 'spread',
        confidencePoints: 10,
      });
    } catch (error) {
      console.error('Failed to create pick:', error);
    }
  };

  const handleUpdatePick = async (pickId: number, pickedTeamId: number, confidencePoints: number) => {
    try {
      await updatePickMutation.mutateAsync({
        id: pickId,
        pickedTeamId,
        confidencePoints,
      });
    } catch (error) {
      console.error('Failed to update pick:', error);
    }
  };

  const handleDeletePick = async (pickId: number) => {
    try {
      await deletePickMutation.mutateAsync(pickId);
    } catch (error) {
      console.error('Failed to delete pick:', error);
    }
  };

  const getUserPickForGame = (gameId: number) => {
    return picksData?.picks.find(pick => pick.gameId === gameId);
  };

  return (
    <ProtectedRoute>
      <div className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Welcome, {user?.username}!</h1>
            <p>Manage your picks and view standings.</p>
          </div>

          <div className="dashboard-controls">
            <div className="control-group">
              <label htmlFor="week-select">Week:</label>
              <select 
                id="week-select"
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label htmlFor="league-select">League:</label>
              <select 
                id="league-select"
                value={selectedLeague || ''} 
                onChange={(e) => setSelectedLeague(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All Leagues</option>
                {userLeagues.map(league => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedLeague && (
            <div className="info-message">
              <p>Please select a league to make picks.</p>
            </div>
          )}

          <div className="dashboard-content">
            <div className="picks-section">
              <h2>Week {selectedWeek} Picks</h2>
              
              {gamesLoading ? (
                <div className="loading">Loading games...</div>
              ) : picksLoading ? (
                <div className="loading">Loading picks...</div>
              ) : (
                <div className="games-list">
                  {gamesData?.games.map(game => {
                    const userPick = getUserPickForGame(game.id);
                    const gameTime = new Date(game.gameDate);
                    const isGameStarted = gameTime <= new Date();
                    
                    return (
                      <div key={game.id} className="game-card">
                        <div className="game-header">
                          <h3>
                            {game.awayTeam?.city} {game.awayTeam?.name} @ {game.homeTeam?.city} {game.homeTeam?.name}
                          </h3>
                          <span className="game-time">
                            {gameTime.toLocaleDateString()} {gameTime.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="game-info">
                          <div className="team-info">
                            <span className="team">{game.awayTeam?.abbreviation}</span>
                            <span className="spread">+{game.spread}</span>
                          </div>
                          <div className="vs">VS</div>
                          <div className="team-info">
                            <span className="team">{game.homeTeam?.abbreviation}</span>
                            <span className="spread">-{game.spread}</span>
                          </div>
                        </div>

                        {selectedLeague && (
                          <div className="pick-actions">
                            {userPick ? (
                              <div className="current-pick">
                                <p>Current Pick: {userPick.pickedTeam?.city} {userPick.pickedTeam?.name}</p>
                                <p>Confidence: {userPick.confidencePoints}</p>
                                {!isGameStarted && (
                                  <div className="pick-buttons">
                                    <button 
                                      onClick={() => handleUpdatePick(
                                        userPick.id, 
                                        userPick.pickedTeamId === game.awayTeamId ? game.homeTeamId : game.awayTeamId,
                                        (userPick.confidencePoints || 0) + 1
                                      )}
                                      disabled={updatePickMutation.isPending}
                                      className="btn btn-small"
                                    >
                                      Change Pick
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePick(userPick.id)}
                                      disabled={deletePickMutation.isPending}
                                      className="btn btn-small btn-danger"
                                    >
                                      Delete Pick
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="pick-buttons">
                                {!isGameStarted && (
                                  <>
                                    <button 
                                      onClick={() => handleCreatePick(game.id, game.awayTeamId)}
                                      disabled={createPickMutation.isPending}
                                      className="btn btn-primary"
                                    >
                                      Pick {game.awayTeam?.abbreviation}
                                    </button>
                                    <button 
                                      onClick={() => handleCreatePick(game.id, game.homeTeamId)}
                                      disabled={createPickMutation.isPending}
                                      className="btn btn-primary"
                                    >
                                      Pick {game.homeTeam?.abbreviation}
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="leagues-section">
              <h2>Your Leagues</h2>
              {userLeagues.length === 0 ? (
                <p>You're not in any leagues yet. <a href="/leagues">Join a league</a> to get started!</p>
              ) : (
                <div className="user-leagues">
                  {userLeagues.map(league => (
                    <div key={league.id} className="league-summary">
                      <h3>{league.name}</h3>
                      <p>Participants: {league.currentParticipants}/{league.maxParticipants}</p>
                      <p>Scoring: {league.scoringType}</p>
                      {league.entryFee > 0 && <p>Entry Fee: ${league.entryFee}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
