# Guia Completa d'Instal·lació i Configuració de FOOTDRAFT

Aquesta guia està pensada per a usuaris sense experiència tècnica. Segueix els passos següents per posar en marxa l'aplicació.

---

## 1. Requisits Previs

### 1.1. Node.js i npm  
- **Què és:** Node.js és un entorn d'execució per a JavaScript al servidor, i npm és el gestor de paquets.  
- **Versió recomanada:** Utilitza la versió LTS (Long Term Support).  
- **Descàrrega:** [https://nodejs.org/](https://nodejs.org/)  
- **Instal·lació:** Descarrega l'instal·lador corresponent al teu sistema operatiu i segueix les instruccions.

### 1.2. Angular CLI  
- **Què és:** Angular CLI és una eina de línia de comandes per crear i gestionar projectes Angular.  
- **Instal·lació:** Obre una terminal i executa:
  ```bash
  npm install -g @angular/cli
  ```
- **Més informació:** [https://angular.io/cli](https://angular.io/cli)

### 1.3. Microsoft SQL Server  
- **Què és:** És el sistema de gestió de bases de dades (DBMS) que utilitzaràs per emmagatzemar les dades de l'aplicació.  
- **Port per defecte:** Microsoft SQL Server utilitza per defecte el port **1433**.  
  - Si utilitzes aquest port, no cal que canviïs res; però si per alguna raó vols utilitzar-ne un altre, hauràs de configurar-ho a la teva instància i actualitzar la configuració del projecte (fitxer `.env` o la configuració dins del backend).
- **Descàrrega:** Pots descarregar la versió Express (gratuïta) des de [https://www.microsoft.com/en-us/sql-server/sql-server-downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Eina de gestió:** També és recomanable instal·lar SQL Server Management Studio (SSMS) per gestionar la base de dades: [https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

### 1.4. Git  
- **Què és:** Git és un sistema de control de versions.  
- **Com accedir-hi:** [https://github.com/)  
- **Procediment:** Has d'accedir a la pàgina web de GitHUB, i clonar el respoistori FOOTDRAFT, en el teu ordinador local.

---

## 2. Configuració de la Base de Dades

### 2.1. Crear la Base de Dades
1. **Obrir SSMS:** Inicia SQL Server Management Studio (SSMS) i connecta’t a la teva instància de SQL Server (normalment, localhost, port 1433).
2. **Crear Base de Dades:**  
   - Fes clic dret a "Databases" i selecciona "New Database...".
   - Dona-li un nom (per exemple, `FOOTDRAFT_DB`) i confirma.

### 2.2. Executar el Script SQL  
- El projecte hauria de venir amb un script d'inicialització (ex. `init.sql`) que crea les taules necessàries:  
  - **Taules recomanades:** `Users`, `Players`, `Teams`, `Tournaments`, `Matches`, `MatchEvents`, etc.
- **Execució:** Obre el fitxer `init.sql` a SSMS i executa'l per crear totes les taules i relacions necessàries.

### 2.3. Configurar Variables d'Entorn (Backend)
Crea un fitxer anomenat `.env` al directori del backend amb el contingut següent (assegura't d'ajustar els valors segons la teva configuració):

```env
PORT=3000
DB_SERVER=localhost
DB_DATABASE=FOOTDRAFT_DB
DB_USER=el_teu_usuari
DB_PASSWORD=la_teva_contrasenya
JWT_SECRET=la_teva_clau_secreta
```

- **Nota:** Si fas servir Microsoft SQL Server al port per defecte, no necessites canviar el port. Si vols utilitzar-ne un altre, configura-ho en aquest fitxer i a la teva instància de SQL Server.

---

## 3. Instal·lació del Codi

### 3.1. Clonar el Repositori
1. **Obrir una terminal** i clona el repositori (o descarrega’l):
   ```bash
   git clone https://github.com/el-teu-usuari/footdraft.git
   cd footdraft
   ```
   - **Nota:** Substitueix l'URL pel repositori correcte si és necessari.

### 3.2. Instal·lar Dependències del Backend
1. Navega al directori del backend (si el projecte està dividit en carpetes, ex. `backend`):
   ```bash
   cd backend
   ```
2. Instal·la les dependències:
   ```bash
   npm install
   ```

### 3.3. Instal·lar Dependències del Frontend (Angular)
1. Navega al directori del frontend (ex. `frontend`):
   ```bash
   cd ../frontend
   ```
2. Instal·la les dependències:
   ```bash
   npm install
   ```

---

## 4. Posar en Marxa l'Aplicació

### 4.1. Executar el Backend
1. Assegura’t que la base de dades està en marxa i configurada.
2. Dins del directori del backend, executa:
   ```bash
   npm run start
   ```
   - Això iniciarà el servidor Express a la porta definida (per defecte, 3000).

### 4.2. Executar el Frontend (Angular)
1. Navega al directori del frontend.
2. Executa:
   ```bash
   ng serve
   ```
   - Aquesta ordre compilarà l'aplicació Angular i la posarà en marxa en mode desenvolupament.
   - Obre el navegador a [http://localhost:4200](http://localhost:4200).

---

## 5. Revisió i Ajustaments Finals

### 5.1. Endpoints i Variables d'Entorn
- Verifica que els endpoints utilitzats pels serveis Angular coincideixen amb els definits al backend (per exemple, `http://localhost:3000/api/v1/...`).
- Revisa el fitxer `.env` per assegurar que totes les variables d'entorn estan configurades correctament.

### 5.2. Tokens i Autenticació
- Quan inicies sessió, el backend genera un token JWT que s'emmagatzema al `localStorage`.  
- Els serveis Angular haurien d'afegir l'header d'autorització amb aquest token en cada petició.

### 5.3. Documentació Addicional
- Si algun component o dependència no està instal·lat, visita els seus llocs web oficials:
  - **Node.js:** [https://nodejs.org/](https://nodejs.org/)
  - **Angular CLI:** [https://angular.io/cli](https://angular.io/cli)
  - **Microsoft SQL Server:** [https://www.microsoft.com/en-us/sql-server/sql-server-downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
  - **Git:** [https://git-scm.com/](https://git-scm.com/)

### 5.4. Desplegament en Producció
- Quan estiguis llest per desplegar l'aplicació en un entorn de producció, recorda compilar Angular en mode producció:
  ```bash
  ng build --prod
  ```
- També és recomanable revisar la configuració del servidor i ajustar les variables d'entorn segons les necessitats del teu entorn de producció.

---

## Resum del Port per a SQL Server

Si utilitzes Microsoft SQL Server, el port per defecte és el **1433**. Aquest és el port que s'ha de configurar a la teva instància SQL i que hauràs d'utilitzar en la connexió (ex. en el fitxer de configuració o a l'entorn).

---

Amb aquesta guia detallada, qualsevol usuari, encara que no tingui experiència tècnica, podrà instal·lar, configurar i posar en marxa l'aplicació FOOTDRAFT en qualsevol ordinador. Si tens alguna pregunta addicional o necessites més informació sobre algun pas, no dubtis a consultar la documentació oficial als enllaços proporcionats o contactar amb l'equip de suport.
