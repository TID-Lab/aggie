'use strict';

/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Usage:
 *
 * <input type="text"  ng-autocomplete ng-model="autocomplete" options="options" details="details extra-locations="locations"/>
 *
 * + ng-model - autocomplete textbox value
 *
 * + details - more detailed autocomplete result, includes address parts, latlng, etc. (Optional)
 *
 * + options - configuration for the autocomplete (Optional)
 *
 *       + types: type,        String, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *       + bounds: bounds,     Google maps LatLngBounds Object, biases results to bounds, but may return results outside these bounds
 *       + country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete
 * + extra-locations - array of extra locations to be displayed under google suggested results
 *
 * example:
 *
 *    options = {
 *        types: '(cities)',
 *        country: 'ca'
 *    }
 **/

angular.module( "ngAutocomplete", [])
    .directive('ngAutocomplete', ['$compile', function($compile) {
        return {
            require: 'ngModel',
            scope: {
                ngModel: '=',
                options: '=?',
                details: '=?',
                extraLocations: '='
            },

            link: function(scope, element, attrs, controller) {
                //options for autocomplete
                var opts
                var watchEnter = false
                //convert options provided to opts
                var initOpts = function() {

                    opts = {}
                    if (scope.options) {

                        if (scope.options.watchEnter !== true) {
                            watchEnter = false
                        } else {
                            watchEnter = true
                        }

                        if (scope.options.types) {
                            opts.types = []
                            opts.types.push(scope.options.types)
                            scope.gPlace.setTypes(opts.types)
                        } else {
                            scope.gPlace.setTypes([])
                        }

                        if (scope.options.bounds) {
                            opts.bounds = scope.options.bounds
                            scope.gPlace.setBounds(opts.bounds)
                        } else {
                            scope.gPlace.setBounds(null)
                        }

                        if (scope.options.country) {
                            opts.componentRestrictions = {
                                country: scope.options.country
                            }
                            scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
                        } else {
                            scope.gPlace.setComponentRestrictions(null)
                        }
                    }
                }

                if (scope.gPlace == undefined) {
                    scope.gPlace = new google.maps.places.Autocomplete(element[0], {})
                }
                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    var result = scope.gPlace.getPlace();
                    if (result !== undefined) {
                        if (result.address_components !== undefined) {

                            scope.$apply(function () {

                                scope.details = result;
                                controller.$setViewValue(element.val());
                            });
                        }
                        else {
                            if (watchEnter) {
                                getPlace(result)
                            }
                        }
                    }
                })

                var locationInput = angular.element(document.getElementById('locations'))
                locationInput.bind('keyup keydown focus', function($event) {
                    if (scope.extraLocations) {
                        var extraLocations = document.getElementById("extraLocations")
                        if (extraLocations) {
                            angular.element(extraLocations).remove()
                            extraLocations = null
                        }
                        var googleTitle = document.getElementById('google-suggestion-title')
                        if (googleTitle) {
                            angular.element(googleTitle).remove()
                            googleTitle = null
                        }
                        var elementsHtml = '<div id="extraLocations"><div class="job-google-place-title">Your job locations</div><div id="defaultLocations">'
                        scope.extraLocations.forEach(function (location) {
                            var id = location.city ? location.city + ', ' + location.state : location.state
			    elementsHtml += '<div class="pac-item" id="' + id +'">' + id + '</div>'
                        })
                        elementsHtml += '</div></div>'
                        var container = document.getElementsByClassName("pac-container")[document.getElementsByClassName("pac-container").length-1]
                        var containerHeight = 250 + scope.extraLocations.length * 40
                        container.style.height = containerHeight + 'px'
                        if (container.className.indexOf('location-filter-container') < 0) {
                            container.className += " location-filter-container"
                        }
                        if (!extraLocations) {
                            angular.element(container).append($compile(angular.element(elementsHtml))(scope))
                        }
                        if (!googleTitle) {
                            angular.element(container).append($compile(angular.element('<div id="google-suggestion-title" class="job-google-place-title">Google Suggestions</div>'))(scope))
                        }
                        var defaultLocations = angular.element(document.getElementById("defaultLocations"))
                        if (defaultLocations) {
                            defaultLocations.bind('mousedown', function(event) {
                                document.getElementById('locations').value = event.target.id
                                var scope = angular.element(document.getElementById('locations')).scope()
                                scope.$apply(function() {
                                    scope.locations = event.target.id
                                })
                            })
                        }
                    }
                    if ($event.keyCode === 13) { //Prevent submitting form on enter
                        $event.preventDefault()
                    }
                })

                //function to get retrieve the autocompletes first result using the AutocompleteService
                var getPlace = function(result) {
                    var autocompleteService = new google.maps.places.AutocompleteService();
                    if (result){


                        autocompleteService.getPlacePredictions(
                            {
                                input: result.name,
                                offset: result.name.length
                            },
                            function listentoresult(list, status) {

                                if(list == null || list.length == 0) {

                                    scope.$apply(function() {
                                        scope.details = null;
                                    });

                                } else {
                                    var placesService = new google.maps.places.PlacesService(element[0]);
                                    placesService.getDetails(
                                        {'reference': list[0].reference},
                                        function detailsresult(detailsResult, placesServiceStatus) {

                                            if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                                                scope.$apply(function() {
                                                    controller.$setViewValue(detailsResult.formatted_address);
                                                    element.val(detailsResult.formatted_address);

                                                    scope.details = detailsResult;

                                                    //on focusout the value reverts, need to set it again.
                                                    var watchFocusOut = element.on('focusout', function(event) {
                                                        element.val(detailsResult.formatted_address);
                                                        element.unbind('focusout')
                                                    })

                                                });
                                            }
                                        }
                                    );
                                }
                            });
                    }
                }

                controller.$render = function () {
                    var location = controller.$viewValue;
                    element.val(location);
                };

                //watch options provided to directive
                scope.watchOptions = function () {
                    return scope.options
                };
                scope.$watch(scope.watchOptions, function () {
                    initOpts()
                }, true);

            }
        };
    }]);
