# Spotify Search and Add Extension for VSCodium

## Introduction

Want to digitalize you archive and search quickly for songs based on your exported text list with song titles?

Spotify Search and Add is a VSCodium extension that allows users to search for songs using the Spotify API directly from the editor and add them to a specific playlist. The extension simplifies the process of integrating Spotify functionality into your workflow.

## Features
- **Search Spotify**: Search for songs directly from VSCodium using the selected text.
- **Add to Playlist**: Add a selected song to a specific Spotify playlist with a single command.
- **Customizable Settings**: Configure Spotify API credentials and playlist details via the extension settings.

## Demo

![Spotify Search and Add Demo](https://raw.githubusercontent.com/amathron-com/a-vscodium-add-to-spotify/main/assets/amathron.addToSpotify.gif)

## Installation
1. Create a new application in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/):
   - Log in with your Spotify account.
   - Click on **Create an App** and provide a name and description.
   - Copy the **Client ID** and **Client Secret** for use in the extension settings.
   - Set the **Redirect URI** in your Spotify application to `http://localhost:8080/callback`.

2. Find and install "Spotify Search and Add" from the VSCodium extensions marketplace or install the extension manually using the `.vsix` file.

## Settings
To use this extension, you need to configure the following settings in VSCodium:

```json
"amathron.addToSpotify": {
    "clientId": "Your Spotify Client ID",
    "clientSecret": "Your Spotify Client Secret",
    "redirectUri": "http://localhost:8080/callback",
    "playlistId": "Your Spotify Playlist ID"
}
```

### How to Set Settings
1. Open the Command Palette (`Ctrl+Shift+P`) and choose `Preferences: Open Settings (JSON)`.
2. Add the `amathron.addToSpotify` settings block with your Spotify credentials and playlist ID.

## Usage
1. Select text in the editor (e.g., a song name).
2. Open the Command Palette (`Ctrl+Shift+P`) and select `Add Song to Spotify`.
3. A list of matching songs will appear. Select one to add it to your configured playlist.

## Commands
The following commands are available with the extension:

```json
{
  "command": "amathron.setSpotifyPlaylist",
  "title": "Amathron Song: Set a playlist to save songs into"
}
```

## Contributing
Contributions are welcome. Please report issues or suggest enhancements through GitHub pull requests or issues.

## Release Notes

### 0.9.0
- Initial release with the ability to search Spotify and add songs to a playlist.

## License
Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
Encounter an issue or have a suggestion? Please open an issue on the [GitHub repository](https://github.com/amathron-com/a-add-to-spotify/issues).

## Acknowledgments
Special thanks to the Spotify Developer community and all the contributors who support and improve this extension.
