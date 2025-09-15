import { useState } from 'react';
import { useLeagues, useCreateLeague, useJoinLeague } from '../hooks';
import './Leagues.css';

const Leagues: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    maxParticipants: 20,
    entryFee: 0,
    scoringType: 'confidence' as const,
    seasonYear: new Date().getFullYear()
  });

  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues({
    page: 1,
    limit: 20,
    seasonYear: new Date().getFullYear()
  });

  const createLeagueMutation = useCreateLeague();
  const joinLeagueMutation = useJoinLeague();

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLeagueMutation.mutateAsync(createFormData);
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        description: '',
        maxParticipants: 20,
        entryFee: 0,
        scoringType: 'confidence',
        seasonYear: new Date().getFullYear()
      });
      // Success message could be shown here
    } catch (error: any) {
      console.error('Failed to create league:', error);
      // Error message could be shown here
      alert(error?.response?.data?.message || 'Failed to create league');
    }
  };

  const handleJoinLeague = async (leagueId: number) => {
    try {
      await joinLeagueMutation.mutateAsync(leagueId);
      // Success message could be shown here
    } catch (error: any) {
      console.error('Failed to join league:', error);
      // Error message could be shown here
      alert(error?.response?.data?.message || 'Failed to join league');
    }
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: name === 'maxParticipants' || name === 'entryFee' || name === 'seasonYear' 
        ? Number(value) 
        : value
    });
  };

  if (leaguesLoading) {
    return (
      <div className="leagues">
        <div className="container">
          <div className="loading">Loading leagues...</div>
        </div>
      </div>
    );
  }

  if (leaguesError) {
    return (
      <div className="leagues">
        <div className="container">
          <div className="error">
            Failed to load leagues. Please try again.
            <br />
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leagues">
      <div className="container">
        <div className="leagues-header">
          <h1>Leagues</h1>
          <p>Browse and join football pickem leagues.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New League'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-league-form">
            <h2>Create New League</h2>
            <form onSubmit={handleCreateLeague}>
              <div className="form-group">
                <label htmlFor="name">League Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateFormChange}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={createFormData.maxParticipants}
                    onChange={handleCreateFormChange}
                    min="2"
                    max="50"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="entryFee">Entry Fee ($)</label>
                  <input
                    type="number"
                    id="entryFee"
                    name="entryFee"
                    value={createFormData.entryFee}
                    onChange={handleCreateFormChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scoringType">Scoring Type</label>
                  <select
                    id="scoringType"
                    name="scoringType"
                    value={createFormData.scoringType}
                    onChange={handleCreateFormChange}
                  >
                    <option value="confidence">Confidence Points</option>
                    <option value="straight">Straight Up</option>
                    <option value="survivor">Survivor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="seasonYear">Season Year</label>
                  <input
                    type="number"
                    id="seasonYear"
                    name="seasonYear"
                    value={createFormData.seasonYear}
                    onChange={handleCreateFormChange}
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createLeagueMutation.isPending}
              >
                {createLeagueMutation.isPending ? 'Creating...' : 'Create League'}
              </button>
            </form>
          </div>
        )}

        <div className="leagues-list">
          <h2>Available Leagues</h2>
          {leaguesData?.leagues.length === 0 ? (
            <p>No leagues available. Create one to get started!</p>
          ) : (
            <div className="league-grid">
              {leaguesData?.leagues.map(league => (
                <div key={league.id} className="league-card">
                  <div className="league-header">
                    <h3>{league.name}</h3>
                    <span className="league-type">{league.scoringType}</span>
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
                      <span className="label">Entry Fee:</span>
                      <span className="value">${league.entryFee}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Season:</span>
                      <span className="value">{league.seasonYear}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Commissioner:</span>
                      <span className="value">{league.commissioner?.username}</span>
                    </div>
                  </div>
                  <div className="league-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleJoinLeague(league.id)}
                      disabled={joinLeagueMutation.isPending || league.currentParticipants >= league.maxParticipants}
                    >
                      {joinLeagueMutation.isPending ? 'Joining...' : 
                       league.currentParticipants >= league.maxParticipants ? 'Full' : 'Join League'}
                    </button>
                    {league.isPublic && (
                      <span className="league-badge public">Public</span>
                    )}
                    {!league.isPublic && (
                      <span className="league-badge private">Private</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leagues;
