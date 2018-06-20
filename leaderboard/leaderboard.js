import { Template } from 'meteor/templating'
PlayersList = new Mongo.Collection('players');
CpuUtil = new Mongo.Collection('cpuutil');

Meteor.methods({
    'createPlayer': function(playerNameVar){
	var os = require('os');
        console.log(os.cpus()[0]['times']['user']);
        var cpuUser = os.cpus()[0]['times']['user'];
	var date = new Date();
	var time = date.getTime();
	CpuUtil.insert({time,cpuUser});
	console.log(CpuUtil.find({}).fetch());
        check(playerNameVar, String);
	var currentUserId = Meteor.userId();
        if(currentUserId){
        PlayersList.insert({
            name: playerNameVar,
            score: 0,
            createdBy: currentUserId
         });
        }
    },

   'removePlayer': function(selectedPlayer){
    check(selectedPlayer, String);
    var currentUserId = Meteor.userId();
    if(currentUserId){
        PlayersList.remove({ _id: selectedPlayer, createdBy: currentUserId });
    }
   },

   'updateScore': function(selectedPlayer, scoreValue){
    check(selectedPlayer, String);
    check(scoreValue, Number);
    var currentUserId = Meteor.userId();
    if(currentUserId){
        PlayersList.update( { _id: selectedPlayer, createdBy: currentUserId },
                            { $inc: {score: scoreValue} });
    }
  }


});




if(Meteor.isServer){
   // var os = require('os');
   // console.log(os.cpus());
    //console.log("Hello server");
    Meteor.publish('thePlayers', function(){
	var currentUserId = this.userId;
        return PlayersList.find({ createdBy: currentUserId });
    });
    Meteor.publish('cpuUtil', function(){
	//var rowId = this.rowId;
        return CpuUtil.find();
    });
}

if(Meteor.isClient){
    Meteor.subscribe('thePlayers');
    Meteor.subscribe('cpuUtil');
     
    Template.leaderboard.helpers({

    'player': function(){
        //return PlayersList.find();
	console.log(CpuUtil.find({}).fetch());
        var currentUserId = Meteor.userId();
	return PlayersList.find({ createdBy: currentUserId }, { sort: {score: -1, name: 1} });
     },

     'getcpu':function(){
	//console.log(CpuUtil.find());
	return CpuUtil.find();
     },

    'selectedClass': function(){
        var playerId = this._id;
        var selectedPlayer = Session.get('selectedPlayer');
        if(playerId == selectedPlayer){
          return "selected"
        }
    },

    'selectedPlayer': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        return PlayersList.findOne({ _id: selectedPlayer });
    },
    });

    Template.leaderboard.events({
    'click .player': function(){
        Session.set('selectedPlayer', this._id);
    },

    'click .increment': function(){
    var selectedPlayer = Session.get('selectedPlayer');
    //PlayersList.update({ _id: selectedPlayer }, { $inc: {score: 5}});
    Meteor.call('updateScore', selectedPlayer, 5);
    },

    'click .decrement': function(){
    var selectedPlayer = Session.get('selectedPlayer');
    //PlayersList.update({ _id: selectedPlayer }, { $inc: {score: -5}});
    Meteor.call('updateScore', selectedPlayer, -5);
    },
 
    'click .remove': function(){
    var selectedPlayer = Session.get('selectedPlayer');
    //PlayersList.remove({ _id: selectedPlayer });
    Meteor.call('removePlayer', selectedPlayer);
    }
   });

   Template.addPlayerForm.events({
    'submit form': function(event){
    event.preventDefault();
    var playerNameVar = event.target.playerName.value;
    /*PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: Meteor.userId()
    });*/
    Meteor.call('createPlayer',playerNameVar);

    event.target.playerName.value = "";
    }
   });

   /*Template.leaderboard.onRendered(function () {
    this.$('#remove-input').confirmation();
   });*/

}

