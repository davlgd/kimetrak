'use strict';
(function () {
  const listTrackersHead = document.getElementById('listTrackersHead')
  const listTrackers = document.getElementById('listTrackers')
  const hostnamesList = document.createElement('ol')
  listTrackers.appendChild(hostnamesList)

  AddMoreDetailsButton()
  GetInfosFromBG()

  browser.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    GetInfosFromBG()
  })

  function AddMoreDetailsButton () {
    let moreDetails = document.createElement('a')
    moreDetails.setAttribute('href', browser.runtime.getURL('html/showResults.html'))
    moreDetails.setAttribute('target', '_blank')
    moreDetails.setAttribute('class', 'button')

    let moreDetailsText = document.createTextNode('Obtenir plus de détails')
    moreDetails.appendChild(moreDetailsText)

    document.getElementById('moreDetails').appendChild(moreDetails)
  }

  function FillRequestsList (list) {
    while (hostnamesList.firstChild) hostnamesList.removeChild(hostnamesList.firstChild)
    for (let i = 0; i < list.length; i++) {
      const hostname = new URL(list[i].url).hostname
      const hostnameText = document.createTextNode(hostname)
      const listElement = document.createElement('li')
      const hostnameLink = document.createElement('a')
      hostnameLink.setAttribute('href', 'http://' + hostname)
      hostnameLink.setAttribute('target', '_blank')

      hostnameLink.appendChild(hostnameText)
      listElement.appendChild(hostnameLink)
      hostnamesList.appendChild(listElement)
    }
  }

  async function GetInfosFromBG () {
    try {
      const infos = await browser.runtime.sendMessage({action: 'thisTabRequests'})
      if (infos && infos.count > 0) {
        const textPlural = infos.count < 2 ? ' domaine tiers sur ' : ' domaines tiers sur '
        const fullTitle = infos.count + textPlural + infos.hostname
        document.createTextNode('Obtenir plus de détails')
        listTrackersHead.textContent = fullTitle
        FillRequestsList(infos.requests)
      } else {
        listTrackersHead.textContent = 'Aucun domaine tiers détecté'
        listTrackers.textContent = ''
      }
    } catch (e) {
      console.error(e)
    }
  }
})()
