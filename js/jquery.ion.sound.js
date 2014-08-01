﻿/**
 * jQuery.Ion.Sound
 * version 2.0.1 Build 32
 * © 2014 Denis Ineshin | IonDen.com
 *
 * Project page:    http://ionden.com/a/plugins/$.ionSound/en.html
 * GitHub page:     https://github.com/IonDen/$.ionSound
 *
 * Released under MIT licence:
 * http://ionden.com/a/plugins/licence-en.html
 */

(function ($) {

    var warn = function (text) {
        if (text && console) {
            if (console.warn && typeof console.warn === "function") {
                console.warn(text);
            } else if (console.log && typeof console.log === "function") {
                console.log(text);
            }
        }
    };

    if ($.ionSound) {
        warn("$.ionSound already exists!");
        return;
    }

    if (typeof Audio !== "function" && typeof Audio !== "object") {
        var func = function () {
            warn("HTML5 Audio is not supported in this browser");
        };
        $.ionSound = function () {};
        $.ionSound.play = func;
        $.ionSound.stop = func;
        $.ionSound.destroy = func;
        func();
        return;
    }



    var settings = {},
        sounds = {},
        sounds_num,
        can_play_mp3,
        ext,
        i;



    var Sound = function (options) {
        this.name = options.name;
        this.volume = settings.volume || 0.5;
        this.preload = settings.preload ? "auto" : "none";
        this.loop = false;
        this.sound = null;

        if ("volume" in options) {
            this.volume = +options.volume;
        }

        if ("preload" in options) {
            this.preload = options.preload ? "auto" : "none"
        }
    };

    Sound.prototype = {
        init: function () {
            this.sound = new Audio();
            this.sound.src = settings.path + this.name + ext;
            this.sound.load();
            this.sound.preload = this.preload;
            this.sound.volume = this.volume;

            this.sound.addEventListener("ended", this._ended.bind(this), false);
        },

        play: function (obj) {
            if (!obj) {
                obj = {};
            }

            if (obj.volume) {
                this.volume = +obj.volume;
                this.sound.volume = this.volume;
            }

            if (obj.loop) {
                this._playLoop(obj.loop);
            } else {
                this.loop = false;
                this._play();
            }
        },

        _play: function () {
            try {
                this.sound.currentTime = 0;
            } catch (e) {}

            this.sound.play();
        },

        _playLoop: function (loop) {
            if (typeof loop === "boolean") {
                // FF 3.6 and iOS,
                // sound.loop = true not supported or buggy
                this.loop = 9999999;
                this._play();
            } else if (typeof loop === "number") {
                this.loop = loop - 1;
                this._play();
            }
        },

        _ended: function () {
            if (this.loop > 0) {
                this.loop -= 1;
                this._play();
            }
        },

        stop: function () {
            this.loop = false;
            this.sound.pause();

            try {
                this.sound.currentTime = 0;
            } catch (e) {}
        },

        destroy: function () {
            this.stop();
            this.sound.removeEventListener("ended", this._ended.bind(this), false);
            this.sound.src = "";
            this.sound = null;
        }
    };



    var checkSupport = function () {
        var sound_item = new Audio();
        can_play_mp3 = sound_item.canPlayType("audio/mpeg");

        switch (can_play_mp3) {
            case "probably":
            case "maybe":
                ext = ".mp3";
                break;
            default:
                ext = ".ogg";
                break;
        }

        sound_item = null;
    };

    var createSound = function (obj) {
        sounds[obj.name] = new Sound(obj);
        sounds[obj.name].init();
    };

    $.ionSound = function (options) {
        settings = JSON.parse(JSON.stringify(options));
        settings.path = settings.path || "";
        settings.volume = settings.volume || 0.5;
        settings.preload = settings.preload || false;
        settings.mix = settings.mix || true;

        sounds_num = settings.sounds.length;

        if (!sounds_num) {
            warn("No sound-files provided!");
            return;
        }

        checkSupport();

        for (i = 0; i < sounds_num; i++) {
            createSound(settings.sounds[i]);
        }
    };

    $.ionSound.version = "2.0.1";

    $.ionSound.play = function (name, options) {
        if (sounds[name]) {
            sounds[name].play(options);
        }
    };

    $.ionSound.stop = function (name) {
        if (name && sounds[name]) {
            sounds[name].stop();
        } else {
            for (i in sounds) {
                if (!sounds.hasOwnProperty(i)) {
                    continue;
                }
                if (sounds[i]) {
                    sounds[i].stop();
                }
            }
        }
    };

    $.ionSound.destroy = function (name) {
        if (name && sounds[name]) {
            sounds[name].destroy();
            sounds[name] = null;
        } else {
            for (i in sounds) {
                if (!sounds.hasOwnProperty(i)) {
                    continue;
                }
                if (sounds[i]) {
                    sounds[i].destroy();
                    sounds[i] = null;
                }
            }
        }
    };

} (jQuery));
