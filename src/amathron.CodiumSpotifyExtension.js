import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
import { AddToSpotifyAction } from './commands/amathron.addToSpotifyAction.js';
import { AmathronSpotifyService } from './api/amathron.spotifyService.js';

export class AmathronCodiumSpotifyExtension {
    #context;
    #tokenPath;
    #spotifyService;
    #addToSpotifyAction;

    constructor(context) {
        this.#context = context;
        this.#tokenPath = path.join(context.globalStoragePath, 'spotify_tokens.json');
        this.#spotifyService = new AmathronSpotifyService(this.#getSpotifyCredentialsFromSettings());
        this.#addToSpotifyAction = new AddToSpotifyAction(
            this.#spotifyService,
            () => this.#getSpotifyCredentialsFromSettings()
        );
    }

    async activate() {
        this.#registerCommands();
    }

    #registerCommands() {
        const disposable = vscode.commands.registerCommand('amathron.addToSpotify', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found.');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showInformationMessage('Please select any text to use as a search query.');
                return;
            }

            try {
                await this.#ensureSpotifyTokens();
                await this.#addToSpotifyAction.execute(selection);
            } catch (error) {
                vscode.window.showErrorMessage('An error occurred: ' + error.message);
            }
        });

        const disposable2 = vscode.commands.registerCommand('amathron.setSpotifyPlaylist', async () => {
            const url = await vscode.window.showInputBox({
                prompt: 'Paste the Spotify playlist URL here (Share menu -> Copy list to playlist)',
                placeHolder: 'https://open.spotify.com/playlist/...'
            });

            if (url) {
                // Extract playlist ID from the URL
                const match = url.match(/playlist\/([a-zA-Z0-9]+)\?/);
                if (match && match[1]) {
                    const playlistId = match[1];

                    // Retrieve settings and update the playlist ID
                    const config = vscode.workspace.getConfiguration('amathron');
                    const currentSettings = config.get('addToSpotify') || {};

                    // Update the playlistId property
                    const updatedSettings = {
                        ...currentSettings,
                        playlistId: playlistId
                    };

                    // Save the updated settings object
                    await config.update('addToSpotify', updatedSettings, vscode.ConfigurationTarget.Global);

                    vscode.window.showInformationMessage(`Spotify playlist set to: ${playlistId}`);
                } else {
                    vscode.window.showErrorMessage('Invalid Spotify playlist URL. Please make sure you copy the link to the playlist.');
                }
            }
        });

        this.#context.subscriptions.push(disposable, disposable2);
    }

    #getSpotifyCredentialsFromSettings() {
        const settings = vscode.workspace.getConfiguration('amathron').get('addToSpotify');
        if (!settings || !settings.clientId || !settings.clientSecret || !settings.redirectUri) {
            throw new Error('Spotify settings are not properly configured. Open settings and search for "amathron" to validate them.');
        }

        return {
            clientId: settings.clientId,
            clientSecret: settings.clientSecret,
            redirectUri: settings.redirectUri,
            playlistId: settings.playlistId
        };
    }

    async #ensureSpotifyTokens() {
        if (!fs.existsSync(this.#context.globalStoragePath)) {
            fs.mkdirSync(this.#context.globalStoragePath, { recursive: true });
        }

        if (fs.existsSync(this.#tokenPath)) {
            const tokens = JSON.parse(fs.readFileSync(this.#tokenPath, 'utf8'));
            this.#spotifyService.setTokens(tokens);
        } else {
            await this.#authenticateSpotifyUser();
        }
    }

    async #authenticateSpotifyUser() {
        const tokens = await this.#spotifyService.authenticateUser(authUrl => {
            vscode.env.openExternal(vscode.Uri.parse(authUrl));
        });
        fs.writeFileSync(this.#tokenPath, JSON.stringify(tokens));
    }
}
