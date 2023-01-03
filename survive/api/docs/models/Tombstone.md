# api.model.tombstone.Tombstone

## Model Type Info
Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | -------------
dict, frozendict.frozendict,  | frozendict.frozendict,  |  | 

### Dictionary Keys
Key | Input Type | Accessed Type | Description | Notes
------------ | ------------- | ------------- | ------------- | -------------
**at** | str, datetime,  | str,  | The date and time that this player died. | value must conform to RFC-3339 date-time
**seed** | decimal.Decimal, int,  | decimal.Decimal,  | The seed for this tombstone. | 
**last_logs** | str,  | str,  | The last few log lines before the player died. | 
**x** | decimal.Decimal, int,  | decimal.Decimal,  | X co-ordinate of the tombstone. | 
**y** | decimal.Decimal, int,  | decimal.Decimal,  | Y co-ordinate of the tombstone. | 
**player** | str,  | str,  | The player that died. | 
**any_string_name** | dict, frozendict.frozendict, str, date, datetime, int, float, bool, decimal.Decimal, None, list, tuple, bytes, io.FileIO, io.BufferedReader | frozendict.frozendict, str, BoolClass, decimal.Decimal, NoneClass, tuple, bytes, FileIO | any string name can be used but the value must be the correct type | [optional]

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

