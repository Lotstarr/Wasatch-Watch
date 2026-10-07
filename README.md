# Wasatch Watch

Play Wasatch Watch: https://wasatch-watch.lotstarr.workers.dev

Source: https://github.com/Lotstarr/Wasatch-Watch

A separate desktop solo tower-defense game, inspired by Utah’s mountain scenery and a fictional navy-and-white campus. No Iron Tide code, database or deployment is shared.

## Playable campaign
Campus Foothills: eight waves, four tower types, four-tier upgrades with specializations, gold rewards, selling, rally points, pause and 2× speed, defeat/retry, and saved best stars. Enemy types include runners, armored rocks, flyers and a final mountain giant.

Run `python3 -m http.server 8790 --directory public` in this folder, then visit http://localhost:8790.

Provo Canyon unlocks after Campus Foothills victory. Campaign cards show saved stars and four upcoming levels. Snowmaker magic bypasses shield armor with 35% bonus damage; Beehives launch lower-damage tracking swarms at every in-range enemy. Maps 3–6 and broader balance testing are subsequent milestones. This project has its own GitHub repository and Cloudflare Worker; automatic GitHub deployment is not connected yet. The existing live Iron Tide game is unaffected.

Run `npm test` to verify economy, blocking, pause, reward uniqueness, victory/defeat, and an affordable full eight-wave mixed-tower strategy.

## Gameplay update
Each level has eight authored wave compositions and previews listing enemy counts. Provo Canyon introduces copper living-stone splitters in wave three; each defeated splitter releases two fast shards at its current trail position. Rangers and Snowmakers offer First, Strongest, and Flyers priorities (Flyers falls back to First). Beehives always attack all in-range enemies. Tower upgrades gain supports, gold reinforcement, and tier-four branch rings.

Full mixed-defense simulations finish Campus Foothills with 15 lives and Provo Canyon with 20. A separate Beehive-only strategy finishes with 13 and 15 respectively; this comparison is a starting balance check, with human playtesting still needed.

## Illustrated combat update
Both maps now use original canvas artwork: shaded terrain, mountain ridges, forest details, a campus stronghold, illustrated tower tiers and distinct animated enemy silhouettes. Provo Canyon has river scenery. The parchment command panel provides compact targeting controls, a collapsible field guide and build-range previews. Defender squads move to rally points before blocking, animate while tackling, and retreat during regrouping. Each non-final cleared wave awards 10 + 3 × wave gold once. Terrain is cached and transient effects are capped for steadier rendering.

## Tactics and battle reports
The heading separates the current wave (on-trail and incoming counts) from the next wave's composition. Upgrade buttons preview exact damage, range, launch/attack interval and defender changes. Click a living enemy to inspect health, armor, abilities and counters; Escape clears selection.

Tier-four roles: Rapid Ranger fires a secondary arrow at half damage; Sharpshooter gains armor bypass, extra range and a slower high-damage shot. Snowstorm splashes within 70 trail units; Frost Mage freezes for 1.4 seconds with a three-second cooldown. Swarm Keeper launches faster and sustains swarms for 3.2 seconds; Honey Trap slows targets. Defensive Line holds four enemies with half stamina drain; Blitz Squad charges for double tackle damage every eight seconds and regroups in three seconds. Branches have distinct tower embellishments.

Victory and defeat include a damage/kills table by tower type. Damage is capped to actual health removed; finishing blows earn kills. Sold towers' contributions remain in the report.
