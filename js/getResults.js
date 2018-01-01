"use strict";
(function() {
    chrome.runtime.sendMessage({action:"thirdPartyRequests"}, function(response) 
    {
        const infos = JSON.parse(response);
        
        if (infos.length > 0)
        {
            const TPData = ExtractData (infos);
            console.log(TPData);
            ShowSummary (TPData);

            const title = document.getElementById("listTrackersHead");
            title.textContent = "Listes des domaines tiers détectés par Kimetrak";
            
            const list = document.getElementById("listTrackers");
            list.textContent = "Voici le détails de l'ensemble des domaines tiers détectés sur chaque site visité :";

            for (let i = 0; i < infos.length; i++)
            {
                if (infos[i]) 
                {
                    ShowDetailedLists(infos[i], i, list);
                }
            }
        }
    });

    function ShowSummary(dataSource)
    {
        const summary = document.getElementById("summary");
            summary.textContent = "Sur l'ensemble de la session en cours, nous avons détecté " 
                + dataSource.all.length 
                + " requêtes vers " 
                + dataSource.thirdPartyDomains.length
                + " domaines tiers chargés depuis "
                + dataSource.sites.length
                + " site(s) que vous avez visités, dont "
                + dataSource.thirdPartyDomainsToDisplay.length 
                + " depuis plus d'un site :";

            const mshUL = document.createElement("ul");
            summary.appendChild(mshUL);

            for (let i = 0; i < dataSource.thirdPartyDomainsToDisplay.length; i++)
            {
                let mshLI = document.createElement("li");
                mshUL.appendChild(mshLI);
                mshLI.textContent = dataSource.thirdPartyDomainsToDisplay[i];
            }
    }
    
    function ShowDetailedLists(dataSource, site, nodeToUpdate)
    {
        const mainUL = document.createElement('ul');
        const mainLI = document.createElement('li');

        mainLI.setAttribute("class", "source");
        mainLI.setAttribute("id", "source-" + site);
        mainLI.textContent = dataSource.hostname + " (" + dataSource.requests.length + ") :";
        nodeToUpdate.appendChild(mainUL);
        mainUL.appendChild(mainLI);
        
        const eventListener = document.getElementById("source-" + site); 
        eventListener.addEventListener("click", SwitchFoldableLists, false); 

        const secondaryUL = document.createElement('ul');
        secondaryUL.setAttribute("class", "foldable");
        secondaryUL.setAttribute("id", "list-" + site);
        mainUL.appendChild(secondaryUL);
        
        for (let j = 0; j < dataSource.requests.length; j++)
        {
            const li = document.createElement('li');
            li.textContent = dataSource.requests[j].type + " : " ;

            const lien = document.createElement('a');
            lien.setAttribute("href", dataSource.requests[j].url);
            lien.setAttribute("target", "_blank");
            lien.textContent = new URL(dataSource.requests[j].url).hostname;

            secondaryUL.appendChild(li);
            li.appendChild(lien);
        }
    }
    
    function ExtractData(requestsArray)
    {
        let all = [];
        let deduplicated = [];
        let thirdPartyDomains = [];
        let thirdPartyDomainsNb = [];
        let thirdPartyDomainsToDisplay = [];
        let sites = [];

        for (let i = 0; i < requestsArray.length; i++)
        {
            if (sites.indexOf(requestsArray[i].hostname) == -1) sites.push(requestsArray[i].hostname);

            for (let j = 0; j < requestsArray[i].requests.length; j++)
            {
                all.push({request:new URL(requestsArray[i].requests[j].url).hostname, source:requestsArray[i].hostname});
            }
        }

        deduplicated = Array.from(new Set(all.map(JSON.stringify))).map(JSON.parse);

        for (let i = 0; i < deduplicated.length; i++)
        {
            if (thirdPartyDomains.indexOf(deduplicated[i].request) == -1) thirdPartyDomains.push(deduplicated[i].request);
            if (!thirdPartyDomainsNb[deduplicated[i].request])
            {
                thirdPartyDomainsNb[deduplicated[i].request] = 1;
            }
            else thirdPartyDomainsNb[deduplicated[i].request]++;
        }

        thirdPartyDomains.sort();

        for (let i = 0; i < thirdPartyDomains.length; i++)
        {
            if (thirdPartyDomainsNb[thirdPartyDomains[i]] > 1) thirdPartyDomainsToDisplay.push(thirdPartyDomains[i] + " (" + thirdPartyDomainsNb[thirdPartyDomains[i]] + ")");
        }

        return {
            all: all,
            deduplicated: deduplicated,
            thirdPartyDomains: thirdPartyDomains,
            thirdPartyDomainsNb: thirdPartyDomainsNb,
            thirdPartyDomainsToDisplay: thirdPartyDomainsToDisplay,
            sites: sites
        };
    }

    function SwitchFoldableLists(e)
    {
        const className = e.srcElement.id;
        const listName = className.replace("source","list");
        
        let newValue = document.getElementById(listName).attributes.class.value == "unfolded" ? "foldable" : "unfolded";
        document.getElementById(listName).setAttribute("class", newValue);

        newValue = document.getElementById(className).attributes.class.value == "source_unfolded" ? "source" : "source_unfolded";
        document.getElementById(className).setAttribute("class", newValue);
    }
})();