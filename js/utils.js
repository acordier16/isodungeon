// this file could be named "interface.js"
export var addTextLineToConsole = function (text) {
    var chat = document.getElementById("chat");
    chat.innerHTML = chat.innerHTML.concat(text.concat("<br>"));
    chat.scrollTop = chat.scrollHeight; // scroll down to bottom
};

// to display when applying action
// addActionTextLineToConsole ?
export var addActionTextLineToConsole = function () {};

export var addPositiveDurationEffectTextLineToConsole = function (effect, entityName) {
    if (effect.type == "definitive") {
        var endString = "".concat(" per turn for ", effect.duration, " turn(s).");
    } else if (effect.type == "temporary") {
        var endString = "".concat(" for ", effect.duration, " turn(s).");
    }

    if (effect.deltaPV < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will lose ", -effect.deltaPV, " PV", endString));
    } else if (effect.deltaPV > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will win ", effect.deltaPV, " PV", endString));
    }
    if (effect.deltaPM < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will lose ", -effect.deltaPM, " PM", endString));
    } else if (effect.deltaPM > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will win ", effect.deltaPM, " PM", endString));
    }
    if (effect.deltaPA < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will lose ", -effect.deltaPA, " PA", endString));
    } else if (effect.deltaPA > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will win ", effect.deltaPA, " PA", endString));
    }
    if (effect.deltaPO < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will lose ", -effect.deltaPO, " PO", endString));
    } else if (effect.deltaPO > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> will win ", effect.deltaPO, " PO", endString));
    }
};

export var addDefinitiveEffectTextLineToConsole = function (effect, entityName) {
    if (effect.deltaPV < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPV, " PV."));
    } else if (effect.deltaPV > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPV, " PV."));
    }
    if (effect.deltaPM < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPM, " PM."));
    } else if (effect.deltaPM > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPM, " PM."));
    }
    if (effect.deltaPA < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPA, " PA."));
    } else if (effect.deltaPA > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPA, " PA."));
    }
    if (effect.deltaPO < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPO, " PO."));
    } else if (effect.deltaPO > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPO, " PO."));
    }
};

export var displayEntityInfo = function (entity) {
    document.getElementById("console").innerHTML = "";
    if (entity != null) {
        // display entity info
        var entityStats = "".concat(
            "<div class='entity-info' style='font-size: 1em;'>",
            entity.name,
            "</div><div class='entity-info' style='font-size: 0.85em;'>",
            entity.PV,
            "/",
            entity.initialPV,
            " PV&nbsp;&nbsp;",
            entity.PA,
            "/",
            entity.initialPA,
            " PA&nbsp;&nbsp;",
            entity.PM,
            "/",
            entity.initialPM,
            " PM</span></div>"
        );

        // display entity effect info
        var effectStringForDelta = function (delta, pointName) {
            if (delta > 0) {
                return "".concat("+", delta, " ", pointName, ", ");
            } else if (delta < 0) {
                return "".concat(delta, " ", pointName, ", ");
            } else {
                return "";
            }
        };
        var entityEffectsStats = "";
        for (var i = 0; i < entity.effects.length; i++) {
            var effect = entity.effects[i];
            if (effect.type == "temporary") {
                var effectString = "<div class='entity-info'><span style='font-size: 0.85em;'>";
                effectString = effectString.concat(effectStringForDelta(effect.deltaPV, "PV"));
                effectString = effectString.concat(effectStringForDelta(effect.deltaPA, "PA"));
                effectString = effectString.concat(effectStringForDelta(effect.deltaPM, "PM"));
                effectString = effectString.concat(effectStringForDelta(effect.deltaPO, "PO"));
                effectString = effectString.slice(0, effectString.length - 2); // remove last comma and space
                effectString = effectString.concat(" (", effect.duration, " turn(s) left)");
                entityEffectsStats = entityEffectsStats.concat(effectString, "</span></div>");
            }
        }
        document.getElementById("console").innerHTML = entityStats.concat(entityEffectsStats);
    }
};

export var displayActionInfo = function (action) {
    document.getElementById("console").innerHTML = "";
    var actionText = "";
    actionText = actionText.concat("<div class='entity-info'>", action.name, "</div>");
    actionText = actionText.concat("<div class='entity-info' style='font-size: 0.7em'>", action.description, "</div>");
    actionText = actionText.concat(
        "<div class='entity-info' style='font-size: 0.7em'>Cost: ",
        action.costPA,
        " PA. Range: ",
        action.minPO,
        "-",
        action.maxPO,
        ".</div>"
    );
    document.getElementById("console").innerHTML = actionText;
};

// below could be the actual utils.js
