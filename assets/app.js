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
    
    _.database = firebase.database();

    var userId = getCookie('userId');
    if(!userId)
        _.user = {name:''};
    else
        _.database.ref('/users/' + userId).once('value').then(function(snapshot) {
            _.user = snapshot.val();
        });
    
    _.addUser = function(){
        var newUserRef = _.database.ref('/users').push();
        newUserRef.set(_.user).then(function(){
            setCookie("userId", newUserRef.key);
        });
    };

    _.startGame = function(){
        var ref = _.database.ref("games");
        ref.orderByChild("started").equalTo(false).once("value", function(snapshot) {
            _.game = snapshot.val();

        });
        _.database.ref('/player1').on('value', function(snapshot) {
            try{
                _.$applyAsync(function(){
                    _.player1 = snapshot.val();
                    console.log(_.player1);
                });
            }
            catch{}
        });
    };

    _.move = e => {
        console.log(e.code);
        var loc = {x:_.player1.location.x, y:_.player1.location.y};
        if(e.code=="ArrowUp")
            loc.y = 50;
        else if(e.code=="ArrowLeft")
            loc.x = Math.max(0, loc.x - 3);
        else if(e.code=="ArrowRight")
            loc.x = Math.min(80, loc.x + 3);
          
        _.database.ref('/player1/location').set(loc);
    };
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