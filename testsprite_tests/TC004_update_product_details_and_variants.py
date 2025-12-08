import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30


def test_update_product_details_and_variants():
    product_id = None

    # Sample product to create for testing update
    create_payload = {
        "name": "Test Product TC004",
        "base_price": 100.0,
        "description": "Initial description",
        "main_category": "Fabrics",
        "category": "Cotton",
        "active": True,
        "variants": [
            {"size": "M", "color": "Red", "stock": 10},
            {"size": "L", "color": "Blue", "stock": 5}
        ]
    }

    # Payload to update the product's details and variants
    update_payload = {
        "name": "Updated Test Product TC004",
        "description": "Updated description",
        "base_price": 120.0,
        "active": False,
        "variants": [
            {"size": "M", "color": "Red", "stock": 15},  # Changed stock
            {"size": "XL", "color": "Green", "stock": 7}  # New variant
        ]
    }

    try:
        # Create a product to update
        create_resp = requests.post(f"{BASE_URL}/products", json=create_payload,
                                    auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert create_resp.status_code == 200, f"Product creation failed: {create_resp.text}"
        product_resp_json = create_resp.json()
        product_id = product_resp_json.get("id")
        assert product_id, "Created product ID not found in response"

        # Successful update test
        update_resp = requests.patch(f"{BASE_URL}/products/{product_id}", json=update_payload,
                                     auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"

        update_resp_json = update_resp.json()
        # Validate updated fields returned in response (if any)
        # Otherwise, validate by fetching the product again
        get_resp = requests.get(f"{BASE_URL}/products/{product_id}", auth=AUTH,
                                headers=HEADERS, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Failed to fetch updated product: {get_resp.text}"
        product_data = get_resp.json()
        assert product_data.get("name") == update_payload["name"]
        assert product_data.get("description") == update_payload["description"]
        assert product_data.get("base_price") == update_payload["base_price"]
        assert product_data.get("active") == update_payload["active"]

        variants = product_data.get("variants")
        assert variants is not None
        # Check variant with size M and color Red has updated stock 15, and new variant present
        found_m_red = False
        found_xl_green = False
        for v in variants:
            if v.get("size") == "M" and v.get("color") == "Red" and v.get("stock") == 15:
                found_m_red = True
            if v.get("size") == "XL" and v.get("color") == "Green" and v.get("stock") == 7:
                found_xl_green = True
        assert found_m_red, "Updated variant (M, Red) not found or incorrect"
        assert found_xl_green, "New variant (XL, Green) not found"

        # Simulate server failure - difficult without control, so test by sending invalid data to provoke 500 or handle it gracefully
        # We will send a malformed payload to cause server error if possible
        error_payload = {"base_price": "invalid_number"}

        error_resp = requests.patch(f"{BASE_URL}/products/{product_id}", json=error_payload,
                                    auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        # Accept 500 or application-specific error, but must assert handling of error codes
        assert error_resp.status_code in (400, 500), f"Expected error status on bad update payload, got {error_resp.status_code}"

    finally:
        # Cleanup: delete product if created
        if product_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/products/{product_id}",
                                           auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
                # Accept 200 or 404 if already deleted
                assert del_resp.status_code in (200, 404), f"Failed to delete product: {del_resp.text}"
            except Exception:
                pass


test_update_product_details_and_variants()
