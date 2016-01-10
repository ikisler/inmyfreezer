/*****
In My Freezer
A one-page application that allows users to create a profile,
then save freezers to that profile filled with foods of their choice.

Created by Isabeau Kisler

-- Get info from freezers and display it
-- Add item to freezer
-- Create freezer/delete freezer
-- Create/delete user
-- Login/out

*****/

var Freezer = function(freezerName, freezerContents) {
	var that = this;
	that.name = ko.observable(freezerName);
	that.contents = ko.observableArray(freezerContents);
	that.selected = ko.observable(false);
	
};

var ViewModel = function() {
	var that = this;
	this.freezers = ko.observableArray();
	this.chosenFreezer = ko.observable();
	this.chosenFreezerContents = ko.observableArray();
	this.info;

	var ref = new Firebase("https://inmyfreezer.firebaseio.com/user/test");

	ref.on("value", function(snapshot) {
		//that.freezers.removeAll();

		that.info = snapshot.val();


		for(freezer in that.info) {
			var rawContents = that.info[freezer].split(',');
			var freezerContents = [];

			for(var i=0; i<rawContents.length; i++) {
				freezerContents.push({item: rawContents[i]});
			}

			that.freezers.push(new Freezer(freezer, freezerContents));
			//console.log(that.freezers()[0].name() + " " + that.freezers()[0].contents());

		}

		// Automatically assign the results to show the first freezer
		that.chosenFreezer(that.freezers()[0].name());
		that.chosenFreezerContents(that.freezers()[0].contents());

	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});

	this.addItem = function() {
		var currentFreezerRef = ref.child(that.chosenFreezer());
		var currentFreezerContents = that.info[that.chosenFreezer()];
		var newItem = document.getElementsByClassName('add-item-input')[0].value;

		currentFreezerContents+= ',' + newItem;

		currentFreezerRef.set(
			currentFreezerContents
		);
	};

	this.switchFreezer = function() {
		var freezersRadio = document.getElementsByClassName('freezers-radio');

		// Sort through the radio buttons and see which is checked.
		// Then check to see which freezer matches.
		// When a match is found, assign it to the chosenFreezer and chosenFreezerContents.
		for(var i=0; i<freezersRadio.length; i++) {
			if(freezersRadio[i].checked) {
				for(var j=0; j<that.freezers().length; j++) {
					if(freezersRadio[i].value === that.freezers()[j].name()) {
						that.chosenFreezer(that.freezers()[j].name());
						that.chosenFreezerContents(that.freezers()[j].contents());

						return false;
					}
				}
				return false;
			}
		}
	};

	this.createFreezer = function(freezerName, freezerContents) {
		ref.set({
			name: freezerName,
			contents: freezerContents
		});
	};

};

ko.applyBindings(new ViewModel());