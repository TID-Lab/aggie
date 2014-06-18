angular.module('Aggie')

.value('sourceTypes', ['twitter', 'facebook', 'rss', 'elmo'])

.value('statusOptions', ['relevant', 'irrelevant', 'unassigned', 'assigned'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

.value('incidentStatusOptions', ['new', 'working', 'alert', 'closed'])

.value('veracityOptions', ['true', 'false'])

.value('paginationOptions', {
  perPage: 25
});
