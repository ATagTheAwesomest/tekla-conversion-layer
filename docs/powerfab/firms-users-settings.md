# Firms, users and settings

Server-wide lists, not per job: the same firms and users come back whatever JobNumber is sent. In the
samples, people's names, usernames, phone numbers and street addresses are masked.

[← Back to the index](README.md)

## Read commands

| Command | Status | Answers |
|---|---|---|
| [`Ping`](#ping) | ✅ data | Is the PowerFab connection up? |
| [`Firm_Get`](#firm_get) | ✅ data | Who are the customers and ship-to addresses? |
| [`FirmAddress_Get`](#firmaddress_get) | ✅ data |  |
| [`FirmAddresses_Get`](#firmaddresses_get) | ✅ data |  |
| [`FirmContact_Get`](#firmcontact_get) | ✅ data |  |
| [`UserPartial_Get`](#userpartial_get) | ✅ data | Which PowerFab users exist? |
| [`ValUser`](#valuser) | ✅ data |  |
| [`HoldSettings_Get`](#holdsettings_get) | ✅ data |  |
| [`TrimbleViewpointSettings_Get`](#trimbleviewpointsettings_get) | ⛔ permission denied |  |

### `Ping`

**Status:** ✅ data

**Purpose.** Keeps the session alive; returns the idle timeout (43200 s = 12 h) and seconds left.

**Answers:** Is the PowerFab connection up?

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 128 bytes, 99 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `IdleTimeout` | number (as text) | 1 | `43200` |
| `SecondsBeforeIdleTimeout` | number (as text) | 1 | `43199` |

**Sample** (trimmed; full trimmed sample in [samples/Ping.json](samples/Ping.json)):

```json
{
  "IdleTimeout": "43200",
  "SecondsBeforeIdleTimeout": "43199"
}
```

### `Firm_Get`

**Status:** ✅ data

**Purpose.** Firms (clients, detailers, coaters, suppliers…) and, with the Include options, their addresses and contacts.

**Answers:** Who are the customers and ship-to addresses?

**Request that worked:**

```json
{"GetOptions":{"IncludeAddresses":1,"IncludeContacts":1,"IncludeInactive":1}}
```

**Result:** HTTP 200, 11,469 bytes, 103 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | text | 1 | `18,15,18` |
| `ResultData.GetOptions` | object | 1 |  |
| `ResultData.GetOptions.IncludeAddresses` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeContacts` | number (as text) | 1 | `1` |
| `ResultData.GetOptions.IncludeInactive` | number (as text) | 1 | `1` |
| `ResultData.Firm` | list (10–10) | 1 |  |
| `ResultData.Firm[].FirmID` | number (as text) | 10 | `9`, `1` |
| `ResultData.Firm[].FirmType` | text | 10 | `Client`, `Coating` |
| `ResultData.Firm[].Name` | text | 10 | `Music Hall of Fame`, `Tekla EPM - Client` |
| `ResultData.Firm[].Code` | text | 10 | `Music Hall of Fame`, `EPM - Client` |
| `ResultData.Firm[].PrimaryCurrency` | object | 10 |  |
| `ResultData.Firm[].PrimaryCurrency.@ID` | number (as text) | 10 | `1` |
| `ResultData.Firm[].PrimaryCurrency.#text` | text | 10 | `USD` |
| `ResultData.Firm[].ShipToAddress` | object | 10 |  |
| `ResultData.Firm[].ShipToAddress.FirmAddressID` | number (as text) | 10 | `14`, `1` |
| `ResultData.Firm[].ShipToAddress.FirmID` | number (as text) | 10 | `9`, `1` |
| `ResultData.Firm[].ShipToAddress.Description` | text | 10 | `Music Hall of Fame`, `Default - Shipping` |
| `ResultData.Firm[].ShipToAddress.Address1` | text | 8 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].ShipToAddress.City` | text | 7 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].ShipToAddress.State` | text | 7 | `ok`, `GA` |
| `ResultData.Firm[].ShipToAddress.Zip` | number (as text) | 6 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].ShipToAddress.Country` | text | 2 | `USA` |
| `ResultData.Firm[].ShipToAddress.IsShipTo` | number (as text) | 10 | `1` |
| `ResultData.Firm[].ShipToAddress.IsBillTo` | number (as text) | 6 | `1` |
| `ResultData.Firm[].ShipToAddress.Active` | number (as text) | 10 | `1` |
| `ResultData.Firm[].BillToAddress` | object | 10 |  |
| `ResultData.Firm[].BillToAddress.FirmAddressID` | number (as text) | 10 | `14`, `6` |
| `ResultData.Firm[].BillToAddress.FirmID` | number (as text) | 10 | `9`, `1` |
| `ResultData.Firm[].BillToAddress.Description` | text | 10 | `Music Hall of Fame`, `Default - Mailing` |
| `ResultData.Firm[].BillToAddress.Address1` | text | 8 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.City` | text | 7 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.State` | text | 7 | `ok`, `GA` |
| `ResultData.Firm[].BillToAddress.Zip` | number (as text) | 6 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.Country` | text | 2 | `USA` |
| `ResultData.Firm[].BillToAddress.IsShipTo` | number (as text) | 6 | `1` |
| `ResultData.Firm[].BillToAddress.IsBillTo` | number (as text) | 10 | `1` |
| `ResultData.Firm[].BillToAddress.Active` | number (as text) | 10 | `1` |
| `ResultData.Firm[].Contact` | object | 10 |  |
| `ResultData.Firm[].Contact.FirmContactID` | number (as text) | 10 | `13`, `2` |
| `ResultData.Firm[].Contact.FirmID` | number (as text) | 10 | `9`, `1` |
| `ResultData.Firm[].Contact.Name` | text | 10 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].Contact.Inspector` | number (as text) | 10 | `0` |
| `ResultData.Firm[].Contact.Active` | number (as text) | 10 | `1` |
| `ResultData.Firm[].IsActive` | number (as text) | 10 | `1` |
| `ResultData.Firm[].ShipToAddress.Attn` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].ShipToAddress.Address2` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].ShipToAddress.Phone` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.Attn` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.Address2` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].BillToAddress.Phone` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].Contact.Phone` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.Firm[].Notes` | text | 1 | `Generic Destination Assignment` |
| `ResultData.Firm[].CreditLimit` | object | 1 |  |
| `ResultData.Firm[].CreditLimit.@CurrencyID` | number (as text) | 1 | `1` |
| `ResultData.Firm[].CreditLimit.#text` | number (as text) | 1 | `0` |
| `ResultData.Firm[].InfoSharing` | number (as text) | 1 | `0` |
| `ResultData.Firm[].IsSubcontractor` | number (as text) | 1 | `1` |
| `ResultData.FirmAddress` | list (15–15) | 1 |  |
| `ResultData.FirmAddress[].FirmAddressID` | number (as text) | 15 | `6`, `1` |
| … | | | 20 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/Firm_Get.json](samples/Firm_Get.json)):

```json
{
  "Firm": [
    {
      "FirmID": "9",
      "FirmType": "Client",
      "Name": "Music Hall of Fame",
      "Code": "Music Hall of Fame",
      "PrimaryCurrency": {
        "@ID": "1",
        "#text": "USD"
      },
      "ShipToAddress": {
        "FirmAddressID": "14",
        "FirmID": "9",
        "Description": "Music Hall of Fame",
        "Address1": "<redacted>",
        "City": "<redacted>",
        "State": "ok",
        "Zip": "<redacted>",
        "Country": "USA",
        "IsShipTo": "1",
        "IsBillTo": "1",
        "Active": "1"
      },
      "BillToAddress": {
        "FirmAddressID": "14",
        "FirmID": "9",
        "Description": "Music Hall of Fame",
        "Address1": "<redacted>",
        "City": "<redacted>",
  …
```

### `FirmAddress_Get`

**Status:** ✅ data

**Purpose.** Firms with their ship-to, bill-to and other addresses and main contact.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 9,919 bytes, 119 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.FirmAddressList` | list (10–10) | 1 |  |
| `ResultData.FirmAddressList[].Firm` | object | 10 |  |
| `ResultData.FirmAddressList[].Firm.FirmID` | number (as text) | 10 | `7`, `6` |
| `ResultData.FirmAddressList[].Firm.FirmType` | text | 10 | `Detailer`, `Coating` |
| `ResultData.FirmAddressList[].Firm.Name` | text | 10 | `Detailer`, `Galvanizer` |
| `ResultData.FirmAddressList[].Firm.Code` | text | 10 | `Detailer`, `Galvanizer` |
| `ResultData.FirmAddressList[].Firm.PrimaryCurrency` | object | 10 |  |
| `ResultData.FirmAddressList[].Firm.PrimaryCurrency.@ID` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.PrimaryCurrency.#text` | text | 10 | `USD` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress` | object | 10 |  |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.FirmAddressID` | number (as text) | 10 | `12`, `10` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.FirmID` | number (as text) | 10 | `7`, `6` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Description` | text | 10 | `Default`, `Music Hall of Fame` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Address1` | text | 8 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.City` | text | 7 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.State` | text | 7 | `GA`, `ok` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.IsShipTo` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.IsBillTo` | number (as text) | 6 | `1` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Active` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.BillToAddress` | object | 10 |  |
| `ResultData.FirmAddressList[].Firm.BillToAddress.FirmAddressID` | number (as text) | 10 | `12`, `10` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.FirmID` | number (as text) | 10 | `7`, `6` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Description` | text | 10 | `Default`, `Music Hall of Fame` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Address1` | text | 8 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.City` | text | 7 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.State` | text | 7 | `GA`, `ok` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.IsShipTo` | number (as text) | 6 | `1` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.IsBillTo` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Active` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.Contact` | object | 10 |  |
| `ResultData.FirmAddressList[].Firm.Contact.FirmContactID` | number (as text) | 10 | `11`, `6` |
| `ResultData.FirmAddressList[].Firm.Contact.FirmID` | number (as text) | 10 | `7`, `6` |
| `ResultData.FirmAddressList[].Firm.Contact.Name` | text | 10 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.Contact.Inspector` | number (as text) | 10 | `0` |
| `ResultData.FirmAddressList[].Firm.Contact.Active` | number (as text) | 10 | `1` |
| `ResultData.FirmAddressList[].Firm.InfoSharing` | number (as text) | 1 | `0` |
| `ResultData.FirmAddressList[].FirmAddress` | object or list | 10 |  |
| `ResultData.FirmAddressList[].FirmAddress.FirmAddressID` | number (as text) | 6 | `12`, `10` |
| `ResultData.FirmAddressList[].FirmAddress.FirmID` | number (as text) | 6 | `7`, `6` |
| `ResultData.FirmAddressList[].FirmAddress.Description` | text | 6 | `Default`, `Music Hall of Fame` |
| `ResultData.FirmAddressList[].FirmAddress.Address1` | text | 4 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].FirmAddress.City` | text | 3 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].FirmAddress.State` | text | 3 | `GA`, `ok` |
| `ResultData.FirmAddressList[].FirmAddress.IsShipTo` | number (as text) | 6 | `1` |
| `ResultData.FirmAddressList[].FirmAddress.IsBillTo` | number (as text) | 6 | `1` |
| `ResultData.FirmAddressList[].FirmAddress.Active` | number (as text) | 6 | `1` |
| `ResultData.FirmAddressList[].Firm.Notes` | text | 1 | `Generic Destination Assignment` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Zip` | number (as text) | 6 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Country` | text | 2 | `USA` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Zip` | number (as text) | 6 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Country` | text | 2 | `USA` |
| `ResultData.FirmAddressList[].FirmAddress.Zip` | number (as text) | 2 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].FirmAddress.Country` | text | 2 | `USA` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Attn` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Address2` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.ShipToAddress.Phone` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Attn` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Address2` | text | 5 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddressList[].Firm.BillToAddress.Phone` | text | 5 | `<redacted>`, `<redacted>` |
| … | | | 20 more fields in the sample file |

**Sample** (trimmed; full trimmed sample in [samples/FirmAddress_Get.json](samples/FirmAddress_Get.json)):

```json
{
  "FirmAddressList": [
    {
      "Firm": {
        "FirmID": "7",
        "FirmType": "Detailer",
        "Name": "Detailer",
        "Code": "Detailer",
        "PrimaryCurrency": {
          "@ID": "1",
          "#text": "USD"
        },
        "ShipToAddress": {
          "FirmAddressID": "12",
          "FirmID": "7",
          "Description": "Default",
          "Address1": "<redacted>",
          "City": "<redacted>",
          "State": "GA",
          "IsShipTo": "1",
          "IsBillTo": "1",
          "Active": "1"
        },
        "BillToAddress": {
          "FirmAddressID": "12",
          "FirmID": "7",
          "Description": "Default",
          "Address1": "<redacted>",
          "City": "<redacted>",
          "State": "GA",
  …
```

**Gotchas:**

- One or many: `ResultData.FirmAddressList.FirmAddress` came back as an object in one place and a list in another. Always normalise to a list.

### `FirmAddresses_Get`

**Status:** ✅ data

**Purpose.** Flat list of all firm addresses.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 3,146 bytes, 113 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `15` |
| `ResultData.GetOptions` | text | 1 |  |
| `ResultData.FirmAddress` | list (15–15) | 1 |  |
| `ResultData.FirmAddress[].FirmAddressID` | number (as text) | 15 | `1`, `2` |
| `ResultData.FirmAddress[].FirmID` | number (as text) | 15 | `1`, `2` |
| `ResultData.FirmAddress[].Description` | text | 15 | `Default - Shipping`, `Default` |
| `ResultData.FirmAddress[].Attn` | text | 10 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].Address1` | text | 13 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].Address2` | text | 9 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].City` | text | 12 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].State` | text | 12 | `GA`, `ok` |
| `ResultData.FirmAddress[].Zip` | number (as text) | 11 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].Phone` | text | 10 | `<redacted>`, `<redacted>` |
| `ResultData.FirmAddress[].IsShipTo` | number (as text) | 11 | `1` |
| `ResultData.FirmAddress[].Active` | number (as text) | 15 | `1` |
| `ResultData.FirmAddress[].IsBillTo` | number (as text) | 10 | `1` |
| `ResultData.FirmAddress[].Country` | text | 2 | `USA` |

**Sample** (trimmed; full trimmed sample in [samples/FirmAddresses_Get.json](samples/FirmAddresses_Get.json)):

```json
{
  "FirmAddress": [
    {
      "FirmAddressID": "1",
      "FirmID": "1",
      "Description": "Default - Shipping",
      "Attn": "<redacted>",
      "Address1": "<redacted>",
      "Address2": "<redacted>",
      "City": "<redacted>",
      "State": "GA",
      "Zip": "<redacted>",
      "Phone": "<redacted>",
      "IsShipTo": "1",
      "Active": "1"
    },
    "… 14 more"
  ]
}
```

### `FirmContact_Get`

**Status:** ✅ data

**Purpose.** Flat list of all firm contacts.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 1,556 bytes, 109 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.LastLogID` | number (as text) | 1 | `18` |
| `ResultData.GetOptions` | text | 1 |  |
| `ResultData.FirmContact` | list (15–15) | 1 |  |
| `ResultData.FirmContact[].FirmContactID` | number (as text) | 15 | `1`, `2` |
| `ResultData.FirmContact[].FirmID` | number (as text) | 15 | `2`, `1` |
| `ResultData.FirmContact[].Name` | text | 15 | `<redacted>`, `<redacted>` |
| `ResultData.FirmContact[].Phone` | text | 10 | `<redacted>`, `<redacted>` |
| `ResultData.FirmContact[].Inspector` | number (as text) | 14 | `0` |
| `ResultData.FirmContact[].Active` | number (as text) | 15 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/FirmContact_Get.json](samples/FirmContact_Get.json)):

