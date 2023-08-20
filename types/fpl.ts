export type BasicInfo = {
  elements: BasicInfoElement[];
  element_types: BasicInfoElementType[];
  element_stats: BasicInfoElementStat[];
  events: BasicInfoEvents;
  fixtures: { [gameweekId: number]: BasicInfoFixture[] };
  teams: BasicInfoTeam[];
};

export type BasicInfoElement = {
  id: number;
  assists: number;
  bonus: number;
  bps: number;
  clean_sheets: number;
  creativity: string; // Double 1dp
  goals_conceded: number;
  goals_scored: number;
  ict_index: string; // Double 1dp
  influence: string; // Double 1dp
  minutes: number;
  own_goals: number;
  penalties_missed: number;
  penalties_saved: number;
  red_cards: number;
  saves: number;
  threat: string; // Double 1dp
  yellow_cards: number;
  starts: number;
  expected_goals: string; // Double 2dp
  expected_assists: string; // Double 2dp
  expected_goal_involvements: string; // Double 2dp
  expected_goals_conceded: string; // Double 2dp
  added: string; // ISO8601
  chance_of_playing_next_round?: number; // percentage
  chance_of_playing_this_round?: number; // percentage
  code: number;
  draft_rank: number;
  dreamteam_count: number;
  //  ep_next: null
  //  ep_this: null
  event_points: number;
  first_name: string;
  form: string; // Double 1dp
  in_dreamteam: boolean;
  news: string;
  news_added?: string; // ISO8601
  news_return?: string; // ISO8601
  news_updated?: string; // ISO8601
  points_per_game: string; // Double 1dp
  second_name: string;
  squad_number?: number;
  status: string;
  total_points: number;
  web_name: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  form_rank?: number;
  form_rank_type?: number;
  points_per_game_rank?: number;
  points_per_game_rank_type?: number;
  corners_and_indirect_freekicks_order?: number;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order?: number;
  direct_freekicks_text: string;
  penalties_order?: number;
  penalties_text: string;
  element_type: number;
  team: number;
};

export type BasicInfoElementType = {
  id: number;
  element_count: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
};

export type BasicInfoElementStat = {
  name: string;
  label: string;
  abbreviation: string;
  is_match_stat: boolean;
  match_stat_order?: number;
  sort: "asc" | "desc"; // asc or desc
};

export type BasicInfoEvents = {
  current?: number;
  data: BasicInfoEventDetails[];
  next?: number;
};

export type BasicInfoEventDetails = {
  average_entry_score?: number;
  deadline_time: string; // ISO 8601
  id: number;
  name: string;
  finished: boolean;
  highest_scoring_entry?: number;
  trades_time: string; // ISO 8601
  waivers_time: string; // ISO 8601
};

export type BasicInfoFixture = {
  id: number;
  started: boolean;
  code: number;
  finished: boolean;
  finished_provisional: boolean;
  kickoff_time: string; // ISO 8601
  minutes: number;
  provisional_start_time: boolean;
  team_a_score?: number;
  team_h_score?: number;
  pulse_id: number;
  event: number;
  team_a: number;
  team_h: number;
};

export type BasicInfoTeam = {
  code: number;
  id: number;
  name: string;
  pulse_id: number;
  short_name: string;
};

export type EventPicks = {
  picks: EventPick[];
};

export type EventPick = {
  element: number;
  position: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
};

export type GameInfo = {
  current_event: number;
  current_event_finished: boolean;
  next_event: number;
  processing_status: string;
  trades_time_for_approval: boolean;
  waivers_processed: boolean;
};

export type LeagueInfo = {
  league: LeagueDetails;
  league_entries: LeagueEntryDetails[];
  standings: LeagueStandings[];
};

export type LeagueDetails = {
  admin_entry: number;
  closed: boolean;
  draft_dt: string; // ISO8601
  draft_pick_time_limit: number;
  draft_status: string;
  draft_tz_show: string;
  id: number;
  ko_rounds: number;
  make_code_public: boolean;
  max_entries: number;
  min_entries: number;
  name: string;
  scoring: string;
  start_event: number;
  stop_event: number;
  trades: string;
  transaction_mode: string;
  variety: string;
};

export type LeagueEntryDetails = {
  entry_id: number;
  entry_name: string;
  id: number;
  joined_time: string; // ISO8601
  player_first_name: string;
  player_last_name: string;
  short_name: string;
  waiver_pick: number;
};

export type LeagueStandings = {
  event_total: number;
  last_rank?: number;
  league_entry: number;
  rank: number;
  rank_sort: number;
  total: number;
};
