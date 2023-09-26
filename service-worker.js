// Вызов API SidePanel
chrome.sidePanel
    .setPanelBehavior({
        // Открывать наш SidePanel при нажатии
        // на кнопку справа от url
        openPanelOnActionClick: true
    })
    .catch(console.error);