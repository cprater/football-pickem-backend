import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useLeague, 
  useLeagueParticipants, 
  useLeaguePicks, 
  useLeagueStandings,
  useUpdateLeagueSettings,
  useRemoveParticipant
} from '../hooks';
import { useAuth } from '../hooks';
import { getCurrentWeek, getWeekLabel } from '../utils/weekUtils';
import type { LeagueAdminUpdateRequest } from '../types';
import './LeagueDetail.css';

const LeagueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const leagueId = id ? parseInt(id, 10) : 0;

  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'picks' | 'standings'>('overview');
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(getCurrentWeek());
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState<LeagueAdminUpdateRequest>({});

  // Data fetching
  const { data: leagueData, isLoading: leagueLoading, error: leagueError } = useLeague(leagueId);
  const { data: participantsData, isLoading: participantsLoading } = useLeagueParticipants(leagueId);
  const { data: picksData, isLoading: picksLoading } = useLeaguePicks(leagueId, selectedWeek);
  const { data: standingsData, isLoading: standingsLoading } = useLeagueStandings(leagueId, selectedWeek);

  // Mutations
  const updateSettingsMutation = useUpdateLeagueSettings();
  const removeParticipantMutation = useRemoveParticipant();

  const league = leagueData?.league;
  const participants = participantsData?.participants || [];
  const picks = picksData?.picks || [];
  const standings = standingsData?.standings || [];

  const isCommissioner = user && league && user.id === league.commissionerId;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueId) return;

    try {
      await updateSettingsMutation.mutateAsync({ id: leagueId, data: adminFormData });
      setShowAdminModal(false);
      setAdminFormData({});
    } catch (error) {
      console.error('Failed to update league settings:', error);
    }
  };

  const handleRemoveParticipant = async (userId: number) => {
    if (!leagueId || !confirm('Are you sure you want to remove this participant?')) return;

    try {
      await removeParticipantMutation.mutateAsync({ id: leagueId, data: { userId } });
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  if (leagueLoading) {
    return (
      <div className="league-detail">
        <div className="container">
          <div className="loading">Loading league...</div>
        </div>
      </div>
    );
  }

  if (leagueError || !league) {
    return (
      <div className="league-detail">
        <div className="container">
          <div className="error">
            <h2>League Not Found</h2>
            <p>The league you're looking for doesn't exist or you don't have access to it.</p>
            <button className="btn btn-primary" onClick={() => navigate('/leagues')}>
              Back to Leagues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="league-detail">
      <div className="container">
        {/* League Header */}
        <div className="league-header">
          <div className="league-info">
            <h1>{league.name}</h1>
            {league.description && <p className="league-description">{league.description}</p>}
            <div className="league-meta">
              <span className="meta-item">
                <strong>Commissioner:</strong> {league.commissioner?.username}
              </span>
              <span className="meta-item">
                <strong>Participants:</strong> {league.currentParticipants}/{league.maxParticipants}
              </span>
              <span className="meta-item">
                <strong>Entry Fee:</strong> ${league.entryFee}
              </span>
              <span className="meta-item">
                <strong>Scoring:</strong> {league.scoringType}
              </span>
              <span className="meta-item">
                <strong>Season:</strong> {league.seasonYear}
              </span>
            </div>
          </div>
          <div className="league-actions">
            {isCommissioner && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAdminModal(true)}
              >
                Admin Settings
              </button>
            )}
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/leagues')}
            >
              Back to Leagues
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="league-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participants ({participants.length})
          </button>
          <button 
            className={`tab ${activeTab === 'picks' ? 'active' : ''}`}
            onClick={() => setActiveTab('picks')}
          >
            Picks
          </button>
          <button 
            className={`tab ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            Standings
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>League Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <span className="label">Scoring Type:</span>
                      <span className="value">{league.scoringType}</span>
                    </div>
                    <div className="setting-item">
                      <span className="label">Max Participants:</span>
                      <span className="value">{league.maxParticipants}</span>
                    </div>
                    <div className="setting-item">
                      <span className="label">Entry Fee:</span>
                      <span className="value">${league.entryFee}</span>
                    </div>
                    <div className="setting-item">
                      <span className="label">Visibility:</span>
                      <span className="value">{league.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    <p>Recent picks and updates will appear here.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="participants-tab">
              <div className="participants-header">
                <h3>League Participants</h3>
                <div className="participants-count">
                  {participants.length} of {league.maxParticipants} participants
                </div>
              </div>
              
              {participantsLoading ? (
                <div className="loading">Loading participants...</div>
              ) : (
                <div className="participants-grid">
                  {participants.map((participant) => (
                    <div key={participant.id} className="participant-card">
                      <div className="participant-avatar">
                        {participant.avatarUrl ? (
                          <img src={participant.avatarUrl} alt={participant.username} />
                        ) : (
                          <div className="avatar-placeholder">
                            {participant.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="participant-info">
                        <h4>{participant.username}</h4>
                        {participant.firstName && participant.lastName && (
                          <p>{participant.firstName} {participant.lastName}</p>
                        )}
                        {participant.id === league.commissionerId && (
                          <span className="commissioner-badge">Commissioner</span>
                        )}
                      </div>
                      {isCommissioner && participant.id !== league.commissionerId && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveParticipant(participant.id)}
                          disabled={removeParticipantMutation.isPending}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'picks' && (
            <div className="picks-tab">
              <div className="picks-header">
                <h3>League Picks</h3>
                <div className="week-selector">
                  <label htmlFor="week-select">Week:</label>
                  <select 
                    id="week-select"
                    value={selectedWeek || ''}
                    onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">All Weeks</option>
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>{getWeekLabel(week)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {picksLoading ? (
                <div className="loading">Loading picks...</div>
              ) : (
                <div className="picks-list">
                  {picks.length === 0 ? (
                    <p>No picks found for the selected week.</p>
                  ) : (
                    picks.map((pick) => (
                      <div key={pick.id} className="pick-card">
                        <div className="pick-user">
                          <strong>{pick.user?.username}</strong>
                        </div>
                        <div className="pick-game">
                          {pick.game?.awayTeam?.abbreviation} @ {pick.game?.homeTeam?.abbreviation}
                        </div>
                        <div className="pick-choice">
                          Picked: <strong>{pick.pickedTeam?.abbreviation}</strong>
                          {pick.confidencePoints && (
                            <span className="confidence">({pick.confidencePoints} pts)</span>
                          )}
                        </div>
                        <div className="pick-result">
                          {pick.isCorrect !== undefined ? (
                            <span className={`result ${pick.isCorrect ? 'correct' : 'incorrect'}`}>
                              {pick.isCorrect ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span className="result pending">-</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="standings-tab">
              <div className="standings-header">
                <h3>League Standings</h3>
                <div className="week-selector">
                  <label htmlFor="standings-week-select">Week:</label>
                  <select 
                    id="standings-week-select"
                    value={selectedWeek || ''}
                    onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">Season Total</option>
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>{getWeekLabel(week)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {standingsLoading ? (
                <div className="loading">Loading standings...</div>
              ) : (
                <div className="standings-table">
                  {standings.length === 0 ? (
                    <div className="no-data">
                      <p>No standings data available yet.</p>
                      <p className="no-data-subtitle">
                        Standings will appear once games are completed and picks are scored.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="standings-info">
                        <p className="standings-summary">
                          Showing {selectedWeek ? getWeekLabel(selectedWeek) : 'Season Total'} standings
                          {standingsData?.scoringType && (
                            <span className="scoring-type">
                              • {standingsData.scoringType.charAt(0).toUpperCase() + standingsData.scoringType.slice(1)} Scoring
                            </span>
                          )}
                        </p>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Total Points</th>
                            <th>Correct Picks</th>
                            <th>Win %</th>
                            {selectedWeek && <th>Week Points</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((standing) => (
                            <tr key={standing.userId}>
                              <td className="rank">#{standing.rank}</td>
                              <td className="player">
                                <div className="player-info">
                                  <span className="username">{standing.user.username}</span>
                                  {standing.userId === league.commissionerId && (
                                    <span className="commissioner-badge">C</span>
                                  )}
                                </div>
                              </td>
                              <td className="points">{standing.totalPoints}</td>
                              <td className="picks">{standing.correctPicks}/{standing.totalPicks}</td>
                              <td className="percentage">{(standing.winPercentage * 100).toFixed(1)}%</td>
                              {selectedWeek && (
                                <td className="week-points">
                                  {standing.weeklyPoints?.[selectedWeek] || 0}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Modal */}
        {showAdminModal && (
          <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>League Settings</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAdminModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAdminSubmit}>
                <div className="form-group">
                  <label htmlFor="name">League Name</label>
                  <input
                    type="text"
                    id="name"
                    value={adminFormData.name || league.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={adminFormData.description || league.description || ''}
                    onChange={(e) => setAdminFormData({ ...adminFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maxParticipants">Max Participants</label>
                    <input
                      type="number"
                      id="maxParticipants"
                      value={adminFormData.maxParticipants || league.maxParticipants}
                      onChange={(e) => setAdminFormData({ ...adminFormData, maxParticipants: parseInt(e.target.value) })}
                      min="2"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="entryFee">Entry Fee ($)</label>
                    <input
                      type="number"
                      id="entryFee"
                      value={adminFormData.entryFee || league.entryFee}
                      onChange={(e) => setAdminFormData({ ...adminFormData, entryFee: parseFloat(e.target.value) })}
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
                      value={adminFormData.scoringType || league.scoringType}
                      onChange={(e) => setAdminFormData({ ...adminFormData, scoringType: e.target.value as any })}
                    >
                      <option value="confidence">Confidence Points</option>
                      <option value="straight">Straight Up</option>
                      <option value="survivor">Survivor</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={adminFormData.isPublic !== undefined ? adminFormData.isPublic : league.isPublic}
                        onChange={(e) => setAdminFormData({ ...adminFormData, isPublic: e.target.checked })}
                      />
                      <label htmlFor="isPublic">Public League</label>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? 'Updating...' : 'Update Settings'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAdminModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueDetail;
