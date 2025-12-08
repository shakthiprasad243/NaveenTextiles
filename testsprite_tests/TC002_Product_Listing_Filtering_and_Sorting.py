import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on 'Men' category to navigate to product listing page.
        frame = context.pages[-1]
        # Click on 'Men' category link to go to product listing page
        elem = frame.locator('xpath=html/body/header/div/div/div/nav/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Shirts' subcategory filter to apply it.
        frame = context.pages[-1]
        # Click on 'Shirts' subcategory filter
        elem = frame.locator('xpath=html/body/header/div[2]/div[2]/div/div/div[2]/div/ul/li/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the price range filter button '₹1,000 - ₹2,000' to apply it.
        frame = context.pages[-1]
        # Click on price range filter '₹1,000 - ₹2,000' to apply it
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[2]/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Apply color filters by clicking on 'Blue' and 'White' color buttons to verify products match selected colors without page reload.
        frame = context.pages[-1]
        # Click on 'Blue' color filter button
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click on 'White' color filter button
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[4]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Apply size filters by clicking on 'S' and 'M' size buttons to verify products match selected sizes without page reload.
        frame = context.pages[-1]
        # Click on 'S' size filter button
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[6]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click on 'M' size filter button
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[6]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Sort products by price ascending using the sort dropdown to verify products reorder correctly without page reload.
        frame = context.pages[-1]
        # Click on sort dropdown to open options
        elem = frame.locator('xpath=html/body/main/div/div[4]/div/div/div/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Reset Filters' button to verify that all filters clear and product listing resets without page reload.
        frame = context.pages[-1]
        # Click on 'Reset Filters' button to clear all filters and reset product listing
        elem = frame.locator('xpath=html/body/main/div/div[4]/aside/div/div[7]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Shirts').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Formal Cotton Shirt').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Classic Linen Shirt').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Test Product').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹1,499').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹1,299').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹999').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Blue').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=White').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=S').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=M').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Price: Low to High').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    