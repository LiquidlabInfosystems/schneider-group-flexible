## schneider server API Documentation

Root url for Testing 
```
https://sandbox.liquidlab.in/
```

Root url for production 
```
https://schiendertrackingsystem.com
```
## Authentication

| **API Endpoints**  | **Params**  | **Returns**                                      |
|--------------------|--------------------|---------------------------------------------------|
| **adminLogin**     | {"username":"test","password":"test"} | Return Authentication key   |
| **spokeLogin**     | {"spokeUserName":"test","Password":"test"} | Return Authentication key  |
| **spokeRegister**  | { "spokeName":"", "spokeShortName":"" , "spokeUserName":"", "spokePassword":"" } | Return Authentication key  |
| **hublogin**       | {"hubUsername":"test","hubPassword":"test"}  | Return Authentication key  |
| **hubregister**    | {"hubName":"", "hubShortName":"", "hubUsername":"", "hubPassword":"", "logo_ZPL":""} | Return Authentication key   |


## Hub API's

| **API Endpoints**               |  **Params**     | **Function**                      |
|---------------------------------|-----------------|-----------------------------------|
| **createhubuser**               | {"hubName":"", "hubShortName":"", "hubUsername":"", "hubPassword":"", "logo_ZPL":""}  |Return all the project records in the system |
| **getallhubusers**              |    hub_id       |Return all the open project records in the system |
| **activatehubhuser**            |    user_id      |Return all projects with parts in it              |
| **deactivatehubhuser**          |    user_id      |Return project detail for a specific project      |
| **deletehubuser**               |    user_id      |Return all the parts for a specific project       |
| **updatehubuser**               |    {user_id , password}      |Return all the parts for a specific project       |
| **generateComponentSerialNo**   |    { hubID, componentID, qnty }  |Return all the parts for a specific project       |
| **uploadCRExcelFromHub**        |    {file}      |Return all the parts for a specific project       |
| **createNewOrderFromHub**        |    {switchBoards, hub_id,spoke_id,project_name  }      |Return all the parts for a specific project       |
| **generatePartSerialNo**        |    { hubID, partID, partNumber, qnty }     |Return all the parts for a specific project       |
| **generateBoxSerialNo**        |    { hubID, qnty }       |Return all the parts for a specific project       |
| **addBoxToProject**        |    { projectID, serialNo }      |Return all the parts for a specific project       |
| **removeBoxFromProject**        |    { projectID, serialNo }     |Return all the parts for a specific project       |
| **addComponentsToBoxes**        |    {file}      |Return all the parts for a specific project       |
| **getBoxDetails**        |    { _id, serialNo }    |Return all the parts for a specific project       |
| **shipProject**        |   { projectId }      |Return all the parts for a specific project       |
| **updateBoxStatus**        |   { _id, status }     |Return all the parts for a specific project       |
| **getAllPartsInAllBoxes**        |   { projectId, boxSerialNos }      |Return all the parts for a specific project       |
| **addPartsToBoxes**        |   { hubID, partID, boxSerialNo, projectID, partSerialNumber }     |Return all the parts for a specific project       |
| **removePartsFromBoxes**        |   { projectId }      |Return all the parts for a specific project       |
| **getAllProjectsInHub**        |   { hub_id }      |Return all the parts for a specific project       |
| **getOpenProjects**        |   { hub_id }      |Return all the parts for a specific project       |
| **getProjectDetailsWithParts**        |   { projectId }      |Return all the parts for a specific project       |
| **getProjectsDetails**        |   { _id }      |Return all the parts for a specific project       |
| **getAllPartsInProject**        |   { projectId }      |Return all the parts for a specific project       |
| **componentScanResult**        |   { componentID, serialNo }     |Return all the parts for a specific project       |
| **incrementFixedQuantity**        |   { projectID, switchBoard, reference }     |Return all the parts for a specific project       |
| **getSpokeDetails**        |   { spokeName, spokeShortName , spokeUserName, spokePassword }    |Return all the parts for a specific project       |


## Spoke APIs

| **API Endpoints**               | **Params**                      | **Returns**                                  |
|---------------------------------|-----------------------------|--------------------------------------------------|
| **getAllSpokeProjects**         |   {spokeId}                 | Return all the project records in the system     |
| **getSpokeDetails**             |   { spoke_id }              |Return all the open project records in the system |
| **getSpokeProjectsDetails**     |   {_id}                         |Return all projects with parts in it          |
| **getBoxDetails**               |   { _id, serialNo }          |Return project detail for a specific project     |
| **getProjectDetailsWithParts**  |   {projectId}               |Return all the parts for a specific project       |


## Admin APIs

| **API Endpoints**               | **Params**                                                        |            **Returns**                            |
|---------------------------------|-------------------------------------------------------------------|-------------------------------------------------------|
| **createHub**                   |    { hubName, hubShortName, hubUsername, hubPassword, logo_ZPL }  | Return all the project records in the system      |
| **deleteHub**                   |    { hubID }                                                      |Return all the open project records in the system  |
| **updateHub**                   |    {hubID}                                                        |Return all projects with parts in it               |
| **getAllHubs**                  |    { _id, serialNo }                                              |Return project detail for a specific project       |
| **getAllCommertialReferences**  |    { spokeName, spokeShortName , spokeUserName, spokePassword }     |Return all the parts for a specific project        |
| **createPart**                  |    {partNumber, partDescription, quantity, grouped,PiecePerPacket } |Return all the parts for a specific project        |
| **getAllParts**                 |                                                                      |Return all the parts for a specific project       |
| **GETPrinter**                  |                                                                      |Return all the parts for a specific project       |
| **updatePrinter**               |    { printerIP, printerName }                                       |Return all the parts for a specific project       |
| **createPrinter**               |    { printerIP, printerName }                                        |Return all the parts for a specific project       |
| **uploadCR**                    |                                                                      |Return all the parts for a specific project       |
| **uploadCRFromAdmin**           |                                                                      |Return all the parts for a specific project       |
| **createCRc**                   |   {referenceNumber,description, productNumber, partNumbers }         |Return all the parts for a specific project       |
| **deleteCR**                    |   {referenceNumber}                                                  |Return all the parts for a specific project       |
| **recoverCR**                   |   {_id}                                                              |Return all the parts for a specific project       |
| **getAllProjects**              |                                                                      |Return all the parts for a specific project       |
