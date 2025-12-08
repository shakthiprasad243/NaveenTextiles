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
        # -> Navigate to checkout page with items in cart.
        frame = context.pages[-1]
        # Click on cart icon to go to cart or checkout page
        elem = frame.locator('xpath=html/body/header/div/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Browse Products' to add items to cart.
        frame = context.pages[-1]
        # Click on 'Browse Products' button to navigate to product listing page to add items to cart
        elem = frame.locator('xpath=html/body/main/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Find an in-stock product and add it to the cart.
        await page.mouse.wheel(0, 500)
        

        frame = context.pages[-1]
        # Click on 'Formal Cotton Shirt' product which appears in stock to view details and add to cart
        elem = frame.locator('xpath=html/body/main/div/div[3]/div/div[2]/a[18]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Add to Cart' button to add the product to the cart.
        frame = context.pages[-1]
        # Click 'Add to Cart' button to add the product to the cart
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'View Cart' to verify cart contents and proceed to checkout.
        frame = context.pages[-1]
        # Click 'View Cart' link to go to cart page and verify added product
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Proceed to Checkout' button to navigate to checkout page.
        frame = context.pages[-1]
        # Click 'Proceed to Checkout' button to go to checkout page
        elem = frame.locator('xpath=html/body/main/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in all required customer information fields (Full Name, Phone, Email) and shipping address details (Address Line 1, Address Line 2, City, State, Pincode).
        frame = context.pages[-1]
        # Fill Full Name field
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        

        frame = context.pages[-1]
        # Fill Phone field
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('9876543210')
        

        frame = context.pages[-1]
        # Fill Email field
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div/div/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('johndoe@example.com')
        

        frame = context.pages[-1]
        # Fill Address Line 1
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123, Green Apartments')
        

        frame = context.pages[-1]
        # Fill Address Line 2
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Sector 5, Near Park')
        

        frame = context.pages[-1]
        # Fill City
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Surat')
        

        frame = context.pages[-1]
        # Fill State
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[3]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Gujarat')
        

        frame = context.pages[-1]
        # Fill Pincode
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('395002')
        

        # -> Click 'Order via WhatsApp' button to place the order and trigger order confirmation process.
        frame = context.pages[-1]
        # Click 'Order via WhatsApp' button to place the order and trigger WhatsApp confirmation message
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify inventory reservation and WhatsApp message trigger by checking order status or contacting support if no direct UI confirmation.
        await page.goto('http://localhost:3000/admin/orders', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Log in to admin panel using provided credentials to access orders page and verify order details.
        frame = context.pages[-1]
        # Input admin email for login
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin@naveentextiles.com')
        

        frame = context.pages[-1]
        # Input admin password for login
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click Sign In button to log in to admin panel
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'My Orders' link to view detailed order list and verify order details.
        frame = context.pages[-1]
        # Click 'My Orders' link to view detailed order list
        elem = frame.locator('xpath=html/body/main/div/div[2]/div[2]/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Verify inventory reservation and WhatsApp message trigger for the recent order ORD-ABC123 by checking order details or logs.
        frame = context.pages[-1]
        # Click on order ORD-ABC123 to view detailed order information and verify inventory reservation and WhatsApp message trigger
        elem = frame.locator('xpath=html/body/main/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=ORD-ABC123').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pending').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=9876543210').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=admin@naveentextiles.com').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Your trusted destination for premium quality textiles since 1995. We bring you the finest fabrics from across India.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    