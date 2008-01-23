// Shuffle an array.
function fisherYates(myArray) {
    var i = myArray.length;
    if (i == 0) { return false; }
    while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = myArray[i];
        var tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
   }
}

// Given an array of arrays, returns a single array with elements
// from each array shuffled evenly into it.
// WARNING: This will destructively modify the matrix array.
// IMPORTANT: The order of elements in subarrays is preserved.
function evenShuffle(arrayOfArrays) {
    fisherYates(arrayOfArrays);

    var longestArrayLength = 0;
    var totalLength = 0;
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        if (arrayOfArrays[i].length > longestArrayLength)
            longestArrayLength = arrayOfArrays[i].length;
        totalLength += arrayOfArrays[i].length;
    }

    if (totalLength == 0) { return []; }

    var loopsPerIncrement = new Array(arrayOfArrays.length);
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        loopsPerIncrement[i] = (arrayOfArrays[i].length + 0.0) / (longestArrayLength + 0.0)
    }

    var indexArray = new Array(arrayOfArrays.length);
    for (var i = 0; i < indexArray.length; ++i) {
        indexArray[i] = 0.0;
    }

    var shuffledArray = new Array(totalLength);
    for (var idx = 0; idx < totalLength;) {
        for (var j = 0; j < arrayOfArrays.length; ++j) {
            var oldi = indexArray[j];
            var newi = oldi + loopsPerIncrement[j];
            if (Math.floor(oldi) != Math.floor(newi)) {
                if (oldi < arrayOfArrays[j].length) {
                    shuffledArray[idx] = arrayOfArrays[j][Math.floor(oldi)];
                    ++idx;
                    if (! (idx < totalLength)) {
                        break; // The outer loop will now exit too.
                    }
                }
            }
            indexArray[j] = newi;
        }
    }

    return shuffledArray;
}

function latinSquare(arrayOfArrays, counter, extras) {
    var groupSize = null;
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        if (groupSize == null) {
            groupSize = arrayOfArrays[i].length;
        }
        else if (groupSize != arrayOfArrays[i].length) {
            assert(false, "Inconsistent group sizes.");
        }
    }

    var idx = counter % groupSize;
    var a = new Array(arrayOfArrays.length);
    for (var i = 0; i < arrayOfArrays.length; ++i) {
        a[i] = arrayOfArrays[i][idx];
        ++idx;
        if (idx >= groupSize)
            idx = 0;
    }

    if (extras != null) { extras['groupSize'] = groupSize; }
    return a;
}

function mungGroups(sentenceArray, counter, extras) {
    var nulls = filter(function (e) { return e.group == null; }, sentenceArray);
    var grouped = filter(function (e) { return e.group != null; }, sentenceArray);

    var hash = new Hashtable();
    for (var i = 0; i < grouped.length; ++i) {
        if (hash.get(grouped[i].group) == undefined) {
            hash.put(grouped[i].group, [grouped[i]]);
        }
        else
            hash.get(grouped[i].group).push(grouped[i]);
    }
    // Flatten the hash.
    var flat = new Array();
    hash.moveFirst();
    while (hash.next()) {
        flat.push(hash.getValue());
    }
    var es = {};
    var ls = flat.length > 0 ? latinSquare(flat, counter, es) : [];
    if (extras != null) { extras['groupSize'] = es['groupSize']; }
    return nulls.concat(ls);
}

function anyType(x) { return true; }
function lessThan0(x) { return typeof(x) == "number" && x < 0 ;}
function greaterThan0(x) { return typeof(x) == "number" && x > 0; }
function equalTo0(x) { return typeof(x) == "number" && x == 0; }
function startsWith(k) {
    return function(s) {
        if (typeof(s) != "string")
            return false;
        else {
            // Avoid searching through the whole string in cases where
            // it's not necessary.
            if (s.length == 0 && k.length == 0)
                return true;
            else if (s.charAt(0) != k.charAt(0))
                return false;
            else
                return s.indexOf(k) == 0;
        }
    }
}
function endsWith(k) {
    return function(s) {
        if (typeof(s) != "string")
            return false;
        else {
            // Avoid searching through the whole string in cases where
            // it's not necessary.
            if (s.length == 0 && k.length == 0)
                return true;
            else if (s.charAt(s.length - 1) != k.charAt(k.length - 1))
                return false
            else {
                var i = s.indexOf(k);
                return k != -1 && i == s.length - k.length;
            }
        }
    }
}
function not(pred) {
    return function(k) { return ! pred(k); }
}

function Seq(args) {
    this.args = args;

    this.run = function(arrays) {
        var totLength = 0;
        for (var i = 0; i < arrays.length; ++i)
            totLength += arrays[i].length;
        var a = new Array(totLength);
        var count = 0;
        for (var i = 0; i < arrays.length; ++i) {
            for (var j = 0; j < arrays[i].length; ++j) {
                a[count] = arrays[i][j];
                ++count;
            }
        }
        return a;
    }
}
function seq() { return new Seq(seq.arguments); }
function Randomize(x) {
    this.args = [x];

    this.run = function(arrays) {
        fisherYates(arrays[0]);
        return arrays[0];
    }
}
function randomize(x) { return new Randomize(x); }
function Shuffle(args) {
    this.args = args;

    this.run = function(arrays) {
        return evenShuffle(arrays);
    }
}
function shuffle() { return new Shuffle(shuffle.arguments); }
function rshuffle() { return new Shuffle(map(randomize, rshuffle.arguments)); }
function SepWith(sep, main) {
    this.args = [sep,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Error in SepWith");
        var sep = arrays[0];
        var main = arrays[1];

        if (main.length <= 1)
            return main
        else {
            var newArray = [];
            var i;
            for (i = 0; i < main.length - 1; ++i) {
                newArray.push(main[i]);
                for (var j = 0; j < sep.length; ++j) {
                    newArray.push(sep[j]);
                }
            }
            newArray.push(main[i]);

            return newArray;
        }
    }
}
function sepWith(sep, main) { return new SepWith(sep, main); }

function toPredicate(v) {
    if (typeof(v) == "function") {
        return v;
    }
    /*else if (typeof(v) == "object") {
        return function(x) {
            for (var i = 0; i < v.length; ++i) {
                if (v[i] == x)
                    return true;
            }
            return false;
        }
    }*/
    else if (typeof(v) == "string" || typeof(v) == "number") {
        return function(x) { return x == v; }
    }
    else {
        assert(false, "Bad type for predicate in shuffle sequence");
    }
}

function runShuffleSequence(masterArray, ss) {
    assert(typeof(ss) == "object", "Bad shuffle sequence");

    var arrays = new Array();
    for (var i = 0; i < ss.args.length; ++i) {
        if (typeof(ss.args[i]) == "object") {
            arrays.push(runShuffleSequence(masterArray, ss.args[i]));
        }
        else {
            var pred = toPredicate(ss.args[i]);
            // [0] here because it's an item set, not an item (but all items
            // in the set will have the same type).
            var elems = filter(function (s) { return pred(s[0].type); }, masterArray);

            if (elems.length > 0)
                arrays.push(elems);
        }
    }

    if (arrays.length == 0)
        return []

    return ss.run(arrays);
}
