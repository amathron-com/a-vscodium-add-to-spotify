import * as vscode from 'vscode';

export class AddToSpotifyAction {
    #spotifyService;
    #getSpotifyConfiguration;

    constructor(spotifyService, getSpotifyConfiguration) {
        this.#spotifyService = spotifyService;
        this.#getSpotifyConfiguration = getSpotifyConfiguration;
    }

    async execute(query) {
        const settings = this.#getSpotifyConfiguration();

        if (!settings.playlistId) {
            vscode.window.showInformationMessage('Please use the command "Amathron Song: Set Spotify Playlist" to set the playlist to add songs first.');
            return;
        }

        const tracks = await this.#spotifyService.searchTracks(query);
        if (tracks.length === 0) {
            vscode.window.showInformationMessage('No results found. Try again another text.');
            return;
        }

        const selectedTrack = await this.#selectTrack(tracks);
        if (!selectedTrack) return;

        await this.#addTrackToPlaylist(settings.playlistId, selectedTrack);
    }

    async #selectTrack(tracks) {
        const options = tracks.map(track => `${track.name} - ${track.artists.map(a => a.name).join(', ')}`);
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select a track to add to the playlist',
        });

        return selected ? tracks[options.indexOf(selected)] : null;
    }

    async #addTrackToPlaylist(playlistId, track) {
        await this.#spotifyService.addTracksToPlaylist(playlistId, [track.uri]);
        vscode.window.showInformationMessage(`Added ${track.name} to playlist.`);
    }
}
