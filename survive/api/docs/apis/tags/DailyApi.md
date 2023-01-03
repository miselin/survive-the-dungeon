<a name="__pageTop"></a>
# api.apis.tags.daily_api.DailyApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_daily_route**](#get_daily_route) | **get** /daily/ | Get today&#x27;s seed

# **get_daily_route**
<a name="get_daily_route"></a>
> Seed get_daily_route()

Get today's seed

### Example

```python
import api
from api.apis.tags import daily_api
from api.model.seed import Seed
from pprint import pprint
# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = api.Configuration(
    host = "http://localhost"
)

# Enter a context with an instance of the API client
with api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = daily_api.DailyApi(api_client)

    # example, this endpoint has no required or optional parameters
    try:
        # Get today's seed
        api_response = api_instance.get_daily_route()
        pprint(api_response)
    except api.ApiException as e:
        print("Exception when calling DailyApi->get_daily_route: %s\n" % e)
```
### Parameters
This endpoint does not need any parameter.

### Return Types, Responses

Code | Class | Description
------------- | ------------- | -------------
n/a | api_client.ApiResponseWithoutDeserialization | When skip_deserialization is True this response is returned
200 | [ApiResponseFor200](#get_daily_route.ApiResponseFor200) | Success

#### get_daily_route.ApiResponseFor200
Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
response | urllib3.HTTPResponse | Raw response |
body | typing.Union[SchemaFor200ResponseBodyApplicationJson, ] |  |
headers | Unset | headers were not defined |

# SchemaFor200ResponseBodyApplicationJson
Type | Description  | Notes
------------- | ------------- | -------------
[**Seed**](../../models/Seed.md) |  | 


### Authorization

No authorization required

[[Back to top]](#__pageTop) [[Back to API list]](../../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../../README.md#documentation-for-models) [[Back to README]](../../../README.md)

