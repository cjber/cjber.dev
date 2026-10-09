// Source of truth for the CV. The /cv page, the generated cv.pdf, the
// homepage and the projects page all read from here; LinkedIn mirrors it.

export const PROFILE = {
  name: 'Cillian Berragan',
  title: 'Founding AI Engineer',
  employer: { name: 'Nebula', url: 'https://nebula.gg' },
  location: 'Glasgow, Scotland',
  email: 'cillian@berragan.co.uk',
  site: 'https://cillian.dev',
  summary:
    'I build AI agents and the systems that run them. At Nebula I own the backend: agent execution, durable workflows and integrations with hundreds of apps. I also wrote fastbrowse, an open-source browser agent. PhD in natural language processing.',
}

export const LINKS = {
  github: 'https://github.com/cjber',
  linkedin: 'https://linkedin.com/in/cjberr',
  scholar: 'https://scholar.google.com/citations?user=mBNb4rgAAAAJ&hl=en',
  twitter: 'https://x.com/cjberragan',
}

export type Role = {
  org: string
  url?: string
  title: string
  period: string
  location?: string
  bullets: string[]
}

export const ROLES: Role[] = [
  {
    org: 'Nebula',
    url: 'https://nebula.gg',
    title: 'Founding AI Engineer',
    period: 'Feb 2026 - Present',
    location: 'Remote',
    bullets: [
      'Nebula is a multiplayer workspace where teams work alongside AI agents that have real tools, memory and their own computers.',
      'Own the backend as its primary engineer: the agent execution engine, durable workflow orchestration, multi-agent coordination, persistent memory and real-time streaming.',
      'Built the integrations that let agents act across hundreds of apps, and the APIs behind the desktop, mobile and CLI clients.',
      'Wrote fastbrowse, an open-source browser agent: a choice model picks each action from the controls on the page, and every claim in an answer cites a quote from it.',
    ],
  },
  {
    org: 'thirdweb',
    url: 'https://thirdweb.com',
    title: 'Software Engineer',
    period: 'Mar 2025 - Mar 2026',
    location: 'Remote',
    bullets: [
      'Built thirdweb AI, a conversational agent platform for working with onchain infrastructure and thirdweb developer tools.',
      'Became its primary backend engineer, across RAG pipelines, API development and agent tooling.',
    ],
  },
  {
    org: 'Consumer Data Research Centre',
    title: 'Machine Learning Engineer',
    period: 'Dec 2023 - Mar 2025',
    location: 'Liverpool / Remote',
    bullets: [
      'Built a retrieval-augmented generation search system over a combined UK data catalogue, using LangChain, ETL pipelines and vector search.',
      'Applied NLP to improve data discovery and access across the catalogue.',
    ],
  },
  {
    org: 'Geographic Data Science Lab',
    title: 'PhD Researcher',
    period: 'Sep 2019 - Dec 2023',
    location: 'Liverpool',
    bullets: [
      'NLP and geography research at the University of Liverpool.',
      'Extracted and mapped cognitive place associations from Reddit and Twitter text.',
    ],
  },
  {
    org: 'Consumer Data Research Centre (Leeds)',
    title: 'Data Scientist',
    period: 'Feb 2021 - May 2022',
    location: 'Liverpool, part-time',
    bullets: [
      'Access to Healthy Assets & Hazards (AHAH): a postcode-to-PoI drive-time index across England.',
    ],
  },
]

export type Education = {
  org: string
  qualification: string
  period: string
  note?: string
}

export const EDUCATION: Education[] = [
  {
    org: 'University of Liverpool',
    qualification: 'PhD, Natural Language Processing & Geography',
    period: '2019 - 2023',
    note: 'Thesis: Exploring Place from the Perspective of Informal Social Media Text.',
  },
  {
    org: 'University of Liverpool',
    qualification: 'MSc, Geographic Data Science',
    period: '2018 - 2019',
    note: 'Distinction (82%). Dissertation 85%: parametric classification of UK rural roads from LiDAR.',
  },
]

export type Publication = {
  title: string
  venue: string
  year: number
  url: string
}

// Ordered by how widely each is cited.
export const PUBLICATIONS: Publication[] = [
  {
    title: 'Transformer based named entity recognition for place name extraction from unstructured text',
    venue: 'International Journal of Geographical Information Science',
    year: 2023,
    url: 'https://doi.org/10.1080/13658816.2022.2133125',
  },
  {
    title: 'Overture Point of Interest data for the United Kingdom: a comprehensive, queryable open data product, validated against Geolytix supermarket data',
    venue: 'Environment and Planning B: Urban Analytics and City Science',
    year: 2024,
    url: 'https://doi.org/10.1177/23998083241263124',
  },
  {
    title: "Mapping Great Britain's semantic footprints through a large language model analysis of Reddit comments",
    venue: 'Computers, Environment and Urban Systems',
    year: 2024,
    url: 'https://doi.org/10.1016/j.compenvurbsys.2024.102121',
  },
  {
    title: 'Mapping cognitive place associations within the United Kingdom through online discussion on Reddit',
    venue: 'Transactions of the Institute of British Geographers',
    year: 2024,
    url: 'https://doi.org/10.1111/tran.12669',
  },
  {
    title: 'Exploring Place from the Perspective of Informal Social Media Text',
    venue: 'PhD thesis, University of Liverpool',
    year: 2024,
    url: 'https://livrepository.liverpool.ac.uk/3180909/',
  },
]

// Most recent work first.
export const SKILLS = [
  'Python',
  'TypeScript',
  'AI agents',
  'Durable workflows (DBOS)',
  'Pydantic AI',
  'FastAPI',
  'PostgreSQL / pgvector',
  'MCP',
  'Browser automation',
  'LLM evals',
  'RAG',
  'LangChain',
  'Natural Language Processing',
  'Geospatial data',
]
