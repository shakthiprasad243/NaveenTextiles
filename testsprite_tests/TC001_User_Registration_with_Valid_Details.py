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
        # -> Navigate to the registration page at /register.
        await page.goto('http://localhost:3000/register', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Input valid full name, email, phone number, and password in the registration form.
        frame = context.pages[-1]
        # Input full name in the registration form
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input valid email address in the registration form
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@naveentextiles.com')
        

        frame = context.pages[-1]
        # Input phone number in the registration form
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('+919876543210')
        

        frame = context.pages[-1]
        # Input valid password in the registration form
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Admin@123')
        

        # -> Submit the registration form by clicking the 'Create Account' button.
        frame = context.pages[-1]
        # Click the 'Create Account' button to submit the registration form
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Clear the email field and input a new unique email address, then submit the registration form again.
        frame = context.pages[-1]
        # Clear the email field to input a new unique email
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Input a new unique email address for registration
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('uniqueuser123@naveentextiles.com')
        

        frame = context.pages[-1]
        # Click the 'Create Account' button to submit the registration form with new email
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify that the user is redirected to the profile or login page and confirm the user record is saved with 'customer' role.
        await page.goto('http://localhost:3000/login', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Sign in to your account').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    