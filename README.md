# Spotify Mixer
![spotify-mixer-home](https://user-images.githubusercontent.com/15952697/82767477-bbf54200-9ddc-11ea-824a-c839a1fa5566.gif)
### by Emily Zhai | [LinkedIn](https://www.linkedin.com/in/emily-zhai-b7b32a103/)
Inspired by [this TikTok](https://www.tiktok.com/@koolgore/video/6790432359045975302), Spotify Mixer examines you and your friends' (Spotify) music preferences and uses them to create unique playlists based on where your tastes overlap.

## Contents
* [Architecture](#architecture)
  * [Authorization Flow](#authorization-flow)
  * [Database](#database)
  * [Playback Provider](#playback-provider)
  * [Stack](#stack)
* [Takeaways](#takeaways)
* [Local Development](#local-development)
* [Deployments](#deployments)

## Architecture
### Authorization Flow
![auth-flow](https://user-images.githubusercontent.com/15952697/82778008-dc38f700-9e04-11ea-86af-0c35bfdfdb3c.png)  
The authorization flow follows standard OAuth 2.0 best practices for the most part. It works like this:
- The user either creates or joins a session. This determines which user scopes Spotify Mixer will request access to.
- A 16 character random string is generated to verify against later. A stringified JSON object of some user properties are appended to the end of the string such that these properties can be peristed across redirects between Spotify Mixer and the Spotify Accounts Service. The entire string is stored in a session cookie.
- Spotify Mixer passes the client ID, user scopes, a redirect URI, and the state string to the Spotify Accounts Service
- The user authenticates against Spotify Accounts Service, authorize the necessary scopes
- The Spotify Accounts Service passes an authorization code back to the redirect URI
- A subsequent call is made to the Spotify Accounts Service to exchange the authorization code for access tokens. A Base64 encoded string containing the client ID and secret, and the redirect URI from earlier are used for validation.
- An access and refresh token are issued and passed back to Spotify Mixer along with their expiration time
- The tokens are stored in HTTPOnly session cookies using the Set-Cookie response header. Using the Set-Cookie header moderately simplifies token use as they are automatically added to the header of each subsequent request (so there's no need to explicitly set them each time). The HTTPOnly flag reduces the vulnerability of the site to cross-site scripting as it prevents Javascript from reading from or writing to them.
- New access tokens can be requested by supplying the refresh token to the Spotify Accounts Service

### Database
Spotify Mixer uses Google's Could Firestore on the backend to store session related data. Cloud Firestore is a NoSQL database, so there is no fixed schema. However, Spotify Mixer will create sessions with the following format:
<img width="877" alt="Screen Shot 2020-05-25 at 6 34 10 PM" src="https://user-images.githubusercontent.com/15952697/82851987-65f4cd00-9eb6-11ea-98bb-a9c87a48a465.png">  
The user flow that constructs it goes like this:
- When a session is created, a new document is added to the root `sessions` collection
- Spotify Mixer makes a request to the Spotify API for that user's top 50 artists (of the last ~6 months)
- Once fetched, a new document is added under the `topCounts` subcollection, labelled with their display name, and populated with an `artists` array containing those fetched artists
- The `artistCounts` map in the `aggregate` document - which keys all top artists of users in the session to the count of users who share that artist in common - is then updated accordingly
- Finally, the `users` array is updated with the users' display name indicating they have fully joined the session. A realtime listener uses data synchronization to update the list of members in the UI when this happens
- When the user clicks "Generate", Spotify Mixer will pull 5 artist from the aggregated list - preferring artists that have more overlap between the session members - and passes them to the Spotify recommendations endpoint to build a unique playlist
- The playlist is saved to the database and, again, a realtime listener updates the UI accordingly
- When the user leaves/ends the session, their user/the entire session is cleaned up from the database respectively

It's also worth noting that the data in `topCounts` exists in its own separate subcollection rather than directly on the session document to prevent the client from downloading more data than it needs (Cloud Firestore cannot retrieve partial documents). The documents in `topCounts` themselves might also feel a bit overkill provided that they only contain one field each. But this was an intentional design decision to maintain extensibility. I imagined these documents could contain top tracks, top genres, or even specific track characteristics that appear frequently - anything that could continue to fine tune the generated playlists.

### Playback Provider
Spotify Mixer uses Spotify's Web Playback SDK to play audio in the browser. As it stands, the only component that needs to utilize the SDK is `components/MixerControls`. As such, it wouldn't have been a bad choice to simply initialize the SDK locally in that component for use there. However, audio playback felt like something that might want to be accessible across the application to support potential future growth/work. So I made the decision to use a provider pattern.

It starts by creating a React context that includes the following
- A playback object containing the initialized player instance and the currently playing track
- A function to update the playback object
```
interface PlaybackMap {
  instance?: Spotify.SpotifyPlayer;
  currentTrack?: {
    uri: string;
    paused: boolean;
  };
}

type PlaybackContextType = [
  PlaybackMap,
  React.Dispatch<React.SetStateAction<PlaybackMap>>,
];

const PlaybackContext = createContext<PlaybackContextType>([undefined, () => {}]);
```

Next, the `PlaybackContext` is added into the application — and initialized with a playback object and state update function.
```
const PlaybackProvider = ({ children }: Props) => {
  const contextStateHooks = useState<PlaybackMap>({});

  return (
    <PlaybackContext.Provider value={ contextStateHooks }>
      { children }
    </PlaybackContext.Provider>
  );
};
```

This `PlaybackProvider` is added to `pages/_app`, so that all descendants can access the `PlaybackContext`.
```
<>
  <Head>
    <title>Spotify Mixer</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>
  <PlaybackProvider>
    <Component { ...pageProps } />
  </PlaybackProvider>
</>
```

Finally, a custom Playback Service hook was made to allow descendants to access and modify the `PlaybackProvider` state.
```
export const usePlaybackService = (): {
  player: PlaybackMap;
  setupPlayer: () => void;
} => {
  const [player, setPlayer] = useContext(PlaybackContext);

  const setupPlayer = () => {
    const spotifyPlayer = new Spotify.Player({
      name: 'Spotify Mixer',
      getOAuthToken: async (callback) => {
        const dangerousTokenEndpoint = END_POINTS.dangerouslyGetToken();
        const response = await fetch(dangerousTokenEndpoint);
        const { accessToken } = await response.json();
        callback(accessToken);
      },
    });

    spotifyPlayer.connect();
    spotifyPlayer.addListener('player_state_changed', state => {
      setPlayer(currentPlayer => ({
        ...currentPlayer,
        currentTrack: {
          uri: state.track_window.current_track.uri,
          paused: state.paused,
        },
      }));
    });

    setPlayer({ instance: spotifyPlayer });
  };

  return { player, setupPlayer };
};
```

You might notice that the function passed into the `Spotify.Player` constructor as the `getOAuthToken` prop calls a `dangerouslyGetToken()` endpoint. This endpoint does what you might expect and exposes the user's Spotify access token to the client. This is clearly not ideal from a security standpoint but is necessary as the Spotify Web Playback SDK only supports client-side Javascript at the moment. However, the token is at least transmitted over HTTPS (in production) and the `dangerouslyGetToken()` endpoint is built to be easily deprecated in the event that the Spotify Web Playback SDK begins to support Node.js.

### Stack
Here's a full breakdown of all the technologies used in this project:
- JS: Next.js, Typescript, React (Hooks, Context)
- Styles: Emotion styled API
- Textures/icons
  - Wave & play button created by me in Figma
  - All other icons downloaded from FontAwesome
- API: Next.js serverless functions, Firebase Cloud Functions
- DB: Firebase Cloud Firestore
- Deployments: Vercel

## Takeaways
**Deploy incrementally** - As the only person working in the repo, it was sometimes easy to forget to push my local changes incrementally. This meant I was deploying a lot of changes all at once which made pinpointing issues when deployments failed much more difficult that necessary.

**Document as you go** - Documentation is neither the most fun nor the most glamorous part of development. But it is important. And I've found that it's been a helpful tool for thinking through design decisions and for cataloging what I've learned for use in future projects. I just need to remember to not save all of it for the very end next time :sweat_smile:

**We <3 Trello** - The act of moving tasks across the board is *very* fulfilling. But more importantly, the act of creating tasks in Trello was a really great exercise in translating my project goals into actionable, technical tasks.

**There's a lot to learn about OAuth and security** - This project was my first real look into OAuth flows. And while I learned A LOT, I realized I haven't even scratched the surface. There's still so much to know about all of the different ways hackers target users/web applications/browsers and the best practices around PKCE/token storage/etc. that are used to combat these attacks.

**Design gets easier if you \~just do it\~** - I have some background in content strategy and information architecture but aesthetics have never been my strong suit when it comes to design. I spent a lot of time over the course of this project watching YouTube videos on design only to more or less continue staring at a blank canvas. It wasn't until I decided that I was just going to make something - regardless of the quality - that the ideas really started to flow. And a couple iterations later, I ended up with something that I really liked. Granted I borrowed a lot from Spotify in terms of color palette and layout, but it felt like a massive step forward from where I started. For a somewhat representative look at my design process, you can [view the Figma for this project](https://www.figma.com/file/T8ouMyFlrPO3EwCvZW5xtT/Spotify-Mixer?node-id=0%3A1). 

## Local Development
### `now env pull`
Pulls all development environment variables from Vercel.

### `yarn`
Installs dependencies

### `yarn dev`
This runs the app in a local development mode.  
The page will hot reload any updates to the front-end and API.  
Open http://localhost:3000 to view it in the browser.

### `yarn build && yarn start`
This will create an optimized production build to run locally.  
Open http://localhost:3000 to view it in the browser.

### `firebase use [env]`
Switches which instance of Cloud Functions Spotify Mixer points to. The options are
- `default` - development instance
- `prod` - production instance

### `firebase deploy --only functions`
Deploys Cloud Functions to whichever instance Spotify Mixer is currently pointing to. You can also optionally supply the function name to deploy functions individually (ie. `firebase deploy --only functions:addTopCounts`)

## Deployments
Production deployments of the Spotify Mixer front-end and API are triggered automatically when code is merged to master.

To deploy Cloud Functions to production,
```
firebase use prod
firebase deploy --only functions
```
