angular.module('Aggie')

.value('sourceTypes', ['twitter', 'facebook', 'rss', 'elmo'])

// .value('statusOptions', ['relevant', 'irrelevant', 'unassigned', 'assigned'])

.value('statusOptions', ['read', 'unread', 'flagged', 'unflagged', 'read & unflagged'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

// .value('incidentStatusOptions', ['new', 'working', 'alert', 'closed'])

.value('incidentStatusOptions', ['open', 'closed'])

// .value('veracityOptions', ['true', 'false'])

.value('veracityOptions', ['unconfirmed', 'confirmed true', 'confirmed false'])

.value('escalatedOptions', ['escalated', 'unescalated'])

.value('paginationOptions', {
  perPage: 25
});
