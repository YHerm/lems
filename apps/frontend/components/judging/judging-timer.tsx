import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Typography, Paper } from '@mui/material';
import { JUDGING_SESSION_LENGTH, JudgingSession, Team } from '@lems/types';
import useCountdown from '../../hooks/use-countdown';
import Countdown from '../general/countdown';

interface TimerProps {
  session: JudgingSession;
  team: Team;
}

const JudgingTimer: React.FC<TimerProps> = ({ session, team }) => {
  const sessionEnd = dayjs(session.start).add(JUDGING_SESSION_LENGTH, 'seconds');
  const [, , minutes, seconds] = useCountdown(sessionEnd.toDate());

  const secondsJudging: number = useMemo(() => {
    return JUDGING_SESSION_LENGTH - (minutes * 60 + seconds);
  }, [minutes, seconds]);

  const stageText = useMemo(() => {
    let currentSeconds = secondsJudging;

    const stages = [
      { duration: 60, text: 'דקת התארגנות' },
      { duration: 5 * 60, text: 'הצגה - פרויקט החדשנות' },
      { duration: 5 * 60, text: 'שאלות - פרויקט החדשנות' },
      { duration: 5 * 60, text: 'הצגה - תכנון הרובוט' },
      { duration: 5 * 60, text: 'שאלות - תכנון הרובוט' },
      { duration: 3 * 60, text: 'שיקוף - ערכי הליבה' },
      { duration: 3 * 60, text: 'שאלות - ערכי הליבה' }
    ];

    for (const stage of stages) {
      if (currentSeconds <= stage.duration) {
        return stage.text;
      }
      currentSeconds -= stage.duration;
    }

    return 'נגמר הזמן!';
  }, [secondsJudging]);

  const barColor = useMemo(() => {
    let currentSeconds = secondsJudging;

    const stages = [
      { duration: 60, color: '#ffffff' },
      { duration: 10 * 60, color: '#005BA8' },
      { duration: 10 * 60, color: '#007632' },
      { duration: 6 * 60, color: '#E3000A' }
    ];

    for (const stage of stages) {
      if (currentSeconds <= stage.duration) {
        return stage.color;
      }
      currentSeconds -= stage.duration;
    }

    return '#ffffff';
  }, [secondsJudging]);

  return (
    <Paper
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
        mt: 4
      }}
      style={{
        background: barColor ? `linear-gradient(to bottom, ${barColor} 5%, #fff 5%)` : '#fff'
      }}
    >
      <Countdown
        targetDate={sessionEnd.toDate()}
        expiredText="00:00"
        variant="h1"
        fontSize="10rem"
        fontWeight={700}
        dir="ltr"
      />
      <Typography variant="h2" fontSize="4rem" fontWeight={400} gutterBottom>
        {stageText}
      </Typography>
      <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
        קבוצת {team.name} #{team.number} מ{team.affiliation.institution}, {team.affiliation.city}
      </Typography>
      <Typography variant="body1" fontSize="1rem" fontWeight={600} color="#666" gutterBottom>
        מפגש השיפוט יסתיים בשעה {sessionEnd.format('HH:mm')}
      </Typography>
    </Paper>
  );
};

export default JudgingTimer;
