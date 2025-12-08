import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000/api"
AUTH = HTTPBasicAuth("admin@naveentextiles.com", "admin123")
TIMEOUT = 30

def test_get_all_products_with_filtering():
    filters = [
        {"main_category": "Cotton"},
        {"category": "Shirts"},
        {"active": "true"},
        {"main_category": "Cotton", "category": "Shirts"},
        {"main_category": "Cotton", "active": "true"},
        {"category": "Shirts", "active": "true"},
        {"main_category": "Cotton", "category": "Shirts", "active": "true"},
        {}  # no filters
    ]
    
    url = f"{BASE_URL}/products"
    headers = {"Accept": "application/json"}
    
    for params in filters:
        try:
            response = requests.get(url, headers=headers, params=params, auth=AUTH, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed with exception: {e}"
        
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code} for params: {params}"
        try:
            data = response.json()
        except ValueError:
            assert False, f"Response is not JSON for params: {params}"
        
        assert isinstance(data, list), f"Expected response to be a list but got {type(data)} for params: {params}"
        
        # Verify filtering correctness if filters applied
        for product in data:
            if "main_category" in params:
                assert "main_category" in product, "Product missing 'main_category' field"
                assert isinstance(product["main_category"], str)
                assert product["main_category"].lower() == params["main_category"].lower()
            if "category" in params:
                assert "category" in product, "Product missing 'category' field"
                assert isinstance(product["category"], str)
                assert product["category"].lower() == params["category"].lower()
            if "active" in params:
                assert "active" in product, "Product missing 'active' field"
                expected_active = params["active"].lower() == "true"
                # Sometimes active could be boolean or string in response - treat boolean
                if isinstance(product["active"], bool):
                    assert product["active"] == expected_active
                else:
                    # If string, compare lowercased string
                    assert str(product["active"]).lower() == params["active"].lower()

test_get_all_products_with_filtering()