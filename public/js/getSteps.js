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

//our step functionality
function step() {
    this.string = arguments[0];
    this.inputs = [];
    for (var i = 1; i < arguments.length; i++) {
        this.inputs.push(arguments[i]);
    }
}
// our keypair functionality
function keypair(key, value) {
    this.key = key;
    this.value = value;
}
// our basic setup
var testSteps = [];
