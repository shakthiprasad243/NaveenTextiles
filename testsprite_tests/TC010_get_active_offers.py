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
 
        # -> Navigate to shopping cart page to proceed to checkout.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/header/div/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Browse Products' to add products to cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add a product to the cart by clicking on a product and then adding it to cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[3]/div/div[2]/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Add the selected product (index 56) to the cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[3]/div/div[2]/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/header/div/div/div/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Browse Products' to add products to cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on product at index 56 to view details and add to cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[3]/div/div[2]/a[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select size M (index 13) and click 'Add to Cart' button (index 17) to add product to cart.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'View Cart' (index 18) to go to the shopping cart page and proceed to checkout.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on 'Proceed to Checkout' button (index 11) to go to the checkout page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Fill in all mandatory customer details: Full Name, Phone, Address Line 1, City, State, Pincode, then submit the order.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('John Doe')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('9876543210')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123 Textile Market')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Surat')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[3]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Gujarat')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/div[2]/div/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('395002')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/main/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=� *New Order - Naveen Textiles* � *Order ID:* NT-MIYJ4PX81ZM � *Customer:* John Doe � *Phone:* 9876543210 � *Delivery Address:* 123 Textile Market, Surat, Gujarat - 395002 � *Items:* • Silk Blend Kurta (M, Maroon) x1 - ₹2499 � *Total:* ₹2499 � *Payment:* Cash on Delivery Please confirm this order. �').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    