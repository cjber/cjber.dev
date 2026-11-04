// Which public repositories the projects page lists, and under which heading.
// `npm run check-sync` fails when this disagrees with lib/open-source.json.

// Shown elsewhere on the page, not launched yet, or not projects at all.
export const EXCLUDED = [
  '.github',
  'atlas-forever',
  'cjber',
  'commissions-forever',
  'field-guide-forever',
  'forever-core',
  'hoard-forever',
  'MagiskOnWSA',
  'kiln',
]

// Product names for repositories whose slug is not the name to show.
export const PROJECT_NAMES: Record<string, string> = {
  'adventure-guide-forever': 'Adventure Guide Forever',
  'legacy-forever': 'Legacy Forever',
  'shortest-path-forever': 'Shortest Path Forever',
  'skillup-forever': 'SkillUp Forever',
  'tweaks-forever': 'Tweaks Forever',
  'zerosprey42-binds': 'Zerosprey42 Binds',
}

export const GROUPS = [
  { name: 'Developer tools', projects: ['keeper', 'oxide', 'hyprview'] },
  {
    name: 'WoW addons',
    projects: [
      'adventure-guide-forever',
      'legacy-forever',
      'shortest-path-forever',
      'skillup-forever',
      'tweaks-forever',
      'zerosprey42-binds',
    ],
  },
  { name: 'Personal website', projects: ['cjber.dev', 'wow.cjber.dev'] },
]

// Every other public repository is archived research code and lands here.
export const RESEARCH_GROUP = 'Research and geospatial work'
