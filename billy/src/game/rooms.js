// The rooms of the game. The legend is in room.js. The first room is where
// the game starts.
//
// With the physics in player.js, a jump rises about 4½ tiles (36 px) and,
// when landing 3 tiles higher, carries Billy about 3 tiles sideways.

export const ROOMS = [
  {
    id: 'the-start-of-the-journey',
    title: 'The start of the journey',
    description: 'Billy the capybara wakes up in an unfamiliar environment. What is going on?!?',
    colors: {
      background: '#0b0820',
      wall: '#8a2d5c',
      wallMortar: '#4a1232',
      platform: '#3fbf8f',
      platformShade: '#1d6b52',
      cactus: '#5cc04a',
      cactusLight: '#a6e85a',
      cactusShade: '#2f7a2a',
      door: '#8a5a2b',
      doorShade: '#5a3818',
      doorLight: '#ffe9a8',
      doorLightShade: '#e8c46a'
    },
    map: [
      '################################',
      '#..............................#',
      '#..............................#',
      '#..........................K...#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#.................===========..#',
      '#..............................#',
      '#..............................#',
      '#..............................#',
      '#........========..............#',
      '#..............................D',
      '#S......................C......D',
      '################################'
    ],
    // Monster types are in monsters.js. This parrot patrols the key's height.
    monsters: [
      { type: 'parrot', col: 1, row: 3, dir: 1 }
    ]
  }
]
