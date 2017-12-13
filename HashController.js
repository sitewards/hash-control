var HashController = function (oWindowObject) {
    this.oWindowObject   = oWindowObject;
    this.bSkipHashChange = false;
    this.oHashData       = {};
    this.sPrevHashValue  = this.oWindowObject.location.hash;

    this.oWindowObject.addEventListener('hashchange', this.hashChangeHandler.bind(this), false);

    var dataToggleTriggers = this.oWindowObject.document.querySelectorAll('[data-toggle-hash]');
    var oSelf              = this;
    dataToggleTriggers.forEach(function (oTriggerElement) {
        oTriggerElement.addEventListener('click', oSelf.processHashToggleClick.bind(this), false);
    });
    this.oWindowObject.dispatchEvent(new HashChangeEvent('hashchange', {
        target: this.oWindowObject,
        type: 'hashchange',
        bubbles: true,
        cancelable: true,
        oldURL: this.oWindowObject.location.hash,
        newURL: this.oWindowObject.location.hash
    }));
};

HashController.prototype = {
    /* methods */
    writeHash: function () {
        var sHash = "/";

        var bIsExpanded = false;
        var aHashPieces = [];
        for (var sKey in this.oHashData) {
            if (this.oHashData[sKey] === true) {
                bIsExpanded = true;
                aHashPieces.push([sKey, sKey]);
            } else if (this.oHashData[sKey] === false) {
                // just skip it
            } else {
                bIsExpanded = true;
                aHashPieces.push([sKey, sKey + '-' + this.oHashData[sKey]]);
            }
        }

        aHashPieces.sort(function (aA, aB) {
            var sA = aA[0];
            var sB = aB[0];

            return sA < sB ? -1 : (sA > sB ? 1 : 0);
        });

        for (var i = 0; i < aHashPieces.length; i++) {
            sHash += aHashPieces[i][1] + '/';
        }

        if (bIsExpanded || this.oWindowObject.location.hash !== '') {
            this.sPrevHashValue = this.oWindowObject.location.hash;
            if (!bIsExpanded) {
                this.oWindowObject.location.hash = '#/';
                /* for good browsers we remove the empty hash, the rest will still work with empty hash */
                if (typeof history.pushState !== 'undefined') {
                    var sHrefWithoutHash = window.location.href.replace(window.location.hash, '');
                    this.bSkipHashChange = false;
                    history.replaceState('', document.title, sHrefWithoutHash);
                }
            } else {
                this.oWindowObject.location.hash = sHash;
            }
        }
    },

    parseHash: function () {
        var oHashData = {};
        /* extracting hash fragments */
        var aHashArr = this.oWindowObject.location.hash.split('/');
        for (var i = 0; i < aHashArr.length; i++) {
            if ((aHashArr[i] === '') || (aHashArr[i] === '#')) {
                continue;
            }
            /* extracting key and optional value from the hash fragment */
            var oRegex   = /^([^\-_]+)([\-_](.*))?$/gi;
            var aMatches = oRegex.exec(aHashArr[i]);
            if (typeof aMatches[3] === 'undefined') {
                oHashData[aMatches[1]] = true;
            } else {
                oHashData[aMatches[1]] = aMatches[3];
            }
        }

        return oHashData;
    },

    setHashVar: function (sKey, mValue) {
        /* jshint -W116 */
        /* disabling the check of equals in the if */
        if (typeof mValue === 'undefined') {
            this.clearHashVar(sKey);
        } else if ((typeof this.oHashData[sKey] === 'undefined') || (this.oHashData[sKey] !== mValue)) {
            this.bSkipHashChange = true;
            this.oHashData[sKey] = mValue;
            this.writeHash();
            this.triggerHashChangeEvent();
        }
    },

    getHashVar: function (sKey) {
        return this.oHashData[sKey];
    },

    clearHashVar: function (sKey) {
        if (typeof this.oHashData[sKey] !== 'undefined') {
            this.bSkipHashChange = true;
            delete this.oHashData[sKey];
            this.writeHash();
            this.triggerHashChangeEvent();
        }
    },

    hashChangeHandler: function () {
        if (this.bSkipHashChange) {
            this.bSkipHashChange = false;
            return;
        }
        var oNewHashData = this.parseHash();
        var bHashChanged = false;
        for (var sKey in oNewHashData) {
            if (!this.oHashData.hasOwnProperty(sKey)) {
                bHashChanged = true;
                break;
            } else if (this.oHashData[sKey] !== oNewHashData[sKey]) {
                bHashChanged = true;
                break;
            }
        }
        for (sKey in this.oHashData) {
            if (!oNewHashData.hasOwnProperty(sKey)) {
                bHashChanged = true;
                break;
            }
        }
        if (bHashChanged) {
            this.oHashData = oNewHashData;
            this.triggerHashChangeEvent();
        }
    },

    triggerHashChangeEvent: function () {
        var oSelf = this;
        setTimeout(function () {
            oSelf.oWindowObject.dispatchEvent(new HashChangeEvent('hashchange', {
                target: oSelf.oWindowObject,
                type: 'hashchange',
                bubbles: true,
                cancelable: true,
                oldURL: oSelf.sPrevHashValue,
                newURL: oSelf.oWindowObject.location.hash
            }));
        }, 0);
    },

    /* processing hash toggle */
    processHashToggleClick: function () {
        var sTargetKey   = this.getAttribute('data-toggle-hash');
        var sExcludeKeys = this.getAttribute('data-exclude-hash');
        var aExcludeKeys = sExcludeKeys ? sExcludeKeys.split(',') : [];
        if (this.oHashData.hasOwnProperty(sTargetKey)) {
            this.clearHashVar(sTargetKey);
        } else {
            this.bSkipHashChange       = true;
            this.oHashData[sTargetKey] = true;
            for (var i = 0; i < aExcludeKeys.length; i++) {
                delete this.oHashData[aExcludeKeys[i]];
            }
            this.writeHash();
            this.triggerHashChangeEvent();
        }
    }
};
