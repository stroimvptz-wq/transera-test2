const { test, expect } = require('playwright/test');
// Isolated UI fixtures: browser tests never sign in to, or write to, the live database.
test.beforeEach(async ({ page }) => {
  await page.route('https://functions.yandexcloud.net/**',route=>route.fulfill({json:{ok:true,user:{email:'browser-tests@example.test',full_name:'Проверка'},verified:true,subscription:{active:true}}}));
  await page.addInitScript(()=>sessionStorage.setItem('business-start-entered','true'));await page.goto('/');
  await page.waitForFunction(()=>typeof db!=='undefined'&&db&&document.querySelector('.champagne-menu'));
  await page.evaluate(()=>{document.getElementById('landing').hidden=true;sessionStorage.setItem('business-ai-test2-auth-token','isolated-fixture');currentUser={email:'browser-tests@example.test',full_name:'Проверка'};transeraAccess={state:'active'};page='home';render();});
});
test('digits append and Backspace works in current calculator fields',async({page})=>{
  await page.locator('.champagne-tile[data-page="business"]').click();await page.locator('.champagne-tile[data-page="transport"]').click();await page.locator('.champagne-tile[data-page="calculators"]').click();
  for(const key of ['distance','rate','markup','forwarderCosts']){
    const input=page.locator('[data-field="'+key+'"]');await input.fill('');await input.pressSequentially('1234');await expect(input).toHaveValue('1234');await input.press('Backspace');await expect(input).toHaveValue('123');
  }
});
test('calculation updates while focus stays on the active field',async({page})=>{
 await page.locator('.champagne-tile[data-page="business"]').click();await page.locator('.champagne-tile[data-page="transport"]').click();await page.locator('.champagne-tile[data-page="calculators"]').click();
 const distance=page.locator('[data-field="distance"]');await distance.fill('');await distance.pressSequentially('1000');await expect(distance).toHaveValue('1000');await expect(distance).toBeFocused();
 const rate=page.locator('[data-field="rate"]');await rate.fill('');await rate.pressSequentially('50');await expect(rate).toHaveValue('50');await expect(page.locator('#live-results')).toContainText(/50\s000/);
});
test('appearance saves independently of profile and survives page reload',async({page})=>{
 await page.locator('.champagne-profile-link[data-page="account"]').click();await page.locator('[data-account-tab="appearance"]').click();await page.locator('[data-preview-theme="light"]').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');await page.locator('#appearance-form [type="submit"]').click();await expect(page.locator('#appearance-status')).toHaveText('Оформление сохранено.');expect(await page.evaluate(()=>localStorage.getItem('biznes-ai-appearance:browser-tests@example.test'))).toBe('light');
 await page.locator('[data-account-tab="profile"]').click();await expect(page.locator('[data-profile-edit]')).toBeVisible();await page.reload();await page.evaluate(()=>{sessionStorage.setItem('business-ai-test2-auth-token','isolated-fixture');currentUser={email:'browser-tests@example.test',full_name:'Проверка'};document.getElementById('landing').hidden=true;transeraAccess={state:'active'};render();});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

