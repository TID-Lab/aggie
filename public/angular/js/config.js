angular.module('Aggie')

.value('sourceTypes', ['twitter', 'facebook', 'rss', 'elmo'])

.value('statusOptions', ['Read', 'Unread', 'Flagged', 'Unflagged', 'Read & Unflagged'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

.value('incidentStatusOptions', ['open', 'closed'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('paginationOptions', {
  perPage: 25
});
