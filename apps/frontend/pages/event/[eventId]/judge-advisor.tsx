import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import { WithId } from 'mongodb';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import { JudgingRoom, JudgingSession, SafeUser, Event, Team, ConnectionStatus } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';
import RubricStatusReferences from '../../../components/display/judging/rubric-status-references';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/display/welcome-header';
import JudgingRoomSchedule from '../../../components/display/judging/judging-room-schedule';
import { judgingSocket } from '../../../lib/utils/websocket';
import { localizeRole } from '../../../lib/utils/localization';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
}

const Page: NextPage<Props> = ({ user, event, teams, rooms }) => {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    judgingSocket.connected ? 'connected' : 'disconnected'
  );
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);

  const updateSessions = (): Promise<Array<WithId<JudgingSession>>> => {
    return apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
        return data;
      });
  };

  useEffect(() => {
    judgingSocket.connect();
    setConnectionStatus('connecting');

    apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
      });

    const onConnect = () => {
      setConnectionStatus('connected');
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    judgingSocket.on('connect', onConnect);
    judgingSocket.on('disconnect', onDisconnect);
    judgingSocket.on('sessionStarted', updateSessions);
    judgingSocket.on('sessionCompleted', updateSessions);
    judgingSocket.on('sessionAborted', updateSessions);

    return () => {
      judgingSocket.off('connect', onConnect);
      judgingSocket.off('disconnect', onDisconnect);
      judgingSocket.off('sessionStarted', updateSessions);
      judgingSocket.off('sessionCompleted', updateSessions);
      judgingSocket.off('sessionAborted', updateSessions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoleAuthorizer user={user} allowedRoles="judge-advisor" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizeRole(user.role).name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <>
          <WelcomeHeader event={event} user={user} />
          <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
            <RubricStatusReferences />
          </Paper>
          {rooms.map(room => (
            <Paper key={room._id.toString()} sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  p: 3,
                  pb: 1
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#ede9fe',
                    color: '#a78bfa',
                    width: '2rem',
                    height: '2rem',
                    mr: 1
                  }}
                >
                  <JudgingRoomIcon sx={{ fontSize: '1rem' }} />
                </Avatar>
                <Typography variant="h2" fontSize="1.25rem">
                  חדר שיפוט {room.name}
                </Typography>
              </Box>
              <JudgingRoomSchedule
                sessions={sessions.filter(s => s.room === room._id)}
                event={event}
                room={room}
                teams={teams}
                user={user}
                socket={judgingSocket}
              />
            </Paper>
          ))}
        </>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );
    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );
    const [teams, rooms, event] = await Promise.all([teamsPromise, roomsPromise, eventPromise]);

    return { props: { user, event, teams, rooms } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;