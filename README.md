# Wasatch Watch

Play Wasatch Watch: https://wasatch-watch.lotstarr.workers.dev

Source: https://github.com/Lotstarr/Wasatch-Watch

A separate desktop solo tower-defense game, inspired by Utah’s mountain scenery and a fictional navy-and-white campus. No Iron Tide code, database or deployment is shared.

## Playable campaign
Campus Foothills: eight waves, four tower types, four-tier upgrades with specializations, gold rewards, selling, rally points, pause and 2× speed, defeat/retry, and saved best stars. Enemy types include runners, armored rocks, flyers and a final mountain giant.

Run `python3 -m http.server 8790 --directory public` in this folder, then visit http://localhost:8790.

Provo Canyon unlocks after Campus Foothills victory. Campaign cards show saved stars and four upcoming levels. Snowmaker magic bypasses shield armor with 35% bonus damage; Beehives launch lower-damage tracking swarms at every in-range enemy. Maps 3–6 and broader balance testing are subsequent milestones. This project has its own GitHub repository and Cloudflare Worker; automatic GitHub deployment is not connected yet. The existing live Iron Tide game is unaffected.

Run `npm test` to verify economy, blocking, pause, reward uniqueness, victory/defeat, and an affordable full eight-wave mixed-tower strategy.
