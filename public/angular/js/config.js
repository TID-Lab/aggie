angular.module('Aggie')

.value('mediaOptions', ['twitter', 'facebook', 'rss', 'elmo', 'smsgh', 'whatsapp'])

.value('apiSettingsOptions', ['twitter', 'facebook', 'elmo', 'gplaces'])

.value('widgetSettingsOptions', ['incident map'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('linkedtoIncidentOptions', [{ _id: 'any', title: '* Any Incident' },
                                   { _id: 'none', title: '* Without Incident' }])

.value('userRoles', ['viewer', 'monitor', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['Report Confirmed', 'Report Unconfirmed'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('publicOptions', ['public', 'private'])

.value('governorateOptions', ['Misrata-Ajdabiya','Tripoli','Zawiya','Zintan','Benghazi','Bedha-Marj','Tobroq-Derna','Sabha', 'Marzooq'])

.value('paginationOptions', { perPage: 25 })

.value('emailTransportOptions', {
  SES: ['accessKeyId', 'secretAccessKey', 'region'],
  SMTP: ['host', 'port', 'secure', 'user', 'pass'],
  SendGrid: ['api_key'] })

.value('twitterLanguageOptions', {
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'bn': 'Bengali',
    'bg': 'Bulgarian',
    'my': 'Burmese',
    'zh': 'Chinese',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'in': 'Indonesian',
    'it': 'Italian',
    'ja': 'Japanese',
    'kn': 'Kannada',
    'km': 'Khmer',
    'ko': 'Korean',
    'lo': 'Lao',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'ml': 'Malayalam',
    'dv': 'Maldivian',
    'mr': 'Marathi',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'or': 'Oriya',
    'pa': 'Panjabi',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sr': 'Serbian',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'ckb': 'Sorani Kurdish',
    'es': 'Spanish',
    'sv': 'Swedish',
    'tl': 'Tagalog',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'bo': 'Tibetan',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'ug': 'Uyghur',
    'vi': 'Vietnamese',
    'cy': 'Welsh'
});
