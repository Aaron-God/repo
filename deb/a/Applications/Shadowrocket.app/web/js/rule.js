// Shadowrocket, copyright (c) by Li Guangming
// Distributed under an MIT license

(function(mod) {
    if (typeof exports == 'object' && typeof module == 'object') // CommonJS
        mod(require('../../lib/codemirror'));
    else if (typeof define == 'function' && define.amd) // AMD
        define(['../../lib/codemirror'], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    'use strict';
    CodeMirror.defineMode('rule', function(config) {
        var tokenFunctions = {};
        var geoCountries = 'AD,AE,AF,AG,AI,AL,AM,AO,AQ,AR,AS,AT,AU,AW,AX,AZ,BA,BB,BD,BE,BF,BG,BH,BI,BJ,BL,BM,BN,BO,BQ,BR,BS,BT,BV,BW,BY,BZ,CA,CC,CD,CF,CG,CH,CI,CK,CL,CM,CN,CO,CR,CU,CV,CW,CX,CY,CZ,DE,DJ,DK,DM,DO,DZ,EC,EE,EG,EH,ER,ES,ET,FI,FJ,FK,FM,FO,FR,GA,GB,GD,GE,GF,GG,GH,GI,GL,GM,GN,GP,GQ,GR,GS,GT,GU,GW,GY,HK,HM,HN,HR,HT,HU,ID,IE,IL,IM,IN,IO,IQ,IR,IS,IT,JE,JM,JO,JP,KE,KG,KH,KI,KM,KN,KP,KR,KW,KY,KZ,LA,LB,LC,LI,LK,LR,LS,LT,LU,LV,LY,MA,MC,MD,ME,MF,MG,MH,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,NA,NC,NE,NF,NG,NI,NL,NO,NP,NR,NU,NZ,OM,PA,PE,PF,PG,PH,PK,PL,PM,PN,PR,PS,PT,PW,PY,QA,RE,RO,RS,RU,RW,SA,SB,SC,SD,SE,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SR,SS,ST,SV,SX,SY,SZ,TC,TD,TF,TG,TH,TJ,TK,TL,TM,TN,TO,TR,TT,TV,TW,TZ,UA,UG,UM,US,UY,UZ,VA,VC,VE,VG,VI,VN,VU,WF,WS,YE,YT,ZA,ZM,ZW'.split(',')

        function tokenBase(stream, state, fallback) {
            var ch = stream.next();
            if (ch == '[') {
                return tokenSection(stream, state);
            } else if (ch == '=') {
                return null;
            } else if (ch == '#') {
                stream.skipToEnd();
                return 'comment';
            } else if (ch == '/' && stream.eat('/')) {
                stream.skipToEnd();
                return 'comment';
            } else if (ch == ',') {
                if (stream.eol()) {
                    state.stack.pop();
                }
                return null;
            } else {
                if (typeof fallback == 'function') {
                    return fallback(stream, state);
                }
                stream.eatWhile(/[\w\\\-]/);
                return 'variable';
            }
        }

        function tokenSection(stream, state) {
            state.stack.pop();
            if (!stream.skipTo(']')) {
                return tokenBase(stream, state);
            }
            stream.next();
            var current = stream.current();
            var section = current.replace(/([^a-z0-9]+)/ig, '');
            state.tokenize = tokenFunctions[section] || tokenBase;
            return 'tag section';
        }

        function tokenFunction(key, func) {
            var keys = key.split(',');
            keys.forEach(function(key){
                tokenFunctions[key] = function(stream, state) {
                    return tokenBase(stream, state, func);
                };
            });
        }

        tokenFunction('General,Host,MITM,Filter', function(stream, state) {
            var ch = stream.next();
            var context = state.stack.pop();
            if (!context) {
                stream.eatWhile(/[^=\s]/);
                state.stack.push('keyword');
                return 'keyword';
            }
            if (!stream.skipTo('//') && !stream.skipTo('#')) {
                if (stream.eat('[')) {
                    return tokenSection(stream, state);
                }
                stream.skipToEnd();
            }
            return 'variable-3';
        });

        tokenFunction('Rule', function(stream, state) {
            var context = state.stack.pop();
            if (!stream.skipTo(',')) {
                if (!stream.skipTo('//') && !stream.skipTo('#')) {
                    if (stream.eat('[')) {
                        return tokenSection(stream, state);
                    }
                    stream.skipToEnd();
                }
                if (!context) {
                    return 'error';
                }
                if (context == 'variable-3' && !/^(force-remote-dns|no-resolve|script-filter)$/i.test(stream.current())) {
                    return 'error';
                }
                return context == 'variable-3' ? 'keyword' : 'policy';
            }
            var current = stream.current();
            if (!context) {
                if (!/^(DOMAIN-SUFFIX|DOMAIN-KEYWORD|DOMAIN|IP-CIDR|GEOIP|USER-AGENT|FINAL)$/i.test(current)) {
                    stream.skipToEnd();
                    return 'error';
                }
                state.stack.push(current.toUpperCase());
                return 'def rule';
            } else if (context == 'value') {
                state.stack.push('variable-3');
                return 'policy';
            } else if (context == 'variable-3') {
                state.stack.push('keyword');
                if (!/^(force-remote-dns|no-resolve|script-filter)$/i.test(current)) {
                    return 'error';
                }
                return 'keyword';
            } else if (context == 'IP-CIDR') {
                state.stack.push('value');
                return /^\d+\.\d+\.\d+\.\d+\/\d+$/.test(current) ? 'variable-2' : 'error';
            } else if (context == 'GEOIP') {
                state.stack.push('value');
                return geoCountries.indexOf(current.toUpperCase()) > -1 ? 'variable-2' : 'error';
            }
            state.stack.push('value');
            return 'variable';
        });

        tokenFunction('URLRewrite', function(stream, state) {
            var context = state.stack.pop();
            if (!stream.skipTo(' ')) {
                if (!stream.skipTo('//') && !stream.skipTo('#')) {
                    if (stream.eat('[')) {
                        return tokenSection(stream, state);
                    }
                    stream.skipToEnd();
                }
                return context == 'variable-3' ? 'keyword' : 'variable-3';
            }
            if (!context) {
                state.stack.push('keyword');
                return 'expr';
            } else if (context == 'value') {
                state.stack.push('variable-3');
                return 'variable-3';
            } else if (context == 'variable-3') {
                state.stack.push('keyword');
                return 'keyword';
            }
            state.stack.push('value');
            return 'variable';
        });

        tokenFunction('HeaderRewrite', function(stream, state) {
            var context = state.stack.pop();
            if (!stream.skipTo(' ')) {
                if (!stream.skipTo('//') && !stream.skipTo('#')) {
                    if (stream.eat('[')) {
                        return tokenSection(stream, state);
                    }
                    stream.skipToEnd();
                }
                return context == 'action' ? 'variable' : 'variable-3';
            }
            if (!context) {
                state.stack.push('expr');
                return 'keyword';
            } else if (context == 'expr') {
                var current = stream.current();
                if (!/header-(del|replace)/i.test(current)) {
                    state.stack.push('action');
                    return 'error';
                }
                state.stack.push(current);
                return 'def rule';
            } else if (context == 'header-replace') {
                state.stack.push('action');
                return 'variable-3'
            }
            if (!stream.skipTo('//') && !stream.skipTo('#')) {
                if (stream.eat('[')) {
                    return tokenSection(stream, state);
                }
                stream.skipToEnd();
            }
            return 'variable';
        });

        return {
            startState: function(base) {
                return {
                    tokenize: tokenBase,
                    baseIndent: base || 0,
                    stack: []
                };
            },
            token: function(stream, state) {
                if (stream.eatSpace()) {
                    return null;
                }
                return state.tokenize(stream, state);
            }
        };
    });

    CodeMirror.defineMIME('text/x-shadowrocket-conf', 'shadowrocket');
});
