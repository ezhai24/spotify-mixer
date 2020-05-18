import React, { useState, useEffect } from 'react';
import moment from 'moment';
import styled from '@emotion/styled';

import { Loading, Modal} from '~/components';
import { InputLabel, Input, InputError, Button } from '~/components/Form';

import { firestore } from '~/services/firebase';
import { END_POINTS } from '~/shared/endpoints';
import { SessionUser, Playlist } from '~/shared/types';
import { validateRequired } from '~/shared/validators';
import { colors } from '~/shared/styles';

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
});

const Members = styled.div({
  minHeight: '100%',
  width: 200,
  padding: '30px 45px',
  backgroundColor: colors.backgroundDark,
  color: colors.secondaryText,
});

const SongDetails = styled.div({
  color: colors.secondaryText,
  fontSize: 14,
});

interface Props {
  currentUser: SessionUser;
}

const MixerControls = (props: Props) => {
  const { currentUser } = props;
  const { sessionId } = currentUser;

  const [sessionUsers, setSessionUsers] = useState([]);
  const [playlist, setPlaylist] = useState<Playlist>({ tracks: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState(SaveStatus.CLOSED);
  const [formErrors, setFormErrors] = useState({ name: [] });

  useEffect(() => {
    firestore.collection('sessions').doc(sessionId).onSnapshot(snapshot => {
      const { users, userCount } = snapshot.data();
      if (users && users.length !== sessionUsers.length && users.length === userCount) {
        setSessionUsers(users);
      };
    });
  }, []);

  const generatePlaylist = async () => {
    setIsGenerating(true);
    const generatePlaylistEndpoint = END_POINTS.generatePlaylist(sessionId);
    const response = await fetch(generatePlaylistEndpoint);
    const tracks = await response.json();
    setPlaylist(playlist => ({ ...playlist, tracks, url: null }));
    setIsGenerating(false);
  };

  const handlePlaylistChange = (e) => {
    const key = e.target.name;
    const value = e.target.value;
    setPlaylist(playlist => ({
      ...playlist,
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
        name: playlist.name,
        trackUris: playlist.tracks.map(track => `spotify:track:${track.id}`),
      }),
    });
    const playlistData = await response.json();
    setPlaylist(playlist => ({
      ...playlist,
      url: playlistData.playlistUrl,
    }));
    setSaveStatus(SaveStatus.CLOSED);
  }
  
  return (
    <>
      <Header>
        <h1>{ currentUser.displayName }'s Session</h1>
        <span style={{ marginRight: 10 }}>Session Code:</span>
        <span style={{ textDecoration: 'underline' }}>{ sessionId }</span>
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
          { sessionUsers.map(user => <div key={ user }>{ user }</div>) }
        </Members>

        <div style={{ flex: 1, padding: '30px 45px' }}>
          { playlist.tracks.length > 0 ?
              <>
                { playlist.url ?
                  <a href={ playlist.url } target="_blank" rel="noopener noreferrer">
                    <Button style={{ width: 200 }}>VIEW IN SPOTIFY</Button>
                  </a>
                :
                  <Button
                    onClick={ () => setSaveStatus(SaveStatus.OPEN) }
                    style={{ width: 200 }}
                  >
                    SAVE TO SPOTIFY
                  </Button>
                }

                { playlist.tracks.map(track => {
                  const { id, name, artists, albumName, duration } = track;
                  const songDuration = moment.duration(duration);
                  const formattedDuration = songDuration.minutes() + ':' + songDuration.seconds();
                  return (
                    <div key={ id } style={{ margin: '30px 0' }}>
                      <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1 }}>{ name }</div>
                        <SongDetails>{ formattedDuration }</SongDetails>
                      </div>
                      <SongDetails>
                        { artists.join(', ') } &middot; { albumName }               
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          </div>
        </Modal>
      }
    </>
  );
};

export default MixerControls;
