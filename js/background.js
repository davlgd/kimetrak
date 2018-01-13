'use strict';
(function () {
  const domains = new Map()

  browser.runtime.onMessage.addListener(async (msg) => {
    try {
      switch (msg.action) {
        case 'thirdPartyRequests':
          return Array.from(domains.values()).map(d => d.toJson())
        case 'thisTabRequests':
          const tabInfos = await currentTab()
          const domain = domains.get(new URL(tabInfos.url).hostname)
          if (domain) {
            return domain.toJson()
          } else {
            console.log("no data send")
          }
          break
      }
    } catch (e) {
      console.error(e)
    }
    return true
  })

  browser.webRequest.onCompleted.addListener(async (thisRequest) => {
    try {
      if (thisRequest.tabId < 1) {
        return
      }
      const currentTabInfo = await currentTab()
      const tabinfo = await browser.tabs.get(thisRequest.tabId)

      if (!tabinfo.url.startsWith('http')) {
        return
      }

      const hostname = new URL(tabinfo.url).hostname
      let domain = domains.get(hostname)
      if (!domain) {
        domain = new Domain(hostname)
        domains.set(hostname, domain)
      }
      domain.addThirdParty(thisRequest)

      if (currentTabInfo && tabinfo.id === currentTabInfo.id) {
        UpdateBadgeCountAndColor(domain.thirdPartys.size, true)
        browser.runtime.sendMessage({action: 'Update'}).catch(e => console.error(e))
      }
    } catch (e) {
      console.error(e)
    }
  },
  {urls: ['<all_urls>']}
  )

  browser.tabs.onActivated.addListener(async () => {
    try {
      const currentTabInfo = await currentTab()
      const hostname = new URL(currentTabInfo.url).hostname
      let domain = domains.get(hostname)
      if (domain) {
        UpdateBadgeCountAndColor(domain.thirdPartys.size, true)
      } else {
        UpdateBadgeCountAndColor(0, false)
      }
    } catch (e) {
      console.error(e)
    }
  })

  async function currentTab () {
    try {
      const tabs = await browser.tabs.query({active: true, currentWindow: true})
      return tabs[0]
    } catch (e) {
      console.error(e)
    }
  }

  function UpdateBadgeCountAndColor (count, useColor) {
    let countObject = {text: count.toString()}
    let colorObject = {color: '#9E9E9E'}

    if (useColor) {
      if (count < 20) colorObject = {color: 'green'}
      else if (count < 50) colorObject = {color: '#E47F26'}
      else colorObject = {color: '#A93226'}
    }

    browser.browserAction.setBadgeText(countObject)
    browser.browserAction.setBadgeBackgroundColor(colorObject)
  }
  const mainHostNameRegex = new RegExp(/[a-z\-_0-9]+\.[a-z]+$/)
  const cdnRegex = new RegExp(/[cdn]\.[a-z]+$/)

  class Domain {
    constructor (hostname) {
      this.hostname = hostname
      this.mainHostName = this.getMainHostName(hostname)
      this.thirdPartys = new Map()
    }
    addThirdParty (request) {
      if (this.isThirdPartyDomain(request)) {
        const thirdParty = new ThirdParty(request)
        if (!cdnRegex.exec(thirdParty.data.hostname)) {
          this.thirdPartys.set(thirdParty.key, thirdParty)
        }
      }
      return this
    }
    getMainHostName (hostname) {
      return mainHostNameRegex.exec(hostname)[0]
    }
    isThirdPartyDomain (request) {
      return !cdnRegex.exec(request.url) && request.url.indexOf(this.mainHostName) === -1
    }
    toJson () {
      const requests = Array.from(this.thirdPartys.values()).map(r => r.toJson())
      return {
        hostname: this.hostname,
        requests,
        count: requests.length
      }
    }
  }

  class ThirdParty {
    constructor (request) {
      this.data = this.extractDataFromRequest(request)
    }
    get key () {
      return this.data.fullUrl
    }
    extractDataFromRequest (request) {
      const requestURL = new URL(request.url)

      return {
        iframe: (request.frameId > 0),
        ip: request.ip,
        secure: (requestURL.protocol === 'https:'),
        timeStamp: request.timeStamp,
        type: request.type,
        url: requestURL.protocol + '//' + requestURL.hostname + requestURL.pathname,
        fullUrl: request.url,
        hostname: requestURL.hostname,
        pathname: requestURL.pathname
      }
    }
    toJson () {
      return {
        ...this.data
      }
    }
  }
})()
