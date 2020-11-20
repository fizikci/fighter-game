var _ = null;

var app = angular.module('app', []);
app.controller('MainController', function ($scope) {

    _ = $scope;

    firebase.initializeApp({
        apiKey: "AIzaSyAO0r7L9PTR8C65nErplupQyntNC4oJBLk",
        authDomain: "fighter-game-keskin.firebaseapp.com",
        databaseURL: "https://fighter-game-keskin.firebaseio.com",
        projectId: "fighter-game-keskin",
        storageBucket: "fighter-game-keskin.appspot.com",
        messagingSenderId: "330716838991",
        appId: "1:330716838991:web:9d4adc9f8a4ce46f21fe3a",
        measurementId: "G-7BXF2SJRCF"
    });

    _.characters = ['Ang','Katara','Sokka','Toph','Zuko'];
    
    _.db = firebase.database();

    _.state = 'init';

    _.userId = getCookie('userId');
    if(!_.userId){
        _.state = 'login';
        _.user = {name:'Guest', character:_.characters[Math.random()*_.characters.length]};
    }
    else
        _.db.ref('users/' + _.userId).once('value').then(function(snapshot) {
            _.$applyAsync(()=>{
                if(snapshot.exists()){
                    _.user = snapshot.val();
                    if(_.user.currentGameRef)
                        _.startExistingGame(_.user.currentGameRef);
                    else
                        _.state = 'start-game';
                }
                else {
                    _.state = 'login';
                    _.user = {name:'Guest', character:_.characters[Math.random()*_.characters.length]};
                    _.userId = null;
                }
            });
        });
    
    _.addUser = function(){
        var newUserRef = _.db.ref('users').push();
        newUserRef.set(_.user).then(function(){
            _.$applyAsync(()=>{
                setCookie("userId", newUserRef.key);
                _.userId = newUserRef.key;
                _.state = 'start-game';
            });
        });
    }

    _.startGame = function(){
        _.db.ref('users').orderByChild("waitingForGame").equalTo(true).limitToFirst(1).once('value', snap => {
            _.$applyAsync(()=>{
                if(snap.exists()){
                    var opponent = Object.values(snap.val())[0];
                    _.opponentId = Object.keys(snap.val())[0];

                    var game = {players:{}};
                    game.players[_.opponentId] = {
                        health:100, location:{x:80, y:20}, character:opponent.character, name:opponent.name, state:'stand2'
                    };
                    game.players[_.userId] = {
                        health:100, location:{x:20, y:20}, character:_.user.character, name:_.user.name, state:'stand2'
                    };

                    _.gameId = _.db.ref('games').push(game).path.pieces_[1];
                    _.game = game;
                    _.state = 'in-game';

                    opponent.waitingForGame = false;
                    opponent.currentGameRef = _.gameId;
                    _.db.ref('users/'+_.opponentId).set(opponent);

                    _.user.waitimgForGame = false;
                    _.user.currentGameRef = _.gameId;
                    _.db.ref('users/'+_.userId).set(_.user);

                    _.db.ref('games/'+_.gameId).on('value',function(snap){
                        _.$applyAsync(()=>_.gameUpdated(snap.val()));
                    });
                }
                else {
                    _.user.waitingForGame = true;
                    _.db.ref('users/'+_.userId).set(_.user).then(()=>{
                        let whenGameAssigned = snap => {
                            _.$applyAsync(()=>{
                                var val = snap.val();
                                if(val.currentGameRef){
                                    _.startExistingGame(val.currentGameRef);
                                    _.db.ref('users/'+_.userId).off('value', whenGameAssigned);
                                }
                            });
                        };
                        _.db.ref('users/'+_.userId).on('value', whenGameAssigned);
                    });
                }
            });
        });
    }

    _.startExistingGame = function(gameRef){
        _.gameId = gameRef;
        _.state = 'in-game';
        _.db.ref('games/'+gameRef).on('value',function(snap){
            _.opponentId = Object.keys(snap.val().players).filter(k=>k!=_.userId)[0];
            _.$applyAsync(()=>_.gameUpdated(snap.val()));
        });
    }

    _.gameUpdated = function(g){
        _.game = g;
        _.me = g.players[_.userId];
        _.opponent = g.players[_.opponentId];
    }

    _.move = e => {

        var me = _.game.players[_.userId];
        var op = _.game.players[_.opponentId];

        if(e.code=="ArrowUp"){
            me.location.y = 50;
            me.state = 'jump';
            _.setMe(me);
            setTimeout(()=>{me.state='stand'; me.location.y = 20; _.setMe(me)}, 300);
        }
        else if(e.code=="ArrowLeft"){
            me.location.x = Math.max(0, me.location.x - 3);
            _.setMe(me);
        }
        else if(e.code=="ArrowRight"){
            me.location.x = Math.min(80, me.location.x + 3);
            _.setMe(me);
        }
        else if(e.code=="KeyQ"){
            me.state = 'punch1';
            _.setMe(me);
            setTimeout(()=>{me.state='punch2'; _.setMe(me)}, 150);
            setTimeout(()=>{me.state='stand2'; _.setMe(me)}, 300);

            setTimeout(()=>{op.state='hit'; _.setOp(op)}, 150);
            setTimeout(()=>{op.state='stand2'; _.setOp(op)}, 300);
        }
        
    }

    _.setMe = function(me){
        _.db.ref(`games/${_.gameId}/players/${_.userId}`).set(me);
    }
    _.setOp = function(op){
        _.db.ref(`games/${_.gameId}/players/${_.opponentId}`).set(op);
    }
});









function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}