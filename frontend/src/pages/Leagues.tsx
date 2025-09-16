import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagues, useCreateLeague, useJoinLeague } from '../hooks';
import { Button, Input, Alert, Loading, LeagueCard, Select, Textarea } from 'puppy-lib-components';
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
          <Loading text="Loading leagues..." />
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
          <Button 
            variant="primary"
            onClick={toggleCreateForm}
          >
            {showCreateForm ? 'Cancel' : 'Create New League'}
          </Button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" showIcon>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="error" showIcon>
            {errorMessage}
          </Alert>
        )}

        {showCreateForm && (
          <div className="create-league-form">
            <h2>Create New League</h2>
            <p className="form-description">
              Set up your own football pickem league and invite friends to join the competition!
            </p>
            <form onSubmit={handleCreateLeague}>
              <div className="form-group">
                <Input
                  type="text"
                  id="name"
                  name="name"
                  label="League Name"
                  value={createFormData.name}
                  onChange={handleCreateFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  value={createFormData.description}
                  onChange={handleCreateFormChange}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    label="Max Participants"
                    value={createFormData.maxParticipants.toString()}
                    onChange={handleCreateFormChange}
                    required
                  />
                </div>
                  <div className="form-group">
                    <Input
                      type="number"
                      id="entryFee"
                      name="entryFee"
                      label="Entry Fee ($)"
                      value={createFormData.entryFee.toString()}
                      onChange={handleCreateFormChange}
                      placeholder="0.00"
                    />
                  </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <Select
                    id="scoringType"
                    name="scoringType"
                    label="Scoring Type"
                    value={createFormData.scoringType}
                    onChange={(value) => setCreateFormData({ ...createFormData, scoringType: value as any })}
                    options={[
                      { value: 'confidence', label: 'Confidence Points' },
                      { value: 'straight', label: 'Straight Up' },
                      { value: 'survivor', label: 'Survivor' }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <Input
                    type="number"
                    id="seasonYear"
                    name="seasonYear"
                    label="Season Year"
                    value={createFormData.seasonYear.toString()}
                    onChange={handleCreateFormChange}
                    required
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
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={createLeagueMutation.isPending}
                  loading={createLeagueMutation.isPending}
                >
                  {createLeagueMutation.isPending ? 'Creating League...' : 'Create League'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={toggleCreateForm}
                  disabled={createLeagueMutation.isPending}
                >
                  Cancel
                </Button>
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
                <LeagueCard
                  key={league.id}
                  league={league}
                  onClick={() => navigate(`/leagues/${league.id}`)}
                  showJoinButton={true}
                  onJoin={() => handleJoinLeague(league.id)}
                  className="league-card"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leagues;
