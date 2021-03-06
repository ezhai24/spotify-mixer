import React, { useState, useEffect } from 'react';
import moment from 'moment';
import styled from '@emotion/styled';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { Loading, Modal} from '~/components';
import { InputLabel, Input, InputError, Button } from '~/components/Form';

import { firestore } from '~/services/firebase';
import { usePlaybackService } from '~/services/playback';
import { END_POINTS } from '~/shared/endpoints';
import { SessionUser, Playlist } from '~/shared/types';
import { validateRequired } from '~/shared/validators';
import { mq, colors } from '~/shared/styles';

enum SaveStatus {
  OPEN,
  CLOSED,
  SAVING,
}

const Header = styled.div({
  padding: '50px 45px',
  backgroundColor: colors.background,
  h1: {
    margin: '0 0 5px',
    fontSize: 50,
  },
  button: {
    display: 'block',
    width: 200,
    marginTop: 40,
  },
  'span:last-of-type': {
    ':hover, :active': {
      cursor: 'pointer',
    },
    ':active': {
      color: colors.secondaryText,
    },
  },
  [mq[1]]: {
    span: {
      display: 'block',
    },
    button: {
      width: '100%',
    },
  },
});

const Members = styled.div({
  minHeight: '100%',
  width: 200,
  padding: '30px 45px',
  backgroundColor: colors.backgroundDark,
  color: colors.secondaryText,
  [mq[1]]: {
    display: 'none',
  },
});

const PlayButton = styled.img({
  height: 35,
  marginRight: 15,
  ':hover': {
    cursor: 'pointer',
    transform: 'scale(1.1)',
  }
});

const ViewSaveButton = styled(Button)({
  width: 200,
  marginTop: 0,
  [mq[1]]: {
    flex: 1,
    width: 'auto',
  },
});

const SongDetails = styled.div({
  color: colors.secondaryText,
  fontSize: 14,
});

interface Props {
  currentUser: SessionUser;
}

