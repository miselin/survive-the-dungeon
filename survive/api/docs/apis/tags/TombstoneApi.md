<a name="__pageTop"></a>
# api.apis.tags.tombstone_api.TombstoneApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**add_a_new_tombstone_**](#add_a_new_tombstone_) | **post** /tombstone/{seed} | Create a new tombstone
[**get_tombstones**](#get_tombstones) | **get** /tombstone/{seed} | Get the tombstones for the given seed

# **add_a_new_tombstone_**
<a name="add_a_new_tombstone_"></a>
> Tombstone add_a_new_tombstone_(seedpayload)

Create a new tombstone

### Example

* Api Key Authentication (repl-identity):
```python
import api
from api.apis.tags import tombstone_api
from api.model.tombstone import Tombstone
from pprint import pprint
# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = api.Configuration(
    host = "http://localhost"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: repl-identity
configuration.api_key['repl-identity'] = 'YOUR_API_KEY'

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['repl-identity'] = 'Bearer'
# Enter a context with an instance of the API client
with api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = tombstone_api.TombstoneApi(api_client)

    # example passing only required values which don't have defaults set
    path_params = {
        'seed': 1,
    }
    body = Tombstone(
        player="player_example",
        x=1,
        y=1,
        last_logs="last_logs_example",
        at="1970-01-01T00:00:00.00Z",
        seed=1,
    )
    try:
        # Create a new tombstone
        api_response = api_instance.add_a_new_tombstone_(
            path_params=path_params,
            body=body,
        )
        pprint(api_response)
    except api.ApiException as e:
        print("Exception when calling TombstoneApi->add_a_new_tombstone_: %s\n" % e)
```
### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
body | typing.Union[SchemaForRequestBodyApplicationJson] | required |
path_params | RequestPathParams | |
content_type | str | optional, default is 'application/json' | Selects the schema and serialization of the request body
accept_content_types | typing.Tuple[str] | default is ('application/json', ) | Tells the server the content type(s) that are accepted by the client
stream | bool | default is False | if True then the response.content will be streamed and loaded from a file like object. When downloading a file, set this to True to force the code to deserialize the content to a FileSchema file
timeout | typing.Optional[typing.Union[int, typing.Tuple]] | default is None | the timeout used by the rest client
skip_deserialization | bool | default is False | when True, headers and body will be unset and an instance of api_client.ApiResponseWithoutDeserialization will be returned

### body

# SchemaForRequestBodyApplicationJson
Type | Description  | Notes
------------- | ------------- | -------------
[**Tombstone**](../../models/Tombstone.md) |  | 


### path_params
#### RequestPathParams

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
seed | SeedSchema | | 

# SeedSchema

## Model Type Info
Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | -------------
decimal.Decimal, int,  | decimal.Decimal,  |  | 

### Return Types, Responses

Code | Class | Description
------------- | ------------- | -------------
n/a | api_client.ApiResponseWithoutDeserialization | When skip_deserialization is True this response is returned
201 | [ApiResponseFor201](#add_a_new_tombstone_.ApiResponseFor201) | Success

#### add_a_new_tombstone_.ApiResponseFor201
Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
response | urllib3.HTTPResponse | Raw response |
body | typing.Union[SchemaFor201ResponseBodyApplicationJson, ] |  |
headers | Unset | headers were not defined |

# SchemaFor201ResponseBodyApplicationJson
Type | Description  | Notes
------------- | ------------- | -------------
[**Tombstone**](../../models/Tombstone.md) |  | 


### Authorization

[repl-identity](../../../README.md#repl-identity)

[[Back to top]](#__pageTop) [[Back to API list]](../../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../../README.md#documentation-for-models) [[Back to README]](../../../README.md)

# **get_tombstones**
<a name="get_tombstones"></a>
> Tombstones get_tombstones(seed)

Get the tombstones for the given seed

### Example

```python
import api
from api.apis.tags import tombstone_api
from api.model.tombstones import Tombstones
from pprint import pprint
# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = api.Configuration(
    host = "http://localhost"
)

# Enter a context with an instance of the API client
with api.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = tombstone_api.TombstoneApi(api_client)

    # example passing only required values which don't have defaults set
    path_params = {
        'seed': 1,
    }
    try:
        # Get the tombstones for the given seed
        api_response = api_instance.get_tombstones(
            path_params=path_params,
        )
        pprint(api_response)
    except api.ApiException as e:
        print("Exception when calling TombstoneApi->get_tombstones: %s\n" % e)
```
### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
path_params | RequestPathParams | |
accept_content_types | typing.Tuple[str] | default is ('application/json', ) | Tells the server the content type(s) that are accepted by the client
stream | bool | default is False | if True then the response.content will be streamed and loaded from a file like object. When downloading a file, set this to True to force the code to deserialize the content to a FileSchema file
timeout | typing.Optional[typing.Union[int, typing.Tuple]] | default is None | the timeout used by the rest client
skip_deserialization | bool | default is False | when True, headers and body will be unset and an instance of api_client.ApiResponseWithoutDeserialization will be returned

### path_params
#### RequestPathParams

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
seed | SeedSchema | | 

# SeedSchema

## Model Type Info
Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | -------------
decimal.Decimal, int,  | decimal.Decimal,  |  | 

### Return Types, Responses

Code | Class | Description
------------- | ------------- | -------------
n/a | api_client.ApiResponseWithoutDeserialization | When skip_deserialization is True this response is returned
200 | [ApiResponseFor200](#get_tombstones.ApiResponseFor200) | Success

#### get_tombstones.ApiResponseFor200
Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
response | urllib3.HTTPResponse | Raw response |
body | typing.Union[SchemaFor200ResponseBodyApplicationJson, ] |  |
headers | Unset | headers were not defined |

# SchemaFor200ResponseBodyApplicationJson
Type | Description  | Notes
------------- | ------------- | -------------
[**Tombstones**](../../models/Tombstones.md) |  | 


### Authorization

No authorization required

[[Back to top]](#__pageTop) [[Back to API list]](../../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../../README.md#documentation-for-models) [[Back to README]](../../../README.md)

