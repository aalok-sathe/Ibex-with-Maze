VBox.obligatory = ["children", "triggers"]

function VBox(div, options, finishedCallback, utils) {
    this.name = options.dget("name", "VBox");

    this.options = options;
    this.children = options.get("children");
    this.triggers = options.get("triggers");
    this.padding = options.dget("padding", "2em");

    assert_is_arraylike(this.children, "The 'children' option of VBox must be an array");
    assert(this.children.length % 2 == 0, "The 'children' array for VBox must contain an even number of elements");

    assert_is_arraylike(this.triggers, "The 'triggers' option of VBox must be an array");
    assert(this.triggers.length > 0, "The 'triggers' array for VBox must be an array of length > 0");

    var t = this;
    iter(this.triggers, function (tr) {
        assert(typeof(tr) == "number", "The 'triggers' array for VBox must be an array of integers");
        assert(tr >= 0 && tr < t.children.length / 2,
               "Numbers in the 'triggers' array must be indices into the 'children' array starting from 0");
    });

    this.childInstances = [];
    this.childUtils = [];
    for (var i = 0; i < this.children.length; i += 2) {
        var controllerClass = this.children[i];
        var childOptions = this.children[i + 1];
        var childOptionsHash = flat_alist_to_hash(
            "Error: options array containing an odd number of elements in VBox",
            childOptions
        );
        childOptionsHash.add(get_defaults_for(controllerClass));

        var d = document.createElement("p");
        d.style.clear = "both";

        // Add padding if requested.
        if (this.padding && i > 0) {
            var dd = d;
            dd = document.createElement("div");
            dd.style.height = this.padding;
            dd.style.marginTop = 0;
            dd.style.marginBottom = 0;
            div.appendChild(dd);
        }

        // Add the actual child.
        div.appendChild(d);    

        var u = new Utils(utils.getValuesFromPreviousItem());
        this.childUtils.push(u);
        var l = this.childUtils.length - 1;
        var t = this;
        // Get around Java's silly closure capture behavior (deriving
        // from weird variable scoping rules).
        // See http://calculist.blogspot.com/2005/12/gotcha-gotcha.html
        (function(l) {
            t.childInstances.push(
                new controllerClass(
                    d,
                    childOptionsHash,
                    function (r) { t.myFinishedCallback(l, r); },
                    u
                )
            );
        })(l);
    }

    this.handleKey = function(code, time) {
        iter(this.childInstances, function (c) {
            if (c.handleKey)
                c.handleKey(code, time);
        });
    }

    this.indicesAndResultsOfThingsThatHaveFinished = [];

    this.myFinishedCallback = function(index, results) {
        this.childUtils[index].gc();
        this.indicesAndResultsOfThingsThatHaveFinished.push([index, results]);

        var satisfied = true;
        for (var i = 0; i < this.triggers.length; ++i) {
            var foundIt = false;
            for (var j = 0; j < this.indicesAndResultsOfThingsThatHaveFinished.length; ++j) {
                if (this.indicesAndResultsOfThingsThatHaveFinished[j][0] == this.triggers[i]) {
                    foundIt = true;
                    break;
                }
            }
            if (! foundIt) {
                satisfied = false;
                break;
            }
        }

        if (satisfied) {
            finishedCallback(this.concatResults(this.indicesAndResultsOfThingsThatHaveFinished));
        }
    }

    this.concatResults = function(iar) {
        iar.sort(function(x, y) { return x[0] < y[0]; });
        var res = [];
        for (var i = 0; i < iar.length; ++i) {
            for (var j = 0; j < iar[i][1].length; ++j) {
                var line = [i];
                for (var k = 0; k < iar[i][1][j].length; ++k)
                    line.push(iar[i][1][j][k]);
                res.push(line);
            }
        }
        return res;
    }
}
