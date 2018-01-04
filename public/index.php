<!-- 
Improvements
 * Delete Data Row
 * Delete Data Table
 * Insert Tests
 * Insert Test Steps
 * Insert Data Row
 ** Keep Data Table columns in order with test steps
 * Remove drop down form formatting, or add back formatting for input areas
 ** resize min-width for multidropdown to placeholder length
 *** When using autocomplete, and clicking off (not selecting), multiselect does not get filled out
 *** Export is displaying 'dimmed' opt values
 * When writing a step, and 'createStep' is used, and fields don't get filled in with values, the input fields get those values
 -->
<html>
    <head>
        <title>Cucumber Parser</title>
        <script src="https://code.jquery.com/jquery-1.10.2.js"></script>
        <script src="https://code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
        <script src="https://harvesthq.github.io/chosen/chosen.jquery.js"></script>
        <script src="js/getSteps.js"></script>
        <script src="js/steps.js"></script>
        <script src="js/setup.js"></script>
        <script src="js/buildGherkin.js"></script>
        <script src="js/export.js"></script>
        <script src="props.js"></script>
        <script>
            console.log(testSteps);
        </script>
        
        <link rel="stylesheet"
            href="https://code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css">
        <link rel="stylesheet"
            href="https://harvesthq.github.io/chosen/chosen.css">
        <link rel="stylesheet" href="css/default.css">
    </head>
    <body>
        <input id='featTag' class='purple small' placeholder='Feature Tags' />
        <div id='featuredef' class='green'>
            Feature: <input class='green small' placeholder='Feature Title'
                type='text' /> <br />
            <textarea class='green' placeholder="Feature Description"></textarea>
        </div>
        <div id='backgrounddef' class='background'>
            <div class="green small">
                <span class='what'>Background:</span> <input class='green small'
                    placeholder='Background Title' type='text' /> <br />
                <textarea rows='1' placeholder='Background Description'></textarea>
            </div>
            <div class='testSteps'></div>
            <button onclick='addTestStep(this)'>Add Background Step</button>
        </div>
        <div id='tests'></div>
        <div style="position: fixed; bottom: 0px; width: 100%;">
            <p style="text-align: center;">
                <button onclick='addScenario()'>Add Scenario</button>
                <button onclick='download()'>Export as Feature File</button>
                <button onclick='getJIRACreds()'>Export to JIRA</button>
            </p>
        </div>
    
        <div id="download" title="Download Feature">
            <p>Note: this file will need to be renamed.</p>
            <p>Open in wordpad or np++ to preserve line breaks.</p>
        </div>
        <div id="jira-creds" title="JIRA Credentials">
            <form>
                <div>
                    <label for="jiraProj">JIRA Project</label> <input type="text"
                        name="jiraProj" id="jiraProj"
                        class="text ui-widget-content ui-corner-all" />
                </div>
                <div>
                    <label for="username">Username</label> <input type="text"
                        name="username" id="username"
                        class="text ui-widget-content ui-corner-all" />
                </div>
                <div>
                    <label for="password">Password</label> <input type="password"
                        name="password" id="password"
                        class="text ui-widget-content ui-corner-all" />
                </div>
            </form>
        </div>
    </body>
</html>