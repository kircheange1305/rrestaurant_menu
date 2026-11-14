CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);


CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(8, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL
);


CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


-- heslo administrátora je tajneheslo123, použito 10 solících kol
INSERT INTO admins (email, password_hash)
VALUES ('admin@restaurace.cz', '$2b$10$mS0Pxg05wLjrxNmPiK3jXefjis32suRB69D/rAMvyu9aWaqw8A.6a');


INSERT INTO categories (name) VALUES
    ('Předkrmy'),
    ('Polévky'),
    ('Hlavní jídla'),
    ('Těstoviny a rizota'),
    ('Dezerty');


INSERT INTO menu_items (name, description, price, category_id) VALUES
    ('Bruschetta',            'Opečený chléb s rajčaty, česnekem a bazalkou',         89.00,  1),
    ('Carpaccio z hovězího',  'Tenké plátky hovězího masa s rukolou a parmazánem',   145.00,  1),
    ('Krevety na česneku',    'Restované krevety s česnekem, chilli a citronem',      175.00,  1),
    ('Sýrový talíř',          'Výběr zrajících sýrů s hrozny a ořechy',              165.00,  1),


    ('Hovězí vývar',          'Domácí vývar s nudlemi a zeleninou',                   75.00,  2),
    ('Francouzská cibulačka', 'Zapečená cibulová polévka s krutony a gruyèrem',       95.00,  2),
    ('Gulášová polévka',      'Hustá gulášová polévka s chlebem',                     85.00,  2),


    ('Svíčková na smetaně',   'Tradiční svíčková s houskovým knedlíkem a brusinkami',245.00,  3),
    ('Kuřecí steak',          'Grilované kuřecí prso s bylinkovým máslem a hranolky', 210.00,  3),
    ('Vepřová panenka',       'Pečená vepřová panenka s bramborovým pyré a omáčkou', 255.00,  3),
    ('Losos na grilu',        'Grilovaný losos s citronovou omáčkou a zeleninou',     285.00,  3),
    ('Hovězí burger',         'Domácí burger s čedarem, salátem a hranolky',          225.00,  3),
    ('Vegetariánský řízek',   'Smažený sýrový řízek s bramborovým salátem',          185.00,  3),


    ('Spaghetti Carbonara',   'Spaghetti se slaninou, vejcem a parmazánem',           195.00,  4),
    ('Penne Arrabbiata',      'Penne v pikantní rajčatové omáčce s česnekem',         175.00,  4),
    ('Tagliatelle s lososem', 'Tagliatelle v smetanové omáčce s uzeným lososem',     225.00,  4),
    ('Houbové rizoto',        'Krémové rizoto s lesními houbami a parmazánem',        210.00,  4),


    ('Tiramisu',              'Italský dezert s mascarpone a espressem',              120.00,  5),
    ('Cheesecake',            'New York cheesecake s lesním ovocem',                  115.00,  5),
    ('Čokoládová panna cotta','Panna cotta s hořkou čokoládou a malinami',           110.00,  5);