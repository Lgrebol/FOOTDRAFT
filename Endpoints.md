# Documentació dels Endpoints del Backend de FOOTDRAFT

> **Nota:** Tots els endpoints són protegits (excepte potser alguns de registre i login) i requereixen que s’inclogui l’header d’autorització amb un token JWT, per exemple:  
> `Authorization: Bearer <token>`

---

## 1. **Usuaris (Users)**

### 1.1. Registrar Usuari  
- **Mètode:** POST  
- **Ruta:** `/api/v1/users/register`  
- **Headers:**  
  - `Content-Type: application/json`  
- **Cos (Body):**  
  ```json
  {
    "name": "NomUsuari",
    "email": "usuari@example.com",
    "password": "ContrasenyaSegura123!"
  }
  ```  
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "message": "User registered successfully"
  }
  ```

---

### 1.2. Iniciar Sessió (Login)  
- **Mètode:** POST  
- **Ruta:** `/api/v1/users/login`  
- **Headers:**  
  - `Content-Type: application/json`  
- **Cos (Body):**  
  ```json
  {
    "email": "usuari@example.com",
    "password": "ContrasenyaSegura123!"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
    "footcoins": 100000
  }
  ```

---

### 1.3. Obtenir Llista d'Usuaris  
- **Mètode:** GET  
- **Ruta:** `/api/v1/users`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    {
      "UserUUID": "123e4567-e89b-12d3-a456-426614174000",
      "username": "usuari",
      "Email": "usuari@example.com",
      "Footcoins": 100000
    },
    { ... }
  ]
  ```

---

## 2. **Autenticació (Auth)**

### 2.1. Obtenir Usuari Actual  
- **Mètode:** GET  
- **Ruta:** `/api/v1/auth/current-user`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "userUUID": "123e4567-e89b-12d3-a456-426614174000",
    "name": "NomUsuari",
    "email": "usuari@example.com",
    "footcoins": 100000
  }
  ```

---

## 3. **Jugadors (Players)**

> **Nota:** Per a operacions de creació i actualització, s’utilitza `multipart/form-data` perquè inclou fitxers (imatges).

### 3.1. Obtenir Jugadors  
- **Mètode:** GET  
- **Ruta:** `/api/v1/players`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    {
      "PlayerUUID": "11111111-1111-4111-8111-111111111111",
      "PlayerName": "Messi",
      "Position": "Forward",
      "TeamUUID": "team-uuid-1",
      "IsActive": true,
      "IsForSale": false,
      "Price": 100,
      "Height": 170,
      "Speed": 80,
      "Shooting": 90,
      "PlayerImage": "base64ImageData...",
      "Points": 0,
      "TeamName": "FC Barcelona"
    },
    { ... }
  ]
  ```

---

### 3.2. Crear Jugador  
- **Mètode:** POST  
- **Ruta:** `/api/v1/players`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - El client gestionarà el `Content-Type` com a `multipart/form-data`.  
- **Body (Form-data):**  
  - `playerName`: "Nou Jugador"  
  - `position`: "Forward"  
  - `teamID`: "UUID_de_l'equip"  
  - `isActive`: "1"  
  - `isForSale`: "0"  
  - `price`: "50"  
  - `height`: "180"  
  - `speed`: "85"  
  - `shooting`: "90"  
  - `image`: (fitxer d'imatge)
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "PlayerUUID": "22222222-2222-4222-9222-222222222222",
    "PlayerName": "Nou Jugador",
    "Position": "Forward",
    "TeamUUID": "UUID_de_l'equip",
    "IsActive": true,
    "IsForSale": false,
    "Price": 50,
    "Height": 180,
    "Speed": 85,
    "Shooting": 90,
    "PlayerImage": "base64ImageData...",
    "Points": 0,
    "TeamName": "NomEquip"
  }
  ```

---

### 3.3. Editar Jugador  
- **Mètode:** PUT  
- **Ruta:** `/api/v1/players/{playerId}`  
  - Substitueix `{playerId}` amb l'UUID del jugador.  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - Utilitza `multipart/form-data` si s’actualitza la imatge.  
- **Body (Form-data):**  
  - Per exemple:
    - `playerName`: "Jugador Actualitzat"
    - `position`: "Midfielder"
    - `teamID`: "UUID_de_l'equip"
    - `isActive`: "1"
    - `isForSale`: "0"
    - `price`: "55"
    - `height`: "178"
    - `speed`: "88"
    - `shooting`: "85"
    - (Opcional) `image`: (nou fitxer d'imatge)
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "PlayerUUID": "22222222-2222-4222-9222-222222222222",
    "PlayerName": "Jugador Actualitzat",
    "Position": "Midfielder",
    "TeamUUID": "UUID_de_l'equip",
    "IsActive": true,
    "IsForSale": false,
    "Price": 55,
    "Height": 178,
    "Speed": 88,
    "Shooting": 85,
    "PlayerImage": "novaBase64ImageData...",
    "Points": 0,
    "TeamName": "NomEquip"
  }
  ```

