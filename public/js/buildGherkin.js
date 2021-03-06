/*
 * Copyright 2018 Coveros, Inc.
 *
 * This file is part of Gherkin Builder.
 *
 * Gherkin Builder is licensed under the Apache License, Version
 * 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function makeDynamic() {
    // make our testSteps sortable
    $(".test-steps").sortable({
        stop : function(event, ui) {
            buildTable($(ui.item).parent().parent());
        }
    });
    // make the scenarios sortable
    $("#tests").sortable({
        handle : ".what"
    });
    // make the tables (example data) sortable
    $("tbody").sortable();
    // setup our new dropdowns using the chosen plugin
    $('select').each(function() {
        var placeholder = $(this).attr('placeholder');
        if ($(this).parent().is("td")) {
            placeholder = " ";
        }
        if ($(this).attr('multiple') === 'multiple') {
            $(this).chosen({
                placeholder_text_multiple : placeholder,
                width : 'auto',
                disable_search_threshold : 4,
                inherit_select_classes : true,
            });
        } else {
            $(this).chosen({
                placeholder_text_single : placeholder,
                width : $(this).width() + 30,
                disable_search_threshold : 4,
                inherit_select_classes : true,
            });
        }
    });
    // allow editing of an any span
    $('span.any').dblclick(function() {
        var input = $("<input type='text' class='small' />").keyup(resizeInput).each(resizeInput).blur(function() {
            if ($(this).val() === "") {
                $(this).parent().html("...");
            }
        });
        $(this).html(input);
    });
    // allow the toggling an opt span
    $('span.opt').dblclick(function() {
        if ($(this).css('opacity') > 0.5)
            $(this).css({
                opacity : 0.2
            });
        else
            $(this).css({
                opacity : 1
            });
    });
    // keep the size of our input fields under control
    $('input.small').each(function() {
        $(this).keyup(resizeInput).each(resizeInput);
    });
    // keep the size of our textareas under control
    $('textarea').keyup(function() {
        $(this).attr('rows', ($(this).val().split("\n").length || 1));
    });

    // mark required fields in red
    $('.required').keyup(function() {
        checkRequired($(this));
    });

    // initialize the delete dialog
    $("#delete").dialog({
        autoOpen : false,
        modal : true
    });
}

function checkRequired(element) {
    if (element.val() === "") {
        element.addClass("red");
    } else {
        element.removeClass("red");
    }
    // check to see if all required things are filled in
    if ($('.red:visible').length) {
        $('#exportFile').button("disable");
        $('#exportJIRA').button("disable");
        $('button[name=linkButton]').button("disable");
    } else {
        $('#exportFile').button("enable");
        $('#exportJIRA').button("enable");
        $('button[name=linkButton]').button("enable");
    }
}

function fillTag(el) {
    if (typeof tags !== 'undefined' && tags.length > 0) {
        $(el).attr('placeholder', 'Choose an existing tag, or write your own...')
        $(el).autocomplete({
            minLength : 0,
            source : tags,
            select : function(event, ui) {
                addTag(el, ui.item.value);
                return false;
            },
        }).click(function() {
            $(this).autocomplete("search", "");
        });
    }
    $(el).keyup(function(e) {
        if (e.keyCode === 32 || e.keyCode === 13) {
            addTag(el);
        }
    }).blur(function() {
        addTag(el);
    });
}
function addTag(el, tag) {
    if (tag === "" || tag === undefined) {
        tag = $(el).val();
        if (tag === "") {
            return;
        }
    }
    // build the environment
    var span = $("<span>");
    span.html(tag);
    span.addClass('tag');
    span.click(function() {
        $(this).remove();
    });
    $(el).after(span);
    $(el).val("");
}

function addScenario(id) {
    var scenario = $("<div class='scenario'>");
    if (typeof id !== 'undefined') {
        scenario.attr('id', id);
    }
    var tags = $("<input class='purple small' placeholder='Scenario Tags'>");
    fillTag(tags);
    if (jiraOptions.project !== "") {
        var links = $("<input class='small jiralink' placeholder='JIRA Issue(s) Tested'>");
        fillLink(links);
    }
    var holder = $("<div class='green'>");
    var what = $("<span class='what'>");
    what.html("Scenario:");
    var title = $("<input class='green small required red' placeholder='Test Case Name' type='text' required>");
    var description = $("<textarea rows='1' placeholder='Test Case Description'>");
    var steps = $("<div class='test-steps'>");
    var addSteps = $("<button onclick='addTestStep(this)' class='ui-button ui-button-small'>");
    addSteps.html("Add Test Step");
    var addTable = $("<button onclick='addDataTable(this)' class='addTable ui-button ui-button-small' style='display:none;'>");
    addTable.html("Add Data Table");
    var deleteButton = $("<div class='delete' onclick='del(this)' style='top:33px;' title='Delete Scenario'><i class='fa fa-trash'></i></div>");
    holder.append(what).append(" ").append(title).append($("<br>")).append(description);
    scenario.append(links).append(tags).append(holder).append(steps).append(addSteps).append(addTable).append(deleteButton);
    $('#tests').append(scenario);
    makeDynamic();
}
function addTestStep(el) {
    var testStep = $("<div class='test-step'>");
    var editHolder = $("<div class='edit' onclick='edit(this)'>");
    editHolder.append($("<i class='fa fa-pencil-square-o'>"));
    var deleteHolder = $("<div class='delete' onclick='del(this)'>");
    deleteHolder.append($("<i class='fa fa-trash'>"));
    var select = $("<select class='blue' onchange='void(0);'>");
    select.append($("<option>"));
    select.append($("<option>Given</option>"));
    select.append($("<option>When</option>"));
    select.append($("<option>Then</option>"));
    testStep.append(editHolder).append(deleteHolder).append(select);
    $(el).parent().find('.test-steps').append(testStep);
    makeDynamic();
    fillStep(select, "");
}
function fillStep(el, initialVal) {
    $(el).next().nextAll().remove();
    var input = $("<input type='text' class='small' value='" + initialVal + "'/>");
    var autocompletes = [];
    for (var i = 0; i < testSteps.length; i++) {
        autocompletes.push({
            label : testSteps[i].string.stripTags(),
            value : testSteps[i].string,
            order : i
        });
    }
    input.autocomplete({
        minLength : 0,
        source : autocompletes,
        focus : function(event, ui) {
            input.val(ui.item.value.stripTags());
            return false;
        },
        select : function(event, ui) {
            fillVars(ui.item.order, $(this));
        },
    }).click(function() {
        $(this).autocomplete("search", "");
    }).blur(function() {
        createStep($(this));
    });
    $(el).next().after(input);
}

function createStep(el) {
    var newStep = $(el).val();
    var type = $(el).prev().prev();
    // Need to determine if this step matches something
    // Check each GWT, replace XXXX with (.*), and do a regex check
    // if any are a match, select it
    for (var i = 0; i < testSteps.length; i++) {
        var string = testSteps[i].string;
        var regex = string.replace(/<span class='opt'>(.*?)<\/span>/g, "($1)?");
        regex = regex.replace(/<span class='any'>(.*?)<\/span>/g, "(.*?)");
        regex = regex.replace(/XXXX/g, "(.*)");
        regex = regex.stripTags();
        regex = "^" + regex + "$";
        var res = newStep.match(regex);
        if (res !== null) {
            fillVars(i, el);
            var inputs = type.parent().children('input,select');
            for (var j = 1; j < res.length; j++) {
                if (res[j] === "XXXX") {
                    res[j] = "";
                }
                $(inputs).eq(j).val(res[j]);
                if ($(inputs).eq(j).is('select')) {
                    $(inputs).eq(j).trigger('chosen:updated');
                }
                buildTable(type.parent().parent().parent());
                makeDynamic();
            }
            return;
        }
    }
    type.next().nextAll().remove();
    var newStepPieces = newStep.split(/<|>/);
    newStep = "";
    for (i = 0; i < newStepPieces.length; i++) {
        newStep += "<span class='new'>" + newStepPieces[i] + "</span>";
        if (newStepPieces[i + 1]) {
            newStep += "<input id='" + rand(10) + "' type='text' class='small' onchange='buildTable(this)' placeholder='<" + newStepPieces[i + 1] + ">' class='new' />";
            i++;
        }
    }
    type.parent().append(newStep);
    buildTable(type.parent().parent().parent());
    makeDynamic();
}

function fillVars(order, el) {
    var testStepString = testSteps[order].string;
    var testStepInputs = testSteps[order].inputs;
    var testStepPieces = testStepString.split("XXXX");
    var type = $(el).prev();
    type.nextAll().remove();
    for (var i = 0; i < testStepPieces.length; i++) {
        type.parent().append("<span>" + testStepPieces[i] + "</span>");
        if (testStepInputs[i] !== undefined) {
            var objID = rand(10);
            if (Object.prototype.toString.call(testStepInputs[i].value) === '[object Array]') {
                var sel = $("<select id='" + objID + "' type='" + testStepInputs[i].key + "' onchange='buildTable(this)' placeholder='<" + testStepInputs[i].key + ">'></select>");
                if (testStepInputs[i].key.endsWith("List")) {
                    sel.attr("multiple", "multiple");
                    sel.append("<option></option>");
                } else {
                    sel.append("<option>&lt;" + testStepInputs[i].key + "&gt;</option>");
                }
                for (var j = 0; j < testStepInputs[i].value.length; j++) {
                    sel.append("<option>" + testStepInputs[i].value[j] + "</option>");
                }
                type.parent().append(sel);
            } else {
                type.parent().append("<input id='" + objID + "' type='" + testStepInputs[i].value + "' class='small' onchange='buildTable(this)' placeholder='<" + testStepInputs[i].key + ">' />");
            }
        }
    }
    buildTable(type.parent().parent().parent());
    makeDynamic();
}
function addDataTable(el) {
    addTable($(el).parent());
    buildTable($(el).parent());
}
function buildTable(testEl) { // el should be the test element
    if (!$(testEl).hasClass('scenario')) {
        testEl = $(testEl).parent().parent().parent();
    }
    if (!$(testEl).hasClass('scenario')) {
        return;
    }
    // add a table if needed
    if ($(testEl).find('.examples').length === 0) {
        addTable($(testEl));
        $(testEl).children('.addTable').show();
    }
    // get each variable from our test steps
    var variables = {};
    var scenario = $(testEl).children('.test-steps');
    scenario.children('.test-step').each(function() {
        $(this).children('input, select').each(function() {
            var placeholder;
            if ($(this).val() === null) {
                placeholder = $(this).attr('placeholder')
                if (placeholder.startsWith("<") && placeholder.endsWith(">")) {
                    variables[placeholder.substring(1, placeholder.length - 1)] = $(this).attr('id');
                }
                return;
            }
            if (Object.prototype.toString.call($(this).val()) === '[object Array]') {
                return;
            }
            if ($(this).hasClass('ui-autocomplete-input')) {
                return;
            }
            if ($(this).val() === "" && $(this).is("input")) {
                placeholder = $(this).attr('placeholder')
                variables[placeholder.substring(1, placeholder.length - 1)] = $(this).attr('id');
                return;
            }
            if ($(this).val().startsWith("<") && $(this).val().endsWith(">")) {
                placeholder = $(this).val();
                variables[placeholder.substring(1, placeholder.length - 1)] = $(this).attr('id');
                return;
            }
        });
    });
    var examples = scenario.parent().children('.examples');
    $(examples).each(function() {
        var example = $(this);
        // remove any columns that no longer exist in the variables
        var header = example.children('table').children('thead').children('tr');
        var headerVals = [];
        header.children('th').each(function() {
            headerVals.push($(this).html());
            if (!variables.hasOwnProperty($(this).html())) {
                var column = $(this).parent().children().index(this);
                example.find('tr').each(function() {
                    $(this).find("th:eq(" + (column - 1) + ")").remove();
                    $(this).find("td:eq(" + column + ")").remove();
                })
            }
        });
        // add in any new values that may be missing
        for ( var key in variables) {
            if ($.inArray(key, headerVals) === -1) {
                header.append("<th inheritFrom='" + variables[key] + "'>" + key + "</th>");
                example.children('table').children('tbody').children('tr').each(function() {
                    var cell = $("<td></td>");
                    var input = $("#" + variables[key]).clone();
                    input.removeAttr('id');
                    input.removeAttr('style');
                    input.removeAttr('onchange');
                    input.val('');
                    if (input.is("input")) {
                        input.removeAttr('placeholder');
                    }
                    if (input.is("select")) {
                        input.find(">:first-child").remove();
                    }
                    cell.append(input);
                    $(this).append(cell);
                });
            }
        }
    });

    makeDynamic();
    // rename our scenario type if needed
    var cols = examples.children('table').children('thead').children('tr').children('th');
    if (cols.length === 0) {
        examples.parent().children('.green').children('.what').html("Scenario:");
        examples.remove();
        $(testEl).children('.addTable').hide();
    }
}
function addTable(el) {
    // build our example table
    var exampleDiv = $("<div class='examples'>");
    var deleteButton = $("<div class='delete' onclick='del(this)' style='top:2px;' title='Delete Outline'><i class='fa fa-trash'></i></div>");
    var exampleTags = $("<input class='purple small' placeholder='Example Tags'>");
    fillTag(exampleTags);
    var exampleTitle = $("<div class='green'>Examples:</div>");
    var table = $("<table><thead><tr><td></td></tr></thead><tbody></tbody></table>");
    var addRowButton = $("<button onclick='addDataRow(this)' class='ui-button ui-button-small'>Add Data Row</button>");
    exampleDiv.append(deleteButton).append(exampleTags).append(exampleTitle).append(table).append(addRowButton);
    // add our example table
    $(el).append(exampleDiv);
    // tell the scenario to be an outline instead
    $(el).children('.green').children('.what').html("Scenario Outline:");
    // add an initial data row
    addDataRow($(el).children('.examples').last().children('table'));
}
function addDataRow(el) {
    var examples = $(el).parent();
    var body = examples.children('table').children('tbody');
    var cols = examples.children('table').children('thead').children('tr').children('th');
    var row = $("<tr><td class='error' onclick='del(this)' title='Delete Data Row' style='cursor:pointer;'><i class='fa fa-trash'></i></td></tr>");
    cols.each(function() {
        var cell = $("<td></td>");
        var input = $("#" + $(this).attr('inheritFrom')).clone();
        input.removeAttr('id');
        input.removeAttr('style');
        input.removeAttr('onchange');
        if (input.is("input")) {
            input.removeAttr('placeholder');
        }
        if (input.is("select")) {
            input.find(">:first-child").remove();
        }
        cell.append(input);
        row.append(cell);
    });
    body.append(row);
    makeDynamic();
}
function del(el) {
    $("#delete").dialog({
        buttons : {
            "Confirm" : function() {
                var tmp = $(el).parent().parent().parent()
                $(el).parent().remove();
                buildTable($(tmp));
                $('.required').each(function() {
                    checkRequired($(this));
                });
                $(this).dialog("close");
            },
            "Cancel" : function() {
                $(this).dialog("close");
            }
        }
    });

    $("#delete").dialog("open");
}
function edit(el) {
    var tmp = $(el).parent().parent().parent();
    var value = $(el).next().next().next().nextAll().html();
    fillStep($(el).next().next(), value);
    buildTable($(tmp));
}
