/* Public test URL only. serverReady is enabled after Yandex deployment verification. */
window.BIZNES_AI_CHAT_CONFIG=Object.freeze({environment:'test',serverReady:true,apiUrl:'https://functions.yandexcloud.net/d4e090b4l93rg3lmfkcs'});
if(window.BIZNES_AI_CHAT_CONFIG.serverReady)window.BIZNES_AI_CONTENT_CONFIG=Object.freeze({...window.BIZNES_AI_CONTENT_CONFIG,voiceApiUrl:window.BIZNES_AI_CHAT_CONFIG.apiUrl});