---

### 3.4. Eliminar Jugador  
- **Mètode:** DELETE  
- **Ruta:** `/api/v1/players/{playerId}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Jugador eliminat correctament."
  }
  ```

---

### 3.5. Jugadors Disponibles a la Tenda (Players For Sale)  
- **Mètode:** GET  
- **Ruta:** `/api/v1/players/store`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    { /* jugador 1 */ },
    { /* jugador 2 */ }
  ]
  ```

---

### 3.6. Comprar Jugador  
- **Mètode:** POST  
- **Ruta:** `/api/v1/players/buy/{playerId}`  
  - Substitueix `{playerId}` amb l'UUID del jugador que vols comprar.  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "userID": "UUID_dell'usuari"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Jugador comprat correctament!"
  }
  ```

---

## 4. **Equips (Teams)**

### 4.1. Crear Equip  
- **Mètode:** POST  
- **Ruta:** `/api/v1/teams`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "teamName": "Nom Equip",
    "shirtColor": "Color",
    "userID": "UUID_de_l'usuari"
  }
  ```  
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "TeamUUID": "uuid-equips",
    "TeamName": "Nom Equip",
    "ShirtColor": "Color",
    "UserUUID": "UUID_de_l'usuari",
    "UserName": "NomUsuari"
  }
  ```

---

### 4.2. Obtenir Equips  
- **Mètode:** GET  
- **Ruta:** `/api/v1/teams`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    {
      "TeamUUID": "uuid1",
      "TeamName": "Equip A",
      "ShirtColor": "blue",
      "UserUUID": "user-uuid-1",
      "UserName": "NomUsuari"
    },
    { ... }
  ]
  ```

---

### 4.3. Eliminar Equip  
- **Mètode:** DELETE  
- **Ruta:** `/api/v1/teams/{teamId}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Equip eliminat correctament."
  }
  ```

---

### 4.4. Assignar Jugador Reservat a Equip  
- **Mètode:** POST  
- **Ruta:** `/api/v1/teams/{teamId}/add-player-from-reserve`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "playerId": "UUID_del_jugador",
    "userID": "UUID_de_l'usuari"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Jugador traspassat a l'equip correctament."
  }
  ```

---

## 5. **Tornejos (Tournaments)**

### 5.1. Crear Torneig  
- **Mètode:** POST  
- **Ruta:** `/api/v1/tournaments`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "tournamentName": "Nou Torneig",
    "tournamentType": "Knockout",
    "startDate": "2024-08-01",
    "endDate": "2024-08-10"
  }
  ```  
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "TournamentUUID": "uuid-torneig",
    "TournamentName": "Nou Torneig",
    "TournamentType": "Knockout",
    "StartDate": "2024-08-01",
    "EndDate": "2024-08-10"
  }
  ```

---

### 5.2. Obtenir Tornejos  
- **Mètode:** GET  
- **Ruta:** `/api/v1/tournaments`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    {
      "TournamentUUID": "uuid-torneig",
      "TournamentName": "Nou Torneig",
      "TournamentType": "Knockout",
      "StartDate": "2024-08-01",
      "EndDate": "2024-08-10"
    },
    { ... }
  ]
  ```

---

### 5.3. Obtenir Torneig per ID  
- **Mètode:** GET  
- **Ruta:** `/api/v1/tournaments/{id}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "TournamentUUID": "uuid-torneig",
    "TournamentName": "Nou Torneig",
    "TournamentType": "Knockout",
    "StartDate": "2024-08-01",
    "EndDate": "2024-08-10"
  }
  ```

---

### 5.4. Eliminar Torneig  
- **Mètode:** DELETE  
- **Ruta:** `/api/v1/tournaments/{id}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Torneig eliminat correctament."
  }
  ```  
> **Nota:** En eliminar tornejos, es pot produir un error si hi ha partits relacionats. Algunes implementacions permeten forçar l'eliminació o gestionar la referència (per exemple, eliminant els partits associats).

---

### 5.5. Registrar Equip a un Torneig  
- **Mètode:** POST  
- **Ruta:** `/api/v1/tournaments/register`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "teamId": "UUID_de_l'equip",
    "tournamentId": "UUID_del_torneig"
  }
  ```  
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "message": "Equip inscrit al torneig correctament."
  }
  ```

---

## 6. **Partits (Matches)**

### 6.1. Crear Partit  
- **Mètode:** POST  
- **Ruta:** `/api/v1/matches`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "tournamentUUID": "UUID_del_torneig",
    "homeTeamUUID": "UUID_equip_local",
    "awayTeamUUID": "UUID_equip_visitant",
    "matchDate": "2024-09-01T15:00:00Z"
  }
  ```  
