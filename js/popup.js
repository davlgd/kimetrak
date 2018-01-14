'use strict';
(function () {
  const listTrackersHead = document.getElementById('listTrackersHead')
  const listTrackers = document.getElementById('listTrackers')
  const hostnamesList = document.createElement('ol')

  const eventListener = document.getElementById('header')
  eventListener.addEventListener('click', GoToWebsite, false)

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

    let moreDetailsText = document.createTextNode(chrome.i18n.getMessage('getMoreStats'))
    moreDetails.appendChild(moreDetailsText)

    document.getElementById('moreDetails').appendChild(moreDetails)
  }

  function FillRequestsList (list) {
    while (hostnamesList.firstChild) hostnamesList.removeChild(hostnamesList.firstChild)
    for (let i = 0; i < list.length; i++) {
      const hostname = list[i]
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
        document.createTextNode(chrome.i18n.getMessage('getMoreStats'))
        listTrackersHead.textContent = chrome.i18n.getMessage('popupTitle', [infos.count, textPlural, infos.hostname])
        FillRequestsList(infos.thirdPartysHostnames)
      } else {
        listTrackersHead.textContent = chrome.i18n.getMessage('popupTitleNone')
        listTrackers.textContent = ''
      }
    } catch (e) {
      console.error(e)
    }
  }

  function GoToWebsite () {
    window.open('http://www.kimetrak.fr')
  }
})()
