# api.model.score.Score

## Model Type Info
Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | -------------
dict, frozendict.frozendict,  | frozendict.frozendict,  |  | 

### Dictionary Keys
Key | Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | ------------- | -------------
**at** | str, datetime,  | str,  | The date and time that this score was submitted. | value must conform to RFC-3339 date-time
**player** | str,  | str,  | The player that achieved this score. | [optional] 
**score** | decimal.Decimal, int,  | decimal.Decimal,  | The score the player achieved. | [optional] 
**seed** | decimal.Decimal, int,  | decimal.Decimal,  | The seed the player achieved this score on. | [optional] 
**any_string_name** | dict, frozendict.frozendict, str, date, datetime, int, float, bool, decimal.Decimal, None, list, tuple, bytes, io.FileIO, io.BufferedReader | frozendict.frozendict, str, BoolClass, decimal.Decimal, NoneClass, tuple, bytes, FileIO | any string name can be used but the value must be the correct type | [optional]

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