- **Exemple de resposta (codi 201):**  
  ```json
  {
    "matchID": "uuid-partit"
  }
  ```

---

### 6.2. Obtenir Detalls del Partit  
- **Mètode:** GET  
- **Ruta:** `/api/v1/matches/{matchID}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "match": {
      "MatchUUID": "uuid-partit",
      "TournamentUUID": "UUID_del_torneig",
      "HomeTeamUUID": "UUID_equip_local",
      "AwayTeamUUID": "UUID_equip_visitant",
      "HomeGoals": 2,
      "AwayGoals": 1,
      "CurrentMinute": 60,
      "MatchDate": "2024-09-01T15:00:00Z",
      "events": [
        {
          "minute": 15,
          "eventType": "Goal",
          "description": "Jugador X ha marcat un gol.",
          "team": "home"
        }
      ]
    }
  }
  ```

---

### 6.3. Simular Partit  
- **Mètode:** POST  
- **Ruta:** `/api/v1/matches/simulate`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "matchID": "uuid-partit"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "homeGoals": 3,
    "awayGoals": 2,
    "totalGoals": 5,
    "homeFouls": 4,
    "awayFouls": 3,
    "totalFouls": 7,
    "homeRedCards": 0,
    "awayRedCards": 1,
    "totalRedCards": 1,
    "extraMinutes": 2,
    "finalMinute": 92,
    "events": [ /* llista d'esdeveniments generats */ ],
    "currentMinute": 92,
    "matchEnded": true,
    "message": "El partit ha finalitzat. Mostrant estadístiques finals."
  }
  ```

---

### 6.4. Reset de Partit  
- **Mètode:** POST  
- **Ruta:** `/api/v1/matches/reset`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "matchID": "uuid-partit"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Dades del partit reiniciades correctament."
  }
  ```

---

## 7. **Apostes (Bets)**

### 7.1. Col·locar Aposta  
- **Mètode:** POST  
- **Ruta:** `/api/v1/bets`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
  - `Content-Type: application/json`
- **Cos (Body):**  
  ```json
  {
    "matchUUID": "uuid-partit",
    "homeTeamUUID": "UUID_equip_local",
    "awayTeamUUID": "UUID_equip_visitant",
    "amount": 50,
    "predictedWinner": "home"
  }
  ```  
- **Exemple de resposta (codi 200):**  
  ```json
  {
    "message": "Aposta realitzada amb èxit"
  }
  ```

---

## 8. **Reserves (Reserved Players)**

### 8.1. Obtenir Jugadors Reservats  
- **Mètode:** GET  
- **Ruta:** `/api/v1/reserve/{userId}`  
- **Headers:**  
  - `Authorization: Bearer <token>`  
- **Exemple de resposta (codi 200):**  
  ```json
  [
    {
      "PlayerUUID": "uuid-player",
      "PlayerName": "Jugador Reservat",
      "Position": "Defender",
      "TeamUUID": "uuid-equip",
      "IsActive": true,
      "IsForSale": true,
      "Price": 100,
      "Height": 180,
      "Speed": 80,
      "Shooting": 75,
      "PlayerImage": "base64ImageData...",
      "Points": 0,
      "TeamName": "NomEquip"
    }
  ]
  ```

---

# Resum Final

Aquest document recull tots els endpoints clau del backend de FOOTDRAFT, incloent-hi:
- **Gestió d'Usuaris:** registre, login, obtenir usuaris.
- **Autenticació:** obtenir l'usuari actual.
- **Gestió de Jugadors:** crear, editar, eliminar, obtenir jugadors i comprar jugadors.
- **Gestió d'Equips:** crear, obtenir, eliminar equips i assignar jugadors reservats.
- **Gestió de Tornejos:** crear, obtenir, obtenir per ID, eliminar i inscriure equips en tornejos.
- **Gestió de Partits:** crear, obtenir, simular i reset de partits.
- **Gestió d'Apostes:** col·locar apostes.
- **Reserves:** obtenir la llista de jugadors reservats per un usuari.

Amb aquesta documentació, pots provar cada operació amb Postman, configurant les peticions tal com s'ha descrit. Així, podràs verificar el correcte funcionament del backend de FOOTDRAFT i explicar-ho als teus usuaris o professors.

Si necessites més informació o ajustar algun detall, no dubtis a demanar-ho.
