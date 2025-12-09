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
        # -> Click on Login to access the login page for admin authentication.
        frame = context.pages[-1]
        # Click on Login link to go to login page
        elem = frame.locator('xpath=html/body/header/div/div/div/div/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input admin email and password, then click Sign In to access admin dashboard.
        frame = context.pages[-1]
        # Input admin email
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@naveentextiles.com')
        

        frame = context.pages[-1]
        # Input admin password
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Admin@123')
        

        frame = context.pages[-1]
        # Click Sign In button to login as admin
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Retry admin login by clicking the Sign In button again or check for any error messages on the login page.
        frame = context.pages[-1]
        # Retry clicking Sign In button to attempt admin login again
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try to navigate directly to the admin dashboard or offers management page to bypass login screen.
        await page.goto('http://localhost:3000/admin/dashboard', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Navigate back to home page and look for any visible links or menus that might lead to admin or offers management section.
        frame = context.pages[-1]
        # Click Go Home button to return to homepage
        elem = frame.locator('xpath=html/body/main/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the 'Admin' button to access the admin dashboard or offers management section.
        frame = context.pages[-1]
        # Click the 'Admin' button in the top right corner to access admin dashboard
        elem = frame.locator('xpath=html/body/header/div/div/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Admin Panel' to access the admin dashboard and start creating offers.
        frame = context.pages[-1]
        # Click 'Admin Panel' to access admin dashboard
        elem = frame.locator('xpath=html/body/header/div/div/div/div/div/div/a[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Offers' menu to navigate to the offers management page to create new offers.
        frame = context.pages[-1]
        # Click on 'Offers' menu to manage and create offers
        elem = frame.locator('xpath=html/body/main/div/div/aside/nav/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Create Offer' button to start creating the first offer (percentage discount).
        frame = context.pages[-1]
        # Click 'Create Offer' button to create a new offer
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill the form to create a percentage discount offer and submit it.
        frame = context.pages[-1]
        # Input offer title for percentage discount
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Holiday Percentage Discount')
        

        frame = context.pages[-1]
        # Input offer description for percentage discount
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[2]/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Get 15% off on all products during holidays')
        

        frame = context.pages[-1]
        # Input coupon code for percentage discount
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('HOLIDAY15')
        

        frame = context.pages[-1]
        # Input discount percentage as 15
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[4]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('15')
        

        frame = context.pages[-1]
        # Input minimum order value as 1000
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[5]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('1000')
        

        frame = context.pages[-1]
        # Input max discount as 500
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[5]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('500')
        

        frame = context.pages[-1]
        # Input valid from date
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[6]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2025-12-09')
        

        frame = context.pages[-1]
        # Input valid till date
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[6]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2025-12-31')
        

        frame = context.pages[-1]
        # Input usage limit as 100
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[7]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('100')
        

        # -> Click 'Create Offer' button to save the percentage discount offer.
        frame = context.pages[-1]
        # Click 'Create Offer' button to save the percentage discount offer
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div[4]/div/form/div[9]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Create Offer' button to start creating the fixed amount discount offer.
        frame = context.pages[-1]
        # Click 'Create Offer' button to create a new offer
        elem = frame.locator('xpath=html/body/main/div/div/main/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Exclusive Buy One Get One Free Offer').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test plan execution failed: Admins could not create offers with different discount types (percentage, fixed, BOGO), or users could not apply valid coupons with correct discounts during checkout.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    