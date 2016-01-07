/*****
In My Freezer
A one-page application that allows users to create a profile,
then save freezers to that profile filled with foods of their choice.

Created by Isabeau Kisler

*****/

var Freezer = function(freezerName, contents) {
	that = this;
	that.name = ko.observable(freezerName);
	that.contents = ko.observableArray(contents);
	that.selected = ko.observable(false);
};

var ViewModel = function() {
	that = this;
	this.freezers = [{name: 'main01'},{name: 'second01'}]; //ko.observableArray();
	this.chosenFreezer = ko.observable();
	this.chosenFreezerContents = ko.observableArray();

	var ref = new Firebase("https://inmyfreezer.firebaseio.com/user/test");

	ref.on("value", function(snapshot) {
		//that.freezers.removeAll();
		console.log(snapshot.val());

		var info = snapshot.val();


		for(freezer in info) {
			var rawContents = info[freezer].split(',');
			var freezerContents = [];

			for(var i=0; i<rawContents.length; i++) {
				freezerContents.push({item: rawContents[i]});
			}

			that.chosenFreezer(freezer);
			that.chosenFreezerContents(freezerContents);

			//that.freezers.push({name: freezer});

			//that.freezers.push(new Freezer(freezer, freezerContents));

		}

		//console.log(that.freezers[0].name + " " + that.freezers[0].contents);
		//console.log(that.freezers());


	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	this.switchFreezer = function() {
		console.log('switch');
	};

};

ko.applyBindings(new ViewModel());