# PVP Chat - Chat & Play Games with Strangers

A modern web platform where users can chat with strangers and play mini-games together. The website features a responsive design, animated elements, and interactive components built with HTML, CSS, and JavaScript.

## Features

- Real-time chat with strangers
- Mini games you can play while chatting
- Leaderboard system with region-based filtering
- Modern UI with animations and interactive elements
- Fully responsive design

## Project Structure

```
pvp-chat/
├── index.html             # Main HTML file
├── public/                # Public assets
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   └── script.js      # JavaScript functionality
│   └── assets/            # Images and icons
│       ├── images/        # Website images
│       └── icons/         # SVG icons
└── README.md              # Project documentation
```

## Required Assets

### Images

1. **Hero Image**: `hero-image.png` (550x450px)
   - A 3D character playing games with chat bubbles around them

2. **Game Thumbnails**:
   - `game-1.png` (300x200px) - Chess game thumbnail
   - `game-2.png` (300x200px) - Tic Tac Toe game thumbnail
   - `game-3.png` (300x200px) - Word Puzzle game thumbnail

3. **CTA Image**: `cta-image.png` (450x350px)
   - Image showing people chatting and playing games together

4. **Player Avatars**:
   - `avatar-1.png` through `avatar-20.png` (64x64px)
   - Profile pictures for the leaderboard players

### Icons (SVG format, 64x64px)

1. `chat-icon.svg` - Icon representing the chat feature
2. `games-icon.svg` - Icon representing mini-games
3. `security-icon.svg` - Icon representing platform security/safety

## Getting Started

1. Clone the repository
2. Add the required images to the `public/assets/images` directory
3. Add the required icons to the `public/assets/icons` directory
4. Open `index.html` in your browser to view the website

## Customization

- Colors and design variables can be modified in the `style.css` file under the `:root` selector
- Leaderboard data can be updated in the `script.js` file
- Game carousel items can be added or removed in the HTML structure

## Browser Compatibility

The website is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Backend integration for real chat functionality
- User authentication system
- More mini-games
- Friend system
- Mobile app version

## License

This project is licensed under the MIT License. 