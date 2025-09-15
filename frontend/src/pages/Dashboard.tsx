import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useAuth, 
  usePicks, 
  useGames, 
  useMyLeagues,
  useCreatePick,
  useUpdatePick,
  useDeletePick 
} from '../hooks';
import { getCurrentWeek, getWeekLabel } from '../utils/weekUtils';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [showPickModal, setShowPickModal] = useState(false);
  const [modalLeague, setModalLeague] = useState<any>(null);

  const { user } = useAuth();
  
  // Fetch user's leagues
  const { data: leaguesData, isLoading: leaguesLoading } = useMyLeagues({ 
    seasonYear: new Date().getFullYear() 
  });
  
  // Fetch games for the selected week (only when modal is open)
  const { data: gamesData, isLoading: gamesLoading } = useGames({ 
    week: selectedWeek, 
    seasonYear: new Date().getFullYear() 
  });
  
  // Fetch user's picks for the selected week and league (only when modal is open)
  const { data: picksData, isLoading: picksLoading } = usePicks({ 
    week: selectedWeek, 
    leagueId: selectedLeague || undefined 
  });

  const createPickMutation = useCreatePick();
  const updatePickMutation = useUpdatePick();
  const deletePickMutation = useDeletePick();

  // Get user's leagues
  const userLeagues = leaguesData?.leagues || [];

  const handleOpenPickModal = (league: any) => {
    setModalLeague(league);
    setSelectedLeague(league.id);
    setSelectedWeek(getCurrentWeek()); // Default to current week
    setShowPickModal(true);
  };

  const handleClosePickModal = () => {
    setShowPickModal(false);
    setModalLeague(null);
    setSelectedLeague(null);
  };

  const handleCreatePick = async (gameId: number, pickedTeamId: number, confidencePoints: number = 10) => {
    if (!selectedLeague) return;
    
    try {
      await createPickMutation.mutateAsync({
        gameId,
        pickedTeamId,
        leagueId: selectedLeague,
        pickType: 'spread',
        confidencePoints,
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
            <p>Manage your leagues and make picks for the current week.</p>
          </div>

          <div className="leagues-section">
            <div className="leagues-header">
              <h2>Your Leagues</h2>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/leagues')}
              >
                Browse All Leagues
              </button>
            </div>
            
            {leaguesLoading ? (
              <div className="loading">Loading your leagues...</div>
            ) : userLeagues.length === 0 ? (
              <div className="no-leagues">
                <div className="no-leagues-content">
                  <h3>No Leagues Yet</h3>
                  <p>You're not participating in any leagues this season.</p>
                  <p>Join a league to start making picks and competing with friends!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/leagues')}
                  >
                    Browse Leagues
                  </button>
                </div>
              </div>
            ) : (
              <div className="user-leagues">
                {userLeagues.map(league => (
                  <div key={league.id} className="league-card">
                    <div className="league-header">
                      <h3>{league.name}</h3>
                      <div className="league-badges">
                        {league.commissionerId === user?.id && (
                          <span className="badge commissioner">Commissioner</span>
                        )}
                        <span className={`badge ${league.isPublic ? 'public' : 'private'}`}>
                          {league.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    
                    {league.description && (
                      <p className="league-description">{league.description}</p>
                    )}
                    
                    <div className="league-stats">
                      <div className="stat">
                        <span className="label">Participants:</span>
                        <span className="value">{league.currentParticipants}/{league.maxParticipants}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Scoring:</span>
                        <span className="value">{league.scoringType}</span>
                      </div>
                      <div className="stat">
                        <span className="label">Season:</span>
                        <span className="value">{league.seasonYear}</span>
                      </div>
                      {league.entryFee > 0 && (
                        <div className="stat">
                          <span className="label">Entry Fee:</span>
                          <span className="value">${league.entryFee}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="league-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/leagues/${league.id}`)}
                      >
                        View League
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleOpenPickModal(league)}
                      >
                        Make Picks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pick Submission Modal */}
        {showPickModal && modalLeague && (
          <div className="modal-overlay" onClick={handleClosePickModal}>
            <div className="modal-content pick-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Make Picks - {modalLeague.name}</h3>
                <button 
                  className="modal-close"
                  onClick={handleClosePickModal}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="week-selector">
                  <label htmlFor="modal-week-select">Week:</label>
                  <select 
                    id="modal-week-select"
                    value={selectedWeek} 
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  >
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>{getWeekLabel(week)}</option>
                    ))}
                  </select>
                </div>

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
                            <h4>
                              {game.awayTeam?.city} {game.awayTeam?.name} @ {game.homeTeam?.city} {game.homeTeam?.name}
                            </h4>
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
