////////////////////////////////////////////////////////////////////////
//
// CAMCore.js
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
//   edge treatmens can be applied besides wrapping, like clamping or
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


    function seedRandom(seed) {
        Math.seedrandom(seed);
    }


    function getRandom() {
        return Math.random();
    }


    // shave rounds a number to a reasonable accuracy.
    function shave(value) {
        return Math.floor(value * 1000) / 1000;
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
    // The CAMCore class is the cellular automata simulation engine, all
    // around God Object, and Kitchen Sink Repository.


    // CAMCore class constructor function, called like:
    // var cam6 = new CAMCore(params};
    window.CAMCore = function CAMCore(params) {

        // This just initializes instance variables to their default
        // values and resets params.
        this.init();

        // Now we set params to what was passed in (or an empty dict).
        // Then initFromParams will be called later by startup.
        this.params = params || {};

        return this;
    };


    ////////////////////////////////////////////////////////////////////////
    // Type definitions for CAMCore.prototype.


    ////////////////////////////////////////////////////////////////////////
    // The paramMetaData type, that describes all the parameters.


    // paramUsedByCurrentTool is a condition that returns true if
    // paramMetaData's parameter is used by the current tool. Must be
    // called with this of a CAMCore instance.
    function paramUsedByCurrentTool(paramMetaData) {

        var paramsUsed = this.tool_by_symbol[this.toolSymbol].paramsUsed;

        return paramsUsed && paramMetaData.param in paramsUsed;

    }


    // paramUsedByCurrentRule is a condition that returns true if
    // paramMetaData's parameter is used by the current rule. Must be
    // called with this of a CAMCore instance.
    function paramUsedByCurrentRule(paramMetaData) {

        var paramsUsed = this.rule_by_symbol[this.ruleSymbol].paramsUsed;

        return paramsUsed && paramMetaData.param in paramsUsed;

    }


    CAMCore.prototype.camParams = {
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
        step: true
    };


    CAMCore.prototype.toolParams = {
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
        toolLineCapSymbol: true
    };


    CAMCore.prototype.ruleParams = {
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


    defineType(
        'paramMetaData',
        CAMCore.prototype,
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
                param: 'randomSeed',
                name: 'Random Seed',
                description: 'This seeds the random number generator.',
                type: 'string',
                scopes: ['cam'],
                recordable: true,
                setValueFunction: function setValueFunction(paramMetaData, target, paramKey, paramValue, previousParamValue) {
                    target[paramKey] = paramValue;
                    seedRandom(paramValue);
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
        CAMCore.prototype,
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
                        error = Math.floor(getRandom() * this.randomizeError);
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
                    error = Math.floor(getRandom() * this.randomizeError);

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
                    error = Math.floor(getRandom() * this.randomizeError);

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
                    error = Math.floor(getRandom() * this.randomizeError);

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
                    error = Math.floor(getRandom() * this.randomizeError);

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
                    error = Math.floor(getRandom() * this.randomizeError);

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
        CAMCore.prototype,
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
    CAMCore.prototype.defaultColors = [
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
    CAMCore.prototype.defaultSpecialColors = {
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
                Math.floor(getRandom() * 256),
                Math.floor(getRandom() * 256),
                Math.floor(getRandom() * 256),
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
        var defaultColors = colorMapDict.defaultColors || CAMCore.prototype.defaultColors;
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
        CAMCore.prototype,
        null,
        ['symbol'],
        [
            {
                symbol: 'default',
                name: 'Default',
                description: 'Default color map.',
                handleIndexGetFunction: handleIndexGetFunction_colorMap_default,
                defaultColors: CAMCore.prototype.defaultColors,
                specialColors: CAMCore.prototype.defaultSpecialColors,
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
                defaultColors: CAMCore.prototype.defaultColors,
                specialColors: CAMCore.prototype.defaultSpecialColors,
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
        CAMCore.prototype,
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

                        var x = x0 + Math.floor(getRandom() * toolSize);
                        var y = y0 + Math.floor(getRandom() * toolSize);

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

                        var x = x0 + Math.floor(getRandom() * toolSize);
                        var y = y0 + Math.floor(getRandom() * toolSize);

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

                        var x = x0 + Math.floor(getRandom() * toolSize);
                        var y = y0 + Math.floor(getRandom() * toolSize);

                        if ((x >= 0) && (x < this.cellWidth) &&
                            (y >= 0) && (y < this.cellHeight)) {

                            var cellIndex =
                                (x + 1) +
                                ((y + 1) * this.cellBufferWidth);

                            var cellValue =
                                toolCellMin +
                                Math.floor(getRandom() * toolCellRange);

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

                        var x = x0 + Math.floor(getRandom() * toolSize);
                        var y = y0 + Math.floor(getRandom() * toolSize);

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
                                    Math.floor(getRandom() * toolCellRange);

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
                        ((getRandom() < volumeLeftover) ? 1 : 0);

                    for (var pass = 0;
                         pass < toolVolume;
                         pass++) {

                        var dx =
                            (getRandom() < 0.5) ? -1 : 1;
                        var dy =
                            (getRandom() < 0.5) ? -1 : 1;

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
                        var grainX = 1 + Math.floor(getRandom() * grainRange);
                        var grainY = 1 + Math.floor(getRandom() * grainRange);

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
    // The command type.


    defineType(
        'command',
        CAMCore.prototype,
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
                        proxy(function() {
                                this.fullScreenMode();
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
                        proxy(function() {
                                this.windowMode();
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
            }

        ]);


    ////////////////////////////////////////////////////////////////////////
    // The compositionFunction type.


    defineType(
        'compositionFunction',
        CAMCore.prototype,
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
    // The lineCap type.


    defineType(
        'lineCap',
        CAMCore.prototype,
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
        CAMCore.prototype,
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
        CAMCore.prototype,
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
    // Class variables.


    // Anisotropic convolution kernels, used in the ruleKernels by the
    // Marble neighborhood. Each kernel must add up to 16.
    CAMCore.prototype.kernels = {
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
    // CAMCore instance methods.


    // init just sets everything to its default value, regardless of
    // the params, which it resets. It should not do much else.
    CAMCore.prototype.init = function init() {

        // Default configured parameters.
        this.params = {};

        // jQuery DOM objects.
        this.$document = null;
        this.$root = null;
        this.$cellCanvasContainer = null;
        this.$cellCanvas = null;
        this.$compositionOverlay = null;
        this.$feedbackOverlay = null;
        this.$histogramCanvasContainer = null;
        this.$histogramCanvas = null;

        this.cellWidth = 256;
        this.cellHeight = 256;
        this.cellGutter = 1;
        this.tileScale = 16;
        this.cellCanvasScale = 2;
        this.histogramCanvasScale = 2;
        this.doCellCanvas = true;
        this.doHistogram = true;
        this.histogramToolCellHeight = 5;
        this.histogramHeaderHeight = 5;
        this.histogramGraphHeight = 30;
        this.randomizeError = 0;
        this.spinScanOrder = true;
        this.invertPhaseIfCellBit80Set = false;

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
        this.randomSeed = '' + getRandom(); // XXX: Why is this a string?!
        this.phaseTime = 0;
        this.step = 0;

        // Runtime variables.
        this.histogram = null;
        this.cellCanvasContext = null;
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
        this.activeTools = [];
        this.userTools = {};

    };


    // startup starts the simulation by initializing everything, creating
    // the user interface, and starting the animation timer.
    CAMCore.prototype.startup = function startup() {
        this.makeGUI();
        this.initFromParams();
        this.startupFinish();
    };


    // makegGUI makes the user interface for editing the parameters.
    CAMCore.prototype.makeGUI = function makeGUI() {

        this.$document =
            $(document);

        this.$root =
            $('<div/>')
                .appendTo($(document.body));

        this.$cellCanvasContainer =
            $('<div/>')
                .addClass('cam6-cellCanvasContainer')
                .appendTo(this.$root);

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

        this.$histogramCanvasContainer =
            $('<canvas/>')
                .addClass('cam6-histogramCanvasContainer')
                .appendTo(this.$root);

        this.$histogramCanvas =
            $('<canvas/>')
                .addClass('cam6-histogramCanvas')
                .appendTo(this.$histogramCanvasContainer);

    };

    CAMCore.prototype.startupFinish = function startupFinish() {
    
        this.makeCells();
        this.makeHistogram();
        this.initCanvas();
        this.initHistogram();
        this.randomizeCells();

        this.paused = false;
        this.scheduleTick();
    };


    // initFromParams initializes the simulator engine from the parameters
    // dictionary.
    CAMCore.prototype.initFromParams = function initFromParams() {

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

    };


    // setValue sets the param named by key to the given paramValue,
    // by calling the metadata's setValueFunction if defined, or
    // otherwise just setting it manually. It also records the
    // parameter change in the script if we're recording, and notifies
    // the user interface that the key value has changed.
    CAMCore.prototype.setValue = function setValue(target, key, paramValue) {

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

        }

    };


    // scriptRecordStart starts recording a new script.
    CAMCore.prototype.scriptRecordStart = function scriptRecordStart() {

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
    };


    // scriptRecordStop stops recording a new script.
    CAMCore.prototype.scriptRecordStop = function scriptRecordStop() {

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

    };


    // scriptPlayStart starts playing the current script.
    CAMCore.prototype.scriptPlayStart = function scriptPlayStart() {
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
    };


    // scriptPlayStop stops playing the current script.
    CAMCore.prototype.scriptPlayStop = function scriptPlayStop() {
        this.scriptPlaying = false;
    };


    // playScript plays the script, if playing.
    CAMCore.prototype.playScript = function playScript() {

        if (this.paused || !this.scriptPlaying) {
            return;
        }

        if (!this.scriptPlayingScript) {
            this.scriptPlaying = false;
            return;
        }

        switch (this.playModeSymbol) {

            case 'forwardStop':

                if (this.playSpeed < 0) {
                    this.setValue(this, 'playSpeed', -this.playSpeed);
                }

                if (this.scriptPlayingIndex >= this.scriptPlayingScript.length) {
                    this.scriptPlaying = false;
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

    };


    // playScriptDict plays the given script dictionary now.
    CAMCore.prototype.playScriptDict = function playScriptDict(scriptDict) {

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
    CAMCore.prototype.playParams = function playParams(target, params) {

        var target = this; // TODO

        for (var key in params) {
            var value = params[key];
            this.setValue(target, key, value);
        }

    };


    // playCells plays a cells dictionary.
    CAMCore.prototype.playCells = function playCells(params) {

        var cellWidth = params.cellWidth;
        var cellHeight = params.cellHeight;
        var cellData = params.cellData;

        this.setCells(cellData, cellWidth, cellHeight);

    };


    // playCommand plays a command dictionary and parameters.
    CAMCore.prototype.playCommand = function playCommand(commandDict, params) {

        if (params.randomSeed) {
            this.randomSeed = params.randomSeed;
            seedRandom(params.randomSeed);
        }

        commandDict.commandFunction.call(
            this, commandDict, params);

    };


    // recordCommand records the command, if recording a script.
    CAMCore.prototype.recordCommand = function recordCommand(commandDict, params) {

        if (!this.scriptRecording ||
            !commandDict.recordable) {
            return;
        }

        this.scriptRecordingScript.push(
            {
                step: this.step - this.scriptRecordingStartStep,
                scriptType: 'command',
                commandSymbol: commandDict.symbol,
                params: Object.assign({}, params)
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
    // recording both old and new params is so we can play scripts
    // backwards. When we take snapshots of all the parameters at the
    // beginning and end of a script, we want the oldParams and
    // newParams to be the same, since we bounce against those
    // endpoint states when playing a script back and forth.
    CAMCore.prototype.recordParams = function recordParams(target, newParams, oldParams) {

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
            newParams: Object.assign({}, newParams),
            oldParams: Object.assign({}, oldParams)
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded params:', ['step', this.step, 'target', target, 'newParams', newParams, 'oldParams', oldParams, 'scriptDict', scriptDict]);

    };


    // recordCells records the cells, if recording a script.
    CAMCore.prototype.recordCells = function recordCells() {

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
    CAMCore.prototype.scriptSave = function scriptSave() {

        if (!this.scriptPlayingScript ||
            !this.scriptPlayingScript.length) {
            alert('There is no script to save! Try recording something.');
            return;
        }

        var scriptName =
            prompt('What do you want to call this script?');

        if (!scriptName ||
            scriptName == '') {
            return;
        }

        //LOG('scriptSave', ['scriptName', scriptName, 'scriptPlayingScript', this.scriptPlayingScript]);

        alert('Sorry, but saving is not implemented yet! Come back soon!');
    };


    // scriptLoad loads a script.
    CAMCore.prototype.scriptLoad = function scriptLoad() {

        // TODO

    };


    // initCanvas initializes the canvas.
    CAMCore.prototype.initCanvas = function initCanvas() {

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
                    proxy(this.trackCellCanvasDown, this))
                .on('mousemove.cells',
                    proxy(this.trackCellCanvasMove, this))
                .on('mousewheel.cells',
                    proxy(this.trackCellCanvasWheel, this));

            this.compositionOverlayContext =
                this.$compositionOverlay[0].getContext('2d');

            this.feedbackOverlayContext =
                this.$feedbackOverlay[0].getContext('2d');

        }

    };


    // scaleCanvasToWindow sets the scale of the canvas to the window size.
    CAMCore.prototype.scaleCanvasToWindow = function scaleCanvasToWindow() {

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.scaleCanvas();
        this.scaleHistogram();

        // Must call tick to refresh if paused.
        // This gets called on startup before the cells are defined, so be careful!
        if (this.paused && this.cells0) {
            this.tick();
        }
    };


    // scaleCanvas sets the scale of the canvas.
    CAMCore.prototype.scaleCanvas = function scaleCanvas() {

        var width = this.cellWidth * this.cellCanvasScale;
        var height = this.cellHeight * this.cellCanvasScale;

        this.$cellCanvasContainer
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

    };


    // trackCellCanvasWheel trackes the mouse wheel.
    CAMCore.prototype.trackCellCanvasWheel = function trackCellCanvasWheel(event, delta, deltaX, deltaY) {
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
    CAMCore.prototype.trackCellCanvasDown = function trackCellCanvasDown(event) {

        //LOG("trackCellCanvasDown", event);

        event.stopPropagation();
        event.preventDefault();

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
                proxy(this.trackCellCanvasDrag, this))
            .on('mouseup.cells',
                proxy(this.trackCellCanvasUp, this));

        //LOG("trackCellCanvasDown started tracking", this, activeToolDict);

        if (this.paused) {
            this.tick();
        }

    };


    // trackCellCanvasDrag tracks a mouse move event.
    CAMCore.prototype.trackCellCanvasDrag = function trackCellCanvasDrag(event) {

        //LOG("trackCellCanvasDrag", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackCellCanvasMoveSub(event);

        if (this.paused) {
            this.tick();
        }

    };


    // trackCellCanvasMove tracks a mouse move event.
    CAMCore.prototype.trackCellCanvasMove = function trackCellCanvasMove(event) {

        //LOG("trackCellCanvasMove", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackCellCanvasMoveSub(event);

    };


    // trackCellCanvasMoveSub tracks a mouse move event.
    CAMCore.prototype.trackCellCanvasMoveSub = function trackCellCanvasMoveSub(event) {

        var offset = this.$cellCanvas.offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;

        this.setValue(this, 'mouseX', Math.floor(x / this.cellCanvasScale));
        this.setValue(this, 'mouseY', Math.floor(y / this.cellCanvasScale));

        //console.log("trackCellCanvasMoveSub", "mouse", this.mouseX, this.mouseY, "offset", offset, offset.left, offset.top, "x", x, "y", y, "event", event, "$cellCanvas", this.$cellCanvas, this.$cellCanvas[0]);

    };


    // trackCellCanvasUp tracks a mouse up event.
    CAMCore.prototype.trackCellCanvasUp = function trackCellCanvasUp(event) {

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
                proxy(this.trackCellCanvasMove, this);

        if (this.paused) {
            this.tick();
        }

    };


    // initHistogram initializes the histogram.
    CAMCore.prototype.initHistogram = function initHistogram() {

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
                    proxy(this.trackHistogramCanvasDown, this))
                .on('mousewheel.histogram',
                    proxy(this.trackHistogramCanvasWheel, this));

        }

    };


    CAMCore.prototype.scaleHistogram = function scaleHistogram() {

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
            this.$histogramCanvasContainer.show();
        } else {
            this.$histogramCanvasContainer.hide();
        }

    };


    // trackHistogramCanvasWheel trackes the mouse wheel.
    CAMCore.prototype.trackHistogramCanvasWheel = function trackHistogramCanvasWheel(event, delta, deltaX, deltaY) {
        event.stopPropagation();
        event.preventDefault();
        this.trackCellCanvasWheel(event, delta, deltaX, deltaY);
    };


    // trackHistogramCanvasDown tracks a mouse down event.
    CAMCore.prototype.trackHistogramCanvasDown = function trackHistogramCanvasDown(event) {

        //LOG("trackHistogramCanvasDown", event);

        event.stopPropagation();
        event.preventDefault();

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
                proxy(this.trackHistogramCanvasDrag, this))
            .on('mouseup.histogram',
                proxy(this.trackHistogramCanvasUp, this));

        if (this.paused) {
            this.tick();
        }

    };


    // trackHistogramCanvasDrag tracks a mouse move event.
    CAMCore.prototype.trackHistogramCanvasDrag = function trackHistogramCanvasDrag(event) {

        LOG("trackHistogramCanvasDrag", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackHistogramCanvasMoveSub(event);

        if (this.paused) {
            this.tick();
        }

    };


    // trackHistogramCanvasMove tracks a mouse move event.
    CAMCore.prototype.trackHistogramCanvasMove = function trackHistogramCanvasMove(event) {

        //LOG("trackHistogramCanvasMove", event);

        event.stopPropagation();
        event.preventDefault();

        this.trackHistogramCanvasMoveSub(event);

    };


    // trackHistogramCanvasMoveSub tracks a mouse move event.
    CAMCore.prototype.trackHistogramCanvasMoveSub = function trackHistogramCanvasMoveSub(event) {

        var offset = this.$histogramCanvas.offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;

        this.setValue(this, 'histogramMouseX', Math.floor(x / this.histogramCanvasScale));
        this.setValue(this, 'histogramMouseY', Math.floor(y / this.histogramCanvasScale));

    };


    // trackHistogramCanvasUp tracks a mouse up event.
    CAMCore.prototype.trackHistogramCanvasUp = function trackHistogramCanvasUp(event) {

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


    // getColorMap returns the current color map.
    CAMCore.prototype.getColorMap = function getColorMap() {

        var colorMapDict =
            this.get_colorMap_by_symbol(
                this.colorMapSymbol);

        return colorMapDict.colorMap;
    };


    // makeCells makes the buffers for the cells.
    CAMCore.prototype.makeCells = function makeCells() {

        this.cellBufferWidth = this.cellWidth + (2 * this.cellGutter);
        this.cellBufferHeight = this.cellHeight + (2 * this.cellGutter);
        this.cellBufferSize = this.cellBufferWidth * this.cellBufferHeight;
        this.cells0 = new Uint8Array(new ArrayBuffer(this.cellBufferSize));
        this.cells1 = new Uint8Array(new ArrayBuffer(this.cellBufferSize));

    };


    // setCells sets the cells width, height and data.
    CAMCore.prototype.setCells = function setCells(cellData, cellWidth, cellHeight) {

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
    CAMCore.prototype.getCellData = function getCellData(cellData, cellWidth, cellHeight) {

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
    CAMCore.prototype.makeHistogram = function makeHistogram() {

        if (this.doHistogram) {
            this.histogram = new Uint32Array(new ArrayBuffer(256 * 4));
        }

    };


    // full screen mode.
    CAMCore.prototype.fullScreenMode = function fullScreenMode() {

        if (this.fullScreen) {
            return;
        }

        this.fullScreen = true;

        var el = window.body;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }

    };


    // window mode.
    CAMCore.prototype.windowMode = function windowMode() {

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
    CAMCore.prototype.pause = function pause() {

        if (this.animationTimer !== null) {
            clearTimeout(
                this.animationTimer);
            this.animationTimer = null;
        }

        this.paused = true;

        this.updateCommands();
    };


    // resume resumes the simulation.
    CAMCore.prototype.resume = function resume() {

        if (!this.paused) {
            return;
        }

        this.paused = false;

        this.scheduleTick();

        this.updateCommands();
    };


    // scheduleTick schedules an animation timer tick.
    CAMCore.prototype.scheduleTick = function scheduleTick() {

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
                proxy(this.tick, this),
                this.animationDelay);

    };


    // tick performs and renders the simulation.
    CAMCore.prototype.tick = function tick() {

        this.applyRule();
        this.playScript();
        this.trackHistogram();
        this.applyTools();
        this.wrapCells();
        this.updateParams();
        this.renderCells();
        this.renderHistogram();
        this.glRender();
        this.scheduleTick();

    };


    // nextPhaseTime toggles the phaseTime.
    CAMCore.prototype.nextPhaseTime = function nextPhaseTime() {
        this.phaseTime = this.phaseTime ? 0 : 1;
    };


    // getCells returns the current cells.
    CAMCore.prototype.getCells = function getCells() {
        return this.phaseTime
            ? this.cells1
            : this.cells0;
    };


    // getNextCells returns the next cells.
    CAMCore.prototype.getNextCells = function getNextCells() {
        return this.phaseTime
            ? this.cells0
            : this.cells1;
    };


    CAMCore.prototype.updateParams = function updateParams() {

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
    CAMCore.prototype.renderCells = function renderCells() {

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
    CAMCore.prototype.renderHistogram = function renderHistogram() {

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
    CAMCore.prototype.randomizeCells = function randomizeCells() {

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

                var cell = Math.floor(getRandom() * 256);

                cells[cellIndex] = cell;
                cellIndex++;

            }

            cellIndex += 2;

        }

        this.wrapCells();
    };


    // initCells initializes the cell values.
    CAMCore.prototype.initCells = function initCells() {

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
    CAMCore.prototype.clearCells = function clearCells() {
        this.setCellsValue(0);
    };


    CAMCore.prototype.initializeCellsTemplate = function initializeCellsTemplate(code) {
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
    CAMCore.prototype.setCellsValue = function setCellsValue(value) {

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

            cellIndex += cellGutter;

        }

        this.wrapCells();
    };


    // wrapCells wraps the cell edges.
    CAMCore.prototype.wrapCells = function wrapCells() {

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
    CAMCore.prototype.newRandomSeed = function newRandomSeed() {
        var seed = seedRandom();
        this.randomSeed = seed;
        return seed;
    };


    // initActiveTool initializes the active tool, by setting up its initial parameters.
    CAMCore.prototype.initActiveTool = function initActiveTool(activeToolDict) {

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
    CAMCore.prototype.addActiveTool = function addActiveTool(activeToolDict, channel, layer) {
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
    CAMCore.prototype.removeActiveTool = function removeActiveTool(activeToolSymbol, channel, count) {

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
    CAMCore.prototype.trackHistogram = function trackHistogram() {

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
    CAMCore.prototype.applyTools = function applyTools() {

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
    CAMCore.prototype.playTool = function playTool(activeToolDict) {

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
    CAMCore.prototype.compositionOverlayToCells = function compositionOverlayToCells(toolDict, activeToolDict, cells) {

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
    CAMCore.prototype.clearCompositionOverlay = function clearCompositionOverlay() {

        this.compositionOverlayContext.clearRect(
            0, 0, this.cellWidth, this.cellHeight);

    };


    // clearFeedbackOverlay clears the feedback overlay.
    CAMCore.prototype.clearFeedbackOverlay = function clearFeedbackOverlay() {

        this.feedbackOverlayContext.clearRect(
            0, 0, this.cellWidth, this.cellHeight);

    };


    // recordTool records the tool, if recording a script.
    CAMCore.prototype.recordTool = function recordTool(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = Object.assign({}, activeToolDict);

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'tool',
            activeToolDict: activeToolDictCopy
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded tool:', ['step', this.step, 'symbol', toolDict.symbol, 'mouseX', activeToolDict.mouseX, 'mouseY', activeToolDict.mouseY, 'activeToolDict', activeToolDict, 'scriptDict', scriptDict]);

    };


    // recordToolBegin records the tool begin, if recording a script.
    CAMCore.prototype.recordToolBegin = function recordToolBegin(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = Object.assign({}, activeToolDict);

        var scriptDict = {
            step: this.step - this.scriptRecordingStartStep,
            scriptType: 'toolBegin',
            activeToolDict: activeToolDictCopy
        };

        this.scriptRecordingScript.push(scriptDict);

        //LOG('Script recorded tool begin:', ['step', this.step, 'toolSymbol', toolDict.toolSymbol, 'scriptDict', scriptDict]);

    };


    // recordToolEnd records the tool end, if recording a script.
    CAMCore.prototype.recordToolEnd = function recordToolEnd(toolDict, activeToolDict) {

        if (!this.scriptRecording) {
            return;
        }

        var activeToolDictCopy = Object.assign({}, activeToolDict);

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
    CAMCore.prototype.wraplicateTool = function wraplicateTool(toolDict, activeToolDict, cells) {

        var activeToolDictCopy = Object.assign({}, activeToolDict);

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
    CAMCore.prototype.compileRule = function compileRule(ruleDict) {

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
        return null;
    }


    CAMCore.prototype.compileNeighborhoodFunction = function compileNeighborhoodFunction(neighborhoodDict, ruleDict, userParams) {

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


    CAMCore.prototype.compileTemplate = function compileTemplate(template, params) {

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


    CAMCore.prototype.expandTemplate = function expandTempalte(el, evalInContexts, resultStrings, resultFunctions, resultSlots, resultVariables) {

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


    CAMCore.prototype.replaceTemplateVariables = function replaceTemplateVariables(
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
    CAMCore.prototype.applyRule = function applyRule() {

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
                (getRandom() >= stepsPerFrame)) {
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
