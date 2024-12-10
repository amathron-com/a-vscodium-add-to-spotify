import { AmathronCodiumSpotifyExtension } from './amathron.CodiumSpotifyExtension.js';

export function activate(context) {
    const amathronExtension = new AmathronCodiumSpotifyExtension(context);
    amathronExtension.activate();
}

export function deactivate() {}
