"use strict";
(function() {
	const analyzeMaxDelay = 5000;
	const emptyRequestsList = {
		content:{}, 
		count:0, 
		hostname:""
	};
	
	let timer;
	let thirdPartyRequestsArray = [];
	let isUpdatable = true;
	let thisTab = new Object();
	let lastTabVerified = new Object();
	
	sessionStorage.setItem("thisTabRequests", JSON.stringify(emptyRequestsList));

	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) 
	{sendResponse(sessionStorage.getItem(msg.action));});

	chrome.tabs.onActivated.addListener(function (tab)
	{
		if (tab.tabId > 0)
		{
			chrome.tabs.get(tab.tabId, function (tabInfos)
			{
				ClearAndNotify("Changement d'onglet", false)
				ShowOldTabInfos(tabInfos);
				lastTabVerified = tabInfos;
			});
		}
	});
	
	chrome.webNavigation.onCommitted.addListener(function(thisCommit)
	{
		if (thisTab.id)
		{
			chrome.tabs.get(thisTab.id, function (tabInfos)
			{
				const isNewURL = tabInfos.url != thisTab.url;
				const isRefresh = tabInfos.url == thisTab.url && (thisCommit.transitionType == "reload" ||thisCommit.transitionType == "link");

				if ((isNewURL || isRefresh) && thisTab.url && tabInfos.id == thisTab.id)
				{
					if (isNewURL) ClearAndNotify("Changement d'URL", true);
					if (isRefresh) ClearAndNotify("Rafraichissement de page", true);

					thisTab = tabInfos;
					thisTab.hostname = new URL(tabInfos.url).hostname;
				}				
			});
		}
	});

	chrome.webRequest.onCompleted.addListener(function(thisRequest) 
	{
		if (thisRequest.tabId == thisTab.id) chrome.tabs.get(thisTab.id, function(thisTabInfo){
		
				const thisTabHostname = new URL(thisTabInfo.url).hostname;
				const thisRequestHostname = new URL(thisRequest.url).hostname;

				if (thisTabInfo.url.startsWith("http"))
				{
					if (isThirdPartyDomain(thisTabHostname, thisRequestHostname))
					{				
						if (thirdPartyRequestsArray.findIndex(i => new URL(i.url).hostname === thisRequestHostname) == -1 && isUpdatable)
						{
							const requestToLog = ExtractDataFromRequest(thisRequest);
							
							clearTimeout(timer);
							UpdateThisTabRequestsList(requestToLog);
							chrome.runtime.sendMessage({action:"Update"});
							timer = setTimeout(LogAndStoreResult, analyzeMaxDelay);
							UpdateBadgeCountAndColor(thirdPartyRequestsArray.length, true);
						}
					}
					else console.log("Requête first-party : " + thisRequestHostname);
				}
			}
		)},
		{urls: ["<all_urls>"]}
	);
	
	function LogAndStoreResult()
	{
		let tabsInfos = JSON.parse(sessionStorage.getItem("tabsInfos"));
		let result = {
			hostname: new URL(thisTab.url).hostname, 
			requests: thirdPartyRequestsArray, 
			count: thirdPartyRequestsArray.length
		};
		
		if (!tabsInfos) tabsInfos = [];
		tabsInfos[thisTab.id] = result;
		sessionStorage.setItem("tabsInfos", JSON.stringify(tabsInfos));

		let requestsInfos = JSON.parse(sessionStorage.getItem("thirdPartyRequests"));
		if (!requestsInfos) requestsInfos = [];
		requestsInfos.push(result);
		requestsInfos.sort();
		sessionStorage.setItem("thirdPartyRequests", JSON.stringify(requestsInfos));
		
		console.log(result);
		isUpdatable = false;

		chrome.browserAction.setBadgeBackgroundColor({color: "black"});
	}

	function ClearAndNotify(message, updateStatus)
	{
		clearTimeout(timer);
		isUpdatable = updateStatus;
		thirdPartyRequestsArray = [];
		chrome.browserAction.setBadgeText({text:""});
		chrome.browserAction.setBadgeBackgroundColor({color:"green"});
		sessionStorage.setItem("thisTabRequests", JSON.stringify(emptyRequestsList));
		
		if (message) console.log(message);
	}

	function isThirdPartyDomain(site, request)
	{		
		if (site.startsWith("www.")) site = site.substr(4);
		return (request.indexOf(site) != -1) ? false:true;
	}
	
	function ExtractDataFromRequest(request)
	{
		const requestURL = new URL(request.url);

		return {
			iframe:(request.frameId > 0) ? true:false,
			ip:request.ip,
			secure:(requestURL.protocol == "https:") ? true:false,
			timeStamp:request.timeStamp,
			type:request.type,
			url:requestURL.protocol + "//" + requestURL.hostname + requestURL.pathname
		};
	}
	
	function UpdateThisTabRequestsList(request)
	{
		thirdPartyRequestsArray.push(request);		
		thirdPartyRequestsArray.sort(function(a, b)
		{
			const urlA = new URL(a.url).hostname;
			const urlB = new URL(b.url).hostname;

			if (urlA < urlB) return -1;
			else if (urlA > urlB) return 1;
			return 0;
		});
		
		const result = {
			content:thirdPartyRequestsArray, 
			count:thirdPartyRequestsArray.length, 
			hostname: new URL(thisTab.url).hostname
		};

		sessionStorage.setItem("thisTabRequests", JSON.stringify(result));
	}

	function ShowOldTabInfos(tab)
	{
		thisTab = tab;
		thisTab.hostname = new URL(tab.url).hostname;

		const tabsInfos = JSON.parse(sessionStorage.getItem("tabsInfos"));

		if (tabsInfos)
		{
			if (tabsInfos[tab.id] && thisTab.hostname == tabsInfos[tab.id].hostname) 
			{
				const result = {
					content:tabsInfos[tab.id].requests, 
					count:tabsInfos[tab.id].count, 
					hostname:tabsInfos[tab.id].hostname};

				sessionStorage.setItem("thisTabRequests", JSON.stringify(result));
				UpdateBadgeCountAndColor(tabsInfos[tab.id].count);
			}
		}
	}
	
	function UpdateBadgeCountAndColor(count, useColor)
	{
		let countObject = {text:count.toString()};
		let colorObject = {color:"#9E9E9E"};

		if (useColor)
		{
			if (count < 20) colorObject = {color:"green"};
			else if (count < 50) colorObject = {color:"#E47F26"};
			else colorObject = {color:"#A93226"};
		}

		chrome.browserAction.setBadgeText(countObject);
		chrome.browserAction.setBadgeBackgroundColor(colorObject);
	}
})();