import SpotifyWebApi from 'spotify-web-api-node';
import http from 'http';

export class AmathronSpotifyService {
    static SCOPES = ['playlist-modify-public', 'playlist-modify-private'];

    #spotifyApi;

    constructor(credentials) {
        this.#spotifyApi = new SpotifyWebApi(credentials);
    }

    setTokens({ access_token, refresh_token }) {
        this.#spotifyApi.setAccessToken(access_token);
        this.#spotifyApi.setRefreshToken(refresh_token);
    }

    async authenticateUser(openAuthUrlCallback) {
        const authUrl = this.#spotifyApi.createAuthorizeURL(AmathronSpotifyService.SCOPES, 'state-key');

        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                try {
                    const url = new URL(req.url, 'http://localhost:8080');
                    if (url.pathname === '/callback') {
                        const code = url.searchParams.get('code');
                        res.end('Authorization successful! You can close this window.');
                        server.close();

                        const tokenData = await this.#spotifyApi.authorizationCodeGrant(code);
                        this.setTokens({
                            accessToken: tokenData.body['access_token'],
                            refreshToken: tokenData.body['refresh_token']
                        });

                        resolve({
                            accessToken: tokenData.body['access_token'],
                            refreshToken: tokenData.body['refresh_token']
                        });
                    }
                } catch (error) {
                    server.close();
                    reject(error);
                }
            });

            server.listen(8080, () => {
                openAuthUrlCallback(authUrl);
            });
        });
    }

    async refreshTokens() {
        try {
            const tokenData = await this.#spotifyApi.refreshAccessToken();
            this.#spotifyApi.setAccessToken(tokenData.body['access_token']);
            return tokenData.body;
        } catch (error) {
            throw new Error('Failed to refresh Spotify access token: ' + error.message);
        }
    }

    async makeApiRequest(apiCall) {
        try {
            return await apiCall();
        } catch (error) {
            if (error.statusCode === 401) {
                await this.refreshTokens();
                return await apiCall();
            }
            throw error;
        }
    }

    async searchTracks(query, limit = 5) {
        return this.#makeSpotifySearchRequest(() => this.#spotifyApi.searchTracks(query, { limit }));
    }

    async addTracksToPlaylist(playlistId, trackUris) {
        await this.makeApiRequest(() => this.#spotifyApi.addTracksToPlaylist(playlistId, trackUris));
    }

    async #makeSpotifySearchRequest(apiCall) {
        const result = await this.makeApiRequest(apiCall);
        return result.body.tracks.items;
    }
}
