angular.module('Aggie')

.value('sourceTypes', {
  'twitter': 'Twitter',
  // 'facebook': 'Facebook',
  'rss': 'RSS',
  // 'elmo': 'Elmo'
})

.value('paginationOptions', {
  perPage: 25
});