```json
{
  "FirmContact": [
    {
      "FirmContactID": "1",
      "FirmID": "2",
      "Name": "<redacted>",
      "Phone": "<redacted>",
      "Inspector": "0",
      "Active": "1"
    },
    "… 14 more"
  ]
}
```

### `UserPartial_Get`

**Status:** ✅ data

**Purpose.** PowerFab users: ID, username, name, whether they are production users.

**Answers:** Which PowerFab users exist?

**Request that worked:**

```json
{"JobNumber":"TESTTEST"}
```

**Result:** HTTP 200, 398 bytes, 44 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.User` | list (4–4) | 1 |  |
| `ResultData.User[].UserID` | number (as text) | 4 | `1`, `8` |
| `ResultData.User[].ProductionUser` | number (as text) | 4 | `1` |
| `ResultData.User[].Username` | text | 4 | `<redacted>`, `<redacted>` |
| `ResultData.User[].LastName` | text | 4 | `<redacted>`, `<redacted>` |
| `ResultData.User[].FirstName` | text | 3 | `<redacted>`, `<redacted>` |

**Sample** (trimmed; full trimmed sample in [samples/UserPartial_Get.json](samples/UserPartial_Get.json)):

```json
{
  "User": [
    {
      "UserID": "1",
      "ProductionUser": "1",
      "Username": "<redacted>",
      "LastName": "<redacted>"
    },
    "… 3 more"
  ]
}
```

**Gotchas:**

- Names and usernames are masked in the sample.

### `ValUser`

**Status:** ✅ data

**Purpose.** Checks a username and returns its `UserID`.

**Request that worked:**

```json
{"Username":"admin"}
```

**Attempts:**

- `{"Username":"admin"}` → 200, 84 bytes
- `{"JobNumber":"TESTTEST"}` → 422: Username is required
- `{"Username":"admin"}` → 200, 84 bytes
- `{"JobNumber":"EPM-001"}` → 422: Username is required

**Result:** HTTP 200, 84 bytes, 44 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `UserID` | number (as text) | 1 | `1` |

**Sample** (trimmed; full trimmed sample in [samples/ValUser.json](samples/ValUser.json)):

```json
{
  "UserID": "1"
}
```

### `HoldSettings_Get`

**Status:** ✅ data

**Purpose.** What PowerFab does when a piece is on hold, per step: purchasing, production, inspections, shipping assign/load/ship.

**Request that worked:**

```json
{"JobNumber":"EPM-001"}
```

**Result:** HTTP 200, 192 bytes, 118 ms.

**Response fields:**

| Field | Type | Times seen | Example |
|---|---|---|---|
| `ResultData` | object | 1 |  |
| `ResultData.HoldSettings` | object | 1 | common block, see README |

**Sample** (trimmed; full trimmed sample in [samples/HoldSettings_Get.json](samples/HoldSettings_Get.json)):

```json
{
  "HoldSettings": {
    "Purchasing": "Prompt",
    "Production": "Prompt",
    "Inspections": "Prompt",
    "ShippingAssign": "Prompt",
    "ShippingLoad": "Prompt",
    "ShippingShip": "Prevent"
  }
}
```

**Gotchas:**

- Here `ShippingShip` is "Prevent" and the others "Prompt": a held piece cannot ship. The same block is repeated on many replies as `HoldSettings`.

### `TrimbleViewpointSettings_Get`

**Status:** ⛔ permission denied

**Purpose.** Trimble viewpoint settings.

**Best attempt:**

```json
{"JobNumber":"TESTTEST"}
```

**Attempts:**

- `{"JobNumber":"EPM-001"}` → 422: Permission denied.
- `{"JobNumber":"TESTTEST"}` → 422: Permission denied.

**Gotchas:**

- PowerFab answered "Permission denied." for the API user (the PowerFab External User the service logs in as).

## Write commands

Run on the test jobs only (EPM-001, TESTTEST), each change undone afterwards. "Not run" means no request was sent; those purposes come from the command name and Tekla's reference.

| Command | Status | What it does |
|---|---|---|
| [`Firm_Insert`](#firm_insert) | ⏸ not run | Creates a Firm record (from the name). |
| [`Firm_Update`](#firm_update) | ⏸ not run | Edits a Firm record (from the name). |
| [`Firm_Delete`](#firm_delete) | ⏸ not run | Deletes a Firm record (from the name). |
| [`FirmAddress_Insert`](#firmaddress_insert) | ⏸ not run | Creates a FirmAddress record (from the name). |
| [`FirmAddress_Update`](#firmaddress_update) | ⏸ not run | Edits a FirmAddress record (from the name). |
| [`FirmAddress_Delete`](#firmaddress_delete) | ⏸ not run | Deletes a FirmAddress record (from the name). |
| [`FirmContact_Insert`](#firmcontact_insert) | ⏸ not run | Creates a FirmContact record (from the name). |
| [`FirmContact_Update`](#firmcontact_update) | ⏸ not run | Edits a FirmContact record (from the name). |
| [`FirmContact_Delete`](#firmcontact_delete) | ⏸ not run | Deletes a FirmContact record (from the name). |
| [`Lang`](#lang) | ✅ data | Unclear from the reference; classed as a write until shown to be a read. |
| [`Version`](#version) | ✅ data | Probably returns the PowerFab/API version, but classed as a write until shown to be a read. |
| [`TrimbleIdentityToken`](#trimbleidentitytoken) | ⏸ not run | Trimble Identity sign-in token. Not called: it deals in credentials. |
| [`TrimbleIdentityAccessToken`](#trimbleidentityaccesstoken) | ⏸ not run | Trimble Identity access token. Not called: it deals in credentials. |

### `Firm_Insert`

**Status:** ⏸ not run

**What it does.** Creates a Firm record (from the name).

### `Firm_Update`

**Status:** ⏸ not run

**What it does.** Edits a Firm record (from the name).

### `Firm_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a Firm record (from the name).

