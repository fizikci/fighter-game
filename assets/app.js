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
    
    var database = firebase.database();

    firebase.database().ref('/player1').once('value').then(function(snapshot) {
        _.$apply(function(){
            _.player1 = snapshot.val();
        });
    });
});
