import {Option} from "react-bootstrap-typeahead";

interface Report {
  veracity: "Unconfirmed" | "Confirmed true" | "Confirmed false",
  tags: string[],
  smtcTags: string[],
  hasSMTCTags: boolean,
  read: boolean,
  _sources: string[],
  _media: string[],
  _sourceNicknames: string[],
  escalated: boolean,
  _id: string,
  _incident?: string,
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

interface ReportSearchState {
  tags : Tag[] | [] | null,
  keywords: string | null,
  author: string | null,
  groupId: string | null,
  media: string | null,
  sourceId: string | null,
  list: string | null,
  before: string | null,
  after: string | null,
  page:  Number | null,
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

interface Source {
  enabled: boolean,
  unreadErrorCount: number,
  tags?: string[],
  url: string,
  _id: string,
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

interface Group {
  tags: string[],
  id?: number,
  smtcTags: string[],
  status: string,
  veracity: 'Confirmed true' | 'Confirmed false' | 'Unconfirmed',
  escalated: boolean,
  closed: boolean,
  public: boolean,
  totalReports: number,
  _id: string,
  title: string,
  assignedTo?: {
    _id: string,
    username: string
  },
  creator: {
    _id: string,
    username: string
  },
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
  tags: string[] | [] | null,
  veracity: 'Confirmed true' | 'Confirmed false' | 'Unconfirmed' | null,
  escalated: boolean | null,
  closed: boolean | null,
  public: boolean | null,
  totalReports: number | null,
  assignedTo: string | null,
  creator: string | null,
  after: string | null,
  before: string | null,
  idnum: number | null,
  locationName: string | null,
}

interface Groups {
  total: number,
  results: Group[]
}


interface User {
  provider: string,
  hasDefaultPassword: boolean,
  role: string,
  _id: string,
  email: string,
  username: string,
  __v: number
}

export interface UserEditableData {
  username: string,
  email: string,
  role: 'viewer' | 'monitor'| 'admin',
  _id?: string
}

interface Tag {
  isCommentTag: boolean,
  _id: string,
  name: string,
  color: string,
  description: string,
  user: {
    _id: string,
    username: string
  },
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

interface Credential {
  _id: string,
  id: string,
  name: string,
  type: string,
  secrets: {
    dashboardAPIToken: string
  }
  __v: number
}

interface Session {
  email: string,
  hasDefaultPassword: boolean,
  provider: string,
  role: admin | monitor | undefined,
  username: string,
  __v: number,
  _id: string
}

interface LoginData {
  username: string,
  password: string
}

interface CTList {
  lists: any,
}

type MediaType = "twitter" | "instagram" | "RSS" | "elmo" | "SMS GH" | "whatsapp" | "facebook" | "comments"
type veracityOption = 'Confirmed true' | 'Confirmed false' | 'Unconfirmed'