### `FirmAddress_Insert`

**Status:** ⏸ not run

**What it does.** Creates a FirmAddress record (from the name).

### `FirmAddress_Update`

**Status:** ⏸ not run

**What it does.** Edits a FirmAddress record (from the name).

### `FirmAddress_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a FirmAddress record (from the name).

### `FirmContact_Insert`

**Status:** ⏸ not run

**What it does.** Creates a FirmContact record (from the name).

### `FirmContact_Update`

**Status:** ⏸ not run

**What it does.** Edits a FirmContact record (from the name).

### `FirmContact_Delete`

**Status:** ⏸ not run

**What it does.** Deletes a FirmContact record (from the name).

### `Lang`

**Status:** ✅ worked

**What it does.** Returns the language code.

**Request that worked:**

```json
{}
```

**Reply:** only `Successful` and a `CommandGUID`.

**Attempts:**

- `{}` → 200: accepted

**Gotchas:**

- Reply is the plain string `"en"`.

### `Version`

**Status:** ✅ worked

**What it does.** Returns the PowerFab version.

**Request that worked:**

```json
{}
```

**Reply** (trimmed; [samples/Version.json](samples/Version.json)):

```json
{
  "MajorVersion": "2026",
  "MinorVersion": "SP3",
  "PatchNumber": "0",
  "InterfaceVersionNumber": "2026.0.0"
}
```

**Attempts:**

- `{}` → 200: accepted

**Gotchas:**

- Reply: `MajorVersion` "2026", `MinorVersion` "SP3", `PatchNumber` "0", `InterfaceVersionNumber` "2026.0.0".

### `TrimbleIdentityToken`

**Status:** ⏸ not run

**What it does.** Trimble Identity sign-in token. Not called: it deals in credentials.

### `TrimbleIdentityAccessToken`

**Status:** ⏸ not run

**What it does.** Trimble Identity access token. Not called: it deals in credentials.
