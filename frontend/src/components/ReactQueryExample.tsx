import React, { useState } from 'react';
import {
  useAuth,
  useLogin,
  useLeagues,
  useCreateLeague,
  useJoinLeague,
  useGames,
  useTeams,
  usePicks,
  useCreatePick,
  useUpdatePick,
  useDeletePick,
} from '../hooks';

/**
 * Example component demonstrating how to use all React Query hooks
 * This component shows the proper patterns for:
 * - Authentication
 * - League management
 * - Game and team data
 * - Pick management
 * - Error handling
 * - Loading states
 */
const ReactQueryExample: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Authentication hooks
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const loginMutation = useLogin();
  // const registerMutation = useRegister();

  // League hooks
  const { data: leaguesData, isLoading: leaguesLoading } = useLeagues();
  const createLeagueMutation = useCreateLeague();
  const joinLeagueMutation = useJoinLeague();
  // const leaveLeagueMutation = useLeaveLeague();

  // Game hooks
  const { data: gamesData, isLoading: gamesLoading } = useGames({ week: selectedWeek });
  const { isLoading: teamsLoading } = useTeams();

  // Pick hooks
  const { data: picksData, isLoading: picksLoading } = usePicks({ 
    week: selectedWeek, 
    leagueId: selectedLeague || undefined 
  });
  const createPickMutation = useCreatePick();
  const updatePickMutation = useUpdatePick();
  const deletePickMutation = useDeletePick();

  // Example login handler
  const handleLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
      });
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Example league creation
  const handleCreateLeague = async () => {
    try {
      await createLeagueMutation.mutateAsync({
        name: 'My New League',
        description: 'A great league for friends',
        seasonYear: 2024,
        maxParticipants: 12,
        scoringType: 'confidence',
      });
      console.log('League created successfully!');
    } catch (error) {
      console.error('Failed to create league:', error);
    }
  };

  // Example pick creation
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
      console.log('Pick created successfully!');
    } catch (error) {
      console.error('Failed to create pick:', error);
    }
  };

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="react-query-example">
      <h1>React Query Integration Example</h1>
      
      {/* Authentication Section */}
      <section>
        <h2>Authentication</h2>
        {isAuthenticated ? (
          <div>
            <p>Welcome, {user?.username}!</p>
            <p>Email: {user?.email}</p>
          </div>
        ) : (
          <div>
            <button 
              onClick={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
            {loginMutation.isError && (
              <p style={{ color: 'red' }}>
                Login failed: {loginMutation.error?.message}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Leagues Section */}
      <section>
        <h2>Leagues</h2>
        {leaguesLoading ? (
          <p>Loading leagues...</p>
        ) : (
          <div>
            <button 
              onClick={handleCreateLeague}
              disabled={createLeagueMutation.isPending}
            >
              {createLeagueMutation.isPending ? 'Creating...' : 'Create League'}
            </button>
            
            <div>
              <h3>Available Leagues:</h3>
              {leaguesData?.leagues.map(league => (
                <div key={league.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  <h4>{league.name}</h4>
                  <p>{league.description}</p>
                  <p>Participants: {league.currentParticipants}/{league.maxParticipants}</p>
                  <button 
                    onClick={() => joinLeagueMutation.mutate(league.id)}
                    disabled={joinLeagueMutation.isPending}
                  >
                    {joinLeagueMutation.isPending ? 'Joining...' : 'Join League'}
                  </button>
                  <button 
                    onClick={() => setSelectedLeague(league.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Select for Picks
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Games Section */}
      <section>
        <h2>Games - Week {selectedWeek}</h2>
        <div>
          <button onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}>
            Previous Week
          </button>
          <button onClick={() => setSelectedWeek(prev => prev + 1)}>
            Next Week
          </button>
        </div>
        
        {gamesLoading ? (
          <p>Loading games...</p>
        ) : (
          <div>
            {gamesData?.games.map(game => (
              <div key={game.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <h4>
                  {game.awayTeam?.city} {game.awayTeam?.name} @ {game.homeTeam?.city} {game.homeTeam?.name}
                </h4>
                <p>Date: {new Date(game.gameDate).toLocaleDateString()}</p>
                <p>Status: {game.status}</p>
                {selectedLeague && (
                  <div>
                    <button 
                      onClick={() => handleCreatePick(game.id, game.awayTeamId)}
                      disabled={createPickMutation.isPending}
                    >
                      Pick Away Team
                    </button>
                    <button 
                      onClick={() => handleCreatePick(game.id, game.homeTeamId)}
                      disabled={createPickMutation.isPending}
                      style={{ marginLeft: '10px' }}
                    >
                      Pick Home Team
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Picks Section */}
      {selectedLeague && (
        <section>
          <h2>Your Picks - Week {selectedWeek}</h2>
          {picksLoading ? (
            <p>Loading picks...</p>
          ) : (
            <div>
              {picksData?.picks.map(pick => (
                <div key={pick.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  <h4>
                    {pick.game?.awayTeam?.city} @ {pick.game?.homeTeam?.city}
                  </h4>
                  <p>Picked: {pick.pickedTeam?.city} {pick.pickedTeam?.name}</p>
                  <p>Confidence: {pick.confidencePoints}</p>
                  <button 
                    onClick={() => updatePickMutation.mutate({
                      id: pick.id,
                      pickedTeamId: pick.pickedTeamId,
                      confidencePoints: (pick.confidencePoints || 0) + 1
                    })}
                    disabled={updatePickMutation.isPending}
                  >
                    Increase Confidence
                  </button>
                  <button 
                    onClick={() => deletePickMutation.mutate(pick.id)}
                    disabled={deletePickMutation.isPending}
                    style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
                  >
                    Delete Pick
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Loading States */}
      <section>
        <h2>Loading States</h2>
        <ul>
          <li>Auth Loading: {authLoading ? 'Yes' : 'No'}</li>
          <li>Leagues Loading: {leaguesLoading ? 'Yes' : 'No'}</li>
          <li>Games Loading: {gamesLoading ? 'Yes' : 'No'}</li>
          <li>Teams Loading: {teamsLoading ? 'Yes' : 'No'}</li>
          <li>Picks Loading: {picksLoading ? 'Yes' : 'No'}</li>
        </ul>
      </section>

      {/* Mutation States */}
      <section>
        <h2>Mutation States</h2>
        <ul>
          <li>Login Pending: {loginMutation.isPending ? 'Yes' : 'No'}</li>
          <li>Create League Pending: {createLeagueMutation.isPending ? 'Yes' : 'No'}</li>
          <li>Join League Pending: {joinLeagueMutation.isPending ? 'Yes' : 'No'}</li>
          <li>Create Pick Pending: {createPickMutation.isPending ? 'Yes' : 'No'}</li>
          <li>Update Pick Pending: {updatePickMutation.isPending ? 'Yes' : 'No'}</li>
          <li>Delete Pick Pending: {deletePickMutation.isPending ? 'Yes' : 'No'}</li>
        </ul>
      </section>
    </div>
  );
};

export default ReactQueryExample;
