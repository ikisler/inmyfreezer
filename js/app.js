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
	this.deleteFreezerConfirm = ko.observable();

	this.userName = ko.observable();
	this.ref = new Firebase("https://inmyfreezer.firebaseio.com/user/");
	this.userRef;
	this.authData = this.ref.getAuth();

	this.loginButton = document.getElementsByClassName('login-button')[0];
	this.logoutMessage = document.getElementsByClassName('logged-in')[0];
	this.deleteFreezerMessage = document.getElementsByClassName('delete-freezer-message')[0];
	this.addDeleteFreezers = document.getElementsByClassName('add-delete-freezer-container')[0];
	this.freezerContentsTable = document.getElementsByClassName('freezer-contents')[0];
	this.introContainer = document.getElementsByClassName('intro-container')[0];
	this.emptyFreezer = document.getElementsByClassName('empty-freezer')[0];


	this.login = function() {
		that.ref.authWithOAuthPopup("google", function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
				if (error.code === "TRANSPORT_UNAVAILABLE") {
					that.ref.authWithOAuthRedirect("google", function(error) {
						if(error) {
							console.log('Login failed!', error);
						}
					});
				}
			} else {
				// Successful login
				that.userRef = new Firebase("https://inmyfreezer.firebaseio.com/user/" + authData.uid);
				that.userName(' ' + authData.google.displayName);
				that.displayInfo();
				that.loginButton.className += ' hidden';
				that.introContainer.className += ' hidden';
				that.logoutMessage.className = that.logoutMessage.className.replace(' hidden', '');
				that.addDeleteFreezers.className = that.addDeleteFreezers.className.replace(' hidden', '');
				that.freezerContentsTable.className = that.freezerContentsTable.className.replace(' hidden', '');
			}
		});
	};

	this.logout = function() {
		that.ref.unauth();
		that.loginButton.className = that.loginButton.className.replace(' hidden', '');
		that.introContainer.className = that.introContainer.className.replace(' hidden', '');
		that.logoutMessage.className += ' hidden';
		that.addDeleteFreezers.className += ' hidden';
		that.freezerContentsTable.className += ' hidden';
		document.location.reload();
	};

	this.displayInfo = function() {
		that.userRef.on('value', function(snapshot) {
			// Empty the freezers array
			that.freezers.removeAll();

			that.info = snapshot.val();

			// If there isn't any information, show a message.
			// Otherwise, show info from the database.
			if(!that.info) {
				console.log('No information');
			} else {
				// Put the freezer info into the freezer array
				for(freezer in that.info) {
					var rawContents = that.info[freezer].trim();

					// If it starts with a comma, remove the comma
					if(rawContents[0] === ',') {
						rawContents = rawContents.slice(1, rawContents.length);
					}
					
					// If there are no items, create a freezer with no items
					if(!rawContents) {
						that.emptyFreezer.className = that.emptyFreezer.className.replace(/(hidden)/g, '');
						that.freezers.push(new Freezer(freezer));
					} else {
						// Otherwise, create a freezer with items
						rawContents = rawContents.split(',');
						var freezerContents = [];

						that.emptyFreezer.className += ' hidden';

						for(var i=0; i<rawContents.length; i++) {
							freezerContents.push({item: rawContents[i]});
						}

						that.freezers.push(new Freezer(freezer, freezerContents));
					}

				}

				// Automatically assign the results to show the first freezer if it hasn't been chosen already
				if(!that.chosenFreezer()) {
					that.chosenFreezer(that.freezers()[0].name());
					that.chosenFreezerContents(that.freezers()[0].contents());

				}
			}

		}, function (errorObject) {
			console.log("The read failed: " + errorObject.code);
		});
	};

	// If the user is already logged in, reflect that
	if(this.authData) {
		that.userRef = new Firebase("https://inmyfreezer.firebaseio.com/user/" + that.authData.uid);
		that.userName(' ' + that.authData.google.displayName);
		that.displayInfo();
		that.loginButton.className += ' hidden';
		that.introContainer.className += ' hidden';
		that.logoutMessage.className = that.logoutMessage.className.replace(' hidden', '');
		that.addDeleteFreezers.className = that.addDeleteFreezers.className.replace(' hidden', '');
		that.freezerContentsTable.className = that.freezerContentsTable.className.replace(' hidden', '');
	}

	this.addItem = function() {
		var currentFreezerRef = that.userRef.child(that.chosenFreezer());
		var currentFreezerContentsRaw = that.info[that.chosenFreezer()];
		var newItem = document.getElementsByClassName('add-item-input')[0];

		// Add the new item to the list of raw data
		currentFreezerContentsRaw+= ',' + newItem.value;
		// Push the new list to the database
		currentFreezerRef.set(
			currentFreezerContentsRaw
		);

		// Update the chosen freezer's contents
		for(var i=0; i<that.freezers().length; i++) {
			if(that.chosenFreezer() === that.freezers()[i].name()) {
				that.chosenFreezerContents(that.freezers()[i].contents());
			}
		}

		// Clear the input box
		newItem.value = '';
	};

	this.removeItem = function(item) {
		var currentFreezerRef = that.userRef.child(that.chosenFreezer());
		var currentFreezerContentsRaw = that.info[that.chosenFreezer()];
		var formattedItem = item.item + ',';

		for(var i=0; i<that.freezers().length; i++) {
			if(that.chosenFreezer() === that.freezers()[i].name()) {

				// Remove the item from the raw information, and any unnecessary commas
				currentFreezerContentsRaw = currentFreezerContentsRaw.replace(item.item,'');
				currentFreezerContentsRaw = currentFreezerContentsRaw.replace(',,', ',');

				if(currentFreezerContentsRaw[currentFreezerContentsRaw.length-1] === ',') {
					currentFreezerContentsRaw = currentFreezerContentsRaw.slice(0, currentFreezerContentsRaw.length-1);
				}

				// Push the new list to the database
				currentFreezerRef.set(
					currentFreezerContentsRaw,
					function(error) {
						if(error) {
							console.log(error);
						} else {
							console.log("success");
						}
					}
				);

				// Update the chosen freezer's contents
				that.chosenFreezerContents(that.freezers()[i].contents());
			}
		}
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

	this.addFreezer = function() {
		var newFreezerNameInput = document.getElementsByClassName('add-freezer-input')[0];
		var newFreezerName = newFreezerNameInput.value;

		that.userRef.child(newFreezerName).set(
			' '
		);

		newFreezerNameInput.value = '';
	};

	this.removeFreezer = function() {
		// Display confirm message
		that.deleteFreezerMessage.className = that.deleteFreezerMessage.className.replace(' hidden', '');
	};

	this.confirmRemoveFreezer = function() {
		if(that.deleteFreezerConfirm() === 'yes') {
			var currentFreezerRef = that.userRef.child(that.chosenFreezer());

			currentFreezerRef.remove(function(error) {
				if(error) {
					console.log(error);
				} else {
					console.log('success');
					if(that.freezers().length === 0) {
						that.freezers.removeAll();
						that.chosenFreezer('');
						that.chosenFreezerContents.removeAll();
					}
				}
			});

			var freezersRadio = document.getElementsByClassName('freezers-radio');
			if(freezersRadio[0]) {
				freezersRadio[0].checked = true;
				that.switchFreezer();
			}
		}

		document.getElementsByClassName('delete-freezer-message')[0].className += ' hidden';

		return true;
	};

};

ko.applyBindings(new ViewModel());
