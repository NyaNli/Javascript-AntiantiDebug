(function(){
    var antiantidebug = function(){
        // var _eval = window.eval;
        // window.eval = function(x) {return _eval(x.replace(/debugger/g,';'))};

        var consoleHook = function(_args, _func) {
            var args = [];
            for (i in _args) {
                if (_args[i] instanceof HTMLElement && (Object.getOwnPropertyDescriptor(_args[i], 'nodeName') != null || Object.getOwnPropertyDescriptor(_args[i], 'id') != null || Object.getOwnPropertyDescriptor(_args[i], 'className') != null)) {
                    var func = null;
                    if (Object.getOwnPropertyDescriptor(_args[i], 'nodeName') != null)
                        func = Object.getOwnPropertyDescriptor(_args[i], 'nodeName').get;
                    else if (Object.getOwnPropertyDescriptor(_args[i], 'id') != null)
                        func = Object.getOwnPropertyDescriptor(_args[i], 'id').get;
                    else
                        func = Object.getOwnPropertyDescriptor(_args[i], 'className').get;
                    console.debug('Forbided console HTMLElement function: \n' + Object.toString.apply(func));
                    args.push('[Blocked HTMLElement]');
                } else
                    args.push(_args[i]);
            }
            _func.apply(null, args);
        }

        var _log = console.log;
        console.log = function() {consoleHook(arguments, _log)};

        var _info = console.info;
        console.info = function() {consoleHook(arguments, _info)};

        var _debug = console.debug;
        console.debug = function() {consoleHook(arguments, _debug)};

        var _error = console.error;
        console.error = function() {consoleHook(arguments, _error)};

        var intervalBanList = [];
        if (localStorage['_intervalBanList'])
            intervalBanList = JSON.parse(localStorage['_intervalBanList']);
        var _setInterval = window.setInterval;
        var currInterval = '';
        window.setInterval = function() {
            var args = Array.prototype.slice.call(arguments);
            var func = args[0];
            if(typeof(func) == 'string') {
                var ftxt = func
                func = function(){eval(ftxt);};
            }
            if (Object.toString.apply(func).replace(/\\\\/g,'').replace(/(?:'[\S\s]*?[^\\]'|"[\S\s]*?[^\\]")/g,'').includes('debugger') || intervalBanList.includes(Object.toString.apply(func))) {
                console.debug('Forbided setInterval: \n' + Object.toString.apply(func));
                args[0] = function(){};
            } else {
                args[0] = function(){
                    currInterval = Object.toString.apply(func);
                    func.apply(null, arguments);
                    currInterval = '';
                }
            }
            return _setInterval.apply(null, args);
        }
        var banCurrentInteval = function() {
            if (currInterval != '' && !intervalBanList.includes(currInterval)) {
                intervalBanList.push(currInterval);
                localStorage['_intervalBanList'] = JSON.stringify(intervalBanList);
                location.reload();
            }
        }

        var timeoutBanList = [];
        if (localStorage['_timeoutBanList'])
            timeoutBanList = JSON.parse(localStorage['_timeoutBanList']);
        var _setTimeout = window.setTimeout;
        var currTimeout = '';
        window.setTimeout = function() {
            var args = Array.prototype.slice.call(arguments);
            var func = args[0];
            if(typeof(func) == 'string') {
                var ftxt = func
                func = function(){eval(ftxt);};
            }
            if (Object.toString.apply(func).replace(/\\\\/g,'').replace(/(?:'[\S\s]*?[^\\]'|"[\S\s]*?[^\\]")/g,'').includes('debugger') || timeoutBanList.includes(Object.toString.apply(func))) {
                console.debug('Forbided setTimeout: \n' + Object.toString.apply(func));
                args[0] = function(){};
            } else {
                args[0] = function(){
                    currTimeout = Object.toString.apply(func);
                    func.apply(null, arguments);
                    currTimeout = '';
                }
            }
            return _setTimeout.apply(null, args);
        }
        var banCurrentTimeout = function() {
            if (currTimeout != '' && !timeoutBanList.includes(currInterval)) {
                timeoutBanList.push(currTimeout);
                localStorage['_timeoutBanList'] = JSON.stringify(timeoutBanList);
                location.reload();
            }
        }

        window.banCurrentDebugger = function() {
            if (currInterval != '')
                banCurrentInteval();
            else if (currTimeout != '')
                banCurrentTimeout();
        }

        // console.log('Anti-Anti-Debug Injected.');
    };
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.innerHTML = '(' + antiantidebug.toString() + '());';
    document.documentElement.appendChild(s);
}());

