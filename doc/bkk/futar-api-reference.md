<!-- Generated from futar-openapi.yaml by openapi-to-md.py. Do not edit by hand. -->

# BKK FUTÁR API reference (realCity Query Server API 1.0.1)

Server: `https://futar.bkk.hu/api/query/v1/ws` (BKK FUTÁR)  
Auth: API key in the `key` query parameter. `{dialect}` in paths is `otp` for BKK.

Specification for the realCity Query Server API.

## Endpoints

### GET /{dialect}/api/where/alert-details

Parameters:

- `alertId` (query, [AgencyAndId](#agencyandid) **required**) — A lekért zavar azonosítója.
- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `related` (query, boolean) — Ha igaz, akkor az útvonalhoz tartozó kapcsolódó útvonalak is szerepelnek a válaszban. Default: `False`.
- `date` (query, [ServiceDate](#servicedate)) — Az aktív zavarok lekéréséhez használt dátum. Alapértelmezett értéke az aktuális nap.

Response 200 (application/json): [AlertDetailsMethodResponse](#alertdetailsmethodresponse)

### GET /{dialect}/api/where/alert-search

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `end` (query, integer (int64)) — A keresési időintervallum vége epoch másodpercben.
- `filterClosed` (query, boolean) — Kiszűri az aktuális idő előtt lezárult zavarokat. Default: `True`.
- `listView` (query, boolean) — A zavar listához szűri meg a zavarokat.
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `query` (query, string) — A keresési feltétel, amit a zavar fejlécével, leírásával, vagy azonosítójával illesztünk.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `start` (query, integer (int64)) — A keresés időintervallumának eleje epoch másodpercben.
- `time` (query, integer (int64)) — A lekérdezés kiértékeléséhez használt időpont. Alapértelmezetten az aktuális szerveridő.

Response 200 (application/json): [AlertSearchMethodResponse](#alertsearchmethodresponse)

### GET /{dialect}/api/where/arrivals-and-departures-for-location

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `clientLat` (query, number (double)) — A kliens szélességi koordinátája. Default: `0`.
- `clientLon` (query, number (double)) — A kliens hosszúsági koordinátája. Default: `0`.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `excludeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `groupLimit` (query, integer (int32)) — Menetrendi adatok maximális száma egy csoportban. Default: `4`.
- `includeRouteId` (query, array of [AgencyAndId](#agencyandid)) — Amikor lehetséges, mindegyik azonosítóhoz legalább egy indulás/érkezés visszaadásra kerül.
- `includeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `includeVehicleFromTrip` (query, boolean) — A menethez társított járművek kitöltése a válaszban
- `includeVehicleFromVehicleBlock` (query, boolean) — A megállóhely induláshoz tartozó elem a jármű fordán lévő járművel legyen bővítve.
- `lat` (query, number (float)) — A helyszín középpontjának szélessgéi koordinátája.
- `latSpan` (query, number (float)) — A lekérési terület szélességi íve. (Terület szélessége: `lat +/- latspan`).
- `limit` (query, integer (int32)) — A visszaadott indulási és érkezési idők listájának maximális hossza. Default: `60`.
- `lon` (query, number (float)) — A helyszín középpontjának hosszúsági koordinátája.
- `lonSpan` (query, number (float)) — A lekérési terület hosszúsági íve. (Terület hosszúsága: `lon +/- lonSpan`).
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `minutesAfter` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter után ennyi perccel ér véget. Default: `30`.
- `minutesBefore` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter előtt ennyi perccel indul. Default: `2`.
- `onlyDepartures` (query, boolean) — Ha igaz akkor csak az érkezési (és előrejelzett érkezési) idők nem szerepelnek a válaszban. Default: `True`.
- `query` (query, string) — A válasz szűrésére használt keresési kifejezés.
- `radius` (query, integer (int32)) — Ha a `latSpan` vagy a `longSpan` nincs kitöltve, a keresési terület a középpontól számított `radius` méter távolság mind a négy irányban. Default: `100`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, array of [AgencyAndId](#agencyandid)) — A megállók azonosítóinak listája, amelyekhez a lekérést végezzük.
- `stopTimeType` (query, [StopTimeType](#stoptimetype)) — A visszaadott bejegyzések típusa.
- `time` (query, integer (int64)) — A lekérdezés kiértékeléséhez használt időpont. Alapértelmezetten az aktuális szerveridő.

Response 200 (application/json): [ArrivalsAndDeparturesForLocationOTPMethodResponse](#arrivalsanddeparturesforlocationotpmethodresponse)

### GET /{dialect}/api/where/arrivals-and-departures-for-stop

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `excludeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `includeRouteId` (query, array of [AgencyAndId](#agencyandid)) — Amikor lehetséges, mindegyik azonosítóhoz legalább egy indulás/érkezés visszaadásra kerül.
- `includeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `includeVehicleFromTrip` (query, boolean) — A menethez társított járművek kitöltése a válaszban
- `includeVehicleFromVehicleBlock` (query, boolean) — A megállóhely induláshoz tartozó elem a jármű fordán lévő járművel legyen bővítve.
- `lat` (query, number (float)) — A helyszín középpontjának szélessgéi koordinátája.
- `latSpan` (query, number (float)) — A lekérési terület szélességi íve. (Terület szélessége: `lat +/- latspan`).
- `limit` (query, integer (int32)) — A visszaadott indulási és érkezési idők listájának maximális hossza. Default: `60`.
- `lon` (query, number (float)) — A helyszín középpontjának hosszúsági koordinátája.
- `lonSpan` (query, number (float)) — A lekérési terület hosszúsági íve. (Terület hosszúsága: `lon +/- lonSpan`).
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `minutesAfter` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter után ennyi perccel ér véget. Default: `30`.
- `minutesBefore` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter előtt ennyi perccel indul. Default: `2`.
- `onlyDepartures` (query, boolean) — Ha igaz akkor csak az érkezési (és előrejelzett érkezési) idők nem szerepelnek a válaszban. Default: `True`.
- `query` (query, string) — A válasz szűrésére használt keresési kifejezés.
- `radius` (query, integer (int32)) — Ha a `latSpan` vagy a `longSpan` nincs kitöltve, a keresési terület a középpontól számított `radius` méter távolság mind a négy irányban. Default: `100`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, array of [AgencyAndId](#agencyandid)) — A megállók azonosítóinak listája, amelyekhez a lekérést végezzük.
- `stopTimeType` (query, [StopTimeType](#stoptimetype)) — A visszaadott bejegyzések típusa.
- `time` (query, integer (int64)) — A lekérdezés kiértékeléséhez használt időpont. Alapértelmezetten az aktuális szerveridő.

Response 200 (application/json): [ArrivalsAndDeparturesForStopOTPMethodResponse](#arrivalsanddeparturesforstopotpmethodresponse)

### GET /{dialect}/api/where/bicycle-rental

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stationId` (query, array of string) — A releváns állomások azonosítói.

Response 200 (application/json): [BicycleRentalMethodResponse](#bicyclerentalmethodresponse)

### GET /{dialect}/api/where/booking-redirect

Parameters:

- `agencyId` (query, [AgencyAndId](#agencyandid)) — A foglalási oldal szolgáltatójának azonosítója.
- `alightStopId` (query, [AgencyAndId](#agencyandid)) — A leszállási megálló azonosítója.
- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `boardStopId` (query, [AgencyAndId](#agencyandid)) — A felszállási megálló azonosítója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `directionId` (query, string) — A járat íránya.
- `routeId` (query, [AgencyAndId](#agencyandid)) — A járat azonosítója.
- `serviceDate` (query, [ServiceDate](#servicedate)) — A menet üzem napja.
- `tripId` (query, [AgencyAndId](#agencyandid)) — A menet azonosítója.

### GET /{dialect}/api/where/metadata

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `time` (query, integer (int64)) — A lekérés kiértékelésének időpontja epoch másodpercben (az aktív zavarok lekéréséhez szükséges).A szerver ideje az alapértelmezett értéke.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Response 200 (application/json): [MetadataResponse](#metadataresponse)

### GET /{dialect}/api/where/multi-route-details

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `related` (query, boolean) — Ha igaz, akkor az útvonalhoz tartozó kapcsolódó útvonalak is szerepelnek a válaszban. Default: `False`.
- `routeId` (query, array of [AgencyAndId](#agencyandid) **required**) — A lekért járatok azonosítói.
- `date` (query, [ServiceDate](#servicedate)) — Az aktív zavarok lekéréséhez használt dátum. Alapértelmezett értéke az aktuális nap.

Response 200 (application/json): [MultiRouteDetailsMethodResponse](#multiroutedetailsmethodresponse)

### POST /{dialect}/api/where/onboard-depart-search

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Request body (application/json): array of [OnboardDepartPosition](#onboarddepartposition)

Response 200 (application/json): [OnboardDepartSearchMethodResponse](#onboarddepartsearchmethodresponse)

### GET /{dialect}/api/where/onboarding-button

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `clientLat` (query, number (double)) — A kliens szélességi koordinátája. Default: `0`.
- `clientLon` (query, number (double)) — A kliens hosszúsági koordinátája. Default: `0`.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `excludeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `groupLimit` (query, integer (int32)) — Menetrendi adatok maximális száma egy csoportban. Default: `4`.
- `includeRouteId` (query, array of [AgencyAndId](#agencyandid)) — Amikor lehetséges, mindegyik azonosítóhoz legalább egy indulás/érkezés visszaadásra kerül.
- `includeRouteTypes` (query, array of [TraverseMode](#traversemode)) — Az indulásokat a megadott viszonylat módja szerint szűri.
- `includeVehicleFromTrip` (query, boolean) — A menethez társított járművek kitöltése a válaszban
- `includeVehicleFromVehicleBlock` (query, boolean) — A megállóhely induláshoz tartozó elem a jármű fordán lévő járművel legyen bővítve.
- `lat` (query, number (float)) — A helyszín középpontjának szélessgéi koordinátája.
- `latSpan` (query, number (float)) — A lekérési terület szélességi íve. (Terület szélessége: `lat +/- latspan`).
- `limit` (query, integer (int32)) — A visszaadott indulási és érkezési idők listájának maximális hossza. Default: `60`.
- `lon` (query, number (float)) — A helyszín középpontjának hosszúsági koordinátája.
- `lonSpan` (query, number (float)) — A lekérési terület hosszúsági íve. (Terület hosszúsága: `lon +/- lonSpan`).
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `minutesAfter` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter után ennyi perccel ér véget. Default: `30`.
- `minutesBefore` (query, integer (int32)) — A lekérdezési időablak a `time` paraméter előtt ennyi perccel indul. Default: `2`.
- `onlyDepartures` (query, boolean) — Ha igaz akkor csak az érkezési (és előrejelzett érkezési) idők nem szerepelnek a válaszban. Default: `True`.
- `query` (query, string) — A válasz szűrésére használt keresési kifejezés.
- `radius` (query, integer (int32)) — Ha a `latSpan` vagy a `longSpan` nincs kitöltve, a keresési terület a középpontól számított `radius` méter távolság mind a négy irányban. Default: `100`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, array of [AgencyAndId](#agencyandid)) — A megállók azonosítóinak listája, amelyekhez a lekérést végezzük.
- `stopTimeType` (query, [StopTimeType](#stoptimetype)) — A visszaadott bejegyzések típusa.
- `time` (query, integer (int64)) — A lekérdezés kiértékeléséhez használt időpont. Alapértelmezetten az aktuális szerveridő.

Response 200 (application/json): [ArrivalsAndDeparturesForLocationOTPMethodResponse](#arrivalsanddeparturesforlocationotpmethodresponse)

### GET /{dialect}/api/where/plan-access

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `arriveBy` (query, boolean) — Érkezési időre tervezzünk-e a megadott `date` és `time` paraméterrel.
- `date` (query, string) — A dátum, amikor a tervezés indul (`arriveBy` esetén érkezik).
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `fromPlace` (query, string **required**) — Az indulási hely adatai `név::hely` formában. A `név` az adott hely tetszőleges neve, amely az útiterv kiindulási pontjának lesz a neve (`leg.from.name`). A `hely` lehet koordináta `lat,lon` formában, vagy a geocoder API által visszaadott `vertex` azonosítója.
- `mode` (query, array of [TraverseMode](#traversemode) **required**) — A tervező milyen közlekedési módokat használjon. A kerékpár kölcsönzés a `BICYCLE,WALK` paraméterekkel kapcsolható be.
- `numItineraries` (query, integer (int32)) — Legfeljebb hány útvonal szerepeljen a válaszban.
- `optimize` (query, [OptimizeType](#optimizetype)) — A kereső mire optimalizálja az útvonalakat.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `shouldBuyTickets` (query, boolean) — Az első járműre szállás előtt történjen-e jegyvásárlás.
- `showIntermediateStops` (query, boolean) — A válasz tartalmazza-e a járatok által érintett köztes megállókat is.
- `time` (query, string) — Az idő, amikor a tervezés indul (`arriveBy` esetén érkezik).
- `toPlace` (query, string **required**) — Az érkezési hely adatai `név::hely` formában. A `név` az adott hely tetszőleges neve, amely az útiterv érkezési pontjának lesz a neve (`leg.to.name`). A `hely` lehet koordináta `lat,lon` formában, vagy a geocoder API által visszaadott `vertex` azonosítója.
- `triangleSafetyFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít a biztonság. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `triangleSlopeFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít az útvonal síksága. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `triangleTimeFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít a gyorsaság. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `walkProfile` (query, [WalkProfile](#walkprofile)) — A séta sebességét meghatározó profil.
- `wheelchair` (query, boolean) — Az összes járat alacsonypadlós legyen-e.

Response 200 (application/json): [PlanTripResponse](#plantripresponse)

### GET /{dialect}/api/where/plan-trip

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `arriveBy` (query, boolean) — Érkezési időre tervezzünk-e a megadott `date` és `time` paraméterrel.
- `date` (query, string) — A dátum, amikor a tervezés indul (`arriveBy` esetén érkezik).
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `fromPlace` (query, string **required**) — Az indulási hely adatai `név::hely` formában. A `név` az adott hely tetszőleges neve, amely az útiterv kiindulási pontjának lesz a neve (`leg.from.name`). A `hely` lehet koordináta `lat,lon` formában, vagy a geocoder API által visszaadott `vertex` azonosítója.
- `mode` (query, array of [TraverseMode](#traversemode) **required**) — A tervező milyen közlekedési módokat használjon. A kerékpár kölcsönzés a `BICYCLE,WALK` paraméterekkel kapcsolható be.
- `numItineraries` (query, integer (int32)) — Legfeljebb hány útvonal szerepeljen a válaszban.
- `optimize` (query, [OptimizeType](#optimizetype)) — A kereső mire optimalizálja az útvonalakat.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `shouldBuyTickets` (query, boolean) — Az első járműre szállás előtt történjen-e jegyvásárlás.
- `showIntermediateStops` (query, boolean) — A válasz tartalmazza-e a járatok által érintett köztes megállókat is.
- `time` (query, string) — Az idő, amikor a tervezés indul (`arriveBy` esetén érkezik).
- `toPlace` (query, string **required**) — Az érkezési hely adatai `név::hely` formában. A `név` az adott hely tetszőleges neve, amely az útiterv érkezési pontjának lesz a neve (`leg.to.name`). A `hely` lehet koordináta `lat,lon` formában, vagy a geocoder API által visszaadott `vertex` azonosítója.
- `triangleSafetyFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít a biztonság. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `triangleSlopeFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít az útvonal síksága. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `triangleTimeFactor` (query, number (double)) — Kerékpáros háromszög módú tervezés esetén mennyire számít a gyorsaság. 0 és 1 közötti szám, és 1-et kell kiadnia a másik két faktor összegével.
- `walkProfile` (query, [WalkProfile](#walkprofile)) — A séta sebességét meghatározó profil.
- `wheelchair` (query, boolean) — Az összes járat alacsonypadlós legyen-e.

Response 200 (application/json): [PlanTripResponse](#plantripresponse)

### GET /{dialect}/api/where/references

Parameters:

- `agencyId` (query, array of [AgencyAndId](#agencyandid)) — A szolgáltató ID-je.
- `alertId` (query, array of [AgencyAndId](#agencyandid)) — A zavar ID-je.
- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `routeId` (query, array of [AgencyAndId](#agencyandid)) — A járat ID-ja.
- `stopId` (query, array of [AgencyAndId](#agencyandid)) — A megálló ID-ja.

Response 200 (application/json): [ReferencesMethodResponse](#referencesmethodresponse)

### GET /{dialect}/api/where/route-details

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `related` (query, boolean) — Ha igaz, akkor az útvonalhoz tartozó kapcsolódó útvonalak is szerepelnek a válaszban. Default: `False`.
- `routeId` (query, [AgencyAndId](#agencyandid) **required**) — A járat ID-ja.
- `date` (query, [ServiceDate](#servicedate)) — Az aktív zavarok lekéréséhez használt dátum. Alapértelmezett értéke az aktuális nap.

Response 200 (application/json): [RouteDetailsMethodResponse](#routedetailsmethodresponse)

### GET /{dialect}/api/where/route-details-for-stop

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, [AgencyAndId](#agencyandid)) — A lekért megálló azonosítója.

Response 200 (application/json): [RouteDetailsForStopMethodResponse](#routedetailsforstopmethodresponse)

### GET /{dialect}/api/where/schedule-for-stop

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `date` (query, string) — A kért dátum.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `onlyDepartures` (query, boolean) — Igaz esetén az érkezési és előrejelzett érkezési idők ki lesznek hagyva a válaszból. Default: `True`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, array of [AgencyAndId](#agencyandid)) — A releváns megállók azonosítói.

Response 200 (application/json): [ScheduleForStopOTPMethodResponse](#scheduleforstopotpmethodresponse)

### GET /{dialect}/api/where/search

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `lat` (query, number (float)) — A látható térkép középpontjának szélessgéi koordinátája.
- `lon` (query, number (float)) — A látható térkép középpontjának hosszúsági koordinátája.
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `query` (query, string) — Szűrőfeltétel, amire illesztve vannak a zavarok, járatok és megállók.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Response 200 (application/json): [SearchMethodResponse](#searchmethodresponse)

### GET /{dialect}/api/where/statistics

Parameters:

- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.

Response 200 (application/json): [StatisticsResponse](#statisticsresponse)

### GET /{dialect}/api/where/stops-for-location

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `lat` (query, number (float)) — A helyszín középpontjának szélessgéi koordinátája.
- `latSpan` (query, number (float)) — A lekérési terület szélességi íve. (Terület szélessége: `lat +/- latspan`).
- `lon` (query, number (float)) — A helyszín középpontjának hosszúsági koordinátája.
- `lonSpan` (query, number (float)) — A lekérési terület hosszúsági íve. (Terület hosszúsága: `lon +/- lonSpan`).
- `minResult` (query, integer (int32)) — A visszaadott elemek minimális száma. Default: `5`.
- `query` (query, string) — A válasz szűrésére használt keresési kifejezés.
- `radius` (query, integer (int32)) — Ha a `latSpan` vagy a `longSpan` nincs kitöltve, a keresési terület a középpontól számított `radius` méter távolság mind a négy irányban. Default: `100`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Response 200 (application/json): [StopsForLocationResponse](#stopsforlocationresponse)

### GET /{dialect}/api/where/ticketing-locations

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `full` (query, boolean) — Ha igaz, és az adat változott az `ifModifiedSince` query paraméterben megadott időpont óta, akkor az összes adat visszaadásra kerül. Ha nincs megadva csak a módosult elemek szerepelnek a válaszban. Csak az `ifModifiedSince` query paraméterrel együtt szerepelhet, mivel az `If-Modified-Since` fejléc minden esetben a teljes választ tartalmazza.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Csak azokat az elemeket adjuk vissza, amik módosultak az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ha nincs változás üres listákkal tér vissza. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Response 200 (application/json): [TicketingMethodResponse](#ticketingmethodresponse)

### GET /{dialect}/api/where/trip-details

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `date` (query, [ServiceDate](#servicedate)) — Ha nincs kitöltve a járműazonosító, ezen a dátumon lesz keresve az adott azonosítójú menet.
- `tripId` (query, [AgencyAndId](#agencyandid)) — Ha nincs kitöltve a járműazonosító, az itt megadott azonosítóval rendelkező menet lesz a válaszban.
- `vehicleId` (query, [AgencyAndId](#agencyandid)) — Amennyiben meg van adva, azon menet érkezik a válaszban, amit az adott jármű teljesít.

Response 200 (application/json): [TripDetailsOTPMethodResponse](#tripdetailsotpmethodresponse)

### GET /{dialect}/api/where/vehicle-for-trip

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `date` (query, array of [ServiceDate](#servicedate)) — A lekért menetrendi napok. Alapértelmezetten az aktuális nap.
- `tripId` (query, array of [AgencyAndId](#agencyandid) **required**) — A lekért menetek azonosítói.

Response 200 (application/json): [VehicleForTripMethodResponse](#vehiclefortripmethodresponse)

### GET /{dialect}/api/where/vehicles

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `vehicleId` (query, array of [AgencyAndId](#agencyandid) **required**) — A lekért járművek azonosítói.

Response 200 (application/json): [VehiclesMethodResponse](#vehiclesmethodresponse)

### GET /{dialect}/api/where/vehicles-for-location

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `lat` (query, number (float)) — A terület középpontjának szélességi koordinátája.
- `latSpan` (query, number (float)) — A lekérési terület szélességi íve. (Terület szélessége: `lat +/- latspan`).
- `lon` (query, number (float)) — A terület középpontjának hosszúsági koordinátája.
- `lonSpan` (query, number (float)) — A lekérési terület hosszúsági íve. (Terület hosszúsága: `lon +/- lonSpan`).
- `query` (query, string) — A válasz listát szűrő feltétel, amit tartalmaznia kell a jármű azonosítójának, rendszámának vagy a típusának.
- `radius` (query, integer (int32)) — Ha a `latSpan` vagy a `longSpan` nincs kitöltve, a keresési terület a középpontól számított `radius` méter távolság mind a négy irányban. Default: `100`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.

Response 200 (application/json): [VehiclesForLocationMethodResponse](#vehiclesforlocationmethodresponse)

### GET /{dialect}/api/where/vehicles-for-route

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `related` (query, boolean) — Tartalmazza-e a válasz a kapcsolódó járatokat is a referenciákban. Default: `False`.
- `routeId` (query, array of [AgencyAndId](#agencyandid) **required**) — A lekért járatok azonosítói.

Response 200 (application/json): [VehiclesForRouteMethodResponse](#vehiclesforroutemethodresponse)

### GET /{dialect}/api/where/vehicles-for-stop

Parameters:

- `version` (query, [ApiVersion](#apiversion)) — Az API verziója.
- `appVersion` (query, string) — A kliensalkalmazás verziója.
- `dialect` (path, [Dialect](#dialect) **required**) — Az API referenciáinak dialektusa.
- `If-Modified-Since` (header, string (date-time)) — Ha meg van adva, akkor csak abban az esetben érkezik vissza adat, ha az változott a megadott időpont óta. Különben HTTP 304 a válasz. A query paraméternek elsőbbsége van ezzel szemben.
- `ifModifiedSince` (query, integer (int64)) — Akkor adunk vissza adatot, ha az módosult az itt megadott időbélyeg (UNIX időbélyeg másodpercben) után. Ellenkező esetben HTTP 304 a válasz, ha nincs változás. Elsőbbsége van a header paraméterrel szemben. Default: `-1`.
- `includeReferences` (query, array of [ReferencesSchema](#referencesschema)) — A referenciák típusát határozza meg. `true` vagy `COMPACT` esetén minden referencia szerepel, `false` esetén üres. `COMPACT` módban a route referenciák `description` mezője kihagyásra kerül.
- `stopId` (query, [AgencyAndId](#agencyandid) **required**) — A lekért megálló azonosítója.

Response 200 (application/json): [VehiclesForStopMethodResponse](#vehiclesforstopmethodresponse)

## Schemas

### AbsoluteDirection

A lépés abszolút iránya.

Values: `NORTH`, `NORTHEAST`, `EAST`, `SOUTHEAST`, `SOUTH`, `SOUTHWEST`, `WEST`, `NORTHWEST`


### AgencyAndId

Entitás azonosító


### AlertDetailsMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitAlertDetails](#transitentrywithreferencestransitalertdetails) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### AlertSearchMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitSearch](#transitentrywithreferencestransitsearch) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### ApiVersion

Values: `2`, `3`, `4`, `5`


### ArrivalsAndDeparturesForLocationOTPMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitDepartureGroup](#transitlistentrywithreferencestransitdeparturegroup) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### ArrivalsAndDeparturesForStopOTPMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitArrivalsAndDepartures](#transitentrywithreferencestransitarrivalsanddepartures) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### BicycleRentalMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitBikeRentalStation](#transitlistentrywithreferencestransitbikerentalstation) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### BicycleStreetDirection

A szakasz egyirányúsága.

Values: `BIDIRECTIONAL`, `ONEWAY_WITH_TRAFFIC`, `ONEWAY_AGAINST_TRAFFIC`


### BikeDisplayedLeg

Extends [DisplayedLeg](#displayedleg).

- `rented` — boolean. Jelzi, hogy a lábat bérelt kerékpárral kell bejárni.

### BikeStreetCategory

Kerékpáros útszakaszok kategórizálásai.

Values: `CYCLEWAY`, `CYCLELANE`, `LOW_TRAFFIC`, `OTHER`, `PEDESTRIAN`


### CongestionLevel

A járműhöz tartozó torlódási állapot.

Values: `UNKNOWN`, `CONGESTION`


### DayOfWeek

A nyitvatartási idő napja. Lehet HOL (ünnepnap) és 0247 (éjjel-nappali).

Values: `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`, `HOL`, `O247`


### DestinationDisplayedLeg

Extends [DisplayedLeg](#displayedleg).


### Dialect

Values: `otp`, `mobile`


### DisplayedLeg

Az útiterv kivonatos megjelenítéséhez használható lábak és adatok.

- `first` — boolean. Jelzi, ha a láb az első az útitervben.
- `last` — boolean. Jelzi, ha a láb az utolsó az útitervben.
- `name` — string **required**. Az indulási hely neve, kivéve az utolsón, ahol a érkezési helyé.
- `time` — integer (int64) **required**. Az utolsó lábon az érkezési idő, az összes többin az indulási.
- `type` — [DisplayedLegType](#displayedlegtype) **required**.
- `walkTo` — boolean **required**. Jelzi, hogy a láb nem tranzit típusú.

### DisplayedLegType

A láb típusa.

Values: `bike`, `destination`, `route`, `ticketing`, `walk`


### EffectType

A zavar hatásának típusa.

Values: `NO_SERVICE`, `WARNING`


### ElevationPoint

A lábhoz tartozó magassági adatok.

- `distance` — number (double) **required**. A magassági pont távolsága a láb kezdetéhez képest méterben.
- `elevation` — number (double) **required**. A pont magassága.

### EncodedPolylineBean

A szakasz geometriája.

- `length` — integer (int32) **required**. A geometria (polyline) pontjainak száma.
- `points` — string **required**. A geometria (polyline) pontjai kódolva.

### Itinerary

A talált útvonalak listája.

- `bikeCategoryDistances` — map of string → number (double). Az útiterv során hány méter kerékpározást tartalmaztak az egyes kategóriák. Az objektum kulcsai a kategóriák (`BikeStreetCategory`).
- `bikeDistance` — number (double) **required**. Kerékpározási távolság az útvonalon méterben.
- `bikeTime` — integer (int64) **required**. Kerékpározási idő az útvonalon másodpercben.
- `displayProductRecommendation` — boolean. Jelzi, ha az útvonalhoz kell termékajánlást mutatni.
- `displayedLegs` — array of [DisplayedLeg](#displayedleg). Az útiterv kivonatos megjelenítéséhez használható lábak és adatok.
- `duration` — integer (int64) **required**. Az útvonal hossza másodpercben.
- `elevationGained` — number (double) **required**. Az útiterv során hány métert emelkedik az útvonal.
- `elevationLost` — number (double) **required**. Az útiterv során hány métert süllyed az útvonal.
- `endTime` — string (date-time) **required**. Az érkezési időpont ezredmásodpercben.
- `generalizedCost` — integer (int32) **required**. Az utazástervező algoritmus által használt súly.
- `legs` — array of [Leg](#leg) **required**. Az útiterv lábai (részei).
- `notAllTicketsAvailable` — boolean **required**. Jelzi, hogy a visszaadott útvonalak tartalmazhatnak olyan járatokat (pl.: vonatok), amire a terv során érintett jegyértékesítési helyen nem lehet jegyet váltani.
- `patternDuration` — [PatternStatistics](#patternstatistics).
- `patternFrequency` — [PatternStatistics](#patternstatistics).
- `patternItineraries` — array of [Itinerary](#itinerary). Útitervminták engedélyezése esetén a mintába tartozó útitervek.
- `startTime` — string (date-time) **required**. Az indulási időpont ezredmásodpercben.
- `tooSloped` — boolean **required**. Jelzi, ha az útvonal meredekebb, mint a paraméterekben kért.
- `transfers` — integer (int32) **required**. Átszállások száma az útitervben.
- `transitTime` — integer (int64) **required**. Járművön töltött idő az útvonalon másodpercben.
- `waitTimeAdjustedGeneralizedCost` — integer (int32) **required**. A várakozási idővel igazított súly.
- `waitingTime` — integer (int64) **required**. Várakozási idő járműre az útvonalon másodpercben.
- `walkDistance` — number (double) **required**. Sétálási távolság az útvonalon méterben.
- `walkLimitExceeded` — boolean **required**. Jelzi, hogy a sétálási limit túl lett lépve az útitervben.
- `walkTime` — integer (int64) **required**. Sétálási idő az útvonalon másodpercben.

### Leg

Az útiterv lábai (részei).

- `agencyId` — string. Tranzit láb esetén a járatot biztosító szolgáltató azonosítója.
- `agencyName` — string. Tranzit láb esetén a járatot biztosító szolgáltató neve.
- `agencyTimeZoneOffset` — integer (int32) **required**. Tranzit láb esetén a járatot biztosító szolgáltató időzónájának eltolódása.
- `agencyUrl` — string. Tranzit láb esetén a járatot biztosító szolgáltató linkje.
- `alertIds` — array of string **required**. A lábhoz tartozó aktív zavarok azonosítói.
- `alightRule` — string. Igényvezérelt menet esetén a leszállási szabály.
- `arrivalDelay` — integer (int32) **required**. Tranzit láb esetén a láb vége és a tényleges leszállás közötti késleltetés.
- `boardRule` — string. Igényvezérelt menet esetén a felszállási szabály.
- `departureDelay` — integer (int32) **required**. Tranzit láb esetén a láb indulása és a tényleges felszállás közötti késleltetés.
- `distance` — number (double) **required**. A láb bejárása alatt megtett táv méterben.
- `duration` — integer (int64) **required**. A láb hossza ezredmásodpercben.
- `endTime` — string (date-time) **required**. A láb vége ezredmásodpercben.
- `from` — [Place](#place) **required**.
- `generalizedCost` — integer (int32) **required**. Az utazástervező algoritmus által használt súly.
- `hasAlertInPattern` — boolean. Útiterv minták esetén jelzi, hogy a mintában a megfelelő lábak valamelyikén szerepel aktív riasztás. Nincs kitöltve, ha az útiterv minták ki vannak kapcsolva.
- `headsign` — string. Tranzit láb esetén a menet célállomása.
- `interlineWithPreviousLeg` — boolean. Jelzi, hogy az utas maradjon a járművön a végállomásnál, mert másik menetként folytatódik (hurokjárat).
- `intermediateStops` — array of [Place](#place). Tranzit láb esetén a köztes megállók a láb kezdete és végződése között.
- `legElevation` — array of [ElevationPoint](#elevationpoint). A lábhoz tartozó magassági adatok.
- `legGeometry` — [EncodedPolylineBean](#encodedpolylinebean) **required**.
- `mode` — [TraverseMode](#traversemode) **required**.
- `onBoardAccess` — boolean. Igaz, ha járatról történt a tervezés.
- `pathway` — boolean **required**. Jelzi, hogy a láb egy pathway (pl. metró lejáró).
- `realTime` — boolean **required**. Jelzi, hogy a láb adatai valós idejű forrásból származnak.
- `rentedBike` — boolean. Jelzi, hogy a lábat bérelt kerékpárral kell bejárni.
- `requiresBooking` — boolean. Igaz, ha szükséges foglalás.
- `routeColor` — string. Tranzit láb esetén a járat hátterének színe a megjelenítéséhez.
- `routeId` — string. Tranzit láb esetén a járat azonosítója.
- `routeIds` — array of string. Útiterv minták esetén, a lábnak a mintában megfelelő, más lábakon használt járatok azonosítóinak listája.
- `routeLongName` — string. Tranzit láb esetén a járat hosszú neve.
- `routeShortName` — string. Tranzit láb esetén a járat rövid neve.
- `routeTextColor` — string. Tranzit láb esetén a járat szövegének színe a megjelenítéséhez.
- `serviceDate` — string. Tranzit láb esetén a menet menetrendi napja.
- `startTime` — string (date-time) **required**. A láb kezdete ezredmásodpercben.
- `staySeated` — boolean. Jelzi, hogy az aktuális és az előző tranzit lábat összekötő garantált (GTFS) csatlakozásnál a menet az aktuális járművön folytatódik.
- `steps` — array of [WalkStep](#walkstep). Az útvonal lépései gyalogos, kerékpáros vagy autós láb lesetén.
- `timeZone` — object.
- `to` — [Place](#place) **required**.
- `transferFromPreviousTrip` — boolean. Jelzi, hogy az aktuális és az előző tranzit láb garantált (GTFS) csatlakozással van összekötve.
- `transitLeg` — boolean **required**. Jelzi, hogy a láb tranzit-e.
- `tripBlockId` — string. Tranzit láb esetén a menethez tartozó GTFS block_id, amennyiben létezik.
- `tripId` — string. Tranzit láb esetén a menet azonosítója.
- `tripIds` — array of string. Útiterv minták esetén, a lábnak a mintában megfelelő, más lábakon használt menetek azonosítóinak listája.
- `unknownGeometry` — boolean. Jelzi, hogy a láb geometriája ismeretlen.
- `vertex` — string. A menet utazástervező azonosítója, amelyet a `fromPlace` megadásához lehet használni.
- `wait` — [WaitTime](#waittime).

### Message

A hibaüzenet kódja.

Values: `PLAN_OK`, `SYSTEM_ERROR`, `GRAPH_UNAVAILABLE`, `PLANNER_SERVICE_UNAVAILABLE`, `OUTSIDE_BOUNDS`, `PATH_NOT_FOUND`, `NO_TRANSIT_TIMES`, `REQUEST_TIMEOUT`, `BOGUS_PARAMETER`, `GEOCODE_FROM_NOT_FOUND`, `GEOCODE_TO_NOT_FOUND`, `GEOCODE_FROM_TO_NOT_FOUND`, `TOO_CLOSE`, `LOCATION_NOT_ACCESSIBLE`, `MISSING_MODE`, `GEOCODE_FROM_AMBIGUOUS`, `GEOCODE_TO_AMBIGUOUS`, `GEOCODE_FROM_TO_AMBIGUOUS`, `UNDERSPECIFIED_TRIANGLE`, `TRIANGLE_NOT_AFFINE`, `TRIANGLE_OPTIMIZE_TYPE_NOT_SET`, `TRIANGLE_VALUES_NOT_SET`


### MetadataResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitMetadata](#transitentrywithreferencestransitmetadata) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### MobileTransitReferences

- `agencies` — array of [TransitAgency](#transitagency). Szolgáltatók referenciáinak listája.
- `alerts` — array of [TransitAlert](#transitalert). Zavarok referenciáinak listája.
- `routes` — array of [TransitRoute](#transitroute). Járatok referenciáinak listája.
- `stops` — array of [TransitStop](#transitstop). Megállók referenciáinak listája.
- `trips` — array of [TransitTrip](#transittrip). Menetek referenciáinak listája.

### MultiRouteDetailsMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitRouteDetails](#transitlistentrywithreferencestransitroutedetails) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### OTPTransitReferences

- `agencies` — map of string → [TransitAgency](#transitagency). Szolgáltatók referenciáinak listája.
- `alerts` — map of string → [TransitAlert](#transitalert). Zavarok referenciáinak listája.
- `routes` — map of string → [TransitRoute](#transitroute). Járatok referenciáinak listája.
- `stops` — map of string → [TransitStop](#transitstop). Megállók referenciáinak listája.
- `trips` — map of string → [TransitTrip](#transittrip). Menetek referenciáinak listája.

### OnboardDepartPosition

- `accuracy` — number (double). A pontossága egy pozició pontnak méterben.
- `lat` — number (double) **required**. A szélességi koordinátája egy pozició pontnak.
- `lon` — number (double) **required**. A hosszúsági koordinátája egy pozició pontnak.
- `speed` — number (double). A sebesség egy pozició pontban m/s-ban.
- `timestamp` — integer (int64) **required**. Az időpontja egy pozició pontnak epoch másodpercben a szerver órája szerint.

### OnboardDepartSearchMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### OptimizeType

Values: `BEST`, `WALK`, `TRANSFERS`


### PatternStatistics

Útitervminták engedélyezése esetén a minták időtartam-adatai.

- `avg` — integer (int64). Átlag érték. Akkor van kitöltve, ha az adatok megegyeznek.
- `max` — integer (int64). Maximum érték. Akkor van kitöltve, ha az adatok különbözőek.
- `min` — integer (int64). Minimum érték. Akkor van kitöltve, ha az adatok különbözőek.
- `text` — string **required**. A klienseken megjelenített szöveg.

### Place

Tranzit láb esetén a köztes megállók a láb kezdete és végződése között.

- `arrival` — string (date-time). A helyre érkezés időpontja ezredmásodpercben.
- `departure` — string (date-time). A helyről való indulás időpontja ezredmásodpercben.
- `lat` — number (double). A hely szélességi koordinátája.
- `lon` — number (double). A hely hosszúsági koordinátája.
- `name` — string **required**. Megálló esetén a megálló neve, POI-nál a POI neve.
- `orig` — string. Az indulási és az érkezési hely címkéje. Az első és az utolsó útvonal lábon van kitöltve.
- `platformCode` — string. A megálló peron-kódja, ha a hely egy megálló.
- `stopCode` — string. A megálló kódja, ha a hely egy megálló.
- `stopId` — string. A megálló azonosítója, ha a hely egy megálló.
- `stopIndex` — integer (int32). A megálló indexe, ha a hely egy megálló.
- `stopSequence` — integer (int32). A megálló sorszáma a meneten, ha a hely egy megálló.
- `ticketingLocation` — [TicketingLocation](#ticketinglocation).

### PlaceType

A jegyértékesítési hely típusa.

Values: `CUSTOMER_CENTER`, `CASHIER`, `VENDING_MACHINE`, `RESELLER`


### PlanTripResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesResponse](#transitentrywithreferencesresponse) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### PlannerError

A hibát tartalmazza, ha nem sikerült a tervezés.

- `id` — integer (int32) **required**. A hibaüzenet azonosítója.
- `message` — [Message](#message) **required**.
- `missing` — array of string. A rossz paraméterek listája.
- `noPath` — boolean **required**. Igaz, ha nem sikerült útvonalat találni.

### ReferencesMethodErrors

- `agencyIds` — array of string **required**. A szolgáltató ID-k, amelyek feloldása sikertelen volt.
- `alertIds` — array of string **required**. A zavar ID-k, amelyek feloldása sikertelen volt.
- `routeIds` — array of string **required**. A járat ID-k, amelyek feloldása sikertelen volt.
- `stopIds` — array of string **required**. A megálló ID-k, amelyek feloldása sikertelen volt.

### ReferencesMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesReferencesMethodResult](#transitentrywithreferencesreferencesmethodresult) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### ReferencesMethodResult

A lekért adat.

- `errors` — [ReferencesMethodErrors](#referencesmethoderrors) **required**.

### ReferencesSchema

Values: `true`, `false`, `compact`, `agencies`, `routes`, `trips`, `stops`, `alerts`, `stations`


### RelativeDirection

A lépés iránya.

Values: `DEPART`, `HARD_LEFT`, `LEFT`, `SLIGHTLY_LEFT`, `CONTINUE`, `SLIGHTLY_RIGHT`, `RIGHT`, `HARD_RIGHT`, `CIRCLE_CLOCKWISE`, `CIRCLE_COUNTERCLOCKWISE`, `ELEVATOR`, `UTURN_LEFT`, `UTURN_RIGHT`


### Response

A lekért adat.

- `error` — [PlannerError](#plannererror).
- `plan` — [TripPlan](#tripplan).
- `requestParameters` — map of string → string **required**. A tervezési paraméterek.

### RouteDetailsForStopMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitRoute](#transitlistentrywithreferencestransitroute) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### RouteDetailsMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitRouteDetails](#transitentrywithreferencestransitroutedetails) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### RouteDisplayedLeg

Extends [DisplayedLeg](#displayedleg).

- `hasAlert` — boolean. Jelzi, hogy a lábon található aktív zavar.
- `routeId` — string. A lábon használt járat azonosítója.
- `routeIds` — array of string. Útiterv minták esetén, a mintához tartozó más útitervek megfelelő lábaiban használt járatok azonosítóinak listája (alternatív járatok listája).
- `wait` — [WaitTime](#waittime).
- `wheelchairAccessible` — boolean. Jelzi, hogy a láb akadálymentes.

### ScheduleForStopOTPMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitSchedule](#transitentrywithreferencestransitschedule) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### SearchMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitSearch](#transitentrywithreferencestransitsearch) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### ServiceDate

Menetrendi nap


### StatisticsResponse

- `result` — string **required**. Egyszerű válasz.

### Status

A válasz státusza.

Values: `OK`, `NOT_MODIFIED`, `MOVED_TEMPORARILY`, `INVALID_VALUE`, `OUTSIDE_BOUNDS`, `BOGUS_PARAMETER`, `TOO_CLOSE`, `LOCATION_NOT_ACCESSIBLE`, `MISSING_MODE`, `LIMIT_EXCEEDED`, `NO_ROUTE_ID_PROVIDED`, `NOT_FOUND`, `PATH_NOT_FOUND`, `NO_TRANSIT_TIMES`, `NOT_OPERATING`, `REQUEST_TIMEOUT`, `ERROR_NO_GRAPH`, `UNKNOWN_ERROR`, `ERROR_BIKE_RENTAL_SERVICE`, `ERROR_TICKETING_SERVICE`, `ERROR_TRANSIT_INDEX_SERVICE`, `ERROR_PATCH_SERVICE`, `PLANNER_SERVICE_UNAVAILABLE`


### StopTimeType

Values: `ARRIVAL`, `DEPARTURE`, `ARRIVAL_AND_DEPARTURE`


### StopsForLocationResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitStop](#transitlistentrywithreferencestransitstop) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### TicketingDisplayedLeg

Extends [DisplayedLeg](#displayedleg).


### TicketingLocation

A jegyértékesítési pontok listája.

- `address` — string. A jegyértékesítési hely címe.
- `cashAccepted` — boolean **required**. Jelzi, hogy a jegyértékesítési helyen elfogadnak készpénzt.
- `creditCardsAccepted` — boolean **required**. Jelzi, hogy a jegyértékesítési helyen elfogadnak bankkártyát.
- `description` — string. A jegyértékesítési hely leírása.
- `id` — string **required**. A jegyértékesítési hely azonosítója.
- `lastModified` — string (date-time) **required**. A jegyértékesítési hely utolsó frissítésének időpontja ezredmásodpercben.
- `lat` — number (double) **required**. A jegyértékesítési hely szélességi koordinátája.
- `lon` — number (double) **required**. A jegyértékesítési hely hosszúsági koordinátája.
- `openingPeriods` — array of [TicketingPeriod](#ticketingperiod). A jegyértékesítési hely nyitvatartása.
- `operator` — string. A jegyértékesítési hely üzemeltetője.
- `passIdCreation` — boolean **required**. Lehet-e a helyszínen igazolványt csináltatni.
- `place` — string. A jegyértékesítési hely helye.
- `products` — array of string. Az árusított termékek azonosítói.
- `state` — [TicketingState](#ticketingstate).
- `ticketPassExchange` — boolean **required**. Be lehet-e váltani a helyszínen jegyet.
- `type` — [PlaceType](#placetype).
- `visible` — boolean **required**. Ha `false`, akkor hibás az adat, így a felületen elrejtésre kerül.

### TicketingMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitTicketing](#transitentrywithreferencestransitticketing) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### TicketingPeriod

A jegyértékesítési hely nyitvatartása.

- `closes` — string. Zárási idő HH:mm formátumban.
- `closesSeconds` — integer (int32) **required**. Zárási idő másodpercben.
- `dayOfWeek` — [DayOfWeek](#dayofweek) **required**.
- `opens` — string. Nyitási idő HH:mm formátumban.
- `opensSeconds` — integer (int32) **required**. Nyitási idő másodpercben.

### TicketingProduct

A termékek listája.

- `groupId` — string. A termék csoportjának azonosítója.
- `groupName` — string. A termék csoportjának neve.
- `id` — string **required**. A termék azonosítója.
- `lastModified` — string (date-time) **required**. A termék utolsó frissítésének időpontja ezred másodpercben.
- `name` — string. A termék neve.
- `price` — string. A termék ára.
- `url` — string. A termék linkje.
- `visible` — boolean **required**. Ha `false`, akkor hibás az adat, így a felületen elrejtésre kerül.

### TicketingState

A jegyértékesítési hely állapota.

Values: `PLANNED`, `OPERATIONAL`, `INOPERATIVE`


### TransferDirection

A csatlakozás iránya.

Values: `FEEDER`, `FETCHER`


### TransferStatus

A csatlakozás állapota.

Values: `NO_DATA`, `OK`, `WAIT`, `ABORTED`


### TransitAgency

Szolgáltatók referenciáinak listája.

- `id` — string **required**. Entitás azonosító
- `lang` — string. A szolgáltató nyelve.
- `name` — string **required**. A szolgáltató neve.
- `phone` — string. A szolgáltató telefonszáma.
- `timezone` — string **required**. A szolgáltató időzónája.
- `url` — string **required**. A szolgáltató linkje.

### TransitAlert

Zavarok referenciáinak listája.

- `description` — [TranslatedString](#translatedstring) **required**.
- `disableApp` — boolean. A zavar hatására használhatatlan lesz-e az alkalmazás.
- `end` — integer (int64). A zavar végének időpontja másodpercben.
- `endText` — [TranslatedString](#translatedstring).
- `header` — [TranslatedString](#translatedstring) **required**.
- `id` — string **required**. Entitás azonosító
- `modifiedTime` — integer (int64) **required**. A zavar utolsó módosításának időpontja másodpercben.
- `priority` — integer (int32). A zavar priorítása.
- `routeIds` — array of string **required**. A zavar által érintett járatok azonosítóinak listája.
- `routes` — array of [TransitAlertRoute](#transitalertroute) **required**. A zavar által érintett járatok listája.
- `start` — integer (int64). A zavar kezdő időpontja másodpercben.
- `startText` — [TranslatedString](#translatedstring).
- `stopIds` — array of string **required**. A zavar által érintett megállók azonosítóinak listája.
- `timestamp` — integer (int64) **required**. A zavar időbélyege másodpercben.
- `url` — [TranslatedString](#translatedstring).
- `vehicleRouteTypes` — array of string **required**. Az érintett elemek járat-típusai. Values: `BICYCLE`, `CAR`, `WALK`, `BUS`, `CABLE_CAR`, `COACH`, `FERRY`, `FUNICULAR`, `GONDOLA`, `RAIL`, `SUBURBAN_RAILWAY`, `SUBWAY`, `TRAM`, `TROLLEYBUS`, `LOCAL`, `TRANSIT`.

### TransitAlertDetails

A lekért adat.

- `routeDetails` — array of [TransitRouteDetails](#transitroutedetails) **required**. A zavarhoz tartozó járatok részletei.

### TransitAlertGroup

- `alertIds` — array of string.
- `id` — string.
- `name` — string.

### TransitAlertRoute

A zavar által érintett járatok listája.

- `affectedEntityDescription` — [TranslatedString](#translatedstring).
- `effectType` — [EffectType](#effecttype) **required**.
- `header` — [TranslatedString](#translatedstring) **required**.
- `routeId` — string **required**. Entitás azonosító
- `stopIds` — array of string **required**. A zavar által érintett megállók azonosítóinak listája a járaton.

### TransitArrivalsAndDepartures

A lekért adat.

- `alertIds` — array of string **required**. A megállóhoz tartozó aktív zavarok.
- `nearbyStopIds` — array of string **required**. A közeli megállók azonosítói.
- `routeIds` — array of string **required**. A megállóhoz tartozó járatok azonosítói.
- `stopId` — string **required**. Entitás azonosító
- `stopTimes` — array of [TransitScheduleStopTime](#transitschedulestoptime) **required**. A megállóhoz tartozó menetrendi bejegyzések.

### TransitBikeRentalStation

A lekért adatok listája.

- `bikes` — integer (int32) **required**. Az állomáson elérhető kerékpárok száma.
- `code` — string **required**. Az állomás kódja.
- `id` — string **required**. Az állomás azonosítója.
- `lat` — number (double) **required**. Az állomás szélességi koordinátája.
- `lon` — number (double) **required**. Az állomás hosszúsági koordinátája.
- `name` — string **required**. Az állomás neve.
- `spaces` — integer (int32) **required**. Az állomás összes helyének száma. Ez mindig fix 999.
- `style` — [TransitBikeRentalStationStyle](#transitbikerentalstationstyle).
- `type` — string. Az állomás típusa.

### TransitBikeRentalStationStyle

Az állomáshoz tartozó stílus.

- `icon` — [TransitBikeRentalStationStyleIcon](#transitbikerentalstationstyleicon) **required**.

### TransitBikeRentalStationStyleIcon

A kerékpárkölcsönző állomáshoz megjelenítendő ikon.

- `name` — string **required**. Az ikon neve.

### TransitCoordinatePoint

A jármű pozíciója.

- `lat` — number (float) **required**. Szélességi koordináta.
- `lon` — number (float) **required**. Hosszúsági koordináta.

### TransitDepartureGroup

A lekért adatok listája.

- `headsign` — string **required**. A csoporthoz tartozó célállomás.
- `routeId` — string **required**. Entitás azonosító
- `stopTimes` — array of [TransitScheduleStopTime](#transitschedulestoptime) **required**. A csoport menetrendi bejegyzései.

### TransitEntityType

Values: `STOP`, `STATION`, `ROUTE`, `RELATED_ALERT`


### TransitEntryWithReferencesReferencesMethodResult

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [ReferencesMethodResult](#referencesmethodresult) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesResponse

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [Response](#response) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitAlertDetails

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitAlertDetails](#transitalertdetails) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitArrivalsAndDepartures

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitArrivalsAndDepartures](#transitarrivalsanddepartures) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitMetadata

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitMetadata](#transitmetadata) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitRouteDetails

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitRouteDetails](#transitroutedetails) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitSchedule

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitSchedule](#transitschedule) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitSearch

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitSearch](#transitsearch) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitTicketing

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitTicketing](#transitticketing) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitEntryWithReferencesTransitTripDetailsOTP

A válasz adat.

- `class` — string **required**. Az adat típusa. Egy entitás esetén "entryWithReferences".
- `entry` — [TransitTripDetailsOTP](#transittripdetailsotp) **required**.
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitBikeRentalStation

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitBikeRentalStation](#transitbikerentalstation) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitDepartureGroup

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitDepartureGroup](#transitdeparturegroup) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitRoute

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitRoute](#transitroute) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitRouteDetails

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitRouteDetails](#transitroutedetails) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitStop

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitStop](#transitstop) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitListEntryWithReferencesTransitVehicle

A válasz adat.

- `class` — string **required**. Az adat típusa. Lista esetén "listWithReferences".
- `limitExceeded` — boolean **required**. Igaz, ha a lista több elemet tartalmaz, mint a limit paraméter. Indulási és érkezési idő típusú lekéréseknél használjuk.
- `list` — array of [TransitVehicle](#transitvehicle) **required**. A lekért adatok listája.
- `missingIds` — array of string. Az ID-k, amelyek feloldása sikertelen volt.
- `outOfRange` — boolean **required**. Az értéke mindig `false`.
- `references` — [TransitReferences](#transitreferences).

### TransitMetadata

A lekért adat.

- `alertIds` — array of string **required**. Az egész alkalmazásra vonatkozó aktív zavarok azonosítói.
- `boundingPolyLine` — string **required**. A betöltött adatokat határoló sokszög vonala (polyline).
- `completeValidityEnd` — string **required**. Menetrendi nap
- `completeValidityStart` — string **required**. Menetrendi nap
- `dayTypes` — map of string → string **required**. A menetrendi napok, és a hozzá tartozó napok típusát tartalmazó összerendelés egy hétre (az aktuális nap, és a következő 6).
- `feedIds` — array of string **required**. Az aktív adatforrások azonosítói.
- `lowerLeftLatitude` — number (double) **required**. A betöltött adatok területének befoglaló téglalapjának két sarokpontja.
- `lowerLeftLongitude` — number (double) **required**. A betöltött adatok területének befoglaló téglalapjának két sarokpontja.
- `readableTime` — string **required**. A szerver ideje ISO8601 formátumban.
- `time` — integer (int64) **required**. Aktuális szerveridő ezredmásodpercben.
- `timeZone` — string **required**. A szerver tranzit adatainak időzónája.
- `upperRightLatitude` — number (double) **required**. A betöltött adatok területének befoglaló téglalapjának két sarokpontja.
- `upperRightLongitude` — number (double) **required**. A betöltött adatok területének befoglaló téglalapjának két sarokpontja.
- `validityEnd` — string **required**. Menetrendi nap
- `validityStart` — string **required**. Menetrendi nap

### TransitPolyline

A menethez tartozó kódolt minta (polyline).

- `length` — integer (int32) **required**. A minta pontjainak száma.
- `levels` — string **required**. A minta magassági adatai (mindig üres).
- `points` — string **required**. A minta kódolt pontjai.

### TransitReferences

A válaszhoz tartozó referenciák.


### TransitRoute

Járatok referenciáinak listája.

- `agencyId` — string **required**. Entitás azonosító
- `bikesAllowed` — boolean **required**. Kerékpár szállítása engedélyezett-e a járaton.
- `color` — string **required**. A járat színe. Deprecated: használjuk a `style` attribútumot helyette.
- `description` — string. A járat neve. Ha egy | szerepel a névben, akkor a végállomásokat választja el amelyek külön sorokban megjeleníthetőek. COMPACT referenciák kérése esetében nincs kitöltve.
- `iconDisplayText` — string. A járat ikonjának megjelenítési szövege. Deprecated: használjuk a `style` attribútumot helyette.
- `iconDisplayType` — string. A járat ikonjának megjelenítési típusa. Deprecated: használjuk a `style` attribútumot helyette.
- `id` — string **required**. Entitás azonosító
- `longName` — string. A járat hosszú neve.
- `shortName` — string. A járat rövid neve.
- `sortOrder` — integer (int32) **required**. A járat rendezési sorszáma a többi járathoz viszonyítva.
- `style` — [TransitRouteStyle](#transitroutestyle) **required**.
- `textColor` — string **required**. A járat szövegének színe. Deprecated: használjuk a `style` attribútumot helyette.
- `type` — [TraverseMode](#traversemode) **required**.
- `url` — string. A járat linkje.

### TransitRouteDetails

A lekért adat.

- `agencyId` — string **required**. Entitás azonosító
- `alertIds` — array of string **required**. A járaton található aktív zavarok azonosítóinak listája.
- `bikesAllowed` — boolean **required**. Kerékpár szállítása engedélyezett-e a járaton.
- `color` — string **required**. A járat színe. Deprecated: használjuk a `style` attribútumot helyette.
- `description` — string. A járat neve. Ha egy | szerepel a névben, akkor a végállomásokat választja el amelyek külön sorokban megjeleníthetőek. COMPACT referenciák kérése esetében nincs kitöltve.
- `iconDisplayText` — string. A járat ikonjának megjelenítési szövege. Deprecated: használjuk a `style` attribútumot helyette.
- `iconDisplayType` — string. A járat ikonjának megjelenítési típusa. Deprecated: használjuk a `style` attribútumot helyette.
- `id` — string **required**. Entitás azonosító
- `longName` — string. A járat hosszú neve.
- `shortName` — string. A járat rövid neve.
- `sortOrder` — integer (int32) **required**. A járat rendezési sorszáma a többi járathoz viszonyítva.
- `style` — [TransitRouteStyle](#transitroutestyle) **required**.
- `textColor` — string **required**. A járat szövegének színe. Deprecated: használjuk a `style` attribútumot helyette.
- `type` — [TraverseMode](#traversemode) **required**.
- `url` — string. A járat linkje.
- `variants` — array of [TransitRouteVariant](#transitroutevariant) **required**. A járathoz tartozó járat variánsok listája.

### TransitRouteSchedule

A megállóhoz tartozó menetrend.

- `alertIds` — array of string **required**. A járathoz tartozó aktív zavarok.
- `directions` — array of [TransitRouteScheduleForDirection](#transitrouteschedulefordirection) **required**. A menetrendi adatok irány szerint csoportosítva.
- `routeId` — string **required**. Entitás azonosító

### TransitRouteScheduleForDirection

A menetrendi adatok irány szerint csoportosítva.

- `directionId` — string. Az irány azonosítója.
- `groups` — map of string → [TransitScheduleGroup](#transitschedulegroup) **required**. Célmegálló és a hozzá tartozó menetrendi adatok összerendelése.
- `stopTimes` — array of [TransitScheduleStopTime](#transitschedulestoptime) **required**. Az irányhoz tartozó menetrendi bejegyzések.

### TransitRouteStyle

A járat megjelenítési stílusa.

- `color` — string **required**. A járat színe.
- `groupId` — integer (int32) **required**. A járathoz tartozó stílus-csoport azonosítója.
- `icon` — [TransitRouteStyleIcon](#transitroutestyleicon) **required**.
- `stop` — [TransitStopStyle](#transitstopstyle).
- `vehicleIcon` — [TransitVehicleStyleIcon](#transitvehiclestyleicon) **required**.

### TransitRouteStyleIcon

A járathoz tartozó ikon stílusa.

- `text` — string **required**. Az ikon felirata.
- `textColor` — string **required**. Az ikon feliratának színe.
- `type` — [TransitRouteStyleIconType](#transitroutestyleicontype) **required**.

### TransitRouteStyleIconType

Az ikon típusa.

Values: `BOX`, `CIRCLE`


### TransitRouteVariant

A járathoz tartozó járat variánsok listája.

- `bookableStopIds` — array of string **required**. A járat variáns megálló azonosítói, amelyekre lehetséges lehet a foglalás.
- `direction` — string. A járat variáns iránya.
- `headsign` — string **required**. A járat variáns célállomása.
- `mayRequireBooking` — boolean **required**. Igaz, ha a járaton vannak olyan menetek, amelyeken szükséges lehet az előre foglalás.
- `name` — string. A járat variáns neve.
- `patternId` — string. Entitás azonosító
- `polyline` — [TransitPolyline](#transitpolyline) **required**.
- `routeId` — string. Entitás azonosító
- `stopIds` — array of string **required**. A járat variáns megállóinak azonosítói.
- `type` — string. A járat variáns típusa.

### TransitSchedule

A lekért adat.

- `alertIds` — array of string **required**. A megállóhoz tartozó aktív zavarok azonosítói.
- `date` — string (date) **required**. A menetrendhez tartozó dátum.
- `nearbyStopIds` — array of string **required**. A közeli megállók azonosítói.
- `routeIds` — array of string **required**. A menetrendhez tartozó járatok azonosítói.
- `schedules` — array of [TransitRouteSchedule](#transitrouteschedule) **required**. A megállóhoz tartozó menetrend.
- `serviceDate` — string **required**. Menetrendi nap
- `stopId` — string **required**. Entitás azonosító

### TransitScheduleGroup

Célmegálló és a hozzá tartozó menetrendi adatok összerendelése.

- `description` — string **required**. A menetrendi csoport leírása.
- `groupId` — string **required**. A menetrendi csoport azonosítója.
- `headsign` — string **required**. A menetrendi csoport célállomása.

### TransitScheduleStopTime

Az irányhoz tartozó menetrendi bejegyzések.

- `alertIds` — array of string **required**. A megállóhoz tartozó aktív zavarok azonosítóinak listája.
- `arrivalTime` — integer (int64). A megállóba érkezés tervezett ideje epoch másodbercben. Az első megállónál hiányzik.
- `departureTime` — integer (int64). A megállóból való indulás tervezett ideje epoch másodbercben. Az utolsó megállónál hiányzik.
- `dropOffAllowed` — boolean. Igaz, ha a megállóban engedélyezett-e a buszról való leszállás
- `groupIds` — array of string. A megálló csoportjának azonosítója.
- `mayRequireBooking` — boolean **required**. Igaz, ha a menet legalább egy rákövetkező megállója foglalást igényel.
- `pickupAllowed` — boolean. Igaz, ha a megállóban engedélyezett-e a buszra való felszállás
- `predictedArrivalTime` — integer (int64). A megállóba érkezés becsült ideje epoch másodbercben, ha a járathoz van valós idejű adat. Az első megállónál hiányzik.
- `predictedDepartureTime` — integer (int64). A megállóból való becsült indulás ideje epoch másodbercben, ha a járathoz van valós idejű adat. Az utolsó megállónál hiányzik.
- `predictionScheduled` — boolean. Igaz, ha a menetrendi bejegyzéshez tartozó megálló időpontja tervezett. API v5 óta.
- `serviceDate` — string **required**. Menetrendi nap
- `stopHeadsign` — string **required**. A megállóban kijelzett célállomás.
- `stopId` — string. Entitás azonosító
- `stopSequence` — integer (int32). A menetrendi bejegyzéshez tartozó megálló sorszáma a meneten.
- `tripId` — string **required**. Entitás azonosító
- `uncertain` — boolean. Igaz, ha a menethez tartozó valós idejű adatok bizonytalanok.
- `vehicle` — [TransitVehicle](#transitvehicle).
- `wheelchairAccessible` — boolean **required**. A bejegyzéshez tartozó menet alacsonypadlóssága.

### TransitSearch

A lekért adat.

- `alertGroups` — array of [TransitAlertGroup](#transitalertgroup).
- `alertIds` — array of string. Az illeszkedő zavarok azonosítói.
- `query` — string. A keresett kifejezés.
- `routeIds` — array of string. Az illeszkedő járatok azonosítói.
- `stopIds` — array of string. Az illeszkedő megállók azonosítói.

### TransitStop

Megállók referenciáinak listája.

- `alertIds` — array of string. A megállóra vonatkozó aktív zavarok azonosítói.
- `code` — string. A megálló kódja.
- `description` — string. A megálló leírása.
- `direction` — string **required**. A megálló iránya.
- `id` — string **required**. Entitás azonosító
- `lat` — number (double) **required**. A megálló szélességi koordinátája.
- `locationSubType` — string. A megálló hely-altípusa.
- `locationType` — integer (int32) **required**. A megálló hely-típusa.
- `lon` — number (double) **required**. A megálló hosszúsági koordinátája.
- `name` — string **required**. A megálló neve.
- `parentStationId` — string. Entitás azonosító
- `platformCode` — string. A megálló peron-kódja.
- `routeIds` — array of string **required**. A megállót érintő járatok azonosítói.
- `stopColorType` — string. A megálló színezésének típusa, az értéke mindig `BUS`. Deprecated: használjuk a `style` attribútumot.
- `style` — [TransitStopStyle](#transitstopstyle) **required**.
- `type` — string. A megálló típusa. Deprecated: használjuk a `style` attribútumot. Values: `BICYCLE`, `CAR`, `WALK`, `BUS`, `CABLE_CAR`, `COACH`, `FERRY`, `FUNICULAR`, `GONDOLA`, `RAIL`, `SUBURBAN_RAILWAY`, `SUBWAY`, `TRAM`, `TROLLEYBUS`, `LOCAL`, `TRANSIT`.
- `vertex` — string. A megálló utazástervező azonosítója, amelyet a `fromPlace` és a `toPlace` megadásához lehet használni.
- `wheelchairBoarding` — boolean **required**. Akadálymentesített-e a megálló.

### TransitStopStyle

A megálló stílusa.

- `colors` — array of string **required**. A megálló stílushoz tartozó színek tömbje.
- `image` — string. A megálló stílus képe.
- `type` — [TransitStopStyleType](#transitstopstyletype).

### TransitStopStyleType

A megálló stílus típusa.

Values: `PRIORITY`


### TransitTicketing

A lekért adat.

- `lastModifiedTime` — integer (int64) **required**. A jegyértékesítési adatok legutóbbi módosulásának időpontja.
- `locations` — array of [TicketingLocation](#ticketinglocation) **required**. A jegyértékesítési pontok listája.
- `oldestModifiedTime` — integer (int64) **required**. A legrégebb óta módosított értékesítési hely vagy termék módosításának időpontja.
- `products` — array of [TicketingProduct](#ticketingproduct) **required**. A termékek listája.

### TransitTransfer

Menethez kapcsolódó csatlakozások ebben a megállóban.

- `direction` — [TransferDirection](#transferdirection) **required**.
- `minTransferTime` — integer (int32) **required**. Minimális átszállási idő.
- `otherServiceDate` — string **required**. Menetrendi nap
- `otherStopId` — string. Entitás azonosító
- `otherTripDesc` — string. A csatlakozó menet leírása, ha azt egy külső szolgáltató üzemelteti.
- `otherTripId` — string. Entitás azonosító
- `otherTripTime` — [TransitTransferStopTime](#transittransferstoptime).
- `status` — [TransferStatus](#transferstatus) **required**.
- `staySeated` — boolean **required**. Igaz, ha a csatlakozásban szereplő menetek közötti átszálláshoz nem kell leszállni a járműről.
- `transferId` — string **required**. Entitás azonosító

### TransitTransferStopTime

A másik menet érkezési vagy indulási ideje.

- `predictedTime` — integer (int64). A megállóhoz tartozó becsült idő epoch másodbercben, ha a járathoz van valós idejű adat.
- `scheduledTime` — integer (int64) **required**. A megállóhoz tartozó tervezett idő epoch másodbercben.
- `stopHeadsign` — string. A megállóban kijelzett célállomás.
- `uncertain` — boolean. Igaz, ha a menethez tartozó valós idejű adatok bizonytalanok.

### TransitTrip

Menetek referenciáinak listája.

- `bikesAllowed` — boolean **required**. Szállítható-e kerékpár a meneten.
- `blockId` — string. A menethez tartozó GTFS block_id, amennyiben létezik.
- `directionId` — string. A menet irányának azonosítója.
- `id` — string **required**. Entitás azonosító
- `routeId` — string **required**. Entitás azonosító
- `serviceId` — string **required**. Entitás azonosító
- `shapeId` — string **required**. Entitás azonosító
- `tripHeadsign` — string **required**. A menet célállomása.
- `tripShortName` — string. A menet rövid neve.
- `wheelchairAccessible` — boolean **required**. Alacsonypadlós-e a menet.

### TransitTripDetailsOTP

A lekért adat.

- `alertIds` — array of string **required**. Aktív zavarok a meneten.
- `mayRequireBooking` — boolean **required**. Igaz, ha a menet (legalább egy szakasza) foglalást igényel.
- `nextBlockTripId` — string. Entitás azonosító
- `polyline` — [TransitPolyline](#transitpolyline).
- `serviceDate` — string **required**. Menetrendi nap
- `stopTimes` — array of [TransitTripStopTime](#transittripstoptime) **required**. Menet megállóinak listája.
- `tripId` — string **required**. Entitás azonosító
- `vehicle` — [TransitVehicle](#transitvehicle).
- `vertex` — string. A menet utazástervező azonosítója, amelyet a `fromPlace` megadásához lehet használni.

### TransitTripStopTime

Menet megállóinak listája.

- `arrivalTime` — integer (int64). A megállóba érkezés tervezett ideje epoch másodbercben. Az első megállónál hiányzik.
- `departureTime` — integer (int64). A megállóból való indulás tervezett ideje epoch másodbercben. Az utolsó megállónál hiányzik.
- `dropOffAllowed` — boolean. Igaz, ha a megállóban engedélyezett-e a buszról való leszállás
- `pickupAllowed` — boolean. Igaz, ha a megállóban engedélyezett-e a buszra való felszállás
- `predictedArrivalTime` — integer (int64). A megállóba érkezés becsült ideje epoch másodbercben, ha a járathoz van valós idejű adat. Az első megállónál hiányzik.
- `predictedDepartureTime` — integer (int64). A megállóból való becsült indulás ideje epoch másodbercben, ha a járathoz van valós idejű adat. Az utolsó megállónál hiányzik.
- `predictionScheduled` — boolean. Igaz, ha a menetrendi bejegyzéshez tartozó megálló időpontja tervezett. API v5 óta.
- `requiresBooking` — boolean **required**. Igaz, ha ez a megálló foglalást igényel.
- `shapeDistTraveled` — number (double). Milyen messze található a megálló az elsőtől a minta mentén méterben.
- `stopHeadsign` — string **required**. A megállóban kijelzett célállomás.
- `stopId` — string **required**. Entitás azonosító
- `stopSequence` — integer (int32). A menetrendi bejegyzéshez tartozó megálló sorszáma a meneten.
- `transfers` — array of [TransitTransfer](#transittransfer). Menethez kapcsolódó csatlakozások ebben a megállóban.
- `uncertain` — boolean. Igaz, ha a menethez tartozó valós idejű adatok bizonytalanok.

### TransitVehicle

A lekért adatok listája.

- `bearing` — number (float). A jármű irányszöge.
- `capacity` — [TransitVehicleOccupancy](#transitvehicleoccupancy).
- `congestionLevel` — [CongestionLevel](#congestionlevel) **required**.
- `deviated` — boolean **required**. Igaz, ha a jármű letért az útvonaláról.
- `label` — string. A jármű kijelzőjén megjelenő célállomáskép.
- `lastUpdateTime` — integer (int64) **required**. A járműhöz tartozó utolsó valós idejű adat időbélyege másodpercben.
- `licensePlate` — string. A jármű rendszáma.
- `location` — [TransitCoordinatePoint](#transitcoordinatepoint) **required**.
- `model` — string. A jármű típusa.
- `occupancy` — [TransitVehicleOccupancy](#transitvehicleoccupancy).
- `routeId` — string. Entitás azonosító
- `serviceDate` — string. Menetrendi nap
- `stale` — boolean. Igaz, ha a jármű pozíciója kiöregedett.
- `status` — [VehicleStatus](#vehiclestatus).
- `stopDistancePercent` — integer (int32). Hol tart a jármű a két megálló közti szakaszon, százalékban.
- `stopId` — string. Entitás azonosító
- `stopSequence` — integer (int32). A jármű által érintett aktuális megálló sorszáma a meneten.
- `style` — [TransitVehicleStyle](#transitvehiclestyle).
- `tripId` — string. Entitás azonosító
- `vehicleId` — string **required**. Entitás azonosító
- `vehicleRouteType` — string. A jármű fajtája. Deprecated: használjuk a `style` attribútumot. Values: `BICYCLE`, `CAR`, `WALK`, `BUS`, `CABLE_CAR`, `COACH`, `FERRY`, `FUNICULAR`, `GONDOLA`, `RAIL`, `SUBURBAN_RAILWAY`, `SUBWAY`, `TRAM`, `TROLLEYBUS`, `LOCAL`, `TRANSIT`.
- `vertex` — string. A menet utazástervező azonosítója, amelyet a `fromPlace` megadásához lehet használni.
- `wheelchairAccessible` — boolean **required**. Igaz, ha a jármű alacsonypadlós.

### TransitVehicleOccupancy

A jármű kapacitása.

- `adults` — integer (int32). Hány felnőtt van a járművön.
- `children` — integer (int32). Hány gyermek van a járművön.
- `other` — integer (int32). Hány be nem kategorizált entitás van a járművön.
- `strollers` — integer (int32). Hány babakocsi van a járművön
- `wheelchairs` — integer (int32). Hány kerekesszék van a járművön.

### TransitVehicleStyle

A járműhöz tartozó stílus.

- `color` — string. A járműhöz megjelenítendő ikon háttérszíne.
- `icon` — [TransitVehicleStyleIcon](#transitvehiclestyleicon) **required**.
- `textColor` — string. A járműhöz megjelenítendő ikon szövegszíne.

### TransitVehicleStyleIcon

A járathoz tartozó jármű ikon stílus.

- `color` — string. Az ikon elsődleges színe.
- `name` — string. Az ikon neve.
- `secondaryColor` — string. Az ikon másodlagos színe.

### TranslatedString

Az adott járat leírása.

- `someTranslation` — string. A fordítás-összerendelések első eleme.
- `translations` — map of string → string **required**. Lokalizáció és a hozzá tartozó fordítások összerendelése.

### TraverseMode

A járat típusa.

Values: `BICYCLE`, `CAR`, `WALK`, `BUS`, `CABLE_CAR`, `COACH`, `FERRY`, `FUNICULAR`, `GONDOLA`, `RAIL`, `SUBURBAN_RAILWAY`, `SUBWAY`, `TRAM`, `TROLLEYBUS`, `LOCAL`, `TRANSIT`


### TripDetailsOTPMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitEntryWithReferencesTransitTripDetailsOTP](#transitentrywithreferencestransittripdetailsotp) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### TripPlan

A tervezett útvonalak.

- `date` — string (date-time) **required**. Az útvonal kezdete ezredmásodpercben.
- `from` — [Place](#place) **required**.
- `itineraries` — array of [Itinerary](#itinerary) **required**. A talált útvonalak listája.
- `to` — [Place](#place) **required**.

### VehicleForTripMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### VehicleStatus

A jármű állapota.

Values: `INCOMING_AT`, `STOPPED_AT`, `IN_TRANSIT_TO`


### VehiclesForLocationMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### VehiclesForRouteMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### VehiclesForStopMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### VehiclesMethodResponse

- `code` — integer (int32) **required**. A válasz státusz kódja.
- `currentTime` — integer (int64) **required**. Az aktuális szerveridő ezredmásodpercben.
- `data` — [TransitListEntryWithReferencesTransitVehicle](#transitlistentrywithreferencestransitvehicle) **required**.
- `status` — [Status](#status) **required**.
- `text` — string **required**. A válasz szövege.
- `version` — integer (int32) **required**. A válasz API verziója.

### WaitTime

A várakozási idő mennyiségi típusa a lábon.

Values: `short`, `long`


### WalkDisplayedLeg

Extends [DisplayedLeg](#displayedleg).


### WalkProfile

Values: `SLOW`, `MID`, `FAST`


### WalkStep

Az útvonal lépései gyalogos, kerékpáros vagy autós láb lesetén.

- `absoluteDirection` — [AbsoluteDirection](#absolutedirection).
- `area` — boolean **required**. Jelzi, hogy a lépés egy nyílt terület, pl.: pláza, vagy vonat peron.
- `bicycleCategory` — [BikeStreetCategory](#bikestreetcategory).
- `bicycleStreetDirection` — [BicycleStreetDirection](#bicyclestreetdirection).
- `bogusName` — boolean **required**. Jelzi, hogy az utca nevét a rendszer generálta.
- `distance` — number (double) **required**. A lépés hossza méterben.
- `geometry` — [EncodedPolylineBean](#encodedpolylinebean) **required**.
- `lat` — number (double) **required**. A lépés kezdetének szélességi koordinátája.
- `lon` — number (double) **required**. A lépés kezdetének hosszúsági koordinátája.
- `relativeDirection` — [RelativeDirection](#relativedirection).
- `stayOn` — boolean **required**. Jelzi, hogy az utca irányt vált egy kereszteződésben.
- `streetName` — string **required**. Az utca neve, amin a lépés halad.
- `walkingBike` — boolean. Jelzi, hogy a szakszon sétálni kell kerékpáros tervezés esetén.

