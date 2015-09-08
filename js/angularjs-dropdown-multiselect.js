'use strict';

var directiveModule = angular.module('angularjs-dropdown-multiselect', []);

directiveModule.directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse',
    function ($filter, $document, $compile, $parse) {

        return {
            restrict: 'AE',
            scope: {
                selectedModel: '=',
                options: '=',
                extraSettings: '=',
                events: '=',
                searchFilter: '=?',
                translationTexts: '=',
                groupBy: '@'
            },
            template: function (element, attrs) {
                var checkboxes = attrs.checkboxes ? true : false;
                var groups = attrs.groupBy ? true : false;
                //var singleS = attrs.singles ? true : false;

                var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
                template += '<div class="dropdown-toggle" ng-click="toggleDropdown()"> <span class="caret"></span> {{getButtonText()}}&nbsp;</div>';
                template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }">';
                template += '<li ng-show="settings.toggler"><a id={{settings.allID}} data-ng-click="toggleSelection($event)"> {{texts.toggle}} <label ng-class=\'{labelActive: settings.allToggled,labelInactive: !settings.allToggled}\' for="{{settings.chkbxID}}"><input ng-hide=\'true\' id={{settings.chkbxID}} type="checkbox"/></label></a>';
                template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"> {{texts.checkAll}}</a>';
                template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"> {{texts.uncheckAll}}</a></li>';
                template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
                template += '<li ng-show="showDivider" class="divider"></li>';
                template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
                template += '<li ng-show="settings.enableSearch" class="divider"></li>';

                if (groups) {
                    template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
                    template += '<li ng-repeat-end role="presentation">';
                } else {
                    template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
                }

                template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp));dropClicked(option)">';

                if (checkboxes) {
                    template += '<div class="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp));dropClicked(option)">{{getPropertyForObject(option, settings.displayProp)}}<label ng-class=\'{labelActive: option.isChecked,labelInactive: !option.isChecked}\' for="id={{\'ID\'+$index}}"><input ng-hide=\'true\' id={{\'ID\'+$index}} class="checkboxInput" type="checkbox" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /></label></div></a>';
                    //template += '<div ng-show="!singleSelection" class="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp));dropClicked(option)">{{getPropertyForObject(option, settings.displayProp)}}<label ng-class=\'{labelActive: option.isChecked,labelInactive: !option.isChecked}\' for="id={{\'ID\'+$index}}"><input ng-hide=\'true\' id={{\'ID\'+$index}} class="checkboxInput" type="checkbox" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /></label></div></a>';
                } else if (checkboxes){
                    template += '<div class="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp));dropClicked(option)">{{getPropertyForObject(option, settings.displayProp)}}<label ng-class=\'{labelActiveSingle: option.isChecked,labelInactiveSingle: !option.isChecked}\' for="id={{\'ID\'+$index}}"><input ng-hide=\'true\' id={{\'ID\'+$index}} class="checkboxInput" type="checkbox" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /></label></div></a>';
                } else {
                    template += '<span data-ng-class="{\'glyphicon glyphicon-ok\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
                }

                template += '</li>';

                template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
                template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

                template += '</ul>';
                template += '</div>';

                element.html(template);
            },
            link: function ($scope, $element, $attrs) {
                var $dropdownTrigger = $element.children()[0];
                
                $scope.toggleSelection = function($event){
                    $scope.settings.allToggled = !$scope.settings.allToggled; 
                    if ($scope.settings.allToggled == true){
                        $scope.selectAll();
                        angular.forEach($scope.options, function(value, key) {
                            value.isChecked = true;
                        });
                    } else {
                        $scope.deselectAll();
                        angular.forEach($scope.options, function(value, key) {
                            value.isChecked = false;
                        });
                    }
                }

                $scope.toggleDropdown = function () {
                    $scope.open = !$scope.open;
                };

                $scope.checkboxClick = function ($event, id) {
                    $scope.setSelectedItem(id);
                    $event.stopImmediatePropagation();
                };

                $scope.externalEvents = {
                    onItemSelect: angular.noop,
                    onItemDeselect: angular.noop,
                    onSelectAll: angular.noop,
                    onDeselectAll: angular.noop,
                    onInitDone: angular.noop,
                    onMaxSelectionReached: angular.noop
                };

                function someFunction (){
                    console.log('all');
                }

                $scope.settings = {
                    toggler: true,
                    allToggled: false,
                    allID: '',
                    chkbxID: '',
                    showDivider: false,
                    dynamicTitle: true,
                    scrollable: false,
                    scrollableHeight: '300px',
                    closeOnBlur: true,
                    displayProp: 'uidisplayname',
                    idProp: 'id',
                    externalIdProp: '',
                    enableSearch: false,
                    selectionLimit: 0,
                    showCheckAll: false,
                    showUncheckAll: false,
                    closeOnSelect: false,
                    buttonClasses: 'btn btn-default dropdown',
                    closeOnDeselect: false,
                    groupBy: $attrs.groupBy || undefined,
                    groupByTextProvider: null,
                    smartButtonMaxItems: 2,
                    smartButtonTextConverter: angular.noop
                };

                $scope.texts = {
                    toggle: 'Všetci',
                    checkAll: 'Check All',
                    uncheckAll: 'Uncheck All',
                    selectionCount: 'Vybraný',
                    selectionOf: '/',
                    searchPlaceholder: 'Search...',
                    buttonDefaultText: 'Výrobcovia',
                    dynamicButtonTextSuffix: 'Vybraný'
                };

                $scope.searchFilter = $scope.searchFilter || '';

                if (angular.isDefined($scope.settings.groupBy)) {
                    $scope.$watch('options', function (newValue) {
                        if (angular.isDefined(newValue)) {
                            $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                        }
                    });
                }

                angular.extend($scope.settings, $scope.extraSettings || []);
                angular.extend($scope.externalEvents, $scope.events || []);
                angular.extend($scope.texts, $scope.translationTexts);

                $scope.singleSelection = $scope.settings.selectionLimit === 1;

                function getFindObj(id) {
                    var findObj = {};

                    if ($scope.settings.externalIdProp === '') {
                        findObj[$scope.settings.idProp] = id;
                    } else {
                        findObj[$scope.settings.externalIdProp] = id;
                    }

                    return findObj;
                }

                function clearObject(object) {
                    for (var prop in object) {
                        delete object[prop];
                    }
                }

                $scope.safeApply = function(fn) {
                    var phase = this.$root.$$phase;
                    if(phase == '$apply' || phase == '$digest') {
                        if(fn && (typeof(fn) === 'function')) {
                        fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                };

                if ($scope.singleSelection) {
                    if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                        clearObject($scope.selectedModel);
                    }
                }

                if ($scope.settings.closeOnBlur) {
                    $document.on('click', function (e) {
                        var target = e.target.parentElement;
                        var parentFound = false;

                        while (angular.isDefined(target) && target !== null && !parentFound) {
                            if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                                if(target === $dropdownTrigger) {
                                    parentFound = true;
                                }
                            }
                            target = target.parentElement;
                        }
                        
                        if (!parentFound) {
                            //$scope.$apply(function () {
                            $scope.safeApply(function(){
                                $scope.open = false;
                            });
                            //});
                            //if (!$scope.$$phase) {$scope.$apply(function(){$scope.open = false;});}
                        }
                        
                    });
                }

                $scope.getGroupTitle = function (groupValue) {
                    if ($scope.settings.groupByTextProvider !== null) {
                        return $scope.settings.groupByTextProvider(groupValue);
                    }

                    return groupValue;
                };

                $scope.getButtonText = function () {
                    if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                        if ($scope.settings.smartButtonMaxItems > 0) {
                            var itemsText = [];
                            if ($scope.singleSelection){
                                itemsText = $scope.selectedModel[0].uidisplayname;
                                return itemsText;
                            }
                            else {
                                angular.forEach($scope.options, function (optionItem) {
                                if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                                    var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                                    var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                                    itemsText.push(converterResponse ? converterResponse : displayText);
                                }
                            });

                            if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                                itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                                itemsText.push('...');
                            }
                            return itemsText.join(', ');
                            }
                            //console.log($scope.options);
                            
                        } else {
                            var totalSelected;

                            if ($scope.singleSelection) {
                                totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                            } else {
                                totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                            }

                            if (totalSelected === 0) {
                                return $scope.texts.buttonDefaultText;
                            } else {
                                return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                            }
                        }
                    } else {
                        return $scope.texts.buttonDefaultText;
                    }
                };

                $scope.getPropertyForObject = function (object, property) {
                    if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                        return object[property];
                    }

                    return '';
                };

                $scope.selectAll = function () {
                    $scope.deselectAll(false);
                    $scope.externalEvents.onSelectAll();

                    angular.forEach($scope.options, function (value) {
                        $scope.setSelectedItem(value[$scope.settings.idProp], true);
                    });
                };

                $scope.deselectAll = function (sendEvent) {
                    sendEvent = sendEvent || true;

                    if (sendEvent) {
                        $scope.externalEvents.onDeselectAll();
                    }

                    if ($scope.singleSelection) {
                        clearObject($scope.selectedModel);
                    } else {
                        $scope.selectedModel.splice(0, $scope.selectedModel.length);
                    }
                };

                $scope.setSelectedItem = function (id, dontRemove) {

                    var findObj = getFindObj(id);
                    var finalObj = null;

                    if ($scope.settings.externalIdProp === '') {
                        finalObj = _.find($scope.options, findObj);
                    } else {
                        finalObj = findObj;
                    }

                    if ($scope.singleSelection) {
                        angular.forEach($scope.options, function (value) {
                            value.isChecked = false;
                        });
                        $scope.selectedModel = [];
                        $scope.selectedModel.push(finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                        if ($scope.settings.closeOnSelect) $scope.open = false;

                        return;
                    }

                    dontRemove = dontRemove || false;

                    var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

                    if (!dontRemove && exists) {
                        $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                        $scope.externalEvents.onItemDeselect(findObj);
                    } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                        $scope.selectedModel.push(finalObj);
                        $scope.externalEvents.onItemSelect(finalObj);
                    }
                    if ($scope.settings.closeOnSelect) $scope.open = false;

                    if ($scope.selectedModel.length == $scope.options.length){
                        $scope.settings.allToggled = true;
                    }   else {$scope.settings.allToggled = false;}

                };

                $scope.dropClicked = function (item) {
                    item.isChecked = !item.isChecked;
                }

                $scope.isChecked = function (id) {
                    if ($scope.singleSelection) {
                        return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(id)[$scope.settings.idProp];
                    }

                    return _.findIndex($scope.selectedModel, getFindObj(id)) !== -1;
                };

                $scope.externalEvents.onInitDone();
            }
        };
}]);
