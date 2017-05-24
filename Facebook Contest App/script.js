/* 
Using Facebook's Graph API to Track Users Who Liked A Post
by Christopher Merrill
*/

document.addEventListener('DOMContentLoaded', bindButtons);

/* This function controls the behavior carried out when the "Submit" button is pressed */

function bindButtons(){
	document.getElementById('submitForm').addEventListener('click', function(event){
		//Create a new HTTP request
		var req = new XMLHttpRequest();  

		//Get the postID and the Access Token value from the user for use in the API call
		var postIDValue = document.getElementById('postID').value; 
		var pageIDValue = document.getElementById('pageID').value;  
		var tokenValue = document.getElementById('token').value; 
		
		//Contruct a URL for the API call that utilizes the entered post ID and Access Token value
		var url = "https://graph.facebook.com/v2.3/" + postIDValue + "/likes?access_token=" + tokenValue;
		
		//Make the API call
		req.open("GET", url, false); 
		req.addEventListener('load',function(){
			//If the request status is valid, display the users who liked the post
			if(req.status >= 200 && req.status < 400){
				var response = JSON.parse(req.responseText); //Parse the response
				var matches = []; //This array will hold the eligible users
				
				//Add the number of post likes to the page
				var numLikes = response.data.length;
				document.getElementById('likes').textContent = numLikes;
				
				//Update the table headers for the participants section (purely for layout)
				var table = document.getElementById('results')
				var headerRow = table.insertRow(0);
				var userName = headerRow.insertCell(0);
				var userID = headerRow.insertCell(1);
				var eligibility = headerRow.insertCell(2);
				userName.innerHTML = "<center><b>User Name</b></center>";
				userID.innerHTML = "<center><b>User ID</b></center>";
				eligibility.innerHTML = "<center><b>Eligible</b></center>";
				
				//Populate the participants table with name and id info
				for(i = 0; i < numLikes; i++) {
					//Update the participants section with each user's name and id
					var row = table.insertRow(i + 1);
					var name = row.insertCell(0);
					var id = row.insertCell(1);
					var likedPage = row.insertCell(2);
					name.innerHTML = response.data[i].name;
					id.innerHTML = "<center>" + response.data[i].id + "</center>";
					
					
					//PERFORM A SECOND API CALL to test if this user also likes your page. If so, add them to the matches array
					var req2 = new XMLHttpRequest(); 
					var url2 = "https://graph.facebook.com/v2.3/" + response.data[i].id + "/likes/" + pageIDValue + "?access_token=" + tokenValue;
					req2.open("GET", url2, false); 
					
					//Asynchronous Call:
					req2.addEventListener('load',function(){
						if(req2.status >= 200 && req2.status < 400){
							var response2 = JSON.parse(req2.responseText);
							//If the user likes the page and the post, push them to the matches array and update their eligibility 
							if (response2.data.length != 0) {
								matches.push(response.data[i]);
								likedPage.innerHTML = "<center>Yes</center>";
							}
							//If the user doesn't like the page, update their eligibility 
							else {
								likedPage.innerHTML = "<center>No</center>";
							}
								
						} 
						else {
							console.log("Error in network request: " + req2.statusText);
						}});	
					req2.send(null); //no need to send additional data
				}
				//Update the number of eligible participants
				document.getElementById('participants').textContent = matches.length;
				
				//Choose a winner
				var randomNumber = Math.floor(Math.random()*(matches.length)); 
				document.getElementById('winner').textContent = matches[randomNumber].name + " (User ID: " + matches[randomNumber].id + ")"; 
			} 
			//If the request status isn't valid, display an error message with the request status
			else {
				console.log("Error in network request: " + req.statusText);
			}});	
		req.send(null);         //no need to send additional data
		event.preventDefault(); //prevent the page from refreshing
	})
}
