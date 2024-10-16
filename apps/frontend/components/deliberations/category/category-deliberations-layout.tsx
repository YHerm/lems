import { useContext } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import ScoresPerRoomChart from '../../insights/charts/scores-per-room-chart';
import TeamPool from '../team-pool';
import AwardList from '../award-list';
import { DeliberationContext } from '../deliberation';
import CategoryDeliberationsGrid from './category-deliberations-grid';
import CategoryDeliberationControlPanel from './category-deliberation-control-panel';

const CategoryDeliberationLayout: React.FC = () => {
  const {
    deliberation,
    teams,
    selectedTeams,
    availableTeams,
    eligibleTeams,
    suggestedTeam,
    compareContextProps,
    start,
    lock,
    appendToPicklist,
    updateTeamAwards
  } = useContext(DeliberationContext);
  const category = deliberation.category!;
  const picklist = (deliberation.awards[category] ?? []).map(
    teamId => teams.find(team => team._id === teamId)!
  );

  return (
    <Grid container sx={{ pt: 2 }} columnSpacing={4} rowSpacing={2}>
      <Grid xs={8}>
        <CategoryDeliberationsGrid
          category={category}
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          selectedTeams={selectedTeams}
          updateTeamAwards={updateTeamAwards}
          disabled={deliberation.status !== 'in-progress'}
          showNormalizedScores={true}
          showRanks={true}
        />
      </Grid>
      <Grid xs={1.5}>
        <AwardList
          id={category}
          pickList={picklist}
          disabled={deliberation.status !== 'in-progress'}
          suggestedTeam={suggestedTeam}
          addSuggestedTeam={teamId => appendToPicklist(category, teamId)}
        />
      </Grid>
      <Grid xs={2.5}>
        <CategoryDeliberationControlPanel
          compareTeams={teams.filter(team => eligibleTeams.includes(team._id))}
          deliberation={deliberation}
          category={category}
          startDeliberation={start}
          lockDeliberation={lock}
          compareProps={compareContextProps}
        />
      </Grid>
      <Grid xs={5}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
      <Grid xs={7}>
        <TeamPool
          teams={teams
            .filter(team => availableTeams.includes(team._id))
            .sort((a, b) => b.scores[category] - a.scores[category])}
          id="team-pool"
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
    </Grid>
  );
};

export default CategoryDeliberationLayout;
