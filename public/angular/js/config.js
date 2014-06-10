angular.module('Aggie')

.value('sourceTypes', ['twitter', 'rss'])

.value('statusOptions', ['relevant', 'irrelevant', 'unassigned', 'assigned'])

.value('userRoles', ['viewer', 'monitor', 'manager', 'admin'])

.value('paginationOptions', {
  perPage: 25
});
