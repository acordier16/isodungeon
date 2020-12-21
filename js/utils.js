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
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPV, " PV"));
    } else if (effect.deltaPV > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPV, " PV"));
    }
    if (effect.deltaPM < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPM, " PM"));
    } else if (effect.deltaPM > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPM, " PM"));
    }
    if (effect.deltaPA < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPA, " PA"));
    } else if (effect.deltaPA > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPA, " PA"));
    }
    if (effect.deltaPO < 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> loses ", -effect.deltaPO, " PO"));
    } else if (effect.deltaPO > 0) {
        addTextLineToConsole("".concat("<b>", entityName, "</b> wins ", effect.deltaPO, " PO"));
    }
};
