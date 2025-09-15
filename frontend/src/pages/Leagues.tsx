import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagues, useCreateLeague, useJoinLeague } from '../hooks';
import './Leagues.css';

const Leagues: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    maxParticipants: 20,
    entryFee: 0,
    scoringType: 'confidence' as const,
    seasonYear: new Date().getFullYear(),
    isPublic: true
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: leaguesData, isLoading: leaguesLoading, error: leaguesError } = useLeagues({
    page: 1,
    limit: 20,
    seasonYear: new Date().getFullYear()
  });

  const createLeagueMutation = useCreateLeague();
  const joinLeagueMutation = useJoinLeague();

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // Basic validation
    if (!createFormData.name.trim()) {
      setErrorMessage('League name is required');
      return;
    }
    
    if (createFormData.maxParticipants < 2 || createFormData.maxParticipants > 100) {
      setErrorMessage('Max participants must be between 2 and 100');
      return;
    }
    
    if (createFormData.entryFee < 0) {
      setErrorMessage('Entry fee cannot be negative');
      return;
    }
    
    try {
      const result = await createLeagueMutation.mutateAsync(createFormData);
      setSuccessMessage(`League "${result.league.name}" created successfully!`);
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        description: '',
        maxParticipants: 20,
        entryFee: 0,
        scoringType: 'confidence',
        seasonYear: new Date().getFullYear(),
        isPublic: true
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Failed to create league:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to create league. Please try again.';
      setErrorMessage(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleJoinLeague = async (leagueId: number) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await joinLeagueMutation.mutateAsync(leagueId);
      setSuccessMessage(`Successfully joined "${result.league.name}"!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to join league:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to join league. Please try again.';
      setErrorMessage(errorMsg);
      
      // Clear error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: name === 'maxParticipants' || name === 'entryFee' || name === 'seasonYear' 
        ? Number(value) 
        : name === 'isPublic'
        ? (e.target as HTMLInputElement).checked
        : value
    });
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    // Clear messages when toggling form
    setSuccessMessage('');
    setErrorMessage('');
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
            onClick={toggleCreateForm}
          >
            {showCreateForm ? 'Cancel' : 'Create New League'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="alert alert-error">
            <span className="alert-icon">❌</span>
            {errorMessage}
          </div>
        )}

        {showCreateForm && (
          <div className="create-league-form">
            <h2>Create New League</h2>
            <p className="form-description">
              Set up your own football pickem league and invite friends to join the competition!
            </p>
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
                      placeholder="0.00"
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
              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={createFormData.isPublic}
                    onChange={handleCreateFormChange}
                  />
                  <label htmlFor="isPublic">
                    Make this league public (visible to everyone)
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createLeagueMutation.isPending}
                >
                  {createLeagueMutation.isPending ? (
                    <>
                      <span className="spinner"></span>
                      Creating League...
                    </>
                  ) : (
                    'Create League'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={toggleCreateForm}
                  disabled={createLeagueMutation.isPending}
                >
                  Cancel
                </button>
              </div>
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
                      className="btn btn-primary"
                      onClick={() => navigate(`/leagues/${league.id}`)}
                    >
                      View League
                    </button>
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
