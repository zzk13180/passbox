/* eslint-disable max-lines */
export type Emoji = {
  title: string
  titleI18n?: {
    English: string
    Chinese: string
    Japanese: string
    Spanish: string
    German: string
    Russian: string
    French: string
    Italian: string
    Portuguese: string
    Polish: string
    Arabic: string
    Persian: string
    Indonesian: string
    Dutch: string
  }
  symbol: string
  keywords: string
  keywordsI18n?: {
    English: string
    Chinese: string
    Japanese: string
    Spanish: string
    German: string
    Russian: string
    French: string
    Italian: string
    Portuguese: string
    Polish: string
    Arabic: string
    Persian: string
    Indonesian: string
    Dutch: string
  }
}

export const emojisTmpData: Emoji[] = [
  {
    title: 'Grinning',
    symbol: '😀',
    keywords: 'grinning face happy smiley emotion emotion',
  },
  {
    title: 'Grimacing',
    symbol: '😬',
    keywords: 'grimacing face silly smiley emotion emotion selfie selfie',
  },
  {
    title: 'Grin',
    symbol: '😁',
    keywords:
      'grinning face with smiling eyes happy silly smiley emotion emotion good good selfie selfie',
  },
  {
    title: 'Joy',
    symbol: '😂',
    keywords:
      'face with tears of joy happy silly smiley cry laugh laugh emotion emotion sarcastic sarcastic',
  },
  {
    title: 'Smiley',
    symbol: '😃',
    keywords: 'smiling face with open mouth happy smiley emotion emotion good good',
  },
  {
    title: 'Smile',
    symbol: '😄',
    keywords:
      'smiling face with open mouth and smiling eyes happy smiley emotion emotion',
  },
  {
    title: 'Sweat Smile',
    symbol: '😅',
    keywords:
      'smiling face with open mouth and cold sweat smiley workout sweat emotion emotion',
  },
  {
    title: 'Laughing',
    symbol: '😆',
    keywords:
      'smiling face with open mouth and tightly-closed eyes happy smiley laugh laugh emotion emotion',
  },
  {
    title: 'Innocent',
    symbol: '😇',
    keywords: 'smiling face with halo smiley emotion emotion',
  },
  {
    title: 'Wink',
    symbol: '😉',
    keywords: 'winking face silly smiley emotion emotion',
  },
  {
    title: 'Blush',
    symbol: '😊',
    keywords:
      'smiling face with smiling eyes happy smiley emotion emotion good good beautiful beautiful',
  },
  {
    title: 'Slight Smile',
    symbol: '🙂',
    keywords: 'slightly smiling face happy smiley',
  },
  {
    title: 'Upside Down',
    symbol: '🙃',
    keywords: 'upside-down face silly smiley sarcastic sarcastic',
  },
  {
    title: 'Relaxed',
    symbol: '☺',
    keywords: 'white smiling face happy smiley',
  },
  {
    title: 'Yum',
    symbol: '😋',
    keywords:
      'face savouring delicious food happy silly smiley emotion emotion sarcastic sarcastic good good',
  },
  {
    title: 'Relieved',
    symbol: '😌',
    keywords: 'relieved face smiley emotion emotion',
  },
  {
    title: 'Heart Eyes',
    symbol: '😍',
    keywords:
      'smiling face with heart-shaped eyes happy smiley love sex heart eyes emotion emotion beautiful beautiful',
  },
  {
    title: 'Kissing Heart',
    symbol: '😘',
    keywords: 'face throwing a kiss smiley love sexy',
  },
  {
    title: 'Kissing',
    symbol: '😗',
    keywords: 'kissing face smiley sexy',
  },
  {
    title: 'Kissing Smiling Eyes',
    symbol: '😙',
    keywords: 'kissing face with smiling eyes smiley sexy',
  },
  {
    title: 'Kissing Closed Eyes',
    symbol: '😚',
    keywords: 'kissing face with closed eyes smiley sexy',
  },
  {
    title: 'Stuck Out Tongue Winking Eye',
    symbol: '😜',
    keywords:
      'face with stuck-out tongue and winking eye happy smiley emotion emotion parties parties',
  },
  {
    title: 'Stuck Out Tongue Closed Eyes',
    symbol: '😝',
    keywords:
      'face with stuck-out tongue and tightly-closed eyes happy smiley emotion emotion',
  },
  {
    title: 'Stuck Out Tongue',
    symbol: '😛',
    keywords: 'face with stuck-out tongue smiley sex emotion emotion',
  },
  {
    title: 'Money Mouth',
    symbol: '🤑',
    keywords:
      'money-mouth face smiley win win money money emotion emotion boys night boys night',
  },
  {
    title: 'Nerd',
    symbol: '🤓',
    keywords: 'nerd face smiley glasses',
  },
  {
    title: 'Sunglasses',
    symbol: '😎',
    keywords:
      'smiling face with sunglasses silly smiley emojione glasses boys night boys night',
  },
  {
    title: 'Hugging',
    symbol: '🤗',
    keywords: 'hugging face smiley hug thank you',
  },
  {
    title: 'Smirk',
    symbol: '😏',
    keywords: 'smirking face silly smiley sexy sarcastic sarcastic',
  },
  {
    title: 'No Mouth',
    symbol: '😶',
    keywords: 'face without mouth mad smiley neutral emotion emotion',
  },
  {
    title: 'Neutral Face',
    symbol: '😐',
    keywords: 'neutral face mad smiley shrug neutral emotion emotion',
  },
  {
    title: 'Expressionless',
    symbol: '😑',
    keywords: 'expressionless face mad smiley neutral emotion emotion',
  },
  {
    title: 'Unamused',
    symbol: '😒',
    keywords: 'unamused face sad mad smiley tired emotion emotion',
  },
  {
    title: 'Rolling Eyes',
    symbol: '🙄',
    keywords:
      'face with rolling eyes mad smiley rolling eyes emotion emotion sarcastic sarcastic',
  },
  {
    title: 'Thinking',
    symbol: '🤔',
    keywords: 'thinking face smiley thinking boys night boys night',
  },
  {
    title: 'Flushed',
    symbol: '😳',
    keywords: 'flushed face smiley emotion emotion omg omg',
  },
  {
    title: 'Disappointed',
    symbol: '😞',
    keywords: 'disappointed face sad smiley tired emotion emotion',
  },
  {
    title: 'Worried',
    symbol: '😟',
    keywords: 'worried face sad smiley emotion emotion',
  },
  {
    title: 'Angry',
    symbol: '😠',
    keywords: 'angry face mad smiley emotion emotion',
  },
  {
    title: 'Rage',
    symbol: '😡',
    keywords: 'pouting face mad smiley angry emotion emotion',
  },
  {
    title: 'Pensive',
    symbol: '😔',
    keywords: 'pensive face sad smiley emotion emotion rip rip',
  },
  {
    title: 'Confused',
    symbol: '😕',
    keywords: 'confused face smiley surprised emotion emotion',
  },
  {
    title: 'Slight Frown',
    symbol: '🙁',
    keywords: 'slightly frowning face sad smiley emotion emotion',
  },
  {
    title: 'Frowning2',
    symbol: '☹',
    keywords: 'white frowning face sad smiley emotion emotion',
  },
  {
    title: 'Persevere',
    symbol: '😣',
    keywords: 'persevering face sad smiley angry emotion emotion',
  },
  {
    title: 'Confounded',
    symbol: '😖',
    keywords: 'confounded face sad smiley angry emotion emotion',
  },
  {
    title: 'Tired Face',
    symbol: '😫',
    keywords: 'tired face sad smiley tired emotion emotion',
  },
  {
    title: 'Weary',
    symbol: '😩',
    keywords: 'weary face sad smiley tired stressed emotion emotion',
  },
  {
    title: 'Triumph',
    symbol: '😤',
    keywords: 'face with look of triumph mad smiley angry emotion emotion steam steam',
  },
  {
    title: 'Open Mouth',
    symbol: '😮',
    keywords: 'face with open mouth smiley surprised wow wow emotion emotion',
  },
  {
    title: 'Scream',
    symbol: '😱',
    keywords: 'face screaming in fear smiley surprised wow wow emotion emotion omg omg',
  },
  {
    title: 'Fearful',
    symbol: '😨',
    keywords: 'fearful face smiley surprised emotion emotion',
  },
  {
    title: 'Cold Sweat',
    symbol: '😰',
    keywords: 'face with open mouth and cold sweat smiley sweat emotion emotion',
  },
  {
    title: 'Hushed',
    symbol: '😯',
    keywords: 'hushed face smiley surprised wow wow',
  },
  {
    title: 'Frowning',
    symbol: '😦',
    keywords: 'frowning face with open mouth sad smiley surprised emotion emotion',
  },
  {
    title: 'Anguished',
    symbol: '😧',
    keywords: 'anguished face sad smiley surprised emotion emotion',
  },
  {
    title: 'Cry',
    symbol: '😢',
    keywords: 'crying face sad smiley cry emotion emotion rip rip heartbreak heartbreak',
  },
  {
    title: 'Disappointed Relieved',
    symbol: '😥',
    keywords:
      'disappointed but relieved face sad smiley stressed sweat cry emotion emotion',
  },
  {
    title: 'Sleepy',
    symbol: '😪',
    keywords: 'sleepy face smiley sick emotion emotion',
  },
  {
    title: 'Sweat',
    symbol: '😓',
    keywords: 'face with cold sweat sad smiley stressed sweat emotion emotion',
  },
  {
    title: 'Sob',
    symbol: '😭',
    keywords: 'loudly crying face sad smiley cry emotion emotion heartbreak heartbreak',
  },
  {
    title: 'Dizzy Face',
    symbol: '😵',
    keywords: 'dizzy face smiley surprised dead wow wow emotion emotion omg omg',
  },
  {
    title: 'Astonished',
    symbol: '😲',
    keywords: 'astonished face smiley surprised wow wow emotion emotion omg omg',
  },
  {
    title: 'Zipper Mouth',
    symbol: '🤐',
    keywords: 'zipper-mouth face mad smiley',
  },
  {
    title: 'Mask',
    symbol: '😷',
    keywords: 'face with medical mask smiley dead health sick',
  },
  {
    title: 'Thermometer Face',
    symbol: '🤒',
    keywords: 'face with thermometer smiley health sick emotion emotion',
  },
  {
    title: 'Head Bandage',
    symbol: '🤕',
    keywords: 'face with head-bandage smiley health sick emotion emotion',
  },
  {
    title: 'Sleeping',
    symbol: '😴',
    keywords: 'sleeping face smiley tired emotion emotion goodnight goodnight',
  },
  {
    title: 'Zzz',
    symbol: '💤',
    keywords: 'sleeping symbol tired goodnight goodnight',
  },
  {
    title: 'Poop',
    symbol: '💩',
    keywords: 'pile of poo bathroom shit sol sol diarrhea diarrhea',
  },
  {
    title: 'Smiling Imp',
    symbol: '😈',
    keywords:
      'smiling face with horns silly smiley angry monster devil devil boys night boys night',
  },
  {
    title: 'Imp',
    symbol: '👿',
    keywords: 'imp smiley monster devil devil wth wth',
  },
  {
    title: 'Japanese Ogre',
    symbol: '👹',
    keywords: 'japanese ogre monster',
  },
  {
    title: 'Japanese Goblin',
    symbol: '👺',
    keywords: 'japanese goblin angry monster',
  },
  {
    title: 'Skull',
    symbol: '💀',
    keywords: 'skull dead halloween skull',
  },
  {
    title: 'Ghost',
    symbol: '👻',
    keywords: 'ghost holidays halloween monster',
  },
  {
    title: 'Alien',
    symbol: '👽',
    keywords: 'extraterrestrial alien space monster alien scientology scientology',
  },
  {
    title: 'Robot',
    symbol: '🤖',
    keywords: 'robot face monster robot',
  },
  {
    title: 'Smiley Cat',
    symbol: '😺',
    keywords: 'smiling cat face with open mouth happy cat cat animal animal',
  },
  {
    title: 'Smile Cat',
    symbol: '😸',
    keywords: 'grinning cat face with smiling eyes happy cat cat animal animal',
  },
  {
    title: 'Joy Cat',
    symbol: '😹',
    keywords:
      'cat face with tears of joy happy silly cry laugh laugh cat cat animal animal sarcastic sarcastic',
  },
  {
    title: 'Heart Eyes Cat',
    symbol: '😻',
    keywords:
      'smiling cat face with heart-shaped eyes heart eyes cat cat animal animal beautiful beautiful',
  },
]