const MixerControls = (props: Props) => {
  const { player, setupPlayer } = usePlaybackService();

  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionUsers, setSessionUsers] = useState([]);
  const [playlist, setPlaylist] = useState<Playlist>({ tracks: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState(SaveStatus.CLOSED);
  const [formErrors, setFormErrors] = useState({ name: [] });

  useEffect(() => {
    setupPlayer();
    
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      const { users } = snapshot.data() || {};
      if (users && users.length !== sessionUsers.length) {
        setSessionUsers(users);
      };
    });
  }, []);

  const generatePlaylist = async () => {
    setIsGenerating(true);
    await player.instance.pause();
    const generatePlaylistEndpoint = END_POINTS.generatePlaylist(sessionId);
    const response = await fetch(generatePlaylistEndpoint);
    const tracks = await response.json();
    setPlaylist(currentPlaylist => ({
      ...currentPlaylist,
      tracks,
      url: null,
      isPostedToPlayer: false,
    }));
    setIsGenerating(false);
  };

  const playPlaylist = async () => {
    if (!playlist.isPostedToPlayer) {
      const trackUris = playlist.tracks.map(track => track.uri);
      const playEndpoint = END_POINTS.play();
      const { _options: { id } } = player.instance as any;
      await fetch(playEndpoint, {
        method: 'PUT',
        body: JSON.stringify({
          deviceId: id,
          tracks: trackUris,
        }),
      });
      setPlaylist(currentPlaylist => ({
        ...currentPlaylist,
        isPostedToPlayer: true,
      }));
    } else {
      await player.instance.resume();
    }
  };

  const pausePlaylist = async () => {
    if (player.instance) {
      await player.instance.pause();
    }
  };

  const handlePlaylistChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setPlaylist(currentPlaylist => ({
      ...currentPlaylist,
      [key]: value,
    }));
  };

  const savePlaylist = async (e) => {
    e.preventDefault();

    const errors = validateRequired(
      ['name'],
      { name: playlist.name },
      formErrors,
    );
    if (Object.values(errors).some(errs => errs.length > 0)) {
      setFormErrors(errorsState => ({ ...errorsState, errors }));
      return;
    }

    setSaveStatus(SaveStatus.SAVING);
    const savePlaylistEndpoint = END_POINTS.savePlaylist();
    const response = await fetch(savePlaylistEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        spotifyUserId: currentUser.spotifyUserId,
        name: playlist.name,
        trackUris: playlist.tracks.map(track => `spotify:track:${track.id}`),
      }),
    });
    const playlistData = await response.json();
    setPlaylist(currentPlaylist => ({
      ...currentPlaylist,
      url: playlistData.playlistUrl,
    }));
    setSaveStatus(SaveStatus.CLOSED);
  }
  
  return (
    <>
      <Header>
        <h1>{ currentUser.displayName }'s Session</h1>
        <span style={{ marginRight: 10 }}>Session Code:</span>
        <CopyToClipboard text={ sessionId }>
          <span>
            <u>{ sessionId }</u>
            <img src="copy.svg" style={{ marginLeft: 5 }} />
          </span>
        </CopyToClipboard>
        <Button
          primary
          disabled={ sessionUsers.length < 1 }
          onClick={ generatePlaylist }
        >
          { isGenerating ? <Loading /> : 'GENERATE' }
        </Button>
      </Header>
      
      <div style={{ display: 'flex', minHeight: 'calc(100% - 264px)' }}>
        <Members>
          <p>MEMBERS</p>
          {
            sessionUsers.map(user => (
              <div key={ user } style={{ marginBottom: 8 }}>
                { user }
              </div>
            ))
          }
        </Members>

        <div style={{ flex: 1, padding: '30px 45px' }}>
          { playlist.tracks.length > 0 ?
              <>
                <div style={{ display: 'flex' }}>
                  { currentUser.spotifySubscriptionLevel === 'premium' &&
                    <PlayButton
                      src={ !player.currentTrack || player.currentTrack.paused
                        ? "play.svg"
                        : "pause.svg"
                      }
                      onClick={ !player.currentTrack || player.currentTrack.paused
                        ? playPlaylist
                        : pausePlaylist
                      }
                    />
                  }
                  { playlist.url ?
                    <a href={ playlist.url } target="_blank" rel="noopener noreferrer">
                      <ViewSaveButton>VIEW IN SPOTIFY</ViewSaveButton>
                    </a>
                  :
                    <ViewSaveButton
                      onClick={ () => setSaveStatus(SaveStatus.OPEN) }
                    >
                      SAVE TO SPOTIFY
                    </ViewSaveButton>
                  }
                </div>

                { playlist.tracks.map(track => {
                  const { id, uri, name, artists, albumName, duration } = track;

                  const songDuration = moment.duration(duration);
                  const seconds = songDuration.seconds() < 10
                    ? '0' + songDuration.seconds()
                    : songDuration.seconds();
                  const formattedDuration = songDuration.minutes() + ':' + seconds;

                  const isPlaying = player.currentTrack && (uri === player.currentTrack.uri);

                  return (
                    <div key={ id } style={{ display: 'flex', margin: '30px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: isPlaying && colors.primary }}>
                          { name }
                        </div>
                        <SongDetails>
                          { artists.join(', ') } &middot; { albumName }               
                        </SongDetails>
                      </div>
                      <SongDetails style={{ color: isPlaying && colors.primary }}>
                        { formattedDuration }
                      </SongDetails>
                    </div>
                  );
                }) }
              </>
            : <p>Nothing here yet...</p>
          }
        </div>
      </div>

      { saveStatus !== SaveStatus.CLOSED  &&
        <Modal onClose={ () => setSaveStatus(SaveStatus.CLOSED) }>
          <form autoComplete="off" style={{ display: 'flex', flexDirection: 'column' }}>
            <InputLabel style={{ margin: 0, fontWeight: 'normal' }}>
              Playlist Name
            </InputLabel>
            <Input
              type="text"
              name="name"
              value={ playlist.name || '' }
              onChange={ handlePlaylistChange }
            />
            <InputError>{ formErrors.name }</InputError>
            <Button
              primary
              onClick={ savePlaylist }
              style={{ width: 150 }}
            >
              { saveStatus === SaveStatus.SAVING ? <Loading /> : 'SAVE' }
            </Button>
          </form>
        </Modal>
      }
    </>
  );
};

export default MixerControls;
