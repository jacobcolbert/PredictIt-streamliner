  var tc={};
  
  tc.id=location.href.match(/(?<=detail\/)\d*/g)[0];
  var id=tc.id;
  var storageDict={"relatedHidden":false,"chartHidden":false,"notesHeight":"150px"};
  storageDict[tc.id] = "";
  storageDict["rulesHidden"+tc.id] = false;
  chrome.storage.sync.get(storageDict, (storage) => {
    if (document.body.classList.contains('PIe-init')) {
      //return;
    }
    document.body.classList.add('PIe-init');
    tc.chartHidden=storage.chartHidden;
    tc.relatedHidden=storage.relatedHidden;
    tc.notes=storage[tc.id];
    tc.notesHeight=storage.notesHeight;
    tc.rulesHidden=storage["rulesHidden"+tc.id];
    checkElement('.market-header-title-large__watch').then((div) => {
      addNotesButton(div);
      createNotesPanel();
      addRulesButton(div);
      var title = document.querySelector(".market-header-title-large__text");
      if (!title) {
        return;
      }
      resizeIfNeeded(title,div,0);        
    }).catch( error =>  console.log(error) );
    checkElement('.market-related').then((panel) => {
      panel.querySelector('.collapsible-panel__content').classList.add('PIe-init');
      addRelatedPanelListener(panel);
      if (tc.relatedHidden){
        toggleRelatedPanel(panel);
        tc.relatedHidden=true;
        chrome.storage.sync.set({"relatedHidden":tc.relatedHidden},function(){});
      }
    }).catch( error =>  console.log(error) );
    checkElement('.market-history__title').then((div) => {
      div = div.parentNode.parentNode;
      div.onclick = (e) => {
        div.onclick=null;
        checkElement('.market-history__content').then((panel) => {
          addHistoryPanelListener(panel.parentNode.parentNode.parentNode);
        }).catch( error =>  console.log(error) );
      }
    },(div) => {
      console.log("Failed to find market history");
    }).catch( error =>  console.log(error) );
    var panel=document.createElement("div");
    panel.classList.add('PIe-chart');
    checkElement('.charts-timeline').then((tabs) => {
      chart=tabs.parentElement;
      if (chart.classList.contains('PIe-init')) {
        return;
      }
      chart.classList.add('PIe-init');
      createPanel(panel,chart);
      chart.appendChild(panel);
      addButton(chart);
      if (tc.chartHidden) {
        toggleButton(chart.querySelector('.PIe-chart-button').firstChild);
        toggleChart(panel);
        tc.chartHidden=true;
        chrome.storage.sync.set({"chartHidden":tc.chartHidden},function(){});
      }
    }).catch( error =>  console.log(error) );
    
    checkElement('.charts-table').then((table) => {
      chart=table.parentElement;
      createPanel(panel,chart);
    },(table) => {
      console.log("Failed to find chart table.  ");
    }).catch( error =>  console.log(error) );
    
    checkAllElements('.market-contract-horizontal-v2__title-text').then((markets) => {
      labelMarkets(markets);
    },(markets) => {
      console.log("Failed to find markets.  ");
    }).catch( error =>  console.log(error) );
  });
  
  function createPanel(panel,chart) {
    [...chart.children].forEach((child) => {
      if (child.classList && (child.classList.contains('charts-timeline') || child.classList.contains('PIe-chart'))) {
        return;
      }
      chart.removeChild(child);
      panel.appendChild(child);
    });
  }
  
  function addButton(chart) {
    var div = document.createElement("li");
    var arrow = document.createElement("img");
    arrow.src = chrome.runtime.getURL("icons/expanded.png");
    arrow.classList.add('PIe-chart-img');
    div.appendChild(arrow);
    div.classList.add("PIe-chart-button");
    chart.querySelector('.charts-timeline__tabs-type').firstChild.appendChild(div);
    div.onclick = (event) => {
      toggleButton(arrow);
      var chart = document.querySelector('.PIe-chart');
      toggleChart(chart);
    }
  }
  
  function resizeIfNeeded(title,iconsDiv,depth) {
    if (depth > 5) {
      return;
    }
    var titleRect = title.getBoundingClientRect();
    var iconsRect = iconsDiv.getBoundingClientRect();
    var overlap = !(titleRect.right < iconsRect.left || 
          titleRect.left > iconsRect.right || 
          titleRect.bottom < iconsRect.top || 
          titleRect.top > iconsRect.bottom);
    if (overlap) {
      var currentSize = parseInt(window.getComputedStyle(title)["fontSize"],10);
      title.style.fontSize = currentSize*.97+"px";
      resizeIfNeeded(title,iconsDiv,depth+1);
    }
  }
  
  function toggleButton(arrow) {
    if (arrow.classList && arrow.classList.contains("PIe-collapsed")){
      arrow.src = chrome.runtime.getURL("icons/expanded.png");
      arrow.classList.remove("PIe-collapsed");
      tc.chartHidden = false;
    } else {
      arrow.src = chrome.runtime.getURL("icons/collapsed.png");
      arrow.classList.add("PIe-collapsed");
      tc.chartHidden = true;
    }
    chrome.storage.sync.set({"chartHidden":tc.chartHidden},function(){});
  }
  
  function toggleChart(chart) {
    if (chart.classList.contains("PIe-hidden")){
      chart.classList.remove("PIe-hidden");
    } else {
      chart.classList.add("PIe-hidden");
    }
  }
  
  function addRelatedPanelListener(panel) {
    panel.onclick = (e) => {
      toggleRelatedPanel(panel)
    } 
  }
  
  function toggleRelatedPanel(panel) {
    contentPanel=panel.querySelector('.collapsible-panel__content');
    if (contentPanel.classList.contains('PIe-init') && !contentPanel.classList.contains('PIe-hidden')) {
      panel.firstChild.classList.remove('collapsible-panel--is-open');
      contentPanel.classList.add('PIe-hidden');
      tc.relatedHidden=true;
    } else {
      panel.firstChild.classList.add('collapsible-panel--is-open');
      contentPanel.classList.remove('PIe-hidden');
      tc.relatedHidden=false;
    }
    contentPanel.classList.add('PIe-init');
    chrome.storage.sync.set({"relatedHidden":tc.relatedHidden},function(){});
  }
  
  function addHistoryPanelListener(panel) {
    panel.onclick = (e) => {
      toggleHistoryPanel(panel);
    } 
  }
  
  function toggleHistoryPanel(panel) {
    var contentPanel=panel.querySelector('.collapsible-panel__content');
    if (contentPanel.classList.contains('PIe-init') && !contentPanel.classList.contains('PIe-hidden')) {
      panel.firstChild.classList.remove('collapsible-panel--is-open');
      contentPanel.classList.add('PIe-hidden');
    } else {
      panel.firstChild.classList.add('collapsible-panel--is-open');
      contentPanel.classList.remove('PIe-hidden');
    }
    contentPanel.classList.add('PIe-init');
  }
  
  function createNotesPanel(){
    var container=document.createElement("div");
    container.classList.add("PIe-notes-container");
    container.classList.add("PIe-hidden");
    container.innerHTML = `<div class="PIe-notes-header market-detail__payout-header">
                           <div class="market-detail__payout-header-col-1">Notes</div>
                         </div>
                         <div class="PIe-notes-content">
                            <textarea class="PIe-notes" style="height: `+tc.notesHeight+`;">`+tc.notes+`</textarea>
                         </div>
                         <div class="PIe-notes-button-row">
                          <button class="PIe-notes-discard button button--primary">Discard Changes</button><button class="PIe-notes-save button button--primary">Save</button>
                         </div>`;
    var marketHeader=document.querySelector('.market-header-title-large');
    marketHeader.parentElement.insertBefore(container,marketHeader.nextSibling);
    container.querySelector('.PIe-notes-save').onclick = (event) => {
      var notes=container.querySelector('.PIe-notes');
      var map = {};
      map["notesHeight"] = notes.offsetHeight + "px";
      map[tc.id] = notes.value;
      chrome.storage.sync.set(map,function() { console.log("Text saved: "+map[tc.id]) });
      tc.notes = map[tc.id];
      if (map[tc.id] !== "") {
        document.querySelector(".PIe-notes-icon").classList.remove("PIe-gray");
      } else {
        document.querySelector(".PIe-notes-icon").classList.add("PIe-gray");
      }
    };
    container.querySelector('.PIe-notes-discard').onclick = (event) => {
      container.querySelector('.PIe-notes').value = tc.notes;
    };
  }
  
  function addNotesButton(div){
    var button=document.createElement("img");
    button.src=chrome.runtime.getURL("icons/notes.png");
    button.classList.add("PIe-notes-icon");
    button.title = "Open/Close Notes";
    if (tc.notes === "") {
      button.classList.add("PIe-gray");
    }
    div.appendChild(button);
    button.onclick = (event) => {
      document.querySelector(".PIe-notes-container").classList.toggle("PIe-hidden");
    }
  }
  
  function addRulesButton(div){
    var button=document.createElement("img");
    button.src=chrome.runtime.getURL("icons/rules.png");
    button.classList.add("PIe-rules-icon");
    button.title = "Hide Rules";
    if (tc.rulesHidden) {
      button.classList.add("PIe-gray");
      button.title = "Show Rules";
      document.querySelector(".market-rules").classList.add("PIe-hidden");
    }
    div.appendChild(button);
    button.onclick = (event) => {
      tc.rulesHidden = !tc.rulesHidden;
      document.querySelector(".market-rules").classList.toggle("PIe-hidden");
      button.classList.toggle("PIe-gray");
      if (tc.rulesHidden) {
        button.title = "Show Rules";
      }
      else {
        button.title = "Hide Rules";
      }
      var map={};
      map["rulesHidden"+tc.id] = tc.rulesHidden;
      chrome.storage.sync.set(map,function() {});
    }
  }
  
  function labelMarkets(markets) {
    var count = 1;
    markets.forEach( (market) => {
      if (market.textContent.match(/\d/)) {
        var title = document.createElement("span");
        title.textContent = "B" + count + ") ";
        title.style.fontSize = "24px";
        market.parentElement.insertBefore(title,market)
        count++;
      }
    });
  }
  
  checkElement = async selector => {
    var timeout = 5000;
    var initTime = performance.now();
    var time = 0;
    while (document.querySelector(selector) === null && time < initTime + timeout) {
      time = await new Promise( resolve =>  requestAnimationFrame(resolve) );
      if (time > initTime + timeout) {
        console.log("Timed out");
        return Promise.reject(400);
      }
    }
    return document.querySelector(selector);
  };
  
  checkAllElements = async selector => {
    var timeout = 5000;
    var initTime = performance.now();
    var time = 0;
    while (document.querySelectorAll(selector).length === 0 && time < initTime + timeout) {
      time = await new Promise( resolve =>  requestAnimationFrame(resolve) );
      if (time > initTime + timeout) {
        console.log("Timed out");
        return Promise.reject(400);
      }
    }
    return document.querySelectorAll(selector);
  };