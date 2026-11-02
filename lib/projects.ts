// Which public repositories the projects page lists, and under which heading.
// `npm run check-sync` fails when this disagrees with lib/open-source.json.

// Shown elsewhere on the page or not projects at all.
export const EXCLUDED = ['.github', 'cjber', 'MagiskOnWSA', 'kiln']

export const GROUPS = [
  { name: 'Developer tools', projects: ['oxide', 'hyprview'] },
  {
    name: 'WoW addons',
    projects: [
      'adventure-guide-forever',
      'atlas-forever',
      'commissions-forever',
      'field-guide-forever',
      'forever-core',
      'hoard-forever',
      'legacy-forever',
      'shortest-path-forever',
      'skillup-forever',
      'tweaks-forever',
    ],
  },
  { name: 'Personal website', projects: ['cjber.dev'] },
]

// Every other public repository is archived research code and lands here.
export const RESEARCH_GROUP = 'Research and geospatial work'
