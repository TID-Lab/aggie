import {Option} from "react-bootstrap-typeahead";

interface hasId {
    _id: string,
}

interface Report extends hasId{
  veracity: Veracity,
  tags: string[],
  smtcTags: string[],
  hasSMTCTags: boolean,
  read: boolean,
  _sources: string[],
  _media: string[],
  _sourceNicknames: string[],
  escalated: boolean,
  _group?: string,
  authoredAt: string,
  fetchedAt: string,
  content: string,
  author: string,
  metadata: any
  url: string,
  storedAt: string,
  commentTo: string,
  notes: string,
  originalPost: string,
  __v: number
}

interface ReportQuery {
  keywords: string | null,
  tags: Tag[] | [] | string[],
  sourceId: string | null,
  groupId: string | null,
  media: string | null,
  author: string | null,
  before: string | null,
  status: string | null,
  page: number | null,
  list: string | CTList | null,
}

interface ReportQueryState {
  keywords: string | null,
  author: string | null,
  groupId: string | null,
  media: string | null,
  sourceId: string | null,
  list: string | null,
  before: Date | string | null,
  after: Date | string | null,
  tags: string[] | null,
  page:  number | null,
}

interface Reports {
  total: number,
  results: Report[]
}

interface SourceEvent {
  datetime: string,
  type: string,
  message: string
}

interface Source extends hasId{
  enabled: boolean,
  unreadErrorCount: number,
  tags?: string[],
  url: string,
  media: string,
  nickname: string,
  credentials: Credential,
  events?: SourceEvent[],
  user: {
    _id: string,
    username: string
  },
  keywords?: string,
  __v: number,
  lastReportDate?: string
}

interface Group extends hasId{
  tags: string[],
  id?: number,
  smtcTags: string[],
  status: string,
  veracity: Veracity,
  escalated: boolean,
  closed: boolean,
  public: boolean,
  _reports: string[],
  title: string,
  assignedTo?: {
    _id: string,
    username: string
  } | null,
  creator: {
    _id: string,
    username: string
  } | null,
  storedAt: string,
  updatedAt: string,
  idnum: number,
  __v: number,
  notes?: string,
  locationName: string
}

export interface GroupCreateData {
  title: string,
  notes: string,
  veracity: 'Confirmed true' | 'Confirmed false' | 'Unconfirmed',
  closed: boolean,
  assignedTo: string,
  locationName: string,
  public: boolean,
  escalated: boolean,
  _id?: string,
  user: User
}

export interface GroupEditableData {
  title: string,
  notes: string,
  veracity: 'Confirmed true' | 'Confirmed false' | 'Unconfirmed',
  closed: boolean,
  assignedTo: string,
  locationName: string,
  public: boolean,
  escalated: boolean,
  _id?: string
}

interface GroupSearchState {
  veracity?: string | null,
  escalated?: boolean | null,
  closed?: boolean | null,
  title?: string | null,
  totalReports?: number | null,
  assignedTo?: string | null,
  creator?: string | null,
  after?: string | null,
  before?: string | null,
  idnum?: number | null,
  locationName?: string | null,
  page?:  number | null,
}

interface Groups {
  total: number,
  results: Group[]
}


interface User extends hasId{
  provider: string,
  hasDefaultPassword: boolean,
  role: string,
  email: string,
  username: string,
  __v: number
}

export interface UserCreationData {
  username: string,
  email: string,
  password: string,
  role: 'viewer' | 'monitor'| 'admin',
  _id?: string
}

export interface UserEditableData{
  username: string,
  email: string,
  role: 'viewer' | 'monitor'| 'admin',
  _id?: string
}

interface Tag extends hasId{
  isCommentTag: boolean,
  name: string,
  color: string,
  description: string,
  user: {
    _id: string,
    username: string
  },
  updatedAt: string,
  storedAt: string,
  __v: number
}

interface TagEditableData {
  name: string,
  description: string,
  isCommentTag: boolean,
  color: string,
  _id?: string
}

interface Setting {
  fetching?: boolean,
  email?: {
    from: string,
    transport: {
      method: string,
      options:{
        host: string,
        port: string,
        secure: boolean,
        user: string,
        pass: string
      }
    }
  },
  elmo?: string,
  crowdtangle?: {
    apiToken: string,
    baseUrl: string,
    pathName: string,
    count: number,
    sortParam: string,
    language: string,
    zawgyiProb: number,
    detectHateSpeech: boolean
  },
  twitter?: {
    API_key: string,
    API_key_secret: string,
    access_token: string,
    access_token_secret: string,
  }
  setting: string
}

interface Credential extends hasId{
  id: string,
  name: string,
  type: string,
  secrets: {
    dashboardAPIToken: string
  }
  __v: number
}

interface Session extends hasId{
  email: string,
  hasDefaultPassword: boolean,
  provider: string,
  role: admin | monitor | undefined,
  username: string,
  __v: number,
}

interface LoginData {
  username: string,
  password: string
}

interface CTList {
  lists: any,
}

interface VisualizationAuthor {
  _id: string,
  tag: string,
  subCount: number,
  reportCount: number,
  read_only: boolean,
  name: string
}

type VisualizationMediaTypes = "link" | "live_video_complete" | "status" | "live_video" | "video" | "youtube" | "live_video_scheduled" | "photo" | "native_video"
interface VisualizationMedia {
  count: number,
  name: VisualizationMediaTypes,
  read_only: boolean,
  tag: string,
  _id: string
}

interface VisualizationTag {
  count: number,
  name: VisualizationMediaTypes,
  color: string
  _id: string
}

interface VisualizationTime {
  count: number,
  day: number,
  hour: number,
  month: number,
  read_only: boolean,
  tag: string,
  year: number,
  _id: string
}

interface VisualizationWord {
  count: number,
  name: string,
  read_only: boolean,
  _id: string
}

interface VisualizationAuthors {
  authors: VisualizationAuthor[],
  authors_read: VisualizationAuthor[],
}

interface VisualizationTags {
  tagData: {
    author: any,
    media: any,
    time: any,
    word: any
  },
  tags: VisualizationTag[],
}

interface VisualizationWords {
  words: VisualizationWord[],
  words_read: VisualizationWord[],
}

interface VisualizationMedias {
  media: VisualizationMedia[],
  media_read: VisualizationMedia[],
}

interface VisualizationTimes {
  time: VisualizationTime[],
  time_read: VisualizationTime[],
  maxTimeCount: number,
  avgTimeCount: number,
  maxReadTimeCount: number,
  avgReadTimeCount: number
}
type MediaType = "twitter" | "instagram" | "RSS" | "elmo" | "SMS GH" | "whatsapp" | "facebook" | "comments"
type VeracityOptions = 'Confirmed True' | 'Confirmed False' | 'Unconfirmed';
type EscalatedOptions = "true" | "false";
type ClosedOptions = "true" | "false";

