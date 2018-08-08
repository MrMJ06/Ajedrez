/*! peerjs build:0.3.15, production. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */ ! function a(b, c, d) {
    function e(g, h) {
        if (!c[g]) {
            if (!b[g]) {
                var i = "function" == typeof require && require;
                if (!h && i) return i(g, !0);
                if (f) return f(g, !0);
                var j = new Error("Cannot find module '" + g + "'");
                throw j.code = "MODULE_NOT_FOUND", j
            }
            var k = c[g] = {
                exports: {}
            };
            b[g][0].call(k.exports, function (a) {
                var c = b[g][1][a];
                return e(c || a)
            }, k, k.exports, a, b, c, d)
        }
        return c[g].exports
    }
    for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
    return e
}({
    1: [function (a, b, c) {
        b.exports.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription, b.exports.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection, b.exports.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate
    }, {}],
    2: [function (a, b, c) {
        function d(a, b, c) {
            if (!(this instanceof d)) return new d(a, b, c);
            f.call(this), this.options = e.extend({
                serialization: "binary",
                reliable: !1
            }, c), this.open = !1, this.type = "data", this.peer = a, this.provider = b, this.id = this.options.connectionId || d._idPrefix + e.randomToken(), this.label = this.options.label || this.id, this.metadata = this.options.metadata, this.serialization = this.options.serialization, this.reliable = this.options.reliable, this._buffer = [], this._buffering = !1, this.bufferSize = 0, this._chunkedData = {}, this.options._payload && (this._peerBrowser = this.options._payload.browser), g.startConnection(this, this.options._payload || {
                originator: !0
            })
        }
        var e = a("./util"),
            f = a("eventemitter3"),
            g = a("./negotiator"),
            h = a("reliable");
        e.inherits(d, f), d._idPrefix = "dc_", d.prototype.initialize = function (a) {
            this._dc = this.dataChannel = a, this._configureDataChannel()
        }, d.prototype._configureDataChannel = function () {
            var a = this;
            e.supports.sctp && (this._dc.binaryType = "arraybuffer"), this._dc.onopen = function () {
                e.log("Data channel connection success"), a.open = !0, a.emit("open")
            }, !e.supports.sctp && this.reliable && (this._reliable = new h(this._dc, e.debug)), this._reliable ? this._reliable.onmessage = function (b) {
                a.emit("data", b)
            } : this._dc.onmessage = function (b) {
                a._handleDataMessage(b)
            }, this._dc.onclose = function (b) {
                e.log("DataChannel closed for:", a.peer), a.close()
            }
        }, d.prototype._handleDataMessage = function (a) {
            var b = this,
                c = a.data,
                d = c.constructor;
            if ("binary" === this.serialization || "binary-utf8" === this.serialization) {
                if (d === Blob) return void e.blobToArrayBuffer(c, function (a) {
                    c = e.unpack(a), b.emit("data", c)
                });
                if (d === ArrayBuffer) c = e.unpack(c);
                else if (d === String) {
                    var f = e.binaryStringToArrayBuffer(c);
                    c = e.unpack(f)
                }
            } else "json" === this.serialization && (c = JSON.parse(c));
            if (c.__peerData) {
                var g = c.__peerData,
                    h = this._chunkedData[g] || {
                        data: [],
                        count: 0,
                        total: c.total
                    };
                return h.data[c.n] = c.data, h.count += 1, h.total === h.count && (delete this._chunkedData[g], c = new Blob(h.data), this._handleDataMessage({
                    data: c
                })), void(this._chunkedData[g] = h)
            }
            this.emit("data", c)
        }, d.prototype.close = function () {
            this.open && (this.open = !1, g.cleanup(this), this.emit("close"))
        }, d.prototype.send = function (a, b) {
            if (!this.open) return void this.emit("error", new Error("Connection is not open. You should listen for the `open` event before sending messages."));
            if (this._reliable) return void this._reliable.send(a);
            var c = this;
            if ("json" === this.serialization) this._bufferedSend(JSON.stringify(a));
            else if ("binary" === this.serialization || "binary-utf8" === this.serialization) {
                var d = e.pack(a),
                    f = e.chunkedBrowsers[this._peerBrowser] || e.chunkedBrowsers[e.browser];
                if (f && !b && d.size > e.chunkedMTU) return void this._sendChunks(d);
                e.supports.sctp ? e.supports.binaryBlob ? this._bufferedSend(d) : e.blobToArrayBuffer(d, function (a) {
                    c._bufferedSend(a)
                }) : e.blobToBinaryString(d, function (a) {
                    c._bufferedSend(a)
                })
            } else this._bufferedSend(a)
        }, d.prototype._bufferedSend = function (a) {
            !this._buffering && this._trySend(a) || (this._buffer.push(a), this.bufferSize = this._buffer.length)
        }, d.prototype._trySend = function (a) {
            try {
                this._dc.send(a)
            } catch (a) {
                this._buffering = !0;
                var b = this;
                return setTimeout(function () {
                    b._buffering = !1, b._tryBuffer()
                }, 100), !1
            }
            return !0
        }, d.prototype._tryBuffer = function () {
            if (0 !== this._buffer.length) {
                var a = this._buffer[0];
                this._trySend(a) && (this._buffer.shift(), this.bufferSize = this._buffer.length, this._tryBuffer())
            }
        }, d.prototype._sendChunks = function (a) {
            for (var b = e.chunk(a), c = 0, d = b.length; c < d; c += 1) {
                var a = b[c];
                this.send(a, !0)
            }
        }, d.prototype.handleMessage = function (a) {
            var b = a.payload;
            switch (a.type) {
                case "ANSWER":
                    this._peerBrowser = b.browser, g.handleSDP(a.type, this, b.sdp);
                    break;
                case "CANDIDATE":
                    g.handleCandidate(this, b.candidate);
                    break;
                default:
                    e.warn("Unrecognized message type:", a.type, "from peer:", this.peer)
            }
        }, b.exports = d
    }, {
        "./negotiator": 5,
        "./util": 8,
        eventemitter3: 9,
        reliable: 12
    }],
    3: [function (a, b, c) {
        window.Socket = a("./socket"), window.MediaConnection = a("./mediaconnection"), window.DataConnection = a("./dataconnection"), window.Peer = a("./peer"), window.RTCPeerConnection = a("./adapter").RTCPeerConnection, window.RTCSessionDescription = a("./adapter").RTCSessionDescription, window.RTCIceCandidate = a("./adapter").RTCIceCandidate, window.Negotiator = a("./negotiator"), window.util = a("./util"), window.BinaryPack = a("js-binarypack")
    }, {
        "./adapter": 1,
        "./dataconnection": 2,
        "./mediaconnection": 4,
        "./negotiator": 5,
        "./peer": 6,
        "./socket": 7,
        "./util": 8,
        "js-binarypack": 10
    }],
    4: [function (a, b, c) {
        function d(a, b, c) {
            if (!(this instanceof d)) return new d(a, b, c);
            f.call(this), this.options = e.extend({}, c), this.open = !1, this.type = "media", this.peer = a, this.provider = b, this.metadata = this.options.metadata, this.localStream = this.options._stream, this.id = this.options.connectionId || d._idPrefix + e.randomToken(), this.localStream && g.startConnection(this, {
                _stream: this.localStream,
                originator: !0
            })
        }
        var e = a("./util"),
            f = a("eventemitter3"),
            g = a("./negotiator");
        e.inherits(d, f), d._idPrefix = "mc_", d.prototype.addStream = function (a) {
            e.log("Receiving stream", a), this.remoteStream = a, this.emit("stream", a)
        }, d.prototype.handleMessage = function (a) {
            var b = a.payload;
            switch (a.type) {
                case "ANSWER":
                    g.handleSDP(a.type, this, b.sdp), this.open = !0;
                    break;
                case "CANDIDATE":
                    g.handleCandidate(this, b.candidate);
                    break;
                default:
                    e.warn("Unrecognized message type:", a.type, "from peer:", this.peer)
            }
        }, d.prototype.answer = function (a) {
            if (this.localStream) return void e.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
            this.options._payload._stream = a, this.localStream = a, g.startConnection(this, this.options._payload);
            for (var b = this.provider._getMessages(this.id), c = 0, d = b.length; c < d; c += 1) this.handleMessage(b[c]);
            this.open = !0
        }, d.prototype.close = function () {
            this.open && (this.open = !1, g.cleanup(this), this.emit("close"))
        }, b.exports = d
    }, {
        "./negotiator": 5,
        "./util": 8,
        eventemitter3: 9
    }],
    5: [function (a, b, c) {
        var d = a("./util"),
            e = a("./adapter").RTCPeerConnection,
            f = a("./adapter").RTCSessionDescription,
            g = a("./adapter").RTCIceCandidate,
            h = {
                pcs: {
                    data: {},
                    media: {}
                },
                queue: []
            };
        h._idPrefix = "pc_", h.startConnection = function (a, b) {
            var c = h._getPeerConnection(a, b);
            if (a.pc = a.peerConnection = c, "media" === a.type && b._stream && c.addStream(b._stream), b.originator) {
                if ("data" === a.type) {
                    var e = {};
                    d.supports.sctp || (e = {
                        reliable: b.reliable
                    });
                    var f = c.createDataChannel(a.label, e);
                    a.initialize(f)
                }
                h._makeOffer(a)
            } else h.handleSDP("OFFER", a, b.sdp)
        }, h._getPeerConnection = function (a, b) {
            h.pcs[a.type] || d.error(a.type + " is not a valid connection type. Maybe you overrode the `type` property somewhere."), h.pcs[a.type][a.peer] || (h.pcs[a.type][a.peer] = {});
            var c;
            h.pcs[a.type][a.peer];
            return b.pc && (c = h.pcs[a.type][a.peer][b.pc]), c && "stable" === c.signalingState || (c = h._startPeerConnection(a)), c
        }, h._startPeerConnection = function (a) {
            d.log("Creating RTCPeerConnection.");
            var b = h._idPrefix + d.randomToken(),
                c = {};
            "data" !== a.type || d.supports.sctp ? "media" === a.type && (c = {
                optional: [{
                    DtlsSrtpKeyAgreement: !0
                }]
            }) : c = {
                optional: [{
                    RtpDataChannels: !0
                }]
            };
            var f = new e(a.provider.options.config, c);
            return h.pcs[a.type][a.peer][b] = f, h._setupListeners(a, f, b), f
        }, h._setupListeners = function (a, b, c) {
            var e = a.peer,
                f = a.id,
                g = a.provider;
            d.log("Listening for ICE candidates."), b.onicecandidate = function (b) {
                b.candidate && (d.log("Received ICE candidates for:", a.peer), g.socket.send({
                    type: "CANDIDATE",
                    payload: {
                        candidate: b.candidate,
                        type: a.type,
                        connectionId: a.id
                    },
                    dst: e
                }))
            }, b.oniceconnectionstatechange = function () {
                switch (b.iceConnectionState) {
                    case "failed":
                        d.log("iceConnectionState is disconnected, closing connections to " + e), a.emit("error", new Error("Negotiation of connection to " + e + " failed.")), a.close();
                        break;
                    case "disconnected":
                        d.log("iceConnectionState is disconnected, closing connections to " + e), a.close();
                        break;
                    case "completed":
                        b.onicecandidate = d.noop
                }
            }, b.onicechange = b.oniceconnectionstatechange, d.log("Listening for data channel"), b.ondatachannel = function (a) {
                d.log("Received data channel");
                var b = a.channel;
                g.getConnection(e, f).initialize(b)
            }, d.log("Listening for remote stream"), b.onaddstream = function (a) {
                d.log("Received remote stream");
                var b = a.stream,
                    c = g.getConnection(e, f);
                "media" === c.type && c.addStream(b)
            }
        }, h.cleanup = function (a) {
            d.log("Cleaning up PeerConnection to " + a.peer);
            var b = a.pc;
            b && (b.readyState && "closed" !== b.readyState || "closed" !== b.signalingState) && (b.close(), a.pc = null)
        }, h._makeOffer = function (a) {
            var b = a.pc;
            b.createOffer(function (c) {
                d.log("Created offer."), !d.supports.sctp && "data" === a.type && a.reliable && (c.sdp = Reliable.higherBandwidthSDP(c.sdp)), b.setLocalDescription(c, function () {
                    d.log("Set localDescription: offer", "for:", a.peer), a.provider.socket.send({
                        type: "OFFER",
                        payload: {
                            sdp: c,
                            type: a.type,
                            label: a.label,
                            connectionId: a.id,
                            reliable: a.reliable,
                            serialization: a.serialization,
                            metadata: a.metadata,
                            browser: d.browser
                        },
                        dst: a.peer
                    })
                }, function (b) {
                    "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer" != b && (a.provider.emitError("webrtc", b), d.log("Failed to setLocalDescription, ", b))
                })
            }, function (b) {
                a.provider.emitError("webrtc", b), d.log("Failed to createOffer, ", b)
            }, a.options.constraints)
        }, h._makeAnswer = function (a) {
            var b = a.pc;
            b.createAnswer(function (c) {
                d.log("Created answer."), !d.supports.sctp && "data" === a.type && a.reliable && (c.sdp = Reliable.higherBandwidthSDP(c.sdp)), b.setLocalDescription(c, function () {
                    d.log("Set localDescription: answer", "for:", a.peer), a.provider.socket.send({
                        type: "ANSWER",
                        payload: {
                            sdp: c,
                            type: a.type,
                            connectionId: a.id,
                            browser: d.browser
                        },
                        dst: a.peer
                    })
                }, function (b) {
                    a.provider.emitError("webrtc", b), d.log("Failed to setLocalDescription, ", b)
                })
            }, function (b) {
                a.provider.emitError("webrtc", b), d.log("Failed to create answer, ", b)
            })
        }, h.handleSDP = function (a, b, c) {
            c = new f(c);
            var e = b.pc;
            d.log("Setting remote description", c), e.setRemoteDescription(c, function () {
                d.log("Set remoteDescription:", a, "for:", b.peer), "OFFER" === a && h._makeAnswer(b)
            }, function (a) {
                b.provider.emitError("webrtc", a), d.log("Failed to setRemoteDescription, ", a)
            })
        }, h.handleCandidate = function (a, b) {
            var c = b.candidate,
                e = b.sdpMLineIndex;
            a.pc.addIceCandidate(new g({
                sdpMLineIndex: e,
                candidate: c
            })), d.log("Added ICE candidate for:", a.peer)
        }, b.exports = h
    }, {
        "./adapter": 1,
        "./util": 8
    }],
    6: [function (a, b, c) {
        function d(a, b) {
            return this instanceof d ? (f.call(this), a && a.constructor == Object ? (b = a, a = void 0) : a && (a = a.toString()), b = e.extend({
                debug: 0,
                host: e.CLOUD_HOST,
                port: e.CLOUD_PORT,
                path: "/",
                token: e.randomToken(),
                config: e.defaultConfig
            }, b), b.key = "peerjs", this.options = b, "/" === b.host && (b.host = window.location.hostname), "/" !== b.path[0] && (b.path = "/" + b.path), "/" !== b.path[b.path.length - 1] && (b.path += "/"), void 0 === b.secure && b.host !== e.CLOUD_HOST && (b.secure = e.isSecure()), b.logFunction && e.setLogFunction(b.logFunction), e.setLogLevel(b.debug), e.supports.audioVideo || e.supports.data ? e.validateId(a) ? (this.destroyed = !1, this.disconnected = !1, this.open = !1, this.connections = {}, this._lostMessages = {}, this._initializeServerConnection(), void(a ? this._initialize(a) : this._retrieveId())) : void this._delayedAbort("invalid-id", 'ID "' + a + '" is invalid') : void this._delayedAbort("browser-incompatible", "The current browser does not support WebRTC")) : new d(a, b)
        }
        var e = a("./util"),
            f = a("eventemitter3"),
            g = a("./socket"),
            h = a("./mediaconnection"),
            i = a("./dataconnection");
        e.inherits(d, f), d.prototype._initializeServerConnection = function () {
            var a = this;
            this.socket = new g(this.options.secure, this.options.host, this.options.port, this.options.path, this.options.key, this.options.wsport), this.socket.on("message", function (b) {
                a._handleMessage(b)
            }), this.socket.on("error", function (b) {
                a._abort("socket-error", b)
            }), this.socket.on("disconnected", function () {
                a.disconnected || (a.emitError("network", "Lost connection to server."), a.disconnect())
            }), this.socket.on("close", function () {
                a.disconnected || a._abort("socket-closed", "Underlying socket is already closed.")
            })
        }, d.prototype._retrieveId = function (a) {
            var b = this,
                c = new XMLHttpRequest,
                d = this.options.secure ? "https://" : "http://",
                f = d + this.options.host + ":" + this.options.port + this.options.path + this.options.key + "/id";
            f += "?ts=" + (new Date).getTime() + Math.random(), c.open("get", f, !0), c.onerror = function (a) {
                e.error("Error retrieving ID", a);
                var c = "";
                "/" === b.options.path && b.options.host !== e.CLOUD_HOST && (c = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."), b._abort("server-error", "Could not get an ID from the server." + c)
            }, c.onreadystatechange = function () {
                if (4 === c.readyState) return 200 !== c.status ? void c.onerror() : void b._initialize(c.responseText)
            }, c.send(null)
        }, d.prototype._initialize = function (a) {
            this.id = a, this.socket.start(this.id, this.options.token)
        }, d.prototype._handleMessage = function (a) {
            var b, c = a.type,
                d = a.payload,
                f = a.src;
            switch (c) {
                case "OPEN":
                    this.emit("open", this.id), this.open = !0;
                    break;
                case "ERROR":
                    this._abort("server-error", d.msg);
                    break;
                case "ID-TAKEN":
                    this._abort("unavailable-id", "ID `" + this.id + "` is taken");
                    break;
                case "INVALID-KEY":
                    this._abort("invalid-key", 'API KEY "' + this.options.key + '" is invalid');
                    break;
                case "LEAVE":
                    e.log("Received leave message from", f), this._cleanupPeer(f);
                    break;
                case "EXPIRE":
                    this.emitError("peer-unavailable", "Could not connect to peer " + f);
                    break;
                case "OFFER":
                    var g = d.connectionId;
                    if (b = this.getConnection(f, g), b && (b.close(), e.warn("Offer received for existing Connection ID:", g)), "media" === d.type) b = new h(f, this, {
                        connectionId: g,
                        _payload: d,
                        metadata: d.metadata
                    }), this._addConnection(f, b), this.emit("call", b);
                    else {
                        if ("data" !== d.type) return void e.warn("Received malformed connection type:", d.type);
                        b = new i(f, this, {
                            connectionId: g,
                            _payload: d,
                            metadata: d.metadata,
                            label: d.label,
                            serialization: d.serialization,
                            reliable: d.reliable
                        }), this._addConnection(f, b), this.emit("connection", b)
                    }
                    for (var j = this._getMessages(g), k = 0, l = j.length; k < l; k += 1) b.handleMessage(j[k]);
                    break;
                default:
                    if (!d) return void e.warn("You received a malformed message from " + f + " of type " + c);
                    var m = d.connectionId;
                    b = this.getConnection(f, m), b && b.pc ? b.handleMessage(a) : m ? this._storeMessage(m, a) : e.warn("You received an unrecognized message:", a)
            }
        }, d.prototype._storeMessage = function (a, b) {
            this._lostMessages[a] || (this._lostMessages[a] = []), this._lostMessages[a].push(b)
        }, d.prototype._getMessages = function (a) {
            var b = this._lostMessages[a];
            return b ? (delete this._lostMessages[a], b) : []
        }, d.prototype.connect = function (a, b) {
            if (this.disconnected) return e.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available."), void this.emitError("disconnected", "Cannot connect to new Peer after disconnecting from server.");
            var c = new i(a, this, b);
            return this._addConnection(a, c), c
        }, d.prototype.call = function (a, b, c) {
            if (this.disconnected) return e.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect."), void this.emitError("disconnected", "Cannot connect to new Peer after disconnecting from server.");
            if (!b) return void e.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
            c = c || {}, c._stream = b;
            var d = new h(a, this, c);
            return this._addConnection(a, d), d
        }, d.prototype._addConnection = function (a, b) {
            this.connections[a] || (this.connections[a] = []), this.connections[a].push(b)
        }, d.prototype.getConnection = function (a, b) {
            var c = this.connections[a];
            if (!c) return null;
            for (var d = 0, e = c.length; d < e; d++)
                if (c[d].id === b) return c[d];
            return null
        }, d.prototype._delayedAbort = function (a, b) {
            var c = this;
            e.setZeroTimeout(function () {
                c._abort(a, b)
            })
        }, d.prototype._abort = function (a, b) {
            e.error("Aborting!"), this._lastServerId ? this.disconnect() : this.destroy(), this.emitError(a, b)
        }, d.prototype.emitError = function (a, b) {
            e.error("Error:", b), "string" == typeof b && (b = new Error(b)), b.type = a, this.emit("error", b)
        }, d.prototype.destroy = function () {
            this.destroyed || (this._cleanup(), this.disconnect(), this.destroyed = !0)
        }, d.prototype._cleanup = function () {
            if (this.connections)
                for (var a = Object.keys(this.connections), b = 0, c = a.length; b < c; b++) this._cleanupPeer(a[b]);
            this.emit("close")
        }, d.prototype._cleanupPeer = function (a) {
            for (var b = this.connections[a], c = 0, d = b.length; c < d; c += 1) b[c].close()
        }, d.prototype.disconnect = function () {
            var a = this;
            e.setZeroTimeout(function () {
                a.disconnected || (a.disconnected = !0, a.open = !1, a.socket && a.socket.close(), a.emit("disconnected", a.id), a._lastServerId = a.id, a.id = null)
            })
        }, d.prototype.reconnect = function () {
            if (this.disconnected && !this.destroyed) e.log("Attempting reconnection to server with ID " + this._lastServerId), this.disconnected = !1, this._initializeServerConnection(), this._initialize(this._lastServerId);
            else {
                if (this.destroyed) throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
                if (this.disconnected || this.open) throw new Error("Peer " + this.id + " cannot reconnect because it is not disconnected from the server!");
                e.error("In a hurry? We're still trying to make the initial connection!")
            }
        }, d.prototype.listAllPeers = function (a) {
            a = a || function () {};
            var b = this,
                c = new XMLHttpRequest,
                d = this.options.secure ? "https://" : "http://",
                f = d + this.options.host + ":" + this.options.port + this.options.path + this.options.key + "/peers";
            f += "?ts=" + (new Date).getTime() + Math.random(), c.open("get", f, !0), c.onerror = function (c) {
                b._abort("server-error", "Could not get peers from the server."), a([])
            }, c.onreadystatechange = function () {
                if (4 === c.readyState) {
                    if (401 === c.status) {
                        var d = "";
                        throw d = b.options.host !== e.CLOUD_HOST ? "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key." : "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.", a([]), new Error("It doesn't look like you have permission to list peers IDs. " + d)
                    }
                    a(200 !== c.status ? [] : JSON.parse(c.responseText))
                }
            }, c.send(null)
        }, b.exports = d
    }, {
        "./dataconnection": 2,
        "./mediaconnection": 4,
        "./socket": 7,
        "./util": 8,
        eventemitter3: 9
    }],
    7: [function (a, b, c) {
        function d(a, b, c, e, g, h) {
            if (!(this instanceof d)) return new d(a, b, c, e, g, h);
            h = h || c, f.call(this), this.disconnected = !1, this._queue = [];
            var i = a ? "https://" : "http://",
                j = a ? "wss://" : "ws://";
            this._httpUrl = i + b + ":" + c + e + g, this._wsUrl = j + b + ":" + h + e + "peerjs?key=" + g
        }
        var e = a("./util"),
            f = a("eventemitter3");
        e.inherits(d, f), d.prototype.start = function (a, b) {
            this.id = a, this._httpUrl += "/" + a + "/" + b, this._wsUrl += "&id=" + a + "&token=" + b, this._startXhrStream(), this._startWebSocket()
        }, d.prototype._startWebSocket = function (a) {
            var b = this;
            this._socket || (this._socket = new WebSocket(this._wsUrl), this._socket.onmessage = function (a) {
                try {
                    var c = JSON.parse(a.data)
                } catch (b) {
                    return void e.log("Invalid server message", a.data)
                }
                b.emit("message", c)
            }, this._socket.onclose = function (a) {
                e.log("Socket closed."), b.disconnected = !0, b.emit("disconnected")
            }, this._socket.onopen = function () {
                b._timeout && (clearTimeout(b._timeout), setTimeout(function () {
                    b._http.abort(), b._http = null
                }, 5e3)), b._sendQueuedMessages(), e.log("Socket open")
            })
        }, d.prototype._startXhrStream = function (a) {
            try {
                var b = this;
                this._http = new XMLHttpRequest, this._http._index = 1, this._http._streamIndex = a || 0, this._http.open("post", this._httpUrl + "/id?i=" + this._http._streamIndex, !0), this._http.onerror = function () {
                    clearTimeout(b._timeout), b.emit("disconnected")
                }, this._http.onreadystatechange = function () {
                    2 == this.readyState && this.old ? (this.old.abort(), delete this.old) : this.readyState > 2 && 200 === this.status && this.responseText && b._handleStream(this)
                }, this._http.send(null), this._setHTTPTimeout()
            } catch (a) {
                e.log("XMLHttpRequest not available; defaulting to WebSockets")
            }
        }, d.prototype._handleStream = function (a) {
            var b = a.responseText.split("\n");
            if (a._buffer)
                for (; a._buffer.length > 0;) {
                    var c = a._buffer.shift(),
                        d = b[c];
                    try {
                        d = JSON.parse(d)
                    } catch (b) {
                        a._buffer.shift(c);
                        break
                    }
                    this.emit("message", d)
                }
            var f = b[a._index];
            if (f)
                if (a._index += 1, a._index === b.length) a._buffer || (a._buffer = []), a._buffer.push(a._index - 1);
                else {
                    try {
                        f = JSON.parse(f)
                    } catch (a) {
                        return void e.log("Invalid server message", f)
                    }
                    this.emit("message", f)
                }
        }, d.prototype._setHTTPTimeout = function () {
            var a = this;
            this._timeout = setTimeout(function () {
                var b = a._http;
                a._wsOpen() ? b.abort() : (a._startXhrStream(b._streamIndex + 1), a._http.old = b)
            }, 25e3)
        }, d.prototype._wsOpen = function () {
            return this._socket && 1 == this._socket.readyState
        }, d.prototype._sendQueuedMessages = function () {
            for (var a = 0, b = this._queue.length; a < b; a += 1) this.send(this._queue[a])
        }, d.prototype.send = function (a) {
            if (!this.disconnected) {
                if (!this.id) return void this._queue.push(a);
                if (!a.type) return void this.emit("error", "Invalid message");
                var b = JSON.stringify(a);
                if (this._wsOpen()) this._socket.send(b);
                else {
                    var c = new XMLHttpRequest,
                        d = this._httpUrl + "/" + a.type.toLowerCase();
                    c.open("post", d, !0), c.setRequestHeader("Content-Type", "application/json"), c.send(b)
                }
            }
        }, d.prototype.close = function () {
            !this.disconnected && this._wsOpen() && (this._socket.close(), this.disconnected = !0)
        }, b.exports = d
    }, {
        "./util": 8,
        eventemitter3: 9
    }],
    8: [function (a, b, c) {
        var d = {
                iceServers: [{
                    url: "stun:stun.l.google.com:19302"
                }]
            },
            e = 1,
            f = a("js-binarypack"),
            g = a("./adapter").RTCPeerConnection,
            h = {
                noop: function () {},
                CLOUD_HOST: "0.peerjs.com",
                CLOUD_PORT: 9e3,
                chunkedBrowsers: {
                    Chrome: 1
                },
                chunkedMTU: 16300,
                logLevel: 0,
                setLogLevel: function (a) {
                    var b = parseInt(a, 10);
                    isNaN(parseInt(a, 10)) ? h.logLevel = a ? 3 : 0 : h.logLevel = b, h.log = h.warn = h.error = h.noop, h.logLevel > 0 && (h.error = h._printWith("ERROR")), h.logLevel > 1 && (h.warn = h._printWith("WARNING")), h.logLevel > 2 && (h.log = h._print)
                },
                setLogFunction: function (a) {
                    a.constructor !== Function ? h.warn("The log function you passed in is not a function. Defaulting to regular logs.") : h._print = a
                },
                _printWith: function (a) {
                    return function () {
                        var b = Array.prototype.slice.call(arguments);
                        b.unshift(a), h._print.apply(h, b)
                    }
                },
                _print: function () {
                    var a = !1,
                        b = Array.prototype.slice.call(arguments);
                    b.unshift("PeerJS: ");
                    for (var c = 0, d = b.length; c < d; c++) b[c] instanceof Error && (b[c] = "(" + b[c].name + ") " + b[c].message, a = !0);
                    a ? console.error.apply(console, b) : console.log.apply(console, b)
                },
                defaultConfig: d,
                browser: function () {
                    return window.mozRTCPeerConnection ? "Firefox" : window.webkitRTCPeerConnection ? "Chrome" : window.RTCPeerConnection ? "Supported" : "Unsupported"
                }(),
                supports: function () {
                    if (void 0 === g) return {};
                    var a, b, c = !0,
                        e = !0,
                        f = !1,
                        h = !1,
                        i = !!window.webkitRTCPeerConnection;
                    try {
                        a = new g(d, {
                            optional: [{
                                RtpDataChannels: !0
                            }]
                        })
                    } catch (a) {
                        c = !1, e = !1
                    }
                    if (c) try {
                        b = a.createDataChannel("_PEERJSTEST")
                    } catch (a) {
                        c = !1
                    }
                    if (c) {
                        try {
                            b.binaryType = "blob", f = !0
                        } catch (a) {}
                        var j = new g(d, {});
                        try {
                            h = j.createDataChannel("_PEERJSRELIABLETEST", {}).reliable
                        } catch (a) {}
                        j.close()
                    }
                    return e && (e = !!a.addStream), a && a.close(), {
                        audioVideo: e,
                        data: c,
                        binaryBlob: f,
                        binary: h,
                        reliable: h,
                        sctp: h,
                        onnegotiationneeded: i
                    }
                }(),
                validateId: function (a) {
                    return !a || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(a)
                },
                validateKey: function (a) {
                    return !a || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(a)
                },
                debug: !1,
                inherits: function (a, b) {
                    a.super_ = b, a.prototype = Object.create(b.prototype, {
                        constructor: {
                            value: a,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    })
                },
                extend: function (a, b) {
                    for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                    return a
                },
                pack: f.pack,
                unpack: f.unpack,
                log: function () {
                    if (h.debug) {
                        var a = !1,
                            b = Array.prototype.slice.call(arguments);
                        b.unshift("PeerJS: ");
                        for (var c = 0, d = b.length; c < d; c++) b[c] instanceof Error && (b[c] = "(" + b[c].name + ") " + b[c].message, a = !0);
                        a ? console.error.apply(console, b) : console.log.apply(console, b)
                    }
                },
                setZeroTimeout: function (a) {
                    function b(b) {
                        d.push(b), a.postMessage(e, "*")
                    }

                    function c(b) {
                        b.source == a && b.data == e && (b.stopPropagation && b.stopPropagation(), d.length && d.shift()())
                    }
                    var d = [],
                        e = "zero-timeout-message";
                    return a.addEventListener ? a.addEventListener("message", c, !0) : a.attachEvent && a.attachEvent("onmessage", c), b
                }(window),
                chunk: function (a) {
                    for (var b = [], c = a.size, d = index = 0, f = Math.ceil(c / h.chunkedMTU); d < c;) {
                        var g = Math.min(c, d + h.chunkedMTU),
                            i = a.slice(d, g),
                            j = {
                                __peerData: e,
                                n: index,
                                data: i,
                                total: f
                            };
                        b.push(j), d = g, index += 1
                    }
                    return e += 1, b
                },
                blobToArrayBuffer: function (a, b) {
                    var c = new FileReader;
                    c.onload = function (a) {
                        b(a.target.result)
                    }, c.readAsArrayBuffer(a)
                },
                blobToBinaryString: function (a, b) {
                    var c = new FileReader;
                    c.onload = function (a) {
                        b(a.target.result)
                    }, c.readAsBinaryString(a)
                },
                binaryStringToArrayBuffer: function (a) {
                    for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) b[c] = 255 & a.charCodeAt(c);
                    return b.buffer
                },
                randomToken: function () {
                    return Math.random().toString(36).substr(2)
                },
                isSecure: function () {
                    return "https:" === location.protocol
                }
            };
        b.exports = h
    }, {
        "./adapter": 1,
        "js-binarypack": 10
    }],
    9: [function (a, b, c) {
        "use strict";

        function d(a, b, c) {
            this.fn = a, this.context = b, this.once = c || !1
        }

        function e() {}
        e.prototype._events = void 0, e.prototype.listeners = function (a) {
            if (!this._events || !this._events[a]) return [];
            if (this._events[a].fn) return [this._events[a].fn];
            for (var b = 0, c = this._events[a].length, d = new Array(c); b < c; b++) d[b] = this._events[a][b].fn;
            return d
        }, e.prototype.emit = function (a, b, c, d, e, f) {
            if (!this._events || !this._events[a]) return !1;
            var g, h, i = this._events[a],
                j = arguments.length;
            if ("function" == typeof i.fn) {
                switch (i.once && this.removeListener(a, i.fn, !0), j) {
                    case 1:
                        return i.fn.call(i.context), !0;
                    case 2:
                        return i.fn.call(i.context, b), !0;
                    case 3:
                        return i.fn.call(i.context, b, c), !0;
                    case 4:
                        return i.fn.call(i.context, b, c, d), !0;
                    case 5:
                        return i.fn.call(i.context, b, c, d, e), !0;
                    case 6:
                        return i.fn.call(i.context, b, c, d, e, f), !0
                }
                for (h = 1, g = new Array(j - 1); h < j; h++) g[h - 1] = arguments[h];
                i.fn.apply(i.context, g)
            } else {
                var k, l = i.length;
                for (h = 0; h < l; h++) switch (i[h].once && this.removeListener(a, i[h].fn, !0), j) {
                    case 1:
                        i[h].fn.call(i[h].context);
                        break;
                    case 2:
                        i[h].fn.call(i[h].context, b);
                        break;
                    case 3:
                        i[h].fn.call(i[h].context, b, c);
                        break;
                    default:
                        if (!g)
                            for (k = 1, g = new Array(j - 1); k < j; k++) g[k - 1] = arguments[k];
                        i[h].fn.apply(i[h].context, g)
                }
            }
            return !0
        }, e.prototype.on = function (a, b, c) {
            var e = new d(b, c || this);
            return this._events || (this._events = {}), this._events[a] ? this._events[a].fn ? this._events[a] = [this._events[a], e] : this._events[a].push(e) : this._events[a] = e, this
        }, e.prototype.once = function (a, b, c) {
            var e = new d(b, c || this, !0);
            return this._events || (this._events = {}), this._events[a] ? this._events[a].fn ? this._events[a] = [this._events[a], e] : this._events[a].push(e) : this._events[a] = e, this
        }, e.prototype.removeListener = function (a, b, c) {
            if (!this._events || !this._events[a]) return this;
            var d = this._events[a],
                e = [];
            if (b && (d.fn && (d.fn !== b || c && !d.once) && e.push(d), !d.fn))
                for (var f = 0, g = d.length; f < g; f++)(d[f].fn !== b || c && !d[f].once) && e.push(d[f]);
            return e.length ? this._events[a] = 1 === e.length ? e[0] : e : delete this._events[a], this
        }, e.prototype.removeAllListeners = function (a) {
            return this._events ? (a ? delete this._events[a] : this._events = {}, this) : this
        }, e.prototype.off = e.prototype.removeListener, e.prototype.addListener = e.prototype.on, e.prototype.setMaxListeners = function () {
            return this
        }, e.EventEmitter = e, e.EventEmitter2 = e, e.EventEmitter3 = e, b.exports = e
    }, {}],
    10: [function (a, b, c) {
        function d(a) {
            this.index = 0, this.dataBuffer = a, this.dataView = new Uint8Array(this.dataBuffer), this.length = this.dataBuffer.byteLength
        }

        function e() {
            this.bufferBuilder = new h
        }

        function f(a) {
            var b = a.charCodeAt(0);
            return b <= 2047 ? "00" : b <= 65535 ? "000" : b <= 2097151 ? "0000" : b <= 67108863 ? "00000" : "000000"
        }

        function g(a) {
            return a.length > 600 ? new Blob([a]).size : a.replace(/[^\u0000-\u007F]/g, f).length
        }
        var h = a("./bufferbuilder").BufferBuilder,
            i = a("./bufferbuilder").binaryFeatures,
            j = {
                unpack: function (a) {
                    return new d(a).unpack()
                },
                pack: function (a) {
                    var b = new e;
                    return b.pack(a), b.getBuffer()
                }
            };
        b.exports = j, d.prototype.unpack = function () {
            var a = this.unpack_uint8();
            if (a < 128) {
                return a
            }
            if ((224 ^ a) < 32) {
                return (224 ^ a) - 32
            }
            var b;
            if ((b = 160 ^ a) <= 15) return this.unpack_raw(b);
            if ((b = 176 ^ a) <= 15) return this.unpack_string(b);
            if ((b = 144 ^ a) <= 15) return this.unpack_array(b);
            if ((b = 128 ^ a) <= 15) return this.unpack_map(b);
            switch (a) {
                case 192:
                    return null;
                case 193:
                    return;
                case 194:
                    return !1;
                case 195:
                    return !0;
                case 202:
                    return this.unpack_float();
                case 203:
                    return this.unpack_double();
                case 204:
                    return this.unpack_uint8();
                case 205:
                    return this.unpack_uint16();
                case 206:
                    return this.unpack_uint32();
                case 207:
                    return this.unpack_uint64();
                case 208:
                    return this.unpack_int8();
                case 209:
                    return this.unpack_int16();
                case 210:
                    return this.unpack_int32();
                case 211:
                    return this.unpack_int64();
                case 212:
                case 213:
                case 214:
                case 215:
                    return;
                case 216:
                    return b = this.unpack_uint16(), this.unpack_string(b);
                case 217:
                    return b = this.unpack_uint32(), this.unpack_string(b);
                case 218:
                    return b = this.unpack_uint16(), this.unpack_raw(b);
                case 219:
                    return b = this.unpack_uint32(), this.unpack_raw(b);
                case 220:
                    return b = this.unpack_uint16(), this.unpack_array(b);
                case 221:
                    return b = this.unpack_uint32(), this.unpack_array(b);
                case 222:
                    return b = this.unpack_uint16(), this.unpack_map(b);
                case 223:
                    return b = this.unpack_uint32(), this.unpack_map(b)
            }
        }, d.prototype.unpack_uint8 = function () {
            var a = 255 & this.dataView[this.index];
            return this.index++, a
        }, d.prototype.unpack_uint16 = function () {
            var a = this.read(2),
                b = 256 * (255 & a[0]) + (255 & a[1]);
            return this.index += 2, b
        }, d.prototype.unpack_uint32 = function () {
            var a = this.read(4),
                b = 256 * (256 * (256 * a[0] + a[1]) + a[2]) + a[3];
            return this.index += 4, b
        }, d.prototype.unpack_uint64 = function () {
            var a = this.read(8),
                b = 256 * (256 * (256 * (256 * (256 * (256 * (256 * a[0] + a[1]) + a[2]) + a[3]) + a[4]) + a[5]) + a[6]) + a[7];
            return this.index += 8, b
        }, d.prototype.unpack_int8 = function () {
            var a = this.unpack_uint8();
            return a < 128 ? a : a - 256
        }, d.prototype.unpack_int16 = function () {
            var a = this.unpack_uint16();
            return a < 32768 ? a : a - 65536
        }, d.prototype.unpack_int32 = function () {
            var a = this.unpack_uint32();
            return a < Math.pow(2, 31) ? a : a - Math.pow(2, 32)
        }, d.prototype.unpack_int64 = function () {
            var a = this.unpack_uint64();
            return a < Math.pow(2, 63) ? a : a - Math.pow(2, 64)
        }, d.prototype.unpack_raw = function (a) {
            if (this.length < this.index + a) throw new Error("BinaryPackFailure: index is out of range " + this.index + " " + a + " " + this.length);
            var b = this.dataBuffer.slice(this.index, this.index + a);
            return this.index += a, b
        }, d.prototype.unpack_string = function (a) {
            for (var b, c, d = this.read(a), e = 0, f = ""; e < a;) b = d[e], b < 128 ? (f += String.fromCharCode(b), e++) : (192 ^ b) < 32 ? (c = (192 ^ b) << 6 | 63 & d[e + 1], f += String.fromCharCode(c), e += 2) : (c = (15 & b) << 12 | (63 & d[e + 1]) << 6 | 63 & d[e + 2], f += String.fromCharCode(c), e += 3);
            return this.index += a, f
        }, d.prototype.unpack_array = function (a) {
            for (var b = new Array(a), c = 0; c < a; c++) b[c] = this.unpack();
            return b
        }, d.prototype.unpack_map = function (a) {
            for (var b = {}, c = 0; c < a; c++) {
                var d = this.unpack(),
                    e = this.unpack();
                b[d] = e
            }
            return b
        }, d.prototype.unpack_float = function () {
            var a = this.unpack_uint32(),
                b = a >> 31,
                c = (a >> 23 & 255) - 127,
                d = 8388607 & a | 8388608;
            return (0 == b ? 1 : -1) * d * Math.pow(2, c - 23)
        }, d.prototype.unpack_double = function () {
            var a = this.unpack_uint32(),
                b = this.unpack_uint32(),
                c = a >> 31,
                d = (a >> 20 & 2047) - 1023,
                e = 1048575 & a | 1048576,
                f = e * Math.pow(2, d - 20) + b * Math.pow(2, d - 52);
            return (0 == c ? 1 : -1) * f
        }, d.prototype.read = function (a) {
            var b = this.index;
            if (b + a <= this.length) return this.dataView.subarray(b, b + a);
            throw new Error("BinaryPackFailure: read index out of range")
        }, e.prototype.getBuffer = function () {
            return this.bufferBuilder.getBuffer()
        }, e.prototype.pack = function (a) {
            var b = typeof a;
            if ("string" == b) this.pack_string(a);
            else if ("number" == b) Math.floor(a) === a ? this.pack_integer(a) : this.pack_double(a);
            else if ("boolean" == b) !0 === a ? this.bufferBuilder.append(195) : !1 === a && this.bufferBuilder.append(194);
            else if ("undefined" == b) this.bufferBuilder.append(192);
            else {
                if ("object" != b) throw new Error('Type "' + b + '" not yet supported');
                if (null === a) this.bufferBuilder.append(192);
                else {
                    var c = a.constructor;
                    if (c == Array) this.pack_array(a);
                    else if (c == Blob || c == File) this.pack_bin(a);
                    else if (c == ArrayBuffer) i.useArrayBufferView ? this.pack_bin(new Uint8Array(a)) : this.pack_bin(a);
                    else if ("BYTES_PER_ELEMENT" in a) i.useArrayBufferView ? this.pack_bin(new Uint8Array(a.buffer)) : this.pack_bin(a.buffer);
                    else if (c == Object) this.pack_object(a);
                    else if (c == Date) this.pack_string(a.toString());
                    else {
                        if ("function" != typeof a.toBinaryPack) throw new Error('Type "' + c.toString() + '" not yet supported');
                        this.bufferBuilder.append(a.toBinaryPack())
                    }
                }
            }
            this.bufferBuilder.flush()
        }, e.prototype.pack_bin = function (a) {
            var b = a.length || a.byteLength || a.size;
            if (b <= 15) this.pack_uint8(160 + b);
            else if (b <= 65535) this.bufferBuilder.append(218), this.pack_uint16(b);
            else {
                if (!(b <= 4294967295)) throw new Error("Invalid length");
                this.bufferBuilder.append(219), this.pack_uint32(b)
            }
            this.bufferBuilder.append(a)
        }, e.prototype.pack_string = function (a) {
            var b = g(a);
            if (b <= 15) this.pack_uint8(176 + b);
            else if (b <= 65535) this.bufferBuilder.append(216), this.pack_uint16(b);
            else {
                if (!(b <= 4294967295)) throw new Error("Invalid length");
                this.bufferBuilder.append(217), this.pack_uint32(b)
            }
            this.bufferBuilder.append(a)
        }, e.prototype.pack_array = function (a) {
            var b = a.length;
            if (b <= 15) this.pack_uint8(144 + b);
            else if (b <= 65535) this.bufferBuilder.append(220), this.pack_uint16(b);
            else {
                if (!(b <= 4294967295)) throw new Error("Invalid length");
                this.bufferBuilder.append(221), this.pack_uint32(b)
            }
            for (var c = 0; c < b; c++) this.pack(a[c])
        }, e.prototype.pack_integer = function (a) {
            if (-32 <= a && a <= 127) this.bufferBuilder.append(255 & a);
            else if (0 <= a && a <= 255) this.bufferBuilder.append(204), this.pack_uint8(a);
            else if (-128 <= a && a <= 127) this.bufferBuilder.append(208), this.pack_int8(a);
            else if (0 <= a && a <= 65535) this.bufferBuilder.append(205), this.pack_uint16(a);
            else if (-32768 <= a && a <= 32767) this.bufferBuilder.append(209), this.pack_int16(a);
            else if (0 <= a && a <= 4294967295) this.bufferBuilder.append(206), this.pack_uint32(a);
            else if (-2147483648 <= a && a <= 2147483647) this.bufferBuilder.append(210), this.pack_int32(a);
            else if (-0x8000000000000000 <= a && a <= 0x8000000000000000) this.bufferBuilder.append(211), this.pack_int64(a);
            else {
                if (!(0 <= a && a <= 0x10000000000000000)) throw new Error("Invalid integer");
                this.bufferBuilder.append(207), this.pack_uint64(a)
            }
        }, e.prototype.pack_double = function (a) {
            var b = 0;
            a < 0 && (b = 1, a = -a);
            var c = Math.floor(Math.log(a) / Math.LN2),
                d = a / Math.pow(2, c) - 1,
                e = Math.floor(d * Math.pow(2, 52)),
                f = Math.pow(2, 32),
                g = b << 31 | c + 1023 << 20 | e / f & 1048575,
                h = e % f;
            this.bufferBuilder.append(203), this.pack_int32(g), this.pack_int32(h)
        }, e.prototype.pack_object = function (a) {
            var b = Object.keys(a),
                c = b.length;
            if (c <= 15) this.pack_uint8(128 + c);
            else if (c <= 65535) this.bufferBuilder.append(222), this.pack_uint16(c);
            else {
                if (!(c <= 4294967295)) throw new Error("Invalid length");
                this.bufferBuilder.append(223), this.pack_uint32(c)
            }
            for (var d in a) a.hasOwnProperty(d) && (this.pack(d), this.pack(a[d]))
        }, e.prototype.pack_uint8 = function (a) {
            this.bufferBuilder.append(a)
        }, e.prototype.pack_uint16 = function (a) {
            this.bufferBuilder.append(a >> 8), this.bufferBuilder.append(255 & a)
        }, e.prototype.pack_uint32 = function (a) {
            var b = 4294967295 & a;
            this.bufferBuilder.append((4278190080 & b) >>> 24), this.bufferBuilder.append((16711680 & b) >>> 16), this.bufferBuilder.append((65280 & b) >>> 8), this.bufferBuilder.append(255 & b)
        }, e.prototype.pack_uint64 = function (a) {
            var b = a / Math.pow(2, 32),
                c = a % Math.pow(2, 32);
            this.bufferBuilder.append((4278190080 & b) >>> 24), this.bufferBuilder.append((16711680 & b) >>> 16), this.bufferBuilder.append((65280 & b) >>> 8), this.bufferBuilder.append(255 & b), this.bufferBuilder.append((4278190080 & c) >>> 24), this.bufferBuilder.append((16711680 & c) >>> 16), this.bufferBuilder.append((65280 & c) >>> 8), this.bufferBuilder.append(255 & c)
        }, e.prototype.pack_int8 = function (a) {
            this.bufferBuilder.append(255 & a)
        }, e.prototype.pack_int16 = function (a) {
            this.bufferBuilder.append((65280 & a) >> 8), this.bufferBuilder.append(255 & a)
        }, e.prototype.pack_int32 = function (a) {
            this.bufferBuilder.append(a >>> 24 & 255), this.bufferBuilder.append((16711680 & a) >>> 16), this.bufferBuilder.append((65280 & a) >>> 8), this.bufferBuilder.append(255 & a)
        }, e.prototype.pack_int64 = function (a) {
            var b = Math.floor(a / Math.pow(2, 32)),
                c = a % Math.pow(2, 32);
            this.bufferBuilder.append((4278190080 & b) >>> 24), this.bufferBuilder.append((16711680 & b) >>> 16), this.bufferBuilder.append((65280 & b) >>> 8), this.bufferBuilder.append(255 & b), this.bufferBuilder.append((4278190080 & c) >>> 24), this.bufferBuilder.append((16711680 & c) >>> 16), this.bufferBuilder.append((65280 & c) >>> 8), this.bufferBuilder.append(255 & c)
        }
    }, {
        "./bufferbuilder": 11
    }],
    11: [function (a, b, c) {
        function d() {
            this._pieces = [], this._parts = []
        }
        var e = {};
        e.useBlobBuilder = function () {
            try {
                return new Blob([]), !1
            } catch (a) {
                return !0
            }
        }(), e.useArrayBufferView = !e.useBlobBuilder && function () {
            try {
                return 0 === new Blob([new Uint8Array([])]).size
            } catch (a) {
                return !0
            }
        }(), b.exports.binaryFeatures = e;
        var f = b.exports.BlobBuilder;
        "undefined" != typeof window && (f = b.exports.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder), d.prototype.append = function (a) {
            "number" == typeof a ? this._pieces.push(a) : (this.flush(), this._parts.push(a))
        }, d.prototype.flush = function () {
            if (this._pieces.length > 0) {
                var a = new Uint8Array(this._pieces);
                e.useArrayBufferView || (a = a.buffer), this._parts.push(a), this._pieces = []
            }
        }, d.prototype.getBuffer = function () {
            if (this.flush(), e.useBlobBuilder) {
                for (var a = new f, b = 0, c = this._parts.length; b < c; b++) a.append(this._parts[b]);
                return a.getBlob()
            }
            return new Blob(this._parts)
        }, b.exports.BufferBuilder = d
    }, {}],
    12: [function (a, b, c) {
        function d(a, b) {
            if (!(this instanceof d)) return new d(a);
            this._dc = a, e.debug = b, this._outgoing = {}, this._incoming = {}, this._received = {}, this._window = 1e3, this._mtu = 500, this._interval = 0, this._count = 0, this._queue = [], this._setupDC()
        }
        var e = a("./util");
        d.prototype.send = function (a) {
            var b = e.pack(a);
            if (b.size < this._mtu) return void this._handleSend(["no", b]);
            this._outgoing[this._count] = {
                ack: 0,
                chunks: this._chunk(b)
            }, e.debug && (this._outgoing[this._count].timer = new Date), this._sendWindowedChunks(this._count), this._count += 1
        }, d.prototype._setupInterval = function () {
            var a = this;
            this._timeout = setInterval(function () {
                var b = a._queue.shift();
                if (b._multiple)
                    for (var c = 0, d = b.length; c < d; c += 1) a._intervalSend(b[c]);
                else a._intervalSend(b)
            }, this._interval)
        }, d.prototype._intervalSend = function (a) {
            var b = this;
            a = e.pack(a), e.blobToBinaryString(a, function (a) {
                b._dc.send(a)
            }), 0 === b._queue.length && (clearTimeout(b._timeout), b._timeout = null)
        }, d.prototype._processAcks = function () {
            for (var a in this._outgoing) this._outgoing.hasOwnProperty(a) && this._sendWindowedChunks(a)
        }, d.prototype._handleSend = function (a) {
            for (var b = !0, c = 0, d = this._queue.length; c < d; c += 1) {
                var e = this._queue[c];
                e === a ? b = !1 : e._multiple && -1 !== e.indexOf(a) && (b = !1)
            }
            b && (this._queue.push(a), this._timeout || this._setupInterval())
        }, d.prototype._setupDC = function () {
            var a = this;
            this._dc.onmessage = function (b) {
                var c = b.data;
                if (c.constructor === String) {
                    var d = e.binaryStringToArrayBuffer(c);
                    c = e.unpack(d), a._handleMessage(c)
                }
            }
        }, d.prototype._handleMessage = function (a) {
            var b, c = a[1],
                d = this._incoming[c],
                f = this._outgoing[c];
            switch (a[0]) {
                case "no":
                    var g = c;
                    g && this.onmessage(e.unpack(g));
                    break;
                case "end":
                    if (b = d, this._received[c] = a[2], !b) break;
                    this._ack(c);
                    break;
                case "ack":
                    if (b = f) {
                        var h = a[2];
                        b.ack = Math.max(h, b.ack), b.ack >= b.chunks.length ? (e.log("Time: ", new Date - b.timer), delete this._outgoing[c]) : this._processAcks()
                    }
                    break;
                case "chunk":
                    if (!(b = d)) {
                        if (!0 === this._received[c]) break;
                        b = {
                            ack: ["ack", c, 0],
                            chunks: []
                        }, this._incoming[c] = b
                    }
                    var i = a[2],
                        j = a[3];
                    b.chunks[i] = new Uint8Array(j), i === b.ack[2] && this._calculateNextAck(c), this._ack(c);
                    break;
                default:
                    this._handleSend(a)
            }
        }, d.prototype._chunk = function (a) {
            for (var b = [], c = a.size, d = 0; d < c;) {
                var f = Math.min(c, d + this._mtu),
                    g = a.slice(d, f),
                    h = {
                        payload: g
                    };
                b.push(h), d = f
            }
            return e.log("Created", b.length, "chunks."), b
        }, d.prototype._ack = function (a) {
            var b = this._incoming[a].ack;
            this._received[a] === b[2] && (this._complete(a), this._received[a] = !0), this._handleSend(b)
        }, d.prototype._calculateNextAck = function (a) {
            for (var b = this._incoming[a], c = b.chunks, d = 0, e = c.length; d < e; d += 1)
                if (void 0 === c[d]) return void(b.ack[2] = d);
            b.ack[2] = c.length
        }, d.prototype._sendWindowedChunks = function (a) {
            e.log("sendWindowedChunks for: ", a);
            for (var b = this._outgoing[a], c = b.chunks, d = [], f = Math.min(b.ack + this._window, c.length), g = b.ack; g < f; g += 1) c[g].sent && g !== b.ack || (c[g].sent = !0, d.push(["chunk", a, g, c[g].payload]));
            b.ack + this._window >= c.length && d.push(["end", a, c.length]), d._multiple = !0, this._handleSend(d)
        }, d.prototype._complete = function (a) {
            e.log("Completed called for", a);
            var b = this,
                c = this._incoming[a].chunks,
                d = new Blob(c);
            e.blobToArrayBuffer(d, function (a) {
                b.onmessage(e.unpack(a))
            }), delete this._incoming[a]
        }, d.higherBandwidthSDP = function (a) {
            var b = navigator.appVersion.match(/Chrome\/(.*?) /);
            if (b && (b = parseInt(b[1].split(".").shift())) < 31) {
                var c = a.split("b=AS:30");
                if (c.length > 1) return c[0] + "b=AS:102400" + c[1]
            }
            return a
        }, d.prototype.onmessage = function (a) {}, b.exports.Reliable = d
    }, {
        "./util": 13
    }],
    13: [function (a, b, c) {
        var d = a("js-binarypack"),
            e = {
                debug: !1,
                inherits: function (a, b) {
                    a.super_ = b, a.prototype = Object.create(b.prototype, {
                        constructor: {
                            value: a,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    })
                },
                extend: function (a, b) {
                    for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                    return a
                },
                pack: d.pack,
                unpack: d.unpack,
                log: function () {
                    if (e.debug) {
                        for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
                        a.unshift("Reliable: "), console.log.apply(console, a)
                    }
                },
                setZeroTimeout: function (a) {
                    function b(b) {
                        d.push(b), a.postMessage(e, "*")
                    }

                    function c(b) {
                        b.source == a && b.data == e && (b.stopPropagation && b.stopPropagation(), d.length && d.shift()())
                    }
                    var d = [],
                        e = "zero-timeout-message";
                    return a.addEventListener ? a.addEventListener("message", c, !0) : a.attachEvent && a.attachEvent("onmessage", c), b
                }(this),
                blobToArrayBuffer: function (a, b) {
                    var c = new FileReader;
                    c.onload = function (a) {
                        b(a.target.result)
                    }, c.readAsArrayBuffer(a)
                },
                blobToBinaryString: function (a, b) {
                    var c = new FileReader;
                    c.onload = function (a) {
                        b(a.target.result)
                    }, c.readAsBinaryString(a)
                },
                binaryStringToArrayBuffer: function (a) {
                    for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) b[c] = 255 & a.charCodeAt(c);
                    return b.buffer
                },
                randomToken: function () {
                    return Math.random().toString(36).substr(2)
                }
            };
        b.exports = e
    }, {
        "js-binarypack": 10
    }]
}, {}, [3]);