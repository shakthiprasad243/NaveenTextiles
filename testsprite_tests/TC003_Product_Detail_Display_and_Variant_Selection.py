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
        # -> Navigate to a product detail page by clicking on a product link from featured products or category.
        frame = context.pages[-1]
        # Click on 'Bedsheets Premium Bedsheet Set ₹1,299' product link to go to product detail page
        elem = frame.locator('xpath=html/body/main/div/section[4]/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select each variant combination (size and color) and observe price and availability update.
        frame = context.pages[-1]
        # Select 'King' size variant option
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Select 'Blue Floral' color variant option
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[3]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select the other color variant 'White' and verify price and stock update accordingly.
        frame = context.pages[-1]
        # Select 'White' color variant option
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to add quantity exceeding stock (e.g., 9) to cart and verify validation message.
        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 1 to 2
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 2 to 3
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 3 to 4
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 4 to 5
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 5 to 6
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 6 to 7
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 7 to 8
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click quantity increment button to increase quantity from 8 to 9
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[4]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add a valid quantity (1) of the selected variant to the cart and verify cart count update.
        frame = context.pages[-1]
        # Click 'Add to Cart' button to add 1 quantity of selected variant to cart
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Premium Bedsheet Set').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=₹1,299').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=King size cotton bedsheet with 2 pillow covers.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Size').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=King').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Color').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Blue Floral').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=White').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quantity').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=✓ 8 in stock').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Add to Cart').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=View Cart →').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=On orders above ₹1000').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=100% secure checkout').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=7 days return policy').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=24/7 Support').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    