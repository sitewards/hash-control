# Hash Control

Little module that adds some abstraction around `window.location.hash`:

1. It structures the URL, supports boolean flags, integer and string values.
2. Parameters appear `/`-separated in the URL
3. Extension provides event-driven API


## Simple Example

```
    var oHashControl = new HashController(window);

    window.addEventListener('hashchange', function () {
        var sJobSectionName = oHashControl.getHashVar('job');
        changeApplicationState(sJobSectionName);
    });

    // ...
    oHashControl.setHashVar('job', 'js-developer');
```
