////////////////////////////////////////////////////////////////////////
//
// CAM6.js
//
// Copyright (c) 2013, Don Hopkins.
// All rights reserved.
//


////////////////////////////////////////////////////////////////////////
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation
// are those of the authors and should not be interpreted as representing
// official policies, either expressed or implied, of the FreeBSD Project.
//


/////////////////////////////////////////////////////////////////////////
//
// This code originally started life as a CAM6 simulator written in C
// and Forth, based on the original CAM6 hardware and compatible with
// the brilliant Forth software developed by Toffoli and Margolus. But
// then it took on a life of its own (not to mention a lot of other CA
// rules), and evolved into supporting many other cellular automata
// rules and image processing effects. Eventually it was translated to
// C++ and Python, and then more recently it has finally been
// rewritten from the ground up in JavaScript.
//
// The CAM6 hardware and Forth software for defining rules and
// orchestrating simulations is thoroughly described in this wonderful
// book by Tommaso Toffoli and Norman Margolus of MIT.
//
// Cellular Automata Machines: A New Environment for Modeling
// Published April 1987 by MIT Press. ISBN: 9780262200608.
// http://mitpress.mit.edu/books/cellular-automata-machines
// http://books.google.com/books?id=HBlJzrBKUTEC&printsec=frontcover
// http://www.researchgate.net/publication/44522568_Cellular_automata_machines__a_new_environment_for_modeling__Tommaso_Toffoli_Norman_Margolus
//
// From the forward of Cellular Automata Machines:
//
// Recently cellular automata machines, with size, speed, and
// flexibility for general experimentation at moderate cost, have
// become available to the scientific community. These machines
// provide a laboratory in which the ideas presented in this book can
// be tested and applied to the syntghesis of a great variety of
// systems. Computer scientists and researchers interested in modeling
// and simulation as well as other scientists who do mathematical
// modeling will find this introduction to cellular automata and
// cellular automata machines (CAM) both useful and timely.
//
// Cellular automata are the computer scientist's counterpoint to the
// physicist's concept of a "field." They provide natural models for
// many investigations in physics, combinatorial mathematics, and
// computer science that deal with systems extended in space and
// evolving in time according to local laws. A cellular automata
// machine is a computer optimized for the simulation of cellular
// automata. Its dedicated architecture allows it to run thousands of
// times faster than a general purpose computer of compatible cost
// programmed to do the same task. In practical terms this permits
// intensive interactive experimentation and opens up new fields of
// research in distributed dynamics including applications involving
// parallel computation and image processing.
//
// Contents: Introduction, Cellular Automata, The CAM Environment, A
// Live Demo, The Rules of the Game, Our First Rules, Second Order
// Dynamics, Neighbors and Neighborhoods, Randomness and Probabilistic
// Rules, A Sampler of Techniques, Identity and Motion,
// Pseudo-Neighbors, The Magolus Neighborhood, Symptoms vs. Causes,
// Reversibility, Diffusion and Equilibrium, Fluid Dynamics,
// Collective Phenomena, Ballistic Computation, A Minimal Forth
// Tutorial, Basic CAM Architecture.
//
// Tommaso Toffoli and Norman Margolus are researchers at the
// Laboratory for Computer Science at MIT. Celular Automata is
// included in the Scientific Computation Series, edited by Dennis
// Gannon.
//
// Cover image: Phase waves in an excitable medium with latency. The
// system provides a model for the Zhabotinsky reaction.
//
// About the Authors:
//
// Tommaso Toffoli is a researcher at the Laboratory for Computer
// Science at MIT.
//
// Norman Margolus is a researcher at the Laboratory for Computer
// Science at MIT.
//


////////////////////////////////////////////////////////////////////////
//
// Architecture and Features:
//
// Type Definitions:
//
//     This code is built with a general purpose dynamic JavaScript
//     type definition system, using a function called
//     defineType(name, scope, indexGetFunction, indexKeys,
//     objects). Types use dictionaries to represent and keep track of
//     sets of similar objects. Each type has a metaData dictionary
//     that stores all that is known about the type in one place,
//     including an array of all objecs of that type, indexes of
//     objects by various keys, and functions to add and remove
//     indexes and objects, and other stuff pertaining to the
//     type. Type specific functions are also defined in the scope of
//     the type (i.e. the prototype of the class in which the type is
//     defined).
//
//     Types can be used as simple enumerated types, each possible
//     value represented by an object dictionary, which can
//     also have any arbitrary JavaScript data attached to it,
//     like human readable names and descriptions to be used
//     in the user interface, or additional representations and
//     values used by the code.
//
// The following types are defined:
//
//     paramMetaData:
//
//         Metadata about each of the parameter values that the user
//         can change to configure the simulation, drawing tool, rules,
//         etc. Changes to these values can be recorded and played
//         back in scripts, and user interfaces for editing the
//         values are automatically generated, and updated when
//         the corresponding values change. The metadata contains
//         functions to return human readable values and descriptions,
//         and convert back and forth between the parameter
//         representation and the user interface widget representation.
//
//     neighborhood:
//
//         A neighbordhood originally corresponded to one of the hardware
//         cellular automata neighborhoods built into the CAM6. But it has
//         been generalized and extended to be a parameterizable technique
//         for iterating over the cells and transforming the previous
//         state to the new state.
//
//         Neighborhoods can be programmed to directly compute one
//         particular cellular automata rule (like 'Life', in which case
//         there will be one or few corresponding rules that use it), or
//         they may be more parameterizable and general purpose, like a
//         look-up table (in which case there may be many different
//         rules that use it.)
//
//         There are several lookup-table based neighborhoods that
//         emulate the original CAM6 neighborhoods (Moore, VonNeumann,
//         Margolus), and other neighborhoods that compute their rules
//         directly (Marble, Life, Brain).
//
//     rule:
//
//         A rule uses and paramterizes one particular neighborhood.
//         Rules are tightly coupled with their neighborhoods (although
//         it's possible to define different compatible neighborhoods
//         configured by the same rules, but currently each rule is bound
//         to exacty one neighborhood). The rules can parameterize the
//         neighborhood in many different ways. The set of possible parameters
//         depend on the neighborhood, but some are standardized across
//         neighborhoods when they make sense.
//
//         Even Neighboods that don't have any parameters must have at
//         least one rule, otherwise they won't show up in the user
//         interface as a rule with a name, description, etc.
//
//         Some neighborhood parameters are statically configured by the
//         rule, and others can be dynamically configured by the user at
//         run-time during the simulation, via the user interface.
//
//         Neighborhoods can also combine more than one kind of cellular
//         automata rule or image processing effect in parallel, which may
//         be enabled/disabled and configured by parameters in the rules
//         that use the neighborhood. For example, many of the
//         neighborhoods that don't use all eight bits of the cell also
//         have the options of using those bits for "Echo" (which shifts
//         the old lower bit values of the cell up into the higher bits,
//         to create a colorful trail), or "Heat" (which runs a heat
//         diffusion simulation in the upper bits of the cell, and allows
//         the cell value to bleed into the lower bits of the heat
//         diffusion simulation, so "heat pollution" can spread from the
//         cells, and the cellular automata and heat diffusion may
//         interact with each other).
//
//     colorMap:
//
//         Eight bit RGBA color maps with 256 entries for displaying
//         the 8 bit cell values.
//
//     tool:
//
//         Editing tools for drawing in the cells.
//
//     analyzer:
//
//         Cell and video analyzers, for webcam head tracking, etc.
//
//     command:
//
//         Commands triggered by pressing buttons, and recorded and
//         played back in scripts.
//
//     hint:
//
//         Usage hints shown to help users.
//
//     chapter:
//
//         Chapters of the dynamically generated documentation.
//
//     compositionFunction:
//
//         Functions for composing a 32 bit RGBA canvas graphics into
//         the 8 bit cells. Makes it possible to apply the canvas 2d
//         drawing api into the cells, or render images, HTML, SVG,
//         WebGL graphics, etc, into the cells.
//
//     image:
//
//         Images for use in the user interface.
//
//     lineCap:
//
//         An enumerated type of line caps, used by some of the
//         drawing tools.
//
//     playMode:
//
//         An enumerated type of script playback modes.
//
//     recordMode:
//
//         An enumerated type of script recording modes.
//
// Dynamic User Interface Generation
//
// Script Recording and Playback
//
// Code Templates with Slots and Inlining and Conditionals.
//
// Optimization Techniques
//
//   Extra copying is eliminated by swapping between two cell buffers,
//   one for the past and the other for the future. After applying the
//   rule, the past cell buffer becomes the future, and the future
//   becomes the past.  It's necessary to have two buffers, because
//   you can't apply cellular automata in-place in one buffer, since
//   you would stomp on your past neighbors whose future you just
//   computed, since the neighbors above and to the right would be
//   from the future instead of the past.
//
//   Edge conditions eliminated from inner loop by making cell buffers
//   two cells wider and taller, and wrapping edges around to the
//   extra edge cells before applying rule, so the inner loop does not
//   have to check for edge conditions to wrap the cells, and other
//   edge treatments can be applied besides wrapping, like clamping or
//   reflecting.
//
//   Index table lookup based rules, that allow you to define rules in
//   JavaScript in terms of their neighbors, which are then applied to
//   every possible combination of neighbor states, to generate a
//   lookup table that is used by the neighborhood to evaluate the
//   rule without running a lot of JavaScript code. This is how the
//   CAM6 hardware works, and the rule tables are compatible with its
//   rule tables. The hardware concatinates the bits of the neighbors
//   into an index that is used to look up the next cell value in the
//   lookup table. It's not clear if this is actually any faster in
//   software, because it's a software emulation of a hardware
//   optimization, and depends a lot on the rule and the code that
//   implements it, but at least it lets you write your rule
//   definitions clearly without worrying about efficiency, and also
//   translate the Forth rules defined in the Cellular Automata
//   Machine to JavaScript (or use old rule tables generated by Forth
//   if you can find them), and run them in the simulator.
//
//   JavaScript code templates for neighborhood functions, rules,
//   tools, colormap generators, etc, with slots that let rules inject
//   custom code into the inner loop, disable unnecessary code,
//   calculate parameters, inline constants, etc. This enables
//   neighborhoods to be much more general purpose, and not only
//   deeply parameterizable but also arbitrarily extensible,
//   supporting complex rule definition, as well as real time analysis
//   and event reporting (like the cell value histogram). And it also
//   enabled users to play around with writing their own rules and
//   modifying and extending existing ones, and they will still run
//   efficiently.
//
////////////////////////////////////////////////////////////////////////
//
// TODO (or work in progress):
//
// Save/Restore presets. Need a server side to share scripts
// and presets.
//
// Presets have links to other related presets that are pleasing to
// switch between.
//
// Rules have lists of presets for that rule.
//
// Rules has links to other rules that are pleasing to switch beween.
//
// Pie menus for controling the simulator, selecting and configuring
// drawing tools, arranging directionally oriented commands, with
// pull-out linear parameters and lists of enumerations and presets.
//
// Record and play back sessions. Play multiple tracks at once. Record
// and iterate layers on top of existing tracks. Turn on and off
// tracks and properties of tracks. Time offset and scale tracks.
// Repeat mode: loop, bounce, hold, etc.
//
// Networked multi player jam sessions, built on top of recording
// and playing back sessions.
//
// Musical beat detection, pitch tracking, video head tracking, and
// other real time audio and video analyzers as parameters to rule
// neighborhoods, convolution kernel phase selection, editing tools,
// simulation parameters, etc.
//
// A puff box pixel editor and visual keyboard stamp pad editor like
// Scott Kim's Viewpoint thesis.
//
// An image drawing tool that can import any image or svg graphic with
// or without an alpha channel, and drag it around over the cells,
// stretch, rotate, tile, etc, adjust its composition function, so it
// draws into the cells in various ways. It also can import video like
// YouTube videos, svg or html animations, webcams, streaming video,
// etc, and render them into the cells through various transforms,
// processing and composition effects.
//
// Stream out live video of CA simulation via WebRTC. Stream in live
// editing commands from other users for collaborative network
// jamming.
//
// Plug-in editing tools specialize the image/video drawing tool,
// and dynamically draw into a 32 bit canvas, then the canvas is
// transformed and rendered from 32 bit to 8 bits via a plug-in
// rendering transform, which can be parameterized by the drawing
// tool presets. Channel R, G, B, A, C, M, Y, K, combinations of
// channels like average, max, min, Chroma keying, Threshold,
// write masked with alpha, add masked with alpha, shifting
// and masking and permuting bits, mapping colors to bitplanes,
// clearing, setting, arbitrary JavaScript expression, etc.
//
// Reified editing tools are represented by on-screen objects
// overlaying the cells, so you can drag mutiple tools from a
// palette of presets onto the cells at once, move them by
// dragging, adjust them via various direct manipulations,
// pie menus, control panels, etc.
//
// Make sensor tools that you can drag over the cells, or over
// the histogram, that have an x, y location, velocity and other
// physics simulation parameters, a scope (cells or histogram or
// other data visualizations), and and scriptable api to drive
// them around in their space like a vehicle or turtle,
// to analize and modify the cells at its position, to invoke
// any drawing tool or rule preset at their current position, or
// apply any parameter preset or delta, or execute arbitrary
// JavaScript code, which can set paramers and make calls back
// into the simulator.
//
// Make a visual data flow programming language that's extensible
// in JavaScript, that lets you plug together sensors and controllers
// into circuits to orchestrate the simulation in response to data
// analysis and user input.
//
// Create screen savers responsive to music.
//


////////////////////////////////////////////////////////////////////////


(function() {


    ////////////////////////////////////////////////////////////////////////
    // Utility functions.


    // _getCallerLog returns a string with the name of the log function
    // that called it (i.e. LOG, WARNING, ERROR), followed by a string
    // specifying the file and line number of the code that called the
    // logging function, in a format that turns into a link in the
    // Chrome debugger, so you can click on it to jump to the place
    // in the code that wrote the log message.
    function _getCallerLog() {
        try {
            throw Error('');
        } catch (err) {
            var stackLines = err.stack.split('\n');
            var loggerLine = stackLines[4];
            var loggerIndex = loggerLine.indexOf('at ');
            var loggerName = loggerLine.slice(loggerIndex + 3, loggerLine.length).split(' ')[0];
            var callerLine = stackLines[5];
            var callerIndex = callerLine.indexOf('at ');
            var callerSource = callerLine.slice(callerIndex + 3, callerLine.length);
            var callerLog = loggerName + ': ' + callerSource;
            return callerLog;
        }
    }


    // _log is the core of the logging function, which in chrome prints
    // its arguments out as objects you can click on and browse, but
    // in other browsers concatinates them and prints them out as
    // strings.
    function _log() {

        var args = [_getCallerLog()];

        for (var argumentIndex = 0, argumentCount = arguments.length;
             argumentIndex < argumentCount;
             argumentIndex++) {

            args.push(
                arguments[argumentIndex]);

        }

        if (navigator.userAgent.indexOf('Chrome') != -1) {
            console.log.apply(console, args);
        } else {
            console.log(args.join(' '));
        }

    }


    // LOG writes a log message to the console.
    function LOG() {
        _log.apply(this, arguments);
    }


    // WARNING writes a warning message to the console.
    function WARNING() {
        _log.apply(this, arguments);
    }


    // ERROR writes an error message to the console.
    function ERROR() {
        _log.apply(this, arguments);
    }


    // shave rounds a number to a reasonable accuracy.
    function shave(value) {
        return Math.floor(value * 1000) / 1000;
    }


    // identity returns its parameter.
    function identity(value) {
        return value;
    }


    // intToString converts an int to a string.
    function intToString(value) {
        return value + '';
    }


    // stringToInt converts a string to an int.
    function stringToInt(value) {
        var int = parseInt(value);
        if (isNaN(int)) {
            int = 0;
        }
        return int;
    }


    // floatToString converts a float to a string.
    function floatToString(value) {
        return value + '';
    }


    // stringToFloat converts a string to a float.
    function stringToFloat(value) {
        var float = parseFloat(value);
        if (isNaN(float)) {
            float = 0;
        }
        return float;
    }


    // hex2 converts a byte to two digit hex.
    function hex2(value) {
        var hex =
            ((value < 10) ? '0x0' : '0x') +
            value.toString(16).toUpperCase();
        return hex;
    }


    // Return the next id, a unique number.
    var _nextID = 1;
    function nextID() {
        return _nextID++;
    }


    // JSONtoDOM converts a JSON structure to DOM nodes.
    function JSONtoDOM($el, label, json, importantKeys, ignoreKeys) {

        //LOG('JSONtoDOM', ['$el', $el, 'label', label, 'json', json, 'importantKeys', importantKeys, 'ignoreKeys', ignoreKeys]);

        var $node =
            $('<div/>')
                .addClass('cam6-jsonNode')
                .appendTo($el);

        var $nodeLabel =
            label
                ? $('<div/>')
                    .addClass('cam6-jsonNodeLabel')
                    .text(label + ':')
                    .appendTo($node)
                : null;

        var $nodeDescription =
            $('<div/>')
                .addClass('cam6-jsonNodeDescription')
                .appendTo($node);

        var isArray = $.isArray(json);
        var isPlainObject = $.isPlainObject(json);
        var isFunction = $.isFunction(json);

        if (isArray || isPlainObject) {

            var $children =
                $('<div/>')
                    .addClass('cam6-jsonNodeChildren')
                    .appendTo($node);

            if ($.isArray(json)) {

                $node
                    .addClass('cam6-jsonNodeArray');

                $nodeDescription
                   .text('Array length ' + json.length);

                for (var arrayIndex = 0, arrayCount = json.length;
                     arrayIndex < arrayCount;
                     arrayIndex++) {

                    var value = json[arrayIndex];

                    JSONtoDOM(
                        $children,
                        '' + arrayIndex,
                        value,
                        null);

                }

            } else if ($.isPlainObject(json)) {

                $node
                    .addClass('cam6-jsonNodeObject');

                var keys =
                    getSortedKeys(
                        json,
                        importantKeys,
                        ignoreKeys);

                $nodeDescription
                   .text('Object size ' + keys.length + ':');

                for (var keyIndex = 0, keyCount = keys.length;
                     keyIndex < keyCount;
                     keyIndex++) {

                    var key = keys[keyIndex];
                    var value = json[key];

                    JSONtoDOM(
                        $children,
                        '' + key,
                        value,
                        null);

                }

            }

        } else if ($.isFunction(json)) {

            $node
                .addClass('cam6-jsonNodeFunction');

            $nodeDescription
               .text(json.toString());

        } else {

            $node
                .addClass('cam6-jsonNodeOther');

            var description = typeof(json) + ' ';;

            if (json === undefined) {
                description += 'undefined';
            } else if (json === null) {
                description += 'null';
            } else if (json.toString) {
                description += json.toString();
            } else {
                description += '' + json;
            }

            $nodeDescription
               .text(description);

        }

    }


    // getSortedKeys takes a dict and an array of important keys,
    // and returns the important keys in the order they appear in
    // the dict, and the other keys following in sorted order.
    function getSortedKeys(dict, importantKeys, ignoreKeys) {

        var dict = $.extend({}, dict);
        var keys = [];

        if (importantKeys) {

            for (var i = 0, n = importantKeys.length;
                 i < n;
                 i++) {

                var importantKey = importantKeys[i];

                if (importantKey in dict) {
                    keys.push(importantKey);
                    delete dict[importantKey];
                }

            }

        }

        var otherKeys = [];

        for (var key in dict) {
            if ($.inArray(key, ignoreKeys) < 0) {
                otherKeys.push(key);
            }
        }

        otherKeys.sort();

        for (var i = 0, n = otherKeys.length;
             i < n;
             i++) {
            var otherKey = otherKeys[i];
            keys.push(otherKey);
        }

        return keys;
    }


    // curveWidgetValueToParamValue converts from a widget value to a
    // param value curve with a dead area for zero in the middle, and
    // more precision around zero.
    function curveWidgetValueToParamValue(paramMetaData, widgetValue, paramValueScale, widgetValueScale, widgetValueGap) {

        var sign = (widgetValue < 0) ? -1 : 1;

        if (widgetValue < -widgetValueGap) {
            widgetValue += widgetValueGap;
        } else if (widgetValue > widgetValueGap) {
            widgetValue -= widgetValueGap;
        } else {
            widgetValue = 0;
        }

        var paramValue = widgetValue / (widgetValueScale - widgetValueGap);
        paramValue = paramValue * paramValue * sign * paramValueScale;

        //LOG('curveWidgetValueToParamValue', ['paramMetaData', paramMetaData, 'target', target, 'widgetValue', widgetValue, 'paramValue', paramValue]);

        return paramValue;
    }


    // uncurveParamValueToWidgetValue reverses the effect of
    // curveWidgetValueToParamValue.
    function uncurveParamValueToWidgetValue(paramMetaData, paramValue, paramValueScale, widgetValueScale, widgetValueGap) {

        var sign = (paramValue < 0) ? -1 : 1;
        var widgetValue = Math.abs(paramValue / paramValueScale);
        widgetValue = Math.sqrt(widgetValue) * sign * (widgetValueScale - widgetValueGap);

        if (widgetValue < 0) {
            widgetValue -= widgetValueGap;
        } else if (widgetValue > 0) {
            widgetValue += widgetValueGap;
        }

        //LOG('uncurveParamValueToWidgetValue', 'paramValue', paramValue, 'widgetValue', widgetValue);

        return widgetValue;
    }


    // Take an array of context dictionaries, and return a
    // function that evaluates a string in those contexts.
    // I fully realize how horrible this code is, and that
    // it only supports up to ten contexts. I feel terrible
    // about it, as I should, but I would feel even worse
    // if it were impossible to do this. But isn't there
    // a simpler way to do this is JavaScript? Maybe I
    // could use __proto__ inheritence, but I was hoping
    // to avoid.
    function evalInContextsFunction(_contexts) {
        var _contextCount = _contexts.length;
        if (_contextCount == 0) {
            return function evalInContexts(_text) {return eval(_text)};
        }
        with (_contexts[0] || {}) {
            if (_contextCount == 1) {
                return function evalInContexts(_text) {return eval(_text)};
            }
            with (_contexts[1] || {}) {
                if (_contextCount == 2) {
                    return function evalInContexts(_text) {return eval(_text)};
                }
                with (_contexts[2] || {}) {
                    if (_contextCount == 3) {
                        return function evalInContexts(_text) {return eval(_text)};
                    }
                    with (_contexts[3] || {}) {
                        if (_contextCount == 4) {
                            return function evalInContexts(_text) {return eval(_text)};
                        }
                        with (_contexts[4] || {}) {
                            if (_contextCount == 5) {
                                return function evalInContexts(_text) {return eval(_text)};
                            }
                            with (_contexts[5] || {}) {
                                if (_contextCount == 6) {
                                    return function evalInContexts(_text) {return eval(_text)};
                                }
                                with (_contexts[6] || {}) {
                                    if (_contextCount == 7) {
                                        return function evalInContexts(_text) {return eval(_text)};
                                    }
                                    with (_contexts[7] || {}) {
                                        if (_contextCount == 8) {
                                            return function evalInContexts(_text) {return eval(_text)};
                                        }
                                        with (_contexts[8] || {}) {
                                            if (_contextCount == 9) {
                                                return function evalInContexts(_text) {return eval(_text)};
                                            }
                                            with (_contexts[9] || {}) {
                                                if (_contextCount == 10) {
                                                    return function evalInContexts(_text) {return eval(_text)};
                                                }
                                                LOG('functionWithContexts: Too many _contexts! Max of 10.', ['_contextCount', _contextCount, '_contexts', _contexts]);
                                                return null;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    function groupPieItemsIntoSlices(slices, items)
    {
        var groupToSlice = {};
        for (var i = 0, n = slices.length;
             i < n;
             i++) {
            var slice = slices[i];
            if (slice.group) {
                groupToSlice[slice.group] = slice;
            }
        }

        for (var i = 0, n = items.length;
             i < n;
             i++) {
            var item = items[i];
            var group = item.group || 'default';
            var slice = groupToSlice[group] || groupToSlice['default'];
            if (slice) {
                slice.items.push(item);
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////
    // Define a new type of object.
    //
    // defineType(name, scope, indexGetFunction, indexKeys, objects)
    //
    //     name: A string, which should be a singular noun,
    //     that will be used as the base of various keys defined
    //     in the scope and the type_metaData dictionary.
    //
    //     scope: A dictionary that is where the type will be
    //     defined, which is usually the prototype of a class.
    //
    //     indexGetFunction: a function indexGetFunction(type_metaData,
    //     indexKey, key, object_by_key), or null to use the default
    //     behavior, which gets objectDict = object_by_key[key],
    //     and then delegates to the object's
    //     handleIndexGetFunction(type_metaData, indexKey, key,
    //     object_by_key) if it's defined. The type_metaData parameter
    //     is the object type dictionary of metadata about the
    //     type. The indexKey is a string key by which the object
    //     is indexed by for key indexes, or null if the object is
    //     being looked up in type_objects by its numeric index. The
    //     key is the value of the object's index key, or its numeric
    //     index in type_objects. The object_by_key is the index
    //     containig the object to look up. The indexGetFunction
    //     should look up the object, perform any initialization, and
    //     return it (or a different object, if desired). The is the
    //     dict that represents a member of the type.
    //
    //     indexKeys: a list of key names that are to be indexed,
    //     or null for no indexes. You can add or remove more keys
    //     later if you like.
    //
    //     objects: a list of object dictionaries to add to the
    //     type, or null. You can add or remove more objects later
    //     if you like.
    //
    // As a result of defining a type, the scope (usually the prototype
    // of an object class) will have the following keys defined in it:
    //
    //     <name>_objects: A list of all objects of the type.
    //
    //     <name>_indexKeys: A list of key strings under which the
    //     object is indexed.
    //
    //     <name>_indexes: A dictionary of object indexes.
    //
    //     <name>_<indexKey>: A dictionary indexing the objects by
    //     <key> by their <indexKey>.
    //
    //     get_<name>_by_<indexKey>: A function(key) that returns the
    //     object whose <indexKey> is <key>, after calling the type's
    //     indexGetFunction on it, if defined.
    //
    //     get_<name>_by_index: A function(index) that return the
    //     object whose index is <index>, after calling the type's
    //     indexGetFunction on it, if defined.
    //
    //     <name>_count: A function() that returns the count of objects
    //     of the type.
    //
    //     <name>_metaData: A dictionary of type metaData, all you need to
    //     know about the type in one place, including the following
    //     keys for values and functions:
    //
    //         name: The type name.
    //
    //         scope: The scope in which this type is defined.
    //
    //         indexGetFunction: A function(type_metaData, indexKey,
    //         key, object_by_key) that gets the object from the index
    //         and prepares it, and returns the object found (or
    //         another object if desired) to the caller.
    //
    //         type_objects: A list of objects of the type.
    //
    //         type_indexKeys: A list of key strings under which
    //         the objects are indexed.
    //
    //         type_indexes: A dictionary with keys under which the
    //         objects are indexed, whose values are index dicts.
    //         The keys of the index dicts are the value of the
    //         object's indexKeys, and the corresponding values are
    //         the objects. The index keys of each object must be
    //         unique.
    //
    //         addIndexKey: A function(indexKey) that takes an
    //         indexKey string to add to the type.
    //
    //         addIndexKeys: A function(indexKeys) that takes an array
    //         of indexKey strings to add to the type.
    //
    //         removeIndexKey: A function(indexKey) that removes the
    //         indexKey from the type.
    //
    //         addObjects: A function(objects) that adds objects to
    //         the type.
    //
    //         updateAllObjectIndexKeys: Updates the object indexes
    //         with the keys of the objects. Call this after calling
    //         addIndexKey or addIndexKeys.
    //
    //         addObject: A function(object) that adds an object to
    //         the type.
    //
    //         removeObject: A function(object) that removed an object
    //         from the type.
    //
    //         type_by_<indexKey>, <name>_by_<indexKey>: a
    //         function(key) that returns the object whose <indexKey>
    //         is <key>.
    //
    //         get_type_by_<indexKey>, get_<name>_by_<indexKey>: a
    //         function(key) that returns the object whose <indexKey>
    //         is <key>, after calling the indexGetFunction on it to
    //         prepare it.
    //
    //         get_type_by_index, get_<name>_by_index: a
    //         function(index) that returns the object whose numeric
    //         index is <indez>, after calling the indexGetFunction on
    //         it to prepare it.
    //
    //         type_count: A function() that returns the number of
    //         objects of the type.
    //
    function defineType(
        name,
        scope,
        indexGetFunction,
        indexKeys,
        objects) {

        var type_objects = [];
        var type_indexKeys = [];
        var type_indexes = {};
        var type_metaData = {
            name: name,
            scope: scope,
            indexGetFunction: indexGetFunction,
            type_objects: type_objects,
            type_indexKeys: type_indexKeys,
            type_indexes: type_indexes
        };

        scope[name + '_metaData'] = type_metaData;
        scope[name + '_objects'] = type_objects;
        scope[name + '_indexKeys'] = type_indexKeys;
        scope[name + '_indexes'] = type_indexes;

        // get_type_by_index takes a numeric index, and returns the
        // corrsponding object, after calling the type's
        // indexGetFunction on it, if defined.
        function get_type_by_index(index) {

            var object;

            if (type_metaData.indexGetFunction) {

                object = type_metaData.indexGetFunction.call(
                    this, type_metaData, null, index, type_metaData.type_objects, object);

            } else {

                object = type_metaData.type_objects[index];
            }

            return object;

        }

        type_metaData['type_by_index'] = type_objects;
        type_metaData['get_type_by_index'] = get_type_by_index;
        scope['get_' + name + '_by_index'] = get_type_by_index;

        // type_count returns the number of objects of the type.
        function type_count() {
            return type_metaData.type_objects.length;
        }

        type_metaData['type_count'] = type_count;
        scope[name + '_count'] = type_count;

        // addIndexKeys takes an array of indexsKey strings and adds
        // them to the type. After calling this, if there are already
        // any objects, you must call updateAllObjectIndexKeys().
        function addIndexKeys(indexKeys) {

            for (var indexKeyIndex = 0, indexKeyCount = indexKeys.length;
                 indexKeyIndex < indexKeyCount;
                 indexKeyIndex++) {

                var indexKey = indexKeys[indexKeyIndex];
                type_metaData.addIndexKey(indexKey);

            }

        }

        type_metaData['addIndexKeys'] = addIndexKeys;

        // addIndexKey takes an indexKey string and adds it to the type.
        // After calling this, if there are already any objects, you
        // must call updateAllObjectIndexKeys().
        function addIndexKey(indexKey) {

            var object_by_key = {};

            type_metaData.type_indexes[indexKey] = object_by_key;
            type_metaData['type_by_' + indexKey] = object_by_key;
            type_metaData[name + '_by_' + indexKey] = object_by_key;
            type_metaData.scope[name + '_by_' + indexKey] = object_by_key;

            // get_object_by_key takes a key and returns the object
            // in the indexKey indexes whose corresponding key's value
            // is key, after calling the type's indexGetFunction on
            // it, if defined.
            function get_object_by_key(key) {

                var objectDict;

                if (type_metaData.indexGetFunction) {

                    objectDict =
                        type_metaData.indexGetFunction.call(
                            this, type_metaData, indexKey, key, object_by_key);

                } else {

                    objectDict =
                        object_by_key[key];

                }

                if (objectDict &&
                    objectDict.handleIndexGetFunction) {

                    objectDict.handleIndexGetFunction.call(
                        this, type_metaData, indexKey, key, object_by_key, objectDict);

                }

                return objectDict;

            }

            type_metaData['get_type_by_' + indexKey] = get_object_by_key;
            type_metaData['get_' + name + '_by_' + indexKey] = get_object_by_key;
            scope['get_' + name + '_by_' + indexKey] = get_object_by_key;

            type_metaData.type_indexKeys.push(indexKey);

        }

        type_metaData['addIndexKey'] = addIndexKey;

        // removeIndexKey takes an indexKey string and removes it from
        // the type.
        function removeIndexKey(indexKey) {

            var indexKeyIndex = type_metaData.type_indexKeys.indexOf(indexKey);
            if (indexKeyIndex >= 0) {
                type_metaData.type_indexKeys.splice(indexKeyIndex, 1);
            } else {
                ERROR('defineType removeIndexKey: key not defined in type_indexKeys!', ['name', name, 'indexKey', indexKey, 'type_indexKeys', type_metaData.type_indexKeys]);
            }

            // Delete object_by_key.
            delete type_metaData.type_indexes[indexKey];
            delete type_metaData['type_by_' + indexKey];
            delete type_metaData[name + '_by_' + indexKey];
            delete type_metaData.scope[name + '_by_' + indexKey];

            // delete get_object_by_key.
            delete type_metaData['get_type_by_' + indexKey];
            delete type_metaData['get_' + name + '_by_' + indexKey];
            delete type_metaData.scope['get_' + name + '_by_' + indexKey];

        }

        type_metaData['removeIndexKey'] = removeIndexKey;

        // updateAllObjectIndexKeys defines each object in each of
        // the indexKey dictionaries by its corresponding indexKey.
        function updateAllObjectIndexKeys() {

            for (var objectIndex = 0, objectCount = type_metaData.type_objects.length;
                 objectIndex < objectCount;
                 objectIndex++) {

                var object = type_metaData.type_objects[objectIndex];
                updateObjectIndexKeys(object);

            }

        }

        type_metaData['updateAllObjectIndexKeys'] = updateAllObjectIndexKeys;

        // updateObjectIndexKeys takes an object and and defines it
        // in each of the indexKey dictionaries by its corresponding
        // indexKeys.
        function updateObjectIndexKeys(object) {

            for (var indexKeyIndex = 0, indexKeyCount = type_metaData.type_indexKeys.length;
                 indexKeyIndex < indexKeyCount;
                 indexKeyIndex++) {

                var indexKey = type_metaData.type_indexKeys[indexKeyIndex];
                var object_by_key = type_metaData.type_indexes[indexKey];
                var value = object[indexKey];

                if (object_by_key[value] === object) {
                    // Same object! That's cool.
                } else if (object_by_key[value] === undefined) {
                    object_by_key[value] = object;
                } else {
                    ERROR('defineType addObject: different object already defined in object_by_key!', ['name', name, 'object', object, 'indexKey', indexKey, 'value', value, 'type_objects', type_metaData.type_objects, 'object_by_key', object_by_key, 'object_by_key[value]', object_by_key[value]]);
                }

            }

        }

        type_metaData['updateObjectIndexKeys'] = updateObjectIndexKeys;

        // reindexObjects recalculates each object's index number.
        function reindexObjects() {

            for (var objectIndex = 0, objectCount = type_metaData.type_objects.length;
                 objectIndex < objectCount;
                 objectIndex++) {

                var object = type_metaData.type_objects[objectIndex];
                object.index = objectIndex;

            }

        }

        // addObjects adds an array of objects to the type.
        function addObjects(objects) {

            for (var objectIndex = 0, objectCount = objects.length;
                 objectIndex < objectCount;
                 objectIndex++) {

                var object = objects[objectIndex];
                addObject(object);

            }

        }

        type_metaData['addObjects'] = addObjects;

        // addObject adds an object to the type.
        function addObject(object) {

            object.index = type_metaData.type_objects.length;
            type_metaData.type_objects.push(object);
            updateObjectIndexKeys(object);

        }

        type_metaData['addObject'] = addObject;

        // removeObject removes an object from the type.
        function removeObject(object) {

            for (var indexKeyIndex = 0, indexKeyCount = type_metaData.type_indexKeys.length;
                 indexKeyIndex < indexKeyCount;
                 indexKeyIndex++) {

                var indexKey = type_metaData.type_indexKeys[indexKeyIndex];
                var value = object[indexKey];
                var object_by_key = type_metaData.type_indexes[indexKey];

                if (object_by_key[value] === object) {

                    delete object_by_key[value];

                } else {

                    ERROR('defineType removeObject: object missing from object_by_key!', ['name', name, 'object', object, 'indexKey', indexKey, 'value', value, 'type_objects', type_objects, 'object_by_key', object_by_key, 'object_by_key[value]', object_by_key[value]]);

                }
            }

            var index =
                type_metaData.type_objects.indexOf(object);
            if (index >= 0) {

                type_metaData.type_objects.splice(index, 1);
                reindexObjects();

            } else {

                ERROR('defineType removeObject: object missing from type_objects!', ['name', name, 'object', object, 'indexKey', indexKey, 'value', value, 'type_objects', type_objects, 'object_by_key', object_by_key]);

            }

        }

        type_metaData['removeObject'] = removeObject;

        // Now add any index keys that were passed in.
        if (indexKeys) {
            addIndexKeys(indexKeys);
        }

        // Finally add any objects that were passed in.
        if (objects) {
            addObjects(objects);
        }

    }


    ////////////////////////////////////////////////////////////////////////
    // The CAM6 class is the cellular automata simulation engine, all
    // around God Object, and Kitchen Sink Repository.


    // CAM6 class constructor function, called like:
    // var cam6 = new CAM6(params};
    window.CAM6 = function CAM6(params) {

        // This just initializes instance variables to their default
        // values and resets params.
        this.init();

        // Now we set params to what was passed in (or an empty dict).
        // Then initFromParams will be called later by startup.
        this.params = params || {};

        return this;
    };


    ////////////////////////////////////////////////////////////////////////
    // Type definitions for CAM6.prototype.


    ////////////////////////////////////////////////////////////////////////
    // The paramMetaData type, that describes all the parameters.


    // paramUsedByCurrentTool is a condition that returns true if
    // paramMetaData's parameter is used by the current tool. Must be
    // called with this of a CAM6 instance.
    function paramUsedByCurrentTool(paramMetaData) {

        var paramsUsed = this.tool_by_symbol[this.toolSymbol].paramsUsed;

        return paramsUsed && paramMetaData.param in paramsUsed;

    }


    // paramUsedByCurrentRule is a condition that returns true if
    // paramMetaData's parameter is used by the current rule. Must be
    // called with this of a CAM6 instance.
    function paramUsedByCurrentRule(paramMetaData) {

        var paramsUsed = this.rule_by_symbol[this.ruleSymbol].paramsUsed;

        return paramsUsed && paramMetaData.param in paramsUsed;

    }


    CAM6.prototype.camParams = {
        toolSymbol: true,
        ruleSymbol: true,
        colorMapSymbol: true,
        stepsPerFrame: true,
        animationDelay: true,
        playSpeed: true,
        playModeSymbol: true,
        recordModeSymbol: true,
        randomSeed: true,
        phaseTime: true,
        step: true,
        webCamEnabled: true,
        webCamState: true,
        webCamStatus: true,
        headTrackerEnabled: true,
        headTrackerState: true,
        headTrackerStatus: true,
        analyzerSymbol: true,
        analyzerEnabled: true,
        analyzerState: true,
        analyzerStatus: true
    };


    CAM6.prototype.toolParams = {
        mouseX: true,
        mouseY: true,
        mouseLastX: true,
        mouseLastY: true,
        mouseDownX: true,
        mouseDownY: true,
        toolCell: true,
        toolSize: true,
        toolSprinkles: true,
        toolVolume: true,
        toolGranularity: true,
        toolCellMin: true,
        toolCellMax: true,
        toolMask: true,
        toolLineCapSymbol: true,
        toolImageSymbol: true
    };


    CAM6.prototype.ruleParams = {
        frobTarget: true,
        frob: true,
        unfrob: true,
        frobScale: true,
        phaseScale: true,
        phaseOffset: true,
        phaseShiftX: true,
        phaseShiftY: true,
        phaseShiftCell: true,
        phaseShiftStep: true,
        heatShiftPollution: true
    };


    CAM6.prototype.compositionParams = {
    };


    defineType(
        'paramMetaData',
        CAM6.prototype,
        null,
        ['param'],
        [

            {
                param: 'toolSymbol',
                name: 'Tool',
                description: 'This controls the type of cell editing tool.',
                type: 'symbol',
                scopes: ['tool'],
                recordable: true,
                widget: 'menu',
                tab: 'tools',
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    // Changing the tool can change the visible parameters, so call updateParamVisibility.
                    this.updateParamVisibility();
                },
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.tool_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.tool_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.tool_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.tool_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.tool_objects.length - 1;
                }
            },

            {
                param: 'toolCell',
                name: 'Tool Cell',
                description: 'This controls the cell that the editing tool paints with.',
                type: 'integer',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell ' + hex2(paramValue) + ' = ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Cell byte value ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 0xff;
                }
            },

            {
                param: 'toolSize',
                name: 'Tool Size',
                description: 'This controls the size of the editing tool.',
                type: 'integer',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return shave(paramValue) + ' pixel' + ((paramValue == 1) ? '' : 's');
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Tool size ' + shave(paramValue) + ' pixel' + ((paramValue == 1) ? '' : 's') + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 1;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 256;
                }
            },

            {
                param: 'toolSprinkles',
                name: 'Tool Sprinkles',
                description: 'This controls the number of sprinkles of the editing tool.',
                type: 'integer',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return shave(paramValue) + ' sprinkle' + ((paramValue == 1) ? '' : 's');
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Sprinkle ' + shave(paramValue) + ' cells.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'toolVolume',
                name: 'Tool Volume',
                description: 'This controls the volume of the editing tool.',
                type: 'float',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'volume ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Set the tool volume to ' + shave(paramValue) + '.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 11.0, 1000, 0);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 11.0, 1000, 0);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'toolGranularity',
                name: 'Tool Granulatity',
                description: 'This controls the granularity of the editing tool.',
                type: 'float',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'granularity ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Set the tool granularity to ' + shave(paramValue) + '.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 1.0, 1000, 0);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 1.0, 1000, 0);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'toolCellMin',
                name: 'Tool Cell Min',
                description: 'This controls the minimum tool cell value.',
                type: 'integer',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell min ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Cell min ' + shave(paramValue) + ',';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 0xff;
                }
            },

            {
                param: 'toolCellMax',
                name: 'Tool Cell Max',
                description: 'This controls the maximum tool cell value.',
                type: 'integer',
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell max ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Cell max ' + shave(paramValue) + ',';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 0xff;
                }
            },

            {
                param: 'toolMask',
                name: 'Tool Mask',
                description: 'This controls which bit planes of the cells the tool affects.',
                type: 'integer', // 'byte'
                scopes: ['tool'],
                recordable: true,
                widget: 'slider',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'mask ' + hex2(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Tool mask ' + hex2(paramValue) + ',';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 0xff;
                }
            },

            {
                param: 'toolLineCapSymbol',
                name: 'Tool Line Cap',
                description: 'This controls the line cap of the editing tool.',
                type: 'symbol',
                scopes: ['tool'],
                recordable: true,
                widget: 'menu',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'Line Cap ' + this.lineCap_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.lineCap_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.lineCap_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.lineCap_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.lineCap_objects.length - 1;
                }
            },

            {
                param: 'toolImageSymbol',
                name: 'Tool Image',
                description: 'This controls the image of the editing tool.',
                type: 'symbol',
                scopes: ['tool'],
                recordable: true,
                widget: 'menu',
                tab: 'tools',
                condition: paramUsedByCurrentTool,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'image ' + this.image_by_symbol[paramValue].name || (' #' + (paramValue + 1));
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Image ' + this.image_by_symbol[paramValue].name || (' #' + (paramValue + 1)) + ',';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.image_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.image_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.image_objects.length - 1;
                }
            },

            {
                param: 'ruleSymbol',
                name: 'Rule',
                description: 'This controls the rule being simulated.',
                type: 'symbol',
                scopes: ['cam'],
                recordable: true,
                widget: 'menu',
                tab: 'rules',
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    // Changing the tool can change the visible parameters, so call updateParamVisibility.
                    this.updateParamVisibility();
                },
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.rule_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.rule_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.rule_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.rule_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.rule_objects.length - 1;
                }
            },

            {
                param: 'frobTarget',
                name: 'Frob Target',
                description: 'This controls the target frob value that frob returns to at the unfrob rate.',
                type: 'float',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell change ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Neutralize the frob cell change to ' + shave(paramValue) + '.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 20.0, 1000.0, 100);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 20.0, 1000.0, 100);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return -1000;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'frob',
                name: 'Frob',
                description: 'This controls the cell change frob value.',
                type: 'float',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell change ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Change the cell by ' + shave(paramValue) + '.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 20.0, 1000.0, 100);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 20.0, 1000.0, 100);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return -1000;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'unfrob',
                name: 'Unfrob',
                description: 'This controls the rate at which the frob value seeks the frobTarget.',
                type: 'float',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'cell change delta ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Return the frob cell change to frobTarget by ' + shave(paramValue) + '.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 10, 1000.0, 100);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 10, 1000.0, 100);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'frobScale',
                name: 'Frob Scale',
                description: 'This controls the effect of the vertical mouse wheel on the frob cell change.',
                type: 'float',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'scale ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Scale the vertical mouse wheel by ' + shave(paramValue) + ' to scroll the frob cell change.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 1.0, 1000.0, 100);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 1.0, 1000.0, 100);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return -1000;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'phaseScale',
                name: 'Phase Scale',
                description: 'This controls the phaseOffset.',
                type: 'float',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'scale ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Scale the horizontal mouse wheel by ' + shave(paramValue) + ' to scroll the phase offset.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 1.0, 1000.0, 100);
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 1.0, 1000.0, 100);
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return -1000;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'phaseOffset',
                name: 'Phase Offset',
                description: 'This controls the offset of the ripple phase.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'offset ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Offset the ripple phase by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 15;
                }
            },

            {
                param: 'phaseShiftX',
                name: 'Phase Shift X',
                description: 'This controls the magnitude of the cell X position effect on the ripple phase.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'shift ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Shift the cell X value by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 10;
                }
            },

            {
                param: 'phaseShiftY',
                name: 'Phase Shift Y',
                description: 'This controls the magnitude of the cell Y position effect on the ripple phase.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'shift ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Shift the cell Y value by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 10;
                }
            },

            {
                param: 'phaseShiftCell',
                name: 'Phase Shift Cell',
                description: 'This controls the magnitude of the cell effect on the ripple phase.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'shift ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Shift the cell by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 8;
                }
            },

            {
                param: 'phaseShiftStep',
                name: 'Phase Shift Step',
                description: 'This controls the magnitude of the time step effect on the ripple phase.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'shift ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Shift the time step value by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 16;
                }
            },

            {
                param: 'heatShiftPollution',
                name: 'Heat Shift Pollution',
                description: 'This controls the magnitude of the pollution contribution to the heat overlay.',
                type: 'integer',
                scopes: ['rule'],
                recordable: true,
                widget: 'slider',
                tab: 'rules',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'shift ' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Shift the pollution value by ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 10;
                }
            },

            {
                param: 'colorMapSymbol',
                name: 'ColorMap',
                description: 'This controls the current color map.',
                type: 'symbol',
                scopes: ['cam'],
                recordable: true,
                widget: 'menu',
                tab: 'simulation',
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.colorMap_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.colorMap_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.colorMap_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.colorMap_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.colorMap_objects.length - 1;
                }
            },

            {
                param: 'stepsPerFrame',
                name: 'Steps Per Frame',
                description: 'This controls the number of steps the rule is applied between animation frames.',
                type: 'float',
                scopes: ['cam'],
                recordable: true,
                widget: 'slider',
                tab: 'simulation',
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return shave(paramValue) + ' step' + ((paramValue == 1) ? '' : 's');
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return shave(paramValue) + ' steps per frame.';
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    var paramValue = curveWidgetValueToParamValue.call(
                        this, paramMetaData, widgetValue, 128.0, 1000.0, 0);
                    paramValue = (paramValue > 1) ? Math.floor(paramValue) : paramValue;
                    return paramValue;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    var widgetValue = uncurveParamValueToWidgetValue.call(
                        this, paramMetaData, paramValue, 128.0, 1000.0, 0);
                    return widgetValue;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'animationDelay',
                name: 'Animation Delay',
                description: 'This controls the animation delay.',
                type: 'integer',
                scopes: ['cam'],
                recordable: true,
                widget: 'slider',
                tab: 'simulation',
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.scheduleTick();
                },
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return shave(paramValue) + ' msec';
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Delay ' + shave(paramValue) + ' msec between animation frames.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1000;
                }
            },

            {
                param: 'playSpeed',
                name: 'Play Speed',
                description: 'This controls the speed of script playback.',
                type: 'integer',
                scopes: ['cam'],
                widget: 'slider',
                tab: 'simulation',
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return 'speed ' + paramValue;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'Script play speed ' + paramValue + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return -1;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1;
                }
            },

            {
                param: 'playModeSymbol',
                name: 'Play Mode',
                type: 'symbol',
                scopes: ['cam'],
                description: 'This controls the play mode.',
                widget: 'menu',
                tab: 'simulation',
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.playMode_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.playMode_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.playMode_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.playMode_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.playMode_objects.length - 1;
                }
            },

            {
                param: 'recordModeSymbol',
                name: 'Record Mode',
                description: 'This controls the record mode.',
                type: 'symbol',
                scopes: ['cam'],
                widget: 'menu',
                tab: 'simulation',
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.recordMode_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.recordMode_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.recordMode_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.recordMode_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.recordMode_objects.length - 1;
                }
            },

            {
                param: 'analyzerSymbol',
                name: 'Analyzer',
                description: 'This controls the type of analyzer.',
                type: 'symbol',
                scopes: ['cam'],
                recordable: true,
                widget: 'menu',
                tab: 'simulation',
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    // Changing the tool can change the visible parameters, so call updateParamVisibility.
                    this.updateParamVisibility();
                },
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return this.analyzer_by_symbol[paramValue].name;
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return this.analyzer_by_symbol[paramValue].description;
                },
                widgetValueToParamValueFunction: function widgetValueToParamValueFunction(paramMetaData, target, widgetValue) {
                    return this.analyzer_objects[widgetValue].symbol;
                },
                paramValueToWidgetValueFunction: function paramValueToWidgetValueFunction(paramMetaData, target, paramValue) {
                    return this.analyzer_by_symbol[paramValue].index;
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.analyzer_objects.length - 1;
                }
            },

            {
                param: 'randomSeed',
                name: 'Random Seed',
                description: 'This seeds the random number generator.',
                type: 'string',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    Math.seedrandom(paramValue);
                }
            },

            {
                param: 'phaseTime',
                name: 'Phase Time',
                description: 'This is the temporal simulation phase.',
                type: 'integer',
                scopes: ['cam'],
                recordable: true
            },

            {
                param: 'step',
                name: 'Step',
                description: 'This is the temporal simulation step.',
                type: 'integer',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    //LOG('Playing back step param, changing step from', this.step, 'to', paramValue, 'and changing scriptPlayingStartStep from', this.scriptPlayingStartStep, 'to', paramValue);
                    target[paramKey] = paramValue;
                    this.scriptPlayingStartStep = paramValue;
                }
            },

            {
                param: 'mouseButton',
                name: 'Mouse Button',
                description: 'The mouse button state.',
                type: 'boolean',
                scopes: ['cam', 'tool'],
                recordable: true,
                widget: 'checkbox',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return paramValue ? 'Down' : 'Up';
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse button is ' + (paramValue ? 'Down' : 'Up') + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return 1;
                }
            },

            {
                param: 'mouseX',
                name: 'Mouse X',
                description: 'The mouse X position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: true,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse X position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellWidth;
                }
            },

            {
                param: 'mouseY',
                name: 'Mouse Y',
                description: 'The mouse Y position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: true,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse Y position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellHeight;
                }
            },

            {
                param: 'mouseLastX',
                name: 'Mouse Last X',
                description: 'The last mouse X position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: false,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The last mouse X position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellWidth;
                }
            },

            {
                param: 'mouseLastY',
                name: 'Mouse Last Y',
                description: 'The mouse last Y position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: false,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse last Y position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellHeight;
                }
            },

            {
                param: 'mouseDownX',
                name: 'Mouse Down X',
                description: 'The mouse down X position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: false,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse down X position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellWidth;
                }
            },

            {
                param: 'mouseDownY',
                name: 'Mouse Down Y',
                description: 'The mouse down Y position.',
                type: 'integer',
                scopes: ['cam', 'tool'],
                recordable: false,
                widget: 'slider',
                condition: paramUsedByCurrentRule,
                getValueNameFunction: function getValueNameFunction(paramMetaData, target, paramValue) {
                    return '' + shave(paramValue);
                },
                getValueDescriptionFunction: function getValueDescriptionFunction(paramMetaData, target, paramValue) {
                    return 'The mouse down Y position is ' + shave(paramValue) + '.';
                },
                getMinValueFunction: function getMinValueFunction(paramMetaData, target) {
                    return 0;
                },
                getMaxValueFunction: function getMaxValueFunction(paramMetaData, target) {
                    return this.cellHeight;
                }
            },

            {
                param: 'webCamEnabled',
                name: 'WebCam Enabled',
                description: 'WebCam enabled.',
                type: 'boolean',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'webCamState',
                name: 'WebCam State',
                description: 'WebCam state.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'webCamStatus',
                name: 'WebCam Status',
                description: 'WebCam status.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'headTrackerEnabled',
                name: 'Head Tracker Enabled',
                description: 'Head tracker enabled.',
                type: 'boolean',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'headTrackerState',
                name: 'Head Tracker State',
                description: 'Head tracker state.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'headTrackerStatus',
                name: 'Head Tracker Status',
                description: 'Head tracker status.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'analyzerEnabled',
                name: 'Analyzer Enabled',
                description: 'Analyzer enabled.',
                type: 'boolean',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'analyzerState',
                name: 'Analyzer State',
                description: 'Analyzer state.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            },

            {
                param: 'analyzerStatus',
                name: 'Analyzer Status',
                description: 'Analyzer status.',
                type: 'string',
                scopes: ['cam'],
                recordable: false,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    this.updateCommands();
                }
            }

    ]);


    ////////////////////////////////////////////////////////////////////////
    // The neighborhood type.
    //
    // Each neighborhoodDict describes a cellular automata neighborhood,
    // including its symbol, and a neighborhood function that takes the
    // neighborhoodDict and a ruleDict as a parameter, and applies the
    // rule to the cells.


    defineType(
        'neighborhood',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            ////////////////////////////////////////////////////////////////////////
            // Marble neighborhood.

            {
                symbol: 'Marble',

                name: 'Marble',

                description: 'Marble neighborhood.',

                neighborhoodFunction: function neighborhoodFunction_Marble(neighborhoodDict, ruleDict) {

// <function name="neighborhoodFunction" arguments="neighborhoodDict, ruleDict">

//   <slot name="declareLocals">
                    var ruleKernels = ruleDict.ruleKernels;
                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var phaseOffset = this.phaseOffset;
                    var phaseShiftX = this.phaseShiftX;
                    var phaseShiftY = this.phaseShiftY;
                    var phaseShiftXRotated;
                    var phaseShiftYRotated;
                    var phaseShiftCell = this.phaseShiftCell;
                    var phaseShiftStep = this.phaseShiftStep;
                    var frob = this.frob;
                    var unfrob = this.unfrob;
                    var frobTarget = this.frobTarget;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var kernelDown;
                    var kernelRight;
                    var width;
                    var height;
                    var kernelMask;
                    var kernelBytes;
                    var spatioTemporalCellularPhase;
                    var cell;
//   </slot>

//   <slot name="initializeRuleKernels">

                    // Make the ruleKernels for the rule.

                    var ruleKernels = ruleDict.ruleKernels;

                    if (!ruleKernels) {

                        var kernels =
                                this.kernels;
                        var kernelSymbols =
                                ruleDict.kernelSymbols;

                        ruleDict.ruleKernels = ruleKernels =
                            [];

                        for (var i = 0, n = kernelSymbols.length;
                             i < n;
                             i++) {

                            var kernelSymbol =
                                    kernelSymbols[i];
                            var kernel =
                                    kernels[kernelSymbol];
                            var kernelBuffer =
                                    new ArrayBuffer(9);
                            var kernelBytes =
                                    new Uint8Array(kernelBuffer);

                            for (var j = 0;
                                 j < 9;
                                 j++) {

                                kernelBytes[j] =
                                    kernel[j];
                            }

                            ruleKernels.push(
                                kernelBytes);

                        } // for i

                    }

                    kernelMask =
                        (1 << (Math.log(ruleKernels.length) /
                               Math.log(2))) - 1;

//   </slot>

//   <slot name="initializeHistogram" test="this.doHistogram">
                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }
//   </slot>

//   <slot name="randomizeError" test="this.randomizeError">
                    if (this.randomizeError) {
                        // Prime the pump each frame to keep it jiggly.
                        error = Math.floor(Math.random() * this.randomizeError);
                    }
//   </slot>

//   <if test="spinScanOrder">

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
//   </if>
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            kernelRight = 1; kernelDown = 3;
                            phaseShiftXRotated = phaseShiftX;
                            phaseShiftYRotated = phaseShiftY;
//   <if test="spinScanOrder">
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            kernelRight = 3; kernelDown = -1;
                            phaseShiftXRotated = phaseShiftY;
                            phaseShiftYRotated = phaseShiftX;
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            kernelRight = -1; kernelDown = -3;
                            phaseShiftXRotated = phaseShiftX;
                            phaseShiftYRotated = phaseShiftY;
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            kernelRight = -3; kernelDown = 1;
                            phaseShiftXRotated = phaseShiftY;
                            phaseShiftYRotated = phaseShiftX;
                            break;
                    }
//   </if>

//   <slot name="cellLoopBegin">

//     <slot name="cellLoopBeginY">
                    for (var cellY = 0;
                         cellY < height;
                         cellY++, cellIndex += nextRowSkip) {
//     </slot>

//     <slot name="init3x3Window">
                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];
//     </slot>

//     <slot name="celLoopBeginX">
                        for (var cellX = 0;
                             cellX < width;
                             cellX++, cellIndex += nextCol) {
//     </slot>

//   </slot>

//   <slot name="scroll3x3window">
                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];
//   </slot>

//   <slot name="calculateCell">

//     <slot name="calculateSpatioTemporalCellularPhase">
                            spatioTemporalCellularPhase =
                                    (Math.floor(phaseOffset) +
                                     (cellX >> phaseShiftXRotated) +
                                     (cellY >> phaseShiftYRotated) +
                                     ((step & 0xffff) >> phaseShiftStep) +
                                     (c >> phaseShiftCell)) &
                                    kernelMask;
//     </slot>

//     <if test="invertPhaseIfCellBit80Set">
                            if (c & 0x80) {
                                spatioTemporalCellularPhase =
                                    15 - spatioTemporalCellularPhase;
                            }
//     </if>

//     <slot name="selectKernelBytes">
                            kernelBytes =
                                ruleKernels[spatioTemporalCellularPhase];
//     </slot>

//     <slot name="sumError">
                            error +=
                                (nw * kernelBytes[4 - kernelDown - kernelRight]) +
                                    (n  * kernelBytes[4 - kernelDown]) +
                                        (ne * kernelBytes[4 - kernelDown + kernelRight]) +
                                (w  * kernelBytes[4 - kernelRight]) +
                                    (c  * kernelBytes[4]) +
                                        (e  * kernelBytes[4 + kernelRight]) +
                                (sw * kernelBytes[4 + kernelDown - kernelRight]) +
                                    (s  * kernelBytes[4 + kernelDown]) +
                                        (se * kernelBytes[4 + kernelDown + kernelRight]) +
                                frob;
//     </slot>

//     <slot name="calculateCell">
                            cell = (error >> 4) & 0xff;
//     </slot>

//     <slot name="maskError">
                            error -= (error & ~0x0f);
//     </slot>

//     <slot name="storeCell">
                            nextCells[cellIndex] = cell;
//     </slot>

//   </slot>

//   <slot name="calculateHistogram" test="this.doHistogram">
                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }
//   </slot>

//   <slot name="cellLoopEnd">

//     <slot name="cellLoopEndX">
                        }
//     </slot>

//     <slot name="cellLoopEndY">
                    }
//     </slot>

//   </slot>

// </function>

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Flower neighborhood.

            {
                symbol: 'Flower',

                name: 'Flower',

                description: 'Flower neighborhood.',

                neighborhoodFunction: function neighborhoodFunction_Flower(neighborhoodDict, ruleDict) {

                    var ruleKernels = ruleDict.ruleKernels;
                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var frob = this.frob;
                    var unfrob = this.unfrob;
                    var frobTarget = this.frobTarget;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = ruleDict.error || 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var kernelDown;
                    var kernelRight;
                    var width;
                    var height;
                    var kernelMask;
                    var kernelBytes;
                    var cell;

                    // Make the ruleKernels for the rule.

                    var ruleKernels = ruleDict.ruleKernels;

                    if (!ruleKernels) {

                        var kernels =
                                this.kernels;
                        var kernelSymbols =
                                ruleDict.kernelSymbols;

                        ruleDict.ruleKernels = ruleKernels =
                            [];

                        for (var i = 0, n = kernelSymbols.length;
                             i < n;
                             i++) {

                            var kernelSymbol =
                                    kernelSymbols[i];
                            var kernel =
                                    kernels[kernelSymbol];
                            var kernelBuffer =
                                    new ArrayBuffer(9);
                            var kernelBytes =
                                    new Uint8Array(kernelBuffer);

                            for (var j = 0;
                                 j < 9;
                                 j++) {

                                kernelBytes[j] =
                                    kernel[j];
                            }

                            ruleKernels.push(
                                kernelBytes);

                        } // for i

                    }

                    kernelMask =
                        (1 << (Math.log(ruleKernels.length) /
                               Math.log(2))) - 1;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    ruleDict.errors =
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            kernelRight = 1; kernelDown = 3;
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            kernelRight = 3; kernelDown = -1;
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            kernelRight = -1; kernelDown = -3;
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            kernelRight = -3; kernelDown = 1;
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++, cellIndex += nextRowSkip) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++, cellIndex += nextCol) {


                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var same = c & 0x0f;
                            var phase = c & 0xf0;
                            var otherPhase;

                            kernelBytes =
                                ruleKernels[phase >> 4];

                            // There are 16 different phases, each with its own convulution kernel.
                            // Cells of different phases that are next to each other do not affect each
                            // other (they act as if their neighbor of different phases have the same
                            // heat value as they do), EXCEPT for phase 0, which allows energy heat to
                            // pass back and forth to other phases.

                            error +=
                                ((((phase == 0) || ((otherPhase = (nw & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (nw & 0x0f) : same) * kernelBytes[4 - kernelDown - kernelRight]) +
                                ((((phase == 0) || ((otherPhase = (n  & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (n  & 0x0f) : same) * kernelBytes[4 - kernelDown]) +
                                ((((phase == 0) || ((otherPhase = (ne & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (ne & 0x0f) : same) * kernelBytes[4 - kernelDown + kernelRight]) +
                                ((((phase == 0) || ((otherPhase = (w  & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (w  & 0x0f) : same) * kernelBytes[4 - kernelRight]) +
                                ((((phase == 0) || ((otherPhase = (c  & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (c  & 0x0f) : same) * kernelBytes[4]) +
                                ((((phase == 0) || ((otherPhase = (e  & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (e  & 0x0f) : same) * kernelBytes[4 + kernelRight]) +
                                ((((phase == 0) || ((otherPhase = (sw & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (sw & 0x0f) : same) * kernelBytes[4 + kernelDown - kernelRight]) +
                                ((((phase == 0) || ((otherPhase = (s  & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (s  & 0x0f) : same) * kernelBytes[4 + kernelDown]) +
                                ((((phase == 0) || ((otherPhase = (se & 0xf0)) == phase) || (otherPhase == 0))
                                    ? (se & 0x0f) : same) * kernelBytes[4 + kernelDown + kernelRight]);

                            error += frob;

                            cell = ((error >> 4) & 0x0f) | phase;
                            error -= (error & ~0x0f);

                            nextCells[cellIndex] = cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                        }

                    }

                    ruleDict.error = error;
                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Life neighborhood.

            {

                symbol: 'Life',

                name: 'Life',

                description: 'Life neighborhood.',

                neighbors: ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'],

                neighborhoodFunction: function neighborhoodFunction_Life(neighborhoodDict, ruleDict) {

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var heatShiftPollution = this.heatShiftPollution;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    // Prime the pump each frame to keep it jiggly.
                    //error = Math.floor(Math.random() * 256) & 7;

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var cell = 0;

                            var sum8 =
                                    (nw & 1) + (n & 1) + (ne & 1) +
                                    (w  & 1) +              (e  & 1) +
                                    (sw & 1) + (s & 1) + (se & 1);

                            if (c & 1) {
                                if ((sum8 == 2) || (sum8 == 3)) {
                                    cell |= 0x01;
                                }
                            } else {
                                if (sum8 == 3) {
                                    cell |= 0x01;
                                }
                            }

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                error += ((
                                    (nw & highMask) + (e & highMask) + (ne & highMask) +
                                    (w  & highMask) + ((c & mask) << heatShiftPollution) +
                                                                       (e  & highMask) +
                                    (sw & highMask) + (s & highMask) + (se & highMask)) >> heatShift) +
                                    frob;

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~7);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ///////////////////////////////////////////////////////////////////////,
            // Brain neighborhood.

            {

                symbol: 'Brain',

                name: 'Brain',

                description: 'Brain neighborhood.',

                neighbors: ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'],

                neighborhoodFunction: function neighborhoodFunction_Brain(neighborhoodDict, ruleDict) {

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var heatShiftPollution = this.heatShiftPollution;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    // Prime the pump each frame to keep it jiggly.
                    error = Math.floor(Math.random() * this.randomizeError);

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var cell = 0;

                            var sum8 =
                                    (nw & 1) + (n & 1) + (ne & 1) +
                                    (w  & 1) +           (e  & 1) +
                                    (sw & 1) + (s & 1) + (se & 1);

                            cell |= (c << 1) & 0x02;

                            if ((c & 3) == 0) {
                                if (sum8 == 2) {
                                    cell |= 1;
                                }
                            }

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                error += ((
                                    (nw & highMask) + (e & highMask) + (ne & highMask) +
                                    (w  & highMask) + ((c & 0x03) << heatShiftPollution) +
                                                                       (e  & highMask) +
                                    (sw & highMask) + (s & highMask) + (se & highMask)) >> heatShift) +
                                    frob;

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~7);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Eco neighborhood.

            {

                symbol: 'Eco',

                name: 'Eco',

                description: 'Eco neighborhood.',

                neighbors: ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'],

                neighborhoodFunction: function neighborhoodFunction_Eco(neighborhoodDict, ruleDict) {

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var heatShiftPollution = this.heatShiftPollution;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    // Prime the pump each frame to keep it jiggly.
                    error = Math.floor(Math.random() * this.randomizeError);

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var cell = 0;

                            var sum9Anneal =
                                    ((nw & 0x04) + (n & 0x04) + (ne & 0x04) +
                                     (w  & 0x04) + (c & 0x04) + (e  & 0x04) +
                                     (sw & 0x04) + (s & 0x04) + (se & 0x04)) >> 2;
                            var anneal =
                                    ((sum9Anneal > 5) || (sum9Anneal == 4)) ? 4 : 0;

                            cell |= anneal;

                            var sum8 =
                                    (nw & 1) + (n & 1) + (ne & 1) +
                                    (w  & 1) +           (e  & 1) +
                                    (sw & 1) + (s & 1) + (se & 1);

                            if (anneal) {
                                // Anti-Life
                                cell |= ((c & 1) << 1);
                                if (c & 1) {
                                    if (sum8 != 5) {
                                        cell |= 0x01;
                                    }
                                } else {
                                    if ((sum8 != 5) && (sum8 != 6)) {
                                        cell |= 0x01;
                                    }
                                }
                            } else {
                                // Brain
                                cell |= (c << 1) & 2;
                                if ((c & 3) == 0) {
                                    if (sum8 == 2) {
                                        cell |= 1;
                                    }
                                }
                            }

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                var center =
                                    anneal
                                    ? (((~c) & 0x03) << 1) // sample anti-life pollution
                                    : ((c & 0x03) << 1); // sample brain pollution

                                error += (((
                                    (nw & highMask) +  (e & highMask) + (ne & highMask) +
                                    (w  & highMask) +  (center << heatShiftPollution) +
                                                                        (e  & highMask) +
                                    (sw & highMask) +  (s & highMask) + (se & highMask)) >> 3) +
                                    frob);

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~7);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Moore neighborhood.

            {

                symbol: 'Moore',

                name: 'Moore',

                description: 'Moore neighborhood.',

                neighbors: ['c0', 'c1', 'se0', 'sw0', 'ne0', 'nw0', 'e0', 'w0', 's0', 'n0', 'c2', 'c3', 'phaseTime'],

                neighborhoodFunction: function neighborhoodFunction_Moore(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    function getTableIndexUnrotated(
                        nw, n, ne,
                        w,  c, e,
                        sw, s, se,
                        phaseTime,
                        phaseX,
                        phaseY) {
                        // 0    1    2    3    4    5    6    7    8     9     10    11    12
                        // c0   c1   se0  sw0  ne0  nw0  e0   w0   s0    n0    c2    c3    phaseTime
                        // 0x1  0x2  0x4  0x8  0x10 0x20 0x40 0x80 0x100 0x200 0x400 0x800 0x1000
                        return (
                            ((nw & 0x01) << 5) |
                            ((n  & 0x01) << 9) |
                            ((ne & 0x01) << 4) |
                            ((w  & 0x01) << 7) |
                            ((c  & 0x03) << 0) |
                            ((e  & 0x01) << 6) |
                            ((sw & 0x01) << 3) |
                            ((s  & 0x01) << 8) |
                            ((se & 0x01) << 2) |
                            ((c  & 0x0c) << 8) |
                            ((phaseTime) << 12));
                    }

                    // Prime the pump each frame to keep it jiggly.
                    error = Math.floor(Math.random() * this.randomizeError);

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            getTableIndex = function getTableIndex() {
                                // n => n, e => e, s => s, w => w
                                return getTableIndexUnrotated(
                                    nw, n, ne,
                                    w,  c, e,
                                    sw, s, se,
                                    phaseTime, (cellX & 1), (cellY & 1));
                            };
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            getTableIndex = function getTableIndex() {
                                // n => w, e => n, s => e, w => s
                                return getTableIndexUnrotated(
                                    sw, w, nw,
                                    s,  c, n,
                                    se, e, ne,
                                    phaseTime, (cellY & 1) ^ 1, (cellX & 1));
                            };
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            getTableIndex = function getTableIndex() {
                                // n => s, e => w, s => n, w => e
                                return getTableIndexUnrotated(
                                    se, s, sw,
                                    e,  c, w,
                                    ne, n, nw,
                                    phaseTime, (cellX & 1) ^ 1, (cellY & 1) ^ 1);
                            };
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            getTableIndex = function getTableIndex() {
                                // n => e, e => s, s => w, w => n
                                return getTableIndexUnrotated(
                                    ne, e, se,
                                    n,  c, s,
                                    nw, w, sw,
                                    phaseTime, (cellY & 1), (cellX & 1) ^ 1);
                            };
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var tableIndex = getTableIndex();

                            var cell =
                                ruleTableBytes[tableIndex];

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                error += ((
                                    (nw & highMask) +  (e & highMask) + (ne & highMask) +
                                    (w  & highMask) +  ((c & mask) << heatShiftPollution) +
                                                                        (e  & highMask) +
                                    (sw & highMask) +  (s & highMask) + (se & highMask)) >> heatShift) +
                                    frob;

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~7);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Moore 4 neighborhood.

            {

                symbol: 'Moore4',

                name: 'Moore 4',

                description: 'Moore 4 neighborhood.',

                neighbors: [
                    'nw0', 'nw1', 'n0', 'n1' , 'ne0', 'ne1',
                    'w0' , 'w1' , 'c0', 'c1' , 'e0' , 'e1' ,
                    'sw0', 'sw1', 's0', 's1' , 'se0', 'se1',
                    'u0' , 'u1' , 'd0', 'd1' , 'p0' , 'p1'
                ],

                neighborhoodFunction: function neighborhoodFunction_Moore(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var u, d;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    width = cellWidth; height = cellHeight;
                    cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                    nextCol = 1; nextRow = cellBufferWidth;
                    nextRowSkip = cellGutter * 2;

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            cell = 0x00;

                            for (var plane = 0; plane < 8; plane += 2) {

                                //       0       1       2       3       4       5
                                //     nw0     nw1      n0      n1     ne0     ne1
                                // 0x00001  0x0002 0x00004 0x00008 0x00010 0x00020

                                //       6       7       8       9      10      11
                                //      w0      w1      c0      c1      e0      e1
                                // 0x00040 0x00080 0x00100 0x00200 0x00400 0x00800

                                //      12      13      14      15      16      17
                                //     sw0     sw1      s0      s1     se0     se1
                                // 0x00100 0x00200 0x00400 0x00800 0x01000 0x02000

                                //      18      19      20      21      22      23
                                //      u0      u1      d0      d1      p0      p1   
                                // 0x04000 0x08000 0x10000 0x20000 0x40000 0x80000

                                var tableIndex =

                                    ( ( ( nw    >> ( ( plane     )        ) ) & 0x03 ) <<  0 ) |   // nw
                                    ( ( ( n     >> ( ( plane     )        ) ) & 0x03 ) <<  2 ) |   // n
                                    ( ( ( ne    >> ( ( plane     )        ) ) & 0x03 ) <<  4 ) |   // ne

                                    ( ( ( w     >> ( ( plane     )        ) ) & 0x03 ) <<  6 ) |   // w
                                    ( ( ( c     >> ( ( plane     )        ) ) & 0x03 ) <<  8 ) |   // c
                                    ( ( ( e     >> ( ( plane     )        ) ) & 0x03 ) << 10 ) |   // e

                                    ( ( ( sw    >> ( ( plane     )        ) ) & 0x03 ) << 12 ) |   // sw
                                    ( ( ( s     >> ( ( plane     )        ) ) & 0x03 ) << 14 ) |   // s
                                    ( ( ( se    >> ( ( plane     )        ) ) & 0x03 ) << 16 ) |   // se

                            ((plane == 6)
                                  ? ( ( ( c     >> ( ( 0         )        ) ) & 0x03 ) << 20 )
                                  : ( ( ( c     >> ( ( plane + 2 ) & 0x03 ) ) & 0x03 ) << 20 )) |   // u

                            ((plane == 0)
                                  ? ( ( ( c     >> ( ( 6         )        ) ) & 0x03 ) << 18 )
                                  : ( ( ( c     >> ( ( plane - 2 ) & 0x03 ) ) & 0x03 ) << 18 )) |   // d

                                    ( ( ( plane >> ( ( 1         )        ) ) & 0x03 ) << 22 );     // plane

                                var bits = 
                                    ruleTableBytes[tableIndex] & 0x03;

                                cell |= 
                                    bits << plane;
                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // VonNeumann neighborhood.

            {

                symbol: 'VonNeumann',

                name: 'VonNeumann',

                description: 'VonNeumann neighborhood.',

                neighbors: ['c0', 'c1', 'e1', 'w1', 's1', 'n1', 'e0', 'w0', 's0', 'n0', 'horiz', 'vert', 'phaseTime'],

                neighborhoodFunction: function neighborhoodFunction_VonNeumann(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var     n    ;
                    var w,  c,  e;
                    var     s    ;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    function getTableIndexUnrotated(
                            n,
                        w,  c, e,
                            s,
                        phaseTime,
                        phaseX,
                        phaseY) {

                        // 0    1    2    3    4    5    6    7    8     9     10    11    12
                        // c0   c1   e1   w1   s1   n1   e0   w0   s0    n0    horiz vert  phaseTime
                        // 0x1  0x2  0x4  0x8  0x10 0x20 0x40 0x80 0x100 0x200 0x400 0x800 0x1000
                        return (
                            ((c & 0x03) << 0) |
                            ((e & 0x01) << 6) |
                            ((e & 0x02) << 1) |
                            ((w & 0x01) << 7) |
                            ((w & 0x02) << 2) |
                            ((s & 0x01) << 8) |
                            ((s & 0x02) << 3) |
                            ((n & 0x01) << 9) |
                            ((n & 0x02) << 4) |
                            (phaseX     << 10) |
                            (phaseY     << 11) |
                            (phaseTime  << 12));
                    };

                    // Prime the pump each frame to keep it jiggly.
                    error = Math.floor(Math.random() * this.randomizeError);

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            getTableIndex = function getTableIndex() {
                                // n => n, e => e, s => s, w => w
                                return getTableIndexUnrotated(
                                        n,
                                    w,  c, e,
                                        s,
                                    phaseTime, (cellX & 1), (cellY & 1));
                            };
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            getTableIndex = function getTableIndex() {
                                // n => w, e => n, s => e, w => s
                                return getTableIndexUnrotated(
                                        w,
                                    s,  c, n,
                                        e,
                                    phaseTime, (cellY & 1) ^ 1, (cellX & 1));
                            };
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            getTableIndex = function getTableIndex() {
                                // n => s, e => w, s => n, w => e
                                return getTableIndexUnrotated(
                                        s,
                                    e,  c, w,
                                        n,
                                    phaseTime, (cellX & 1) ^ 1, (cellY & 1) ^ 1);
                            };
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            getTableIndex = function getTableIndex() {
                                // n => e, e => s, s => w, w => n
                                return getTableIndexUnrotated(
                                        e,
                                    n,  c, s,
                                        w,
                                    phaseTime, (cellY & 1), (cellX & 1) ^ 1);
                            };
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns.
                        c  = cells[cellIndex - nextCol];  e  = cells[cellIndex];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the window to the right.

                                     n = cells[cellIndex - nextRow];
                            w  = c;  c =  e;  e = cells[cellIndex + nextCol];
                                     s = cells[cellIndex + nextRow];

                            var tableIndex = getTableIndex();

                            cell = ruleTableBytes[tableIndex];

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                error += ((
                                                       (e & highMask) +
                                    (w  & highMask) +  ((c & mask) << heatShiftPollution) +
                                                                        (e  & highMask) +
                                                       (s & highMask)) >> heatShift) +
                                    frob;

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~3);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // VonNeumann4 neighborhood.

            {

                symbol: 'VonNeumann4',

                name: 'VonNeumann4',

                description: 'VonNeumann4 neighborhood.',

                neighbors: ['c0', 'c1', 'e0', 'e1', 'w0', 'w1', 's0', 's1', 'n0', 'n1', 'horiz', 'vert', 'phaseTime', 'shift0', 'shift1'],

                neighborhoodFunction: function neighborhoodFunction_VonNeumann(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var     n    ;
                    var w,  c,  e;
                    var     s    ;
                    var error = 0;
                    var cell = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    width = cellWidth; height = cellHeight;
                    cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                    nextCol = 1; nextRow = cellBufferWidth;
                    nextRowSkip = cellGutter * 2;

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns.
                        c  = cells[cellIndex - nextCol];  e  = cells[cellIndex];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the window to the right.

                                     n = cells[cellIndex - nextRow];
                            w  = c;  c =  e;  e = cells[cellIndex + nextCol];
                                     s = cells[cellIndex + nextRow];

                            cell = 0x00;

                            for (var plane = 0; plane < 8; plane += 2) {

                                // 0     1     2     3     4     5     6     7     8     9     10    11    12        13     14
                                // c0    c1    e0    e1    w0    w1    s0    s1    n0    n1    horiz vert  phaseTime plane0 plane1
                                // 0x001 0x002 0x004 0x008 0x010 0x020 0x040 0x080 0x100 0x200 0x400 0x800 0x1000    0x2000 0x4000

                                var tableIndex =
                                    (((c         >> plane) & 0x03) <<  0) |
                                    (((e         >> plane) & 0x03) <<  2) |
                                    (((w         >> plane) & 0x03) <<  4) |
                                    (((s         >> plane) & 0x03) <<  6) |
                                    (((n         >> plane) & 0x03) <<  8) |
                                    (((cellX             ) & 0x01) << 10) |
                                    (((cellY             ) & 0x01) << 11) |
                                    (((phaseTime         ) & 0x01) << 12) |
                                    (((plane     >> 1    ) & 0x03) << 13);

                                var bits = 
                                    ruleTableBytes[tableIndex];

                                cell |= (bits & 0x03) << plane;
                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // VonNeumann8 neighborhood.

            {

                symbol: 'VonNeumann8',

                name: 'VonNeumann8',

                description: 'VonNeumann8 neighborhood.',

                neighbors: ['c0', 'e0', 'w0', 's0', 'n0', 'horiz', 'vert', 'phaseTime'],

                neighborhoodFunction: function neighborhoodFunction_VonNeumann(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var     n    ;
                    var w,  c,  e;
                    var     s    ;
                    var error = 0;
                    var cell;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    width = cellWidth; height = cellHeight;
                    cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                    nextCol = 1; nextRow = cellBufferWidth;
                    nextRowSkip = cellGutter * 2;

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns.
                        c  = cells[cellIndex - nextCol];  e  = cells[cellIndex];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the window to the right.

                                     n = cells[cellIndex - nextRow];
                            w  = c;  c =  e;  e = cells[cellIndex + nextCol];
                                     s = cells[cellIndex + nextRow];

                            cell = 0x00;

                            for (var plane = 0; plane < 8; plane++) {

                                // 0     1     2     3     4     5     6     7
                                // c     e     w     s     n     horiz vert  phaseTime
                                // 0x01  0x02  0x04  0x08  0x10  0x20  0x40  0x80

                                var tableIndex =
                                    (((c         >> plane) & 0x01) << 0) |
                                    (((e         >> plane) & 0x01) << 1) |
                                    (((w         >> plane) & 0x01) << 2) |
                                    (((s         >> plane) & 0x01) << 3) |
                                    (((n         >> plane) & 0x01) << 4) |
                                    (((cellX             ) & 0x01) << 5) |
                                    (((cellY             ) & 0x01) << 6) |
                                    (((phaseTime         ) & 0x01) << 7);

                                var bit = 
                                    ruleTableBytes[tableIndex];
                                cell |= (bit & 0x01) << plane;
                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // Margolus neighborhood.

            {

                symbol: 'Margolus',

                name: 'Margolus',

                description: 'Margolus neighborhood.',

                neighbors: ['c0', 'c1', 'cw0', 'ccw0', 'opp0', 'cw1', 'ccw1', 'opp1', 'pha0', 'pha1'],

                neighborhoodFunction: function neighborhoodFunction_Margolus(neighborhoodDict, ruleDict) {

                    this.compileRule(
                        ruleDict);

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var ruleTableBytes = ruleDict.ruleTableBytes;
                    var heatShiftPollution = this.heatShiftPollution;
                    var step = this.step;
                    var phaseTime = this.phaseTime;
                    var mask = ruleDict.mask;
                    var highMask = mask ^ 0xff;
                    var echoShift = ruleDict.echoShift;
                    var heatShift = ruleDict.heatShift;
                    var heatErrorShift = ruleDict.heatErrorShift;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var getTableIndex;

                    if (this.doHistogram) {
                        for (var cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    function getTableIndexUnrotated(
                        nw, n, ne,
                        w,  c, e,
                        sw, s, se,
                        phaseTime,
                        phaseX,
                        phaseY) {
                        // 0    1    2    3    4    5    6    7    8     9
                        // c0   c1   cw0  ccw0 opp0 cw1  ccw1 opp1 pha0  pha1
                        // 0x1  0x2  0x4  0x8  0x10 0x20 0x40 0x80 0x100 0x200
                        var cw, ccw, opp;
                        if (phaseTime) {
                            return (
                                // c c'
                                (c & 0x03) |
                                // cw cw'
                                (cw = (phaseX
                                      ? (phaseY
                                         ? (e & 0x03)
                                         : (n & 0x03))
                                      : (phaseY
                                         ? (s & 0x03)
                                         : (w & 0x03))),
                                 (((cw & 0x01) << 2) |
                                  ((cw & 0x02) << 4))) |
                                // ccw ccw'
                                (ccw = (phaseX
                                      ? (phaseY
                                         ? (s & 0x03)
                                         : (e & 0x03))
                                      : (phaseY
                                         ? (w & 0x03)
                                         : (n & 0x03))),
                                 (((ccw & 0x01) << 3) |
                                  ((ccw & 0x02) << 5))) |
                                // opp opp'
                                (opp = (phaseX
                                      ? (phaseY
                                         ? (se & 0x03)
                                         : (ne & 0x03))
                                      : (phaseY
                                         ? (sw & 0x03)
                                         : (nw & 0x03))),
                                 (((opp & 0x01) << 4) |
                                  ((opp & 0x02) << 6))) |
                                // pha pha'
                                0x200);
                        } else {
                            return (
                                // c c'
                                (c & 0x03) |
                                // cw cw'
                                (cw = (phaseX
                                      ? (phaseY
                                         ? (w & 0x03)
                                         : (s & 0x03))
                                      : (phaseY
                                         ? (n & 0x03)
                                         : (e & 0x03))),
                                 (((cw & 0x01) << 2) |
                                  ((cw & 0x02) << 4))) |
                                // ccw ccw'
                                (ccw = (phaseX
                                      ? (phaseY
                                         ? (n & 0x03)
                                         : (w & 0x03))
                                      : (phaseY
                                         ? (e & 0x03)
                                         : (s & 0x03))),
                                 (((ccw & 0x01) << 3) |
                                  ((ccw & 0x02) << 5))) |
                                // opp opp'
                                (opp = (phaseX
                                      ? (phaseY
                                         ? (nw & 0x03)
                                         : (sw & 0x03))
                                      : (phaseY
                                         ? (ne & 0x03)
                                         : (se & 0x03))),
                                 (((opp & 0x01) << 4) |
                                  ((opp & 0x02) << 6))) |
                                // pha pha'
                                0x100);
                        }
                    };

                    // Prime the pump each frame to keep it jiggly.
                    error = Math.floor(Math.random() * this.randomizeError);

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.

                    switch (step & 3) {
                        case 0:
                            width = cellWidth; height = cellHeight;
                            cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                            nextCol = 1; nextRow = cellBufferWidth;
                            nextRowSkip = cellGutter * 2;
                            getTableIndex = function getTableIndex() {
                                // n => n, e => e, s => s, w => w
                                return getTableIndexUnrotated(
                                    nw, n, ne,
                                    w,  c, e,
                                    sw, s, se,
                                    phaseTime, (cellX & 1), (cellY & 1));
                            }
                            break;
                        case 1:
                            width = cellHeight; height = cellWidth;
                            cellIndex = cellBufferWidth + cellGutter + (cellWidth - 1);
                            nextCol = cellBufferWidth; nextRow = -1;
                            nextRowSkip = -(cellBufferWidth * cellHeight) - cellGutter;
                            getTableIndex = function getTableIndex() {
                                // n => w, e => n, s => e, w => s
                                return getTableIndexUnrotated(
                                    sw, w, nw,
                                    s,  c, n,
                                    se, e, ne,
                                    phaseTime, (cellY & 1) ^ 1, (cellX & 1));
                            };
                            break;
                        case 2:
                            width = cellWidth; height = cellHeight;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellWidth;
                            nextCol = -1; nextRow = -cellBufferWidth;
                            nextRowSkip = cellGutter * -2;
                            getTableIndex = function getTableIndex() {
                                // n => s, e => w, s => n, w => e
                                return getTableIndexUnrotated(
                                    se, s, sw,
                                    e,  c, w,
                                    ne, n, nw,
                                    phaseTime, (cellX & 1) ^ 1, (cellY & 1) ^ 1);
                            };
                            break;
                        case 3:
                            width = cellHeight; height = cellWidth;
                            cellIndex = ((cellGutter + cellHeight - 1) * cellBufferWidth) + cellGutter;
                            nextCol = -cellBufferWidth; nextRow = 1;
                            nextRowSkip = (cellBufferWidth * cellHeight) + 1;
                            getTableIndex = function getTableIndex() {
                                // n => e, e => s, s => w, w => n
                                return getTableIndexUnrotated(
                                    ne, e, se,
                                    n,  c, s,
                                    nw, w, sw,
                                    phaseTime, (cellY & 1), (cellX & 1) ^ 1);
                            };
                            break;
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            var tableIndex = getTableIndex();

                            var cell =
                                ruleTableBytes[tableIndex];

                            if (echoShift) {
                                cell |= c << echoShift;
                            }

                            if (heatShift) {

                                error += ((
                                    (nw & highMask) +  (e & highMask) + (ne & highMask) +
                                    (w  & highMask) +  ((c & mask) << heatShiftPollution)
                                                                      + (e  & highMask) +
                                    (sw & highMask) +  (s & highMask) + (se & highMask)) >> heatShift) +
                                    frob;

                                cell |= (error >> heatErrorShift) & highMask;

                                error -= (error & ~7);

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            },

            ////////////////////////////////////////////////////////////////////////
            // JohnVonNeumann29 neighborhood.

            {

                symbol: 'JohnVonNeumann29',

                name: 'JohnVonNeumann29',

                description: 'JohnVonNeumann29 neighborhood.',

                neighbors: ['state', 'up', 'down', 'left', 'right'],

                handleIndexGetFunction: function(type_metaData, indexKey, key, object_by_key, neighborhoodDict) {

                    // Make the map of cell symbols to cell values for the
                    // JohnVonNeumann29 neighborhood.

                    var cellValues = neighborhoodDict.cellValues;
                    if (cellValues) {
                        return;
                    }

                    cellValues = {};
                    neighborhoodDict.cellValues = cellValues;

                    var cellStates =
                        neighborhoodDict.cellStates;

                    for (var i = 0, n = cellStates.length;
                         i < n;
                         i++) {

                        var cellState =
                            cellStates[i];
                        var name =
                            cellState.name;
                        var value =
                            cellState.value;

                        cellValues[name] =
                            value;
                    }

                },

                neighborhoodFunction: (function() {

                    // This is a closure around the neighborhood function that defines
                    // the constants and utilities and variables used by the utilities,
                    // so we don't have to redefine them each time the neighborhood
                    // function is called.

                    // Cell states.
                    var U =    0x00;
                    var S =    0x01;
                    var S0 =   0x02;
                    var S1 =   0x03;
                    var S00 =  0x04;
                    var S01 =  0x05;
                    var S10 =  0x06;
                    var S11 =  0x07;
                    var S000 = 0x08;
                    var C00 =  0x10;
                    var C10 =  0x11;
                    var C01 =  0x90;
                    var C11 =  0x91;
                    var OR =   0x20;
                    var OU =   0x21;
                    var OL =   0x22;
                    var OD =   0x23;
                    var SR =   0x40;
                    var SU =   0x41;
                    var SL =   0x42;
                    var SD =   0x43;
                    var ORX =  0xa0;
                    var OUX =  0xa1;
                    var OLX =  0xa2;
                    var ODX =  0xa3;
                    var SRX =  0xc0;
                    var SUX =  0xc1;
                    var SLX =  0xc2;
                    var SDX =  0xc3;

                    // Constants.
                    var directionMask = 0x03;
                    var dirRight      = 0x00;
                    var dirUp         = 0x01;
                    var dirLeft       = 0x02;
                    var dirDown       = 0x03;
                    var excited       = 0x80;
                    var notExcited    = 0x7f;

                    var up, down, left, right, state;
                    var nextState, dir;

                    // Return 1 if pointed by an excited special transmission state,
                    // else returns 0.
                    function pointedByExcitedSpecial() {
                        return (
                          (right == SLX) ||
                          (up    == SDX) ||
                          (left  == SRX) ||
                          (down  == SUX));
                    }

                    // Return 1 if pointed by an excited ordinary transmission state,
                    // else returns 0.
                    function pointedByExcitedOrdinary() {
                        return (
                          (right == OLX) ||
                          (up    == ODX) ||
                          (left  == ORX) ||
                          (down  == OUX));
                    }

                    // Return 1 if pointed by an excited transmission state (ordinary or special),
                    // else returns 0.
                    function pointedToByExcitedOrdinaryOrSpecial() {
                        return (
                          (right == OLX) || (right == SLX) ||
                          (up    == ODX) || (up    == SDX) ||
                          (left  == ORX) || (left  == SRX) ||
                          (down  == OUX) || (down  == SUX));
                    }

                    // Return 1 if well pointed by an excited ordinary transmission state,
                    // else returns 0.
                    function wellPointedByExcitedOrdinary() {
                        return (
                          ((right == OLX) && (dir != dirRight)) ||
                          ((up    == ODX) && (dir != dirUp   )) ||
                          ((left  == ORX) && (dir != dirLeft )) ||
                          ((down  == OUX) && (dir != dirDown )));
                    }

                    // Return 1 if well pointed by an excited special transmission state,
                    // else returns 0.
                    function wellPointedByExcitedSpecial() {
                        return (
                          ((right == SLX) && (dir != dirRight)) ||
                          ((up    == SDX) && (dir != dirUp   )) ||
                          ((left  == SRX) && (dir != dirLeft )) ||
                          ((down  == SUX) && (dir != dirDown )));
                    }

                    // Return 1 if well flanked by an excited (not next excited) confluent state,
                    // else returns 0.
                    function wellFlankedByExcitedNotNextExcitedConfluent() {
                        return (
                          (((right == C10) || (right == C11)) && (dir != dirRight)) ||
                          (((up    == C10) || (up    == C11)) && (dir != dirUp   )) ||
                          (((left  == C10) || (left  == C11)) && (dir != dirLeft )) ||
                          (((down  == C10) || (down  == C11)) && (dir != dirDown )));
                    }

                    // Return if we should excite a confluent state.
                    function cascadeExcitedConfluent() {
                        return (((right  == OLX) ||
                                 (up     == ODX) ||
                                 (left   == ORX) ||
                                 (down   == OUX))  &&
                                ((right  != OL)  &&
                                  (up    != OD)  &&
                                  (left  != OR)  &&
                                  (down  != OU)));
                    }

                    // Return excited confluent state.
                    function exciteConfluent() {
                        if ((state == C00) ||
                            (state == C10)) {
                            return C01;
                        } else {
                            return C11;
                        } // if
                    }

                    // Return decayed confluent state.
                    function decayConfluent() {
                        if ((state == C00) ||
                            (state == C10)) {
                            return C00;
                        } else {
                            return C10;
                        } // if
                    }

                    return function neighborhoodFunction_JohnVonNeumann29(neighborhoodDict, ruleDict) {

                        var cells = this.getCells();
                        var nextCells = this.getNextCells();
                        var cellWidth = this.cellWidth;
                        var cellHeight = this.cellHeight;
                        var cellGutter = this.cellGutter;
                        var cellBufferWidth = this.cellBufferWidth;
                        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                        var heatShiftPollution = this.heatShiftPollution;
                        var step = this.step;
                        var phaseTime = this.phaseTime;

                        if (this.doHistogram) {
                            for (var cell = 0; cell < 256; cell++) {
                                this.histogram[cell] = 0;
                            }
                        }

                        for (var cellY = 0;
                             cellY < cellHeight;
                             cellY++) {

                            state = cells[cellIndex - 1];  right = cells[cellIndex + 0];

                            for (var cellX = 0;
                                 cellX < cellWidth;
                                 cellX++) {

                                               up    = cells[cellIndex - cellBufferWidth];
                                left = state;  state = right;  right = cells[cellIndex + 1];
                                               down  = cells[cellIndex + cellBufferWidth];

                                dir = state & directionMask;
                                nextState = state;

                                switch (state) {

                                    case U: // Unexcited empty state.
                                        if ((right == U) &&
                                            (up    == U) &&
                                            (left  == U) &&
                                            (down  == U)) {
                                            // In the middle of nowhere, so no change.
                                        } else if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = S; // Start creating a new sensitized state in an empty cell.
                                        } else {
                                            // no change
                                        } // if
                                        break;

                                    case OR: // Ordinary arrow states, with four directions and one bit of excitement.
                                    case OU:
                                    case OL:
                                    case OD:
                                    case ORX:
                                    case OUX:
                                    case OLX:
                                    case ODX:
                                        if (pointedByExcitedSpecial()) {
                                            nextState = U; // // Erase to unexcited empty state.
                                        } else if (wellFlankedByExcitedNotNextExcitedConfluent() ||
                                                   wellPointedByExcitedOrdinary()) {
                                            nextState |= excited; // Become excited.
                                        } else {
                                            nextState &= notExcited; // Calm down.
                                        } // if
                                        break;

                                    case SR: // Special arrow states, with four directions and one bit of excitement.
                                    case SU:
                                    case SL:
                                    case SD:
                                    case SRX:
                                    case SUX:
                                    case SLX:
                                    case SDX:
                                        if (pointedByExcitedOrdinary()) {
                                            nextState = U; // Erase to unexcited empty state.
                                        } else if (wellFlankedByExcitedNotNextExcitedConfluent() ||
                                                   wellPointedByExcitedSpecial()) {
                                            nextState |= excited; // Become excited.
                                        } else {
                                            nextState &= notExcited; // Calm down.
                                        } // if
                                        break;

                                    case C00: // Confluent switch states, with two bits of excitement.
                                    case C10:
                                    case C01:
                                    case C11:
                                        if (pointedByExcitedSpecial()) {
                                            nextState = U; // Erase to unexcited empty state.
                                        } else if (cascadeExcitedConfluent()) {
                                            nextState = exciteConfluent(); // Become excited.
                                        } else {
                                            nextState = decayConfluent(); // Calm down.
                                        } // if
                                        break;

                                    case S: // Sensitized construction state, creating another
                                            // state from huffman encoded construction instructions.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = S1; // Branch to next sensitized state S => S1. Continue...
                                        } else {
                                            nextState = S0; // Branch to next sensitized state S => S0. Continue...
                                        } // if
                                        break;

                                    case S0: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = S01; // Branch to next sensitized state S0 => S01. Continue...
                                        } else {
                                            nextState = S00; // Branch to next sensitized state S0 => S00. Continue...
                                        } // if
                                        break;

                                    case S1: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = S11; // Branch to next sensitized state S1 => S11. Continue...
                                        } else {
                                            nextState = S10; // Branch to next sensitized state S1 => S10. Continue...
                                        } // if
                                        break;

                                    case S00: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = OL; // Create an ordinary left state S00 => OL. Done!
                                        } else {
                                            nextState = S000; // Branch to next sensitized state S00 => S000. Continue...
                                        } // if
                                        break;

                                    case S01: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                          nextState = SR; // Create a special right state S01 => SR. Done!
                                        } else {
                                          nextState = OD; // Create an ordinary down state S01 => OD. Done!
                                        } // if
                                        break;

                                    case S10: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                            nextState = SL; // Create a special left state S10 => SL. Done!
                                        } else {
                                            nextState = SU; // Create a special up state S10 => SU. Done!
                                        } // if
                                        break;

                                    case S11: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                          nextState = C00; // Create a confluent state S11 => C00. Done!
                                        } else {
                                          nextState = SD; // Create a special down state S11 => SD. Done!
                                        } // if
                                        break;

                                    case S000: // Sensitized construction state, creating another state.
                                        if (pointedToByExcitedOrdinaryOrSpecial()) {
                                          nextState = OU; // Create an ordinary up state S000 => OU. Done!
                                        } else {
                                          nextState = OR; // Create an ordinary right state S000 => OR. Done!
                                        } // if
                                        break;

                                    default:
                                        nextState = U; // Change unknown states to unexcited state.
                                        break;

                                } // switch

                                nextCells[cellIndex] =
                                    nextState;

                                if (this.doHistogram) {
                                    this.histogram[nextState]++;
                                }

                                cellIndex++;

                            } // for cellX

                            // Skip the gutter.
                            cellIndex += 2;

                        } // for cellY

                    };

                }).call(this),

                // Instructions to the jvn29 construction arm, whose tip
                // is an arrow pointing into an unexcited state, that
                // creates a sensitized state which evolves into other
                // states over time, given the following excitement inputs.

                constructionInstructions: {
                    OR:  '10000', // => S S0 S00 S000 OR
                    OU:  '10001', // => S S0 S00 S000 OU
                    OL:  '1001',  // => S S0 S00 OL
                    OD:  '1010',  // => S S0 S01 OD
                    SR:  '1011',  // => S S0 S01 SR
                    SU:  '1100',  // => S S1 S10 SU
                    SL:  '1101',  // => S S1 S10 SL
                    SD:  '1110',  // => S S1 S11 SD
                    C00: '1111'   // => S S1 S11 C00
                },

                // Array of dicts describing cell values for jvn29.

                cellStates: [
                    { symbol: 'U',    value: 0x00, name: 'Unexcited'              },
                    { symbol: 'S',    value: 0x01, name: 'Sensitized'             },
                    { symbol: 'S0',   value: 0x02, name: 'Sensitized 0'           },
                    { symbol: 'S1',   value: 0x03, name: 'Sensitized 1'           },
                    { symbol: 'S00',  value: 0x04, name: 'Sensitized 00'          },
                    { symbol: 'S01',  value: 0x05, name: 'Sensitized 01'          },
                    { symbol: 'S10',  value: 0x06, name: 'Sensitized 10'          },
                    { symbol: 'S11',  value: 0x07, name: 'Sensitized 11'          },
                    { symbol: 'S000', value: 0x08, name: 'Sensitized 000'         },
                    { symbol: 'C00',  value: 0x10, name: 'Confluent 00'           },
                    { symbol: 'C10',  value: 0x11, name: 'Confluent 10'           },
                    { symbol: 'C01',  value: 0x90, name: 'Confluent 01'           },
                    { symbol: 'C11',  value: 0x91, name: 'Confluent 11'           },
                    { symbol: 'OR',   value: 0x20, name: 'Ordinary Right'         },
                    { symbol: 'OU',   value: 0x21, name: 'Ordinary Up'            },
                    { symbol: 'OL',   value: 0x22, name: 'Ordinary Left'          },
                    { symbol: 'OD',   value: 0x23, name: 'Ordinary Down'          },
                    { symbol: 'SR',   value: 0x40, name: 'Special Right'          },
                    { symbol: 'SU',   value: 0x41, name: 'Special Up'             },
                    { symbol: 'SL',   value: 0x42, name: 'Special Left'           },
                    { symbol: 'SD',   value: 0x43, name: 'Special Down'           },
                    { symbol: 'ORX',  value: 0xa0, name: 'Ordinary Right Excited' },
                    { symbol: 'OUX',  value: 0xa1, name: 'Ordinary Up Excited'    },
                    { symbol: 'OLX',  value: 0xa2, name: 'Ordinary Left Excited'  },
                    { symbol: 'ODX',  value: 0xa3, name: 'Ordinary Down Excited'  },
                    { symbol: 'SRX',  value: 0xc0, name: 'Special Right Excited'  },
                    { symbol: 'SUX',  value: 0xc1, name: 'Special Up Excited'     },
                    { symbol: 'SLX',  value: 0xc2, name: 'Special Left Excited'   },
                    { symbol: 'SDX',  value: 0xc3, name: 'Special Down Excited'   }
                ],

                // Map of cell jvn29 names to cell values, computed by
                // handleIndexGetFunction.
                cellValues: null

            },

            ////////////////////////////////////////////////////////////////////////
            // RISCA neighborhood.

            {

                symbol: 'RISCA',

                name: 'RISCA',

                description: 'Ridiculous Instruction Set Cellular Automata.',

                neighbors: ['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se'],

                neighborhoodFunction: function neighborhoodFunction_Life(neighborhoodDict, ruleDict) {

                    var cells = this.getCells();
                    var nextCells = this.getNextCells();
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;
                    var cellGutter = this.cellGutter;
                    var cellBufferWidth = this.cellBufferWidth;
                    var step = this.step;
                    var frob = this.frob;
                    var nw, n, ne;
                    var w,  c,  e;
                    var sw, s, se;
                    var error = 0;
                    var cellIndex;
                    var nextCol;
                    var nextRow;
                    var nextRowSkip;
                    var width;
                    var height;
                    var sum;
                    var cell;

                    if (this.doHistogram) {
                        for (cell = 0; cell < 256; cell++) {
                            this.histogram[cell] = 0;
                        }
                    }

                    // Prime the pump each frame to keep it jiggly.
                    //error = Math.floor(Math.random() * 256) & 7;

                    // Rotate the direction of scanning 90 degrees every step,
                    // to cancel out the dithering artifacts that would cause the
                    // heat to drift up and to the right.


                    width = cellWidth; height = cellHeight;
                    cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
                    nextCol = 1; nextRow = cellBufferWidth;
                    nextRowSkip = cellGutter * 2;

                    function sum8mask(mask) {
                        return (((nw & mask) + (n  & mask) + (ne & mask) + 
                                 (w  & mask) +               (e  & mask) + 
                                 (sw & mask) + (s  & mask) + (se & mask)));
                    }

                    function sum9mask(mask) {
                        return (((nw & mask) + (n  & mask) + (ne & mask) +
                                 (w  & mask) + (c  & mask) + (e  & mask) +
                                 (sw & mask) + (s  & mask) + (se & mask)));
                    }

                    for (var cellY = 0;
                         cellY < height;
                         cellY++) {

                        // Load the right two columns of the 3x3 window.
                        n  = cells[cellIndex - nextCol - nextRow];  ne = cells[cellIndex - nextRow];
                        c  = cells[cellIndex - nextCol          ];  e  = cells[cellIndex          ];
                        s  = cells[cellIndex - nextCol + nextRow];  se = cells[cellIndex + nextRow];

                        for (var cellX = 0;
                             cellX < width;
                             cellX++) {

                            // Scroll the 3x3 window to the right, scrolling the middle and right
                            // columns to the left, then scooping up three new cells from the right
                            // leading edge.
                            nw = n;  n = ne;  ne = cells[cellIndex + nextCol - nextRow];
                            w  = c;  c =  e;  e  = cells[cellIndex + nextCol          ];
                            sw = s;  s = se;  se = cells[cellIndex + nextCol + nextRow];

                            cell = c & 0xf0;

                            switch (cell) {

                                case 0x00: // c
                                    cell |=
                                        (c & 0x0f) ;
                                    break;

                                case 0x10: // life
                                    sum = (sum8mask(8) >> 3);
                                    cell |=
                                        ((c & 0x0e) >> 1) |
                                        (((((c & 8) && ((sum == 2) || (sum == 3))) || (sum == 3)) ? 1 : 0) << 3);
                                    break;

                                case 0x20: // brain
                                    cell |=
                                        ((c & 0x0e) >> 1) |
                                        (((((c & 0x0c) == 0) && (((sum8mask(8) >> 3) == 2))) ? 1 : 0) << 3);
                                    break;

                                case 0x30: // torben
                                    sum = (sum9mask(8) >> 3);
                                    cell |=
                                        ((c & 0x0e) >> 1) |
                                        ((((sum > 6) || (sum == 5) || (sum == 3)) ? 1 : 0) << 3);
                                    break;

                                case 0x40: // anneal
                                    sum = (sum9mask(8) >> 3);
                                    cell |=
                                        ((c & 0x0e) >> 1) |
                                        (((((sum > 5) || (sum == 4))) ? 1 : 0) << 3);
                                    break;

                                case 0x50: // ditto
                                    sum = (sum9mask(8) >> 3);
                                    cell |=
                                        ((c & 0x0e) >> 1) |
                                        ((sum > 5) << 3);
                                    break;

                                case 0x60: // logic
                                    {
                                        cell |= (c & 0x07);

                                        switch (c & 0x0f) {

                                            case 0x00: // and
                                            case 0x08:
                                                cell |= (nw & w) & 8;
                                                break;

                                            case 0x01: // or
                                            case 0x09:
                                                cell |= (nw | w) & 8;
                                                break;

                                            case 0x02: // xor
                                            case 0x0a:
                                                cell |= (nw ^ w) & 8;
                                                break;

                                            case 0x03: // nand
                                            case 0x0b:
                                                cell |= (~(nw & w)) & 8;
                                                break;

                                            case 0x04: // nor
                                            case 0x0c:
                                                cell |= (~(nw | w)) & 8;
                                                break;

                                            case 0x05: // equiv
                                            case 0x0d:
                                                cell |= (~(nw ^ w)) & 8;
                                                break;

                                            case 0x06: // flip state 0
                                                cell |= (nw & 8);
                                                break;

                                            case 0x0e: // flop state 1
                                                cell |= ((~w) & 8);
                                                break;

                                            case 0x07: // relay
                                            case 0x0f:
                                                cell |= ((w & 8) ? sw : nw) & 8;
                                                break;

                                        }

                                    }
                                    break;

                                case 0x70: // n
                                    cell |= (n & 0x0f) ;
                                    break;

                                case 0x80: // nw
                                    cell |= (nw & 0x0f) ;
                                    break;

                                case 0x90: // w
                                    cell |= (w & 0x0f) ;
                                    break;

                                case 0xa0: // sw
                                    cell |= (sw & 0x0f) ;
                                    break;

                                case 0xb0: // s
                                    cell |= (s & 0x0f) ;
                                    break;

                                case 0xc0: // se
                                    cell |= (se & 0x0f) ;
                                    break;

                                case 0xd0: // e
                                    cell |= (e & 0x0f) ;
                                    break;

                                case 0xe0: // ne
                                    cell |= (ne & 0x0f) ;
                                    break;

                                case 0xf0: // heat
                                    error += nw + n + ne + w + e + sw + s + se + frob;
                                    cell |= ((error >> 3) & 0x0f);
                                    error &= 7;
                                    break;

                            }

                            nextCells[cellIndex] =
                                cell;

                            if (this.doHistogram) {
                                this.histogram[cell]++;
                            }

                            cellIndex += nextCol;
                        }

                        // Skip the gutter.
                        cellIndex += nextRowSkip;
                    }

                }

            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The rule objects describe each cellular automata rule. Each
    // rule has a name and a description for human consumption, and
    // the symbol of a neighborhood, plus additional parameters for
    // the neighborhood and general purpose CA simulation machinery.
    // For the lookup table based rules, the ruleDict contains a an
    // array called neighbors containing an array of neighbor symbols,
    // in the order that they appear in the lookup table index, and a
    // function called ruleFunction that is called by the rule
    // computer for all possible neighbor inputs, to generate the
    // lookup table. This is done the first time the rule is used, and
    // cached in the ruleDict.  The paramsUsed dictionary contains
    // keys for parameters that the rule depends on, so the user
    // interface can hide the parameters that don't apply to the rule.
    //


    ////////////////////////////////////////////////////////////////////////
    // Rule functions and rule utilities, called to create a lookup
    // table for the table based neighborhoods. They all take a state
    // dictionary that contains keys for each of the neighborhood
    // inputs, and the value of those inputs, and they return the next
    // value of the cell.  These rule functions are evaluated over al
    // possible combinations of inputs, to generate a lookup table for
    // the neighborhood code to efficiently execute. So it does not
    // matter how efficient these functions are, since they are run
    // when compiling the rule table, but not in the inner loop.


    // ruleUtil_Moore_sum8_0 sums the 8 neighbors in plane 0.
    function ruleUtil_Moore_sum8_0(state) {
        var sum8 =
            state.nw0 + state.n0 + state.ne0 +
            state.w0  +            state.e0 +
            state.sw0 + state.s0 + state.se0;
        return sum8;
    }


    // ruleUtil_Moore_sum9_0 sums the 9 neighbors in plane 0.
    function ruleUtil_Moore_sum9_0(state) {
        var sum8 =
            state.nw0 + state.n0 + state.ne0 +
            state.w0  + state.c0 + state.e0  +
            state.sw0 + state.s0 + state.se0;
        return sum8;
    }


    // ruleUtil_Moore_centers_0 returns the 2 bit value of the
    // center cells in plane 0 and 1.
    function ruleUtil_Moore_centers_0(state) {
        var centers =
            state.c0 |
            (state.c1 << 1);
        return centers;
    }


    // ruleUtil_Moore_centers_2 returns the 2 bit value of the
    // center cells in plane 2 and 3.
    function ruleUtil_Moore_centers_2(state) {
        var centers =
            state.c2 |
            (state.c3 << 1);
        return centers;
    }


    // ruleFunction_Moore_worms computes the worms rule Moore
    // neighborhood lookup tables. The personality of the worms
    // is parameterized by alarms, an array of nine output value
    // bits, which is indexed by the count of excited neighbors.
    function ruleFunction_Moore_worms(ruleDict, state) {

        var personality = ruleDict.personality;

        // The personality is a key into the dict of alarm arrays,
        // which are indexed by the count of excited neighbors,
        // and contain 1 if the cell should be excited or 0 if
        // not.
        var alarms = {

            // This results in spirals with tight straight diagonal diamonds.
            yuppie:   [0, 0, 1, 1, 1, 1, 1, 1, 1],

            // This results in spirals with loose smooth rounded diamonds.
            hipster:  [0, 0, 0, 1, 1, 1, 1, 1, 1],

            // This results in spirals with looser rustic fuzzy spirals.
            // That is due to the anneal-like discontinuity in the alarm table.
            bohemian: [0, 0, 1, 0, 1, 1, 1, 1, 1]

        }[personality];

        // The count-down timer is in center2 (bits 2 and 3 of the cell).
        // after the cell is excited, the timer is set to 3, and starts
        // counting down to zero. The cell can't be excited again until
        // the timer reaches zero.
        var centers2 =
            ruleUtil_Moore_centers_2(state);

        // If the timer is zero, then the cell can be excited again.
        var canBeExcited =
            [1, 0, 0, 0][centers2];

        // Count the number of neighboring cells who are excited.
        var sum8 =
            ruleUtil_Moore_sum8_0(state);

        // Look up in the alarm array if we are excited about having
        // that number of excited neighbors.
        var isExcited =
            alarms[sum8];

        // Start the timer if the timer was zero last step (so c0 is
        // 1), and we were excited last step (so c1 is 1).
        var startTimer =
            state.c0 &&
            state.c1;

        // The new value of the timer is three if we're restarting the
        // timer, or one less than the previous value of the timer,
        // until it reaches zero.
        var newTimer =
            startTimer
                ? 3
                : [0, 0, 1, 2][centers2];

        // The result has bit 0 set if we can be excited, bit 1 set if
        // we are excited, and bits 2 and 3 are the new value of the
        // timer.
        var result =
            (canBeExcited << 0) |
            (isExcited << 1) |
            (newTimer << 2);

        return result;
    }


    // ruleFunction_VonNeumann_hglass computes the hglass rule
    // VonNeumann neighborhood lookup tables, parameterized by
    // neighbors, an array of five input neighbor symbols.
    function ruleFunction_VonNeumann_hglass(ruleDict, state) {

        // The orientation parameter from the ruleDict is a key into
        // the dictionary of arrays of neighborhood names, used to
        // make the different rotations of the hglass rule. The bit
        // values of those neighbors are concatinated into an index
        // into the glassTable array, so we can rotate the rule around
        // in four different directions by permuting the neighbors.

        var orientation = ruleDict.orientation;

        var hglassNeighbors = {
            'up'   : ['c0', 's0', 'n0', 'e0', 'w0'],
            'down' : ['c0', 'n0', 's0', 'w0', 'e0'],
            'left' : ['c0', 'e0', 'w0', 'n0', 's0'],
            'right': ['c0', 'w0', 'e0', 's0', 'n0']
        }[orientation];

        var glassTable = [
            0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 0, 1, 1, 1
        ];

        var glassIndex = 0;
        for (var shift = 0, n = hglassNeighbors.length;
             shift < n;
             shift++) {

            var neighbor =
                hglassNeighbors[shift];

            glassIndex |=
                state[neighbor] << shift;
        }

        var cell =
            glassTable[glassIndex];

        return cell;
    }


    // ruleFunction_VonNeumann4_hglass_all computes the four 
    // hglass rule VonNeumann neighborhood lookup tables.
    function ruleFunction_VonNeumann4_hglass_all(ruleDict, state) {

        // The orientation parameter from the ruleDict is a key into
        // the dictionary of arrays of neighborhood names, used to
        // make the different rotations of the hglass rule. The bit
        // values of those neighbors are concatinated into an index
        // into the glassTable array, so we can rotate the rule around
        // in four different directions by permuting the neighbors.

        var orientation = state.shift0 + (state.shift1 << 1);

        var hglassNeighbors = [
            ['c0', 's0', 'n0', 'e0', 'w0'],
            ['c0', 'n0', 's0', 'w0', 'e0'],
            ['c0', 'e0', 'w0', 'n0', 's0'],
            ['c0', 'w0', 'e0', 's0', 'n0']
        ][orientation];

        var glassTable = [
            0, 1, 1, 1, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,
            0, 1, 0, 0, 0, 1, 1, 1
        ];

        var glassIndex = 0;
        for (var shift = 0, n = hglassNeighbors.length;
             shift < n;
             shift++) {

            var neighbor =
                hglassNeighbors[shift];

            glassIndex |=
                state[neighbor] << shift;
        }

        var cell =
            glassTable[glassIndex];

        return cell;
    }


    // ruleFunction_Moore_life computes the life rule Moore
    // neighborhood lookup table.
    function ruleFunction_Moore_life(ruleDict, state) {

        var sum8 =
                ruleUtil_Moore_sum8_0(state);

        if (state.c0) {

            return (((sum8 == 2) ||
                    (sum8 == 3))
                ? 1 : 0);

        } else {

            return ((sum8 == 3)
                ? 1 : 0);

        }

    }


    // ruleFunction_Moore_brain computes the brain rule Moore
    // neighborhood lookup table.
    function ruleFunction_Moore_brain(ruleDict, state) {

        var cell =
            state.c0 << 1;

        if ((state.c0 == 0) &&
            (state.c1 == 0)) {

            var sum8 =
                ruleUtil_Moore_sum8_0(state);

            if (sum8 == 2) {
                cell |= 1;
            }

        }

        return cell;
    }


    // ruleFunction_Moore_brain computes the brain rule Moore
    // neighborhood lookup table.
    function ruleFunction_Moore4_quad(ruleDict, state) {

        var plane =
            (state.p1 << 1) |
            (state.p0     );

        var cell = 0;

        switch (plane) {

            case 0:

                // Life

                var sum8 =
                        ruleUtil_Moore_sum8_0(state);

                if (sum8 &&
                    //(state.u0 | state.u1)
                    (state.u0 && state.u1)
                ) {
                    sum8--;
                }

                if (state.c0) {

                    cell = (((sum8 == 2) ||
                             (sum8 == 3))
                        ? 1 : 0);

                } else {

                    cell = ((sum8 == 3)
                        ? 1 : 0);

                }

                cell |= state.c0 >> 1;

                break;

            case 1:

                // Torben / Anneal

                var torben =
                    [1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0][
                        state.nw1 + state.n1  + state.ne1 +   // nw n  ne
                        state.w1  + state.c1  + state.e1  +   // w  c  e 
                        state.sw1 + state.s1  + state.se1 +   // sw s  se
                        //(state.u0 | state.u1) +               // up: anything in 2 planes above
                        (state.u0 + state.u1) +               // up: anything in 2 planes above
                        state.c0                              // down: anneal in plane below
                    ] << 1;

                var anneal =
                    [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0][
                        state.nw0 + state.n0  + state.ne0 +   // nw n  ne
                        state.w0  + state.c0  + state.e0  +   // w  c  e
                        state.sw0 + state.s0  + state.se0 +   // sw s  se
                        state.c1  +                           // up: torben in plane above
                        //(state.d0 | state.d1)                 // down: anything in 2 planes below
                        (state.d0 + state.d1)                 // down: anything in 2 planes below
                    ];
                
                cell = (anneal | torben) ^ 0x03;

                break;

            case 2:

                // Life

                var sum8 =
                        ruleUtil_Moore_sum8_0(state);

                if (sum8 &&
                    (state.d0 | state.d1)) {
                    sum8--;
                }

                if (state.c0) {

                    cell = (((sum8 == 2) ||
                             (sum8 == 3))
                        ? 1 : 0);

                } else {

                    cell = ((sum8 == 3)
                        ? 1 : 0);

                }

                cell |= state.c0 >> 1;

                break;

            case 3:

                // Brain

                cell =
                    state.c0 << 1;

                if ((state.c0 == 0) &&
                    (state.c1 == 0)) {

                    var sum8 =
/*
                        (state.u0 || state.u1) +
                        (state.d0 || state.d1)) +
*/
                        (state.u0 && state.d0) +
                        ruleUtil_Moore_sum8_0(state);

                    if (sum8 == 2) {
                        cell |= 1;
                    }

                }

                break;

        }

        return cell;
    }


    // ruleUtil_Margolus_sum4 sums the four Margolus neighbors.
    function ruleUtil_Margolus_sum4(state) {
        var sum4 =
            state.c0   + state.cw0 +
            state.ccw0 + state.opp0;
        return sum4;
    }


    // ruleUtil_Margolus_hvgas_collision checks for a collision for
    // the hvgas rule.
    function ruleUtil_Margolus_hvgas_collision(state) {
        return ((state.c0  == state.opp0) &&
                (state.cw0 == state.ccw0) &&
                (state.c0  != state.cw0));
    }


    // ruleUtil_Margolus_hvgas_wall checks for a wall for the hvgass
    // rule.
    function ruleUtil_Margolus_hvgas_wall(state) {
        return (
            state.c1   | state.cw1 |
            state.ccw1 | state.opp1);
    }


    // ruleFunction_Margolus_hvgas computes the hvgas rule Margolus
    // neighborhood lookup table.
    function ruleFunction_Margolus_hvgas(ruleDict, state) {

        var plane1 = state.c1 << 1;

        if (ruleUtil_Margolus_hvgas_wall(state) ||
            ruleUtil_Margolus_hvgas_collision(state)) {

            return state.c0 | plane1;

        } else {

            if (state.pha0) {

                return state.cw0 | plane1;

            } else {

                return state.ccw0 | plane1;

            }

        }

    }


    // ruleFunction_Margolus_wavers computes the wavers rule Margolus
    // neighborhood lookup table.
    function ruleFunction_Margolus_wavers(ruleDict, state) {

        var index =
            ruleUtil_Margolus_sum4(state);

        var result = [
            1 - state.c0,
            1 - state.c0,
            state.c0,
            1 - state.c0,
            1 - state.opp0
        ][index];

        return result;
    }


    // ruleFunction_Margolus_critters computes the critters rule Margolus
    // neighborhood lookup table.
    function ruleFunction_Margolus_critters(ruleDict, state) {

        var index =
            ruleUtil_Margolus_sum4(state);

        var result = [
            1 - state.c0,
            1 - state.c0,
            state.c0,
            1 - state.opp0,
            1 - state.c0
        ][index];

        return result;
    }


    // ruleFunction_Margolus_tron computes the tron rule Margolus
    // neighborhood lookup table.
    function ruleFunction_Margolus_tron(ruleDict, state) {

        var index =
            ruleUtil_Margolus_sum4(state);

        var result = [
            1,
            state.c0,
            state.c0,
            state.c0,
            0
        ][index];

        return result;
    }


    // ruleFunction_Margolus_dendrite computes the dendrite rule
    // Margolus neighborhood lookup table.
    //
    // Cellular Automata Machines, p. 167, 15.7 Diffusion-limited
    // aggregation.
    //
    function ruleFunction_Margolus_dendrite(ruleDict, state) {

        // The cell is frozen if bit plane 1 is set.
        var frozen =
            state.c1   | state.cw1 |
            state.ccw1 | state.opp1;

        if (frozen) {

            // If frozen, then stay the same.
            result =
                state.c0 | (state.c0 << 1);

        } else {

            // Count the number of neighboring cells that have
            // particles in bit plane 0.
            var index =
                ruleUtil_Margolus_sum4(state);

            result = [
                // If none of the four neighbors have particles, then
                // stay the same value, which is zero.
                state.c0,
                // If just one of four neighbors has a particle, then
                // take on the value of the opposite cell, so the
                // particle reflects to the opposite corner,
                // traveling diagonally.
                state.opp0,
                // If two of the four neighbors are particles, then in
                // the case of diagonally opposed particles, invert
                // their values, so they rotate 90 degrees so they
                // collide off of each other diagonally; but in the
                // state of two adacent particles, stay the same so
                // they create a static solid area.
                ((state.c0 & state.opp0)
                    ? 0
                    : ((state.cw0 & state.ccw0)
                        ? 1
                        : state.c0)),
                // If three of the four neighbors are particles, then
                // stay the same so they create a static solid area.
                state.c0,
                // If all four of the neighbors are particles, then
                // stay the same so they create a static solid area.
                state.c0
            ][index];
        }

        return result;
    }


    // ruleFunction_VonNeumann_spinsOnly computes the Spins Only rule
    // for VonNeumann neighborhood lookup table.
    //
    // Cellular Automata Machines, p. 190, section 17.3, Spins Only.
    //
    // This models a spin glass, which is a matrix of atoms with
    // magnetic spins (up or down).
    //
    // https://en.wikipedia.org/wiki/Spin_glass
    //
    // A spin glass is a disordered magnet with frustrated
    // interactions, augmented by stochastic positions of the spins,
    // where conflicting interactions, namely both ferromagnetic and
    // also antiferromagnetic bonds, are randomly distributed with
    // comparable frequency. The term "glass" comes from an analogy
    // between the magnetic disorder in a spin glass and the
    // positional disorder of a conventional, chemical glass, e.g.,
    // a window glass.
    //
    // Spin glasses display many metastable structures, leading to a
    // plenitude of time scales which are difficult to explore
    // experimentally or in simulations.
    //
    function ruleFunction_VonNeumann_spinsOnly(ruleDict, state) {

        // This makes a checkerboard pattern that alternates every
        // step, so we can apply the rule to every other cell every
        // other step. That way we know our four neighbors will not be
        // changing at the same time we are changing.
        var activeSite =
            (state.horiz ^ state.phaseTime) == state.vert;

        // Count how many of our four neighbors are set.
        var sum4 =
                 state.n0 +
            state.w0 + state.e0 +
                 state.s0;

        // When it is our turn to run in this cell (at every other
        // step), then we flip our value if exactly two of our
        // neighbors are up, and two are down. Since energy is stored
        // in two adjacent cells with different spins, we can flip our
        // value without changing the energy of the system, because
        // the perimeter between up and down cells remains the same.
        var result =
            (activeSite
                ? [
                    state.c0,
                    state.c0,
                    state.c0 ^ 1,
                    state.c0,
                    state.c0
                  ][sum4]
               : state.c0);

        return result;
    }


    ////////////////////////////////////////////////////////////////////////
    // The rule type.


    defineType(
        'rule',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'WavyMarble',
                name: 'Wavy Marble',
                description: 'Simulated wavy marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'south',
                    'center',
                    'southWest',
                    'horizontal',
                    'west',
                    'center_loose_square',
                    'northWest',
                    'diagonal_slash',
                    'north',
                    'center_loose_round',
                    'northEast',
                    'vertical',
                    'east',
                    'center_loose_cross',
                    'southEast',
                    'diagonal_backslash'
                ]
            },

            {
                symbol: 'FireyMarble',
                name: 'Firey Marble',
                description: 'Simulated firey marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'south',
                    'southWest',
                    'south',
                    'west',
                    'southWest',
                    'south',
                    'southEast',
                    'south',
                    'east',
                    'southWest',
                    'south',
                    'southEast',
                    'south',
                    'southWest',
                    'south',
                    'southEast'
                ]
            },

            {
                symbol: 'FreakyMarble',
                name: 'Freaky Marble',
                description: 'Simulated freaky marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'north',
                    'south',
                    'northEast',
                    'southWest',
                    'east',
                    'west',
                    'southEast',
                    'northWest',
                    'west',
                    'east',
                    'southWest',
                    'northEast',
                    'south',
                    'north',
                    'northWest',
                    'southEast'
                ]
            },

            {
                symbol: 'TwistyMarble',
                name: 'Twisty Marble',
                description: 'Simulated twisty marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'north',
                    'northEast',
                    'east',
                    'southEast',
                    'south',
                    'southWest',
                    'west',
                    'northWest',
                    'north',
                    'northEast',
                    'east',
                    'southEast',
                    'south',
                    'southWest',
                    'west',
                    'northWest'
                ]
            },

            {
                symbol: 'TwistierMarble',
                name: 'Twistier Marble',
                description: 'Simulated twistier marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'north',
                    'northEast',
                    'east',
                    'southEast',
                    'south',
                    'southWest',
                    'west',
                    'northWest',
                    'norther',
                    'northEaster',
                    'easter',
                    'southEaster',
                    'souther',
                    'southWester',
                    'wester',
                    'northWester'
                ]
            },

            {
                symbol: 'FuzzyMarble',
                name: 'Fuzzy Marble',
                description: 'Simulated fuzzy marble.',
                pie: 'default',
                neighborhood: 'Marble',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'center_0',
                    'center_1',
                    'center_2',
                    'center_3',
                    'center_4',
                    'center_5',
                    'center_6',
                    'center_7',
                    'horizontal',
                    'diagonal_slash',
                    'vertical',
                    'diagonal_backslash',
                    'center_cross',
                    'center_loose_round',
                    'center_loose_cross',
                    'center_loose_square'
                ]
            },

            {
                symbol: 'FunkyFlower',
                name: 'Funky Flower',
                description: 'Funky flower.',
                pie: 'default',
                neighborhood: 'Flower',
                toolCells: [0, 32, 64, 128, 192, 255],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    phaseScale: true,
                    phaseOffset: true,
                    phaseShiftX: true,
                    phaseShiftY: true,
                    phaseShiftCell: true,
                    phaseShiftStep: true
                },
                kernelSymbols: [
                    'center_7',
                    'center_6',
                    'center_5',
                    'center_4',
                    'center_3',
                    'center_2',
                    'center_1',
                    'center_0',
                    'north',
                    'northEast',
                    'east',
                    'southEast',
                    'south',
                    'southWest',
                    'west',
                    'northWest'
                ]
            },

            {
                symbol: 'Life',
                name: 'Life',
                description: 'The classic Life.',
                pie: 'default',
                neighborhood: 'Life',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Life_Echo',
                name: 'Life Echo',
                description: 'The classic Life, with echo.',
                pie: 'default',
                neighborhood: 'Life',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Life_Heat',
                name: 'Life Heat',
                description: 'The classic Life, with heat.',
                pie: 'default',
                neighborhood: 'Life',
                mask: 0x01,
                toolCells: [0, 1],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x01,
                echoShift: 0,
                heatShift: 1,
                heatErrorShift: 2
            },

            {
                symbol: 'Brain',
                name: 'Brain',
                description: 'The classic Brain.',
                pie: 'default',
                neighborhood: 'Brain',
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Brain_Echo',
                name: 'Brain Echo',
                description: 'The classic Brain, with echo.',
                pie: 'default',
                neighborhood: 'Brain',
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 2,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Brain_Heat',
                name: 'Brain Heat',
                description: 'The classic Brain, with heat.',
                pie: 'default',
                neighborhood: 'Brain',
                toolCells: [0, 1, 2, 3],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x03,
                echoShift: 0,
                heatShift: 2,
                heatErrorShift: 1
            },

            {
                symbol: 'Eco',
                name: 'Eco',
                description: 'The classic Eco.',
                pie: 'default',
                neighborhood: 'Eco',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7],
                paramsUsed: {},
                mask: 0x07,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },
            {
                symbol: 'Eco_Echo',
                name: 'Eco Echo',
                description: 'The classic Eco, with echo.',
                pie: 'default',
                neighborhood: 'Eco',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7],
                paramsUsed: {},
                mask: 0x07,
                echoShift: 3,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Eco_Heat',
                name: 'Eco Heat',
                description: 'The classic Eco, with heat.',
                pie: 'default',
                neighborhood: 'Eco',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x07,
                echoShift: 0,
                heatShift: 3,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Life',
                name: 'Moore Life',
                description: 'The classic Life, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_life,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Brain',
                name: 'Moore Brain',
                description: 'The classic Brain, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_brain,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Worms_Yuppie',
                name: 'Moore Yuppie Worms',
                description: 'The classic Yuppie Worms, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'yuppie',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Worms_Yuppie_Echo',
                name: 'Moore Yuppie Worms Echo',
                description: 'The classic Yuppie Worms with Echo, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'yuppie',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 4,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Worms_Hipster',
                name: 'Moore Hipster Worms',
                description: 'The classic Hipster Worms, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'hipster',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Worms_Hipster_Echo',
                name: 'Moore Hipster Worms Echo',
                description: 'The classic Hipster Worms with Echo, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'hipster',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 4,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore_Worms_Bohemian',
                name: 'Moore Bohemian Worms',
                description: 'The classic Bohemian Worms, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'bohemian',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Moore4_Quad',
                name: 'Moore4 Quad',
                description: 'Four two-bit Moore lookup table rules running in parallel.',
                pie: 'default',
                neighborhood: 'Moore4',
                ruleFunction: ruleFunction_Moore4_quad,
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {}
            },


            {
                symbol: 'Moore_Worms_Bohemian_Echo',
                name: 'Moore Bohemian Worms Echo',
                description: 'The classic Bohemian Worms with Echo, implemented with the Moore neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Moore',
                ruleFunction: ruleFunction_Moore_worms,
                personality: 'bohemian',
                toolCells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                paramsUsed: {},
                mask: 0x0f,
                echoShift: 4,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_HVGas',
                name: 'Margolus HV Gas',
                description: 'The classic Margolus HV Gas, implemented with the Margolus neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_hvgas,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_HVGas_Echo',
                name: 'Margolus HV Gas Echo',
                description: 'The classic Margolus HV Gas Echo, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_hvgas,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 2,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_HVGas_Heat',
                name: 'Margolus HV Gas Heat',
                description: 'The classic Margolus HV Gas Heat, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_hvgas,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x03,
                echoShift: 0,
                heatShift: 2,
                heatErrorShift: 1
            },

            {
                symbol: 'Margolus_Wavers',
                name: 'Margolus Wavers',
                description: 'The classic Margolus Wavers, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_wavers,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Wavers_Echo',
                name: 'Margolus Wavers Echo',
                description: 'The classic Margolus Wavers with Echo, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_wavers,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Critters',
                name: 'Margolus Critters',
                description: 'The classic Margolus Critters, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_critters,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Critters_Echo',
                name: 'Margolus Critters Echo',
                description: 'The classic Margolus Critters with Echo, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_critters,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Tron',
                name: 'Margolus Tron',
                description: 'The classic Margolus Tron, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_tron,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Tron_Echo',
                name: 'Margolus Tron Echo',
                description: 'The classic Margolus Tron with Echo, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_tron,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Dendrite',
                name: 'Margolus Denrdite',
                description: 'The classic Margolus Dendrite, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_dendrite,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {},
                mask: 0x03,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'Margolus_Dendrite_Heat',
                name: 'Margolus Denrdite Heat',
                description: 'The classic Margolus Dendrite Heat, implemented with the Margoli neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'Margolus',
                ruleFunction: ruleFunction_Margolus_dendrite,
                toolCells: [0, 1, 2, 3],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x03,
                echoShift: 0,
                heatShift: 2,
                heatErrorShift: 1
            },

            {
                symbol: 'VonNeumann_HGlass_Down',
                name: 'von Neumann HGlass Down',
                description: 'The classic HGlass Down, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'down',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Down_Echo',
                name: 'von Neumann HGlass Down Echo',
                description: 'The classic HGlass Down Echo, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'down',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Down_Heat',
                name: 'von Neumann HGlass Down Heat',
                description: 'The classic HGlass Down Heat, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'down',
                toolCells: [0, 1],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x01,
                echoShift: 0,
                heatShift: 1,
                heatErrorShift: 1
            },

            {
                symbol: 'VonNeumann_HGlass_Up',
                name: 'von Neumann HGlass Up',
                description: 'The classic HGlass Up, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'up',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Up_Echo',
                name: 'von Neumann HGlass Up Echo',
                description: 'The classic HGlass Up Echo, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'up',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Up_Heat',
                name: 'von Neumann HGlass Up Heat',
                description: 'The classic HGlass Up Heat, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'up',
                toolCells: [0, 1],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x01,
                echoShift: 0,
                heatShift: 1,
                heatErrorShift: 1
            },

            {
                symbol: 'VonNeumann_HGlass_Left',
                name: 'von Neumann HGlass Left',
                description: 'The classic HGlass Left, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'left',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Left_Echo',
                name: 'von Neumann HGlass Left Echo',
                description: 'The classic HGlass Left Echo, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'left',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Left_Heat',
                name: 'von Neumann HGlass Left Heat',
                description: 'The classic HGlass Left Heat, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'left',
                toolCells: [0, 1],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x01,
                echoShift: 0,
                heatShift: 1,
                heatErrorShift: 1
            },

            {
                symbol: 'VonNeumann_HGlass_Right',
                name: 'von Neumann HGlass Right',
                description: 'The classic HGlass Right, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'right',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Right_Echo',
                name: 'von Neumann HGlass Right Echo',
                description: 'The classic HGlass Right Echo, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'right',
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 1,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann_HGlass_Right_Heat',
                name: 'von Neumann HGlass Right Heat',
                description: 'The classic HGlass Right Heat, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'right',
                toolCells: [0, 1],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                    heatShiftPollution: true
                },
                mask: 0x01,
                echoShift: 0,
                heatShift: 1,
                heatErrorShift: 1
            },

            {
                symbol: 'VonNeumann_SpinsOnly',
                name: 'von Neumann Spins Only',
                description: 'The classic Spins Only, implemented with the von Neumann neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann',
                ruleFunction: ruleFunction_VonNeumann_spinsOnly,
                toolCells: [0, 1],
                paramsUsed: {},
                mask: 0x01,
                echoShift: 0,
                heatShift: 0,
                heatErrorShift: 0
            },

            {
                symbol: 'VonNeumann8_SpinsOnly',
                name: 'von Neumann 8 Spins Only',
                description: 'Eight classic Spins Only planes running in parallel, implemented with the von Neumann 8 neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann8',
                ruleFunction: ruleFunction_VonNeumann_spinsOnly,
                toolCells: [0, 1, 2, 4, 8, 16, 32, 64, 128],
                paramsUsed: {}
            },

            {
                symbol: 'VonNeumann4_HGlass_Down',
                name: 'von Neumann 4 HGlass Down',
                description: 'Four classic HGlass Down planes running in parallel, implemented with the von Neumann 4 neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann4',
                ruleFunction: ruleFunction_VonNeumann_hglass,
                orientation: 'down',
                toolCells: [0, 1, 2, 4, 8, 16, 32, 64, 128],
                paramsUsed: {},
            },

            {
                symbol: 'VonNeumann4_HGlass_All',
                name: 'von Neumann 4 HGlass All',
                description: 'Four classic HGlass All planes running in parallel and different directions, implemented with the von Neumann 4 neighborhood lookup table.',
                pie: 'default',
                neighborhood: 'VonNeumann4',
                ruleFunction: ruleFunction_VonNeumann4_hglass_all,
                toolCells: [0, 1, 2, 4, 8, 16, 32, 64, 128],
                paramsUsed: {},
            },

            {
                symbol: 'JohnVonNeumann29',
                name: 'John von Neumann 29 State',
                description: 'The classic John von Neumann 29 State rule.',
                pie: 'default',
                neighborhood: 'JohnVonNeumann29',
                toolCells: [
                    [ 'U', 0x00 ],
                    [ 'S', 0x01 ],
                    [ 'S0', 0x02 ],
                    [ 'S1', 0x03 ],
                    [ 'S00', 0x04 ],
                    [ 'S01', 0x05 ],
                    [ 'S10', 0x06 ],
                    [ 'S11', 0x07 ],
                    [ 'S000', 0x08 ],
                    [ 'C00', 0x10 ],
                    [ 'C10', 0x11 ],
                    [ 'C01', 0x90 ],
                    [ 'C11', 0x91 ],
                    [ 'OR', 0x20 ],
                    [ 'OU', 0x21 ],
                    [ 'OL', 0x22 ],
                    [ 'OD', 0x23 ],
                    [ 'SR', 0x40 ],
                    [ 'SU', 0x41 ],
                    [ 'SL', 0x42 ],
                    [ 'SD', 0x43 ],
                    [ 'ORX', 0xa0 ],
                    [ 'OUX', 0xa1 ],
                    [ 'OLX', 0xa2 ],
                    [ 'ODX', 0xa3 ],
                    [ 'SRX', 0xc0 ],
                    [ 'SUX', 0xc1 ],
                    [ 'SLX', 0xc2 ],
                    [ 'SDX', 0xc3 ]
                ],
                paramsUsed: {}
            },

            {
                symbol: 'RISCA',
                name: 'Ridiculous Instruction Set Cellular Automata',
                description: 'Ridiculous Instruction Set Cellular Automata.',
                pie: 'default',
                neighborhood: 'RISCA',
                toolCells: [
                    [ 'c', 0 ],
                    [ 'life', 16 ],
                    [ 'brain', 32 ],
                    [ 'torbin', 48 ],
                    [ 'anneal', 64 ],
                    [ 'ditto', 80 ],
                    [ 'logic', 96 ],
                    [ 'n', 112 ],
                    [ 'nw', 128 ],
                    [ 'w', 144 ],
                    [ 'sw', 160 ],
                    [ 's', 176 ],
                    [ 'se', 192 ],
                    [ 'e', 208 ],
                    [ 'ne', 224 ],
                    [ 'heat', 240 ]
                ],
                paramsUsed: {
                    frobTarget: true,
                    frob: true,
                    unfrob: true,
                    frobScale: true,
                }
            }

    ]);


    ////////////////////////////////////////////////////////////////////////
    // The colorMap type.


    // The defaultColors array contains the 16 default colors.
    CAM6.prototype.defaultColors = [
        [225, 225, 225, 255],
        [255, 0,   0,   255],
        [0,   255, 0,   255],
        [0,   0,   255, 255],
        [0,   255, 255, 255],
        [255, 0,   255, 255],
        [255, 255, 0,   255],
        [0,   0,   0,   255]
    ];


    // The defauktSpecialColors dictionary maps special cell values
    // to the RGBA color to use for those cell value, overriding the
    // normally computed color.
    CAM6.prototype.defaultSpecialColors = {
        0:   [0,   0,   0,   255],
        127: [254, 254, 254, 255],
        128: [1,   1,   1,   255],
        255: [255, 255, 255, 255]
    };


    // Make sure the color map arrays are created,
    function initColorMap(colorMapDict) {

        if (!colorMapDict.colorMap) {
            var colorMap = new Uint8Array(new ArrayBuffer(256 * 4));
            colorMapDict.colorMap = colorMap;
        }

        if (!colorMapDict.colors) {
            var colors = [];
            colorMapDict.colors = colors;
        }

    }


    // This makes copies the colors from the color map's colors array
    // into the colorMap UInt8Array, if there are any.
    function updateColorMap(colorMapDict) {

        var colors = colorMapDict.colors;
        if (colors.length == 0) {
            return;
        }

        var colorMap = colorMapDict.colorMap;
        var colorCount = colors.length;

        for (var colorIndex = 0, colorByteIndex = 0;
             colorIndex < 256;
             colorIndex++) {

            var color = colors[colorIndex % colorCount];

            colorMap[colorByteIndex++] = color[0];
            colorMap[colorByteIndex++] = color[1];
            colorMap[colorByteIndex++] = color[2];
            colorMap[colorByteIndex++] = color[3];

        }

    }


    // This colorMap object indexGetFunction dynamically creats a colormap
    // from the parameters in the colorMapDict.
    function handleIndexGetFunction_colorMap_random(type_metaData, indexKey, key, colorMap_by_key, colorMapDict) {

        initColorMap(colorMapDict);

        var colors = colorMapDict.colors;
        if (colors.length) {
            return;
        }

        for (var colorIndex = colors.length;
             colorIndex < 256;
             colorIndex++) {

            var color = [
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                255
            ];

            colors.push(color);
        }

        updateColorMap(colorMapDict);

    }


    // This colorMap object indexGetFunction dynamically creats a colormap
    // from the parameters in the colorMapDict.
    function handleIndexGetFunction_colorMap_default(type_metaData, indexKey, key, colorMap_by_key, colorMapDict) {

        initColorMap(colorMapDict);

        var colors = colorMapDict.colors;
        if (colors.length) {
            return;
        }

        var colorIndex = 0;
        var defaultColors = colorMapDict.defaultColors || CAM6.prototype.defaultColors;
        var segments = 256 / defaultColors.length;
        var darkStart = colorMapDict.darkStart || 0;
        var darkStep = colorMapDict.darkStep || (255 / segments);
        var lightStart = colorMapDict.lightStart || 255;
        var lightStep = colorMapDict.lightStep || -(255 / segments);
        var specialColors = colorMapDict.specialColors || {};

        for (var segment  = 0, dark = darkStart, light = lightStart;
             segment < segments;
             segment++, dark += darkStep, light += lightStep) {

            for (var j = 0;
                 j < defaultColors.length;
                 j++) {

                var color = specialColors[colorIndex];

                if (!color) {

                    var defaultColor = defaultColors[j];
                    var redWeight   = defaultColor[0] / 256.0;
                    var greenWeight = defaultColor[1] / 256.0;
                    var blueWeight  = defaultColor[2] / 256.0;

                    color = [
                        Math.floor((redWeight   * dark) + ((1.0 - redWeight  ) * light)) & 255,
                        Math.floor((greenWeight * dark) + ((1.0 - greenWeight) * light)) & 255,
                        Math.floor((blueWeight  * dark) + ((1.0 - blueWeight ) * light)) & 255,
                        255
                    ];

                }

                colors.push(color);

                colorIndex++;

            }

        }

        var fades = colorMapDict.fades;
        if (fades) {
            for (var fadeIndex = 0, fadeCount = fades.length;
                 fadeIndex < fadeCount;
                 fadeIndex++) {

                var fade = fades[fadeIndex];
                var fadeStartIndex = fade[0];
                var fadeStartAlpha = fade[1];
                var fadeEndIndex   = fade[2];
                var fadeEndAlpha   = fade[3]
                var fadeStep       = fade[4]
                var fadeIndexRange = fadeEndIndex - fadeStartIndex;

                for (var colorIndex = fadeStartIndex;
                     colorIndex <= fadeEndIndex;
                     colorIndex += fadeStep) {

                    // Don't fade special colors.
                    if (specialColors[colorIndex]) {
                        continue;
                    }

                    var indexWeight =
                        (colorIndex - fadeStartIndex) / fadeIndexRange;
                    var alpha =
                        Math.floor(
                            (((1.0 - indexWeight) * fadeStartAlpha) +
                             (indexWeight * fadeEndAlpha)));

                    colors[colorIndex][3] = alpha;

                }

            }

        }

        updateColorMap(colorMapDict);

    }


    defineType(
        'colorMap',
        CAM6.prototype,
        null,
        ['symbol'],
        [
            {
                symbol: 'default',
                name: 'Default',
                description: 'Default color map.',
                handleIndexGetFunction: handleIndexGetFunction_colorMap_default,
                defaultColors: CAM6.prototype.defaultColors,
                specialColors: CAM6.prototype.defaultSpecialColors,
                darkStart: 0,
                darkStep: 255 / 32,
                lightStart: 255,
                lightStep: -255 / 32
            },

            {
                symbol: 'defaultFadeOut100',
                name: 'Default Fade Out',
                description: 'Default fade out.',
                handleIndexGetFunction: handleIndexGetFunction_colorMap_default,
                defaultColors: CAM6.prototype.defaultColors,
                specialColors: CAM6.prototype.defaultSpecialColors,
                darkStart: 0,
                darkStep: 255 / 32,
                lightStart: 255,
                lightStep: -255 / 32,
                fades: [
                    [140, 255, 200, 0,   1],
                    [200, 0,   255, 0,   1]
                ]
            },

            {
                symbol: 'random',
                name: 'Random',
                description: 'Random color map.',
                handleIndexGetFunction: handleIndexGetFunction_colorMap_random
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The tool type.


    defineType(
        'tool',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'squareBrush',
                name: 'Square Brush',
                description: 'Paint toolCell values into a square of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolCell: false,
                    toolSize: false,
                    toolMask: false
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var toolCell = activeToolDict.toolCell;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    for (var y = top;
                         y < bottom;
                         y++) {

                        var cellIndex =
                            (left + 1) +
                            ((y + 1) * this.cellBufferWidth);

                        for (var x = left;
                             x < right;
                             x++, cellIndex++) {

                            cells[cellIndex] =
                                (toolCell & toolMask) |
                                (cells[cellIndex] & ~toolMask);

                        }

                    }

                }

            },

            {
                symbol: 'circularBrush',
                name: 'Circular Brush',
                description: 'Paint toolCell values into a circle of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolCell: false,
                    toolSize: false,
                    toolMask: false
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolCell = activeToolDict.toolCell;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    var maxDistance2 = halfToolSize * halfToolSize;

                    for (var y = top;
                         y < bottom;
                         y++) {

                        var dy = mouseY - y;
                        var dy2 = dy * dy;
                        var cellIndex =
                            (left + 1) +
                            ((y + 1) * this.cellBufferWidth);

                        for (var x = left;
                             x < right;
                             x++, cellIndex++) {

                            var dx = mouseX - x;
                            var dx2 = dx * dx;
                            var distance2 = dx2 + dy2;

                            if (distance2 < maxDistance2) {
                                cells[cellIndex] =
                                    (toolCell & toolMask) |
                                    (cells[cellIndex] & ~toolMask);
                            }

                        }

                    }

                }

            },

            {
                symbol: 'squareSpray',
                name: 'Square Spray',
                description: 'Spray toolCell values of count toolSprinkles randomly into a square of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolCell: false,
                    toolSize: false,
                    toolMask: false,
                    toolSprinkles: false,
                    randomSeed: true
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolSprinkles = activeToolDict.toolSprinkles;
                    var toolCell = activeToolDict.toolCell;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    var x0 = mouseX - halfToolSizeFloor;
                    var y0 = mouseY - halfToolSizeFloor;

                    for (var i = 0, n = toolSprinkles;
                         i < n;
                         i++) {

                        var x = x0 + Math.floor(Math.random() * toolSize);
                        var y = y0 + Math.floor(Math.random() * toolSize);

                        if ((x >= 0) && (x < this.cellWidth) &&
                            (y >= 0) && (y < this.cellHeight)) {

                            var cellIndex =
                                (x + 1) +
                                ((y + 1) * this.cellBufferWidth);

                            cells[cellIndex] =
                                (toolCell & toolMask) |
                                (cells[cellIndex] & ~toolMask);

                        }

                    }

                }

            },

            {
                symbol: 'circularSpray',
                name: 'Circular Spray',
                description: 'Spray toolCell values of count toolSprinkles randomly into a circle of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolCell: false,
                    toolSize: false,
                    toolMask: false,
                    toolSprinkles: false,
                    randomSeed: true
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolSprinkles = activeToolDict.toolSprinkles;
                    var toolCell = activeToolDict.toolCell;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    var x0 = mouseX - halfToolSizeFloor;
                    var y0 = mouseY - halfToolSizeFloor;
                    var maxDistance2 = halfToolSize * halfToolSize;

                    for (var i = 0, n = toolSprinkles;
                         i < n;
                         i++) {

                        var x = x0 + Math.floor(Math.random() * toolSize);
                        var y = y0 + Math.floor(Math.random() * toolSize);

                        if ((x >= 0) && (x < this.cellWidth) &&
                            (y >= 0) && (y < this.cellHeight)) {

                            var dx = mouseX - x;
                            var dx2 = dx * dx;
                            var dy = mouseY - y;
                            var dy2 = dy * dy;
                            var distance2 = dx2 + dy2;

                            if (distance2 < maxDistance2) {

                                var cellIndex =
                                    (x + 1) +
                                    ((y + 1) * this.cellBufferWidth);

                                cells[cellIndex] =
                                    (toolCell & toolMask) |
                                    (cells[cellIndex] & ~toolMask);

                            }

                        }

                    }

                }

            },

            {
                symbol: 'squareRandomSpray',
                name: 'Square Random Spray',
                description: 'Spray random values of count toolSprinkless randomly into a square of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolSize: false,
                    toolMask: false,
                    toolSprinkles: false,
                    toolCellMin: false,
                    toolCellMax: false,
                    randomSeed: true
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolSprinkles = activeToolDict.toolSprinkles;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    var x0 = mouseX - halfToolSizeFloor;
                    var y0 = mouseY - halfToolSizeFloor;
                    var maxDistance2 = halfToolSize * halfToolSize;
                    var toolCellMin = activeToolDict.toolCellMin;
                    var toolCellMax = activeToolDict.toolCellMax;
                    var toolCellRange = toolCellMax - toolCellMin;

                    for (var i = 0, n = toolSprinkles;
                         i < n;
                         i++) {

                        var x = x0 + Math.floor(Math.random() * toolSize);
                        var y = y0 + Math.floor(Math.random() * toolSize);

                        if ((x >= 0) && (x < this.cellWidth) &&
                            (y >= 0) && (y < this.cellHeight)) {

                            var cellIndex =
                                (x + 1) +
                                ((y + 1) * this.cellBufferWidth);

                            var cellValue =
                                toolCellMin +
                                Math.floor(Math.random() * toolCellRange);

                            cells[cellIndex] =
                                (cellValue & toolMask) |
                                (cells[cellIndex] & ~toolMask);

                        }

                    }

                }

            },

            {
                symbol: 'circularRandomSpray',
                name: 'Circular Random Spray',
                description: 'Spray random values of count toolSprinkless randomly into a circle of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolSize: false,
                    toolMask: false,
                    toolSprinkles: false,
                    toolCellMin: false,
                    toolCellMax: false,
                    randomSeed: true
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolSprinkles = activeToolDict.toolSprinkles;
                    var toolMask = activeToolDict.toolMask;

                    left = Math.max(0, Math.min(this.cellWidth, left));
                    right = Math.max(0, Math.min(this.cellWidth, right));
                    top = Math.max(0, Math.min(this.cellHeight, top));
                    bottom = Math.max(0, Math.min(this.cellHeight, bottom));

                    if ((left >= right) ||
                        (top >= bottom)) {
                        return;
                    }

                    var x0 = mouseX - halfToolSizeFloor;
                    var y0 = mouseY - halfToolSizeFloor;
                    var maxDistance2 = halfToolSize * halfToolSize;
                    var toolCellMin = activeToolDict.toolCellMin;
                    var toolCellMax = activeToolDict.toolCellMax;
                    var toolCellRange = toolCellMax - toolCellMin;

                    for (var i = 0, n = toolSprinkles;
                         i < n;
                         i++) {

                        var x = x0 + Math.floor(Math.random() * toolSize);
                        var y = y0 + Math.floor(Math.random() * toolSize);

                        if ((x >= 0) && (x < this.cellWidth) &&
                            (y >= 0) && (y < this.cellHeight)) {

                            var dx = mouseX - x;
                            var dx2 = dx * dx;
                            var dy = mouseY - y;
                            var dy2 = dy * dy;
                            var distance2 = dx2 + dy2;

                            if (distance2 < maxDistance2) {

                                var cellIndex =
                                    (x + 1) +
                                    ((y + 1) * this.cellBufferWidth);

                                var cellValue =
                                    toolCellMin +
                                    Math.floor(Math.random() * toolCellRange);

                                cells[cellIndex] =
                                    (cellValue & toolMask) |
                                    (cells[cellIndex] & ~toolMask);

                            }

                        }

                    }

                }

            },

/* BROKEN!
            {
                symbol: 'disruptor',
                name: 'Disruptor Beam',
                description: 'Disrupt and area of size toolSize.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: false,
                feedbackOverlay: false,
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    toolSize: false,
                    toolVolume: false,
                    toolGranularity: false,
                    toolMask: false
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var toolSize = activeToolDict.toolSize;
                    toolSize = Math.max(3, toolSize);
                    var halfToolSize = toolSize / 2;
                    var halfToolSizeFloor = Math.floor(halfToolSize);
                    var left = activeToolDict.mouseX - halfToolSizeFloor;
                    var right = left + toolSize;
                    var top = activeToolDict.mouseY - halfToolSizeFloor;
                    var bottom = top + toolSize;
                    var toolMask = activeToolDict.toolMask;
                    var toolVolume = activeToolDict.toolVolume;
                    var toolGranularity = activeToolDict.toolGranularity;
                    var cellWidth = this.cellWidth;
                    var cellHeight = this.cellHeight;

                    var clippedLeft = Math.max(0, Math.min(cellWidth, left));
                    var clippedRight = Math.max(0, Math.min(cellWidth, right));
                    var clippedTop = Math.max(0, Math.min(cellHeight, top));
                    var clippedBottom = Math.max(0, Math.min(cellHeight, bottom));

                    if ((clippedLeft >= clippedRight) ||
                        (clippedTop >= clippedBottom)) {
                        return;
                    }

                    var amplification =
                        Math.max(
                            1,
                            Math.sqrt(toolSize) * 0.25);

                    toolVolume *= amplification;

                    var volumeLeftover =
                        toolVolume - Math.floor(toolVolume);
                    toolVolume =
                        Math.floor(toolVolume) +
                        ((Math.random() < volumeLeftover) ? 1 : 0);

                    for (var pass = 0;
                         pass < toolVolume;
                         pass++) {

                        var dx =
                            (Math.random() < 0.5) ? -1 : 1;
                        var dy =
                            (Math.random() < 0.5) ? -1 : 1;

dx = 1;
dy = 0;
                        var grainSize =
                            Math.max(
                                1,
                                Math.min(
                                    halfToolSize - 1,
                                    Math.floor(
                                        Math.sqrt(toolGranularity) *
                                        (halfToolSize - 1))));

                        var grainRange = Math.floor((toolSize - 2) - grainSize);
                        var grainX = 1 + Math.floor(Math.random() * grainRange);
                        var grainY = 1 + Math.floor(Math.random() * grainRange);

                        var grainLeft = left + grainX;
                        var grainTop = top + grainY;
                        var grainRight = grainLeft + grainSize;
                        var grainBottom = grainTop + grainSize;

                        var startX = (dx > 0) ? grainLeft         : (grainRight  - 1);
                        var endX   = (dx > 0) ? grainRight        : (grainLeft   - 1);
                        var startY = (dy > 0) ? grainTop          : (grainBottom - 1);
                        var endY   = (dy > 0) ? grainBottom       : (grainTop    - 1);

                        for (var y = startY;
                             y != endY;
                             y += dy) {

                            for (var x = startX;
                                 x != endX;
                                 x += dx) {

                                var cellIndexTo =
                                    (x + 1) +
                                    ((y + 1) * this.cellBufferWidth);

                                var x2 = x + dx;
                                if (x2 < 0) {
                                    x2 += cellWidth;
                                } else if (x2 >= cellWidth) {
                                    x2 -= cellWidth;
                                }

                                var y2 = y + dy;
                                if (y2 < 0) {
                                    y2 += cellHeight;
                                } else if (y2 >= cellHeight) {
                                    y2 -= cellHeight;
                                }

                                var cellIndexFrom =
                                    (x2 + 1) +
                                    ((y2 + 1) * this.cellBufferWidth);

                                cells[cellIndexTo] =
                                    (cells[cellIndexTo] & ~toolMask) |
                                    (cells[cellIndexFrom] & toolMask);

                            }

                        }

                    }

                }

            },
*/

            {
                symbol: 'line',
                name: 'Line',
                description: 'Sweep out a line.',
                context: 'cells',
                wraplicate: true,
                compositionOverlay: true,
                feedbackOverlay: true,
                overlayFunctionSymbol: 'threshold_toolCell_set',
                paramsUsed: {
                    mouseX: true,
                    mouseY: true,
                    mouseDownX: false,
                    mouseDownY: false,
                    toolCell: false,
                    toolSize: false,
                    toolMask: false,
                    toolLineCapSymbol: false,
                    compositionChannel: false,
                    compositionThresholdMin: false,
                    compositionThresholdMax: false
                },
                beginToolFunction: function beginToolFunction(toolDict, activeToolDict) {},
                endToolFunction: function endToolFunction(toolDict, activeToolDict) {},
                beforeToolFunction: function beforeToolFunction(toolDict, activeToolDict, cells) {},
                afterToolFunction: function afterToolFunction(toolDict, activeToolDict, cells) {},
                toolFunction: function toolFunction(toolDict, activeToolDict, cells) {

                    var mouseDownX = activeToolDict.mouseDownX;
                    var mouseDownY = activeToolDict.mouseDownY;
                    var mouseX = activeToolDict.mouseX;
                    var mouseY = activeToolDict.mouseY;
                    var toolSize = activeToolDict.toolSize;
                    var toolLineCapSymbol = activeToolDict.toolLineCapSymbol;
                    var toolLineCap = this.lineCap_by_symbol[toolLineCapSymbol].value;
                    var toolCell = activeToolDict.toolCell;

                    var ctxDraw = this.compositionOverlayContext;

                    ctxDraw.strokeStyle = '#ffffff';
                    ctxDraw.lineWidth = toolSize;
                    ctxDraw.lineCap = toolLineCap;

                    ctxDraw.beginPath();
                    ctxDraw.moveTo(mouseDownX, mouseDownY);
                    ctxDraw.lineTo(mouseX + .001, mouseY + .001);
                    ctxDraw.stroke();

                    var ctxFeedback = this.feedbackOverlayContext;
                    var colorMapIndex = toolCell * 4;
                    var colorMap = this.getColorMap();
                    var red   = colorMap[colorMapIndex + 0] / 255;
                    var green = colorMap[colorMapIndex + 1] / 255;
                    var blue  = colorMap[colorMapIndex + 2] / 255;
                    var alpha = colorMap[colorMapIndex + 3] / 255;

                    ctxFeedback.strokeStyle = 'rgb(' + red + ',' + green + ',' + blue + ',255)';
                    ctxFeedback.lineWidth = toolSize;
                    ctxFeedback.lineCap = toolLineCap;

                    ctxFeedback.beginPath();
                    ctxFeedback.moveTo(mouseDownX, mouseDownY);
                    ctxFeedback.lineTo(mouseX + .001, mouseY + .001);
                    ctxFeedback.stroke();

                }
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The analyzer type.


    defineType(
        'analyzer',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'headPainter',
                name: 'Head Painter',
                description: 'Head painter.',
                toolLayer: 10,
                onDisabledEnd: function onDisabledEnd(analyzerDict) {
                    LOG('analyzer headPainter onDisabledEnd:');
                },
                onEnabling: function onEnabling(analyzerDict) {

                    //LOG('analyzer headPainter onEnabling: begin', 'webCamState', this.webCamState, 'headTrackerState', this.headTrackerState);

                    if (this.webCamState == 'broken') {
                        LOG('analyzer headPainter onEnabling: webcam broken so disabling.');
                        this.setValue(this, 'analyzerStatus', 'Analyzer disabled because webcam broken.');
                        this.disableAnalyzer();
                        return true;
                    }

                    if (this.headTrackerState == 'broken') {
                        LOG('analyzer headPainter onEnabling: head tracker broken so disabling.')
                        this.setValue(this, 'analyzerStatus', 'Analyzer disabled because head tracker broken.');
                    }

                    if (!this.webCamEnabled) {
                        LOG('analyzer headPainter onEnabling: enabling webcam');
                        this.enableWebCam();
                    }

                    if (!this.headTrackerEnabled) {
                        LOG('analyzer headPainter onEnabling: enabling head tracker');
                        this.enableHeadTracker();
                    }

                    if (this.webCamState != 'enabled') {
                        this.setValue(this, 'analyzerStatus', 'Analyzer waiting for webcam to enable.');
                        return false;
                    }

                    if (this.headTrackerState != 'enabled') {
                        this.setValue(this, 'analyzerStatus', 'Analyzer waiting for head tracker to enable.');
                        return false;
                    }

                    // Both the webcam and head tracker are enabled, so we are ready to enable!
                    return true;

                },
                onEnabledBegin: function onEnabledBegin(analyzerDict) {

                    LOG('analyzer headPainter onEnabledBegin: setting up params and adding tool');

                    if (!analyzerDict.activeToolDict) {
                        analyzerDict.activeToolDict = {
                            enabled: false,
                            toolSymbol: 'circularSpray',
                            toolMask: 0xff,
                            paramsUsed: {}
                        };
                    }

                    this.addActiveTool(
                        analyzerDict.activeToolDict,
                        'headPainter',
                        analyzerDict.toolLayer);

                    this.setValue(this, 'colorMapSymbol', 'defaultFadeOut100');
                    this.setValue(this, 'ruleSymbol', 'FuzzyMarble');
                    this.setValue(this, 'phaseShiftX', 10);
                    this.setValue(this, 'phaseShiftY', 10);
                    this.setValue(this, 'phaseShiftCell', 8);
                    this.setValue(this, 'phaseShiftStep', 4);
                    this.setValue(this, 'frob', 0);
                    this.setValue(this, 'frobTarget', 0);
                    this.randomizeCells();

                },
                onEnabled: function onEnabled(analyzerDict) {

                    var ctx = this.headTrackerOverlayContext;

                    ctx.clearRect(
                        0, 0, this.cellWidth, this.cellHeight);

                    var activeToolDict =
                        analyzerDict.activeToolDict;
                    activeToolDict.enabled =
                        this.headTrackerTracking;

                    if (this.headTrackerTracking) {

                        var x = this.headTrackerX;
                        var y = this.headTrackerY;
                        var width = this.headTrackerWidth;
                        var height = this.headTrackerHeight;
                        var angle = this.headTrackerAngle;

                        ctx.save();
                        ctx.translate(
                            x,
                            y);
                        ctx.rotate(
                            angle);
                        ctx.strokeStyle =
                            '#00CC00';
                        ctx.strokeRect(
                            (width / -2),
                            (height / -2),
                            width,
                            height);
                        ctx.restore();

                        var minSize = 50;
                        var maxSize = 150;
                        var scaleSize = 1.0;
                        var size =
                            Math.max(
                                minSize,
                                Math.min(
                                    maxSize,
                                    (scaleSize *
                                     Math.max(
                                        width,
                                        height))));

                        if (!this.headTrackerTrackingLast &&
                            this.headTrackerTracking) {
                            this.setValue(this, 'frobTarget', -0.5);
                        }

                        activeToolDict.mouseX = x;
                        activeToolDict.mouseY = y;
                        activeToolDict.toolSize = size;
                        activeToolDict.toolSprinkles = 100;
                        activeToolDict.toolCell = 254;

                        var inactiveRadius = 20;
                        var dx = x - (this.cellWidth / 2);
                        var dy = y - (this.cellHeight / 2);
                        if (Math.abs(dx) > Math.abs(dy)) {
                            if (dx < -inactiveRadius) {
                                //LOG('left');
                                this.setValue(this, 'ruleSymbol', 'TwistyMarble');
                                this.setValue(this, 'phaseOffset', 6);
                                this.setValue(this, 'phaseShiftStep', 16);
                            } else if (dx > inactiveRadius) {
                                //LOG('right');
                                this.setValue(this, 'ruleSymbol', 'TwistyMarble');
                                this.setValue(this, 'phaseOffset', 2);
                                this.setValue(this, 'phaseShiftStep', 16);
                            } else {
                                //LOG('middle');
                                this.setValue(this, 'ruleSymbol', 'FuzzyMarble');
                                this.setValue(this, 'phaseShiftStep', 4);
                            }
                        } else {
                            if (dy < -inactiveRadius) {
                                //LOG('up');
                                this.setValue(this, 'ruleSymbol', 'TwistyMarble');
                                this.setValue(this, 'phaseOffset', 0);
                                this.setValue(this, 'phaseShiftStep', 16);
                            } else if (dy > inactiveRadius) {
                                //LOG('down');
                                this.setValue(this, 'ruleSymbol', 'TwistyMarble');
                                this.setValue(this, 'phaseOffset', 4);
                                this.setValue(this, 'phaseShiftStep', 16);
                            } else {
                                //LOG('middle');
                                this.setValue(this, 'ruleSymbol', 'FuzzyMarble');
                                this.setValue(this, 'phaseShiftStep', 4);
                            }
                        }

                    }

                },
                onEnabledEnd: function onEnabledEnd(analyzerDict) {

                    LOG('analyzer headPainter onEnabledEnd: removing tool');

                    this.removeActiveTool(
                        analyzerDict.activeToolDict.activeToolSymbol, // Remove this particular activeTool.
                        null, // Tools in any channel.
                        0); // Remove all matching tools.

                },
                onDisabling: function onDisabling(analyzerDict) {

                    LOG('analyzer headPainter onDisabling:', 'webCamState', this.webCamState, 'headTrackerState', this.headTrackerState);

                    if (this.webCamState == 'enabled') {

                        LOG('analyzer headPainter onDisabling: disabling webCam');
                        this.disableWebCam();

                    }

                    if (this.headTrackerState == 'enabled') {

                        LOG('analyzer headPainter onDisabling: disabling headTracker');
                        this.disableHeadTracker();

                    }

                    var done =
                        (this.webCamState == 'disabled') &&
                        (this.headTrackerState == 'disabled');

                    LOG('analyzer headPainter onDisabling: finally', 'webCamState', this.webCamState, 'headTrackerState', this.headTrackerState, 'done', done);

                    return done;

                },
                onDisabledBegin: function onDisabledBegin(analyzerDict) {

                    LOG('analyzer onDisabledBegin:');

                }
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The command type.


    defineType(
        'command',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'fullscreenMode',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Full Screen'
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Full screen mode.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.fullScreen;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.fullScreen;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    setTimeout(
                        $.proxy(function() {
                                this.fullScreenMode();
                                this.updateCommands();
                            }, this),
                        1);
                }
            },

            {
                symbol: 'windowMode',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Window';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Window mode.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.fullScreen;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.fullScreen;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    setTimeout(
                        $.proxy(function() {
                                this.windowMode();
                                this.updateCommands();
                            }, this),
                        1);
                }
            },

            {
                symbol: 'pause',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Pause'
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Pause the simulation.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.paused;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.paused;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.pause();
                    this.tick();
                    this.updateCommands();
                }
            },

            {
                symbol: 'resume',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Resume';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Resume the simulation.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.paused;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.paused;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.resume();
                    this.updateCommands();
                }
            },

            {
                symbol: 'clear',
                recordable: true,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Clear';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Clear the cells.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return true;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return true;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.clearCells();
                    if (this.paused) {
                        this.tick();
                    }
                }
            },

            {
                symbol: 'randomize',
                recordable: true,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Randomize';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Randomize the cells.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return true;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return true;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.randomizeCells();
                    if (this.paused) {
                        this.tick();
                    }
                }
            },

            {
                symbol: 'initialize',
                recordable: true,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Initialize';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Initialize the cells.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return true;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return true;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.initializeCells();
                    if (this.paused) {
                        this.tick();
                    }
                }
            },

            {
                symbol: 'startRecording',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Record';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Start recording a script.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.scriptRecording;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.scriptRecording;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.scriptRecordStart();
                    this.updateCommands();
                }
            },

            {
                symbol: 'stopRecording',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Stop';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Stop recording a script.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.scriptRecording;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.scriptRecording;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.scriptRecordStop();
                    this.updateCommands();
                }
            },

            {
                symbol: 'startPlaying',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Play';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Play the recorded script.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.scriptPlaying;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.scriptPlaying &&
                           this.scriptPlayingScript &&
                           (this.scriptPlayingScript.length > 0);
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.scriptPlayStart();
                    this.updateCommands();
                }
            },

            {
                symbol: 'stopPlaying',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Stop';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Stop playing the recorded script.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.scriptPlaying;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.scriptPlaying;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.scriptPlayStop();
                    this.updateCommands();
                }
            },

            {
                symbol: 'save',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Save';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    return 'Save a recorded script.';
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return true;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.scriptRecording &&
                           !this.scriptPlaying &&
                            this.scriptPlayingScript &&
                            (this.scriptPlayingScript.length > 0);
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.scriptSave();
                }
            },

            {
                symbol: 'startWebCam',
                recordable: false,
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Start WebCam';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Start the WebCam.' +
                        '\nState: ' + this.webCamState +
                        '\nStatus: ' + this.webCamStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.webCamEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.webCamEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.enableWebCam();
                    this.updateCommands();
                },
                layout: {
                    sliceDirection: 'East'
                }
            },

            {
                symbol: 'stopWebCam',
                recordable: false,
                group: 'camera',
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Stop WebCam';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Stop the WebCam.' +
                        '\nState: ' + this.webCamState +
                        '\nStatus: ' + this.webCamStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.webCamEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.webCamEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.disableWebCam();
                    this.updateCommands();
                }
            },

            {
                symbol: 'startHeadTracker',
                recordable: false,
                group: 'camera',
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Start Head Tracker';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Start the head tracker.' +
                        '\nState: ' + this.headTrackerState +
                        '\nStatus: ' + this.headTrackerStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.headTrackerEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.headTrackerEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.enableHeadTracker();
                    this.updateCommands();
                }
            },

            {
                symbol: 'stopHeadTracker',
                recordable: false,
                group: 'camera',
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Stop Head Tracker';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Stop the head tracker.' +
                        '\nState: ' + this.headTrackerState +
                        '\nStatus: ' + this.headTrackerStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.headTrackerEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.headTrackerEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.disableHeadTracker();
                    this.updateCommands();
                }
            },

            {
                symbol: 'startAnalyzer',
                recordable: false,
                group: 'camera',
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Start Analyzer';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Start the analyzer.' +
                        '\nState: ' + this.analyzerState +
                        '\nStatus: ' + this.analyzerStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return !this.analyzerEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return !this.analyzerEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.enableAnalyzer();
                    this.updateCommands();
                }
            },

            {
                symbol: 'stopAnalyzer',
                recordable: false,
                group: 'camera',
                getNameFunction: function getNameFunction(commandDict) {
                    return 'Stop Analyzer';
                },
                getDescriptionFunction: function getDescriptionFunction(commandDict) {
                    var description =
                        'Stop the analyzer.' +
                        '\nState: ' + this.analyzerState +
                        '\nStatus: ' + this.analyzerStatus;
                    return description;
                },
                isVisibleFunction: function isVisibleFunction(commandDict) {
                    return this.analyzerEnabled;
                },
                isEnabledFunction: function isEnabledFunction(commandDict) {
                    return this.analyzerEnabled;
                },
                commandFunction: function commandFunction(commandDict, params) {
                    this.disableAnalyzer();
                    this.updateCommands();
                }
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The hint type.


    defineType(
        'hint',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'rotate',
                hint: 'Rotate the cell values higher or lower with the vertical mouse wheel, or changing the Frob Goal slider.',
                url: null,
                urlLabel: ''
            },

            {
                symbol: 'shift',
                hint: 'Shift the phase offset with the horizontal mouse wheel, or changing the Phase Offset slider.',
                url: null,
                urlLabel: ''
            },

            {
                symbol: 'paint',
                hint: 'Paint cells with the current editing tool, by clicking and dragging with the left button over the cells.',
                url: null,
                urlLabel: ''
            },

            {
                symbol: 'histogram',
                hint: 'Click and drag in the histogram, to set the editing tool cell color.',
                url: null,
                urlLabel: ''
            },

            {
                symbol: 'histogramCells',
                hint: 'Click in the histogram and drag up and into the cells, to set the editing tool cell color to the cell under the cursor.',
                url: null,
                urlLabel: ''
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The chapter type.


    defineType(
        'chapter',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'Rules',
                name: 'Rules',
                description: 'Cellular automata machine rules.',
                itemName: 'Rule',
                importantKeys: [
                    'symbol', 'name', 'description', 'neighborhood', 'ruleFunction',
                    'paramsUsed', 'mask', 'echoShift', 'heatShift', 'heatErrorShift'
                ],
                ignoreKeys: [
                    'index', 'ruleTableBuffer', 'ruleTableBytes'
                ],
                getItemsFunction: function getItemsFunction(chapterDict) {
                    var items = [];
                    for (var ruleIndex = 0, ruleCount = this.rule_objects.length;
                         ruleIndex < ruleCount;
                         ruleIndex++) {
                        var ruleDict = this.rule_objects[ruleIndex];
                        var item = {
                            symbol: ruleDict.symbol,
                            wikiSymbol: ruleDict.name.replace(' ', '_'),
                            name: ruleDict.name,
                            description: ruleDict.description,
                            dict: ruleDict
                        };
                        items.push(item);
                    }
                    return items;
                }
            },

            {
                symbol: 'Neighborhoods',
                name: 'Neighborhoods',
                description: 'Cellular automata machine neighborhoods.',
                itemName: 'Neighborhood',
                importantKeys: [
                    'symbol', 'name', 'description', 'neighborhoodFunction'
                ],
                ignoreKeys: [
                    'index'
                ],
                getItemsFunction: function getItemsFunction(chapterDict) {
                    var items = [];
                    for (var neighborhoodIndex = 0, neighborhoodCount = this.neighborhood_objects.length;
                         neighborhoodIndex < neighborhoodCount;
                         neighborhoodIndex++) {
                        var neighborhoodDict = this.neighborhood_objects[neighborhoodIndex];
                        var item = {
                            symbol: neighborhoodDict.symbol,
                            wikiSymbol: neighborhoodDict.name.replace(' ', '_'),
                            name: neighborhoodDict.name,
                            description: neighborhoodDict.description,
                            dict: neighborhoodDict
                        };
                        items.push(item);
                    }
                    return items;
                }
            },

            {
                symbol: 'Metadata',
                name: 'Metadata',
                description: 'Cellular automata machine parameter metadata.',
                itemName: 'Metadata',
                importantKeys: [
                    'param', 'name', 'description', 'recordable',
                    'widget', 'condition', 'updateParamVisibility',
                    'setValueFunction', 'getValueNameFunction', 'getValueDescriptionFunction',
                    'widgetValueToParamValueFunction', 'paramValueToWidgetValueFunction',
                    'getMinValueFunction', 'getMaxValueFunction'
                ],
                ignoreKeys: [
                    'index', '$div', '$widget', '$title', '$value'
                ],
                getItemsFunction: function getItemsFunction(chapterDict) {
                    var items = [];
                    for (var parameterIndex = 0, parameterCount = this.paramMetaData_objects.length;
                         parameterIndex < parameterCount;
                         parameterIndex++) {
                        var parameterDict = this.paramMetaData_objects[parameterIndex];
                        var item = {
                            symbol: parameterDict.param,
                            wikiSymbol: parameterDict.name.replace(' ', '_'),
                            name: parameterDict.name,
                            description: parameterDict.description,
                            dict: parameterDict
                        };
                        items.push(item);
                    }
                    return items;
                }
            },

            {
                symbol: 'Tools',
                name: 'Tools',
                description: 'Cellular automata machine tools.',
                itemName: 'Tool',
                importantKeys: [
                    'symbol', 'name', 'description', 'wraplicate', 'compositionOverlay', 'feedbackOverlay', 'paramsUsed',
                    'beginToolFunction', 'endToolFunction',
                    'beforeToolFunction', 'afterToolFunction', 'toolFunction'
                ],
                ignoreKeys: [
                    'index'
                ],
                getItemsFunction: function getItemsFunction(chapterDict) {
                    var items = [];
                    for (var toolIndex = 0, toolCount = this.tool_objects.length;
                         toolIndex < toolCount;
                         toolIndex++) {
                        var toolDict = this.tool_objects[toolIndex];
                        var item = {
                            symbol: toolDict.symbol,
                            wikiSymbol: toolDict.name.replace(' ', '_'),
                            name: toolDict.name,
                            description: toolDict.description,
                            dict: toolDict
                        };
                        items.push(item);
                    }
                    return items;
                }
            },

            {
                symbol: 'Commands',
                name: 'Commands',
                description: 'Cellular automata machine commands.',
                itemName: 'Command',
                importantKeys: [
                    'symbol', 'recordable',
                    'getNameFunction', 'getDescriptionFunction', 'isVisibleFunction', 'isEnabledFunction', 'commandFunction',
                ],
                ignoreKeys: [
                    'index'
                ],
                getItemsFunction: function getItemsFunction(chapterDict) {
                    var items = [];
                    for (var commandIndex = 0, commandCount = this.command_objects.length;
                         commandIndex < commandCount;
                         commandIndex++) {
                        var commandDict = this.command_objects[commandIndex];
                        var name = commandDict.getNameFunction.call(
                            this, commandDict);
                        var description = commandDict.getDescriptionFunction.call(
                            this, commandDict);
                        var item = {
                            symbol: commandDict.symbol,
                            wikiSymbol: name.replace(' ', '_'),
                            name: name,
                            description: description,
                            dict: commandDict
                        };
                        items.push(item);
                    }
                    return items;
                }
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The compositionFunction type.


    defineType(
        'compositionFunction',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'threshold_toolCell_set',
                name: 'Channel Threshold Tool Cell Set',
                description: 'Set cell to toolCell if the compositionOverlay channel compositionChannel is within compositionThresholdMin and compositionThresholdMax.',
                compositionFunction: function compositionFunction(
                    compositionFunctionDict,
                    toolDict,
                    activeToolDict,
                    left, top, right, bottom,
                    pixels,
                    cells, cellGutter, cellBufferWidth,
                    cellLeft, cellTop, cellRight, cellBottom) {

                    var thresholdMin =
                        ((activeToolDict.compositionThresholdMin !== undefined)
                            ? activeToolDict.compositionThresholdMin
                            : toolDict.compositionThresholdMin);
                    var thresholdMax =
                        ((activeToolDict.compositionThresholdMax !== undefined)
                            ? activeToolDict.compositionThresholdMax
                            : toolDict.compositionThresholdMax);
                    var channel =
                        ((activeToolDict.compositionChannel !== undefined)
                            ? activeToolDict.compositionChannel
                            : toolDict.compositionChannel);
                    var toolCell = activeToolDict.toolCell;
                    var toolMask = activeToolDict.toolMask;
                    var width = right - left;
                    var height = bottom - top;

                    for (var cellY = top;
                         cellY < bottom;
                         cellY++) {

                        var cellIndex =
                            ((cellGutter + cellY) * cellBufferWidth) +
                            cellGutter + left;

                        var pixelIndex =
                            (cellY * width * 4) +
                            (left * 4);

                        for (var cellX = left;
                             cellX < right;
                             cellX++, cellIndex++, pixelIndex += 4) {

                            var byte =
                                pixels[pixelIndex + channel];

                            if ((byte >= thresholdMin) &&
                                (byte <= thresholdMax)) {

                                cells[cellIndex] =
                                    (toolCell & toolMask) |
                                    (cells[cellIndex] & ~toolMask);

                            }

                        }

                    }

                }

            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The image type.


    defineType(
        'image',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'WebCam',
                name: 'Webcam',
                type: 'webcam'
            },

            {
                symbol: 'StupidFunClubLogo',
                name: 'Stupid Fun Club Logo',
                type: 'image',
                url: 'images/StupidFunClub.png'
            },

            {
                symbol: 'micropolis-tiles',
                name: 'Micropolis Tiles',
                type: 'image',
                url: 'images/micropolis_tiles.png'
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The lineCap type.


    defineType(
        'lineCap',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'butt',
                name: 'Butt',
                description: 'Butt line cap.',
                value: 'butt'
            },

            {
                symbol: 'square',
                name: 'Square',
                description: 'Square line cap.',
                value: 'square'
            },

            {
                symbol: 'round',
                name: 'Round',
                description: 'Round line cap.',
                value: 'round'
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The playMode type.


    defineType(
        'playMode',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'forwardStop',
                name: 'Forward To End',
                description: 'Play forward from beginning to end, and then stop.'
            },
            {
                symbol: 'backwardStop',
                name: 'Backward To Beginning',
                description: 'Play backward from end to beginning, and then stop.'
            },
            {
                symbol: 'forwardLoop',
                name: 'Loop Forward',
                description: 'Play forward from beginning to end, and then loop.'
            },
            {
                symbol: 'backwardLoop',
                name: 'Loop Backwards',
                description: 'Play backward from end to beginning, and then loop.'
            },
            {
                symbol: 'backAndForth',
                name: 'Loop Back And Forth',
                description: 'Play back and forth between the beginning and end, and then repeat.'
            }
        ]);


    ////////////////////////////////////////////////////////////////////////
    // The recordMode type.


    defineType(
        'recordMode',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'snapshotCells',
                name: 'Snapshot: Cells',
                description: 'Record snapshot of cells.',
                recordingSnapshot: true,
                recordingScript: false,
                recordingCells: true,
                recordingParams: false,
                recordingCommands: false,
                recordingTools: false,
            },
            {
                symbol: 'snapshotAllParameters',
                name: 'Snapshot: All Parameters',
                description: 'Record snapshot of all parameters.',
                recordingSnapshot: true,
                recordingScript: false,
                recordingCells: false,
                recordingParams: true,
                recordingCommands: false,
                recordingTools: false
            },
            {
                symbol: 'snapshotCellsAllParameters',
                name: 'Snapshot: Cells, All Parameters',
                description: 'Record snapshot of cells and all parameters.',
                recordingSnapshot: true,
                recordingScript: false,
                recordingCells: true,
                recordingParams: true,
                recordingCommands: false,
                recordingTools: false
            },
            {
                symbol: 'scriptCommands',
                name: 'Script: Commands',
                description: 'Record script of commands.',
                recordingSnapshot: false,
                recordingScript: true,
                recordingCells: false,
                recordingParams: false,
                recordingCommands: true,
                recordingTools: false
            },
            {
                symbol: 'scriptTools',
                name: 'Script: Tools',
                description: 'Record script of tools.',
                recordingSnapshot: false,
                recordingScript: true,
                recordingCells: false,
                recordingParams: false,
                recordingCommands: false,
                recordingTools: true
            },
            {
                symbol: 'scriptAllParameters',
                name: 'Script: All Parameters',
                description: 'Record script of all parameters.',
                recordingSnapshot: true,
                recordingScript: true,
                recordingCells: false,
                recordingParams: true,
                recordingCommands: false,
                recordingTools: false
            },
            {
                symbol: 'scriptParameterChanges',
                name: 'Script: Parameter Changes',
                description: 'Record script of parameter changes.',
                recordingSnapshot: false,
                recordingScript: true,
                recordingCells: false,
                recordingParams: true,
                recordingCommands: false,
                recordingTools: false
            },
            {
                symbol: 'scriptAllParametersCommandsTools',
                name: 'Script: All Parameters, Commands, Tools',
                description: 'Record script of all parameters, commands and tools.',
                recordingSnapshot: true,
                recordingScript: true,
                recordingCells: false,
                recordingParams: true,
                recordingCommands: true,
                recordingTools: true
            },
            {
                symbol: 'scriptParameterChangesCommandsTools',
                name: 'Script: Parameter Changes, Commands, Tools',
                description: 'Record script of parameter changes, commands and tools.',
                recordingSnapshot: false,
                recordingScript: true,
                recordingCells: false,
                recordingParams: true,
                recordingCommands: true,
                recordingTools: true
            },
            {
                symbol: 'scriptCellsAllParametersCommandsTools',
                name: 'Script: Cells, All Parameters, Commands, Tools',
                description: 'Record script of cells, all parameters, commands and tools.',
                recordingSnapshot: true,
                recordingScript: true,
                recordingCells: true,
                recordingParams: true,
                recordingCommands: true,
                recordingTools: true
            }
        ]);


    ////////////////////////////////////////////////////////////////////////
    // The tab type.


    defineType(
        'tab',
        CAM6.prototype,
        null,
        ['symbol'],
        [

            {
                symbol: 'commands',
                name: 'Commands',
                description: 'Commands tab.',
                value: 'command'
            },

            {
                symbol: 'tools',
                name: 'Tools',
                description: 'Tools tab.',
                value: 'tools'
            },

            {
                symbol: 'rules',
                name: 'Rules',
                description: 'Rules tab.',
                value: 'rules'
            },

            {
                symbol: 'simulation',
                name: 'Simulation',
                description: 'Simulation tab.',
                value: 'simulation'
            },

            {
                symbol: 'hints',
                name: 'Hints',
                description: 'Hints tab.',
                value: 'hints'
            },

            {
                symbol: 'help',
                name: 'Help',
                description: 'Help tab.',
                value: 'help'
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // Class variables.


    // Anisotropic convolution kernels, used in the ruleKernels by the
    // Marble neighborhood. Each kernel must add up to 16.
    CAM6.prototype.kernels = {
        northWest: [
            2,  2,  1,
            2,  8,  0,
            1,  0,  0
        ],
        north: [
            2,  2,  2,
            1,  8,  1,
            0,  0,  0
        ],
        northEast: [
            1,  2,  2,
            0,  8,  2,
            0,  0,  1
        ],
        west: [
            2,  1,  0,
            2,  8,  0,
            2,  1,  0
        ],
        east: [
            0,  1,  2,
            0,  8,  2,
            0,  1,  2
        ],
        southWest: [
            1,  0,  0,
            2,  8,  0,
            2,  2,  1
        ],
        south: [
            0,  0,  0,
            1,  8,  1,
            2,  2,  2
        ],
        southEast: [
            0,  0,  1,
            0,  8,  2,
            1,  2,  2
        ],
        northWester: [
            6,  3,  0,
            3,  4,  0,
            0,  0,  0
        ],
        norther: [
            3,  6,  3,
            0,  4,  0,
            0,  0,  0
        ],
        northEaster: [
            0,  3,  6,
            0,  4,  3,
            0,  0,  0
        ],
        wester: [
            3,  0,  0,
            6,  4,  0,
            3,  0,  0
        ],
        easter: [
            0,  0,  3,
            0,  4,  6,
            0,  0,  3
        ],
        southWester: [
            0,  0,  0,
            3,  4,  0,
            6,  3,  0
        ],
        souther: [
            0,  0,  0,
            0,  4,  0,
            3,  6,  3
        ],
        southEaster: [
            0,  0,  0,
            0,  4,  3,
            0,  3,  6
        ],
        center: [
            1,  2,  1,
            2,  4,  2,
            1,  2,  1
        ],
        center_tight: [
            0,  0,  0,
            0,  16, 0,
            0,  0,  0
        ],
        center_loose_square: [
            2,  2,  2,
            2,  0,  2,
            2,  2,  2
        ],
        center_loose_round: [
            1,  3,  1,
            3,  0,  3,
            1,  3,  1
        ],
        center_loose_cross: [
            3,  1,  3,
            1,  0,  1,
            3,  1,  3
        ],
        center_cross: [
            2,  0,  2,
            0,  8,  0,
            2,  0,  2
        ],
        center_0: [
            0,  0,  0,
            0, 16,  0,
            0,  0,  0
        ],
        center_1: [
            0,  1,  0,
            1, 12,  1,
            0,  1,  0
        ],
        center_2: [
            1,  0,  1,
            0, 12,  0,
            1,  0,  1
        ],
        center_3: [
            0,  2,  0,
            2,  8,  2,
            0,  2,  0
        ],
        center_4: [
            2,  0,  2,
            0,  8,  0,
            2,  0,  2
        ],
        center_5: [
            1,  1,  1,
            1,  8,  1,
            1,  1,  1
        ],
        center_6: [
            1,  2,  1,
            2,  4,  2,
            1,  2,  1
        ],
        center_7: [
            2,  1,  2,
            1,  4,  1,
            2,  1,  2
        ],
        horizontal: [
            1,  0,  1,
            2,  8,  2,
            1,  0,  1
        ],
        vertical: [
            1,  2,  1,
            0,  8,  0,
            1,  2,  1
        ],
        diagonal_backslash: [
            2,  1,  0,
            1,  8,  1,
            0,  1,  2
        ],
        diagonal_slash: [
            0,  1,  2,
            1,  8,  1,
            2,  1,  0
        ]
    };

    ////////////////////////////////////////////////////////////////////////
    // CAM6 instance methods.


    // init just sets everything to its default value, regardless of
    // the params, which it resets. It should not do much else.
    CAM6.prototype.init = function init() {

        // Default configured parameters.
        this.params = {};

        // jQuery DOM objects.
        this.$window = null;
        this.$parent = null;
        this.$root = null;
        this.$content = null;
        this.$glCanvas = null;
        this.$tabsFrame = null;
        this.$tabsContainer = null;
        this.$mapFrame = null;
        this.$histogramCanvasFrame = null;
        this.$histogramCanvasContainer = null;
        this.$histogramCanvas = null;
        this.$mapFrameBr = null;
        this.$cellCanvasFrame = null;
        this.$cellCanvasContainer = null;
        this.$webCamVideo = null;
        this.$headTrackerInput = null;
        this.$cellCanvas = null;
        this.$compositionOverlay = null;
        this.$feedbackOverlay = null;
        this.$headTrackerOverlay = null;
        this.$interfaceFrame = null;
        this.$interfaceContainer = null;
        this.$initializeDialog = null;
        this.$initializeDialogText = null;
        this.$initializeDialogPre = null;
        this.$initializeDialogTextArea = null;

        this.useGUI = true;
        this.windowWidth = 1024;
        this.windowHeight = 1024;
        this.cellWidth = 256;
        this.cellHeight = 256;
        //this.cellWidth = 320;
        //this.cellHeight = 240;
        //this.cellWidth = Math.floor(16 * 30);
        //this.cellHeight = Math.floor(9 * 30 * 0.82 * 0.5) * 2.0;
        this.cellGutter = 1;
        this.tileScale = 16;
        this.cellCanvasScale = 2;
        this.histogramCanvasScale = 2;
        this.doCellCanvas = true;
        this.doHistogram = true;
        //this.doHistogram = false;
        this.histogramToolCellHeight = 5;
        this.histogramHeaderHeight = 5;
        this.histogramGraphHeight = 30;
        this.randomizeError = 0;
        this.spinScanOrder = true;
        this.invertPhaseIfCellBit80Set = false;
        this.analyzerEnabled = false;
        this.webCamEnabled = false;
        this.headTrackerEnabled = false;

        // Parameters defined by paramMetaData.
        this.toolSymbol = 'circularBrush';
        this.toolCell = 140;
        this.toolSize = 30;
        this.toolMask = 0xff;
        this.toolSprinkles = 10;
        this.toolVolume = 11.0;
        this.toolGranularity = 0.5;
        this.toolCellMin = 0;
        this.toolCellMax = 0xff;
        this.compositionChannel = 3;
        this.compositionThresholdMin = 0x80;
        this.compositionThresholdMax = 0xff;
        this.toolLineCapSymbol = 'round';
        this.toolImageSymbol = 'StupidFunClubLogo';
        this.ruleSymbol = 'TwistierMarble';
        this.frobTarget = -0.05;
        this.frob = -14.5;
        this.unfrob = 0.05;
        this.frobScale = -0.5;
        this.phaseScale = 0.005;
        this.phaseOffset = 0;
        this.phaseShiftX = 3;
        this.phaseShiftY = 3;
        this.phaseShiftCell = 2;
        this.phaseShiftStep = 4;
        this.heatShiftPollution = 2;
        this.colorMapSymbol = 'default';
        this.stepsPerFrame = 1;
        this.animationDelay = 1;
        this.playSpeed = 1;
        this.playModeSymbol = 'forwardStop';
        this.recordModeSymbol = 'scriptParameterChangesCommandsTools';
        this.randomSeed = '' + Math.random(); // XXX: Why is this a string?!
        this.phaseTime = 0;
        this.step = 0;
        this.analyzerSymbol = 'headPainter';

        // Runtime variables.
        this.histogram = null;
        this.cellCanvasContext = null;
        this.gl = null;
        this.glPanX = 0;
        this.glPanY = 0;
        this.glScale = 16.0;
        this.glTileSize = 16;
        this.glTilesImage = null;
        this.glTilesImageSymbol = 'micropolis-tiles';
        this.glTilesTexture = null;
        this.compositionOverlayContext = null;
        this.feedbackOverlayContext = null;
        this.cellCanvasImageData = null;
        this.cellCanvasData = null;
        this.cellBufferWidth = 0;
        this.cellBufferHeight = 0;
        this.cellBufferSize = 0;
        this.cells0 = null;
        this.cells1 = null;
        this.colorCells = null;
        this.animationTimer = null;
        this.fullScreen = false;
        this.paused = true;
        this.steps = 0;
        this.trackingCells = false;
        this.trackingCellsLayer = 10;
        this.trackingCellsActiveToolDict = null;
        this.trackingHistogram = false;
        this.mouseButton = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseLastX = 0;
        this.mouseLastY = 0;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.coordinatePairs = [
            ['mouseX', 'mouseY'],
            ['mouseLastX', 'mouseLastY'],
            ['mouseDownX', 'mouseDownY'],
        ];
        this.scriptRecording = false;
        this.scriptRecordingScript = null;
        this.scriptRecordingStartStep = null;
        this.scriptPlaying = false;
        this.scriptPlayingScript = null;
        this.scriptPlayingIndex = null;
        this.scriptPlayingStartStep = null;
        this.recordingSnapshot = false;
        this.recordingScript = false;
        this.recordingCells = false;
        this.recordingParams = false;
        this.recordingCommands = false;
        this.recordingTools = false;
        this.analyzerState = 'disabled';
        this.analyzerStatus = 'Analyzer disabled.';
        this.webCamState = 'disabled';
        this.webCamStatus = 'Webcam disabled.';
        this.webCamMade = false;
        this.webCamStream = null;
        this.headTrackerState = 'disabled';
        this.headTrackerStatus = 'Head tracker disabled.';
        this.headTrackerOverlayContext = null;
        this.headTrackerDetectionInterval = 20;
        this.headTrackerSmoothingInterval = 35;
        this.headTrackerMade = false;
        this.headTracker = null;
        this.headTrackerDetection = null;
        this.headTrackerDetectionLast = null;
        this.headTrackerTracking = false;
        this.headTrackerTrackingLast = false;
        this.headTrackerTrackingStartTime = 0;
        this.headTrackerTrackingEndTime = 0;
        this.headTrackerTrackingStatus = 0;
        this.headTrackerUpdateCount = 0;
        this.headTrackerUpdateTime = 0;
        this.headTrackerX = 0;
        this.headTrackerY = 0;
        this.headTrackerWidth = 0;
        this.headTrackerHeight = 0;
        this.headTrackerAngle = 0;
        this.activeTools = [];
        this.userTools = {};
        this.tabs = [];
        this.currentTabIndex = null;

    };


    // startup starts the simulation by initializing everything, creating
    // the user interface, and starting the animation timer.
    CAM6.prototype.startup = function startup() {
        this.makeGUI();
        this.initFromParams();
        this.startupLoadImages();
    };


    CAM6.prototype.startupLoadImages = function startupLoadImages() {

        //LOG('startupLoadImages begin: imageObjects:', this.image_objects);

        var promises = [];

        for (var i = 0, n = this.image_objects.length;
             i < n;
             i++) {

            var image = this.image_objects[i]

            switch (image.type) {

                case 'webcam':
                    break;

                case 'image':
                    var deferred = $.Deferred();
                    promises.push(deferred.promise());
                    image.image = new Image();
                    //LOG('Loading image:', image);
                    (function (deferred) { // Capture deferred.
                        image.image.onload = function() {
                            //LOG('Loaded image url:', image.url, 'image:', image);
                            deferred.resolve();
                        };
                    })(deferred);
                    image.image.src = image.url;
                    break;

                default:
                    LOG('Unknown resource type in resourceDict:', resourceDict);
                    break;

            }

        }

        var target = this;
        $.when.apply(null, promises).done(function() {
            //LOG('All resources loaded, so finishing startup.');
            target.startupFinish();
        });

        //LOG('startupLoadImages: end: waiting...');

    };


    CAM6.prototype.startupFinish = function startupFinish() {
    
        this.makeCells();
        this.makeHistogram();
        this.initCanvas();
        this.initHistogram();
        this.glInit();
        this.randomizeCells();
        this.updateParamVisibility();

        this.paused = false;
        this.scheduleTick();

        if (this.analyzerEnabled) {
            this.enableAnalyzer();
        } else {
            this.disableAnalyzer();
        }

        this.updateCommands();
    };


    // initFromParams initializes the simulator engine from the parameters
    // dictionary.
    CAM6.prototype.initFromParams = function initFromParams() {

        var params = this.params || {};

        // Params configurable at startup via params.
        this.useGUI = params.useGUI || this.useGUI;
        this.cellWidth = params.cellWidth || this.cellWidth;
        this.cellHeight = params.cellHeight || this.cellHeight;
        this.cellGutter = params.cellGutter || this.cellGutter;
        this.cellCanvasScale = params.cellCanvasScale || this.cellCanvasScale;
        this.doCellCanvas = params.doCellCanvas || this.doCellCanvas;
        this.doHistogram = params.doHistogram || this.doHistogram;
        this.histogramGapHeight = params.histogramGapHeight || this.histogramGapHeight;
        this.histogramToolCellHeight = params.histogramToolCellHeight || this.histogramToolCellHeight;
        this.histogramHeaderHeight = params.histogramHeaderHeight || this.histogramHeaderHeight;
        this.histogramGraphHeight = params.histogramGraphHeight || this.histogramGraphHeight;
        this.analyzerEnabled = (params.analyzerEnabled !== null) ? params.analyzerEnabled : this.analyzerEnabled;
        this.resources = (params.resources !== null) ? params.resources : this.resources;

        // Params described by paramMetaData.
        this.setValue(this, 'toolSymbol', params.toolSymbol || this.toolSymbol);
        this.setValue(this, 'toolCell', params.toolCell || this.toolCell);
        this.setValue(this, 'toolSize', params.toolSize || this.toolSize);
        this.setValue(this, 'toolMask', params.toolMask || this.toolMask);
        this.setValue(this, 'toolSprinkles', params.toolSprinkles || this.toolSprinkles);
        this.setValue(this, 'toolVolume', params.toolVolume || this.toolVolume);
        this.setValue(this, 'toolGranularity', params.toolGranularity || this.toolGranularity);
        this.setValue(this, 'toolCellMin', params.toolCellMin || this.toolCellMin);
        this.setValue(this, 'toolCellMax', params.toolCellMax || this.toolCellMax);
        this.setValue(this, 'compositionChannel', params.compositionChannel || this.compositionChannel);
        this.setValue(this, 'compositionThresholdMin', params.compositionThresholdMin || this.compositionThresholdMin);
        this.setValue(this, 'compositionThresholdMax', params.compositionThresholdMax || this.compositionThresholdMax);
        this.setValue(this, 'toolLineCapSymbol', params.toolLineCapSymbol || this.toolLineCapSymbol);
        this.setValue(this, 'toolImageSymbol', params.toolImageSymbol || this.toolImageSymbol);
        this.setValue(this, 'ruleSymbol', params.ruleSymbol || this.ruleSymbol);
        this.setValue(this, 'frobTarget', params.frobTarget || this.frobTarget);
        this.setValue(this, 'frob', params.frob || this.frob);
        this.setValue(this, 'unfrob', params.unfrob || this.unfrob);
        this.setValue(this, 'frobScale', params.frobScale || this.frobScale);
        this.setValue(this, 'phaseScale', params.phaseScale || this.phaseScale);
        this.setValue(this, 'phaseOffset', params.phaseOffset || this.phaseOffset);
        this.setValue(this, 'phaseShiftX', params.phaseShiftX || this.phaseShiftX);
        this.setValue(this, 'phaseShiftY', params.phaseShiftY || this.phaseShiftY);
        this.setValue(this, 'phaseShiftCell', params.phaseShiftCell || this.phaseShiftCell);
        this.setValue(this, 'phaseShiftStep', params.phaseShiftStep || this.phaseShiftStep);
        this.setValue(this, 'heatShiftPollution', params.heatShiftPollution || this.heatShiftPollution);
        this.setValue(this, 'colorMapSymbol', params.colorMapSymbol || this.colorMapSymbol);
        this.setValue(this, 'stepsPerFrame', params.stepsPerFrame || this.stepsPerFrame);
        this.setValue(this, 'animationDelay', params.animationDelay || this.animationDelay);
        this.setValue(this, 'playSpeed', params.playSpeed || this.playSpeed);
        this.setValue(this, 'playModeSymbol', params.playModeSymbol || this.playModeSymbol);
        this.setValue(this, 'recordModeSymbol', params.recordModeSymbol || this.recordModeSymbol);
        this.setValue(this, 'randomSeed', params.randomSeed || this.randomSeed);
        this.setValue(this, 'phaseTime', params.phaseTime || this.phaseTime);
        this.setValue(this, 'analyzerSymbol', params.analyzerSymbol || this.analyzerSymbol);

    };


    // setValue sets the param named by key to the given paramValue,
    // by calling the metadata's setValueFunction if defined, or
    // otherwise just setting it manually. It also records the
    // parameter change in the script if we're recording, and notifies
    // the user interface that the key value has changed.
    CAM6.prototype.setValue = function setValue(target, key, paramValue) {

        var previousParamValue = target[key];

        //LOG('setValue', ['target', target, 'key', key, 'paramValue', paramValue, 'previousParamValue', previousParamValue]);

        var paramMetaData = this.get_paramMetaData_by_param(key);

        if (!paramMetaData) {

            // If there is no metadata for this parameter, then just
            // set the paramValue directly.
            target[key] = paramValue;

        } else {

            // There is metadata for the parameter.

            // Record param changes if we're recording a script, the
            // script recording includes parameters, and the parameter
            // is recordable.
            if (this.scriptRecording &&
                this.recordingParams &&
                paramMetaData &&
                paramMetaData.recordable) {

                var params = {};
                params[key] = paramValue;

                // Record the params changed, automatically remembering
                // the old values as oldParams by passing null as oldParams.
                this.recordParams(target, params, null);

            }

            // Call the setValueFunction if it's defined in the
            // metadata, otherwise just set the paramValue directly.
            if (paramMetaData.setValueFunction) {

                paramMetaData.setValueFunction.call(
                    this, paramMetaData, target, key, paramValue, previousParamValue);

            } else {

                target[key] = paramValue;

            }

            // If there is a user interface for this parameters, then
            // update the user interface's view of the new paramValue.
            if (paramMetaData.$div) {

                var valueDescription =
                    paramMetaData.getValueDescriptionFunction.call(
                        this, paramMetaData, target, paramValue);
                var valueName =
                    paramMetaData.getValueNameFunction.call(
                        this, paramMetaData, target, paramValue);

                if (paramMetaData.$value) {

                    paramMetaData.$value.attr({
                        title: paramMetaData.description + '\n' + valueDescription
                    });

                    paramMetaData.$value.text(valueName);
                }

                if (paramMetaData.$widget) {

                    switch (paramMetaData.widget) {

                        case 'slider':
                            paramMetaData.$widget.slider(
                                'value',
                                (paramMetaData.paramValueToWidgetValueFunction
                                    ? paramMetaData.paramValueToWidgetValueFunction.call(
                                        this, paramMetaData, target, paramValue)
                                    : paramValue));
                            break;

                        case 'menu':
                            var widgetValue =
                                (paramMetaData.paramValueToWidgetValueFunction
                                    ? paramMetaData.paramValueToWidgetValueFunction.call(
                                        this, paramMetaData, target, paramValue)
                                    : paramValue);
                            paramMetaData.$widget
                                .children('option')
                                    .each(function(el) {
                                        // this is the DOM option element inside the select menu.
                                        this.selected =
                                            widgetValue == this.value;
                                    });
                            break;

                    }

                }

            }

        }

    };


    // scriptRecordStart starts recording a new script.
    CAM6.prototype.scriptRecordStart = function scriptRecordStart() {

        var target = this; // TODO

        this.scriptRecording = true;
        this.scriptRecordingScript = [];
        this.scriptRecordingStartStep = this.step;

        var recordModeDict = this.recordMode_by_symbol[this.recordModeSymbol];

        this.recordingSnapshot = recordModeDict.recordingSnapshot;
        this.recordingScript = recordModeDict.recordingScript;
        this.recordingCells = recordModeDict.recordingCells;
        this.recordingParams = recordModeDict.recordingParams;
        this.recordingCommands = recordModeDict.recordingCommands;
        this.recordingTools = recordModeDict.recordingTools;

        if (this.recordingCells) {
            this.recordCells();
        }

        if (this.recordingParams && this.recordingSnapshot) {
            // Record all params as both newParams and oldParams.
            this.recordParams(target, null, null);
        }

        if (!this.recordingScript) {
            this.scriptRecordStop();
        }

        this.updateCommands();
    };


    // scriptRecordStop stops recording a new script.
    CAM6.prototype.scriptRecordStop = function scriptRecordStop() {

        var target = this; // TODO

        if (this.recordingParams && this.recordingSnapshot) {
            // Record all params as both newParams and oldParams.
            this.recordParams(target, null, null);
        }

        if (this.recordingCells) {
            this.recordCells();
        }

        this.scriptRecording = false;
        this.scriptPlayingScript = this.scriptRecordingScript;
        this.scriptRecordingScript = null;

        this.updateCommands();

    };


    // scriptPlayStart starts playing the current script.
    CAM6.prototype.scriptPlayStart = function scriptPlayStart() {
        if (!this.scriptPlayingScript ||
            !this.scriptPlayingScript.length) {
            return;
        }

        switch (this.playModeSymbol) {

            case 'forwardStop':
            case 'forwardLoop':
            case 'backAndForth':
                this.scriptPlayingIndex = 0;
                this.setValue(this, 'playSpeed', 1);
                break;

            case 'backwardStop':
            case 'backwardLoop':
                this.scriptPlayingIndex = this.scriptPlayingScript.length - 1;
                this.setValue(this, 'playSpeed', -1);
                break;

        }

        this.scriptPlayingStartStep = this.step;
        this.scriptPlaying = true;

        this.updateCommands();
    };


    // scriptPlayStop stops playing the current script.
    CAM6.prototype.scriptPlayStop = function scriptPlayStop() {
        this.scriptPlaying = false;

        this.updateCommands();
    };


    // playScript plays the script, if playing.
    CAM6.prototype.playScript = function playScript() {

        if (this.paused || !this.scriptPlaying) {
            return;
        }

        if (!this.scriptPlayingScript) {

            this.scriptPlaying = false;
            this.updateCommands();

            return;
        }

        switch (this.playModeSymbol) {

            case 'forwardStop':

                if (this.playSpeed < 0) {
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                }

                if (this.scriptPlayingIndex >= this.scriptPlayingScript.length) {

                    this.scriptPlaying = false;
                    this.updateCommands();

                    return;
                }

                break;

            case 'forwardLoop':

                if (this.playSpeed < 0) {
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                }

                if (this.scriptPlayingIndex >= this.scriptPlayingScript.length) {
                    this.scriptPlayingIndex = 0;
                    this.scriptPlayingStartStep = this.step;
                }

                break;

            case 'backAndForth':

                if ((this.playSpeed > 0) &&
                    (this.scriptPlayingIndex >= this.scriptPlayingScript.length)) {

                    this.scriptPlayingIndex = this.scriptPlayingScript.length - 1;
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                    this.scriptPlayingStartStep = this.step;

                } else if ((this.playSpeed < 0) &&
                           (this.scriptPlayingIndex < 0)) {

                    this.scriptPlayingIndex = 0;
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                    this.scriptPlayingStartStep = this.step;

                }

                break;

            case 'backwardStop':

                if (this.playSpeed > 0) {
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                }

                if (this.scriptPlayingIndex < 0) {

                    this.scriptPlaying = false;
                    this.updateCommands();

                    return;
                }

                break;

            case 'backwardLoop':

                if (this.playSpeed > 0) {
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                }

                if (this.scriptPlayingIndex < 0) {
                    this.scriptPlayingIndex = this.scriptPlayingScript.length - 1;
                    this.scriptPlayingStartStep = this.step;
                }

                break;

        }

        if (this.playSpeed < 0) {

            while (this.scriptPlayingIndex >= 0) {

                var scriptDict =
                    this.scriptPlayingScript[this.scriptPlayingIndex];
                var scriptDictStep =
                    scriptDict.step;

                var lastScriptDict =
                    this.scriptPlayingScript[this.scriptPlayingScript.length - 1];
                var lastStep =
                    lastScriptDict.step;

                var relativeStep =
                    lastStep -
                    (this.step - this.scriptPlayingStartStep);

                if (relativeStep > scriptDictStep) {
                    return;
                }

                this.scriptPlayingIndex--;

                this.playScriptDict(scriptDict);

            }

        } else {

            while (this.scriptPlayingIndex < this.scriptPlayingScript.length) {

                var scriptDict =
                    this.scriptPlayingScript[this.scriptPlayingIndex];
                var scriptDictStep =
                    scriptDict.step;

                var relativeStep =
                    this.step - this.scriptPlayingStartStep;

                if (relativeStep < scriptDictStep) {
                    return;
                }

                this.scriptPlayingIndex++;

                this.playScriptDict(scriptDict);

            }

        }

        //this.scriptPlaying = false;
        //this.updateCommands();

    };


    // playScriptDict plays the given script dictionary now.
    CAM6.prototype.playScriptDict = function playScriptDict(scriptDict) {

        switch (scriptDict.scriptType) {

            case 'cells':

                var params = scriptDict.params;

                this.playCells(
                    params);

                break;

            case 'params':

                // Use the old or new params depending on which direction we are playing the script.
                var params =
                    (this.playSpeed > 0)
                        ? scriptDict.newParams
                        : scriptDict.oldParams;

                var target = this; // TODO

                this.playParams(
                    target,
                    params);

                break;

            case 'tool':

                var activeToolDict = scriptDict.activeToolDict;

                this.playTool(
                    activeToolDict);

                break;

            case 'toolBegin':
                break;

            case 'toolEnd':
                this.clearCompositionOverlay();
                this.clearFeedbackOverlay();
                break;

            case 'command':

                var symbol = scriptDict.commandSymbol;
                var commandDict = this.command_by_symbol[symbol];
                var params = scriptDict.params;

                this.playCommand(
                    commandDict,
                    params);

                break;

        }

    };


    // playParams plays a params dictionary.
    CAM6.prototype.playParams = function playParams(target, params) {

        var target = this; // TODO

        for (var key in params) {
            var value = params[key];
            this.setValue(target, key, value);
        }

    };


    // playCells plays a cells dictionary.
    CAM6.prototype.playCells = function playCells(params) {

        var cellWidth = params.cellWidth;
        var cellHeight = params.cellHeight;
        var cellData = params.cellData;

        this.setCells(cellData, cellWidth, cellHeight);

    };


    // playCommand plays a command dictionary and parameters.
    CAM6.prototype.playCommand = function playCommand(commandDict, params) {

        if (params.randomSeed) {
            this.randomSeed = params.randomSeed;
            Math.seedrandom(params.randomSeed);
        }

        commandDict.commandFunction.call(
            this, commandDict, params);

    };


    // recordCommand records the command, if recording a script.
    CAM6.prototype.recordCommand = function recordCommand(commandDict, params) {

        if (!this.scriptRecording ||
            !commandDict.recordable) {
            return;
        }

        this.scriptRecordingScript.push(
            {
                step: this.step - this.scriptRecordingStartStep,
                scriptType: 'command',
                commandSymbol: commandDict.symbol,
                params: $.extend({}, params)
            }
        );

    };


    // recordParams records the params, if recording a script. The
    // newParams parameter should be a dictionary of new parameter
    // values, or null to record all parameter values defined by
    // metadata and marked as recordable. The oldParams parameter
    // should be a dictionary of the parameter's previous values, or
    // null to use the current values as the previous values. (So of
    // course you should call recordParams before actually changing
    // the values, for this convenience to work!) The point of
    // reording both old and new params is so we can play scripts
    // backwards. When we take snapshots of all the parameters at the
    // beginning and end of a script, we want the oldParams and
    // newParams to be the same, since we bounce against those
    // endpoint states when playing a script back and forth.
    CAM6.prototype.recordParams = function recordParams(target, newParams, oldParams) {

        if (!this.scriptRecording) {
            return;
        }

        // If newParams is not defined, then we take a snapshot of all
        // params defined by metadata that have their recordable flag
        // set.
        if (!newParams) {

            newParams = {};

            for (var i = 0, n = this.paramMetaData_objects.length;
                 i < n;
                 i++) {

                var paramMetaData =
                    this.paramMetaData_objects[i];

                if (paramMetaData.recordable) {
                    newParams[paramMetaData.param] =
                        target[paramMetaData.param];
                }

            }

        }

        // If oldParams is not defined, then we take a snapshot of
        // the param's current value, assuming that recordParams is
        // being called before those values have been changed of
        // ourse.
        if (!oldParams) {

            oldParams = {};

            for (var i = 0, n = this.paramMetaData_objects.length;
                 i < n;
                 i++) {

                var paramMetaData =
                    this.paramMetaData_objects[i];

                if (paramMetaData.recordable) {
                    oldParams[paramMetaData.param] =
                        target[paramMetaData.param];
                }

            }

        }

        // For efficieny's sake, we collapse sequences of setValues on
        // the same set into the same script entry. Search backwards
        // from the end of the script for a params scriptDict on the
        // current step, to make sure we don't miss any, and if found,
        // then update its newParams and oldParams appropriately.

        for (var scriptIndex = this.scriptRecordingScript - 1;
             scriptIndex >= 0;
             scriptIndex--) {

            // TODO: make sure same target

            var scriptDict =
                this.scriptRecordingScript[scriptIndex];

            // If the step of this scriptDict is different than this
            // step, then we didn't find anything, so we are done searching.
            if (scriptDict.step != this.step) {
                break;
            }

            // If the scriptType of this scriptDict is not params,
            // then keep searching.
            if (scriptDict.scriptType != 'params') {
                continue;
            }

            // We found an existing params scriptDict to recycle!

            // Always update the scriptDict's newParams with fresh
            // values from our most recent newParams, so it has up
            // to date values.
            for (var key in newParams) {
                lastScriptDict.newParams[key] = newParams.value;
            }

            // Set any of the the scriptDict's oldParams keys that
            // are not already set from the most recent oldParams,
            // so we don't stomp on older values with newer values.
            for (var key in oldParams) {
                if (!(key in lastScriptDict.oldParams)) {
                    lastScriptDict.oldParams[key] = oldParams.value;
                }
            }

            //LOG('Script extended last recorded params:', ['step', this.step, 'newParams', oldParams, 'lastScriptDict', lastScriptDict]);

            // The whole point of this exercise was to avoid making a
            // new scriptDict, so we are all done!
            return;
        }

        // TODO: record target
        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'params',
            newParams: $.extend({}, newParams),
            oldParams: $.extend({}, oldParams)
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded params:', ['step', this.step, 'target', target, 'newParams', newParams, 'oldParams', oldParams, 'scriptDict', scriptDict]);

    };


    // recordCells records the cells, if recording a script.
    CAM6.prototype.recordCells = function recordCells() {

        if (!this.scriptRecording) {
            return;
        }

        var cellData = this.getCellData();

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'cells',
            params: {
                cellData: cellData,
                cellWidth: this.cellWidth,
                cellHeight: this.cellHeight
            }
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded cells:', ['step', this.step, 'cellData', cellData, 'cellWidth', this.cellWidth, 'cellHeight', this.cellHeight, 'scriptDict', scriptDict]);

    };


    // scriptSave saves the current script.
    CAM6.prototype.scriptSave = function scriptSave() {

        if (!this.scriptPlayingScript ||
            !this.scriptPlayingScript.length) {
            alert('There is no script to save! Try recording something.');
            this.updateCommands();
            return;
        }

        var scriptName =
            prompt('What do you want to call this script?');

        if (!scriptName ||
            scriptName == '') {
            this.updateCommands();
            return;
        }

        //LOG('scriptSave', ['scriptName', scriptName, 'scriptPlayingScript', this.scriptPlayingScript]);

        alert('Sorry, but saving is not implemented yet! Come back soon!');

        this.updateCommands();
    };


    // scriptLoad loads a script.
    CAM6.prototype.scriptLoad = function scriptLoad() {

        // TODO

        this.updateCommands();

    };


    // enableWebCam enables the WebCam.
    CAM6.prototype.enableWebCam = function enableWebCam() {

        if (!this.webCamEnabled) {
            this.setValue(this, 'webCamEnabled', true);
            this.updateCommands();
        }

    };


    // disableWebCam disables the WebCam.
    CAM6.prototype.disableWebCam = function disableWebCam() {

        if (this.headTrackerEnabled) {
            this.disableHeadTracker();
        }

        if (this.webCamEnabled) {
            this.setValue(this, 'webCamEnabled', false);
            this.updateCommands();
        }

    };


    CAM6.prototype.updateWebCam = function updateWebCam() {

        var done = false;

        while (!done) {

            switch (this.webCamState) {

                case 'broken':

                    if (this.webCamEnabled) {

                        LOG('updateWebCam: webCam enabled but broken, so disabling it.');

                        this.disableWebCam();

                        if (this.$webCamVideo &&
                            this.$webCamVideo.length) {

                            this.$webCamVideo.css({
                                display: 'none'
                            });

                            var video = this.$webCamVideo[0];

                            video.pause();
                            video.src = '';

                            if (this.webCamStream) {
                                this.webCamStream.stop();
                                this.webCamStream = null;
                            }

                        }

                    }

                    // Stay broken.
                    done = true;

                    break;

                case 'disabled':

                    if (!this.webCamEnabled) {

                        // Stay disabled.
                        done = true;

                    } else {

                        // Try to enable.

                        // If it's not made, then try to make it.
                        if (!this.webCamMade) {

                            if (!this.$webCamVideo ||
                                !this.$webCamVideo.length) {

                                // No $webCamVideo element to use, so we're broken.
                                this.setValue(this, 'webCamState', 'broken');
                                this.setValue(this, 'webCamStatus', 'No webCamVideo element.');

                            } else {

                                // We have a $webCamVideo, so try to find getUserMedia.

                                navigator.getUserMedia =
                                    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                                window.URL =
                                    window.URL || window.webkitURL || window.msURL || window.mozURL;

                                // Check for video support.
                                if (!navigator.getUserMedia) {

                                    // No getUserMedia, so it's broken;
                                    this.setValue(this, 'webCamState', 'broken');
                                    this.setValue(this, 'webCamStatus', 'Browser does not support getUserMedia webcam.');

                                } else {

                                    // We found getUserMedia, so we made it!
                                    this.webCamMade = true;

                                }

                            }

                        }

                        // If it was made, then try to start it.
                        if (this.webCamMade) {

                            var videoSelector = {
                                video: true
                            };

                            // Chrome 19 shim.
                            if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
                                var chromeVersion =
                                    parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
                                if (chromeVersion < 20) {
                                    videoSelector = 'video';
                                }
                            }

                            // Opera shim.
                            if (window.opera) {
                                window.URL = window.URL || {};
                                if (!window.URL.createObjectURL) {
                                    window.URL.createObjectURL =
                                        function(obj) {
                                            return obj;
                                        };
                                }
                            }

                            // Try to get the webcam video stream.

                            var video = this.$webCamVideo[0];

                            this.setValue(this, 'webCamState', 'enabling');
                            this.setValue(this, 'webCamStatus', 'Waiting for getUserMedia to return webcam stream.');

                            this.webCamStream = null;

                            //LOG('updateWebCam: calling getUserMedia.');

                            navigator.getUserMedia(
                                videoSelector,
                                $.proxy(function getUserMedia_success(stream) {

                                    // Only do this is we are still waiting to enable.

                                    if (this.webCamState != 'enabling') {

                                        LOG('Success from getUserMedia while not in enabling state, so ignorning.', 'webCamState', this.webCamState);

                                        stream.stop();

                                    } else {

                                        // We got the stream!

                                        LOG('Webcam found:', 'video', video, 'stream', stream);

                                        this.webCamStream = stream;

                                        if (video.mozCaptureStream) {
                                            video.mozSrcObject = stream;
                                        } else {
                                            video.src =
                                                (window.URL && window.URL.createObjectURL(stream)) ||
                                                stream;
                                        }

                                        video.play();

                                        this.$webCamVideo.css({
                                            display: 'block'
                                        });

                                        this.setValue(this, 'webCamState', 'enabled');
                                        this.setValue(this, 'webCamStatus', 'Got webcam video stream.');

                                    }

                                }, this),
                                $.proxy(function getUserMedia_error(error) {

                                    // Only do this is we are still waiting to enable.

                                    if (this.webCamState != 'enabling') {

                                        LOG('Error from getUserMedia while not in enabling state, so ignorning.', 'webCamState', this.webCamState);

                                    } else {

                                        // We got an error trying to get the stream
                                        // (user denied permission, etc).

                                        LOG('Error from getUserMedia getting webcam stream:', error);

                                        this.setValue(this, 'webCamState', 'broken');
                                        this.setValue(this, 'webCamStatus', 'Error returned by getUserMedia attempting to get webCam.');

                                    }

                                }, this));

                            // If we're now trying to enable, then we're done.
                            if (this.webCamState == 'enabling') {
                                done = true;
                            }

                        }

                    }

                    break;

                case 'enabling':

                    // We're trying to enable the webcam, waiting for
                    // getUserMedia to fire the success or faiure
                    // callback, which will bump is to the next state.

                    done = true;

                    break;

                case 'enabled':

                    if (this.webCamEnabled) {

                        // Stay enabled.
                        done = true;

                    } else {

                        this.setValue(this, 'webCamState', 'disabling');
                        this.setValue(this, 'webCamStatus', 'Disabling webcam.');

                    }

                    break;

                case 'disabling':

                    if (this.$webCamVideo &&
                        this.$webCamVideo.length) {

                        this.$webCamVideo.css({
                            display: 'none'
                        });

                        var video = this.$webCamVideo[0];

                        video.pause();
                        video.src = '';

                        if (this.webCamStream) {
                            if (this.webCamStream.stop) {
                                this.webCamStream.stop();
                            }
                            this.webCamStream = null;
                        }

                    }

                    this.setValue(this, 'webCamState', 'disabled');
                    this.setValue(this, 'webCamStatus', 'Disabled webcam.');

                    done = true;

                    break;

            }

        }

    };


    // enbleAnalyzer enables the analyzer.
    CAM6.prototype.enableAnalyzer = function enableAnalyzer() {

        if (!this.analyzerEnabled) {
            this.setValue(this, 'analyzerEnabled', true);
            this.updateCommands();
        }

    };


    // disableAnalyzer disables the head tracker.
    CAM6.prototype.disableAnalyzer = function disableAnalyzer() {

        if (this.analyzerEnabled) {
            this.setValue(this, 'analyzerEnabled', false);
            this.updateCommands();
        }

    };


    // enbleHeadTracker enables the head tracker.
    CAM6.prototype.enableHeadTracker = function enableHeadTracker() {

        if (!this.headTrackerEnabled) {
            this.setValue(this, 'headTrackerEnabled', true);
            this.updateCommands();
        }

    };


    // disableHeadTracker disables the head tracker.
    CAM6.prototype.disableHeadTracker = function disableHeadTracker() {

        if (this.headTrackerEnabled) {
            this.setValue(this, 'headTrackerEnabled', false);
            this.updateCommands();
        }

    };


    CAM6.prototype.updateHeadTracker = function updateHeadTracker() {

        var done = false;

        while (!done) {

            switch (this.headTrackerState) {

                case 'broken':

                    if (this.headTrackerEnabled) {

                        LOG('updateHeadTracker: headTracker enabled but broken, so disabling it.');

                        this.disableHeadTracker();

                        if (this.$headTrackerInput &&
                            this.$headTrackerInput.length) {

                            this.$headTrackerInput.css({
                                display: 'none'
                            });

                        }

                        if (this.$headTrackerOverlay &&
                            this.$headTrackerOverlay.length) {

                            this.$headTrackerOverlay.css({
                                display: 'none'
                            });

                        }

                    }

                    // Stay broken.
                    done = true;

                    break;

                case 'disabled':

                    if (!this.headTrackerEnabled) {

                        // Stay disabled.
                        done = true;

                    } else {

                        // Try to enable.

                        // If the webcam is broken, then we can't enable, so disable.
                        if (this.webCamStatus == 'broken') {

                            this.disableHeadTracker();

                            this.setValue(this, 'headTrackerStatus', 'Head tracker disabled because webcam broken.');

                            done = true;

                        } else {

                            // If the webcam isn't enabled, then try to enable it.
                            if (!this.webCamEnabled) {
                                this.enableWebCam();
                            }

                            // Wait until the webcam is enabled.
                            if (this.webCamState != 'enabled') {

                                // Stay disabled until the webcam is enabled.

                                this.setValue(this, 'headTrackerStatus', 'Head tracker waiting for webcam to enable.');

                                done = true;

                            } else {

                                // If the head tracker is not made, then try to make it.
                                if (!this.headTrackerMade) {

                                    if (!this.$headTrackerInput ||
                                        !this.$headTrackerInput.length ||
                                        !this.$headTrackerOverlay ||
                                        !this.$headTrackerOverlay.length) {

                                        // No headTrackerInput and headTrackerOverlay elements to use, so we're broken.
                                        this.setValue(this, 'headTrackerState', 'broken');
                                        this.setValue(this, 'headTrackerStatus', 'No headTrackerInput and headTrackerOverlay elements.');

                                    } else {

                                        document.addEventListener(
                                            'headtrackrStatus',
                                            $.proxy(
                                                function handle_headTrackerStatus(event) {

                                                    //LOG('handle_headTrackerStatus', event.status);

                                                    if (!this.headTrackerEnabled) {
                                                        return;
                                                    }

                                                    if (this.headTrackerState == 'enabling') {
                                                        if ((event.status == 'detecting') ||
                                                            (event.status == 'found')) {

                                                            this.setValue(this, 'headTrackerState', 'enabled');
                                                            this.setValue(this, 'headTrackerStatus', 'Head tracker enabled.');

                                                            this.headTrackerDetection = null;
                                                            this.headTrackerDetectionLast = null;
                                                            this.headTrackerTracking = false;
                                                            this.headTrackerTrackingLast = false;
                                                            this.headTrackerTrackingStartTime = 0;
                                                            this.headTrackerTrackingEndTime = 0;
                                                            this.headTrackerTrackingStatus = null;
                                                            this.headTrackerUpdateTime = 0;
                                                            this.headTrackerX = 0;
                                                            this.headTrackerY = 0;
                                                            this.headTrackerWidth = 0;
                                                            this.headTrackerHeight = 0;
                                                            this.headTrackerAngle = 0;

                                                            this.headTrackerOverlayContext.clearRect(
                                                                0, 0, this.cellWidth, this.cellHeight);

                                                        }
                                                    }
                                                },
                                                this),
                                            true);

                                        document.addEventListener(
                                            'facetrackingEvent',
                                            $.proxy(
                                                function handle_facetrackingEvent(event) {

                                                    //LOG('handle_facetrackingEvent', event);

                                                    if (!this.headTrackerEnabled ||
                                                        (!this.headTrackerState == 'enabled')) {
                                                        return;
                                                    }

                                                    this.headTrackerTrackingStatus = event.status;

                                                    this.headTrackerDetectionLast = this.headTrackerDetection;
                                                    this.headTrackerDetection = event.detection;

                                                    this.headTrackerTrackingLast = this.headTrackerTracking;
                                                    this.headTrackerTracking = this.headTrackerDetection == 'CS';

                                                    if (!this.headTrackerTrackingLast &&
                                                        this.headTrackerTracking) {
                                                        this.headTrackerTrackingStartTime = Date.now();
                                                    }

                                                    if (this.headTrackerTrackingLast &&
                                                        !this.headTrackerTracking) {
                                                        this.headTrackerTrackingEndTime = Date.now();
                                                    }

                                                    if (this.headTrackerTracking) {
                                                        this.headTrackerUpdateCount++;
                                                        this.headTrackerUpdateTime = Date.now();
                                                        this.headTrackerX = this.cellWidth - event.x; // flip x
                                                        this.headTrackerY = event.y;
                                                        this.headTrackerWidth = event.width;
                                                        this.headTrackerHeight = event.height;
                                                        this.headTrackerAngle = (Math.PI / 2) - event.angle; // twist angle
                                                    }

                                                },
                                                this),
                                            true);

                                        this.headTrackerOverlayContext =
                                            this.$headTrackerOverlay[0].getContext('2d');

                                        this.headTrackerOverlayContext.clearRect(
                                            0, 0, this.cellWidth, this.cellHeight);

                                        this.headTracker =
                                            new headtrackr.Tracker({
                                                ui: false,
                                                sendEvents: true,
                                                smoothing: true,
                                                detectionInterval: this.headTrackerDetectionInterval,
                                                smoothingInterval: this.headTrackerSmoothingInterval,
                                                whiteBalancing: true,
                                                calcAngles: true,
                                                retryDetection: true,
                                                headPosition: true
                                            });

                                        this.headTrackerMade = true;

                                    }

                                }

                                // If it was made, then try to enable it.
                                if (this.headTrackerMade) {

                                    this.setValue(this, 'headTrackerState', 'enabling');
                                    this.setValue(this, 'headTrackerStatus', 'Waiting for head tracker to enable.');

                                    this.headTrackerOverlayContext.clearRect(
                                        0, 0, this.cellWidth, this.cellHeight);

                                    this.$headTrackerInput.css({
                                        display: 'none'
                                    });

                                    this.$headTrackerOverlay.css({
                                        display: 'block'
                                    });

                                    this.headTracker.init(
                                        this.$webCamVideo[0],
                                        this.$headTrackerInput[0],
                                        true);

                                    this.headTracker.start();

                                    done = true;

                                }

                            }

                        }

                    }

                    break;

                case 'enabling':

                    // We're trying to enable the head tracker, waiting
                    // the the callback to fire, which will bump is to
                    // the next state.

                    done = true;

                    break;

                case 'enabled':

                    if (this.headTrackerEnabled) {

                        // Stay enabled.
                        done = true;

                    } else {

                        this.setValue(this, 'headTrackerState', 'disabling');
                        this.setValue(this, 'headTrackeStatus', 'Disabling head tracker.');

                    }

                    break;

                case 'disabling':

                    if (this.$headTrackerInput &&
                        this.$headTrackerInput.length) {

                        this.$headTrackerInput.css({
                            display: 'none'
                        });

                    }

                    if (this.$headTrackerOverlay &&
                        this.$headTrackerOverlay.length) {

                        this.$headTrackerOverlay.css({
                            display: 'none'
                        });

                    }

                    this.setValue(this, 'headTrackerState', 'disabled');
                    this.setValue(this, 'headTrackerStatus', 'Head tracker disabled.');

                    done = true;

                    break;

            }

        }

    };


    // updateCommands enables or disables all commands, based on their condition.
    CAM6.prototype.updateCommands = function updateCommands() {

        for (var i = 0, n = this.command_objects.length;
             i < n;
             i++) {

            var commandDict = this.command_objects[i];
            var $button = commandDict.$button;
            if (!$button) {
                continue;
            }

            //LOG('updateCommands:', 'commandDict', [commandDict.symbol, commandDict]);

            var name = commandDict.getNameFunction.call(
              this, commandDict);
            var description = commandDict.getDescriptionFunction.call(
              this, commandDict);
            var isVisibleFunction = commandDict.isVisibleFunction;
            var isVisible =
                !isVisibleFunction ||
                isVisibleFunction.call(
                    this, commandDict);
            var isEnabledFunction = commandDict.isEnabledFunction;
            var isEnabled =
                !isEnabledFunction ||
                isEnabledFunction.call(
                    this, commandDict);

            if (isEnabled) {
                $button
                    .removeAttr('disabled')
                    .attr({
                        title: description
                    })
                    .css({
                        display: isVisible ? 'inline-block' : 'none'
                    })
                    .text(name);
            } else {
                $button
                    .attr({
                        disabled: 'disabled',
                        title: description
                    })
                    .css({
                        display: isVisible ? 'inline-block' : 'none'
                    })
                    .text(name);
            }

        }

    };


    // initCanvas initializes the canvas.
    CAM6.prototype.initCanvas = function initCanvas() {

        this.scaleCanvas();

        this.cellCanvasContext =
            this.$cellCanvas[0].getContext('2d');

        this.cellCanvasImageData =
            this.cellCanvasContext.createImageData(
                this.cellWidth,
                this.cellHeight);

        this.cellCanvasData =
            this.cellCanvasImageData.data;

        if (this.useGUI) {

            this.$cellCanvas
                .on('mousedown.cells',
                    $.proxy(this.trackCellCanvasDown, this))
                .on('mousemove.cells',
                    $.proxy(this.trackCellCanvasMove, this))
                .on('mousewheel.cells',
                    $.proxy(this.trackCellCanvasWheel, this));

            this.compositionOverlayContext =
                this.$compositionOverlay[0].getContext('2d');

            this.feedbackOverlayContext =
                this.$feedbackOverlay[0].getContext('2d');

        }

    };


    // scaleCanvasToWindow sets the scale of the canvas to the window size.
    CAM6.prototype.scaleCanvasToWindow = function scaleCanvasToWindow() {

        this.windowWidth = this.$window.width();
        this.windowHeight = this.$window.height();

        this.scaleCanvas();
        this.scaleHistogram();
        this.glScaleCanvas();

        // Must call tick to refresh if paused.
        // This gets called on startup before the cells are defined, so be careful!
        if (this.paused && this.cells0) {
            this.tick();
        }
    };


    // scaleCanvas sets the scale of the canvas.
    CAM6.prototype.scaleCanvas = function scaleCanvas() {

        var width = this.cellWidth * this.cellCanvasScale;
        var height = this.cellHeight * this.cellCanvasScale;

/*
        this.$cellCanvasFrame
            .css({
                width: width + 'px',
                height: height + 'px'
            });
*/

        this.$cellCanvasContainer
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$webCamVideo
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$headTrackerInput
            .attr({
                width: this.cellWidth,
                height: this.cellHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$cellCanvas
            .attr({
                width: this.cellWidth,
                height: this.cellHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$compositionOverlay
            .attr({
                width: this.cellWidth,
                height: this.cellHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$feedbackOverlay
            .attr({
                width: this.cellWidth,
                height: this.cellHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$headTrackerOverlay
            .attr({
                width: this.cellWidth,
                height: this.cellHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

    };


    // trackCellCanvasWheel trackes the mouse wheel.
    CAM6.prototype.trackCellCanvasWheel = function trackCellCanvasWheel(event, delta, deltaX, deltaY) {
        event.stopPropagation();
        event.preventDefault();

        var frob =
            this.frob + (deltaY * this.frobScale);
        if (frob != this.frob) {
            this.setValue(this, 'frob', frob);
        }

        var phaseOffset =
            this.phaseOffset + (-deltaX * this.phaseScale);

        phaseOffset -=
            Math.floor(phaseOffset / 16) * 16;

        //LOG('phaseOffset', phaseOffset, 'deltaX', deltaX, 'phaseScale', this.phaseScale, '(deltaX * this.phaseScale)', (deltaX * this.phaseScale));

        if (phaseOffset != this.phaseOffset) {
            this.setValue(this, 'phaseOffset', phaseOffset);
        }

    };


    // trackCellCanvasDown tracks a mouse down event.
    CAM6.prototype.trackCellCanvasDown = function trackCellCanvasDown(event) {

        //LOG("trackCellCanvasDown", event);

        event.stopPropagation();
        event.preventDefault();

        if (event.which == 3) {
            this.$pie.pie('startPie', event, 'default', false);
            return;
        }

        this.trackCellCanvasMoveSub(event);

        this.setValue(this, 'mouseButton', true);
        this.setValue(this, 'mouseDownX', this.mouseX);
        this.setValue(this, 'mouseDownY', this.mouseY);
        this.setValue(this, 'mouseLastX', this.mouseX);
        this.setValue(this, 'mouseLastY', this.mouseY);

        var toolDict =
            this.get_tool_by_symbol(
                this.toolSymbol);

        var activeToolDict =
            this.userTools[this.toolSymbol];

        if (!activeToolDict) {

            activeToolDict = {
                enabled: true,
                toolSymbol: this.toolSymbol,
                step: this.step
            };

            this.userTools[this.toolSymbol] =
                activeToolDict;

        }

        this.initActiveTool(
            activeToolDict);

        this.removeActiveTool(
            null, // No particular tool symbol.
            'editingTool', // Remove tools in this editing channel.
            0); // Remove all matching tools.

        this.addActiveTool(
            activeToolDict,
            'editingTool',
            this.trackingCellsLayer);

        this.recordToolBegin(
            toolDict,
            activeToolDict);

        this.trackingCells = true;
        this.trackingCellsActiveToolDict = activeToolDict;

        this.$cellCanvas
            .off('mousemove.cells');

        this.$document
            .on('mousemove.cells',
                $.proxy(this.trackCellCanvasDrag, this))
            .on('mouseup.cells',
                $.proxy(this.trackCellCanvasUp, this));

        //LOG("trackCellCanvasDown started tracking", this, activeToolDict);

        if (this.paused) {
            this.tick();
        }

    };


    // trackCellCanvasDrag tracks a mouse move event.
    CAM6.prototype.trackCellCanvasDrag = function trackCellCanvasDrag(event) {

        //LOG("trackCellCanvasDrag", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackCellCanvasMoveSub(event);

        if (this.paused) {
            this.tick();
        }

    };


    // trackCellCanvasMove tracks a mouse move event.
    CAM6.prototype.trackCellCanvasMove = function trackCellCanvasMove(event) {

        //LOG("trackCellCanvasMove", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackCellCanvasMoveSub(event);

    };


    // trackCellCanvasMoveSub tracks a mouse move event.
    CAM6.prototype.trackCellCanvasMoveSub = function trackCellCanvasMoveSub(event) {

        var offset = this.$cellCanvas.offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;

        this.setValue(this, 'mouseX', Math.floor(x / this.cellCanvasScale));
        this.setValue(this, 'mouseY', Math.floor(y / this.cellCanvasScale));

        //console.log("trackCellCanvasMoveSub", "mouse", this.mouseX, this.mouseY, "offset", offset, offset.left, offset.top, "x", x, "y", y, "event", event, "$cellCanvas", this.$cellCanvas, this.$cellCanvas[0]);

    };


    // trackCellCanvasUp tracks a mouse up event.
    CAM6.prototype.trackCellCanvasUp = function trackCellCanvasUp(event) {

        //LOG("trackCellCanvasUp", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackCellCanvasMoveSub(event);

        this.setValue(this, 'mouseButton', false);

        if (event.shiftKey) {

            // Make the tool stick.

        } else {

            var activeToolDict =
                this.trackingCellsActiveToolDict;
            var toolSymbol =
                activeToolDict.toolSymbol;

            this.recordToolEnd(
                this.tool_by_symbol[toolSymbol]);

            this.removeActiveTool(
                activeToolDict.activeToolSymbol, // Remove this particular activeTool.
                null, // Tools in any channel.
                1); // Remove one.

        }

        this.trackingCells = false;
        this.trackingCellsActiveToolDict = null;

        this.clearCompositionOverlay();
        this.clearFeedbackOverlay();

        this.$document
            .off('mousemove.cells')
            .off('mouseup.cells');

        this.$cellCanvas
            .on('mousemove.cells')
                $.proxy(this.trackCellCanvasMove, this);

        if (this.paused) {
            this.tick();
        }

    };


    // initHistogram initializes the histogram.
    CAM6.prototype.initHistogram = function initHistogram() {

        this.histogramCanvasWidth = 256;
        this.histogramCanvasHeight =
            this.histogramToolCellHeight +
            this.histogramHeaderHeight +
            this.histogramGraphHeight;

        this.scaleHistogram();

        this.histogramCanvasContext =
            this.$histogramCanvas[0].getContext('2d');

        this.histogramCanvasImageData =
            this.histogramCanvasContext.createImageData(
                this.histogramCanvasWidth,
                this.histogramCanvasHeight);

        this.histogramCanvasData =
            this.histogramCanvasImageData.data;

        if (this.useGUI) {

            this.$histogramCanvas
                .on('mousedown.histogram',
                    $.proxy(this.trackHistogramCanvasDown, this))
                .on('mousewheel.histogram',
                    $.proxy(this.trackHistogramCanvasWheel, this));

        }

    };


    CAM6.prototype.scaleHistogram = function scaleHistogram() {

        var width = this.histogramCanvasWidth * this.histogramCanvasScale;
        var height = this.histogramCanvasHeight * this.histogramCanvasScale;

        this.$histogramCanvasContainer
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        this.$histogramCanvas
            .attr({
                width: this.histogramCanvasWidth,
                height: this.histogramCanvasHeight
            })
            .css({
                width: width + 'px',
                height: height + 'px'
            });

        if (this.doHistogram) {
            this.$histogramCanvasFrame.show();
            this.$mapFrameBr.show();
        } else {
            this.$histogramCanvasFrame.hide();
            this.$mapFrameBr.hide();
        }

    };


    // trackHistogramCanvasWheel trackes the mouse wheel.
    CAM6.prototype.trackHistogramCanvasWheel = function trackHistogramCanvasWheel(event, delta, deltaX, deltaY) {
        event.stopPropagation();
        event.preventDefault();
        this.trackCellCanvasWheel(event, delta, deltaX, deltaY);
    };


    // trackHistogramCanvasDown tracks a mouse down event.
    CAM6.prototype.trackHistogramCanvasDown = function trackHistogramCanvasDown(event) {

        //LOG("trackHistogramCanvasDown", event);

        event.stopPropagation();
        event.preventDefault();

        if (event.which == 3) {
            this.$pie.pie('startPie', event, 'histogram', false);
            return;
        }

        this.trackHistogramCanvasMoveSub(event);

        this.setValue(this, 'mouseButton', true);
        this.setValue(this, 'mouseDownX', this.mouseX);
        this.setValue(this, 'mouseDownY', this.mouseY);
        this.setValue(this, 'mouseLastX', this.mouseX);
        this.setValue(this, 'mouseLastY', this.mouseY);

        this.trackingHistogram = true;
        this.trackingCellsActiveToolDict = null;

        this.$document
            .on('mousemove.histogram',
                $.proxy(this.trackHistogramCanvasDrag, this))
            .on('mouseup.histogram',
                $.proxy(this.trackHistogramCanvasUp, this));

        if (this.paused) {
            this.tick();
        }

    };


    // trackHistogramCanvasDrag tracks a mouse move event.
    CAM6.prototype.trackHistogramCanvasDrag = function trackHistogramCanvasDrag(event) {

        LOG("trackHistogramCanvasDrag", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackHistogramCanvasMoveSub(event);

        if (this.paused) {
            this.tick();
        }

    };


    // trackHistogramCanvasMove tracks a mouse move event.
    CAM6.prototype.trackHistogramCanvasMove = function trackHistogramCanvasMove(event) {

        //LOG("trackHistogramCanvasMove", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackHistogramCanvasMoveSub(event);

    };


    // trackHistogramCanvasMoveSub tracks a mouse move event.
    CAM6.prototype.trackHistogramCanvasMoveSub = function trackHistogramCanvasMoveSub(event) {

        var offset = this.$histogramCanvas.offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;

        this.setValue(this, 'histogramMouseX', Math.floor(x / this.histogramCanvasScale));
        this.setValue(this, 'histogramMouseY', Math.floor(y / this.histogramCanvasScale));

    };


    // trackHistogramCanvasUp tracks a mouse up event.
    CAM6.prototype.trackHistogramCanvasUp = function trackHistogramCanvasUp(event) {

        //LOG("trackHistogramCanvasUp", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackHistogramCanvasMoveSub(event);

        this.setValue(this, 'mouseButton', false);

        this.trackingHistogram = false;

        this.$document
            .off('mousemove.histogram')
            .off('mouseup.histogram');

        if (this.paused) {
            this.tick();
        }

    };


    CAM6.prototype.glInit = function glInit() {

        twgl.setDefaults({
            attribPrefix: "a_"
        });

        var gl =
            twgl.getWebGLContext(
                this.$glCanvas[0]);
        this.gl = gl;
        //LOG("gl", gl);

		gl.getExtension(
            'OES_standard_derivatives');

        this.glTilesImage =
            this.get_image_by_symbol(
                this.glTilesImageSymbol);
        //LOG("glTilesImage", this.glTilesImage);

        this.glTilesTextureInfo = { 
            min: gl.NEAREST,
            mag: gl.NEAREST,
            wrap: gl.REPEAT,
            src: this.glTilesImage.image
        };
        //LOG("glTilesTextureInfo", this.glTilesTextureInfo);

        this.glTilesTexture = twgl.createTexture(gl, this.glTilesTextureInfo);
        //LOG("glTilesTexture", this.glTilesTexture);

        this.glTileProgramInfo =
            twgl.createProgramInfo(gl,
                ['tileVertexShader', 'tileFragmentShader']);
        //LOG('glTileProgramInfo', this.glTileProgramInfo);

        this.glCells0TextureInfo = {
            format: gl.ALPHA,
            min: gl.NEAREST,
            mag: gl.NEAREST,
            wrap: gl.CLAMP_TO_EDGE,
            src: this.cells0,
            width: this.cellBufferWidth,
            height: this.cellBufferHeight
        };
        //LOG('glCells0TextureInfo', this.glCells0TextureInfo);

        this.glCells0Texture = twgl.createTexture(gl, this.glCells0TextureInfo);
        //LOG('glCells0Texture', this.glCells0Texture);

        this.glCells1TextureInfo = {
            format: gl.ALPHA,
            min: gl.NEAREST,
            mag: gl.NEAREST,
            wrap: gl.CLAMP_TO_EDGE,
            src: this.cells1,
            width: this.cellBufferWidth,
            height: this.cellBufferHeight
        };
        //LOG('glCells1TextureInfo', this.glCells1TextureInfo);

        this.glCells1Texture = twgl.createTexture(gl, this.glCells1TextureInfo), 
        //LOG('glCells1Texture', this.glCells1Texture);

        this.positionArray = new Float32Array([
            -1, -1, 0, 
             1, -1, 0,
            -1,  1, 0,
            -1,  1, 0, 
             1, -1, 0, 
             1,  1, 0]);

        this.screenTileArray = new Float32Array([
             0, 10,
             10, 10,
             0, 0,
             0, 0,
             10, 10,
             10, 0]);

        this.glTileBufferInfo =
            twgl.createBufferInfoFromArrays(gl, {
                position: {
                    data: this.positionArray,
                    numComponents: 3,
                    drawType: gl.STATIC_DRAW
                },
                screenTile: {
                    data: this.screenTileArray,
                    numComponents: 2,
                    drawType: gl.DYNAMIC_DRAW
                }
            });
        //LOG('glTileBufferInfo', this.glTileBufferInfo);

    };


    CAM6.prototype.glScaleCanvas = function glScaleCanvas() {

        this.$glCanvas
            .attr({
                width: this.windowWidth,
                height: this.windowHeight
            })
            .css({
                width: this.windowWidth + 'px',
                height: this.windowHeight + 'px'
            });

    };

    CAM6.prototype.glRender = function glRender() {

        var gl = this.gl;
        var cells = this.paused ? this.getNextCells() : this.getCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellBufferHeight = this.cellBufferHeight;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var cellsTextureInfo = this.phaseTime ? this.glCells1TextureInfo : this.glCells0TextureInfo;
        var cellsTexture = this.phaseTime ? this.glCells1Texture : this.glCells0Texture;
        var cells = this.phaseTime ? this.cells1 : this.cells0;

        gl.bindTexture(gl.TEXTURE_2D, cellsTexture);

        //console.log("texImage2D", "target", gl.TEXTURE_2D, "0", 0, "format", cellsTextureInfo.format, "width", cellBufferWidth, "height", this.cellBufferHeight, "0", 0, "format", cellsTextureInfo.format, "type", gl.UNSIGNED_BYTE, "src", cellsTextureInfo.src); 
        gl.texImage2D(gl.TEXTURE_2D, 0, cellsTextureInfo.format, cellBufferWidth, this.cellBufferHeight, 0, cellsTextureInfo.format, gl.UNSIGNED_BYTE, cellsTextureInfo.src);

        gl.useProgram(
            this.glTileProgramInfo.program);

        var left = this.glPanX;
        var right = left + gl.canvas.width / this.glScale;
        var top = this.glPanY;
        var bottom = top + gl.canvas.height / this.glScale;
        var a = this.screenTileArray;

        a[0] = a[4] = a[6]  = left;
        a[2] = a[8] = a[10] = right;
        a[1] = a[3] = a[9]  = bottom;
        a[5] = a[7] = a[11] = top

        twgl.setAttribInfoBufferFromArray(
            gl, 
            this.glTileBufferInfo.attribs.a_screenTile,
            a);

        twgl.setBuffersAndAttributes(
            gl,
            this.glTileProgramInfo,
            this.glTileBufferInfo);

        var uniforms = {
            u_tileSize: [this.glTileSize, this.glTileSize],
            u_tilesSize: [this.glTilesImage.image.width, this.glTilesImage.image.height],
            u_tiles: this.glTilesTexture,
            u_cellsSize: [cellBufferWidth, cellBufferHeight],
            u_cells: cellsTexture,
            u_gutter: cellGutter
        };
        //console.log(uniforms);

        twgl.setUniforms(
            this.glTileProgramInfo,
            uniforms);

        twgl.drawBufferInfo(
            gl,
            gl.TRIANGLES,
            this.glTileBufferInfo);

    };


    // makegGUI makes the user interface for editing the parameters.
    CAM6.prototype.makeGUI = function makeGUI() {

        if (!this.useGUI) {
            return;
        }

        this.$window = $(window);
        this.$document = $(document);
        this.$body = $(document.body);

        this.$parent =
            this.params.$parent ||
            this.$parent ||
            this.$body;

        this.$root =
            $('<div/>')
                .addClass('cam6-root')
                .appendTo(this.$parent);

        this.$content =
            $('<div/>')
                .addClass('cam6-content')
                .appendTo(this.$root);

        this.$glCanvas =
            $('<canvas/>')
                .addClass('cam6-glCanvas')
                .appendTo(this.$content);

        this.$tabsFrame =
            $('<div/>')
                .addClass('cam6-tabsFrame')
                .appendTo(this.$content);

        this.$tabsContainer =
            $('<div/>')
                .addClass('cam6-tabsContainer')
                .appendTo(this.$tabsFrame);

        this.$mapFrame =
            $('<div/>')
                .addClass('cam6-mapFrame')
                .appendTo(this.$content);

        this.$histogramCanvasFrame =
            $('<div/>')
                .addClass('cam6-histogramCanvasFrame')
                .appendTo(this.$mapFrame)
                .draggable();

        this.$histogramCanvasContainer =
            $('<div/>')
                .addClass('cam6-histogramCanvasContainer')
                .appendTo(this.$histogramCanvasFrame);

        this.$histogramCanvas =
            $('<canvas/>')
                .addClass('cam6-histogramCanvas')
                .appendTo(this.$histogramCanvasContainer);

        this.$mapFrameBr =
            $('<br/>')
                .appendTo(this.$mapFrame);

        this.$cellCanvasFrame =
            $('<div/>')
                .addClass('cam6-cellCanvasFrame')
                .appendTo(this.$mapFrame)
                .draggable();

        this.$cellCanvasContainer =
            $('<div/>')
                .addClass('cam6-cellCanvasContainer')
                .appendTo(this.$cellCanvasFrame);

        this.$webCamVideo =
            $('<video/>')
                .addClass('cam6-webCamVideo')
                .appendTo(this.$cellCanvasContainer);

        this.$headTrackerInput =
            $('<canvas/>')
                .addClass('cam6-headTrackerInput')
                .appendTo(this.$cellCanvasContainer);

        this.$cellCanvas =
            $('<canvas/>')
                .addClass('cam6-cellCanvas')
                .appendTo(this.$cellCanvasContainer);

        this.$compositionOverlay =
            $('<canvas/>')
            .addClass('cam6-compositionOverlay')
            .appendTo(this.$cellCanvasContainer);

        this.$feedbackOverlay =
            $('<canvas/>')
                .addClass('cam6-feedbackOverlay')
                .appendTo(this.$cellCanvasContainer);

        this.$headTrackerOverlay =
            $('<canvas/>')
                .addClass('cam6-headTrackerOverlay')
                .appendTo(this.$cellCanvasContainer);

        this.$interfaceFrame =
            $('<div/>')
                .addClass('cam6-interfaceFrame')
                .appendTo(this.$content);

        this.$interfaceContainer =
            $('<div/>')
                .addClass('cam6-interfaceContainer')
                .appendTo(this.$interfaceFrame);

        this.makeTabsGUI();
        this.makeCommandsGUI();
        this.makeParamsGUI();
        this.makeHintsGUI();
        this.makeWikiGUI();
        this.makePieGUI();

        this.$body
            .on('contextmenu',
                function handleContextMenu() { return false; });

        this.$window
            .on('resize', 
                $.proxy(this.scaleCanvasToWindow, this));

        this.scaleCanvasToWindow();

    };


    CAM6.prototype.makeTabsGUI = function makeTabsGUI() {

        this.$tabsContainer
            .html('');

        var $tabIcon =
            $('<div/>')
                .addClass('cam6-tabIcon')
                .attr({
                    title: 'Click to toggle tabs.'
                })
                .on('click', $.proxy(function(event) {

                    this.$tabsFrame
                        .toggleClass('cam6-tabsFrame-opened');

                    if (this.currentTabIndex !== null) {
                        var currentTabDict =
                            this.tab_objects[this.currentTabIndex];

                        currentTabDict.$panel
                            .toggleClass('cam6-tabPanel-active');
                    }

                }, this))
                .appendTo(this.$tabsContainer);

        for (var tabIndex = 0, tabCount = this.tab_objects.length;
             tabIndex < tabCount;
             tabIndex++) {

            (function(tabIndex) {

                var tabDict = this.tab_objects[tabIndex];

                tabDict.$tab =
                    $('<div/>')
                        .addClass('cam6-tab')
                        .text(tabDict.name)
                        .attr({
                            title: tabDict.description
                        })
                        .on('click', $.proxy(function(event) {

                            if (this.currentTabIndex !== null) {

                                var currentTabDict =
                                    this.tab_objects[this.currentTabIndex];

                                currentTabDict.$tab
                                    .removeClass('cam6-tab-active');
                                currentTabDict.$panel
                                    .removeClass('cam6-tabPanel-active');

                            }

                            if (this.currentTabIndex === tabDict.index) {

                                this.currentTabIndex = null;

                            } else {

                                this.currentTabIndex = tabDict.index;

                                tabDict.$tab
                                    .addClass('cam6-tab-active');
                                tabDict.$panel
                                    .addClass('cam6-tabPanel-active');

                            }

                        }, this))
                        .appendTo(this.$tabsContainer);

                tabDict.$panel =
                    $('<div/>')
                        .addClass('cam6-tabPanel cam6-tabPanel-' + tabDict.symbol)
                        .appendTo(this.$content);

            }).call(this, tabIndex);

        }

    };

    CAM6.prototype.makeCommandsGUI = function makeCommandsGUI() {

        var commandsTabDict =
            this.get_tab_by_symbol('commands');

        for (var commandIndex = 0, commandCount = this.command_objects.length;
             commandIndex < commandCount;
             commandIndex++) {

            (function(commandIndex) {

                var commandDict = this.command_objects[commandIndex];

                var name = commandDict.getNameFunction.call(
                    this, commandDict);
                var description = commandDict.getDescriptionFunction.call(
                    this, commandDict);

                var $button =
                    $('<button/>')
                        .addClass('cam6-commandButton')
                        .attr({
                            title: description
                        })
                        .text(name)
                        .click($.proxy(
                            function(event) {

                                var params = {
                                    randomSeed: this.newRandomSeed()
                                };

                                this.playCommand(
                                    commandDict,
                                    params);

                                if (this.scriptRecording &&
                                    this.recordingCommands) {

                                    this.recordCommand(
                                        commandDict,
                                        params);

                                }

                            },
                            this))
                        .appendTo(commandsTabDict.$panel);

                commandDict.$button =
                    $button;

            }).call(this, commandIndex);

        }

        this.updateCommands();

    };


    CAM6.prototype.makeParamsGUI = function makeParamsGUI() {

        var target = this; // TODO

        for (var paramIndex = 0, paramCount = this.paramMetaData_objects.length;
             paramIndex < paramCount;
             paramIndex++) {

            (function(paramIndex) {

                var paramMetaData =
                    this.paramMetaData_objects[paramIndex];

                var widget = paramMetaData.widget;
                var tab = paramMetaData.tab;
                if (!widget || !tab) {
                    return;
                }

                var tabDict =
                    this.get_tab_by_symbol(tab);

                var $div =
                    $('<div/>')
                        .addClass('cam6-paramDiv')
                        .attr({
                            title: paramMetaData.description
                        })
                        .appendTo(tabDict.$panel);
                paramMetaData.$div = $div

                var $title =
                    $('<div/>')
                        .addClass('cam6-paramLabel')
                        .attr({
                            title: paramMetaData.description,
                        })
                        .text(paramMetaData.name)
                        .appendTo($div);
                paramMetaData.$title = $title;

                var $widget;

                switch (widget) {

                    case 'slider':
                        $widget =
                            $('<div/>')
                                .addClass('cam6-paramSlider')
                                .slider({
                                    min: paramMetaData.getMinValueFunction.call(
                                        this, paramMetaData, target),
                                    max: paramMetaData.getMaxValueFunction.call(
                                        this, paramMetaData, target),
                                    slide: $.proxy(
                                        function slide(event, ui) {

                                            this.setValue(this,
                                                paramMetaData.param,
                                                paramMetaData.widgetValueToParamValueFunction
                                                    ? paramMetaData.widgetValueToParamValueFunction.call(
                                                        this, paramMetaData, target, ui.value)
                                                    : ui.value);

                                        },
                                        this)
                                })
                                .appendTo($div);
                        break;

                    case 'menu':
                        $widget =
                            $('<select/>')
                                .addClass('cam6-paramMenu')
                                .change($.proxy(
                                    function(event) {
                                        this.setValue(this,
                                            paramMetaData.param,
                                            paramMetaData.widgetValueToParamValueFunction
                                                ? paramMetaData.widgetValueToParamValueFunction.call(
                                                    this, paramMetaData, target, parseInt(event.target.value))
                                                : parseInt(event.target.value));
                                    },
                                    this))
                                .appendTo($div);
                        for (var i = paramMetaData.getMinValueFunction.call(
                                         this, paramMetaData, target),
                                 n = paramMetaData.getMaxValueFunction.call(
                                         this, paramMetaData, target) + 1;
                             i < n;
                             i++) {
                            var paramValue =
                                paramMetaData.widgetValueToParamValueFunction
                                    ? paramMetaData.widgetValueToParamValueFunction.call(
                                        this, paramMetaData, target, i)
                                    : i;
                            var label =
                                paramMetaData.getValueNameFunction.call(
                                    this, paramMetaData, target, paramValue);
                            var $option =
                                $('<option/>')
                                    .attr({
                                        value: i
                                    })
                                    .text(label)
                                    .appendTo($widget);
                        }
                        break;

                }

                paramMetaData.$widget = $widget;

                var $value =
                    $('<div/>')
                        .addClass('cam6-paramValue')
                        .text('???')
                        .appendTo($div);
                paramMetaData.$value = $value;

            }).call(this, paramIndex);

        }

    };


    CAM6.prototype.makeHintsGUI = function makeHintsGUI() {

        var hintsTabDict =
            this.get_tab_by_symbol('hints');

        for (var hintIndex = 0, hintCount = this.hint_objects.length;
             hintIndex < hintCount;
             hintIndex++) {

            var hintDict =
                this.hint_objects[hintIndex];

            var $hint =
                $('<div/>')
                    .addClass('cam6-hintDiv')
                    .text(hintDict.hint + ' ')
                    .appendTo(hintsTabDict.$panel);

            var url = hintDict.url;
            if (url) {
                var $hintLink =
                    $('<a/>')
                        .addClass('cam6-hintLink')
                        .attr({
                            href: url,
                            target: '_blank'
                        })
                        .text(hintDict.urlLabel || 'More info...')
                        .appendTo($hint);
            }

        }

    };


    CAM6.prototype.makeWikiGUI = function makeWikiGUI() {

        var helpTabDict =
            this.get_tab_by_symbol('help');

        var $wikiHeader =
            $('<div/>')
                .addClass('cam6-wikiHeader')
                .html('Documentation and Wiki Links')
                .appendTo(helpTabDict.$panel);

        for (var chapterIndex = 0, chapterCount = this.chapter_objects.length;
             chapterIndex < chapterCount;
             chapterIndex++) {

            (function(chapterIndex) {

                var chapterDict =
                    this.chapter_objects[chapterIndex];

                var items = chapterDict.getItemsFunction.call(
                    this, chapterDict);

                var $chapter =
                    $('<div/>')
                        .addClass('cam6-wikiChapter')
                        .appendTo(helpTabDict.$panel);

                var $chapterTop =
                    $('<div/>')
                        .addClass('cam6-wikiChapterTop')
                        .appendTo($chapter);

                var $chapterHeader =
                    $('<div/>')
                        .addClass('cam6-wikiChapterHeader')
                        .attr({
                            title: 'Click to toggle open/closed'
                        })
                        .click(function(event) {
                            //LOG('click', [event, this, $chapterContentHolder, $chapterToggle]);
                            if ($chapterContentHolder.css('display') == 'none') {
                                $chapterContentHolder.css({
                                    display: 'block',
                                    height: 'auto'
                                })
                                $chapterToggle.text('-')
                            } else {
                                $chapterContentHolder.css({
                                    display: 'none',
                                    height: 'auto'
                                })
                                $chapterToggle.text('+')
                            }
                        })
                        .appendTo($chapterTop);

                var $chapterToggle =
                    $('<div/>')
                        .addClass('cam6-wikiChapterToggle')
                        .text('+')
                        .appendTo($chapterHeader);

                var $chapterName =
                    $('<div/>')
                        .addClass('cam6-wikiChapterName')
                        .text(items.length + ' ' + ((items.length == 1) ? chapterDict.itemName : chapterDict.name))
                        .appendTo($chapterHeader);

                var $chapterDescription =
                    $('<div/>')
                        .addClass('cam6-wikiChapterDescription')
                        .text(chapterDict.description)
                        .appendTo($chapterTop);

                var $chapterLink =
                    $('<div>')
                        .addClass('cam6-wikiChapterLink')
                        .appendTo($chapterTop);

                var href =
                    'http://www.DonHopkins.com/mediawiki/index.php/' +
                    'CAM6_' +
                    chapterDict.symbol;

                var $chapterLinkAnchor =
                    $('<a/>')
                        .addClass('cam6-wikiChapterLinkAnchor')
                        .attr({
                            target: '_blank',
                            href: href
                        })
                        .text('Visit Wiki Page')
                        .appendTo($chapterLink);

                var $chapterContentHolder =
                    $('<div>')
                        .addClass('cam6-wikiChapterContentHolder')
                        .css('display', 'none')
                        .appendTo($chapter);

                var $chapterContent =
                    $('<div>')
                        .addClass('cam6-wikiChapterContent')
                        .appendTo($chapterContentHolder);

                for (var itemIndex = 0, itemCount = items.length;
                     itemIndex < itemCount;
                     itemIndex++) {

                    var item = items[itemIndex];

                    var $chapterContentItem =
                        $('<div/>')
                            .addClass('cam6-wikiChapterContentItem')
                            .appendTo($chapterContent);

                    var $chapterContentItemName =
                        $('<div/>')
                            .addClass('cam6-wikiChapterContentItemName')
                            .text(chapterDict.itemName + ' ' + (itemIndex + 1) + ': ' + item.name)
                            .appendTo($chapterContentItem);

                    var $chapterContentItemDescription =
                        $('<div/>')
                            .addClass('cam6-wikiChapterContentItemDescription')
                            .text(item.description)
                            .appendTo($chapterContentItem);

                    var $chapterContentItemLink =
                        $('<div>')
                            .addClass('cam6-wikiChapterContentItemLink')
                            .appendTo($chapterContentItem);

                    var href =
                        'http://www.DonHopkins.com/mediawiki/index.php/' +
                        'CAM6_' +
                        chapterDict.itemName +
                        '_' +
                        item.wikiSymbol;

                    var $chapterContentItemLinkAnchor =
                        $('<a/>')
                            .addClass('cam6-wikiChapterContentItemLinkAnchor')
                            .attr({
                                target: '_blank',
                                href: href
                            })
                            .text('Visit Wiki Page')
                            .appendTo($chapterContentItemLink);

                    var $chapterContentItemContent =
                        $('<div>')
                            .addClass('cam6-wikiChapterContentItemContent')
                            .appendTo($chapterContentItem);

                    if (item.dict) {
                        JSONtoDOM(
                            $chapterContentItemContent,
                            null,
                            item.dict,
                            chapterDict.importantKeys,
                            chapterDict.ignoreKeys);
                    }

                }

            }).call(this, chapterIndex);

        }

    };


    CAM6.prototype.makePieGUI = function makePieGUI() {

        var cam = this;

        function makeCommandItems(commandSymbols) {

            var items = [];

            for (var i = 0, n = commandSymbols.length;
                 i < n;
                 i++) {

                var commandSymbol = commandSymbols[i];
                var commandDict = cam.command_by_symbol[commandSymbol];

                var isVisibleFunction = commandDict.isVisibleFunction;
                var isVisible =
                    !isVisibleFunction ||
                    isVisibleFunction.call(
                        cam, commandDict);
                if (!isVisible) {
                    continue;
                }

                var isEnabledFunction = commandDict.isEnabledFunction;
                var isEnabled =
                    !isEnabledFunction ||
                    isEnabledFunction.call(
                        cam, commandDict);
                if (!isEnabled) {
                    continue;
                }

                var name = commandDict.getNameFunction.call(
                  cam, commandDict);

                items.push({
                    label: name,
                    commandDict: commandDict,
                    onpieitemselect: function (event, pie, pieSlice, pieItem) {

                        var commandDict = pieItem.commandDict;
                        var params = {
                            randomSeed: cam.newRandomSeed()
                        };

                        LOG("pieselect", event, pie, pieSlice, pieItem, cam, commandDict);

                        cam.playCommand(
                            commandDict,
                            params);

                        if (cam.scriptRecording &&
                            cam.recordingCommands) {

                            cam.recordCommand(
                                commandDict,
                                params);

                        }

                    }
                });

            }

            return items;
        }

        function makeRuleItems(ruleSymbols) {

            var items = [];

            for (var i = 0, n = ruleSymbols.length;
                 i < n;
                 i++) {

                var ruleSymbol = ruleSymbols[i];
                var ruleDict = cam.rule_by_symbol[ruleSymbol];

                items.push({
                    label: ruleDict.name,
                    ruleDict: ruleDict,
                    onpieitemselect: function (event, pie, pieSlice, pieItem) {
                        var ruleDict = pieItem.ruleDict;
                        cam.ruleSymbol = ruleDict.symbol;
                        cam.updateParamVisibility();
                    }
                });

            }

            return items;
        }

        function makeToolItems(toolSymbols) {

            var items = [];

            for (var i = 0, n = toolSymbols.length;
                 i < n;
                 i++) {

                var toolSymbol = toolSymbols[i];
                var toolDict = cam.tool_by_symbol[toolSymbol];

                items.push({
                    label: toolDict.name,
                    toolDict: toolDict,
                    onpieitemselect: function (event, pie, pieSlice, pieItem) {
                        var toolDict = pieItem.toolDict;
                        cam.toolSymbol = toolDict.symbol;
                        cam.updateParamVisibility();
                    }
                });

            }

            return items;
        }

        function makeColormapItems() {

            var items = [];

            for (var i = 0, n = cam.colorMap_objects.length;
                 i < n;
                 i++) {

                var colorMapDict = cam.colorMap_objects[i];

                items.push({
                    label: colorMapDict.name,
                    colorMapDict: colorMapDict,
                    onpieitemselect: function (event, pie, pieSlice, pieItem) {
                        var colorMapDict = pieItem.colorMapDict;
                        cam.colorMapSymbol = colorMapDict.symbol;
                        cam.updateParamVisibility();
                    }
                });

            }

            return items;
        }

        function makeToolCellItems() {

            var ruleDict = cam.rule_by_symbol[cam.ruleSymbol];
            var toolCells = ruleDict['toolCells'] || [0, 1, 2, 3, 4, 5, 6, 7];
            var items = [];

            for (var i = 0, n = toolCells.length;
                 i < n;
                 i++) {

                var item = toolCells[i];

                var label;
                var toolCell;
                if (Array.isArray(item)) {
                    label = item[0];
                    toolCell = item[1];
                } else {
                    label = '' + item;
                    toolCell = item;
                }

                items.push({
                    label: label,
                    toolCell: toolCell,
                    onpieitemselect: function (event, pie, pieSlice, pieItem) {
                        var toolCell = pieItem.toolCell;
                        cam.setValue(cam, 'toolCell', toolCell);
                    }
                });

            }

            return items;
        }

        this.pies = {

            'default': {
                pieTitle: 'CAM6',
                itemDistanceMin: 100,
                slices: [
                    {
                        sliceDirection: 'North',
                        items: [
                            {
                                label: 'Commands',
                                nextPie: 'commands'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'South',
                        items: [
                            {
                                label: 'Simulation',
                                nextPie: 'simulation'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'West',
                        items: [
                            {
                                label: 'Rules',
                                nextPie: 'rules'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'East',
                        items: [
                            {
                                label: 'Tools',
                                nextPie: 'tools'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'NorthWest',
                        items: [
                            {
                                label: 'North West',
                                itemOffsetY: -20,
                                nextPie: 'commands'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'NorthEast',
                        items: [
                            {
                                label: 'North East',
                                itemOffsetY: -20,
                                nextPie: 'commands'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'SouthWest',
                        items: [
                            {
                                onpieitemshow: function(event, pie, slice, item) {
                                    var name = cam.rule_by_symbol[cam.ruleSymbol].name;
                                    item.label = name;
                                },
                                label: '[Current Rule Name]',
                                itemOffsetY: 20,
                                nextPie: 'currentRule'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'SouthEast',
                        items: [
                            {
                                onpieitemshow: function(event, pie, slice, item) {
                                    var name = cam.tool_by_symbol[cam.toolSymbol].name;
                                    item.label = name;
                                },
                                label: '[Current Tool Name]',
                                itemOffsetY: 20,
                                nextPie: 'currentTool'
                            }
                        ]
                    }
                ]
            },

            'commands': {
                pieTitle: 'Commands',
                itemDistanceMin: 70,
                onpieshow: function(event, pie) {

                    LOG("onpieshow", event, pie);

                    // Clear out any existing slices.
                    this._removePieSlices(pie);

                    pie.slices = [
                        {
                            sliceDirection: 'North',
                            items: makeCommandItems(['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'save'])
                        },
                        {
                            sliceDirection: 'South',
                            items: makeCommandItems(['clear', 'randomize', 'initialize'])
                        },
                        {
                            sliceDirection: 'West',
                            items: makeCommandItems(['fullscreenMode', 'windowMode'])
                        },
                        {
                            sliceDirection: 'East',
                            items: makeCommandItems(['pause', 'resume'])
                        }
                    ];

                    LOG("pie.slices", pie.slices);

                }
            },

            'tools': {
                pieTitle: 'Tools',
                slices: [
                    {
                        sliceDirection: 'North',
                        items: makeToolItems(['squareBrush'])
                    },
                    {
                        sliceDirection: 'South',
                        items: makeToolItems(['circularBrush'])
                    },
                    {
                        sliceDirection: 'West',
                        items: makeToolItems(['squareSpray'])
                    },
                    {
                        sliceDirection: 'East',
                        items: makeToolItems(['line'])
                    },
                    {
                        sliceDirection: 'NorthWest',
                        items: makeToolItems(['circularRandomSpray'])
                    },
                    {
                        sliceDirection: 'NorthEast',
                        items: makeToolItems(['squareRandomSpray'])
                    },
                    {
                        sliceDirection: 'SouthWest',
                        items: makeToolItems(['circularRandomSpray'])
                    },
                    {
                        sliceDirection: 'SouthEast',
                        items: makeToolItems(['circularSpray'])
                    }
                ]
            },

            'currentTool': {
                pieTitle: 'Current Tool',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: []
                    }
                ]
            },

            'rules': {
                pieTitle: 'Rules',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: makeRuleItems([])
                    }
                ]
            },

            'currentRule': {
                pieTitle: 'Current Rule',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: []
                    }
                ]
            },

            'simulation': {
                pieTitle: 'Simulation',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: []
                    }
                ]
            },

            'histogram': {
                itemDistanceMin: 70,
                pieTitle: 'Histogram',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: [
                            {
                                label: 'Select Color Map',
                                nextPie: 'histogramSelectColorMap'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'West',
                        items: [
                            {
                                label: 'Select Tool Cell',
                                nextPie: 'histogramSelectToolCell'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'East',
                        items: [
                            {
                                label: '-'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'SouthWest',
                        items: [
                            {
                                label: '-'
                            }
                        ]
                    },
                    {
                        sliceDirection: 'SouthEast',
                        items: [
                            {
                                label: '-'
                            }
                        ]
                    }
                ]
            },

            'histogramSelectColorMap': {
                itemDistanceMin: 20,
                pieTitle: 'Select Color Map',
                slices: [
                    {
                        sliceDirection: 'South',
                        items: makeColormapItems()
                    }
                ]
            },

            'histogramSelectToolCell': {
                itemDistanceMin: 20,
                pieTitle: 'Select Tool Cell',
                onpieshow: function(event, pie) {
                    var sliceDict = pie.slices[2];
                    this._removeSliceItems(sliceDict);
                    sliceDict.items = makeToolCellItems();
                },
                slices: [
                    {
                        sliceDirection: 'East',
                        items: [
                            {
                                label: 'Pull Right',
                                itemDistanceMin: 80,
                                onpieitemupdate: function(event, target, pie, pieslice, pieitem) {
                                    if (pie.$pieTitle) {
                                        pie.$pieTitle.text('Distance: ' + pie.distance);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        sliceDirection: 'West',
                        items: [
                            {
                                label: 'Pull Left',
                                itemDistanceMin: 80,
                                onpieitemupdate: function(event, target, pie, pieslice, pieitem) {
                                    if (pie.$pieTitle) {
                                        pie.$pieTitle.text('Distance: ' + pie.distance);
                                    }
                                }
                            }
                        ]
                    },
                    {
                        sliceDirection: 'South'
                    }
                ]
            }

        };

        this.pieOptions = {
            root: this.$root,
            defaultPie: 'default',
            pies: this.pies,
            sliceItemLayout: 'nonOverlapping',
            itemDistanceMin: 100,
            draggyPin: false,
            pieItemCSS: {
                whiteSpace: 'nowrap'
            }
        };

        this.$pie =
            $('<div/>')
                .addClass('cam6-pieTarget')
                .pie(this.pieOptions);

    };


    // updateParamVisibility turns param editor on and off according to
    // if the current tool or rule depend on them.
    CAM6.prototype.updateParamVisibility = function updateParamVisibility() {

        if (!this.useGUI) {
            return;
        }

        for (var i = 0, n = this.paramMetaData_objects.length;
             i < n;
             i++) {

            var paramMetaData = this.paramMetaData_objects[i];

            var $div = paramMetaData.$div;
            if (!$div) {
                continue;
            }

            var condition = paramMetaData.condition;

            //LOG('updateParamVisibility', ['paramMetaData.param', paramMetaData.param, 'condition', condition, 'paramMetaData', paramMetaData, 'result', condition && condition.call(this, paramMetaData)]);

            if (!condition ||
                condition.call(
                    this, paramMetaData)) {
                $div.css('display', 'block');
            } else {
                $div.css('display', 'none');
            }

        }

    };


    // getColorMap returns the current color map.
    CAM6.prototype.getColorMap = function getColorMap() {

        var colorMapDict =
            this.get_colorMap_by_symbol(
                this.colorMapSymbol);

        return colorMapDict.colorMap;
    };


    // makeCells makes the buffers for the cells.
    CAM6.prototype.makeCells = function makeCells() {

        this.cellBufferWidth = this.cellWidth + (2 * this.cellGutter);
        this.cellBufferHeight = this.cellHeight + (2 * this.cellGutter);
        this.cellBufferSize = this.cellBufferWidth * this.cellBufferHeight;
        this.cells0 = new Uint8Array(new ArrayBuffer(this.cellBufferSize));
        this.cells1 = new Uint8Array(new ArrayBuffer(this.cellBufferSize));

    };


    // setCells sets the cells width, height and data.
    CAM6.prototype.setCells = function setCells(cellData, cellWidth, cellHeight) {

        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.makeCells();

        var cellGutter = this.cellGutter;
        var cellIndex = (cellGutter * this.cellBufferWidth) + cellGutter;
        var dataIndex = 0;
        var cells0 = this.cells0;
        var cells1 = this.cells1;

        for (cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                cells0[cellIndex] = cells1[cellIndex] = cellData[dataIndex];
                cellIndex++;
                dataIndex++;

            }

            cellIndex += 2 * cellGutter;

        }

        this.wrapCells();
        this.nextPhaseTime();
        this.wrapCells();
        this.nextPhaseTime();

    };


    // getCellData returns the cells as an array of numbers, compatible
    // with JSON.
    CAM6.prototype.getCellData = function getCellData(cellData, cellWidth, cellHeight) {

        var cellData = [];
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * this.cellBufferWidth) + cellGutter;
        var cells = this.getCells();

        for (cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                cellData.push(cells[cellIndex]);
                cellIndex++;

            }

            cellIndex += 2 * cellGutter;

        }

        return cellData;
    };


    // makeHistogram makes the buffer for the histogram.
    CAM6.prototype.makeHistogram = function makeHistogram() {

        if (this.doHistogram) {
            this.histogram = new Uint32Array(new ArrayBuffer(256 * 4));
        }

    };


    // full screen mode.
    CAM6.prototype.fullScreenMode = function fullScreenMode() {

        if (this.fullScreen) {
            return;
        }

        this.fullScreen = true;

        var el =
            this.$root[0];

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }

    };


    // window mode.
    CAM6.prototype.windowMode = function windowMode() {

        if (!this.fullScreen) {
            return;
        }

        this.fullScreen = false;

        var el =
            document;

        if (el.cancelFullscreen) {
            el.cancelFullscreen();
        } else if (el.mozCancelFullScreen) {
            el.mozCancelFullScreen();
        } else if (el.webkitCancelFullScreen) {
            el.webkitCancelFullScreen();
        }

    };


    // pause pauses the simulation.
    CAM6.prototype.pause = function pause() {

        if (this.animationTimer !== null) {
            clearTimeout(
                this.animationTimer);
            this.animationTimer = null;
        }

        this.paused = true;

        this.updateCommands();
    };


    // resume resumes the simulation.
    CAM6.prototype.resume = function resume() {

        if (!this.paused) {
            return;
        }

        this.paused = false;

        this.scheduleTick();

        this.updateCommands();
    };


    // scheduleTick schedules an animation timer tick.
    CAM6.prototype.scheduleTick = function scheduleTick() {

        if (this.paused) {
            return;
        }

        if (this.animationTimer !== null) {
            clearTimeout(
                this.animationTimer);
            this.animationTimer = null;
        }

        this.animationTimer =
            window.setTimeout(
                $.proxy(this.tick, this),
                this.animationDelay);

    };


    // tick performs and renders the simulation.
    CAM6.prototype.tick = function tick() {

        this.applyRule();
        this.playScript();
        this.trackHistogram();
        this.applyTools();
        this.wrapCells();
        this.applyAnalyzers();
        this.updateParams();
        this.renderCells();
        this.renderHistogram();
        this.glRender();
        this.scheduleTick();

    };


    // nextPhaseTime toggles the phaseTime.
    CAM6.prototype.nextPhaseTime = function nextPhaseTime() {
        this.phaseTime = this.phaseTime ? 0 : 1;
    };


    // getCells returns the current cells.
    CAM6.prototype.getCells = function getCells() {
        return this.phaseTime
            ? this.cells1
            : this.cells0;
    };


    // getNextCells returns the next cells.
    CAM6.prototype.getNextCells = function getNextCells() {
        return this.phaseTime
            ? this.cells0
            : this.cells1;
    };


    // applyAnalyzers performs data analysis processing,
    // to be done after applying the rule.
    CAM6.prototype.applyAnalyzers = function applyAnalyzers() {

        if (this.paused) {
            return;
        }

        this.updateWebCam();
        this.updateHeadTracker();

        // Run active analyzers.

        var analyzerDict =
            this.analyzer_by_symbol[this.analyzerSymbol];
        if (!analyzerDict) {
            return;
        }

        var done = false;
        while (!done) {

            switch (this.analyzerState) {

                case 'enabled':

                    if (!this.analyzerEnabled) {

                        this.setValue(this, 'analyzerState', 'disabling');
                        this.setValue(this, 'analyzerStatus', 'Analyzer disabling.');

                        if (analyzerDict.onEnabledEnd) {
                            analyzerDict.onEnabledEnd.call(
                                this, analyzerDict);
                        }

                        break;
                    }

                    if (analyzerDict.onEnabled) {
                        analyzerDict.onEnabled.call(
                            this, analyzerDict);
                    }

                    done = true;

                    break;

                case 'disabling':

                    if (analyzerDict.onDisabling &&
                        !analyzerDict.onDisabling.call(
                            this, analyzerDict)) {

                        done = true;

                    } else {

                        this.setValue(this, 'analyzerState', 'disabled');
                        this.setValue(this, 'analyzerStatus', 'Analyzer disabled.');

                        if (analyzerDict.onDisabledBegin) {
                            analyzerDict.onDisabledBegin.call(
                                this, analyzerDict);
                        }

                    }

                    break;

                case 'disabled':

                    if (!this.analyzerEnabled) {

                        done = true;

                    } else {

                        this.setValue(this, 'analyzerState', 'enabling');
                        this.setValue(this, 'analyzerStatus', 'Analyzer enabling.');

                        if (analyzerDict.onDisabledEnd) {
                            analyzerDict.onDisabledEnd.call(
                                this, analyzerDict);
                        }

                    }

                    break;

                case 'enabling':

                    if (analyzerDict.onEnabling &&
                        !analyzerDict.onEnabling.call(
                            this, analyzerDict)) {

                        done = true;

                    } else {

                        this.setValue(this, 'analyzerState', 'enabled');
                        this.setValue(this, 'analyzerStatus', 'Analyzer enabled.');

                        if (analyzerDict.onEnabledBegin) {
                            analyzerDict.onEnabledBegin.call(
                                this, analyzerDict);
                        }

                    }

                    break;

            }

        }

    };


    CAM6.prototype.updateParams = function updateParams() {

        if (this.paused) {
            return;
        }

        if (this.unfrob) {

            var frob = this.frob;
            var frobTarget = this.frobTarget;

            frob -= frobTarget;

            if (Math.abs(frob) <= this.unfrob) {
                frob = 0;
            } else {
                if (frob < 0) {
                    frob += this.unfrob;
                } else {
                    frob -= this.unfrob;
                }
            }

            frob += frobTarget;

            if (frob != this.frob) {
                this.setValue(this, 'frob', frob);
            }

        }

    };


    // renderCells renders the cells into the canvas.
    CAM6.prototype.renderCells = function renderCells() {

        if (!this.doCellCanvas) {
            return;
        }

        var cells = this.paused ? this.getNextCells() : this.getCells();
        //var cells = this.getCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
        var cellCanvasContext = this.cellCanvasContext;
        var cellCanvasImageData = this.cellCanvasImageData;
        var cellCanvasData = this.cellCanvasData;
        var colorMap = this.getColorMap();
        var pixelIndex = 0;

        // Render the cells.

        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (var cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                var cell = cells[cellIndex];

                var colorMapIndex = cell * 4;

                cellCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                cellCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                cellCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                cellCanvasData[pixelIndex++] = colorMap[colorMapIndex++];

                cellIndex++;

            }

            cellIndex += 2;

        }

        cellCanvasContext.putImageData(
            cellCanvasImageData,
            0, 0);
    };


    // renderHistogram renders the histogram into the canvas.
    CAM6.prototype.renderHistogram = function renderHistogram() {

        if (!this.doHistogram) {
            return;
        }

        var histogramCanvasContext = this.histogramCanvasContext;
        var histogramCanvasImageData = this.histogramCanvasImageData;
        var histogramCanvasData = this.histogramCanvasData;
        var colorMap = this.getColorMap();

        var histogram = this.histogram;
        var histogramToolCellHeight = this.histogramToolCellHeight;
        var histogramHeaderHeight = this.histogramHeaderHeight;
        var histogramGraphHeight = this.histogramGraphHeight;
        var pixelIndex = 0;

        var maxHistogram = 0;
        for (var cell = 0;
             cell < 256;
             cell++) {

            var value = histogram[cell];

            if (value > maxHistogram) {
                maxHistogram = value;
            }

        }

        var histogramScale =
           (maxHistogram
               ? (histogramGraphHeight / maxHistogram)
               : 0);
        var histogramUsefulHeight = histogramGraphHeight - 1;

        // Draw histogram.
        for (var y = 0;
             y < histogramGraphHeight;
             y++) {

            var yy = (histogramGraphHeight - y) - 1;
            var countWeight = yy / histogramUsefulHeight;
            var countWeightNext = (yy + 1) / histogramUsefulHeight;
            var cutoff = countWeight * maxHistogram;
            var cutoffNext = countWeightNext * maxHistogram;

            for (var cell = 0;
                 cell < 256;
                 cell++) {

                var count = histogram[cell];

                var isActive = count > cutoff;

                var isTip =
                    isActive &&
                    (count <= cutoffNext);

                if (isTip) {

                    // Draw the tip of a non-zero bucket in white.

                    histogramCanvasData[pixelIndex++] = 255;
                    histogramCanvasData[pixelIndex++] = 255;
                    histogramCanvasData[pixelIndex++] = 255;
                    histogramCanvasData[pixelIndex++] = 255;

                } else if (isActive) {

                    // Draw the rest of the active part of a
                    // non-zero bucket in its color.

                    var colorMapIndex = cell * 4;

                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];

                } else {

                    // Draw the inactive part of a bucket in black.

                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 255;

                }

            }

        }

        // Draw the header, pure colors from the colorMap.
        for (var y = 0;
             y < histogramHeaderHeight;
             y++) {

            for (var cell = 0;
                 cell < 256;
                 cell++) {

                var colorMapIndex = cell * 4;

                histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];
                histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex++];

            }

        }

        // Draw the tool cell color.
        var colorMapIndex = this.toolCell * 4;
        for (var y = 0;
             y < histogramToolCellHeight;
             y++) {

            for (var cell = 0;
                 cell < 256;
                 cell++) {

                if ((cell == this.toolCell - 1) ||
                    (cell == this.toolCell + 1)) {

                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 0;
                    histogramCanvasData[pixelIndex++] = 255;

                } else {

                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex + 0];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex + 1];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex + 2];
                    histogramCanvasData[pixelIndex++] = colorMap[colorMapIndex + 3];

                }

            }

        }

        histogramCanvasContext.putImageData(
            histogramCanvasImageData,
            0, 0);
    };


    // randomizeCells randomizes the cell values.
    CAM6.prototype.randomizeCells = function randomizeCells() {

        var cells = this.getNextCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;

        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (var cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                var cell = Math.floor(Math.random() * 256);

                cells[cellIndex] = cell;
                cellIndex++;

            }

            cellIndex += 2;

        }

        this.wrapCells();
    };


    // initCells initializes the cell values.
    CAM6.prototype.initCells = function initCells() {

        var cells = this.getNextCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;

        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (var cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                var cell = 0;

                if (((cellX == 16+1) && (cellY == 4+1)) || // right
                    ((cellX == 16) && (cellY == 8)) || // left
                    ((cellX == 16+1) && (cellY == 16)) ||
                    ((cellX == 18) && (cellY == 16+1))) {
                    cell = 1;
                }

                cells[cellIndex] = cell;
                cellIndex++;

            }

            cellIndex += 2;

        }

        this.wrapCells();
    };


    // clearCells clears the cell values.
    CAM6.prototype.clearCells = function clearCells() {
        this.setCellsValue(0);
    };


    // initializeCells initializes the cell values.
    CAM6.prototype.initializeCells = function initializeCells() {

        if (!this.$initializeDialog) {

            this.$initializeDialog =
                $('<div/>')
                    .addClass('cam6-dialog')
                    .appendTo(this.$root);

            this.$initializeDialogText =
                $('<div/>')
                    .html(
                        'Type some JavaScript code to initialize each cell.<br/>' +
                        'The current value is in "cell", which you may change.<br/>' +
                        'The following variables will be defined:<br/>'
                    )
                    .appendTo(this.$initializeDialog);

            this.$initializeDialogPre =
                $('<pre/>')
                    .addClass('cam6-dialogPreBefore')
                    .html(
                        'var cellWidth = ' + this.cellWidth + '; // Width of cells.\n' +
                        'var cellHeight = ' + this.cellHeight + '; // Height of cells.\n' +
                        'var cellX; // Cell x location: 0 to ' + (this.cellWidth - 1) + '.\n' +
                        'var cellY; // Cell y location: 0 to ' + (this.cellHeight - 1) + '.\n' +
                        'var cell; // Current cell value: 0 to 255.\n'
                    )
                    .appendTo(this.$initializeDialog);

            this.$initializeDialogTextArea =
                $('<textarea/>')
                    .addClass('cam6-dialogTextArea')
                    .text(
                        'cell =\n' +
                        '    Math.floor(Math.random() * 256);\n'
                    )
                    .appendTo(this.$initializeDialog);

            this.$initializeDialog.dialog({
                resizable: true,
                draggable: true,
                width: 600,
                height: 600,
                dialogClass: 'cam6-dialog',
                title: 'Initialize Cells',
                buttons: [
                    {
                        text: 'Initialize',
                        click: $.proxy(function() {

                            var params = {
                            };

                            var code = 
                                this.$initializeDialogTextArea.val() + '\n';
                            var compiledFunction =
                                this.compileTemplate(
                                    this.initializeCellsTemplate,
                                    {
                                        code_replace: code
                                    });

                            if (compiledFunction) {
                                try {
                                    compiledFunction.call(this, code);
                                } catch (e) {
                                    alert('Error evaluating code:\n' + e + '\n' + code);
                                }
                            } else {
                                alert('Error compiling code:\n' + code);
                            }

                        }, this)
                    },
                    {
                        text: 'Close',
                        click: $.proxy(function() {
                            this.$initializeDialog.dialog('close');
                        }, this)
                    }
                ]
            });

        }

        this.$initializeDialog.dialog('open');

    };


    CAM6.prototype.initializeCellsTemplate = function initializeCellsTemplate(code) {
        var cells = this.getNextCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;

        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (var cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                var cell = cells[cellIndex];

                try {
// <slot name="code">
                    eval(code);
// </slot>
                } catch (e) {
                    alert('Error evaluating code:\n' + e + '\n' + code);
                    return;
                }

                cells[cellIndex] = cell;
                cellIndex++;

            }

            cellIndex += 2;

        }

        this.wrapCells();

        if (this.paused) {
            this.tick();
        }
    };


    // setCells sets the cell values to a given value.
    CAM6.prototype.setCellsValue = function setCellsValue(value) {

        var cells = this.getNextCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;

        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            for (var cellX = 0;
                 cellX < cellWidth;
                 cellX++) {

                cells[cellIndex] = value;
                cellIndex++;

            }

            cellIndex += 2;

        }

        this.wrapCells();
    };


    // wrapCells wraps the cell edges.
    CAM6.prototype.wrapCells = function wrapCells() {

        var cells = this.getCells();
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var cellIndex = (cellGutter * cellBufferWidth) + cellGutter;
        var penultimateBufferRow = cellBufferWidth * cellHeight;
        var ultimateBufferRow = cellBufferWidth * (cellHeight + 1);

        // Wrap the left and right edges of the cells,
        // not including the corners of the buffer.
        for (var cellY = 0;
             cellY < cellHeight;
             cellY++) {

            // Copy right edge of cells to left edge of buffer.
            cells[cellIndex - 1] = cells[cellIndex + cellWidth - 1];

            // Copy left edge of cells to right edge of buffer.
            cells[cellIndex + cellWidth] = cells[cellIndex];

            cellIndex += cellBufferWidth;

        }

        // Wrap the top and bottom edges of the cells,
        // including the corners.
        cellIndex = 0;
        for (var bufferX = 0;
             bufferX < cellBufferWidth;
             bufferX++) {

            // Copy bottom edge of cells to top edge of buffer.
            cells[cellIndex] = cells[cellIndex + penultimateBufferRow];

            // Copy top edge of cells to bottom edge of buffer.
            cells[cellIndex + ultimateBufferRow] = cells[cellIndex + cellBufferWidth];

            cellIndex++;

        }

    };


    // newRandomSeed seeds the random number generator and saves the seed
    // in randomSeed.
    CAM6.prototype.newRandomSeed = function newRandomSeed() {
        var seed = Math.seedrandom();
        this.randomSeed = seed;
        return seed;
    };


    // initActiveTool initializes the active tool, by setting up its initial parameters.
    CAM6.prototype.initActiveTool = function initActiveTool(activeToolDict) {

        var toolSymbol = activeToolDict.toolSymbol;
        var toolDict = this.tool_by_symbol[toolSymbol];

        var paramsUsed = toolDict.paramsUsed;
        for (var paramKey in paramsUsed) {
            var paramValue = this[paramKey];
            activeToolDict[paramKey] = paramValue;
        }

    };

    // addActiveTool adds a tool to the list of active tools.
    // The toolSymbol string identifies which tool to add.
    // The params dictionary parameterize the tool.
    // The channel string identifies the group the tool belongs to.
    // The layer number controls the order in which the tools are used.
    // It returns a unique identifier number of the added tool.
    CAM6.prototype.addActiveTool = function addActiveTool(activeToolDict, channel, layer) {
        var toolSymbol = activeToolDict.toolSymbol;
        var activeTools = this.activeTools;
        var toolDict = this.tool_by_symbol[toolSymbol];

        // Find where to insert it.
        for (var activeToolIndex = 0, activeToolCount = activeTools.length;
             activeToolIndex < activeToolCount;
             activeToolIndex++) {

            var nextActiveToolDict = activeTools[activeToolIndex];

            if (nextActiveToolDict.layer > layer) {
                break;
            }
        }

        activeToolDict.toolSymbol = toolSymbol;
        activeToolDict.channel = channel;
        activeToolDict.layer = layer;
        activeToolDict.activeToolSymbol = 'activeTool_' + nextID();

        activeTools.splice(activeToolIndex, 0, activeToolDict);

        var beginToolFunction = toolDict.beginToolFunction;
        if (beginToolFunction) {
            beginToolFunction.call(
                this, toolDict, activeToolDict);
        }

        return activeToolDict;
    };


    // removeActiveTool removes one or more matching active tools from the
    // list of active tools.
    // If both activeToolSymbol and channel are null, then all active tools
    // are removed.
    // Otherwise if the activeToolSymbol is not null, then it must match the
    // active tool's activeToolID, or if the channel is not null, then it must
    // match the active tool's channel.
    CAM6.prototype.removeActiveTool = function removeActiveTool(activeToolSymbol, channel, count) {

        var activeTools = this.activeTools;
        var matchingActiveTools = [];

        for (var activeToolIndex = 0, activeToolCount = activeTools.length;
             activeToolIndex < activeToolCount;
             activeToolIndex++) {

            var activeToolDict = activeTools[activeToolIndex];

            // An activeTool matches if both activeToolSymbol and channel are null,
            // or of activeToolSymbol isn't null, and matches its activeToolSymbol,
            // or if channel isn't null, and matches its channel.
            if (((activeToolSymbol === null) &&
                 (channel === null)) ||
                ((activeToolSymbol !== null) &&
                 (activeToolSymbol === activeToolDict.activeToolSymbol)) ||
                ((channel !== null) &&
                 (channel === activeToolDict.channel))) {

                // If count is negative, then prepend, else append.
                if (count < 0) {
                    matchingActiveTools.unshift(activeToolDict);
                } else {
                    matchingActiveTools.push(activeToolDict);
                }

            }

        }

        // Now that matchingActiveTools contains the matching activeTools
        // in the order that we want to delete them, make count positive
        // and end the first (positive) or last (negative) count activeTools,
        // or if it's zero then end all the matchingActiveTools.
        count =
            Math.min(
                matchingActiveTools.length,
                (Math.abs(count) ||
                 matchingActiveTools.length));

        for (var matchingActiveToolIndex = 0;
             matchingActiveToolIndex < count;
             matchingActiveToolIndex++) {

            var activeToolDict = matchingActiveTools[matchingActiveToolIndex];
            var toolDict = this.tool_by_symbol[activeToolDict.toolSymbol];
            var activeToolIndex = this.activeTools.indexOf(activeToolDict);

            activeTools.splice(activeToolIndex, 1);

            var endToolFunction = toolDict.endToolFunction;
            if (endToolFunction) {
                endToolFunction.call(
                    this, toolDict, activeToolDict);
            }
        }

    };


    // trackHistogram tracks the mouse in the histogram.
    CAM6.prototype.trackHistogram = function trackHistogram() {

        if (!this.trackingHistogram) {
            return;
        }

        // If they pressed down in the histogram, then dragging
        // around the histogram sets the toolCell to the
        // corresponding cell of the histogram column under the
        // cursor, and dragging up into the actual cells sets the
        // tool cell to the cell under the cursor.

        var toolCell = this.toolCell;

        // Set the drawing tool cell from the histogram cell
        // at the cursor x location.

        toolCell = 
            Math.max(
                0,
                Math.min(
                    255,
                    Math.floor(
                        this.histogramMouseX)));

        // If the tool cell changed, then update the parameter.
        if (toolCell != this.toolCell) {
            this.setValue(this, 'toolCell', toolCell);
        }

    };


    // applyTools applies the drawing tools.
    CAM6.prototype.applyTools = function applyTools() {

        // Run all of the active editing tools.

        var activeTools = this.activeTools;

        for (var activeToolIndex = 0, activeToolCount = activeTools.length;
             activeToolIndex < activeToolCount;
             activeToolIndex++) {

            var activeToolDict = activeTools[activeToolIndex];

            if (!activeToolDict.enabled) {
                continue;
            }

            var toolSymbol = activeToolDict.toolSymbol;
            var toolDict = this.tool_by_symbol[toolSymbol];

            this.newRandomSeed();

            activeToolDict.step = this.step;

            if (activeToolDict == this.trackingCellsActiveToolDict) {

                var paramsUsed =
                    activeToolDict.paramsUsed ||
                    toolDict.paramsUsed;

                for (var paramKey in paramsUsed) {

                    if (!paramsUsed[paramKey]) {
                        continue;
                    }

                    var paramValue = this[paramKey];

                    activeToolDict[paramKey] = paramValue;

                }

            }

            this.playTool(
                activeToolDict);

        }

    };


    // playTool plays a tool dictionary and parameters.
    CAM6.prototype.playTool = function playTool(activeToolDict) {

        //var cells = this.paused ? this.getCells() : this.getNextCells();
        var cells = this.getNextCells();
        var toolSymbol = activeToolDict.toolSymbol;
        var toolDict = this.tool_by_symbol[toolSymbol];

        if (this.scriptRecording &&
            this.recordingTools) {

            this.recordTool(
                toolDict,
                activeToolDict);

        }

        if (toolDict.compositionOverlay) {
            this.clearCompositionOverlay();
        }

        if (toolDict.feedbackOverlay) {
            this.clearFeedbackOverlay();
        }

        if (toolDict.beforeToolFunction) {
            toolDict.beforeToolFunction.call(
                this, toolDict, activeToolDict, cells);
        }

        if (toolDict.wraplicate) {

            this.wraplicateTool(
                toolDict,
                activeToolDict,
                cells);

        } else {

            toolDict.toolFunction.call(
                this, toolDict, activeToolDict, cells);

        }

        if (toolDict.afterToolFunction) {
            toolDict.afterToolFunction.call(
                this, toolDict, activeToolDict, cells);
        }

        if (toolDict.compositionOverlay) {
            this.compositionOverlayToCells(
                toolDict,
                activeToolDict,
                cells);
        }

    };


    // compositionOverlayToCells composes the composition overlay into the cells.
    CAM6.prototype.compositionOverlayToCells = function compositionOverlayToCells(toolDict, activeToolDict, cells) {

        var compositionFunctionDict =
            this.get_compositionFunction_by_symbol(
                toolDict.overlayFunctionSymbol);

        var left = 0;
        var top = 0;
        var right = this.cellWidth;
        var bottom = this.cellHeight;
        var cellGutter = this.cellGutter;
        var cellBufferWidth = this.cellBufferWidth;
        var pixels =
            this.compositionOverlayContext.getImageData(
                0, 0, this.cellWidth, this.cellHeight).data;

        compositionFunctionDict.compositionFunction.call(
            this,
            compositionFunctionDict,
            toolDict,
            activeToolDict,
            left, top, right, bottom,
            pixels,
            cells, cellGutter, cellBufferWidth);

    };


    // clearCompositionOverlay clears the draw overlay.
    CAM6.prototype.clearCompositionOverlay = function clearCompositionOverlay() {

        this.compositionOverlayContext.clearRect(
            0, 0, this.cellWidth, this.cellHeight);

    };


    // clearFeedbackOverlay clears the feedback overlay.
    CAM6.prototype.clearFeedbackOverlay = function clearFeedbackOverlay() {

        this.feedbackOverlayContext.clearRect(
            0, 0, this.cellWidth, this.cellHeight);

    };


    // recordTool records the tool, if recording a script.
    CAM6.prototype.recordTool = function recordTool(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = $.extend({}, activeToolDict);

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'tool',
            activeToolDict: activeToolDictCopy
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded tool:', ['step', this.step, 'symbol', toolDict.symbol, 'mouseX', activeToolDict.mouseX, 'mouseY', activeToolDict.mouseY, 'activeToolDict', activeToolDict, 'scriptDict', scriptDict]);

    };


    // recordToolBegin records the tool begin, if recording a script.
    CAM6.prototype.recordToolBegin = function recordToolBegin(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = $.extend({}, activeToolDict);

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'toolBegin',
            activeToolDict: activeToolDictCopy
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded tool begin:', ['step', this.step, 'toolSymbol', toolDict.toolSymbol, 'scriptDict', scriptDict]);

    };


    // recordToolEnd records the tool end, if recording a script.
    CAM6.prototype.recordToolEnd = function recordToolEnd(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = $.extend({}, activeToolDict);

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'toolEnd',
            activeToolDict: activeToolDictCopy
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded tool end:', ['step', this.step, 'toolSymbol', toolDict.toolSymbol, 'scriptDict', scriptDict]);

    };


    // wraplicateTool duplicates of the drawing function at + and - the
    // cell width and height, so it wraps around the edges.
    CAM6.prototype.wraplicateTool = function wraplicateTool(toolDict, activeToolDict, cells) {

        var activeToolDictCopy = $.extend({}, activeToolDict);

        var mouseX = activeToolDictCopy.mouseX;
        var mouseY = activeToolDictCopy.mouseY;
        var cellWidth = this.cellWidth;
        var cellHeight = this.cellHeight;
        var toolFunction = toolDict.toolFunction;
        var paramsUsed = toolDict.paramsUsed;

        for (var dy = -cellHeight;
             dy <= cellHeight;
             dy += cellHeight) {

            for (var dx = -cellWidth;
                 dx <= cellWidth;
                 dx += cellWidth) {

                for (var i = 0, n = this.coordinatePairs.length;
                     i < n;
                     i++) {

                    var coordinatePair = this.coordinatePairs[i];
                    var xKey = coordinatePair[0];
                    var yKey = coordinatePair[1];

                    if (paramsUsed[xKey] !== undefined) {
                        activeToolDictCopy[xKey] = activeToolDict[xKey] + dx;
                    }

                    if (paramsUsed[yKey] !== undefined) {
                        activeToolDictCopy[yKey] = activeToolDict[yKey] + dy;
                    }

                }

                toolFunction.call(
                    this, toolDict, activeToolDictCopy, cells);

            }

        }

    };


    // compileRule takes a ruleDict, and compiles the ruleFunction into
    // the ruleTable.
    CAM6.prototype.compileRule = function compileRule(ruleDict) {

        var ruleTableBytes = ruleDict.ruleTableBytes;

        if (ruleTableBytes) {
            return;
        }

        var neighborhoodDict = this.get_neighborhood_by_symbol(ruleDict.neighborhood);
        var neighbors = neighborhoodDict.neighbors;
        var ruleFunction = ruleDict.ruleFunction;
        var ruleTable = ruleDict.ruleTable;
        var neighborCount = neighbors.length;
        var ruleTableSize = 1 << neighborCount;
        var state = {};

        ruleTableBytes = ruleDict.ruleTableBytes =
            new Uint8Array(new ArrayBuffer(ruleTableSize));

        // Loop over all possible combinations of neighbor input values,
        // and put them into state, which maps neighbor names to neighbor
        // values. Call the ruleFunction on all possible states, storing
        // the resulting output in the ruleTableBytes array lookup table,
        // which will be used by the neighborhoodFunction to efficiently
        // calculate the rule value, by indexing into the ruleTableBytes
        // array by a number computed by simply concatinating the bit
        // values of the neighbors of the actual cells. This is how the
        // CAM6 hardware works so efficiently, by computing the index
        // in hardware and indexing into ruleTableByte, even though the
        // rules themselves are defined in high level Forth (or JavaScript
        // in our case). So the effeciency of the ruleFunction does not
        // matter, since it's not executed in the inner loop, but instead
        // when the rule is first compiled.

        for (var index = 0;
             index < ruleTableSize;
             index++) {

            // The index is the binary representation of all the neighbors,
            // so we will unpack it into the symbolic state array to pass to
            // the ruleFunction.
            for (var line = 0, bit = 1;
                 line < neighborCount;
                 line++, bit <<= 1) {

                state[neighbors[line]] =
                    (index & bit) ? 1 : 0;

            }

            // Call the ruleFunction on each possible state, to get the value
            // of the cellular automata rule for each possible configuration,
            // and store the result in the ruleTableBytes
            var output = ruleFunction(ruleDict, state) & 0xff;

            ruleTableBytes[index] = output;

        }

        //LOG('compileRule', ['ruleTableBytes', ruleTableBytes]);

    };


    CAM6.prototype.compileNeighborhoodFunction = function compileNeighborhoodFunction(neighborhoodDict, ruleDict, userParams) {

        var ruleNeighborhoodFunction = ruleDict.neighborhoodFunction;

        if (ruleNeighborhoodFunction) {
            return ruleNeighborhoodFunction;
        }

        var neighborhoodFunctionTemplate = neighborhoodDict.neighborhoodFunctionTemplate;

        if (!neighborhoodFunctionTemplate) {

            var neighborhoodFunction = neighborhoodDict.neighborhoodFunction;

            var functionString = '' + neighborhoodFunction;

            if (functionString.indexOf('// <function') == -1) {
                ruleDict.neighborhoodFunction = neighborhoodFunction;
                return neighborhoodFunction;
            }

            var strings =
                functionString.split(/\/\/[ ]*</);

            var output = [
                '<doc><![CDATA[',
                strings[0]
            ];

            for (var i = 1, n = strings.length;
                 i < n;
                 i++) {

                var string = strings[i];

                var tagRest = string.split('>');

                if (tagRest.length < 2) {
                    ERROR('Failed to find end of tag:', ['String', string, 'tagRest', tagRest]);
                } else {

                    var tag = tagRest.shift();
                    var rest = tagRest.join('>');

                    tag = tag.replace(/^[\t ]*\/\/([\t ]*)/, '$1');

                    output.push(']]><');
                    output.push(tag);
                    output.push('><![CDATA[');
                    if (rest.length) {
                        output.push(rest);
                    }

                }

            }

            output.push(']]></doc>');

            var xml = output.join('');

            //LOG('Parsing XML text:', xml);
            var doc = $.parseXML(xml);
            //LOG('Got XML document:', doc);

            neighborhoodFunctionTemplate = doc && doc.firstChild;

            if (!neighborhoodFunctionTemplate) {
                ERROR('Error parsing xml for function template:', xml);
                ruleDict.neighborhoodFunction = neighborhoodFunction;
                return neighborhoodFunction;
            }

            this.neighborhoodFunctionTemplate = neighborhoodFunctionTemplate;

        }

        var resultStrings = [];
        var resultFunctions = [];
        var resultSlots = [];
        var resultVariables = [];
        var contexts = [
            this,
            neighborhoodDict,
            ruleDict,
            userParams || {}
        ];

        var evalInContexts =
            evalInContextsFunction(contexts);

        this.expandTemplate(
            neighborhoodFunctionTemplate,
            evalInContexts,
            resultStrings,
            resultFunctions,
            resultSlots,
            resultVariables);

        var neighborhoodFunctionText =
            resultStrings.join('');
        //LOG('neighborhoodFunctionText', '\n\n' + neighborhoodFunctionText + '\n');

        // Must put parens around the function to get eval to return
        // it, otherwise it's a statement that doesn't return a value,
        // apparently!
        var compiledNeighborhoodFunction =
            eval('(' + neighborhoodFunctionText + ')');
        //LOG('compiledNeighborhoodFunction', compiledNeighborhoodFunction);

        if (!compiledNeighborhoodFunction) {
            ERROR('Error evaluating neighborhoodFunctionText:', neighborhoodFunctionText);
            ruleDict.neighborhoodFunction = neighborhoodFunction;
            return neighborhoodFunction;
        }

        ruleDict.neighborhoodFunction = compiledNeighborhoodFunction;
        ruleDict.neighborhoodFunctionText = neighborhoodFunctionText;
        ruleDict.neighborhoodFunctionSlots = resultSlots;
        ruleDict.neighborhoodFunctionFunctions = resultFunctions;

        return compiledNeighborhoodFunction;
    };


    CAM6.prototype.compileTemplate = function compileTemplate(template, params) {

        template = '' + template;

        var strings =
            template.split(/\/\/[ ]*</);

        var output = [
            '<doc><![CDATA[',
            strings[0]
        ];

        for (var i = 1, n = strings.length;
             i < n;
             i++) {

            var string = strings[i];

            var tagRest = string.split('>');

            if (tagRest.length < 2) {
                ERROR('Failed to find end of tag:', ['String', string, 'tagRest', tagRest]);
                return null;
            }

            var tag = tagRest.shift();
            var rest = tagRest.join('>');

            tag = tag.replace(/^[\t ]*\/\/([\t ]*)/, '$1');

            output.push(']]><');
            output.push(tag);
            output.push('><![CDATA[');
            if (rest.length) {
                output.push(rest);
            }

        }

        output.push(']]></doc>');

        var xml = output.join('');

        //LOG('Parsing XML text:', xml);
        var doc = $.parseXML(xml);
        //LOG('Got XML document:', doc);

        var templateElement = doc && doc.firstChild;

        if (!templateElement) {
            ERROR('Error parsing xml for function template:', xml);
            return null;
        }

        var resultStrings = [];
        var resultFunctions = [];
        var resultSlots = [];
        var resultVariables = [];
        var contexts = [
            this,
            params
        ];

        var evalInContexts =
            evalInContextsFunction(contexts);

        this.expandTemplate(
            templateElement,
            evalInContexts,
            resultStrings,
            resultFunctions,
            resultSlots,
            resultVariables);

        var functionText =
            resultStrings.join('');
        //LOG('functionText', '\n\n' + functionText + '\n');

        // Must put parens around the function to get eval to return
        // it, otherwise it's a statement that doesn't return a value,
        // apparently!
        var compiledFunction =
            eval('(' + functionText + ')');
        //LOG('compiledFunction', compiledFunction);

        if (!compiledFunction) {
            ERROR('Error evaluating functionText:', functionText);
            return null;
        }

        return compiledFunction;
    };


    CAM6.prototype.expandTemplate = function expandTempalte(el, evalInContexts, resultStrings, resultFunctions, resultSlots, resultVariables) {

        var error = null;

        function expandNodes(el, resultStrings) {
            while (el) {
                this.expandTemplate(
                    el,
                    evalInContexts,
                    resultStrings,
                    resultFunctions,
                    resultSlots,
                    resultVariables);
                el = el.nextSibling;
            }
        }

        switch (el.nodeType) {

            case 1: // element

                var nodeName = el.nodeName;

                switch (nodeName) {

                    case 'doc':
                        expandNodes.call(this, el.firstChild, resultStrings);
                        break;

                    case 'function':

                        var functionName =
                            el.getAttribute('name') || 'anonymous';

                        var functionArgumentsString =
                            el.getAttribute('arguments') || '';

                        var functionArguments =
                            functionArgumentsString.split(/,[ \t]*/);

                        var functionDict = {
                            name: functionName,
                            arguments: functionArguments,
                            attributes: el.attributes
                        };

                        resultFunctions.push(functionDict);

                        expandNodes.call(this, el.firstChild, resultStrings);

                        break;

                    case 'slot':

                        var slotName = el.getAttribute('name') || 'anonymous';
                        var condition = true;
                        var test = el.getAttribute('test') || null;

                        //LOG('SLOT', slotName, test, el);
                        if (test) {
                            try {
                                condition = evalInContexts.call(this, test);
                                //LOG('SUCCESS', 'condition', condition);
                                error = null;
                            } catch (e) {
                                error = e;
                                ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', test]);
                            }
                        }

                        if (condition) {

                            function getInContexts(name) {
                                try {
                                    return evalInContexts.call(this, name);
                                } catch (e) {
                                    return null;
                                }
                            }

                            var slotDict = {
                                name:    slotName,
                                test:    test,
                                before:  getInContexts(slotName + '_before' ) || null,
                                after:   getInContexts(slotName + '_after'  ) || null,
                                filter:  getInContexts(slotName + '_filter' ) || null,
                                replace: getInContexts(slotName + '_replace') || null
                            };

                            if (slotDict.before) {

                                resultStrings.push(slotDict.before + '');

                            }

                            if (slotDict.replace) {

                                resultStrings.push(slotDict.replace);

                            } else if (slotDict.filter) {

                                var subResultStrings = [];

                                expandNodes.call(this, el.firstChild, subResultStrings);

                                var subResultString =
                                        subResultStrings.join('');

                                var filterResult =
                                    slotDict.filter.call(
                                        this,
                                        subResultString,
                                        contexts,
                                        resultStrings,
                                        resultFunctions,
                                        resultVariables);

                                if (filterResult) {
                                    resultStrings.push(filterResult | '');
                                }

                            } else {

                                expandNodes.call(this, el.firstChild, resultStrings);

                            }

                            if (slotDict.after) {
                                resultStrings.push(slotDict.after);
                            }

                        }

                        break;

                    case 'if':

                        var condition = false;
                        var test = el.getAttribute('test');

                        if (test) {
                            try {
                                condition = evalInContexts.call(this, test);
                                error = null;
                            } catch (e) {
                                error = e;
                                ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', test]);
                            }
                        }

                        if (condition) {
                            expandNodes.call(this, el.firstChild, resultStrings);
                        }

                        break;

                    case 'for':

                        var forDict = {
                            init: el.getAttribute('init') || null,
                            test: el.getAttribute('test') || null,
                            repeat: el.getAttribute('repeat') || null
                        };

                        if (forDict.init) {
                            try {
                                evalInContexts.call(this, forDict.init);
                                error = null;
                            } catch (e) {
                                error = e;
                                ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', forDict.init]);
                            }
                        }

                        while (true) {

                            expandNodes.call(this, el.firstChild, resultStrings);

                            var condition = true;

                            if (forDict.test) {
                                try {
                                    condition = evalInContexts.call(this, forDict.test);
                                    error = null;
                                } catch (e) {
                                    error = e;
                                    ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', forDict.test]);
                                }
                            }

                            if (!condition) {
                                break;
                            }

                            if (forDict.repeat) {
                                try {
                                    evalInContexts.call(this, forDict.repeat);
                                    error = null;
                                } catch (e) {
                                    error = e;
                                    ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', forDict.repeat]);
                                }
                            }

                        }

                        break;

                    case 'eval':
                    case 'exec':

                        var subResultStrings = [];

                        expandNodes.call(this, el.firstChild, subResultStrings);

                        var expression =
                            subResultStrings.join('');

                        if (expression) {

                            if (nodeName == 'exec') {
                                expression =
                                    '(function() {\n' +
                                    expression +
                                    '\n})()';
                            }

                            error = null;
                            try {
                                result = evalInContexts.call(this, expression);
                                error = null;
                            } catch (e) {
                                error = e;
                                ERR('Error evaluating JavaScript expression:', ['error', error, 'expression', expression]);
                            }

                            if (result) {
                                resultStrings.push('' + result);
                            }

                        }

                        break;

                    default:

                        ERR('Error with unexpected node name:', nodeName);

                        break;

                }

                break;

            case 4: // text

                var textContent = el.textContent;
                this.replaceTemplateVariables(
                    textContent,
                    evalInContexts,
                    resultStrings,
                    resultVariables);

                break;

        }

    };


    CAM6.prototype.replaceTemplateVariables = function replaceTemplateVariables(
        text,
        evalInContexts,
        resultStrings,
        resultVariables) {

        var strings = text.split('${');

        if (strings.length <= 1) {
            resultStrings.push(text);
            return;
        }

        if (strings[0].length) {
            results.push(strings[0]);
        }

        for (var i = 1, n = strings.length;
             i < n;
             i++) {

            var string = strings[i];
            var expressionRest = string.split('}', 1);
            if (expressionRest.length != 2) {
                ERR('Error parsing template subsitution expression:', string);
            } else {
                var expression = expressionRest[0];
                var rest = expressionRest[1];
                var result = expression;
                var error = null;

                try {
                    result = evalInContexts.call(this, expression);
                    error = null;
                } catch (e) {
                    error = e;
                    ERR('Error evaluating JavaScript expression:', e);
                }

                resultVariables.push({
                    expression: expression,
                    result: result,
                    error: error
                });

                resultStrings.push(result);
                resultStrings.push(rest);
            }

        }

    };


    // applyRule applies the rule to the cells.
    CAM6.prototype.applyRule = function applyRule() {

        if (this.paused) {
            return;
        }

        var userParams = {};
        var ruleDict = this.rule_by_symbol[this.ruleSymbol];
        var neighborhoodDict = this.get_neighborhood_by_symbol(ruleDict.neighborhood);
        var neighborhoodFunction = this.compileNeighborhoodFunction(neighborhoodDict, ruleDict, userParams);
        var stepsPerFrame = this.stepsPerFrame;

        if (stepsPerFrame < 1.0) {
            if ((stepsPerFrame == 0) ||
                (Math.random() >= stepsPerFrame)) {
                return;
            }
        }

        for (var frameStep = 0;
             frameStep < stepsPerFrame;
             frameStep++) {

            this.nextPhaseTime();
            this.wrapCells();

            neighborhoodFunction.call(
                this, neighborhoodDict, ruleDict);

            this.step++;
        }

    };


})();


////////////////////////////////////////////////////////////////////////
