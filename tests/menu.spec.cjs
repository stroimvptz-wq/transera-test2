const {test,expect}=require('playwright/test');
test('transport group keeps fleet and taxi reachable, AI occupies two columns',async({page})=>{
 await page.route('https://functions.yandexcloud.net/**',r=>r.abort());await page.goto('/');await page.waitForFunction(()=>!!db&&document.querySelector('.ai-home-tile'));await page.evaluate(()=>{currentUser={email:'menu@example.test'};document.getElementById('landing').hidden=true;transeraAccess={state:'active'};render();});
 await expect(page.locator('.champagne-menu>[data-page=taxi]')).toHaveCount(0);await expect(page.locator('.champagne-menu>[data-page=trips]')).toHaveCount(0);
 const ai=await page.locator('.ai-home-tile').boundingBox(),tile=await page.locator('[data-page=transport]').boundingBox();expect(ai.width).toBeGreaterThan(tile.width*1.8);
 await page.locator('[data-page=transport]').click();await expect(page.locator('.champagne-transport-menu>.champagne-tile')).toHaveCount(3);await page.locator('.champagne-transport-menu [data-page=fleet]').click();await expect(page.locator('.champagne-fleet-menu [data-page=taxi]')).toBeVisible();await page.locator('[data-go-home]').click();await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);const mobile=await page.locator('.ai-home-tile').boundingBox();expect(mobile.width).toBeGreaterThan(340);
});
