"use strict";
(function() {
	const listTrackersHead = document.getElementById("listTrackersHead");
	const listTrackers = document.getElementById("listTrackers");
	const hostnamesList = document.createElement("ol");
	listTrackers.appendChild(hostnamesList);
	
	AddMoreDetailsButton();	
	GetInfosFromBG();

	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) 
	{
		GetInfosFromBG();
	});
	
	function AddMoreDetailsButton()
	{
		let moreDetails = document.createElement('a');
		moreDetails.setAttribute("href", "chrome-extension://" + chrome.runtime.id + "/html/showResults.html");
		moreDetails.setAttribute("target", "_blank");
		moreDetails.setAttribute("class", "button");

		let moreDetailsText = document.createTextNode("Obtenir plus de détails");
		moreDetails.appendChild(moreDetailsText);

		document.getElementById("moreDetails").appendChild(moreDetails);
	}

	function FillRequestsList(list, nodeToUpdate)
	{
		while (nodeToUpdate.firstChild) nodeToUpdate.removeChild(nodeToUpdate.firstChild);

		for (let i = 0; i < list.length; i++) 
		{
			const hostname = new URL(list[i].url).hostname;
			const hostnameText = document.createTextNode(hostname);
			const listElement = document.createElement("li");
			const hostnameLink = document.createElement("a");
			hostnameLink.setAttribute("href", "http://" + hostname);
			hostnameLink.setAttribute("target", "_blank");

			hostnameLink.appendChild(hostnameText);
			listElement.appendChild(hostnameLink);
			nodeToUpdate.appendChild(listElement);
		}
	}

	function GetInfosFromBG()
	{
		chrome.runtime.sendMessage({action:"thisTabRequests"}, function(response) 
		{
			const infos = JSON.parse(response);
			if (infos.count > 0)
			{
				const textPlural = infos.count < 2 ? " domaine tiers sur " : " domaines tiers sur ";
				const fullTitle = infos.count + textPlural + infos.hostname;

				document.createTextNode("Obtenir plus de détails");
				listTrackersHead.textContent = fullTitle;
				
				FillRequestsList(infos.content, hostnamesList);
			}
			else
			{
				listTrackersHead.textContent = "Aucun domaine tiers détecté" + infos.hostname;
				listTrackers.textContent = "";
			}	
		});
	}
})();