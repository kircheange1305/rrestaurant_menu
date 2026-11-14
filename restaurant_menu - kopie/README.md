# Jídelní lístek restaurace

Závěrečný projekt kurzu ENGETO Web Developer. Aplikace je vytvořená pomocí Express.js, PostgreSQL a EJS. Návštěvníci si mohou prohlížet kategorie a jídla v responzivním menu. Správce se může přihlásit a přidávat, upravovat nebo mazat jídla.

## Příprava databáze

1. V PostgreSQL vytvořte prázdnou databázi `menuapp`.
2. V DBeaveru otevřete `seed.sql` v SQL editoru připojeném k databázi `menuapp`.
3. Spusťte celý soubor pomocí **SQL Editor → Execute SQL Script**. Skript vytvoří tři tabulky a vloží pět kategorií, dvacet jídel a ukázkový účet správce.

## Spuštění aplikace

1. Otevřete terminál ve složce projektu a spusťte `npm install`.
2. Vedle souboru `app.js` vytvořte soubor `.env` s následujícím nastavením.

   ```dotenv
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=menuapp
   PGUSER=postgres
   PGPASSWORD="vase_heslo_do_postgresql"
   SESSION_SECRET=vygenerovana_hodnota
   ```

   Doplňte své uživatelské jméno a heslo k PostgreSQL. Hodnotu pro `SESSION_SECRET` vygenerujte tímto příkazem a vložte ji do `.env`.

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Spusťte `npm start` a v prohlížeči otevřete [localhost:3000](http://localhost:3000).

## Ukázkový účet správce

Na stránce s menu klikněte na **Přihlášení správce**. Použijte e-mail `admin@restaurace.cz` a ukázkové heslo uvedené v komentáři nad příkazem `INSERT INTO admins` v souboru `seed.sql`.